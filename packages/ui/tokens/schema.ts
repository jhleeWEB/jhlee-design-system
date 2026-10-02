/*
 * DTCG 토큰 정본의 스키마(계획 §2.2 · §2.4 2층 «스키마», #15).
 *
 * `tokens/**\/*.json` 은 사람이 편집하는 유일한 곳이고, 여기서 틀린 것은 생성물을 거쳐 소비자 화면에 **조용히** 도착한다 — 정의 없는
 * alias 는 브라우저가 속성을 무효로 만들어 민짜로 렌더되고, 다크에 빠진 크롬 토큰은 라이트 색으로 남는다. 그래서 파일 모양(zod)과
 * 파일 사이의 약속(alias 존재 · chrome 은 light/dark 둘 다 · canvas 는 light 만 · 옛 이름 파일 legacy.json 은 존재가 곧 실패)을
 * 생성 전에 검사한다. `build.mjs` 가 매번 부르고
 * `schema.spec` 이 실제 정본과 가짜 입력으로 검출기를 증명한다.
 *
 * Node 가 직접 실행한다(build.mjs 가 `./schema.ts` 를 import — Node 24 의 type stripping). 그래서 지워지는 문법만 쓴다:
 * enum · namespace · 매개변수 프로퍼티 없음, 타입은 `import type`/`export type`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { z } from "zod";

/** 토큰이 어느 생성물의 어느 블록으로 나가는가 — 파일 머리의 `$extensions.sds.scope` 가 정하고 그룹·토큰이 물려받거나 덮는다(dimension.json 의 size 그룹처럼). */
export const SCOPES = ["root", "chrome", "theme", "theme-inline"] as const;
/** 스코프 이름. */
export type Scope = (typeof SCOPES)[number];

/** 허용하는 `$type`. `animation` 은 DTCG 에 없는 확장이다 — Tailwind `--animate-*` 의 «name duration easing» 한 줄을 그대로 든다.
 * `keyword` 도 확장이다 — `corner.shape` 의 `round` 처럼 CSS 키워드 하나가 값인 토큰(#26; 스쿼클 폐기 뒤에도 호환 alias 로 남는다, #36). */
export const TYPES = [
  "color",
  "dimension",
  "duration",
  "cubicBezier",
  "fontFamily",
  "number",
  "shadow",
  "typography",
  "animation",
  "keyword",
] as const;
/** `$type` 이름. */
export type TokenType = (typeof TYPES)[number];

/** 다크는 이 파일 하나뿐이다 — 생성기가 source 가 아니라 options 로 읽는다(같은 키 이중 정의 충돌 회피). */
export const DARK_FILE = "semantic/chrome.dark.json";
/** 크롬 라이트 — `chrome.*` 는 이 파일과 DARK_FILE 에만 산다. */
export const CHROME_LIGHT_FILE = "semantic/chrome.light.json";
/** 캔버스 — 다크 파일이 없다는 것이 곧 계약이다. */
export const CANVAS_FILE = "semantic/canvas.json";

/** 옛 이름 alias 가 살던 파일 — 3.0.0 에서 지웠다(#49). 다시 생기면 실패다: 옛 이름의 이행은 legacy-map.mjs 의 정적 표(린트 · 코드모드)가 맡는다. */
export const REMOVED_LEGACY_FILE = "legacy.json";

/** 생성물 순서 — 층이 낮은 것부터. 같은 층 안에서는 경로 오름차순. */
const LAYER_ORDER = ["primitive/", "semantic/", "component/"] as const;

const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REF = /^\{[a-z0-9.-]+\}$/;
const REF_ANYWHERE = /\{([a-z0-9.-]+)\}/g;
const TS_IDENT = /^[a-z][A-Za-z0-9]*Ms$/;
const META_KEYS = new Set(["$description", "$type", "$extensions", "$value", "$deprecated"]);

/** 생성 `@utility` — 그룹에 붙이면 안의 토큰마다 `@utility <prefix>-<이름> { <property>: var(--…); }` 가 나온다(혼용 규칙 ⑤ «@utility 는 생성»). */
const utilitySchema = z.strictObject({
  prefix: z.string().regex(NAME, "prefix 는 kebab-case"),
  /** 여러 개면 전부 같은 var() 를 받는다 — Tailwind 의 duration-* 가 `--tw-duration` 과 `transition-duration` 둘을 쓰는 모양. */
  properties: z.array(z.string().min(1)).min(1),
});

