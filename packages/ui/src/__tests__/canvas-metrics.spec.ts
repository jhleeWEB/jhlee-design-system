import { describe, expect, it } from "vitest";

import {
  GRID_MAJOR_EVERY,
  GRID_MAX_DIVISIONS,
  GRID_TARGET_PX,
  gridPitchM,
  niceScale,
} from "../canvas-metrics";

const zooms = [0.01, 0.03, 0.1, 0.25, 0.5, 1, 2.5, 6, 12, 20];

describe("공유 도면 눈금", () => {
  it("Design의 24 px 내림 사다리를 유지한다", () => {
    expect(gridPitchM(0.1)).toBe(2);
    expect(gridPitchM(0.25)).toBe(5);
    expect(GRID_MAJOR_EVERY).toBe(5);
    for (const mpp of zooms) {
      const pitchM = gridPitchM(mpp, mpp * 510);
      expect(pitchM / mpp).toBeGreaterThanOrEqual(9.6);
      expect(pitchM / mpp).toBeLessThanOrEqual(GRID_TARGET_PX);
    }
  });

  it("큰 시야에서도 선 수 상한 안에 화면 전체를 덮을 간격을 낸다", () => {
    for (const mpp of zooms) {
      for (const extent of [40, mpp * 510, mpp * 1_020, 900, 50_000]) {
        const pitchM = gridPitchM(mpp, extent);
        expect((pitchM * GRID_MAX_DIVISIONS) / 2).toBeGreaterThanOrEqual(extent);
        expect(pitchM).toBeGreaterThanOrEqual(gridPitchM(mpp));
      }
    }
    expect(gridPitchM(1, 50_000)).toBeGreaterThan(gridPitchM(1, 400));
  });

  it("팬 위치와 무관한 간격이며 잘못된 축척에도 양수 유한 값을 낸다", () => {
    for (const mpp of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(gridPitchM(mpp)).toBe(gridPitchM(1));
      expect(gridPitchM(mpp, 50_000)).toBeGreaterThan(0);
    }
    for (const extent of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(gridPitchM(0.1, extent)).toBe(gridPitchM(0.1));
    }
  });
});

describe("공유 축척 막대", () => {
  it("기존 Plan의 미터 길이와 최대 120 px 폭을 보존한다", () => {
    expect(niceScale(0.1)).toEqual({ lengthM: 10, px: 100 });
    expect(niceScale(0.37).lengthM).toBe(20);
    expect(niceScale(2).lengthM).toBe(200);
    for (const mpp of zooms) {
      const { lengthM, px } = niceScale(mpp);
      expect(lengthM).toBeGreaterThan(0);
      expect(px).toBeLessThanOrEqual(120);
      expect(px * mpp).toBeCloseTo(lengthM, 8);
    }
  });

  it("눈금과 축척 막대가 같은 1·2·5 사다리를 읽는다", () => {
    for (const mpp of zooms) expect(gridPitchM(mpp)).toBe(niceScale(mpp, GRID_TARGET_PX).lengthM);
  });

  it("잘못된 축척이나 목표 폭을 실제 거리처럼 표시하지 않는다", () => {
    for (const mpp of [0, -1, Number.NaN, Number.POSITIVE_INFINITY])
      expect(niceScale(mpp)).toEqual({ lengthM: 0, px: 0 });
    for (const target of [0, -1, Number.NaN, Number.POSITIVE_INFINITY])
      expect(niceScale(1, target)).toEqual({ lengthM: 0, px: 0 });
  });
});
