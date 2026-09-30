import { describeComponentContract } from "../__arch__/component-contract";
import * as stories from "./Table.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처이고 탐침은 뿌리 `<table>` 에 얹힌다.
 * 부품(Thead · Tbody · Tr · Th · Td)의 계약은 render-all.spec 의 픽스처가 돈다 — `Td` 의 `tone` 축(data-tone)도 거기서 본다. */
describeComponentContract(stories, { slot: "table" });