const sdsSchema = z.strictObject({
  scope: z.enum(SCOPES).optional(),
  /** 그룹에만 — `--<ns>-*: initial` 로 Tailwind 기본 사다리를 지운다(혼용 규칙 ③·④). */
  reset: z.boolean().optional(),
  /** 그룹에만 — 안의 토큰마다 생성 `@utility`(z-* · duration-*). Tailwind 네임스페이스가 아닌 값을 유틸리티로 내는 유일한 길이다. */
  utility: utilitySchema.optional(),
  /** 토큰에만 — `generated/tokens.ts` 의 `MOTION` 키. duration 만. */
  ts: z.string().regex(TS_IDENT, "MOTION 키는 lowerCamel + Ms 접미(예: collapseMs)").optional(),
  /** 토큰에만 — `@media (prefers-reduced-motion: reduce)` 에서의 값. */
  reducedMotion: z.string().optional(),
});
const extensionsSchema = z.looseObject({ sds: sdsSchema.optional() });

const dimension = z
  .string()
  .regex(
    /^(?:\{[a-z0-9.-]+\}|0|-?\d+(?:\.\d+)?(?:px|em|rem))$/,
    "dimension 은 0 · [-]<n>px|em|rem · {alias}",
  );
/**
 * 글자 줄 높이 — **px 만** 받는다(#82). DTCG 는 typography 의 lineHeight 를 비율(number)로 정하지만 이 시스템은 px 로 적는다: 비율은 크기와 곱해
 * 13 × 1.55 = 20.15px 같은 소수 px 를 냈고, 글자 상자가 픽셀 격자에서 미끄러져 같은 줄의 아이콘 · 테두리와 반 픽셀씩 어긋났다. 짝수인지는
 * `even-dimensions.spec` 이 생성물에서 본다 — 여기서는 «비율이 다시 들어오지 않는다» 만 막는다. 생성기(formats/shared.mjs)는 값을 그대로 흘린다.
 */
const LINE_HEIGHT_PX = "lineHeight 는 <n>px — 비율(number)은 소수 px 를 낸다(#82)";
const lineHeight = z.string({ error: LINE_HEIGHT_PX }).regex(/^\d+(?:\.\d+)?px$/, LINE_HEIGHT_PX);

const valueSchemas: Readonly<Record<TokenType, z.ZodType>> = {
  color: z
    .string()
    .refine(
      (v) =>
        REF.test(v) ||
        /^#[0-9a-f]{6}$/.test(v) ||
        /^rgb\(\d+ \d+ \d+ \/ \d*\.?\d+\)$/.test(v) ||
        v === "transparent" ||
        v === "currentColor",
      {
        message: "color 는 #rrggbb(소문자) · rgb(r g b / a) · transparent · currentColor · {alias}",
      },
    ),
  dimension,
  duration: z.string().regex(/^(?:\{[a-z0-9.-]+\}|\d+(?:\.\d+)?m?s)$/, "duration 은 <n>ms|s · {alias}"),
  keyword: z.string().regex(/^[a-z][a-z-]*$/, "keyword 는 소문자 CSS 키워드 하나(round)"),
  cubicBezier: z.union([z.tuple([z.number(), z.number(), z.number(), z.number()]), z.string().regex(REF)]),
  fontFamily: z.string().min(1),
  number: z.number(),
  shadow: z.string().min(1),
  typography: z.strictObject({ fontSize: dimension, lineHeight }),
  animation: z.string().min(1),
};

/** `$extensions.sds` 의 모양. */
export type SdsExtension = z.infer<typeof sdsSchema>;
/** 토큰 값 — `$type` 이 정한다. */
export type TokenValue =
  string | number | readonly number[] | { readonly fontSize: string; readonly lineHeight: string };

