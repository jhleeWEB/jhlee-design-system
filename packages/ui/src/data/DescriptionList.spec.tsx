import { describeComponentContract } from "../__arch__/component-contract";
import * as stories from "./DescriptionList.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. 줄마다의 numeric · provisional 은 cva 축이 아니다. */
describeComponentContract(stories, { slot: "description-list" });
