"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Toast as RadixToast } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { IconAlertTriangle, IconCircleCheck, IconCircleX, IconX } from "../icons/icons";
import {
  toastDescriptionVariants,
  toastVariants,
  toastViewportVariants,
  type ToastPosition,
  type ToastTone,
} from "./Toast.variants";
import { SlottedButton } from "../primitives/Button";
import { MOTION } from "../generated/tokens";

/* 토스트 — 지나가는 알림. 흐름에 남아야 하면 `Alert` 다.
 *
 * ── 왜 큐를 두는가 ──────────────────────────────────────────────────────────────
 * 이 저장소에는 `.toast` CSS 가 네 벌 있었고(app.css · floorplan/style.css · editor.css ×2),
 * 넷 다 «문자열 하나를 담는 지역 state» 였다. 그래서 두 번째 알림이 첫 번째를 덮어썼고,
 * 자동 해제도 없었으며, 넷 중 하나만 `role="status"` 를 달고 있었다. 큐와 라이브 리전은
 * 손으로 다시 쓰면 매번 빠지는 종류의 것이라 여기서 한 번만 푼다.
 *
 * Radix 의 `Toast` 를 쓰는 이유는 스와이프 해제·포커스 복귀·`aria-live` 처리가 이미 옳기
 * 때문이다. 우리가 얹는 것은 큐와 외형뿐이다. */

/** `toast()` 한 번에 넘기는 알림 한 건. */
export interface ToastOptions extends Omit<VariantProps<typeof toastVariants>, "tone"> {
  /**
   * 톤 — 면 · 테두리 · 글자를 물들이고 판정이면 앞에 톤 아이콘을 둔다. 판정일 때만 유채색이다.
   * - `neutral` — 판정 없는 알림(저장됨·복사됨, 기본)
   * - `success` — 통과·완료
   * - `warning` — 주의. 되돌릴 수 있지만 확인이 필요하다
   * - `destructive` — 실패. 대개 `duration: 0` 과 함께 쓴다
   * @default "neutral"
   */
  tone?: ToastTone | null | undefined;
  /** 무슨 일인지 한 줄 — 굵게 그린다. */
  title: React.ReactNode;
  /**
   * 제목 아래의 보조 문장.
   * @default undefined
   */
  description?: React.ReactNode;
  /**
   * 본문 아래의 되돌리기 등. `altText` 는 스크린리더가 읽는 대체 문구다.
   * @default undefined
   */
  action?: ToastAction;
  /**
   * ms. `0` 이면 사용자가 닫을 때까지 남는다 — 실패 알림에만 쓴다. 비우면 `ToastProvider` 의 `duration` 을 따른다.
   * 시간이 있으면 하단에 남은 시간 막대가 줄어든다(뷰포트에 마우스 · 포커스가 있거나 창이 흐려지면 타이머와 함께 멈춘다).
   * @default undefined
   */
  duration?: number | undefined;
}

/** 토스트 본문 아래의 조치 버튼 하나. */
export interface ToastAction {
  /** 버튼 글자. */
  label: string;
  /** 스크린리더가 읽는 대체 문구 — 단축키로 조치에 닿는 방법을 말한다(Radix 요구). */
  altText: string;
  /** 눌렀을 때. 토스트는 Radix 가 닫는다. */
  onSelect: () => void;
}

interface QueuedToast extends ToastOptions {
  id: number;
  open: boolean;
}

/** `useToast()` 가 돌려주는 것 — 띄우기와 닫기. */
export interface ToastApi {
  /** 알림을 큐에 넣고 id 를 돌려준다. `limit` 을 넘으면 오래된 것부터 닫는다. */
  toast: (options: ToastOptions) => number;
  /** 그 id 의 알림을 닫는다(퇴장 애니메이션 뒤 큐에서 빠진다). */
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** 가장 가까운 `ToastProvider` 의 큐 — 밖에서 부르면 던진다. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}

/**
 * 토스트 큐의 props. 큐 설정 밖의 속성(`className` · `ref` · `hotkey` · `label` · `data-*` …)은 **뷰포트**(쌓이는 `ol`)로 간다 —
 * 프로바이더가 그리는 DOM 은 그것뿐이라 공통 계약(className · ref · rest)이 거기 닿는다.
 */
