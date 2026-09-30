import { describeComponentContract } from "../__arch__/component-contract";
import * as stories from "./Card.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. 같은 모듈의 부품은 render-all.spec 의 FIXTURES 가 돈다(#48). */
describeComponentContract(stories, { slot: "card", axes: ["elevation", "pad"] });
