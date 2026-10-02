/**
 * `llms.txt` · `docs/components/*.md` 생성기(계획 §2.5-a·c, #31) — 같은 매니페스트에서 사람·LLM 이 읽는 문서를 낸다.
 *
 * 둘 다 **커밋하는 생성물**이다(dist 의 manifest 와 달리 저장소에서 바로 읽혀야 하고, 소비 레포의 에이전트가 `llms.txt` 부터 연다).
 * `--check` 는 쓰지 않고 «커밋된 문서가 매니페스트와 같은가» 만 본다 — tokens:check 와 같은 모양으로 CI unit job 과 verify 가 돈다.
 * llms.txt 는 llmstxt.org 형식(H1 · 인용 요약 · H2 절 · 링크 목록)이고 «shadcn 과 다른 점» 은 저장소 `docs/design-tokens.md` 를 그대로 싣는다 —
 * 그 문서가 정본이고 여기서는 복사만 한다(두 곳에 적으면 하나가 뒤처진다).
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { repoSlug } from "../src/agent/cli.ts";
import {
  buildManifest,
  IMPORT_PATH,
  PKG_DIR,
  type Manifest,
  type ManifestComponent,
  type ManifestProp,
} from "./build-manifest.ts";

/** 저장소 루트의 «shadcn 과 다른 점» 정본. */
export const DIFFERENCES_DOC = join(PKG_DIR, "..", "..", "docs", "design-tokens.md");
const COMPONENT_DOCS_DIR = "docs/components";

/** 없는 컴포넌트를 요청하는 이슈 양식(#96) — 저장소는 package.json `repository.url` 한 곳에서 읽는다(에이전트 블록 · 스킬의 `{{repo}}` 와 같은 값). */
const REQUEST_URL = `https://github.com/${repoSlug(
  (JSON.parse(readFileSync(join(PKG_DIR, "package.json"), "utf8")) as { repository?: { url?: string } })
    .repository?.url,
)}/issues/new?template=component-request.yml`;

const cell = (text: string): string => text.replace(/\|/g, "\\|").replace(/\n+/g, " ").trim();
const code = (text: string): string => (text ? `\`${text.replace(/`/g, "")}\`` : "");

/** design-tokens.md 에서 머리 단락(저장소 안내·상대 링크)을 떼고 절만 — 패키지 안에서는 그 링크가 죽는다. */
export function differencesSection(source: string): string {
  const start = source.indexOf("## 같은 것");
  const body = start === -1 ? source : source.slice(start);
  return body
    .replace(/\[`([^`]+)`\]\([^)]+\)/g, "`$1`")
    .replace(/^## /gm, "### ")
    .trim();
}

function propsTable(props: readonly ManifestProp[]): string {
  if (props.length === 0) return "_(DS 가 더하는 prop 없음 — 물려받는 속성만)_\n";
  const rows = props.map((p) => {
    const values = p.values.length
      ? " " + p.values.map((v) => `${code(v.value)}${v.doc ? ` — ${cell(v.doc)}` : ""}`).join(" · ")
      : "";
    const description = p.values.length && p.description ? "" : cell(p.description);
    return `| ${code(p.name)} | ${cell(code(p.type))} | ${p.required ? "예" : ""} | ${cell(code(p.default))} | ${description}${values ? `${description ? " " : ""}값:${values}` : ""} |`;
  });
  return ["| prop | 타입 | 필수 | 기본값 | 설명 · 값 |", "|---|---|---|---|---|", ...rows].join("\n") + "\n";
}

function componentSection(c: ManifestComponent, level: number): string {
  const h = "#".repeat(level);
  const lines: string[] = [`${h} ${c.name}`, ""];
  const meta = [
    c.kind === "hook"
      ? "훅"
      : c.client
        ? '클라이언트 컴포넌트(`"use client"` — 서버 컴포넌트에서 렌더할 수 없다)'
        : "서버에서도 렌더 가능(지시문 없음)",
    `원본 \`${c.source}\``,
  ];
  lines.push(meta.join(" · "), "");
  if (c.deprecated) lines.push(`> **@deprecated** ${c.deprecated}`, "");
  if (c.description) lines.push(c.description, "");
  if (c.example) lines.push("```tsx", c.example, "```", "");
  if (c.inherits.length) lines.push(`물려받는 props: ${c.inherits.map(code).join(", ")}`, "");
  lines.push(propsTable(c.props));
  return lines.join("\n");
}

