import { describeComponentContract } from "../__arch__/component-contract";
import * as stories from "./BackButton.stories";

/* 공통 계약(slot · slot-locked · className · ref · rest · axes · axe) — 스토리 `Default` 가 유일한 픽스처다(#45). */
describeComponentContract(stories, { slot: "button" });
