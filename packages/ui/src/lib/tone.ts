/* 톤 어휘 — 한 벌(B5, #22).
 *
 * 컴포넌트마다 `tone` 의 키가 조금씩 달랐다(Button accent · Alert ok · Spinner current · DropdownMenuItem default). shadcn 어휘로 통일했다:
 * `neutral | primary | success | warning | destructive | info`. 옛 키를 런타임에서 옮겨 주던 `normalizeTone()` 과 `LegacyTone` 류 타입은
 * 3.0.0 에서 지웠다(#49) — 소비 레포의 옛 키는 ESLint `ds/legacy-tone`(--fix, 프리셋에 실린다)이 자기 표로 바꾼다.
 *
 * 컴포넌트는 자기가 받는 부분집합만 선언한다(Button 은 success 를 모른다). */

/** 통일된 톤 — 순서는 Variants 스토리·매니페스트가 그리는 순서다. */
export const toneValues = ["neutral", "primary", "success", "warning", "destructive", "info"] as const;
/** 통일된 톤 이름. */
export type Tone = (typeof toneValues)[number];
