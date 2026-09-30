/* sds/tailwind-theme — `generated/theme.tailwind.css`.
 *
 *   @theme         정적 사다리(scope theme): radius · shadow · spacing · text · tracking · height · size · ease · animate.
 *                  reset 그룹은 `--<ns>-*: initial` 을 첫 토큰 앞에 둔다 — Tailwind 기본 사다리(rounded-lg · text-red-500)를 지워 역할 이름만 남긴다.
 *   @theme inline  모드가 갈리는 매핑(scope theme-inline): `--color-*: var(--chrome-*|--canvas-*)` · 글꼴. inline 이어야 유틸리티가 선언 시점 값에
 *                  묶이지 않고 [data-theme] 아래서 갈린다(손 theme.css 주석).
 *   @media (prefers-reduced-motion: reduce) { :root }   animate 의 none 재정의.
 * @utility · @keyframes · @source 는 토큰이 아니라 «규칙» 이라 손 theme.css 에 남는다(혼용 규칙 ⑤의 생성은 B3 이후). */
import { block, byOrder, decl, groupBy, HEADER, sds, tokenDeclarations } from "./shared.mjs";
import { reducedMotionLines } from "./css-vars.mjs";

/** 네임스페이스(경로 첫 마디) 순으로 묶고, reset 그룹이면 `--ns-*: initial` 을 앞에 둔다. */
function themeLines(tokens, outputReferences) {
  const lines = [];
  for (const [ns, group] of groupBy(tokens, t => t.path[0])) {
    if (lines.length) lines.push("");
    if (group.some(t => sds(t).reset)) lines.push(`--${ns}-*: initial;`);
    for (const t of group) lines.push(...tokenDeclarations(t, outputReferences).map(decl));
  }
  return lines;
}

/** @type {import("style-dictionary/types").Format["format"]} */
export function tailwindTheme({ dictionary, options }) {
  const { outputReferences = true } = options;
  const theme = dictionary.allTokens.filter(t => sds(t).scope === "theme").sort(byOrder);
  const inline = dictionary.allTokens.filter(t => sds(t).scope === "theme-inline").sort(byOrder);
  const parts = [HEADER, block("@theme", themeLines(theme, outputReferences)), "", block("@theme inline", themeLines(inline, outputReferences))];
  const reduced = reducedMotionLines([...theme, ...inline]);
  if (reduced.length) parts.push("", block("@media (prefers-reduced-motion: reduce)", block(":root", reduced).split("\n")));
  return `${parts.join("\n")}\n`;
}