/** 트리를 편 토큰 하나 — 생성기와 스펙이 읽는 형태. */
export interface FlatToken {
  readonly path: readonly string[];
  readonly file: string;
  readonly type: TokenType;
  readonly value: TokenValue;
  /** 파일·그룹에서 물려받은 것 위에 토큰 자신의 것을 얹은 결과. `scope` 는 늘 있다. */
  readonly sds: SdsExtension & { readonly scope: Scope };
  /** 층 순서(primitive → semantic → component) → 파일 → 선언 순. 생성물이 이 순서를 지킨다. */
  readonly order: number;
  readonly description?: string;
  readonly deprecated?: boolean | string;
}

/** 상대 경로(`semantic/canvas.json`) → 파싱한 JSON. */
export type TokenSources = Readonly<Record<string, unknown>>;

/** 검사 결과 — errors 가 비어야 tokens 를 믿는다. `dark` 는 DARK_FILE 의 토큰만 따로. */
export interface ValidationResult {
  readonly errors: readonly string[];
  readonly tokens: readonly FlatToken[];
  readonly dark: readonly FlatToken[];
}

/** 층 → 파일 순으로 정렬한 경로. */
export function sortSourcePaths(paths: readonly string[]): string[] {
  const rank = (p: string): number => {
    const i = LAYER_ORDER.findIndex((prefix) => p === prefix || p.startsWith(prefix));
    return i === -1 ? LAYER_ORDER.length : i;
  };
  return [...paths].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

/** `dir` 아래 모든 `*.json` 을 읽는다 — 키는 POSIX 상대 경로. */
export function readTokenSources(dir: string): TokenSources {
  const out: Record<string, unknown> = {};
  const walk = (d: string): void => {
    for (const name of readdirSync(d).sort()) {
      if (name.startsWith(".")) continue;
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".json"))
        out[relative(dir, full).split(sep).join("/")] = JSON.parse(readFileSync(full, "utf8"));
    }
  };
  walk(dir);
  return out;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** 문자열 값 안의 `{a.b}` 참조 경로들. */
export function referencesIn(value: TokenValue): string[] {
  if (typeof value !== "string") return [];
  return [...value.matchAll(REF_ANYWHERE)].map((m) => m[1]!);
}

interface Inherited {
  readonly type: TokenType | undefined;
  readonly sds: SdsExtension;
  /** 그룹의 `$deprecated` 는 안의 토큰이 물려받는다 — 파일 머리에 한 번 적으면 된다. */
  readonly deprecated: boolean | string | undefined;
}

