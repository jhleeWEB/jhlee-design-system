/*
 * 공통 컴포넌트 계약(계획 §2.4 D-3 · §2.5-f, C3).
 *
 * DS 컴포넌트가 «소비자에게 같은 모양으로 열려 있는가» 를 여섯 검사로 묻는다. 스토리가 유일한 픽스처다 — `composeStories` 로 `Default` 를
 * 렌더하므로 jsdom 계약·브라우저 play/axe(addon-vitest)·픽셀(VRT) 세 층이 같은 입력을 본다. 스토리가 아직 없는 컴포넌트는
 * `render-all.spec` 이 최소 props 로 같은 검사를 돌린다.
 *
 *  slot         선언한 `data-slot` 이 DOM 에 있다 — 소비자 CSS·테스트가 붙잡는 손잡이
 *  slot-locked  소비자가 `data-slot` 을 넘겨도 덮이지 않는다(`{...rest}` 가 data-slot 뒤에 오면 덮인다)
 *  className    `className` 이 닿고 tailwind-merge 로 합쳐진다(`p-0 p-8` → `p-8` 만 남는다)
 *  ref          `ref` 가 실제 DOM 요소에 닿는다
 *  rest         나머지 속성(`data-testid`)이 DOM 으로 전달된다
 *  axes         cva 축마다 `data-<axis>` 가 찍힌다 — 스토리 `Variants` 격자·소비자 선택자·매니페스트가 그 값을 읽는다
 *  axe          axe-core 위반 0(jsdom: color-contrast·region 제외, `src/__tests__/axe.ts`)
 *
 * 실패는 «검사 id + 이유» 로 돌려주고 판정은 부르는 쪽이 한다 — render-all.spec 은 KNOWN_CONTRACT_FAILURES 래칫으로, 폴더별 spec(Phase D)은 0 으로.
 */
import { composeStories } from "@storybook/react-vite";
import { cleanup, render } from "@testing-library/react";
import { createRef, type ReactElement, type Ref } from "react";
import { describe, expect, it } from "vitest";

import { axeViolations } from "../__tests__/axe";

export const CONTRACT_CHECKS = ["slot", "slot-locked", "className", "ref", "rest", "axes", "axe"] as const;
export type CheckId = (typeof CONTRACT_CHECKS)[number];

/** 계약이 컴포넌트에 얹는 탐침 — 렌더 함수는 이것을 그대로 컴포넌트에 펼친다. */
export interface Probe {
  readonly className?: string;
  // 컴포넌트마다 ref 의 요소 타입이 다르다(button · div · svg) — 한 탐침이 전부에 꽂히려면 any 여야 한다. 검사는 런타임에 `instanceof Element` 로 한다.
  readonly ref?: Ref<any>;
  readonly "data-testid"?: string;
  readonly "data-slot"?: string;
}

export interface ContractSubject {
  /** 탐침을 받은 컴포넌트 한 그루. 컨텍스트가 필요한 부품은 여기서 부모로 감싼다. */
  readonly render: (probe: Probe) => ReactElement;
  /** 컴포넌트가 선언한 `data-slot`. */
  readonly slot: string;
  /** cva 축 이름 — `data-<axis>` 로 찍혀야 한다. */
  readonly axes?: readonly string[];
  /** 이 컴포넌트에서만 끄는 axe 규칙(이유를 옆 주석에). */
  readonly axeOff?: readonly string[];
}

export interface ContractFailure {
  readonly id: CheckId;
  readonly reason: string;
}

const CLASS_PROBE = "p-0 p-8";
const TESTID_PROBE = "contract-rest";
const SLOT_PROBE = "contract-override";

/** 렌더 뒤 `document.body` 전체를 본다 — 포털(Radix)로 나간 오버레이도 계약 대상이다. */
export async function runContract(subject: ContractSubject): Promise<ContractFailure[]> {
  const failed: ContractFailure[] = [];
  const fail = (id: CheckId, reason: string) => failed.push({ id, reason });
  const body = document.body;

  const ref = createRef<Element>();
  try {
    render(subject.render({ className: CLASS_PROBE, ref, "data-testid": TESTID_PROBE }));
  } catch (error) {
    cleanup();
    for (const id of CONTRACT_CHECKS)
      fail(id, `render threw: ${error instanceof Error ? error.message : String(error)}`);
    return failed;
  }

  if (!body.querySelector(`[data-slot="${subject.slot}"]`))
    fail("slot", `[data-slot="${subject.slot}"] not in DOM`);

  const withProbe = [...body.querySelectorAll<HTMLElement>(".p-8")];
  if (withProbe.length === 0) fail("className", "className did not reach any element");
  else if (withProbe.some((el) => el.classList.contains("p-0")))
    fail("className", "className is concatenated, not merged (p-0 survived next to p-8)");

  // SVG 컴포넌트(Spinner · CanvasScale)의 ref 는 SVGElement 다 — DOM 요소이면 된다.
  if (!(ref.current instanceof Element)) fail("ref", "ref.current is not a DOM element");
  if (!body.querySelector(`[data-testid="${TESTID_PROBE}"]`))
    fail("rest", "data-testid did not reach the DOM");

  for (const axis of subject.axes ?? []) {
    if (!body.querySelector(`[data-${axis}]`)) fail("axes", `data-${axis} not stamped`);
  }

  const violations = await axeViolations(body, subject.axeOff);
  if (violations.length > 0) fail("axe", violations.join(" | "));
  cleanup();

  try {
    render(subject.render({ "data-slot": SLOT_PROBE }));
    if (
      !body.querySelector(`[data-slot="${subject.slot}"]`) ||
      body.querySelector(`[data-slot="${SLOT_PROBE}"]`)
    ) {
      fail("slot-locked", "consumer data-slot overrode the declared slot");
    }
  } finally {
    cleanup();
  }
  return failed;
}

type StoriesModule = Parameters<typeof composeStories>[0] & { readonly Default: unknown };

/** 스토리 모듈의 `Default` 를 계약 대상으로 — 탐침은 스토리 args 위에 얹힌다. */
export function storySubject(
  storiesModule: StoriesModule,
  options: Omit<ContractSubject, "render">,
): ContractSubject {
  const { Default } = composeStories(storiesModule) as unknown as { Default: (props: Probe) => ReactElement };
  return { ...options, render: (probe) => <Default {...probe} /> };
}

/** 폴더별 spec 의 입구 — 검사마다 `it` 하나, 실패 0 이 계약이다. */
export function describeComponentContract(
  storiesModule: StoriesModule,
  options: Omit<ContractSubject, "render">,
): void {
  const subject = storySubject(storiesModule, options);
  describe(`component contract · ${options.slot}`, () => {
    let failures: ContractFailure[] | undefined;
    const failuresOf = async () => (failures ??= await runContract(subject));
    for (const id of CONTRACT_CHECKS) {
      it(id, async () => {
        const mine = (await failuresOf()).filter((f) => f.id === id).map((f) => f.reason);
        expect(mine).toEqual([]);
      });
    }
  });
}
