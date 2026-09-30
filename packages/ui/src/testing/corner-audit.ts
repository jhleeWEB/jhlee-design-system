/* 모서리 검사기 — 소비 레포의 `__arch__` 래칫이 부른다(계획 §3.5-5, #26).
 *
 * 곡률은 DS 가 전역 규칙(corner.css)으로 정하므로 소비자가 지킬 것은 넷뿐이다. 네 규칙은 «원호 강등이 허용된 폴백» 이라는 계약 안에서
 * 스쿼클이 조용히 빠지거나(원시 반경은 `--corner-k` 를 타지 않는다) 원형이 눌리는(초타원 캡슐) 자리를 잡는다:
 *   raw-radius                border-radius 에 토큰 밖 길이 — `4px` · `50%` · `999px`. 토큰(`var(--radius-*)`)이나 동심원 `calc(var(--radius-…) - …)` 만.
 *   circular-without-round    원형·pill 반경(50% · ≥999px · --radius-full)인데 같은 규칙에 `corner-shape: round` 가 없고 selector 가 예외 목록에도 없다.
 *   corner-shape-outside-ui   `corner-shape` 선언 — DS 의 corner.css 가 유일한 집이다. 소비자는 `round`(원형 예외)만 적을 수 있다.
 *   arbitrary-rounded         TSX 의 `rounded-[…]` · `rounded-(…)` — 허용 임의값은 동심원 `calc(var(--radius-` 로 시작하는 것뿐이다.
 *
 * 순수 함수다 — 파일을 읽지 않는다(패키지는 platform neutral). 소비자가 glob 으로 읽어 `{ path, text }` 로 넘기고 `countByFile` 로 기준선을 만든다.
 * CSS 는 정규식이 아니라 중괄호 깊이를 세는 작은 판독기로 읽는다 — `@media`·`@supports` 안의 규칙도 selector 를 안다.
 */

/** 검사 규칙 넷. */
export type CornerRule = "raw-radius" | "circular-without-round" | "corner-shape-outside-ui" | "arbitrary-rounded";

/** 검사 입력 하나 — 경로(기준선의 키)와 본문. `.css` 는 CSS 판독기가, 나머지(`.ts` · `.tsx` · `.js` …)는 클래스 문자열 판독기가 본다. */
export interface CornerSource {
  /** 저장소 기준 경로 — 기준선(`countByFile`)의 키. */
  readonly path: string;
  /** 파일 본문 원문. */
  readonly text: string;
}

/** 위반 하나 — `path:line` 과 원문 조각, 왜 위반인지. */
export interface CornerFinding {
  /** 어느 규칙인가. */
  readonly rule: CornerRule;
  /** 입력의 `path`. */
  readonly path: string;
  /** 1 기준 줄 번호. */
  readonly line: number;
  /** 위반한 원문 조각 — `border-radius: 4px` · `rounded-[7px]`. */
  readonly text: string;
  /** 왜 위반이고 무엇으로 바꾸는가(영어 — 소비 레포의 실패 메시지에 그대로 실린다). */
  readonly message: string;
}

/** 검사 옵션. */
export interface CornerAuditOptions {
  /** 원형 반경을 원호로 고정하는 selector — DS 의 corner.css 예외 목록이 기본값이다. 여기 있는 selector 의 규칙은 `corner-shape: round` 를 적지 않아도 된다. */
  readonly roundSelectors?: readonly string[];
  /** `corner-shape` 를 값에 관계없이 둘 수 있는 파일(경로 끝 일치) — DS 안에서는 `corner.css` 뿐이고 소비자는 보통 비워 둔다. */
  readonly cornerShapeFiles?: readonly string[];
}

/** DS 의 corner.css 가 원호로 고정하는 selector — `corner.spec` 이 corner.css 원문과 같은지 본다. */
export const DEFAULT_ROUND_SELECTORS: readonly string[] = [".rounded-full", ".ds-scroll-area-thumb", ".switch-track", ".switch-knob", '[data-corner="round"]'];

/** 동심원 임의값의 유일한 허용 형태 — 바깥 토큰에서 패딩을 뺀다. 계수(`--corner-k`)를 따라가므로 양쪽 엔진에서 동심이 유지된다. */
export const CONCENTRIC_PREFIX = "calc(var(--radius-";

const RADIUS_PROP = /^border(?:-(?:top|bottom)-(?:left|right)|-(?:start|end)-(?:start|end))?-radius$/;
/** 토큰 밖 길이 — 0 은 길이가 아니다(캔버스). */
const LENGTH_LITERAL = /(?<![\w.-])(?!0(?:px|%|rem|em)?(?![\d.]))\d*\.?\d+(?:px|%|rem|em)/;
/** 원형·pill — 50% · 999px 이상 · full 토큰. */
const CIRCULAR = /(?<![\w.-])(?:50%|(?:999|9999)px|var\(\s*--radius-full\b)/;
const ARBITRARY_ROUNDED = /\brounded(?:-(?:t|r|b|l|tl|tr|br|bl|s|e|ss|se|es|ee))?-(\[[^\]\n]*\]|\([^)\n]*\))/g;

interface CssDeclaration {
  readonly selector: string;
  readonly prop: string;
  readonly value: string;
  readonly line: number;
  /** 같은 블록의 다른 선언 — «같은 규칙에 corner-shape: round 가 있는가» 를 묻는다. */
  readonly siblings: readonly { readonly prop: string; readonly value: string }[];
}

