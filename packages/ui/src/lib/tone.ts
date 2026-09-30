/* 톤 어휘 — 한 벌(B5, #22).
 *
 * 컴포넌트마다 `tone` 의 키가 조금씩 달랐다(Button accent · Alert ok · Spinner current · DropdownMenuItem default). shadcn 어휘로 통일한다:
 * `neutral | primary | success | warning | destructive | info`. 옛 키는 한 마이너 동안 `normalizeTone()` 이 새 키로 옮기고 유니언은
 * `@deprecated` 합집합으로 남는다 — 다음 마이너에 `feat!:` 로 지운다. 소스의 옛 키는 ESLint `ds/legacy-tone`(--fix)이 잡는다.
 *
 * 컴포넌트는 자기가 받는 부분집합만 선언한다(Button 은 success 를 모른다). `LegacyToneOf<T>` 가 그 부분집합에 대응하는 옛 키만 계산하므로
 * `<Button tone="ok">` 는 여전히 타입 오류다 — 옛 키를 받아 주는 것이 옛 오류까지 받아 주는 것이 되면 안 된다. */

/** 통일된 톤 — 순서는 Variants 스토리·매니페스트가 그리는 순서다. */
export const toneValues = ["neutral", "primary", "success", "warning", "destructive", "info"] as const;
/** 통일된 톤 이름. */
export type Tone = (typeof toneValues)[number];

const LEGACY_TONES = {
  accent: "primary",
  ok: "success",
  warn: "warning",
  danger: "destructive",
  default: "neutral",
  current: "neutral",
} as const satisfies Record<string, Tone>;

/**
 * 옛 톤 키.
 * @deprecated 다음 마이너에서 제거 — `accent → primary` · `ok → success` · `warn → warning` · `danger → destructive` · `default`/`current → neutral`
 */
export type LegacyTone = keyof typeof LEGACY_TONES;

/** `T` 에 대응하는 옛 키만 — `LegacyToneOf<"neutral" | "primary" | "destructive">` 는 `"accent" | "danger" | "default" | "current"` 다. */
export type LegacyToneOf<T extends string> = { [K in LegacyTone]: (typeof LEGACY_TONES)[K] extends T ? K : never }[LegacyTone];

/** 컴포넌트 prop 이 받는 것 — 새 키 `T` 와 그에 대응하는 옛 키. */
export type ToneInput<T extends string> = T | LegacyToneOf<T>;

/**
 * 옛 키를 새 키로. `null`/`undefined` 는 그대로 `undefined`(cva 의 defaultVariants 가 맡는다).
 * 반환 타입이 `Exclude<T, LegacyTone>` 인 이유: `T` 는 prop 의 합집합(새 키 + 옛 키)으로 추론되고, 결과에서 옛 키만 벗겨 내면 컴포넌트의
 * 부분집합이 남는다 — `ToneInput<T>` 로 받으면 TS 가 `T` 를 합집합 전체로 추론해 옛 키가 결과 타입에 남았다(실측).
 */
export function normalizeTone<T extends string>(tone: T | null | undefined): Exclude<T, LegacyTone> | undefined {
  if (tone === null || tone === undefined) return undefined;
  return (Object.hasOwn(LEGACY_TONES, tone) ? LEGACY_TONES[tone as LegacyTone] : tone) as Exclude<T, LegacyTone>;
}
