/// <reference types="node" />
// @vitest-environment node
// 소스 «파일» 을 읽는 스펙이라 node 로 돈다(tokens.spec 과 같은 이유).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/* 스토리 계약(계획 §2.5-e).
 *  1. 배럴(index.ts)이 내보내는 컴포넌트 모듈마다 옆에 `Name.stories.tsx` 가 있다.
 *  2. 있는 stories 파일은 `Default` · `Variants` · `ThemeContrast` 세 export 를 가진다 — 이름이 고정이어야
 *     매니페스트·docs·jsdom 계약 테스트·VRT 가 같은 픽스처를 가리킨다.
 * 첫날부터 초록으로 시작하려고 아직 없는 것은 STORIES_MISSING 에 적어 둔다. 이 목록은 **줄어들기만 한다** —
 * 스토리를 만들면 여기서 지워야 통과하고(래칫), 새 컴포넌트는 여기 넣지 말고 stories 를 함께 만든다. */

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** 배럴 기준 모듈 경로(`src/` 상대, 확장자 없음). Phase D 가 소비처 많은 순으로 지운다.
 *  `legacy/*`(shell·controls·design-system)는 여기 없다 — 루트 배럴이 `@deprecated` const 별칭으로만 내보내
 *  스캐너(`export … from`)에 잡히지 않고, 격리·동결된 코드라 스토리 계약 밖이다(#10). */
const STORIES_MISSING: readonly string[] = [
  "navigation/Accordion",
  "navigation/BackButton",
  "navigation/Breadcrumb",
  "navigation/ScrollArea",
  "navigation/SegmentedControl",
  "navigation/Sidebar",
  "navigation/Toolbar",
];

const REQUIRED_EXPORTS = ["Default", "Variants", "ThemeContrast"] as const;

/** 패키지 루트 — `stories/`(페이지 스토리)도 a11y 래칫의 대상이다. */
const PKG = resolve(SRC, "..");

/**
 * addon-a11y 가 `test: 'error'` 라 위반이 있는 스토리는 실패한다(C2). 알려진 위반은 **그 스토리의** `parameters.a11y.config.rules` 로만 끄고
 * 여기 적는다 — `파일#스토리` → 끈 규칙 id. 첫 실행 실측(2026-09-30). **줄어들기만 한다**: 위반을 고치면 스토리의 rules 와 여기서 함께 지운다.
 * 메타(파일 머리)에서 규칙을 끄는 것은 금지다 — 파일의 모든 스토리가 한꺼번에 빠져나가기 때문이다.
 */
const KNOWN_A11Y_FAILURES: Readonly<Record<string, readonly string[]>> = {
  "src/CanvasScale.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/data/DataTable.stories.tsx#Default": ["color-contrast"],
  "src/data/DataTable.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/data/DataTable.stories.tsx#Variants": ["color-contrast"],
  "src/data/DescriptionList.stories.tsx#Default": ["color-contrast"],
  "src/data/DescriptionList.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/data/DescriptionList.stories.tsx#Variants": ["color-contrast"],
  "src/data/Table.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/data/Table.stories.tsx#Variants": ["color-contrast"],
  "src/feedback/Alert.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/feedback/EmptyState.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/feedback/Progress.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/feedback/Progress.stories.tsx#Variants": ["color-contrast"],
  "src/feedback/Skeleton.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/feedback/Spinner.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/feedback/Spinner.stories.tsx#Variants": ["color-contrast"],
  "src/feedback/Toast.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/overlay/AlertDialog.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/overlay/Drawer.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/overlay/DropdownMenu.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/overlay/DropdownMenu.stories.tsx#Variants": ["color-contrast"],
  "src/overlay/Modal.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/overlay/Popover.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/overlay/Tooltip.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/primitives/Badge.stories.tsx#Default": ["color-contrast"],
  "src/primitives/Badge.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/primitives/Badge.stories.tsx#Variants": ["color-contrast"],
  "src/primitives/Button.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/primitives/Button.stories.tsx#Variants": ["color-contrast"],
  "src/primitives/Card.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/primitives/Card.stories.tsx#Variants": ["color-contrast"],
  "src/primitives/Choice.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/primitives/Choice.stories.tsx#Variants": ["color-contrast"],
  "src/primitives/Editorial.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/primitives/Editorial.stories.tsx#Variants": ["color-contrast"],
  "src/primitives/Input.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/primitives/Input.stories.tsx#Variants": ["color-contrast"],
  "src/primitives/MediaCard.stories.tsx#Default": ["color-contrast"],
  "src/primitives/MediaCard.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/primitives/MediaCard.stories.tsx#Variants": ["color-contrast"],
  "src/primitives/Misc.stories.tsx#ThemeContrast": ["color-contrast"],
  "src/primitives/Misc.stories.tsx#Variants": ["color-contrast"],
  "src/primitives/PanelToggleButton.stories.tsx#ThemeContrast": ["color-contrast"],
  "stories/Gallery.stories.tsx#Dark": ["aria-progressbar-name", "color-contrast", "label"],
  "stories/Gallery.stories.tsx#Light": ["aria-progressbar-name", "color-contrast", "label"],
  "stories/Radius.stories.tsx#Components": ["aria-hidden-focus", "color-contrast"],
  "stories/Radius.stories.tsx#Ladder": ["color-contrast"],
  "stories/Workbench.stories.tsx#Default": ["aria-progressbar-name", "color-contrast"],
};

/** `{ id: "x", enabled: false }` 로 끈 규칙 id — 규칙 배열이 변수로 빠져 있어도(Gallery 의 knownA11y) 같은 파일 안이면 잡힌다. */
function disabledRules(block: string): string[] {
  return [...block.matchAll(/\{\s*id:\s*"([a-z0-9-]+)",\s*enabled:\s*false\s*\}/g)].map((m) => m[1]!).sort();
}

/** 파일을 `export const` 단위로 잘라 스토리마다 끈 규칙을 모은다. 상수로 뺀 규칙 목록(Gallery 의 knownA11y)은 그 상수를 참조하는 스토리에 귀속한다. */
function a11yExemptions(file: string): Record<string, string[]> {
  const text = readFileSync(file, "utf8");
  const parts = text.split(/^(?=export const )/m);
  const head = parts[0] ?? "";
  // 머리의 최상위 문장(`const x = …`)마다 — 다음 최상위 선언(const · type · function · export)이나 파일 끝까지가 한 문장이다.
  // 정규식으로 `};` 를 찾으면 `const meta = { … } satisfies Meta` 가 다음 상수까지 삼킨다(첫 실측) — 그래서 선언 경계로 자른다.
  const constRules: Record<string, string[]> = {};
  const statements = head.split(/^(?=(?:const|type|function|export|interface) )/m);
  for (const statement of statements) {
    const name = /^const (\w+)/.exec(statement)?.[1];
    if (!name) continue;
    const rules = disabledRules(statement);
    if (rules.length) constRules[name] = rules;
  }
  const out: Record<string, string[]> = {};
  for (const part of parts.slice(1)) {
    const name = /^export const (\w+)/.exec(part)?.[1];
    if (!name) continue;
    const inline = disabledRules(part);
    const viaConst = Object.entries(constRules).flatMap(([id, rules]) =>
      new RegExp(`\\b${id}\\b`).test(part) ? rules : [],
    );
    const rules = [...new Set([...inline, ...viaConst])].sort();
    if (rules.length) out[name] = rules;
  }
  return out;
}

/** 배럴을 따라가며 «컴포넌트를 내보내는 모듈» 을 모은다.
 *  컴포넌트 = PascalCase 값 export. 타입·`*Variants`·훅(camelCase)·`GRID_TARGET_PX` 같은 UPPER_CASE 상수는 아니다. */
function componentModules(barrel: string, out = new Set<string>()): Set<string> {
  const dir = dirname(barrel);
  const text = readFileSync(barrel, "utf8");
  for (const m of text.matchAll(/export\s+\*\s+from\s+"(\.[^"]+)"/g)) {
    componentModules(resolveModule(dir, m[1]!, true), out);
  }
  for (const m of text.matchAll(/export\s*\{([^}]*)\}\s*from\s*"(\.[^"]+)"/g)) {
    const names = m[1]!
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("type "));
    const hasComponent = names.some((n) => /^[A-Z][a-z]/.test(n) && !n.endsWith("Variants"));
    if (hasComponent) out.add(relative(SRC, resolveModule(dir, m[2]!, false)).replace(/\.tsx?$/, ""));
  }
  return out;
}

