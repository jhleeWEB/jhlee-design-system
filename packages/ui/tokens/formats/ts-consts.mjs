/* sds/ts-consts — `generated/tokens.ts`(kind motion) 와 `generated/ladders.ts`(kind ladders).
 *
 *   MOTION   duration 토큰 가운데 `$extensions.sds.ts` 가 붙은 것 → `{ collapseMs: 200, … }`. B1 의 손 `src/tokens/motion.ts` 와 같아야 하고
 *            (generated-parity.spec), B3 가 그 파일을 이것으로 대체한다.
 *   LADDERS  @theme 사다리의 이름 목록(네임스페이스별). cn.ts 의 twMerge 설정이 손으로 적어 둔 것과 같아야 하고, B3 가 cn.ts 를
 *            이것을 import 하게 바꾼다(혼용 규칙 ⑥). */
import { byOrder, groupBy, HEADER, sds } from "./shared.mjs";

/** `220ms` · `0.14s` → ms 정수. */
function toMs(value) {
  const m = /^(\d+(?:\.\d+)?)(m?s)$/.exec(String(value));
  if (!m) throw new Error(`ts-consts: duration 이 아니다: ${value}`);
  return Math.round(Number(m[1]) * (m[2] === "s" ? 1000 : 1));
}

function motion(dictionary) {
  const tokens = dictionary.allTokens.filter(t => sds(t).ts !== undefined).sort(byOrder);
  const lines = tokens.map(t => `  /** ${t.path.join(".")} — ${t.$value} */\n  ${sds(t).ts}: ${toMs(t.$value)},`);
  return [
    HEADER,
    "/** 시간 상수(ms) — tokens/**.json 의 duration 가운데 `$extensions.sds.ts` 가 붙은 것. CSS 쪽 짝은 같은 토큰에서 나온다. */",
    "export const MOTION = {",
    ...lines,
    "} as const;",
    "",
  ].join("\n");
}

function ladders(dictionary) {
  const theme = dictionary.allTokens.filter(t => sds(t).scope === "theme" && t.path.length >= 2).sort(byOrder);
  const groups = groupBy(theme, t => t.path[0]);
  const lines = [...groups].map(([ns, tokens]) => `  ${ns}: [${tokens.map(t => JSON.stringify(t.path.slice(1).join("-"))).join(", ")}],`);
  return [
    HEADER,
    "/** Tailwind 테마(@theme) 사다리의 역할 이름 — 네임스페이스별, 정본 순. twMerge(cn.ts)가 충돌을 해소하려면 이 이름들을 알아야 한다. */",
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
