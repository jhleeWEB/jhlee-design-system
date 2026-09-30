import { describe, expect, it } from "vitest";

import { describeComponentContract, runContract } from "../__arch__/component-contract";
import { SkeletonText } from "./Skeleton";
import * as stories from "./Skeleton.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. 실패 0 이 계약이다(#43). */
describeComponentContract(stories, { slot: "skeleton", axes: ["shape"] });

/* SkeletonText 는 같은 모듈의 부품이라 스토리 파일이 따로 없다(스토리 계약은 모듈 단위) — 최소 props 로 같은 검사를 돈다. */
describe("component contract · skeleton-text", () => {
  it("실패 0", async () => {
    const failures = await runContract({ slot: "skeleton-text", render: (p) => <SkeletonText {...p} /> });
    expect(failures).toEqual([]);
  });
});
