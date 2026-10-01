/* 옛 이름 → 새 이름 표(B5, #22 → 정적 표 #49) — 소비 레포의 이행 경로(린트 `--fix` 와 코드모드 둘)가 읽는 한 벌.
 *
 * 2.x 까지 이 표는 `legacy.json`(옛 이름 alias 토큰 + 파일 머리 renames)에서 계산했다. 3.0.0 에서 alias 자체(generated/legacy.css · @theme 의
 * 옛 유틸 이름)를 지웠으므로(#49) 정본 JSON 에는 옛 이름이 없다 — 그래도 소비 레포는 옛 이름을 새 이름으로 옮겨야 하므로, 마지막 정본에서
 * 뽑은 표를 **정적으로** 여기 둔다. 표는 더 자라지 않는다(새 개명은 없다 — 있으면 같은 꼴로 더한다).
 *
 *  cssVars        `var(--옛)` → `var(--새)` — 크롬(`--chrome-ink → --chrome-foreground`) · 반경(`--radius-chip → --radius-sm`) ·
 *                 alias 를 둘 수 없던 개명 둘(`--chrome-accent → --chrome-primary` · `--chrome-muted → --chrome-muted-foreground`).
 *  baseVars       옛 base 이름(`--ink` · `--gap` · `--size-gap` · `--color-cool-500` …) → **값이 같은** 새 정본 이름(`--palette-gray-900` …).
 *                 alias 가 값 보존이었으므로 코드모드도 값 보존이다 — 크롬으로 옮길지는 소비 레포가 따로 판단한다(#20 결정).
 *                 값이 리터럴이던 셸 전용 둘(`--inspect-w` · `--topbar-h`)은 새 이름이 없어 싣지 않는다.
 *  colors · radius 옛 유틸 이름(`text-ink → text-foreground` · `rounded-chip → rounded-sm`).
 *  renameSources  colors 가운데 새 이름과 글자가 같은 옛 이름(accent · muted) — 린트 표에는 싣지 않는다(아래 «왜»).
 *
 * build.mjs 가 이것으로 `src/generated/legacy-classes.json`(no-restricted-classes 의 {pattern, fix})을 만들고, scripts/codemod-css-vars.mjs ·
 * codemod-classes.mjs 가 한 번에 바꾼다. 표를 두 곳에 손으로 적으면 하나가 뒤처진다. */

