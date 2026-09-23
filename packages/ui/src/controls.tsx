import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "./cn";
import { useDesignSystem } from "./design-system";
import { Switch } from "./primitives/Choice";
import { SegmentedControl } from "./navigation/SegmentedControl";

/**
 * 폼 컨트롤.
 *
 * 구 aaro-kaufland-prototype 의 `components/ui/{Select,Slider,Toggle}` 에서 왔다. 그쪽에서
 * 아무도 import 하지 않아 죽은 코드처럼 보였지만 — kaufland 는 자기 Sidebar 에 인라인으로
 * 그렸다 — 도메인을 모르는 prop 주도 구현이고 `Segmented` 는 roving tabindex 와 ←/→ 내비를
 * 이미 갖고 있었다. 새로 쓰면 그 키보드 패턴을 잃는다.
 *
 * Tailwind를 쓰지 않는 소비자는 기존 CSS 경로를 유지한다. DesignSystemProvider를 선택한
 * 앱은 같은 값·이벤트 계약으로 DS 스위치·세그먼트와 크롬 토큰을 사용한다.
 */

/** 컨트롤 넷이 공유하는 선택지. 구 `SelectOption<T>` 과 같은 모양이다. */
export interface Option<T extends string | number> {
  value: T;
  label: string;
}

/** 값을 문자열로 왕복시킨다 — `<option value>` 는 문자열만 담는다. */
function pick<T extends string | number>(options: readonly Option<T>[], raw: string): T | undefined {
  return options.find((option) => String(option.value) === raw)?.value;
}

