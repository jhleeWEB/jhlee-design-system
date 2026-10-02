import { useId, useState, type ReactNode } from "react";

import { cn } from "../../src/cn";
import { Field, FieldControl, FieldDescription, FieldLabel } from "../../src/primitives/Field";
import { Input, type InputProps } from "../../src/primitives/Input";
import { Slider } from "../../src/primitives/Slider";

/* 인스펙터 복제의 행 — Fieldset 스토리(항목마다 상자)와 Accordion 스토리(flush 구획 안의 상자)가 같은 행을 쓴다(#84). 사용자 앱 인스펙터의
 * «North»(라벨 + 수치 · 슬라이더 · 도움말)와 «Road widths»(라벨 · 설명 + 스위치)를 DS 부품으로 다시 지은 것이다. 스토리 파일의 named export 는
 * Storybook 이 스토리로 읽으므로 공유 조각은 여기 둔다. */

/** 인스펙터 패널 — 카드 면 위에 묶음 상자를 12px 간격으로 쌓는다(Fieldset JSDoc 의 쌓는 법). 폭은 인스펙터 토큰이 기본이다. */
export function InspectorPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("flex w-(--size-inspector) flex-col gap-3 rounded-lg bg-card p-3 shadow-card", className)}
    >
      {children}
    </div>
  );
}

/** 라벨 · 설명 왼쪽 + 컨트롤 오른쪽 한 행 — `Field` 가로 배치를 줄바꿈 없이 양 끝으로 민다. 라벨 · 설명은 컨트롤에 id 로 이어진다. */
export function InspectorRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Field orientation="horizontal" className="flex-nowrap justify-between">
      <div className="flex min-w-0 flex-col">
        <FieldLabel>{label}</FieldLabel>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </div>
      <FieldControl>{children}</FieldControl>
    </Field>
  );
}

/** 수치 입력 — 단위 접미사, 인스펙터 행의 오른쪽 칸 폭. 나머지 속성은 Input 으로 넘긴다 — `FieldControl` 이 id · aria-describedby 를 여기에 꽂는다. */
export function InspectorAmount({
  unit,
  value = "0",
  ...rest
}: { unit: string; value?: string } & Omit<InputProps, "suffix" | "defaultValue" | "value">) {
  return (
    <Input
      size="sm"
      numeric
      type="number"
      min={0}
      defaultValue={value}
      suffix={unit}
      className="w-28 shrink-0"
      {...rest}
    />
  );
}

/** «North» 묶음의 내용 — 라벨 + 오른쪽 수치(mono · tnum), 슬라이더, mono 도움말이 세로로 쌓인다. */
export function InspectorAngle() {
  const [angle, setAngle] = useState([0]);
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span id={labelId} className="font-medium">
          Angle
        </span>
        <span className="tnum">{angle[0]}°</span>
      </div>
      {/* 손잡이는 role 만 단 span 이라 네이티브 fieldset 의 disabled 가 닿지 않는다 — Slider 가 Fieldset 의 컨텍스트를 읽어 함께 꺼진다(#90). */}
      <Slider
        aria-labelledby={labelId}
        min={0}
        max={359}
        value={angle}
        onValueChange={setAngle}
        formatValue={(v) => `${v}°`}
      />
      <p className="m-0 font-mono text-micro text-muted-foreground">
        Display only — the drawing turns, north stays up
      </p>
    </div>
  );
}