/** @type {Readonly<{ cssVars: Record<string, string>, baseVars: Record<string, string>, colors: Record<string, string>, radius: Record<string, string>, renameSources: string[] }>} */
export const LEGACY_RENAMES = Object.freeze({
  cssVars: {
    "--chrome-bg": "--chrome-background",
    "--chrome-surface": "--chrome-card",
    "--chrome-surface-2": "--chrome-muted",
    "--chrome-surface-3": "--chrome-secondary",
    "--chrome-overlay": "--chrome-popover",
    "--chrome-ink": "--chrome-foreground",
    "--chrome-ink-2": "--chrome-foreground-2",
    "--chrome-disabled": "--chrome-foreground-disabled",
    "--chrome-line": "--chrome-border",
    "--chrome-line-strong": "--chrome-border-strong",
    "--chrome-accent-hover": "--chrome-primary-hover",
    "--chrome-accent-ink": "--chrome-primary-foreground",
    "--chrome-accent-soft": "--chrome-accent",
    "--chrome-accent-track": "--chrome-primary-track",
    "--chrome-focus": "--chrome-ring",
    "--chrome-tooltip-bg": "--chrome-tooltip",
    "--chrome-tooltip-ink": "--chrome-tooltip-foreground",
    "--chrome-ok": "--chrome-success",
    "--chrome-ok-hover": "--chrome-success-hover",
    "--chrome-ok-ink": "--chrome-success-foreground",
    "--chrome-ok-soft": "--chrome-success-soft",
    "--chrome-ok-line": "--chrome-success-line",
    "--chrome-warn": "--chrome-warning",
    "--chrome-warn-hover": "--chrome-warning-hover",
    "--chrome-warn-ink": "--chrome-warning-foreground",
    "--chrome-warn-soft": "--chrome-warning-soft",
    "--chrome-warn-line": "--chrome-warning-line",
    "--chrome-danger": "--chrome-destructive",
    "--chrome-danger-hover": "--chrome-destructive-hover",
    "--chrome-danger-ink": "--chrome-destructive-foreground",
    "--chrome-danger-soft": "--chrome-destructive-soft",
    "--chrome-danger-line": "--chrome-destructive-line",
    "--radius-chip": "--radius-sm",
    "--radius-control": "--radius-md",
    "--radius-card": "--radius-lg",
    "--radius-float": "--radius-lg",
    "--radius-modal": "--radius-xl",
    "--chrome-accent": "--chrome-primary",
    "--chrome-muted": "--chrome-muted-foreground",
  },
  baseVars: {
    "--black": "--palette-gray-900",
    "--dark": "--palette-gray-800",
    "--charcoal": "--palette-gray-700",
    "--mid": "--palette-gray-600",
    "--steel": "--palette-gray-500",
    "--silver": "--palette-gray-400",
    "--light": "--palette-gray-250",
    "--pale": "--palette-gray-150",
    "--offwhite": "--palette-gray-100",
    "--white": "--palette-gray-0",
    "--ink": "--palette-gray-900",
    "--ink-2": "--palette-gray-700",
    "--muted": "--palette-gray-600",
    "--line": "--palette-gray-200",
    "--line-strong": "--palette-gray-300",
    "--bg": "--palette-gray-100",
    "--surface": "--palette-gray-0",
    "--surface-2": "--palette-gray-50",
    "--ok": "--palette-moss-500",
    "--warn": "--palette-amber-500",
    "--danger": "--palette-rust-500",
    "--ok-pale": "--palette-moss-50",
    "--warn-pale": "--palette-amber-50",
    "--danger-pale": "--palette-rust-50",
    "--panel-w": "--size-panel",
    "--gap": "--space-hairline",
    "--sans": "--font-stack-sans",
    "--mono": "--font-stack-mono",
    "--size-gap": "--space-card-gap",
    "--color-cool-0": "--palette-cool-0",
    "--color-cool-25": "--palette-cool-25",
    "--color-cool-50": "--palette-cool-50",
    "--color-cool-100": "--palette-cool-100",
    "--color-cool-150": "--palette-cool-150",
    "--color-cool-200": "--palette-cool-200",
    "--color-cool-300": "--palette-cool-300",
    "--color-cool-400": "--palette-cool-400",
    "--color-cool-500": "--palette-cool-500",
    "--color-cool-600": "--palette-cool-600",
    "--color-cool-700": "--palette-cool-700",
    "--color-cool-800": "--palette-cool-800",
    "--color-cool-900": "--palette-cool-900",
    "--color-cool-950": "--palette-cool-950",
    "--color-azure-50": "--palette-azure-50",
    "--color-azure-100": "--palette-azure-100",
    "--color-azure-200": "--palette-azure-200",
    "--color-azure-500": "--palette-azure-500",
    "--color-azure-600": "--palette-azure-600",
    "--color-azure-700": "--palette-azure-700",
    "--color-mono-0": "--palette-mono-0",
    "--color-mono-50": "--palette-mono-50",
    "--color-mono-100": "--palette-mono-100",
    "--color-mono-200": "--palette-mono-200",
    "--color-mono-300": "--palette-mono-300",
    "--color-mono-400": "--palette-mono-400",
    "--color-mono-500": "--palette-mono-500",
    "--color-mono-600": "--palette-mono-600",
    "--color-mono-700": "--palette-mono-700",
    "--color-mono-800": "--palette-mono-800",
    "--color-mono-900": "--palette-mono-900",
    "--color-mono-950": "--palette-mono-950",
  },
  colors: {
    chrome: "background",
    surface: "card",
    "surface-2": "muted",
    "surface-3": "secondary",
    overlay: "popover",
    ink: "foreground",
    "ink-2": "foreground-2",
    disabled: "foreground-disabled",
    line: "border",
    "line-strong": "border-strong",
    "accent-hover": "primary-hover",
    "accent-ink": "primary-foreground",
    "accent-soft": "accent",
    "accent-track": "primary-track",
    focus: "ring",
    "tooltip-ink": "tooltip-foreground",
    ok: "success",
    "ok-hover": "success-hover",
    "ok-ink": "success-foreground",
    "ok-soft": "success-soft",
    "ok-line": "success-line",
    warn: "warning",
    "warn-hover": "warning-hover",
    "warn-ink": "warning-foreground",
    "warn-soft": "warning-soft",
    "warn-line": "warning-line",
    danger: "destructive",
    "danger-hover": "destructive-hover",
    "danger-ink": "destructive-foreground",
    "danger-soft": "destructive-soft",
    "danger-line": "destructive-line",
    accent: "primary",
    muted: "muted-foreground",
  },
  radius: {
    chip: "sm",
    control: "md",
    card: "lg",
    float: "lg",
    modal: "xl",
  },
  renameSources: ["accent", "muted"],
});

/**
 * 표 전체 — `cssVars` 에 `baseVars` 를 합쳐 CSS 변수 코드모드가 한 번에 쓰게 한다.
 * @returns {{ cssVars: Record<string, string>, colors: Record<string, string>, radius: Record<string, string>, renameSources: string[] }}
 */
export function legacyRenames() {
  return {
    cssVars: { ...LEGACY_RENAMES.baseVars, ...LEGACY_RENAMES.cssVars },
    colors: { ...LEGACY_RENAMES.colors },
    radius: { ...LEGACY_RENAMES.radius },
    renameSources: [...LEGACY_RENAMES.renameSources],
  };
}

/** 색을 받는 Tailwind 유틸 접두 — 이 목록 밖(`w-line` 같은 우연의 일치)은 건드리지 않는다. */
const COLOR_UTILITIES =
  "bg|text|border|border-[trblxyse]|ring|ring-offset|inset-ring|outline|fill|stroke|divide|from|via|to|placeholder|caret|accent|decoration|shadow";
/** 반경 유틸 접두 — 모서리별 변형까지. */
const RADIUS_UTILITIES = "rounded(?:-(?:t|r|b|l|s|e|tl|tr|bl|br|ss|se|es|ee))?";
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  const colorEntries = Object.entries(map.colors).filter(
    ([from]) => !lintSafe || !(from in RENAME_SOURCES(map)),
  );
  const colors = colorEntries.sort(longestFirst).map(([from, to]) => ({
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
const RENAME_SOURCES = (map) =>
  Object.fromEntries(
    Object.keys(map.colors)
      .filter((from) => map.colors[from] !== undefined && map.renameSources.includes(from))
      .map((k) => [k, true]),
  );

/** `better-tailwindcss/no-restricted-classes` 의 `restrict` 항목 — 린트에 안전한 표(renames 제외). */
export const legacyClassRestrictions = (map) => legacyClassRenames(map, { lintSafe: true });
