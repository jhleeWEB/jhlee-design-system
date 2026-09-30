import { describeComponentContract } from "./__arch__/component-contract";
import * as stories from "./CanvasScale.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. */
describeComponentContract(stories, { slot: "canvas-scale" });
