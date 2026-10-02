/*
 * 참조 무결성(계획 §2.4 D-2 `references.spec`, #11 → #18).
 *
 * 토큰이 토큰을 가리키는 것이 이 시스템의 구조다 — `--color-ink → --chrome-ink → --palette-cool-900`. 그 사슬이 끊기면(정의 없는 var)
 * 브라우저는 에러 없이 속성을 무효로 만들어 **민짜로 렌더된다**. 조용한 실패라 소스에서 잡아야 한다. 대상은 소비자가 받는 CSS 전부다(model.ts).
 */
import { describe, expect, it } from "vitest";

import { loadTokenModel, referenceDepth, type Mode } from "./model";

const model = loadTokenModel();
const defined = new Set(model.tokens.map((t) => t.name));
const MODES: readonly Mode[] = ["light", "dark"];

/**
 * `@theme inline` 의 `--color-*` 가운데 참조가 아니라 **리터럴**인 것. 규칙 ④(«반드시 `var(--chrome-*|--canvas-*)`, 리터럴 금지»)의 예외 목록이고
 * **줄어들기만 한다**. #18 에서 0 이 됐다 — white·black 은 캔버스 고정색 참조가 됐고 transparent·current 는 Tailwind 4 가 --color-* 없이도
 * 내는 키워드라 지웠다(bg-transparent · text-current 컴파일 실측).
 */
const KNOWN_INLINE_LITERALS: readonly string[] = [];

const PALETTE = /^--palette-/;

describe("참조 무결성", () => {
  it("var(--x) 가 가리키는 토큰은 전부 정의돼 있다", () => {
    /* 폴백이 있어도(`var(--x, 12px)`) 정의가 없으면 폴백만 살아 토큰이 아니게 된다 — 폴백은 정의를 대신하지 않는다. */
    const missing = model.references
      .filter((r) => !defined.has(r.name))
      .map((r) => `${r.file}:${r.line} ${r.prop}: var(${r.name})`);
    expect(missing).toEqual([]);
  });

  it("alias 사슬에 순환이 없고 깊이는 3 이하다", () => {
    /* `--color-ok → --chrome-ok → --palette-moss-500` · `--motion-collapse-duration → --duration-collapse → --duration-slow` 가 오늘 가장 깊은 사슬(2)이다.
       3을 넘기면 값을 찾아 세 파일을 오가야 한다. */
    for (const mode of MODES) {
      const tooDeep = [...defined]
        .filter((name) => referenceDepth(model, name, mode) > 3)
        .map((name) => `${name} (${mode}): ${referenceDepth(model, name, mode)}`);
      expect(tooDeep).toEqual([]);
    }
  });

  it("@theme inline 의 --color-* 는 --chrome-*·--canvas-* 참조뿐이다 — 리터럴은 KNOWN_INLINE_LITERALS 만", () => {
    /* inline 매핑에 리터럴이 들어오면 그 색은 테마 전환을 타지 않는다(theme.tailwind.css 의 `inline` 주석). */
    const colours = model.tokens.filter((t) => t.scope === "theme-inline" && t.name.startsWith("--color-"));
    expect(colours.length).toBeGreaterThan(20);
    const badRefs = colours
      .filter((t) => t.refs.some((ref) => !/^--(?:chrome|canvas)-/.test(ref)))
      .map((t) => `${t.name}: ${t.value}`);
    expect(badRefs).toEqual([]);
    const literals = colours
      .filter((t) => t.refs.length === 0)
      .map((t) => t.name)
      .sort();
    expect(literals).toEqual([...KNOWN_INLINE_LITERALS].sort());
  });

  it("미참조 원시는 이것이 전부다 — 새 원시는 쓰는 곳과 함께 더하고, 쓰이기 시작하면 여기서 지운다", () => {
    /* 원시(`--palette-*`)는 시맨틱이 참조해야 존재 이유가 있다. #11 의 18개에서 #18 이 cool.950(판정색 위의 어두운 글자)을 쓰기 시작해 17개다.
       나머지는 자매 저장소의 mono 12단(무채색이 필요한 자리를 위해 지우지 않는다)과 cool·azure 의 빈 단이다 — 늘지 않게 붙들어 둔다.
       3.0.0(#49)에서 옛 base 이름 alias(legacy.css 의 --dark · --light · --steel · --silver · --offwhite)가 사라져 gray 다섯이 더해졌다(22개) —
       지우지 않는다: 코드모드 표(tokens/legacy-map.mjs 의 baseVars)가 옛 이름을 «값이 같은» 이 원시로 옮기므로 목적지가 살아 있어야 한다.
       #55 에서 라이트 글자 AA 를 위해 시맨틱이 한 단 어두운 새 단(cool.550 · moss.550 · rust.550 · amber.650)으로 옮겨 다섯이 더해졌다(27개) —
       cool.500 · moss.500 · amber.500 · rust.500 은 같은 이유(코드모드 목적지 `--color-cool-500` · `--ok` · `--warn` · `--danger`)로 값째 남고,
       amber.600(옛 라이트 hover)은 발행된 CSS 변수라 지우면 major 라서 남긴다.
       #83 에서 브랜드 시그널이 Klein 사다리로 옮겨 azure 의 쓰이던 다섯(50 · 100 · 400 · 500 · 600)이 미참조가 됐다(32개) — 공개 CSS 변수
       `--palette-azure-*` 라 지우면 major 다. */
    const referrers = new Map<string, string[]>();
    for (const t of model.tokens)
      for (const ref of t.refs) referrers.set(ref, [...(referrers.get(ref) ?? []), t.name]);
    for (const r of model.references)
      if (!r.prop.startsWith("--")) referrers.set(r.name, [...(referrers.get(r.name) ?? []), r.prop]);
    const primitives = model.tokens.filter((t) => PALETTE.test(t.name));
    expect(primitives.length).toBeGreaterThan(60);
    const dead = primitives
      .filter((t) => (referrers.get(t.name) ?? []).length === 0)
      .map((t) => t.name)
      .sort();
    expect(dead).toMatchInlineSnapshot(`
      [
        "--palette-amber-500",
        "--palette-amber-600",
        "--palette-azure-100",
        "--palette-azure-200",
        "--palette-azure-400",
        "--palette-azure-50",
        "--palette-azure-500",
        "--palette-azure-600",
        "--palette-azure-700",
        "--palette-cool-50",
        "--palette-cool-500",
        "--palette-cool-700",
        "--palette-cool-800",
        "--palette-gray-100",
        "--palette-gray-250",
        "--palette-gray-400",
        "--palette-gray-500",
        "--palette-gray-800",
        "--palette-mono-0",
        "--palette-mono-100",
        "--palette-mono-200",
        "--palette-mono-300",
        "--palette-mono-400",
        "--palette-mono-50",
        "--palette-mono-500",
        "--palette-mono-600",
        "--palette-mono-700",
        "--palette-mono-800",
        "--palette-mono-900",
        "--palette-mono-950",
        "--palette-moss-500",
        "--palette-rust-500",
      ]
    `);
  });
});