function resolveModule(dir: string, spec: string, barrelOnly: boolean): string {
  const candidates = barrelOnly
    ? [`${spec}/index.ts`, `${spec}.ts`]
    : [`${spec}.tsx`, `${spec}.ts`, `${spec}/index.ts`];
  for (const c of candidates) {
    const p = resolve(dir, c);
    if (existsSync(p)) return p;
  }
  throw new Error(`배럴이 가리키는 모듈을 찾지 못했다: ${spec} (from ${dir})`);
}

function storyFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) storyFiles(p, out);
    else if (entry.name.endsWith(".stories.tsx")) out.push(p);
  }
  return out;
}

describe("스토리 계약", () => {
  const modules = [...componentModules(join(SRC, "index.ts"))].sort();

  it("배럴이 내보내는 컴포넌트 모듈을 찾는다", () => {
    expect(modules.length).toBeGreaterThan(20);
    expect(modules).toContain("primitives/Button");
  });

  it("컴포넌트 모듈마다 stories 가 있거나 STORIES_MISSING 에 적혀 있다", () => {
    const missing = modules.filter(
      (m) => !existsSync(join(SRC, `${m}.stories.tsx`)) && !STORIES_MISSING.includes(m),
    );
    expect(missing, "새 컴포넌트는 stories 와 함께 만든다").toEqual([]);
  });

  it("STORIES_MISSING 은 줄어들기만 한다 — stories 가 생긴 항목·배럴에 없는 항목은 지운다", () => {
    const stale = STORIES_MISSING.filter(
      (m) => existsSync(join(SRC, `${m}.stories.tsx`)) || !modules.includes(m),
    );
    expect(stale).toEqual([]);
    expect([...STORIES_MISSING]).toEqual([...STORIES_MISSING].sort());
  });

  it.each(storyFiles(SRC).map((f) => [relative(SRC, f), f] as const))(
    "%s 는 Default · Variants · ThemeContrast 를 내보낸다",
    (_name, file) => {
      const text = readFileSync(file, "utf8");
      for (const name of REQUIRED_EXPORTS) {
        expect(text, `export const ${name}`).toMatch(new RegExp(`export const ${name}\\b`));
      }
    },
  );
});