function walkFile(
  file: string,
  root: unknown,
  errors: string[],
  out: FlatToken[],
  counter: { n: number },
): void {
  if (!isObject(root)) {
    errors.push(`${file}: 최상위는 객체여야 한다`);
    return;
  }
  const rootExt = extensionsSchema.safeParse(root.$extensions ?? {});
  const scope = rootExt.success ? rootExt.data.sds?.scope : undefined;
  if (!scope) errors.push(`${file}: 파일 머리에 $extensions.sds.scope 가 있어야 한다(${SCOPES.join(" | ")})`);

  const visit = (node: Record<string, unknown>, path: readonly string[], inherited: Inherited): void => {
    const where = `${file} ${path.join(".") || "(root)"}`;
    for (const key of Object.keys(node)) {
      if (key.startsWith("$")) {
        if (!META_KEYS.has(key)) errors.push(`${where}: 알 수 없는 메타 키 ${key}`);
      } else if (!NAME.test(key))
        errors.push(`${where}: 이름 «${key}» 은 kebab-case(소문자·숫자·하이픈)여야 한다`);
    }
    if (node.$type !== undefined && !TYPES.includes(node.$type as TokenType))
      errors.push(`${where}: $type «${String(node.$type)}» 은 ${TYPES.join(" | ")} 가운데 하나여야 한다`);
    const type = TYPES.includes(node.$type as TokenType) ? (node.$type as TokenType) : inherited.type;
    const ext = extensionsSchema.safeParse(node.$extensions ?? {});
    if (!ext.success)
      errors.push(
        `${where}: $extensions — ${ext.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    const own: SdsExtension = ext.success ? (ext.data.sds ?? {}) : {};
    const isToken = "$value" in node;
    if (
      node.$deprecated !== undefined &&
      typeof node.$deprecated !== "boolean" &&
      typeof node.$deprecated !== "string"
    )
      errors.push(`${where}: $deprecated 는 boolean 또는 문자열`);
    const deprecated =
      node.$deprecated !== undefined ? (node.$deprecated as boolean | string) : inherited.deprecated;

    if (isToken) {
      if (path.length === 0) errors.push(`${where}: 파일 머리는 토큰일 수 없다`);
      if (own.reset !== undefined) errors.push(`${where}: reset 은 그룹에만 둔다`);
      if (own.utility !== undefined) errors.push(`${where}: utility 는 그룹에만 둔다`);
      if (!type) errors.push(`${where}: $type 이 없다(자기 것도, 물려받은 것도)`);
      const sds = { ...inherited.sds, ...own };
      if (type) {
        const parsed = valueSchemas[type].safeParse(node.$value);
        if (!parsed.success)
          errors.push(`${where}: ${type} 값 — ${parsed.error.issues.map((i) => i.message).join("; ")}`);
        if (sds.ts !== undefined && type !== "duration")
          errors.push(`${where}: sds.ts 는 duration 에만 붙는다`);
        if (sds.reducedMotion !== undefined && type !== "duration" && type !== "animation")
          errors.push(`${where}: sds.reducedMotion 은 duration·animation 에만 붙는다`);
      }
      if (sds.reset && sds.scope !== "theme" && sds.scope !== "theme-inline")
        errors.push(`${where}: reset 은 theme · theme-inline 스코프에서만 뜻이 있다`);
      if (node.$description !== undefined && typeof node.$description !== "string")
        errors.push(`${where}: $description 은 문자열`);
      for (const key of Object.keys(node))
        if (!key.startsWith("$")) errors.push(`${where}: 토큰 안에 자식 «${key}» 을 둘 수 없다`);
      out.push({
        path,
        file,
        type: type ?? "number",
        value: node.$value as TokenValue,
        sds: { ...sds, scope: sds.scope ?? "root" },
        order: counter.n++,
        ...(typeof node.$description === "string" ? { description: node.$description } : {}),
        ...(deprecated !== undefined ? { deprecated } : {}),
      });
      return;
    }

    if (own.ts !== undefined || own.reducedMotion !== undefined)
      errors.push(`${where}: ts · reducedMotion 은 토큰에만 둔다`);
    const next: Inherited = { type, sds: { ...inherited.sds, ...own }, deprecated };
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith("$")) continue;
      if (!isObject(child)) {
        errors.push(`${where}: «${key}» 는 그룹이나 토큰(객체)이어야 한다`);
        continue;
      }
      visit(child, [...path, key], next);
    }
  };
  visit(root, [], { type: undefined, sds: scope ? { scope } : {}, deprecated: undefined });
}

/**
 * 정본 전체를 검사한다. 파일 모양(zod) → 파일 사이 약속(중복 · alias 존재 · 순환 · chrome/canvas 구조) 순.
 * 실패해도 던지지 않는다 — 스펙이 메시지를 읽고, build.mjs 가 모아서 낸다.
 */
export function validateTokenSources(files: TokenSources): ValidationResult {
  const errors: string[] = [];
  const light: FlatToken[] = [];
  const dark: FlatToken[] = [];
  const counter = { n: 0 };

  const paths = sortSourcePaths(Object.keys(files));
  for (const file of paths) {
    if (file === REMOVED_LEGACY_FILE) {
      errors.push(
        `${file}: 옛 이름 alias 는 3.0.0 에서 지웠다(#49) — 옛 이름의 이행은 tokens/legacy-map.mjs 의 정적 표(린트 · 코드모드)가 맡는다`,
      );
      continue;
    }
    if (file.endsWith(".dark.json") && file !== DARK_FILE) {
      errors.push(`${file}: 다크 파일은 ${DARK_FILE} 하나뿐이다 — 캔버스에 다크는 없다(구조가 곧 계약)`);
      continue;
    }
    walkFile(file, files[file], errors, file === DARK_FILE ? dark : light, counter);
  }

  const key = (t: FlatToken): string => t.path.join(".");
  const seen = new Map<string, string>();
  for (const t of light) {
    const k = key(t);
    const prev = seen.get(k);
    if (prev) errors.push(`${t.file}: ${k} 가 ${prev} 에도 있다 — 토큰은 한 파일에서 한 번 정의한다`);
    else seen.set(k, t.file);
  }
  const darkSeen = new Set<string>();
  for (const t of dark) {
    const k = key(t);
    if (darkSeen.has(k)) errors.push(`${t.file}: ${k} 가 두 번 정의됐다`);
    darkSeen.add(k);
  }

  // alias 존재 — 다크의 참조도 라이트 집합에서 푼다(생성물에서 var() 는 한 :root 캐스케이드다).
  for (const t of [...light, ...dark]) {
    for (const ref of referencesIn(t.value))
      if (!seen.has(ref)) errors.push(`${t.file}: ${key(t)} → {${ref}} 정의가 없다`);
  }
  // 순환 — `--a → --b → --a` 는 브라우저가 둘 다 무효로 만든다.
  const byKey = new Map(light.map((t) => [key(t), t] as const));
  const visiting = new Set<string>();
  const done = new Set<string>();
  const cycle = (k: string, trail: readonly string[]): void => {
    if (done.has(k)) return;
    if (visiting.has(k)) {
      errors.push(`순환 참조: ${[...trail, k].join(" → ")}`);
      return;
    }
    visiting.add(k);
    for (const ref of referencesIn(byKey.get(k)?.value ?? "")) if (byKey.has(ref)) cycle(ref, [...trail, k]);
    visiting.delete(k);
    done.add(k);
  };
  for (const k of byKey.keys()) cycle(k, []);

  // chrome — light · dark 둘 다, 같은 집합, 그 두 파일에만.
  const chromeLight = new Set(
    light.filter((t) => t.path[0] === "chrome" && t.file === CHROME_LIGHT_FILE).map(key),
  );
  for (const t of light) {
    if (t.path[0] === "chrome" && t.file !== CHROME_LIGHT_FILE)
      errors.push(`${t.file}: chrome.* 는 ${CHROME_LIGHT_FILE} 에만 둔다`);
    if (t.file === CHROME_LIGHT_FILE && t.path[0] !== "chrome")
      errors.push(`${t.file}: 크롬 파일에 chrome.* 아닌 ${key(t)}`);
    if (t.sds.scope === "chrome" && t.file !== CHROME_LIGHT_FILE)
      errors.push(`${t.file}: chrome 스코프는 크롬 파일만 쓴다`);
    if (t.path[0] === "canvas" && t.file !== CANVAS_FILE)
      errors.push(`${t.file}: canvas.* 는 ${CANVAS_FILE} 에만 둔다`);
    if (t.file === CANVAS_FILE && t.path[0] !== "canvas")
      errors.push(`${t.file}: 캔버스 파일에 canvas.* 아닌 ${key(t)}`);
  }
  if (CHROME_LIGHT_FILE in files && !(DARK_FILE in files))
    errors.push(`${DARK_FILE} 이 없다 — 크롬은 듀얼 테마다`);
  if (DARK_FILE in files && !(CHROME_LIGHT_FILE in files)) errors.push(`${CHROME_LIGHT_FILE} 이 없다`);
  for (const t of dark) {
    if (t.path[0] !== "chrome")
      errors.push(`${DARK_FILE}: 다크는 크롬만 갈린다 — ${key(t)} 는 여기 둘 수 없다`);
    if (t.sds.scope !== "chrome") errors.push(`${DARK_FILE}: 스코프는 chrome 이어야 한다`);
    if (!chromeLight.has(key(t))) errors.push(`${DARK_FILE}: ${key(t)} 가 라이트에 없다`);
  }
  for (const k of chromeLight)
    if (!darkSeen.has(k) && DARK_FILE in files)
      errors.push(`${DARK_FILE}: ${k} 의 다크 값이 없다 — 빠진 토큰은 다크에서 라이트 색으로 남는다`);

  const tsNames = new Map<string, string>();
  for (const t of light) {
    if (t.sds.ts === undefined) continue;
    const prev = tsNames.get(t.sds.ts);
    if (prev) errors.push(`${t.file}: MOTION.${t.sds.ts} 가 ${prev} 에도 있다`);
    else tsNames.set(t.sds.ts, key(t));
  }

  return { errors, tokens: light, dark };
}
