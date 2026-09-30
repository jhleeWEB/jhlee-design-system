/* sds/ts-consts — `generated/tokens.ts`(kind motion) 와 `generated/ladders.ts`(kind ladders).
 *
 *   MOTION   duration 토큰 가운데 `$extensions.sds.ts` 가 붙은 것 → `{ fastMs: 100, collapseMs: 200, … }`. Toast·ScrollArea·Tooltip 이 읽고
 *            `src/tokens/motion.ts` 는 이것을 재수출하는 껍데기다(#18). `$deprecated` 토큰은 JSDoc `@deprecated` 로 나간다.
 *   LADDERS  twMerge(cn.ts)가 충돌을 해소하려면 알아야 하는 역할 이름 — @theme 사다리(네임스페이스별)와 생성 @utility 의 이름(layer → z-* ·
 *            duration → duration-*). cn.ts 가 이것을 import 한다(혼용 규칙 ⑥). */
import { byOrder, groupBy, HEADER, sds } from "./shared.mjs";

/** `220ms` · `0.14s` → ms 정수. */
function toMs(value) {
  const m = /^(\d+(?:\.\d+)?)(m?s)$/.exec(String(value));
  if (!m) throw new Error(`ts-consts: duration 이 아니다: ${value}`);
  return Math.round(Number(m[1]) * (m[2] === "s" ? 1000 : 1));
}

/** 토큰의 JSDoc 한 줄 — 경로 · 값, `$deprecated` 면 `@deprecated` 태그. */
function doc(t) {
  const deprecated = t.$deprecated;
  const tag =
    deprecated === undefined || deprecated === false
      ? ""
      : ` @deprecated ${typeof deprecated === "string" ? deprecated : ""}`.trimEnd();
  return `  /** ${t.path.join(".")} — ${t.$value}${tag} */`;
}

function motion(dictionary) {
  const tokens = dictionary.allTokens.filter((t) => sds(t).ts !== undefined).sort(byOrder);
  const lines = tokens.map((t) => `${doc(t)}\n  ${sds(t).ts}: ${toMs(t.$value)},`);
  return [
    HEADER,
    "/** 시간 상수(ms) — tokens/**.json 의 duration 가운데 `$extensions.sds.ts` 가 붙은 것. CSS 쪽 짝(--duration-*)은 같은 토큰에서 나온다. */",
    "export const MOTION = {",
    ...lines,
    "} as const;",
    "",
  ].join("\n");
}

function ladders(dictionary) {
  // @theme 사다리 + 생성 @utility 가 있는 네임스페이스. 후자는 :root 토큰이지만 클래스 이름(z-toast)이 되므로 twMerge 가 알아야 한다.
  const tokens = dictionary.allTokens
    .filter((t) => t.path.length >= 2 && (sds(t).scope === "theme" || sds(t).utility))
    .sort(byOrder);
  const groups = groupBy(tokens, (t) => t.path[0]);
  const lines = [...groups].map(
    ([ns, list]) =>
      `  ${JSON.stringify(ns)}: [${list.map((t) => JSON.stringify(t.path.slice(1).join("-"))).join(", ")}],`,
  );
  return [
    HEADER,
    "/** 역할 이름 사다리 — 네임스페이스별, 정본 순. @theme 의 것(rounded-* · text-* · font-* …)과 생성 @utility 의 것(layer → z-* · duration → duration-*). twMerge(cn.ts)가 충돌을 해소하려면 이 이름들을 알아야 한다. */",
    "export const LADDERS = {",
    ...lines,
    "} as const;",
    "",
  ].join("\n");
}

/** @type {import("style-dictionary/types").Format["format"]} */
export function tsConsts({ dictionary, options }) {
  if (options.kind === "motion") return motion(dictionary);
  if (options.kind === "ladders") return ladders(dictionary);
  throw new Error(`ts-consts: kind 는 motion | ladders — ${options.kind}`);
}
