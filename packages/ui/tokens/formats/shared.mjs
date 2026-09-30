/* 세 포맷이 함께 쓰는 것 — 머리 주석 · 값 직렬화 · 블록 조립.
 * 값 직렬화를 Style Dictionary 의 css 변환군에 맡기지 않는 이유: `color/css` 가 tinycolor 로 `rgb(255 255 255 / 0.94)`(공백 구문)를
 * 다시 써 버려 손 CSS 와 글자가 달라진다. 이 생성기의 목표는 «손 CSS 와 해석 맵이 같다» 이므로 값은 그대로 흘려보내고
 * 참조만 `var()` 로 바꾼다(outputReferences). */

/** 모든 생성물 첫 줄 — 사람이 열었을 때 가장 먼저 읽을 한 가지. 시간·해시를 넣지 않는다(재생성이 diff 를 만들면 안 된다). */
export const HEADER = [
  "/* 생성물 — 손으로 고치지 않는다.",
  " * 정본: packages/ui/tokens/ 의 DTCG JSON → tokens/build.mjs · 재생성 `pnpm tokens:build` · 최신성 `pnpm tokens:check` (#15) */",
  "",
].join("\n");

/** 토큰의 `$extensions.sds` — 없으면 빈 객체. */
export const sds = token => token.$extensions?.sds ?? {};

/** 정본 순서(층 → 파일 → 선언). */
export const byOrder = (a, b) => sds(a).order - sds(b).order;

/** `{a.b-c}` → `var(--a-b-c)`. 이름 규칙은 name/sds 변환(path.join("-"))과 같다. */
export const refsToVars = text => text.replace(/\{([a-z0-9.-]+)\}/g, (_, path) => `var(--${path.split(".").join("-")})`);

/** 해석된 값을 CSS 글자로 — cubicBezier 배열만 함수 표기로 바꾼다. */
export function literal(type, value) {
  if (type === "cubicBezier" && Array.isArray(value)) return `cubic-bezier(${value.join(", ")})`;
  return String(value);
}

/**
 * 토큰 하나 → CSS 선언 목록 `[prop, value]`. typography 는 Tailwind 규약대로 둘로 갈라진다(`--text-body` · `--text-body--line-height`).
 * `outputReferences` 면 원문의 `{ref}` 를 `var()` 로 남겨 참조 사슬을 보존한다 — `@theme inline` 이 `var(--chrome-*)` 를 가리켜야 테마 전환이 먹는다.
 */
export function declarations(name, type, original, resolved, outputReferences) {
  if (type === "typography") {
    const v = resolved;
    return [
      [`--${name}`, String(v.fontSize)],
      [`--${name}--line-height`, String(v.lineHeight)],
    ];
  }
  if (outputReferences && typeof original === "string" && /\{[a-z0-9.-]+\}/.test(original)) return [[`--${name}`, refsToVars(original)]];
  return [[`--${name}`, literal(type, resolved)]];
}

/** Style Dictionary 토큰 → 선언 목록. */
export const tokenDeclarations = (token, outputReferences) => declarations(token.name, token.$type, token.original.$value, token.$value, outputReferences);

/** `selector {\n  decl;\n}` — 들여쓰기는 2칸, 중첩(@media 안)은 indent 로. */
export function block(selector, lines, indent = "") {
  // 빈 줄은 들여쓰지 않는다 — 꼬리 공백은 diff 잡음이고 에디터가 지워 버려 `--check` 가 빨개진다.
  return [`${indent}${selector} {`, ...lines.map(l => (l === "" ? "" : `${indent}  ${l}`)), `${indent}}`].join("\n");
}

/** `[prop, value]` → `prop: value;`. */
export const decl = ([prop, value]) => `${prop}: ${value};`;

/** 첫 등장 순으로 묶는다 — Map 은 삽입 순서를 지킨다. */
export function groupBy(items, keyOf) {
  const map = new Map();
  for (const item of items) {
    const k = keyOf(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return map;
}
