import { describeComponentContract } from "../__arch__/component-contract";
import * as stories from "./Alert.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. 실패 0 이 계약이다(#43). */
describeComponentContract(stories, { slot: "alert", axes: ["tone"] });