export function Select<T extends string | number>({
  label,
  value,
  options,
  disabled = false,
  className,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly Option<T>[];
  disabled?: boolean;
  className?: string;
  onChange: (value: T) => void;
}) {
  const ds = useDesignSystem();
  return (
    <select
      data-slot={ds ? "select" : undefined}
      className={cn(ds && "ds-select", className)}
      aria-label={label}
      value={String(value)}
      disabled={disabled}
      onChange={(event) => {
        const next = pick(options, event.target.value);
        if (next !== undefined) onChange(next);
      }}
    >
      {options.map((option) => (
        <option key={String(option.value)} value={String(option.value)}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  disabled = false,
  onChange,
  onCommit,
  className,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  /** 없으면 읽기 전용으로 그린다 — 아직 편집을 열지 않은 다이얼도 값은 보여야 한다. */
  onChange?: (value: number) => void;
  /** 있으면 range 이동은 로컬 draft로만 보이고 입력이 끝날 때 한 번 전달한다. */
  onCommit?: (value: number) => void;
  className?: string;
}) {
  const ds = useDesignSystem();
  const [draft, setDraft] = useState(value);
  const draftRef = useRef(value);
  const committedRef = useRef(value);
  const dirtyRef = useRef(false);
  /** 손잡이를 잡고 있는 중인가 — 첫 입력부터 commit/cancel 까지. */
  const holdingRef = useRef(false);
  const commit = () => {
    holdingRef.current = false;
    if (!onCommit || !dirtyRef.current) return;
    dirtyRef.current = false;
    committedRef.current = draftRef.current;
    onCommit(draftRef.current);
  };
  const cancel = () => {
    holdingRef.current = false;
    dirtyRef.current = false;
    draftRef.current = committedRef.current;
    setDraft(committedRef.current);
  };
  useEffect(() => {
    committedRef.current = value;
    /* 잡고 있는 동안 들어온 값은 손잡이를 빼앗지 않는다. 소비자가 `onChange` 로 값을 따라 올리면
       (드래그 중 실시간 반영) 그 값이 이 효과로 돌아오는데, 간격을 두고 미느라 한 박자 뒤처진 값이면
       손잡이가 뒤로 튄다. 놓을 때 `commit` 이 마지막 draft 를 앉히므로 잃는 값은 없다. */
    if (holdingRef.current) return;
    draftRef.current = value;
    dirtyRef.current = false;
    setDraft(value);
  }, [value]);
  useEffect(() => {
    if (!onCommit) return undefined;
    window.addEventListener("pointerup", commit);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointerup", commit);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [onCommit]);
  return (
    <input
      data-slot={ds ? "slider" : undefined}
      className={cn(ds && "ds-slider", className)}
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={onCommit ? draft : value}
      disabled={disabled}
      readOnly={onChange === undefined && onCommit === undefined}
      onChange={onChange === undefined && onCommit === undefined ? undefined : (event) => {
        const next = Number(event.target.value);
        if (onCommit) {
          draftRef.current = next;
          dirtyRef.current = true;
          holdingRef.current = true;
          setDraft(next);
        }
        onChange?.(next);
      }}
      onPointerUp={commit}
      onPointerCancel={cancel}
      onKeyUp={commit}
      onBlur={commit}
    />
  );
}

/**
 * 값 하나를 고르는 배타 선택.
 *
 * `Tabs` 와 갈라 둔다. 이쪽은 **값을 고르는 것**이라 `radiogroup`/`radio`/`aria-checked` 이고,
 * 보이는 패널을 바꾸는 것은 `Tabs`(tablist)다. 원래 kaufland 구현은 둘 다 tablist 였는데,
 * 2D/3D 뷰 전환과 냉방 기술 선택이 같은 의미일 수 없다 — 후자는 패널을 바꾸지 않는다.
 *
 * 키보드 패턴(roving tabindex + ←/→)은 그대로 가져왔다. radiogroup 에서도 같은 패턴이 맞다.
 */
export function Segmented<T extends string | number>({
  label,
  value,
  options,
  disabled = false,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly Option<T>[];
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  const ds = useDesignSystem();
  function onKeyDown(event: KeyboardEvent) {
    if (disabled) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    if (index < 0) return;
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % options.length
        : (index - 1 + options.length) % options.length;
    const picked = options[next];
    if (picked) onChange(picked.value);
  }

  if (ds) return <SegmentedControl options={options} value={value} onChange={onChange} label={label} disabled={disabled} size="sm" />;
  return (
    <div
      className="seg"
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled}
      onKeyDown={onKeyDown}
    >
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          // 선택된 것만 탭 순서에 남긴다 — 그룹 하나가 탭 한 번을 쓴다.
          tabIndex={option.value === value ? 0 : -1}
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * 켬/끔 스위치. `role="switch"` 라 스크린리더가 체크박스가 아니라 스위치로 읽는다. 글자만 있는 버튼이었을 때는 켜짐/꺼짐이 색으로만
 * 갈려 한눈에 읽히지 않았다(#396) — 트랙·노브를 그리고, `label` 은 aria-label 이자 보이는 글자, `hint` 는 옆의 흐린 설명이다.
 * `hideText` 는 `Field` 라벨이 이미 그 이름을 적은 자리에서 쓴다.
 */
export function Toggle({
  label,
  hint,
  hideText = false,
  value,
  disabled = false,
  onChange,
}: {
  label: string;
  hint?: string;
  hideText?: boolean;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  const ds = useDesignSystem();
  if (ds) return (
    <label className={cn("ds-toggle", hideText && "ds-toggle-icon")}>
      {hideText ? null : <span className="ds-toggle-copy"><span>{label}</span>{hint ? <small>{hint}</small> : null}</span>}
      <Switch aria-label={label} checked={value} disabled={disabled} onCheckedChange={onChange} />
    </label>
  );
  return (
    <button
      type="button"
      className="switch"
      role="switch"
      aria-checked={value}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!value)}
    >
      <span className="switch-track" aria-hidden="true">
        <span className="switch-knob" />
      </span>
      {hideText ? null : <span className="switch-text">{label}</span>}
      {hint && !hideText ? <span className="switch-hint">{hint}</span> : null}
    </button>
  );
}
