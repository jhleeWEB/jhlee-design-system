/*
 * 픽셀 프로파일 검출기(계획 §3.5-4, #26) — 합성 래스터로 «원과 초타원을 실제로 가르는가» 를 증명한다.
 * Playwright(vrt/corners.spec)는 실제 렌더를 같은 함수에 넣는다 — 여기서 검출기가 틀리면 그쪽 초록은 뜻이 없다.
 */
import { describe, expect, it } from "vitest";

import { CIRCLE_EXPONENT, coverageFromRgba, profileCorner, SQUIRCLE_EXPONENT, synthesizeCorner } from "../testing/corner-profile";

describe("corner-profile", () => {
  it("초타원(n=4) 래스터는 squircle, 원(n=2) 래스터는 round 로 가른다 — 반경도 되찾는다", () => {
    const squircle = profileCorner(synthesizeCorner(48, 36, SQUIRCLE_EXPONENT));
    expect(squircle.shape).toBe("squircle");
    expect(squircle.squircle.radius).toBeCloseTo(36, 0);
    expect(squircle.squircle.mae).toBeLessThan(0.5 * squircle.circle.mae);

    const circle = profileCorner(synthesizeCorner(48, 24, CIRCLE_EXPONENT));
    expect(circle.shape).toBe("round");
    expect(circle.circle.radius).toBeCloseTo(24, 0);
  });

  it("작은 반경(md 12px × DPR 2 = 24)도 가른다 — 견본 창 48 안에 접선이 든다", () => {
    expect(profileCorner(synthesizeCorner(48, 24, SQUIRCLE_EXPONENT)).shape).toBe("squircle");
    expect(profileCorner(synthesizeCorner(48, 24, CIRCLE_EXPONENT)).shape).toBe("round");
  });

  it("창보다 큰 반경(xl 16px × 1.5 × 2 = 48)도 가른다", () => {
    expect(profileCorner(synthesizeCorner(48, 48, SQUIRCLE_EXPONENT)).shape).toBe("squircle");
    expect(profileCorner(synthesizeCorner(48, 48, CIRCLE_EXPONENT)).shape).toBe("round");
  });

  it("RGBA 바이트를 채움 비율로 — 바탕은 0, 채움은 1, 안티에일리어싱 중간색은 그 사이", () => {
    const fill = { r: 8, g: 105, b: 225 };
    const background = { r: 255, g: 255, b: 255 };
    const mid = { r: (8 + 255) / 2, g: (105 + 255) / 2, b: (225 + 255) / 2 };
    const data = [background, fill, mid, { r: 0, g: 0, b: 0 }].flatMap(c => [c.r, c.g, c.b, 255]);
    const raster = coverageFromRgba(data, 2, fill, background);
    expect(raster.coverage[0]).toBe(0);
    expect(raster.coverage[1]).toBe(1);
    expect(raster.coverage[2]).toBeCloseTo(0.5, 5);
    /* 축 밖의 색(검정)은 0..1 로 잘린다 — 그림자·테두리 픽셀이 판정을 뒤집지 않게. */
    expect(raster.coverage[3]).toBeLessThanOrEqual(1);
  });
});