/** 주석을 같은 길이의 공백으로 덮는다 — 줄 번호가 원본과 같다. */
function blankComments(text: string, lineComments: boolean): string {
  let out = text.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, " "));
  if (lineComments) out = out.replace(/(^|[^:\\])\/\/[^\n]*/g, (m, lead: string) => lead + " ".repeat(m.length - lead.length));
  return out;
}

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

/** 중괄호 깊이를 세며 `selector { prop: value; }` 를 낸다. at-rule 본문(`@media { .a {…} }`)은 안쪽 규칙의 selector 로 읽는다. */
function parseCss(text: string): CssDeclaration[] {
  const code = blankComments(text, false);
  const out: CssDeclaration[] = [];
  const stack: { selector: string; decls: { prop: string; value: string; line: number }[] }[] = [];
  let prelude = "";
  let preludeStart = 0;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i]!;
    if (ch === "{") {
      stack.push({ selector: prelude.trim(), decls: [] });
      prelude = "";
      preludeStart = i + 1;
    } else if (ch === ";" || ch === "}") {
      const top = stack[stack.length - 1];
      const colon = prelude.indexOf(":");
      if (top && colon > 0 && !top.selector.startsWith("@")) {
        top.decls.push({ prop: prelude.slice(0, colon).trim().toLowerCase(), value: prelude.slice(colon + 1).trim(), line: lineOf(code, preludeStart + (prelude.length - prelude.trimStart().length)) });
      }
      prelude = "";
      preludeStart = i + 1;
      if (ch === "}") {
        const block = stack.pop();
        if (block) for (const d of block.decls) out.push({ selector: block.selector, prop: d.prop, value: d.value, line: d.line, siblings: block.decls });
      }
    } else {
      prelude += ch;
    }
  }
  return out;
}

const endsWithAny = (path: string, suffixes: readonly string[]): boolean => suffixes.some(s => path === s || path.endsWith(`/${s}`) || path.endsWith(s));

function auditCss(source: CornerSource, options: Required<CornerAuditOptions>): CornerFinding[] {
  const findings: CornerFinding[] = [];
  const roundSelectors = new Set(options.roundSelectors.map(s => s.replace(/\s+/g, " ").trim()));
  for (const d of parseCss(source.text)) {
    if (d.prop.startsWith("--")) continue; // 토큰 정의는 리터럴이 사는 유일한 자리다
    if (d.prop === "corner-shape") {
      if (d.value !== "round" && !endsWithAny(source.path, options.cornerShapeFiles)) {
        findings.push({ rule: "corner-shape-outside-ui", path: source.path, line: d.line, text: `corner-shape: ${d.value}`, message: "corner-shape is set by the design system's corner.css — outside it only `round` (circular exception) is allowed." });
      }
      continue;
    }
    if (!RADIUS_PROP.test(d.prop)) continue;
    const value = d.value.replace(/\s+/g, " ");
    const concentric = value.startsWith(CONCENTRIC_PREFIX);
    if (!concentric && LENGTH_LITERAL.test(value)) {
      findings.push({ rule: "raw-radius", path: source.path, line: d.line, text: `${d.prop}: ${value}`, message: "Raw radius — use var(--radius-sm|md|lg|xl|full) or the concentric form calc(var(--radius-…) - padding); raw lengths do not follow --corner-k." });
    }
    if (CIRCULAR.test(value)) {
      const roundHere = d.siblings.some(s => s.prop === "corner-shape" && s.value === "round");
      const listed = d.selector.split(",").map(s => s.replace(/\s+/g, " ").trim()).every(s => roundSelectors.has(s));
      if (!roundHere && !listed) {
        findings.push({ rule: "circular-without-round", path: source.path, line: d.line, text: `${d.selector} { ${d.prop}: ${value} }`, message: "Circular radius without `corner-shape: round` — the global squircle rule would flatten the capsule; add it to the same rule or list the selector in roundSelectors." });
      }
    }
  }
  return findings;
}

function auditClasses(source: CornerSource): CornerFinding[] {
  const code = blankComments(source.text, true);
  const findings: CornerFinding[] = [];
  for (const m of code.matchAll(ARBITRARY_ROUNDED)) {
    const inner = m[1]!.slice(1, -1);
    if (inner.startsWith(CONCENTRIC_PREFIX)) continue;
    findings.push({ rule: "arbitrary-rounded", path: source.path, line: lineOf(code, m.index), text: m[0], message: "Arbitrary radius class — use rounded-sm|md|lg|xl|full; the only allowed arbitrary form is the concentric rounded-[calc(var(--radius-…)-…)]." });
  }
  return findings;
}

/** 파일 묶음을 검사해 위반 목록을 낸다 — 경로 → 줄 순. */
export function auditCorners(sources: readonly CornerSource[], options: CornerAuditOptions = {}): CornerFinding[] {
  const resolved: Required<CornerAuditOptions> = { roundSelectors: options.roundSelectors ?? DEFAULT_ROUND_SELECTORS, cornerShapeFiles: options.cornerShapeFiles ?? [] };
  const findings = sources.flatMap(source => (source.path.endsWith(".css") ? auditCss(source, resolved) : auditClasses(source)));
  return findings.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
}

/** 위반을 `파일 → 횟수` 로 — 래칫 기준선의 모양이다(경로 오름차순). 0 인 파일은 없다. */
export function countByFile(findings: readonly CornerFinding[], rule?: CornerRule): Record<string, number> {
  const out: Record<string, number> = {};
  for (const f of findings) if (rule === undefined || f.rule === rule) out[f.path] = (out[f.path] ?? 0) + 1;
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}
