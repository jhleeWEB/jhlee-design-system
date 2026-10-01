/* 커서 생성물(#64) — `src/cursors/cursors.ts` 의 표 → 두 파일.
 *
 *   cursors.css           :root 의 `--cursor-<이름>: url("data:…") x y, <폴백>` — tokens.css 가 @import 한다(Tailwind 없이도 쓴다)
 *   cursors.tailwind.css  `@utility cursor-cad-<이름> { cursor: var(--cursor-<이름>) }` — theme.css 가 @import 한다
 *
 * 유틸리티 이름에 `cad-` 를 끼우는 이유: Tailwind 는 같은 이름의 손 @utility 와 내장 유틸리티를 한 규칙으로 합치고 뒤의 선언이 이긴다
 * (4.3.3 실측: `.cursor-move { cursor: move; cursor: var(--cursor-move) }`). 그대로 `cursor-move` · `cursor-wait` · `cursor-not-allowed` 를
 * 내면 theme.css 를 싣는 순간 소비자가 쓰던 내장 키워드 유틸리티가 말없이 SVG 커서로 바뀐다. 변수 이름은 겹칠 것이 없어 `--cursor-<이름>` 그대로다.
 * SD 를 거치지 않는다 — 값이 DTCG 토큰이 아니라 SVG 문서에서 나오기 때문이다(legacy-classes.json 과 같은 처지). */
import { HEADER } from "./shared.mjs";

/** @param {{ CURSORS: Record<string, { label: string, hotspot: readonly [number, number], fallback: string }>, cursorNames: string[], cursorValue: (name: string) => string }} mod */
export function cursorFiles(mod) {
  const vars = mod.cursorNames.map((name) => {
    const { label, hotspot, fallback } = mod.CURSORS[name];
    return `  /* ${label} — 핫스팟 ${hotspot[0]} ${hotspot[1]} · 폴백 ${fallback} */\n  --cursor-${name}: ${mod.cursorValue(name)};`;
  });
  const css = [
    HEADER.replace("정본: packages/ui/tokens/ 의 DTCG JSON", "정본: packages/ui/src/cursors/cursors.ts"),
    "/* 3D 모델링 커서 — 32×32 SVG(검정 본체 · 흰 외곽 1.5px) · 핫스팟 · 키워드 폴백. `cursor: var(--cursor-orbit)` 또는 Tailwind `cursor-cad-orbit`. */",
    ":root {",
    ...vars,
    "}",
    "",
  ].join("\n");
  const utilities = mod.cursorNames.map(
    (name) => `@utility cursor-cad-${name} {\n  cursor: var(--cursor-${name});\n}`,
  );
  const tailwind = [
    HEADER.replace("정본: packages/ui/tokens/ 의 DTCG JSON", "정본: packages/ui/src/cursors/cursors.ts"),
    "/* 커서 유틸리티 — 값은 cursors.css 의 --cursor-*. 이름의 `cad-` 는 Tailwind 내장 cursor-* 키워드 유틸리티와 겹치지 않게 한다(formats/cursors.mjs 머리). */",
    "",
    utilities.join("\n\n"),
    "",
  ].join("\n");
  return { css, tailwind };
}
