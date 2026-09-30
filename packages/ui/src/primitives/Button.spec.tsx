import { describe, expect, it } from "vitest";

import { runContract, storySubject } from "../__arch__/component-contract";
import * as stories from "./Button.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다.
 * Button 만 slot-locked 가 예외다(공개 컴포넌트 중 유일, render-all.spec 참고): Toast · Modal · Drawer 의 닫기 버튼과 동결된 legacy Select 가
 * `data-slot` 을 넘겨 자기 이름을 붙이고, 배포되는 legacy/shell.css 가 `.ds-select[data-slot="select"]` 로 그 버튼을 그린다(Button.tsx 주석).
 * 지금 잠그면 소비 레포의 legacy Select 가 모양을 잃는다 — legacy 를 지우는 D8(#49, 3.0.0)에서 잠그고 여기를 describeComponentContract 로 바꾼다(#48 판단). */
describe("component contract · button", () => {
  it("slot-locked 만 실패한다(소비자 data-slot 을 받는 것이 의도)", async () => {
    const subject = storySubject(stories, { slot: "button", axes: ["variant", "tone", "size"] });
    const failures = await runContract(subject);
    expect(failures.map((f) => f.id)).toEqual(["slot-locked"]);
  });
});