describe("a11y 래칫(addon-a11y test: 'error')", () => {
  const files = [...storyFiles(SRC), ...storyFiles(join(PKG, "stories"))].map(
    (f) => [relative(PKG, f), f] as const,
  );
  const actual: Record<string, readonly string[]> = {};
  for (const [name, file] of files) {
    for (const [story, rules] of Object.entries(a11yExemptions(file))) actual[`${name}#${story}`] = rules;
  }

  it("메타(파일 머리)에서 axe 규칙을 끄지 않는다 — 스토리 단위로만", () => {
    const offenders = files.filter(([, file]) => {
      const text = readFileSync(file, "utf8");
      const meta = text.slice(text.indexOf("const meta"), text.indexOf("export default meta"));
      return /enabled:\s*false/.test(meta);
    });
    expect(offenders.map(([name]) => name)).toEqual([]);
  });

  it("규칙을 끈 스토리 ⊆ KNOWN_A11Y_FAILURES (같은 규칙 집합)", () => {
    const fresh = Object.entries(actual).filter(
      ([key, rules]) => JSON.stringify(rules) !== JSON.stringify(KNOWN_A11Y_FAILURES[key]),
    );
    expect(
      fresh,
      "새로 끈 스토리·규칙 — 위반을 고치거나(권장) 실측 뒤 KNOWN_A11Y_FAILURES 에 적는다",
    ).toEqual([]);
  });

  it("KNOWN_A11Y_FAILURES 는 줄어들기만 한다 — 더는 끄지 않는 스토리는 지운다", () => {
    const stale = Object.keys(KNOWN_A11Y_FAILURES).filter((key) => !(key in actual));
    expect(stale).toEqual([]);
    const keys = Object.keys(KNOWN_A11Y_FAILURES);
    expect(keys).toEqual([...keys].sort());
    for (const rules of Object.values(KNOWN_A11Y_FAILURES)) expect([...rules]).toEqual([...rules].sort());
  });
});
