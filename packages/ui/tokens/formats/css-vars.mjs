/* sds/css-vars — `generated/tokens.css`(scope root · chrome) 와 `generated/legacy.css`(scope legacy).
 *
 * 블록 모양은 `src/__tests__/tokens/model.ts` 의 scopeOf 가 선택자로 읽는 것과 같아야 한다(옛 손 theme.css 의 모양이다):
 *   :root                                  base · palette(+alias) · canvas · component
 *   :root, [data-theme="light"]            chrome 라이트 + color-scheme: light
 *   @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }   chrome 다크(OS)
 *   :root[data-theme="dark"], [data-theme="dark"]                               chrome 다크(토글) — 같은 본문
 *   @media (prefers-reduced-motion: reduce) { :root }                           reducedMotion 재정의
 * `@supports` 블록은 없다 — #26 의 진행형 향상(corner-shape)은 스쿼클 폐기(#36)와 함께 지웠다. 모든 토큰은 어느 엔진에서나 한 값이다.
 * 다크를 두 번 찍는 이유(손 CSS 주석 그대로): OS 설정을 따르되 토글이 이기고, `ThemeContrast` 스토리가 서브트리에 속성을 단다.
 * 다크 본문은 options.dark 로 받는다 — source 로 넣으면 같은 키가 두 번 정의돼 SD 가 충돌을 낸다. */
import { block, byOrder, decl, groupBy, HEADER, sds, tokenDeclarations } from "./shared.mjs";

const LIGHT_SELECTOR = ':root,\n[data-theme="light"]';
const DARK_MEDIA = "@media (prefers-color-scheme: dark)";
const DARK_MEDIA_SELECTOR = ':root:not([data-theme="light"])';
const DARK_ATTR_SELECTOR = ':root[data-theme="dark"],\n[data-theme="dark"]';
const REDUCED_MOTION = "@media (prefers-reduced-motion: reduce)";

/** `:root` 본문 — 파일마다 `/* file *\/` 한 줄로 출처를 남긴다. */
function rootLines(tokens, outputReferences) {
  const lines = [];
  for (const [file, group] of groupBy(tokens, t => sds(t).file)) {
    if (lines.length) lines.push("");
    lines.push(`/* ${file} */`);
    for (const t of group) lines.push(...tokenDeclarations(t, outputReferences).map(decl));
  }
  return lines;
}

/** reducedMotion 재정의가 있는 토큰 → `--name: value;`. */
export const reducedMotionLines = tokens => tokens.filter(t => sds(t).reducedMotion !== undefined).map(t => `--${t.name}: ${sds(t).reducedMotion};`);

/** @type {import("style-dictionary/types").Format["format"]} */
export function cssVars({ dictionary, options }) {
  const { outputReferences = true, dark = [], legacy = false } = options;
  const all = dictionary.allTokens.filter(t => sds(t).scope === (legacy ? "legacy" : "root") || (!legacy && sds(t).scope === "chrome")).sort(byOrder);

  if (legacy) {
    const body = all.length ? block(":root", rootLines(all, outputReferences)) : "/* 비어 있다 — legacy.json 에 옛 이름이 없다. */";
    return `${HEADER}/* 옛 이름 → 새 정본 alias. 값은 옛 CSS 와 같다(#18). 새 코드는 쓰지 않는다 — forbidden-patterns 의 legacy-alias-use 래칫. 제거는 major. */\n\n${body}\n`;
  }

  const root = all.filter(t => sds(t).scope === "root");
  const chrome = all.filter(t => sds(t).scope === "chrome");

  // 다크는 라이트와 같은 이름 집합이어야 한다 — 스키마가 먼저 보지만, 포맷도 자기 입력을 믿지 않는다.
  const lightNames = chrome.map(t => t.name).sort();
  const darkNames = dark.map(d => d.name).sort();
  if (JSON.stringify(lightNames) !== JSON.stringify(darkNames)) throw new Error(`css-vars: chrome 라이트/다크 이름 집합이 다르다\n light: ${lightNames.join(", ")}\n dark: ${darkNames.join(", ")}`);
  const darkLines = [...dark.flatMap(d => d.declarations.map(decl)), "color-scheme: dark;"];

  const parts = [
    HEADER,
    block(":root", rootLines(root, outputReferences)),
    "",
    "/* 크롬 — 라이트가 기준값. [data-theme=\"light\"] 를 함께 두는 이유: 전역이 다크일 때 라이트 서브트리가 라이트로 돌아오려면 값이 그 요소에 직접 선언돼야 한다. */",
    block(LIGHT_SELECTOR, [...chrome.flatMap(t => tokenDeclarations(t, outputReferences).map(decl)), "color-scheme: light;"]),
    "",
    "/* 크롬 다크 — OS 설정을 따르되 사용자가 라이트를 골랐으면 그쪽이 이긴다. --canvas-* 는 여기 없다. */",
    block(DARK_MEDIA, [block(DARK_MEDIA_SELECTOR, darkLines).split("\n")].flat().map(l => l), ""),
    "",
    "/* 토글이 OS 설정을 이기는 반대 방향 — 같은 본문. 서브트리 [data-theme=\"dark\"] 도 잡아야 ThemeContrast 스토리에서 둘이 갈린다. */",
    block(DARK_ATTR_SELECTOR, darkLines),
  ];
  const reduced = reducedMotionLines(root);
  if (reduced.length) parts.push("", block(REDUCED_MOTION, block(":root", reduced).split("\n")));
  return `${parts.join("\n")}\n`;
}
