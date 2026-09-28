/** 같은 축척의 SVG·WebGL 도면이 같은 눈금과 축척 막대를 사용하도록 화면 단위 계산을 공유한다. */
export const GRID_TARGET_PX = 24;
export const GRID_MAJOR_EVERY = 5;
export const GRID_MAX_DIVISIONS = 240;

/** 목표 화면 폭 안에 드는 1·2·5 계열 길이를 고른다. 길이는 m, 반환 폭은 CSS px다. */
export function niceScale(metresPerPixel: number, targetPx = 120): { readonly lengthM: number; readonly px: number } {
  if (!(metresPerPixel > 0) || !Number.isFinite(metresPerPixel) || !(targetPx > 0) || !Number.isFinite(targetPx)) return { lengthM: 0, px: 0 };
  const rawM = metresPerPixel * targetPx;
  if (!Number.isFinite(rawM)) return { lengthM: 0, px: 0 };
  const power = 10 ** Math.floor(Math.log10(rawM));
  let lengthM = power;
  for (const multiplier of [1, 2, 5, 10]) {
    const candidate = multiplier * power;
    if (candidate <= rawM) lengthM = candidate;
  }
  return { lengthM, px: lengthM / metresPerPixel };
}

/** 선 수 상한 때문에 눈금을 키울 때에는 내림이 아닌 올림을 써야 화면 끝까지 격자가 닿는다. */
function ladderAtLeast(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  for (const multiplier of [1, 2, 5, 10]) if (multiplier * power >= value) return multiplier * power;
  return 10 * power;
}

/** 외접원 반지름을 주면 회전된 시야도 최대 선 수 안에서 덮는다. 생략하면 시각 간격만 계산한다. */
export function gridPitchM(metresPerPixel: number, halfExtentM = 0): number {
  const safeMpp = Number.isFinite(metresPerPixel) && metresPerPixel > 0 ? metresPerPixel : 1;
  const visual = niceScale(safeMpp, GRID_TARGET_PX).lengthM || 1;
  const coverage = Number.isFinite(halfExtentM) && halfExtentM > 0
    ? ladderAtLeast((2 * halfExtentM) / GRID_MAX_DIVISIONS)
    : 0;
  return Math.max(visual, coverage);
}
