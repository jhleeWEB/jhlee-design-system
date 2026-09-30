import { describeComponentContract } from "../__arch__/component-contract";
import * as stories from "./AlertDialog.stories";

/* 공통 계약(slot · slot-locked · className · ref · rest · axes · axe)을 스토리 `Default` 로 — 스토리가 유일한 픽스처다(D3, #44). */
describeComponentContract(stories, { slot: "confirm-dialog" });