export interface ToastProviderProps extends Omit<
  React.ComponentProps<typeof RadixToast.Viewport>,
  "children"
> {
  /** 앱 — 이 안에서 `useToast()` 를 부른다. */
  children: React.ReactNode;
  /**
   * 화면에 동시에 보일 최대 개수. 넘치면 오래된 것부터 닫는다.
   * @default 3
   */
  limit?: number;
  /**
   * 기본 노출 시간(ms). `0` 이면 닫을 때까지 남는다. 판정 실패처럼 읽는 데 시간이 걸리는 것은 호출처가 늘린다.
   * @default MOTION.toastDefaultMs
   */
  duration?: number;
  /**
   * 뷰포트 위치. 캔버스 위 도구 클러스터와 겹치지 않는 쪽을 앱이 고른다.
   * - `bottom-right` — 오른쪽 아래(기본)
   * - `bottom-center` — 아래 가운데
   * - `top-right` — 오른쪽 위. 토스트는 위에서 내려온다
   * - `top-center` — 위 가운데. 토스트는 위에서 내려온다
   * @default "bottom-right"
   */
  position?: ToastPosition | null | undefined;
}

/** 판정 톤의 앞 아이콘 — neutral 은 아이콘 없이 글자만 둔다(판정이 아니다). 색은 토스트 글자색(currentColor)을 따른다. */
const TONE_ICON: Readonly<Record<ToastTone, typeof IconX | null>> = {
  neutral: null,
  success: IconCircleCheck,
  warning: IconAlertTriangle,
  destructive: IconCircleX,
};

/**
 * 토스트 한 건. 진행 막대는 CSS 애니메이션(toast.css `ds-toast-progress`)이고 길이는 Radix 에 넘긴 시간과 같다.
 * Radix 는 뷰포트에 포인터 · 포커스가 들어오거나 창이 흐려지면 타이머를 멈추고 남은 시간으로 다시 잰다 — 그 순간을 `onPause` · `onResume` 이
 * 알려 주므로 `data-paused` 로 애니메이션을 같이 멈춘다. 둘이 같은 «지난 시간» 을 들고 다녀 막대가 끝나는 순간 토스트가 닫힌다.
 */
function ToastItem({
  item,
  providerDuration,
  onDismiss,
}: {
  item: QueuedToast;
  providerDuration: number;
  onDismiss: (id: number) => void;
}) {
  const [paused, setPaused] = useState(false);
  const tone = item.tone ?? "neutral";
  const Icon = TONE_ICON[tone];
  /* 0 은 «닫을 때까지 남는다» — 막대가 없다. */
  const ms = item.duration ?? providerDuration;
  const timed = Number.isFinite(ms) && ms > 0;
  return (
    <RadixToast.Root
      data-slot="toast"
      data-tone={item.tone ?? "neutral"}
      data-paused={paused ? "" : undefined}
      open={item.open}
      /* Radix 의 `duration` 은 필수 number 라 `undefined` 를 넘기면 타입이 깨진다.
         값이 없을 때는 Provider 의 기본값이 이겨야 하므로 **prop 자체를 빼야** 한다. */
      {...(item.duration === undefined ? {} : { duration: item.duration === 0 ? Infinity : item.duration })}
      onOpenChange={(open) => {
        if (open) return;
        onDismiss(item.id);
      }}
      onPause={() => setPaused(true)}
      onResume={() => setPaused(false)}
      className={cn(toastVariants({ tone }))}
    >
      {Icon ? (
        /* 첫 줄(text-body 의 20px 줄) 높이의 칸 가운데에 16px 아이콘을 앉힌다 — 여러 줄 제목에서도 첫 줄에 붙는다. */
        <span className="flex h-5 shrink-0 items-center">
          <Icon data-slot="toast-icon" className="size-4" />
        </span>
      ) : null}
      <div className="min-w-0 flex-1 self-center [overflow-wrap:anywhere]">
        <RadixToast.Title className="font-semibold">{item.title}</RadixToast.Title>
        {item.description ? (
          <RadixToast.Description className={toastDescriptionVariants({ tone })}>
            {item.description}
          </RadixToast.Description>
        ) : null}
        {item.action ? (
          <RadixToast.Action asChild altText={item.action.altText} onClick={item.action.onSelect}>
            <SlottedButton
              slot="toast-action"
              size="sm"
              variant="outline"
              /* 톤 면 위의 흰(다크에선 남색) 버튼은 면과 따로 놀았다 — 테두리 · 글자를 토스트 글자색으로, 면은 투명하게 둔다(#76). */
              className="mt-3 h-auto min-h-(--size-control-sm) max-w-full border-current/30 bg-transparent py-1 whitespace-normal text-current hover:bg-current/10 hover:text-current"
            >
              {item.action.label}
            </SlottedButton>
          </RadixToast.Action>
        ) : null}
      </div>
      <RadixToast.Close asChild>
        <SlottedButton
          slot="toast-close"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss"
          /* 톤 면 위에서 회색 hover(bg-muted)는 얼룩처럼 뜬다 — 글자색(currentColor)의 옅은 면으로 누른다. neutral 은 그대로 회색 계열이다. */
          className="-mt-1 -mr-1 shrink-0 text-current opacity-70 hover:bg-current/10 hover:text-current hover:opacity-100"
        >
          <IconX />
        </SlottedButton>
      </RadixToast.Close>
      {timed ? (
        <span
          aria-hidden
          data-slot="toast-progress"
          className="ds-toast-progress pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-current opacity-35"
          style={{ animationDuration: `${ms}ms` }}
        />
      ) : null}
    </RadixToast.Root>
  );
}

