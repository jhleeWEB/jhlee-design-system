/* legacy-map.mjs 의 선언 — 스펙(legacy-map.spec)이 import 한다. 규칙 패키지처럼 JS + JSDoc 이 정본이고 이 파일은 tsc 의 눈이다. */
import type { FlatToken } from "./schema.ts";

export interface LegacyRenameMap {
  readonly cssVars: Record<string, string>;
  readonly colors: Record<string, string>;
  readonly radius: Record<string, string>;
  readonly renameSources: string[];
}
export interface ClassRestriction {
  readonly pattern: string;
  readonly fix: string;
  readonly message: string;
}
export function legacyRenames(
  tokens: readonly FlatToken[],
  renames: Readonly<Record<string, string>>,
): LegacyRenameMap;
export function legacyClassRenames(
  map: LegacyRenameMap,
  options?: { lintSafe?: boolean },
): ClassRestriction[];
export function legacyClassRestrictions(map: LegacyRenameMap): ClassRestriction[];