/** 루트 하나의 문서 — 부품은 같은 파일의 하위 절이다. */
export function renderComponentDoc(root: ManifestComponent, parts: readonly ManifestComponent[]): string {
  const names = [root.name, ...parts.map((p) => p.name)];
  const lines = [
    `# ${root.name}`,
    "",
    `\`import { ${names.join(", ")} } from "${IMPORT_PATH}"\``,
    "",
    "_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다; 설명은 소스의 JSDoc 을 고친다._",
    "",
    componentSection(root, 2),
  ];
  if (parts.length) {
    lines.push(
      "## 부품",
      "",
      `\`data-slot\` 로 자기 이름을 DOM 에 남기는 평탄 이름의 부품이다 — 부품 먼저, 래퍼는 설탕.`,
      "",
    );
    for (const part of parts) lines.push(componentSection(part, 3));
  }
  return (
    lines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd() + "\n"
  );
}

const list = (items: readonly string[]): string => items.map(code).join(" ");

/** llms.txt 본문. */
export function renderLlmsTxt(manifest: Manifest, differences: string): string {
  const byName = new Map(manifest.components.map((c) => [c.name, c] as const));
  const roots = manifest.components.filter((c) => c.kind === "component");
  const hooks = manifest.components.filter((c) => c.kind === "hook");
  const variants = manifest.utilities.filter((u) => u.kind === "variants");
  const others = manifest.utilities.filter((u) => u.kind !== "variants");
  const t = manifest.tokens;
  const describe = (c: ManifestComponent): string => {
    const bits = [c.description.split(/\n|\. /)[0]?.trim() || "(설명 없음 — JSDoc 대기)"];
    if (c.parts.length) bits.push(`부품: ${c.parts.join(", ")}`);
    if (c.client) bits.push('"use client"');
    if (c.deprecated) bits.push(`@deprecated ${c.deprecated}`);
    return bits.join(" — ");
  };
  const lines: string[] = [
    `# jhlee design system`,
    ``,
    `> \`${manifest.package.name}\` — Radix + Tailwind v4 디자인 시스템. 크롬(UI) 어휘는 shadcn 이름, 도면 캔버스는 \`canvas-*\`, 크롬 모서리는 일반 border-radius 원호 사다리. 이 파일은 \`components.manifest.json\` 에서 생성된다(\`scripts/build-docs.ts\`) — 손으로 고치지 않는다.`,
    ``,
    `정본 순서: 이 파일 → \`dist/components.manifest.json\`(prop·값·기본값·client 의 기계 판독 정본, \`jq '.components[]|select(.name=="Button")'\`) → \`docs/components/*.md\` → \`dist/**/*.d.ts\`.`,
    `매니페스트에 없는 컴포넌트·부품·prop 은 **지어내지 않는다** — «DS 확장 필요» 로 보고하고, 사용자 동의를 받아 [요청 이슈](${REQUEST_URL})를 연다.`,
    ``,
    `## 사용 규칙`,
    ``,
    `- CSS 진입(소비자 계약) — \`@source "./"\` 자기 등록이라 소비자 \`@source\` 는 자기 소스만:`,
    `  \`\`\`css`,
    `  @import "tailwindcss/theme.css" layer(theme);`,
    `  @import "${IMPORT_PATH}/theme.css";`,
    `  @import "tailwindcss/utilities.css" source(none);`,
    `  @source "./";`,
    `  \`\`\``,
    `- import 는 루트 배럴 하나: \`import { Button, Card } from "${IMPORT_PATH}"\`. 3열 작업대 셸(\`./legacy\` · \`shell.css\`)은 3.0.0 에서 지웠다 — 폼은 \`Field\` · \`Select\` · \`Tabs\` 부품으로 조립한다.`,
    `- **className 은 토큰 유틸만.** 색은 shadcn 이름(\`bg-card\` \`text-muted-foreground\` \`border-border\` \`bg-primary\` \`bg-destructive-soft\` …), 그 밖은 역할 이름(\`text-body\` \`rounded-md\` \`shadow-pop\` \`h-ctl\` \`z-popover\` \`duration-fast\`). Tailwind 기본 사다리(\`text-sm\` \`bg-gray-100\` \`rounded\` \`shadow-md\`)는 \`initial\` 로 지워져 **CSS 없이 조용히 무시된다** — 린트 프리셋이 잡는다. hex·\`[12px]\`·\`style={{ color }}\` 금지.`,
    `- 간격은 4px 스텝 화이트리스트 \`${t.spacingSteps.join(" ")}\`(px = 4 × step) — 간격 계열(p/m/gap/space/inset)에만. 반스텝(\`gap-1.5\`)·7·9·11·임의 px 는 린트가 막는다.`,
    `- **부품 먼저, 래퍼는 설탕.** 부품은 평탄 이름(\`ModalContent\`, \`DropdownMenuItem\`)이고 \`data-slot\` 으로 자기 이름을 DOM 에 남긴다. \`Modal.Content\` 같은 정적 속성 컴파운드는 없다.`,
    `- **클라이언트 경계(Next App Router).** 아래 색인의 \`"use client"\` 표시 컴포넌트는 서버 컴포넌트 트리에서 import 만 하고 렌더는 클라이언트 파일에서 한다. 서버에서 className 만 필요하면 \`*Variants\`(지시문 없음)를 호출한다: \`buttonVariants({ variant: "solid" })\`.`,
    `- \`tone\` 은 한 어휘다: \`neutral | primary | success | warning | destructive | info\`. 옛 키(\`accent\` \`ok\` \`warn\` \`danger\`)·옛 유틸 이름(\`text-ink\` \`bg-surface\` \`rounded-control\`)·옛 CSS 변수는 3.0.0 에서 지웠다 — \`eslint --fix\`(프리셋)와 코드모드가 새 이름으로 바꾼다.`,
    `- 유채색은 판정에만(\`success\`·\`warning\`·\`destructive\`·\`info\`), \`primary\` 는 «지금 고른 것·주된 동작». 상태는 항상 텍스트와 병기한다. 수치는 \`font-mono tabular-nums\`(\`.num\`).`,
    `- 다크는 크롬에만(\`html[data-theme="dark"]\`) — 캔버스(\`canvas-*\`)는 흰 바탕·radius 0·무채색으로 불변이다. 새 컴포넌트마다 «캔버스인가 크롬인가» 를 먼저 묻는다.`,
    `- **없으면 요청한다.** 필요한 컴포넌트 · 부품 · 변형이 없으면 소비 레포에서 따로 짓기 전에 [컴포넌트 요청 양식](${REQUEST_URL})(라벨 \`component-request\`)으로 이슈를 연다 — **원하는 모양의 이미지(스크린샷 · 시안 · 손그림)를 첨부한다**. \`gh issue create\` 는 이미지를 올리지 못하므로 이미지는 웹 양식에서 끌어다 놓는다. 기다리는 동안의 임시 구현은 DS 부품 · 토큰 유틸만으로 짓고 이슈 번호를 단 TODO 를 남긴다.`,
    `- 검증: 소비 레포 \`eslint.config.js\` 에 \`jhleeDesignSystem({ entryPoint })\`(\`${IMPORT_PATH}/eslint\`)를 펼치고 \`eslint\` + \`tsc --noEmit\` 위반 0. 에이전트 절차는 \`npx jds-agent sync\` 가 심는 \`.claude/skills/jhlee-ds/SKILL.md\`(Analyze → Compose → Audit).`,
    ``,
    `## shadcn 과 다른 점`,
    ``,
    differences,
    ``,
    `## 컴포넌트`,
    ``,
    ...roots.map((c) => `- [${c.name}](${COMPONENT_DOCS_DIR}/${c.name}.md): ${describe(c)}`),
    ``,
    `## 훅`,
    ``,
    ...hooks.map((c) => `- [${c.name}](${COMPONENT_DOCS_DIR}/${c.name}.md): ${describe(c)}`),
    ``,
    `## 유틸리티`,
    ``,
    ...variants.map((u) => {
      const axes = Object.entries(u.axes ?? {})
        .map(([axis, values]) => `${axis}(${values.join(" | ")})`)
        .join(" · ");
      const defaults = Object.entries(u.defaults ?? {})
        .map(([k, v]) => `${k}=${v}`)
        .join(", ");
      return `- \`${u.name}\`: cva — 축 ${axes || "없음"}${defaults ? `; 기본 ${defaults}` : ""}. 서버에서 호출 가능.`;
    }),
    ...others.map((u) => `- \`${u.name}\`: ${u.description.split(/\n|\. /)[0]?.trim() || u.kind}`),
    ``,
    `## 토큰 유틸리티 어휘`,
    ``,
    `값은 \`theme.css\`(생성물)에 있고 여기는 이름만이다. 접두는 Tailwind 규칙대로(\`bg-\` \`text-\` \`border-\` \`ring-\` \`fill-\` …).`,
    ``,
    `- 색: ${list(t.colors)}`,
    `- 반경 \`rounded-*\`: ${list(t.radius)} (4 / 6 / 8 / 12 / 16 px 고정 원호 — 역할: \`xs\` 16px 이하 작은 표시(체크박스) · \`sm\` 칩·배지·Kbd · \`md\` 컨트롤·메뉴 항목 · \`lg\` 면(카드·알림·토스트·팝오버·메뉴·툴팁·범례) · \`xl\` 모달·서랍; 원형·pill 은 \`rounded-full\` 로만, 안쪽은 동심원 \`calc(var(--radius-바깥) - 패딩)\`)`,
    `- 글자 \`text-*\`(역할 이름, 크기·행간 포함): ${list(t.text)} — 크기 / 줄 높이 px 가 모두 짝수(micro 10/14 · label 12/16 · body 14/20 · control 14/20 · title 16/24 · readout 22/28 · display 26/32, #82). 줄 높이 유틸(\`leading-snug/normal/relaxed\`)은 쓰지 않는다 — 문단도 글자 토큰의 줄 칸, 한 줄 컨트롤만 \`leading-none\``,
    `- 글자 역할(#80 — 굵기는 \`font-normal\` \`font-medium\` \`font-semibold\` 셋만): 컨트롤 글자 \`text-control font-medium\`(크기 축은 높이만 바꾼다) · 입력 값 \`text-control\` · 목록·메뉴 항목 \`text-body\` · 면 제목 \`text-body font-semibold\` · 대화·화면 제목 \`text-title font-semibold\` · 필드 라벨 \`text-body font-medium\` · 보조 문장 \`text-body\` · 메타·구획 라벨 \`font-mono text-micro font-medium tracking-caps uppercase\``,
    `- 그림자 \`shadow-*\`: ${list(t.shadow)}`,
    `- 컨트롤 높이 \`h-*\`(정사각은 \`w-ctl*\`): ${list(t.height)}`,
    `- 컨테이너 \`max-w-*\` \`min-w-*\`: ${list(t.container)} (+ 유동 \`w-dialog-fluid\` \`h-dialog-fluid\` \`max-h-dialog-fluid\` \`max-w-popover-fluid\`)`,
    `- 층 \`z-*\`: ${list(t.layer)}`,
    `- 시간 \`duration-*\`: ${list(t.duration)}`,
    `- 간격 스텝: ${t.spacingSteps.join(" ")}`,
    `- 치수는 짝수 px(#82) — 예외는 헤어라인 1px(테두리 · 구분선 · \`h-px\` · \`w-px\` · 그림자 속 선 · 포커스 링 간격)과 그 동심원, pill \`rounded-full\`, 홀수여야 광학적으로 맞는 아이콘뿐이다. 임의값을 쓰더라도 홀수 · 소수 px(\`[13px]\` · \`size-3.75\` · \`py-px\` 여백)는 쓰지 않는다`,
    ``,
    `## 더 읽기`,
    ``,
    `- [컴포넌트 문서 색인](${COMPONENT_DOCS_DIR}/README.md)`,
    `- \`dist/components.manifest.json\` — 기계 판독 정본`,
    `- \`agent/AGENTS.block.md\` — 소비 레포 AGENTS.md 에 심는 계약(\`npx jds-agent sync\`)`,
  ];
  void byName;
  return (
    lines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd() + "\n"
  );
}

