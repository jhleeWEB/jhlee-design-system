/* sds/tailwind-theme — `generated/theme.tailwind.css`.
 *
 *   @theme         정적 사다리(scope theme): radius · shadow · spacing · text · tracking · font-weight · height · container · ease · animate.
 *                  reset 그룹은 `--<ns>-*: initial` 을 첫 토큰 앞에 둔다 — Tailwind 기본 사다리(rounded-lg · text-red-500 · font-black)를 지워 역할 이름만 남긴다.
 *   @theme inline  모드가 갈리는 매핑(scope theme-inline): `--color-*: var(--chrome-*|--canvas-*)` · 글꼴. inline 이어야 유틸리티가 선언 시점 값에
 *                  묶이지 않고 [data-theme] 아래서 갈린다(손 theme.css 주석).
 *   @utility       `$extensions.sds.utility` 가 붙은 그룹의 토큰마다 — `z-toast { z-index: var(--layer-toast) }` · `duration-fast { --tw-duration: …; transition-duration: … }`.
 *                  Tailwind 네임스페이스가 아닌 값(:root 의 --layer-* · --duration-*)을 유틸리티로 내는 유일한 길이다(혼용 규칙 ⑤ «@utility 는 생성»).
 *                  `--tw-duration` 도 함께 놓는 이유: `.transition` 이 `transition-duration: var(--tw-duration, …)` 을 쓰므로 그것을 채워야
 *                  소스 순서와 무관하게 이긴다(Tailwind 4.3 컴파일 실측).
 *   @media (prefers-reduced-motion: reduce) { :root }   animate 의 none 재정의.
 * @keyframes · @source · 손 @utility(tnum · focus-ring · h-ctl …) 는 토큰이 아니라 «규칙» 이라 손 theme.css 에 남는다. */
import { block, byOrder, decl, groupBy, HEADER, sds, tokenDeclarations } from "./shared.mjs";
import { reducedMotionLines } from "./css-vars.mjs";

/** 네임스페이스(경로 첫 마디) 순으로 묶고, reset 그룹이면 `--ns-*: initial` 을 앞에 둔다. */
function themeLines(tokens, outputReferences) {
  const lines = [];
  for (const [ns, group] of groupBy(tokens, t => t.path[0])) {
    if (lines.length) lines.push("");
    if (group.some(t => sds(t).reset)) lines.push(`--${ns}-*: initial;`);
    // legacy.json 의 옛 유틸 이름 alias 는 같은 네임스페이스 끝에 붙는다(정본 순서상 legacy 가 마지막) — 읽는 사람을 위해 표시한다.
    for (const t of group) lines.push(...tokenDeclarations(t, outputReferences).map(decl).map(l => (t.$deprecated ? `${l} /* @deprecated */` : l)));
  }
  return lines;
}

/** `sds.utility` 가 붙은 토큰 → `@utility <prefix>-<이름>` 블록. 이름은 네임스페이스를 뗀 나머지 경로다(`layer.toast` → `z-toast`). */
export function utilityBlocks(tokens) {
  return tokens
    .filter(t => sds(t).utility)
    .sort(byOrder)
    .map(t => {
      const { prefix, properties } = sds(t).utility;
      return block(`@utility ${prefix}-${t.path.slice(1).join("-")}`, properties.map(p => `${p}: var(--${t.name});`));
    });
}

/** @type {import("style-dictionary/types").Format["format"]} */
export function tailwindTheme({ dictionary, options }) {
  const { outputReferences = true } = options;
  const theme = dictionary.allTokens.filter(t => sds(t).scope === "theme").sort(byOrder);
  const inline = dictionary.allTokens.filter(t => sds(t).scope === "theme-inline").sort(byOrder);
  const parts = [HEADER, block("@theme", themeLines(theme, outputReferences)), "", block("@theme inline", themeLines(inline, outputReferences))];
  const utilities = utilityBlocks(dictionary.allTokens);
  if (utilities.length) parts.push("", "/* 생성 유틸리티 — Tailwind 네임스페이스가 아닌 :root 토큰(--layer-* · --duration-*)을 클래스로 낸다. */", utilities.join("\n"));
  const reduced = reducedMotionLines([...theme, ...inline]);
  if (reduced.length) parts.push("", block("@media (prefers-reduced-motion: reduce)", block(":root", reduced).split("\n")));
  return `${parts.join("\n")}\n`;
}
