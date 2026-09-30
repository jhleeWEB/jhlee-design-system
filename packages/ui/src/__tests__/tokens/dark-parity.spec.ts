/*
 * 다크 두 블록의 동일성(계획 §2.4 D-2 `dark-parity.spec`, #11).
 *
 * theme.css 는 다크를 두 번 적는다 — `@media (prefers-color-scheme: dark)` 의 OS 다크와 `[data-theme="dark"]` 의 토글 다크. 손으로 복붙한
 * 두 블록이라 한쪽만 고치면 **같은 제품이 사람마다 다른 색으로 열린다**. 옛 `tokens.spec` 은 이름 집합까지만 봤고, 값이 갈린 것은
 * 아무도 못 봤다. Phase B 의 생성기가 다크를 한 번만 읽어 두 블록을 찍어 내면 이 스펙은 지운다(계획 §2.6 B3).
 */
import { describe, expect, it } from "vitest";

import { loadTokenModel, type TokenScope } from "./model";

const model = loadTokenModel();

const block = (scope: TokenScope): Record<string, string> =>
  Object.fromEntries(
    model.tokens
      .filter(t => t.scope === scope)
      .map(t => [t.name, t.value] as const)
      .sort(([a], [b]) => a.localeCompare(b)),
  );

describe("다크 두 블록", () => {
  const media = block("dark-media");
  const attr = block("dark-attr");

  it("둘 다 크롬 토큰만 정의하고 비어 있지 않다", () => {
    expect(Object.keys(media).length).toBeGreaterThan(20);
    for (const name of [...Object.keys(media), ...Object.keys(attr)]) expect(name).toMatch(/^--chrome-/);
  });

  it("이름과 값이 완전히 같다", () => {
    expect(attr).toEqual(media);
  });

  it("라이트가 정의한 크롬 토큰마다 다크 값이 있다 — 빠진 토큰은 다크에서 라이트 색으로 남는다", () => {
    const light = new Set(model.tokens.filter(t => t.scope === "root" && t.name.startsWith("--chrome-")).map(t => t.name));
    expect([...light].filter(name => !(name in attr)).sort()).toEqual([]);
    expect(Object.keys(attr).filter(name => !light.has(name))).toEqual([]);
  });
});
