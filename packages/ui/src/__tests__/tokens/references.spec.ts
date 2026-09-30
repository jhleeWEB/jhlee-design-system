/*
 * 참조 무결성(계획 §2.4 D-2 `references.spec`, #11).
 *
 * 토큰이 토큰을 가리키는 것이 이 시스템의 구조다 — `--color-ink → --chrome-ink → --color-cool-900`. 그 사슬이 끊기면(정의 없는 var)
 * 브라우저는 에러 없이 속성을 무효로 만들어 **민짜로 렌더된다**. 조용한 실패라 소스에서 잡아야 한다.
 */
import { describe, expect, it } from "vitest";

import { loadTokenModel, referenceDepth, type Mode } from "./model";

const model = loadTokenModel();
const defined = new Set(model.tokens.map(t => t.name));
const MODES: readonly Mode[] = ["light", "dark"];

/**
 * `@theme inline` 의 `--color-*` 가운데 참조가 아니라 **리터럴**인 것. 규칙 ④(«반드시 `var(--chrome-*|--canvas-*)`, 리터럴 금지»)의
 * 오늘 예외이고 Phase B(`@theme inline` 리터럴 0)가 지운다. **줄어들기만 한다** — 지우면 여기서도 지워야 통과한다.
 */
const KNOWN_INLINE_LITERALS: readonly string[] = ["--color-black", "--color-current", "--color-transparent", "--color-white"];

describe("참조 무결성", () => {
  it("var(--x) 가 가리키는 토큰은 전부 정의돼 있다", () => {
    /* 폴백이 있어도(`var(--x, 12px)`) 정의가 없으면 폴백만 살아 토큰이 아니게 된다 — 폴백은 정의를 대신하지 않는다. */
    const missing = model.references.filter(r => !defined.has(r.name)).map(r => `${r.file}:${r.line} ${r.prop}: var(${r.name})`);
    expect(missing).toEqual([]);
  });

  it("alias 사슬에 순환이 없고 깊이는 3 이하다", () => {
    /* `--color-ok → --chrome-ok → --ok` 가 오늘 가장 깊은 사슬(2)이다. 3을 넘기면 값을 찾아 세 파일을 오가야 한다. */
    for (const mode of MODES) {
      const tooDeep = [...defined].filter(name => referenceDepth(model, name, mode) > 3).map(name => `${name} (${mode}): ${referenceDepth(model, name, mode)}`);
      expect(tooDeep).toEqual([]);
    }
  });

  it("@theme inline 의 --color-* 는 --chrome-*·--canvas-* 참조뿐이다 — 리터럴은 KNOWN_INLINE_LITERALS 만", () => {
    /* inline 매핑에 리터럴이 들어오면 그 색은 테마 전환을 타지 않는다(theme.css 의 `inline` 주석). */
    const colours = model.tokens.filter(t => t.scope === "theme-inline" && t.name.startsWith("--color-"));
    expect(colours.length).toBeGreaterThan(20);
    const badRefs = colours.filter(t => t.refs.some(ref => !/^--(?:chrome|canvas)-/.test(ref))).map(t => `${t.name}: ${t.value}`);
    expect(badRefs).toEqual([]);
    const literals = colours.filter(t => t.refs.length === 0).map(t => t.name).sort();
    expect(literals).toEqual([...KNOWN_INLINE_LITERALS].sort());
  });

  it("미참조 원시는 이것이 전부다 — 새 원시는 쓰는 곳과 함께 더하고, 쓰이기 시작하면 여기서 지운다", () => {
    /* 원시(`theme.css` :root 의 `--color-*`)는 시맨틱이 참조해야 존재 이유가 있다. 오늘 18개가 참조되지 않는다(계획 §2.2 «죽은 원시»).
       Phase B 가 `--palette-*` 로 개명하며 정리한다 — 그때까지 늘지 않게 붙들어 둔다. */
    const referenced = new Set(model.references.map(r => r.name));
    const primitives = model.tokens.filter(t => t.file === "theme.css" && t.scope === "root" && t.name.startsWith("--color-"));
    expect(primitives.length).toBeGreaterThan(18);
    const dead = primitives.filter(t => !referenced.has(t.name)).map(t => t.name).sort();
    expect(dead).toMatchInlineSnapshot(`
      [
        "--color-azure-200",
        "--color-azure-700",
        "--color-cool-50",
        "--color-cool-700",
        "--color-cool-800",
        "--color-cool-950",
        "--color-mono-0",
        "--color-mono-100",
        "--color-mono-200",
        "--color-mono-300",
        "--color-mono-400",
        "--color-mono-50",
        "--color-mono-500",
        "--color-mono-600",
        "--color-mono-700",
        "--color-mono-800",
        "--color-mono-900",
        "--color-mono-950",
      ]
    `);
  });
});
