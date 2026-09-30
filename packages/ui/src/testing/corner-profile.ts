/* 픽셀 프로파일 — 렌더된 모서리가 원호인지 초타원(스쿼클)인지 래스터에서 판정한다(계획 §3.5-4, #26).
 *
 * `corner-shape` 의 계산값(CSSOM)은 «선언» 을 말하고, 실제로 그렇게 그려졌는가는 픽셀만 말한다. 견본 좌상단 48×48 device px 의 커버리지
 * (0 = 바탕, 1 = 채움)에 원(n=2)과 초타원(n=4, squircle = superellipse(2))을 반경을 자유 변수로 적합해 평균 절대 오차(MAE)를 비교한다 —
 * `MAE_super < 0.5 · MAE_circle` 이면 스쿼클. 대각선 표본만으로는 못 가른다(두 곡선이 대각선 근처에서 가장 가깝다) — 접선 근처가 갈린다.
 * 순수 함수라 Playwright(vrt/corners.spec)와 vitest(합성 래스터) 가 같은 코드를 부른다.
 */

/** 정사각 래스터 — `size × size`, 행 우선, 값은 채움 비율 0..1. 좌상단이 모서리다. */
export interface CornerRaster {
  /** 한 변의 픽셀 수. */
  readonly size: number;
  /** `size × size` 채움 비율 — 행 우선. */
  readonly coverage: readonly number[];
}

/** 색 하나 — 0..255. */
export interface Rgb {
  /** 빨강 0..255. */
  readonly r: number;
  /** 초록 0..255. */
  readonly g: number;
  /** 파랑 0..255. */
  readonly b: number;
}

/** 곡선 하나의 적합 결과. */
export interface CornerFit {
  /** 가장 잘 맞는 반경(device px). */
  readonly radius: number;
  /** 평균 절대 오차(커버리지 단위). */
  readonly mae: number;
}

/** 프로파일 — 두 적합과 결론(`shape`). */
export interface CornerProfile {
  /** 원(n=2) 적합. */
  readonly circle: CornerFit;
  /** 초타원(n=4) 적합. */
  readonly squircle: CornerFit;
  /** 결론 — `MAE_super < 0.5 · MAE_circle` 이면 squircle. */
  readonly shape: "round" | "squircle";
}

/** 원 = superellipse 지수 2. */
export const CIRCLE_EXPONENT = 2;
/** squircle(K=2) = superellipse 지수 4. */
export const SQUIRCLE_EXPONENT = 4;
/** `MAE_super < RATIO · MAE_circle` 이면 스쿼클. */
export const SQUIRCLE_RATIO = 0.5;

/** RGBA 바이트(canvas getImageData 순서)를 채움 비율로 — 바탕→채움 축에 투영해 0..1 로 자른다. 안티에일리어싱 픽셀이 중간값을 갖는다. */
export function coverageFromRgba(data: ArrayLike<number>, size: number, fill: Rgb, background: Rgb): CornerRaster {
  const axis = [fill.r - background.r, fill.g - background.g, fill.b - background.b];
  const length = axis[0]! * axis[0]! + axis[1]! * axis[1]! + axis[2]! * axis[2]!;
  const coverage: number[] = [];
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    const dot = (data[o]! - background.r) * axis[0]! + (data[o + 1]! - background.g) * axis[1]! + (data[o + 2]! - background.b) * axis[2]!;
    coverage.push(length === 0 ? 0 : Math.min(1, Math.max(0, dot / length)));
  }
  return { size, coverage };
}

/** 점 (x, y) 가 반경 r · 지수 n 의 좌상단 모서리 안에 있는가. 모서리 사각형 밖(x ≥ r 또는 y ≥ r)은 언제나 안이다. */
export function insideCorner(x: number, y: number, r: number, n: number): boolean {
  if (x >= r || y >= r) return true;
  return ((r - x) / r) ** n + ((r - y) / r) ** n <= 1;
}

/** 픽셀 (px, py) 의 기대 커버리지 — 픽셀을 `samples × samples` 로 나눠 센다. */
export function pixelCoverage(px: number, py: number, r: number, n: number, samples = 4): number {
  let inside = 0;
  for (let i = 0; i < samples; i++) for (let j = 0; j < samples; j++) if (insideCorner(px + (i + 0.5) / samples, py + (j + 0.5) / samples, r, n)) inside++;
  return inside / (samples * samples);
}

/** 합성 래스터 — 스펙이 검출기 자체를 검증하는 데 쓴다. */
export function synthesizeCorner(size: number, r: number, n: number): CornerRaster {
  const coverage: number[] = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) coverage.push(pixelCoverage(x, y, r, n));
  return { size, coverage };
}

/** 반경을 훑어 MAE 가 가장 작은 반경을 찾는다 — 0.5px 눈금, 1 ~ 2·size. */
export function fitCorner(raster: CornerRaster, n: number, step = 0.5): CornerFit {
  let best: CornerFit = { radius: 0, mae: Number.POSITIVE_INFINITY };
  for (let r = 1; r <= raster.size * 2; r += step) {
    let sum = 0;
    for (let y = 0; y < raster.size; y++) for (let x = 0; x < raster.size; x++) sum += Math.abs(raster.coverage[y * raster.size + x]! - pixelCoverage(x, y, r, n));
    const mae = sum / (raster.size * raster.size);
    if (mae < best.mae) best = { radius: r, mae };
  }
  return best;
}

/** 원과 초타원을 적합해 판정한다. */
export function profileCorner(raster: CornerRaster): CornerProfile {
  const circle = fitCorner(raster, CIRCLE_EXPONENT);
  const squircle = fitCorner(raster, SQUIRCLE_EXPONENT);
  return { circle, squircle, shape: squircle.mae < SQUIRCLE_RATIO * circle.mae ? "squircle" : "round" };
}