/** 토스트 큐와 뷰포트 — 앱 루트에 한 번 둔다. 알림은 `useToast().toast()` 로 띄운다. */
export function ToastProvider({
  children,
  limit = 3,
  duration = MOTION.toastDefaultMs,
  position,
  className,
  ...rest
}: ToastProviderProps) {
  const [queue, setQueue] = useState<readonly QueuedToast[]>([]);
  const nextId = useRef(0);
  const removalTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    /* 제어 prop으로 닫은 경우 Radix가 onOpenChange를 다시 부르지 않는다. 모든 닫힘 경로를
       큐 상태에서 정리해야 명시적 dismiss와 개수 제한도 같은 퇴장 수명을 갖는다. */
    for (const item of queue) {
      if (item.open || removalTimers.current.has(item.id)) continue;
      removalTimers.current.set(
        item.id,
        setTimeout(() => {
          removalTimers.current.delete(item.id);
          setQueue((prev) => prev.filter((toast) => toast.id !== item.id));
        }, MOTION.toastQueueGraceMs),
      );
    }
  }, [queue]);
  useEffect(
    () => () => {
      for (const timer of removalTimers.current.values()) clearTimeout(timer);
      removalTimers.current.clear();
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setQueue((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = ++nextId.current;
      setQueue((prev) => {
        const next = [...prev, { ...options, id, open: true }];
        /* 넘치는 만큼 오래된 것을 «닫힘» 으로 표시한다. 배열에서 바로 빼면 퇴장 애니메이션이
           끊기고, Radix 가 포커스를 복귀시킬 대상을 잃는다. */
        const over = next.filter((t) => t.open).length - limit;
        if (over <= 0) return next;
        let closed = 0;
        return next.map((t) => (t.open && closed++ < over ? { ...t, open: false } : t));
      });
      return id;
    },
    [limit],
  );

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      <RadixToast.Provider duration={duration === 0 ? Infinity : duration} swipeDirection="right">
        {children}
        {queue.map((item) => (
          <ToastItem key={item.id} item={item} providerDuration={duration} onDismiss={dismiss} />
        ))}
        <RadixToast.Viewport
          className={cn(toastViewportVariants({ position }), className)}
          {...rest}
          /* 슬롯·축은 rest 뒤 — 소비자가 넘긴 data-slot 이 손잡이를 덮지 못하게 한다(공통 계약 slot-locked).
             toast.css 의 위·아래 진입 방향도 이 data-position 을 읽는다. */
          data-slot="toast-viewport"
          data-position={position ?? "bottom-right"}
        />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
