/* legacy-map.mjs 의 선언 — 스펙(legacy-map.spec)이 import 한다. 규칙 패키지처럼 JS + JSDoc 이 정본이고 이 파일은 tsc 의 눈이다. */
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
export const LEGACY_RENAMES: Readonly<{
  cssVars: Record<string, string>;
  baseVars: Record<string, string>;
  colors: Record<string, string>;
  radius: Record<string, string>;
  renameSources: string[];
}>;
export function legacyRenames(): LegacyRenameMap;
export function legacyClassRenames(
  map: LegacyRenameMap,
  options?: { lintSafe?: boolean },
): ClassRestriction[];
export function legacyClassRestrictions(map: LegacyRenameMap): ClassRestriction[];
