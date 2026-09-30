/* 모서리 검사기 — 소비 레포의 `__arch__` 래칫이 부른다(계획 §3.5-5, #26 → #36).
 *
 * 모서리는 일반 `border-radius` 원호 사다리(6/8/12/16px)다 — 스쿼클(`corner-shape`)은 2026-09-30 사용자 결정으로 폐기했다(#36, Chromium 에서
 * 1px 테두리가 모서리에서 두꺼워 보임). 소비자가 지킬 것은 셋이다:
 *   raw-radius       border-radius 에 토큰 밖 길이 — `4px` · `50%` · `999px`. 토큰(`var(--radius-*)`)이나 동심원 `calc(var(--radius-…) - …)` 만.
 *   corner-shape     `corner-shape` 선언 — 값에 관계없이 금지. 폐기한 스쿼클이 앱 CSS 로 되살아나지 않게 한다.
 *   arbitrary-rounded TSX 의 `rounded-[…]` · `rounded-(…)` — 허용 임의값은 동심원 `calc(var(--radius-` 로 시작하는 것뿐이다.
 *
 * 순수 함수다 — 파일을 읽지 않는다(패키지는 platform neutral). 소비자가 glob 으로 읽어 `{ path, text }` 로 넘기고 `countByFile` 로 기준선을 만든다.
 * CSS 는 정규식이 아니라 중괄호 깊이를 세는 작은 판독기로 읽는다 — `@media`·`@supports` 안의 규칙도 selector 를 안다.
 */

/** 검사 규칙 넷. */
export type CornerRule = "raw-radius" | "corner-shape" | "arbitrary-rounded";

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

/** 동심원 임의값의 유일한 허용 형태 — 바깥 토큰에서 패딩을 뺀다. 바깥 토큰이 바뀌면 안쪽이 따라간다. */
export const CONCENTRIC_PREFIX = "calc(var(--radius-";

const RADIUS_PROP = /^border(?:-(?:top|bottom)-(?:left|right)|-(?:start|end)-(?:start|end))?-radius$/;
/** 토큰 밖 길이 — 0 은 길이가 아니다(캔버스). */
const LENGTH_LITERAL = /(?<![\w.-])(?!0(?:px|%|rem|em)?(?![\d.]))\d*\.?\d+(?:px|%|rem|em)/;
const ARBITRARY_ROUNDED =
  /\brounded(?:-(?:t|r|b|l|tl|tr|br|bl|s|e|ss|se|es|ee))?-(\[[^\]\n]*\]|\([^)\n]*\))/g;

interface CssDeclaration {
  readonly selector: string;
  readonly prop: string;
  readonly value: string;
  readonly line: number;
}

/** 주석을 같은 길이의 공백으로 덮는다 — 줄 번호가 원본과 같다. */
function blankComments(text: string, lineComments: boolean): string {
  let out = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  if (lineComments)
    out = out.replace(
      /(^|[^:\\])\/\/[^\n]*/g,
      (m, lead: string) => lead + " ".repeat(m.length - lead.length),
    );
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
        top.decls.push({
          prop: prelude.slice(0, colon).trim().toLowerCase(),
          value: prelude.slice(colon + 1).trim(),
          line: lineOf(code, preludeStart + (prelude.length - prelude.trimStart().length)),
        });
      }
      prelude = "";
      preludeStart = i + 1;
      if (ch === "}") {
        const block = stack.pop();
        if (block)
          for (const d of block.decls)
            out.push({ selector: block.selector, prop: d.prop, value: d.value, line: d.line });
      }
    } else {
      prelude += ch;
    }
  }
  return out;
}

function auditCss(source: CornerSource): CornerFinding[] {
  const findings: CornerFinding[] = [];
  for (const d of parseCss(source.text)) {
    if (d.prop.startsWith("--")) continue; // 토큰 정의는 리터럴이 사는 유일한 자리다
    if (d.prop === "corner-shape") {
      findings.push({
        rule: "corner-shape",
        path: source.path,
        line: d.line,
        text: `corner-shape: ${d.value}`,
        message:
          "corner-shape is not used — the design system dropped squircle corners (1px borders look thicker at the corner in Chromium); use plain border-radius tokens.",
      });
      continue;
    }
    if (!RADIUS_PROP.test(d.prop)) continue;
    const value = d.value.replace(/\s+/g, " ");
    if (!value.startsWith(CONCENTRIC_PREFIX) && LENGTH_LITERAL.test(value)) {
      findings.push({
        rule: "raw-radius",
        path: source.path,
        line: d.line,
        text: `${d.prop}: ${value}`,
        message:
          "Raw radius — use var(--radius-sm|md|lg|xl|full) or the concentric form calc(var(--radius-…) - padding).",
      });
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
    findings.push({
      rule: "arbitrary-rounded",
      path: source.path,
      line: lineOf(code, m.index),
      text: m[0],
      message:
        "Arbitrary radius class — use rounded-sm|md|lg|xl|full; the only allowed arbitrary form is the concentric rounded-[calc(var(--radius-…)-…)].",
    });
  }
  return findings;
}

/** 파일 묶음을 검사해 위반 목록을 낸다 — 경로 → 줄 순. */
export function auditCorners(sources: readonly CornerSource[]): CornerFinding[] {
  const findings = sources.flatMap((source) =>
    source.path.endsWith(".css") ? auditCss(source) : auditClasses(source),
  );
  return findings.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
}

/** 위반을 `파일 → 횟수` 로 — 래칫 기준선의 모양이다(경로 오름차순). 0 인 파일은 없다. */
export function countByFile(findings: readonly CornerFinding[], rule?: CornerRule): Record<string, number> {
  const out: Record<string, number> = {};
  for (const f of findings) if (rule === undefined || f.rule === rule) out[f.path] = (out[f.path] ?? 0) + 1;
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}