/** 문서 색인(docs/components/README.md). */
export function renderIndex(manifest: Manifest): string {
  const roots = manifest.components.filter((c) => c.kind !== "compound");
  const rows = roots.map(
    (c) =>
      `| [${c.name}](${c.name}.md) | ${c.kind} | ${c.client ? "client" : "server ok"} | ${c.parts.length ? c.parts.join(", ") : ""} | ${cell(c.description.split(/\n|\. /)[0] ?? "")} |`,
  );
  return [
    "# 컴포넌트 문서",
    "",
    "_생성물 — `scripts/build-docs.ts` 가 `components.manifest.json` 에서 만든다. 손으로 고치지 않는다._",
    "",
    "| 이름 | 종류 | 경계 | 부품 | 설명 |",
    "|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
}

/** 모든 생성 문서 — 패키지 루트 기준 경로 → 본문. */
export function renderDocs(manifest: Manifest, differences: string): Map<string, string> {
  const out = new Map<string, string>();
  out.set("llms.txt", renderLlmsTxt(manifest, differences));
  out.set(`${COMPONENT_DOCS_DIR}/README.md`, renderIndex(manifest));
  const byName = new Map(manifest.components.map((c) => [c.name, c] as const));
  for (const c of manifest.components) {
    if (c.kind === "compound") continue;
    const parts = c.parts
      .map((name) => byName.get(name))
      .filter((p): p is ManifestComponent => p !== undefined);
    out.set(`${COMPONENT_DOCS_DIR}/${c.name}.md`, renderComponentDoc(c, parts));
  }
  return out;
}

function currentDocFiles(): string[] {
  const dir = join(PKG_DIR, COMPONENT_DOCS_DIR);
  const files = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => `${COMPONENT_DOCS_DIR}/${f}`)
    : [];
  return ["llms.txt", ...files];
}

