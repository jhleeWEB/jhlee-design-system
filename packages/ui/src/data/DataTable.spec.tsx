import { describeComponentContract } from "../__arch__/component-contract";
import * as stories from "./DataTable.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. DataTable 은 cva 축이 없다. */
describeComponentContract(stories, { slot: "data-table" });
