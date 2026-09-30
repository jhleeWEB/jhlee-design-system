/* 옛 이름 → 새 이름 표(B5, #22) — legacy.json 이 세 출력의 원천이라는 약속의 공통 계산.
 *
 * 표의 출처는 둘이다: ① legacy.json 의 alias 토큰 가운데 값이 참조 하나(`{chrome.card}`)인 것 — 옛 경로가 새 경로를 가리키므로 «개명» 이고,
 * ② 파일 머리 `renames` — 옛 이름이 새 정본의 다른 토큰과 글자가 같아 alias 토큰을 둘 수 없는 개명(chrome.accent · chrome.muted).
 * build.mjs 가 이것으로 `src/generated/legacy-classes.json`(유틸 코드모드 = no-restricted-classes 의 {pattern, fix})을 만들고,
 * scripts/codemod-css-vars.mjs 가 `var(--chrome-*)`·`var(--radius-*)` 를 바꾼다. 표를 두 곳에 손으로 적으면 하나가 뒤처진다. */
import { LEGACY_FILE } from "./schema.ts";

const singleRef = value => (typeof value === "string" && /^\{[a-z0-9.-]+\}$/.test(value) ? value.slice(1, -1) : null);
const cssName = path => `--${path.split(".").join("-")}`;

/**
 * @param {readonly import("./schema.ts").FlatToken[]} tokens  validateTokenSources 의 tokens
 * @param {Readonly<Record<string, string>>} renames            validateTokenSources 의 renames
 * @returns {{ cssVars: Record<string, string>, colors: Record<string, string>, radius: Record<string, string>, renameSources: string[] }}
 *   cssVars `--chrome-ink → --chrome-foreground`(radius 포함) · colors 유틸 색 이름 `ink → foreground` · radius `chip → sm` ·
 *   renameSources renames 에서 온 유틸 이름(accent · muted — 린트 표에는 싣지 않는다)
 */
export function legacyRenames(tokens, renames) {
  const cssVars = {};
  const colors = {};
  const radius = {};
  for (const t of tokens) {
    if (t.file !== LEGACY_FILE) continue;
    const ref = singleRef(t.value);
    if (!ref) continue;
    const path = t.path.join(".");
    if (t.path[0] === "chrome" && ref.startsWith("chrome.")) cssVars[cssName(path)] = cssName(ref);
    else if (t.path[0] === "radius" && ref.startsWith("radius.")) {
      cssVars[cssName(path)] = cssName(ref);
      radius[t.path.slice(1).join("-")] = ref.slice("radius.".length);
    } else if (t.path[0] === "color" && t.sds.scope === "theme-inline" && ref.startsWith("chrome.")) {
      colors[t.path.slice(1).join("-")] = ref.slice("chrome.".length);
    }
  }
  const renameSources = [];
  for (const [from, to] of Object.entries(renames)) {
    cssVars[cssName(from)] = cssName(to);
    if (from.startsWith("chrome.") && to.startsWith("chrome.")) {
      colors[from.slice("chrome.".length)] = to.slice("chrome.".length);
      renameSources.push(from.slice("chrome.".length));
    }
  }
  return { cssVars, colors, radius, renameSources };
}

/** 색을 받는 Tailwind 유틸 접두 — 이 목록 밖(`w-line` 같은 우연의 일치)은 건드리지 않는다. */
const COLOR_UTILITIES = "bg|text|border|border-[trblxyse]|ring|ring-offset|inset-ring|outline|fill|stroke|divide|from|via|to|placeholder|caret|accent|decoration|shadow";
/** 반경 유틸 접두 — 모서리별 변형까지. */
const RADIUS_UTILITIES = "rounded(?:-(?:t|r|b|l|s|e|tl|tr|bl|br|ss|se|es|ee))?";
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** 긴 이름 우선 — `accent-soft` 가 `accent` 보다 먼저 매치되게(패턴이 앵커돼 있어도 순서를 읽는 사람에게 분명하다). */
const longestFirst = ([a], [b]) => b.length - a.length || a.localeCompare(b);

/**
 * 옛 유틸 이름 → 새 이름의 정규식 표 — 한 항목이 클래스 하나를 통째로 맞춘다. `$1` 은 variant 접두(`hover:`), `$2` 는 유틸 접두, `$3` 은 불투명도(`/40`).
 * @param {ReturnType<typeof legacyRenames>} map
 * @param {{ lintSafe?: boolean }} [options]  lintSafe 면 renames(accent · muted)를 뺀다 — 아래 «왜».
 *
 * 왜 두 벌인가: ESLint 의 `--fix` 는 고친 뒤 다시 검사하기를 반복한다(최대 10회). `bg-surface-2 → bg-muted` 로 고친 클래스가 다음 회에
 * `muted → muted-foreground` 규칙에 다시 걸려 `bg-muted-foreground` 가 됐다(첫 코드모드 실행에서 실제로 났다). 새 이름과 글자가 같은
 * 옛 이름(renames)은 «이미 새 이름인 것» 과 구분할 수 없으므로 린트에는 실을 수 없다 — 그 둘은 한 번만 도는 scripts/codemod-classes.mjs 의
 * 몫이고(lintSafe: false), 린트 표(lintSafe: true)는 목적지가 다시 출발지가 되지 않는 이름만 든다(legacy-map.spec 이 그 성질을 검사한다).
 */
export function legacyClassRenames(map, { lintSafe = false } = {}) {
  const colorEntries = Object.entries(map.colors).filter(([from]) => !lintSafe || !(from in RENAME_SOURCES(map)));
  const colors = colorEntries
    .sort(longestFirst)
    .map(([from, to]) => ({
      pattern: `^((?:[^\\s:]+:)*)(${COLOR_UTILITIES})-${escape(from)}((?:/\\d+)?)$`,
      fix: `$1$2-${to}$3`,
      message: `\`${from}\` was renamed to \`${to}\` — shadcn vocabulary (#22); run eslint --fix.`,
    }));
  const radius = Object.entries(map.radius)
    .sort(longestFirst)
    .map(([from, to]) => ({
      pattern: `^((?:[^\\s:]+:)*)(${RADIUS_UTILITIES})-${escape(from)}$`,
      fix: `$1$2-${to}`,
      message: `\`rounded-${from}\` was renamed to \`rounded-${to}\` — radius is sm/md/lg/xl (#22); run eslint --fix.`,
    }));
  return [...colors, ...radius];
}

/** renames 에서 온 유틸 이름(accent · muted) — legacyRenames 는 alias 토큰과 renames 를 합쳐 주므로 여기서 다시 가른다. */
const RENAME_SOURCES = map => Object.fromEntries(Object.keys(map.colors).filter(from => map.colors[from] !== undefined && map.renameSources.includes(from)).map(k => [k, true]));

/** `better-tailwindcss/no-restricted-classes` 의 `restrict` 항목 — 린트에 안전한 표(renames 제외). */
export const legacyClassRestrictions = map => legacyClassRenames(map, { lintSafe: true });