/** 쓰기 또는 검사. 검사는 다른 파일·빠진 파일·남은 파일을 전부 이름으로 말한다. */
export function run(check: boolean): number {
  const differences = differencesSection(readFileSync(DIFFERENCES_DOC, "utf8"));
  const docs = renderDocs(buildManifest(), differences);
  if (check) {
    const stale: string[] = [];
    for (const [path, text] of docs) {
      const full = join(PKG_DIR, path);
      if (!existsSync(full)) stale.push(`${path}: 없다`);
      else if (readFileSync(full, "utf8") !== text) stale.push(`${path}: 다르다`);
    }
    for (const path of currentDocFiles())
      if (!docs.has(path)) stale.push(`${path}: 매니페스트에 없는 문서가 남아 있다`);
    if (stale.length) {
      console.error(
        `manifest: 생성 문서가 매니페스트와 다르다 — pnpm manifest:build 로 다시 만들고 함께 커밋한다\n${stale.map((s) => ` - ${s}`).join("\n")}`,
      );
      return 1;
    }
    console.log(`manifest: 생성 문서 ${docs.size}개가 최신이다`);
    return 0;
  }
  for (const path of currentDocFiles()) if (!docs.has(path)) rmSync(join(PKG_DIR, path));
  for (const [path, text] of docs) {
    const full = join(PKG_DIR, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, text);
  }
  console.log(
    `manifest: 생성 문서 ${docs.size}개 → ${relative(PKG_DIR, join(PKG_DIR, "llms.txt"))} · ${COMPONENT_DOCS_DIR}/`,
  );
  return 0;
}

const invoked = process.argv[1] ? realpathSync(process.argv[1]) : "";
if (invoked && invoked === fileURLToPath(import.meta.url))
  process.exitCode = run(process.argv.includes("--check"));
