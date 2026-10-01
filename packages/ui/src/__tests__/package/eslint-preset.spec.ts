/*
 * 소비자 린트 프리셋(`@jhleeweb/squircle-design-system/eslint`, 계획 §2.5-a, #31) — 소비자가 붙이는 모양 그대로 ESLint API 로 돌려 본다.
 * 다섯 규칙이 각각 «LLM 이 흔히 쓰는 위반» 을 잡는지가 계약이다: raw <button> · Tailwind 기본 사다리 `text-sm` · 옛 이름 `text-ink`(--fix) ·
 * hex/임의값/격자 밖 간격 · 인라인 색 · 옛 tone 키(--fix). 파서는 espree(JSX 켬)다 — 소비자가 typescript-eslint 를 쓰더라도 규칙은 AST 모양만 본다.
 */
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import { LEGACY_TONES, restrictedClassPatterns, squircleDesignSystem } from "../../eslint/index";
import { toneValues } from "../../lib/tone";

const ENTRY = fileURLToPath(new URL("../../theme.css", import.meta.url));

function linter(fix = false): ESLint {
  return new ESLint({
    cwd: fileURLToPath(new URL("../../../", import.meta.url)), // tailwindcss 는 packages/ui 에 설치돼 있다
    fix,
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ["**/*.jsx"],
        languageOptions: {
          ecmaVersion: 2024,
          sourceType: "module",
          parserOptions: { ecmaFeatures: { jsx: true } },
        },
      },
      ...squircleDesignSystem({ entryPoint: ENTRY, files: ["**/*.jsx"], styleIgnores: ["**/scene/**"] }),
    ],
  });
}

async function lint(code: string, filePath = "src/App.jsx"): Promise<{ rules: string[]; fixed: string }> {
  const [result] = await linter().lintText(code, { filePath });
  const rules = result!.messages.map((m) => m.ruleId ?? m.message).sort();
  const [fixedResult] = await linter(true).lintText(code, { filePath });
  return { rules, fixed: fixedResult!.output ?? code };
}

describe("eslint 프리셋", { timeout: 60_000 }, () => {
  it("깨끗한 조립은 통과한다 — 토큰 유틸 · DS 컴포넌트 · 새 tone", async () => {
    const { rules } = await lint(
      'export const A = () => <Button tone="primary" className="rounded-md bg-card text-body gap-3 p-4 shadow-pop">x</Button>;',
    );
    expect(rules).toEqual([]);
  });

  it('raw 요소(<button> · createElement("table"))는 no-restricted-syntax — scene/ 안에서도, <Button> 은 통과', async () => {
    const code =
      'export const A = () => <><button>x</button><Button>y</Button><ui.button /></>;\nexport const B = () => React.createElement("table");';
    expect((await lint(code)).rules.filter((r) => r === "no-restricted-syntax")).toHaveLength(2);
    expect(
      (await lint(code, "src/scene/Canvas.jsx")).rules.filter((r) => r === "no-restricted-syntax"),
    ).toHaveLength(2);
  });

  it("Tailwind 기본 사다리(text-sm · bg-gray-100)는 no-unknown-classes — CSS 없이 조용히 무시되는 클래스", async () => {
    const { rules } = await lint('export const A = () => <div className="text-sm bg-gray-100" />;');
    expect(rules.filter((r) => r === "better-tailwindcss/no-unknown-classes")).toHaveLength(2);
  });

  it("옛 이름(text-ink · bg-accent-hover · rounded-control)은 no-restricted-classes 이고 --fix 가 개명한다", async () => {
    const { rules, fixed } = await lint(
      'export const A = () => <div className="text-ink bg-accent-hover rounded-control" />;',
    );
    expect(rules.filter((r) => r === "better-tailwindcss/no-restricted-classes")).toHaveLength(3);
    expect(fixed).toContain('className="text-foreground bg-primary-hover rounded-md"');
  });

  it("hex · 임의 단위 · 격자 밖 간격은 no-restricted-classes", async () => {
    const { rules } = await lint(
      'export const A = () => <div className="bg-[#0869e1] w-[12px] gap-1.5 p-7" />;',
    );
    expect(rules.filter((r) => r === "better-tailwindcss/no-restricted-classes")).toHaveLength(4);
  });

  it("인라인 색·테두리 style 은 no-restricted-syntax — scene/ 은 뺀다", async () => {
    const code = 'export const A = () => <div style={{ color: "red", background: "#fff", width: 12 }} />;';
    expect((await lint(code)).rules.filter((r) => r === "no-restricted-syntax")).toHaveLength(2);
    expect(
      (await lint(code, "src/scene/Canvas.jsx")).rules.filter((r) => r === "no-restricted-syntax"),
    ).toHaveLength(0);
  });

  it("옛 tone 키는 ds/legacy-tone 이고 --fix 가 새 키로 바꾼다", async () => {
    const { rules, fixed } = await lint('export const A = () => <Button tone="accent">x</Button>;');
    expect(rules).toContain("ds/legacy-tone");
    expect(fixed).toContain('tone="primary"');
  });

  it("severity 를 warn 으로 낮출 수 있다 — 처음 붙일 때 실측용", async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        { files: ["**/*.jsx"], languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
        ...squircleDesignSystem({ entryPoint: ENTRY, files: ["**/*.jsx"], severity: "warn" }),
      ],
    });
    const [result] = await eslint.lintText("export const A = () => <button>x</button>;", {
      filePath: "a.jsx",
    });
    expect(result!.messages.map((m) => m.severity)).toEqual([1]);
  });
});

describe("프리셋의 원천", () => {
  it("옛 tone 표는 오늘의 톤 어휘로만 옮긴다 — 3.0.0 에서 런타임 shim(normalizeTone)을 지워 표는 규칙이 홀로 든다(#49)", () => {
    expect(Object.keys(LEGACY_TONES).sort()).toEqual([
      "accent",
      "current",
      "danger",
      "default",
      "ok",
      "warn",
    ]);
    for (const to of Object.values(LEGACY_TONES)) expect(toneValues).toContain(to);
    // 옛 키가 새 어휘와 겹치면 --fix 가 멀쩡한 새 키를 바꾼다.
    for (const from of Object.keys(LEGACY_TONES)) expect(toneValues).not.toContain(from);
  });

  it("제한 패턴은 개명 표(생성물) 뒤에 hex · 색 함수 · 단위 · 간격 넷이다", () => {
    const patterns = restrictedClassPatterns();
    const renames = patterns.filter((p) => p.fix);
    expect(renames.length).toBeGreaterThan(30);
    expect(patterns.slice(renames.length).map((p) => p.message)).toEqual([
      "Hex colour in a class — use a colour token.",
      "Raw colour function in a class — use a colour token.",
      "Unit literal in a class — use a token utility.",
      "Spacing step off the 4px grid — allowed steps are 0 1 2 3 4 5 6 8 10 12 16 20 24 (px = 4 × step).",
    ]);
  });
});
