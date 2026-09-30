/*
 * `cn.ts` 가 twMerge 에 적어 둔 사다리를 읽는 도우미 — `ladders.spec`(손 CSS 와 대조)과 `generated-parity.spec`(생성물 `ladders.ts` 와 대조)이
 * 같은 방식으로 읽어야 두 대조가 같은 것을 말한다. cn.ts 는 이 사다리를 데이터로 export 하지 않는다(B3 가 생성물 `ladders.ts` 를 import 하게 바꾼다) —
 * 그때까지는 원문을 정규식으로 읽는다.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cn = readFileSync(fileURLToPath(new URL("../../cn.ts", import.meta.url)), "utf8");

const unquote = (list: string): string[] =>
  list
    .split(",")
    .map(s => s.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

/** `cn.ts` 의 `override.theme.<key>: [...]` — 이름 오름차순. */
export function cnLadder(key: string): string[] | null {
  const m = cn.match(new RegExp(`\\b${key}: \\[([^\\]]*)\\]`));
  return m ? unquote(m[1]!).sort() : null;
}

/** `cn.ts` 의 `extend.classGroups.<key>: [{ <key>: [...] }]` 를 유틸리티 이름(`h-ctl`)으로 편다 — 이름 오름차순. */
export function cnClassGroup(key: string): string[] | null {
  const m = cn.match(new RegExp(`\\b${key}: \\[\\{ ${key}: \\[([^\\]]*)\\] \\}\\]`));
  return m ? unquote(m[1]!).map(s => `${key}-${s}`).sort() : null;
}
