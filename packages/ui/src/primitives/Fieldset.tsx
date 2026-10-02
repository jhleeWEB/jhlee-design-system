"use client";
import { useId, type ReactNode } from "react";

import { cn } from "../cn";
import {
  fieldsetClassName,
  fieldsetDescriptionClassName,
  fieldsetLegendClassName,
} from "./Fieldset.variants";

/* 묶음 상자 — 인스펙터의 설정 항목(한 줄짜리 스위치 행이든, 라벨 · 슬라이더 · 도움말이 쌓인 묶음이든)마다 하나씩 둘러 세우는 테두리 상자이고,
 * 제목(legend)이 위 테두리선에 걸친다(#84, 사용자 앱 인스펙터의 «North» · «Road widths»).
 *
 * 네이티브 `<fieldset>` + `<legend>` 를 쓴다. 셋을 그대로 얻기 때문이다.
 *  1. 테두리 끊김 — 브라우저가 렌더된 legend 의 폭만큼 위 테두리를 끊고 legend 를 선 가운데에 세운다. div 로 흉내 내면 legend 뒤에 바탕을 칠해
 *     선을 가려야 하고, 그러려면 상자가 놓인 면(카드 · 패널 · 배경)의 색을 알아야 한다. 네이티브 끊김은 바탕을 몰라도 된다.
 *  2. 그룹 의미 — role `group`, 이름은 legend 의 글자다. 스크린리더가 묶음에 들어설 때 그 이름을 읽는다.
 *  3. `disabled` — 안의 폼 컨트롤(input · select · textarea · button)이 전부 진짜로 꺼진다. Radix 의 Switch · Checkbox · Radio · Select 트리거도
 *     button 이라 함께 꺼진다. Radix Slider 의 손잡이처럼 role 만 단 span 은 폼 컨트롤이 아니어서 꺼지지 않는다 — 그런 컨트롤에는 `disabled` 를 따로 준다.
 *
 * legend 줄 오른쪽의 동작(`action`)은 두지 않는다 — 깔끔하게 놓을 자리가 없다. 브라우저가 끊어 주는 것은 렌더된 legend 하나의 폭뿐이라
 *  - 동작을 legend 안에 넣으면 그 글자가 묶음 이름에 섞이고(«North Reset»), 오른쪽 끝에 두려고 legend 를 폭 전체로 늘리면 위 테두리가 통째로 끊긴다.
 *  - legend 밖에서 절대 배치로 선 위에 얹으면 선을 가릴 바탕이 필요해 1의 이점을 잃는다(놓인 면이 바뀌면 선 위에 다른 색 조각이 남는다).
 *  - legend 를 늘린 채 가운데에 선을 다시 그리면 두 페인터(테두리 · 상자)가 같은 선을 반 픽셀 기준으로 따로 그린다 — 배율 · 엔진마다 어긋난다.
 * 묶음 전체에 걸리는 동작은 첫 행의 오른쪽(컨트롤 자리)에 둔다. */

/** `Fieldset` 의 props — `<fieldset>` 속성 전부(ref 포함) + `legend` · `description`. */
export interface FieldsetProps extends React.ComponentPropsWithRef<"fieldset"> {
  /** 묶음의 이름 — 위 테두리선에 걸치는 `<legend>`. 스크린리더가 이 글자를 묶음(role `group`)의 이름으로 읽는다. 면 제목 역할(`text-body font-semibold`). */
  legend: ReactNode;
  /**
   * legend 아래 보조 문장 — 묶음의 `aria-describedby` 로 이어진다(보조 문장 역할, 흐린 `text-body`). 넘긴 `aria-describedby` 는 그 뒤에 붙는다.
   * @default undefined
   */
  description?: ReactNode;
  /**
   * 묶음 전체를 끈다(네이티브) — 안의 input · select · textarea · button 이 꺼지고, legend · 설명 · 안의 FieldLabel · FieldDescription 이 흐려진다.
   * role 만 단 비(非)폼 컨트롤(Radix Slider 손잡이)은 꺼지지 않으니 그 컨트롤에도 `disabled` 를 준다.
   * @default false
   */
  disabled?: boolean | undefined;
}

/** 내용이 있는가 — `false` · 빈 문자열은 «없음» 이다(조건부 `cond && "…"` 를 그대로 넘겨도 빈 설명이 서지 않는다). */
const present = (node: ReactNode): boolean =>
  node !== undefined && node !== null && node !== false && node !== "";

/**
 * 묶음 상자 — 테두리 상자 위 선에 제목(legend)이 걸치는 네이티브 fieldset. 인스펙터의 설정 항목마다 하나씩 세워 `flex flex-col gap-3` 으로 쌓는다.
 * 안의 행은 `Field` 로 짓는다 — 라벨 · 설명 왼쪽 + 컨트롤 오른쪽은 `Field orientation="horizontal"` 에 `flex-nowrap justify-between`.
 * @slot fieldset
 */
export function Fieldset({
  className,
  legend,
  description,
  children,
  "aria-describedby": describedBy,
  ...rest
}: FieldsetProps) {
  const descriptionId = useId();
  const hasDescription = present(description);
  const ids = [hasDescription ? descriptionId : undefined, describedBy].filter(Boolean).join(" ");
  return (
    <fieldset
      aria-describedby={ids || undefined}
      className={cn(fieldsetClassName, className)}
      {...rest}
      data-slot="fieldset"
    >
      {/* 첫 자식이어야 «렌더된 legend» 다 — 그래야 브라우저가 이것을 테두리선에 세우고 묶음 이름으로 삼는다. */}
      <legend data-slot="fieldset-legend" className={fieldsetLegendClassName}>
        {legend}
      </legend>
      {hasDescription ? (
        <p id={descriptionId} data-slot="fieldset-description" className={fieldsetDescriptionClassName}>
          {description}
        </p>
      ) : null}
      {children}
    </fieldset>
  );
}
