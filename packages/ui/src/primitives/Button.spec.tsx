import { describeComponentContract } from "../__arch__/component-contract";
import * as stories from "./Button.stories";

/* 공통 계약(slot · slot-locked · className · ref · rest · axes · axe)을 스토리 `Default` 로(D3, #44).
 * 2.x 까지 Button 만 slot-locked 가 예외였다 — legacy Select 가 `data-slot` 을 넘겨 shell.css 가 그 버튼을 그렸다. legacy 를 지운 3.0.0 에서
 * 잠갔다(#49): DS 안에서 다른 이름이 필요한 자리(토스트 · 대화상자 닫기 · 패널 토글)는 내부 `SlottedButton` 으로 이름을 넘긴다. */
describeComponentContract(stories, { slot: "button", axes: ["variant", "tone", "size"] });
