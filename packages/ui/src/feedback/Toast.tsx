import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Toast as RadixToast } from "radix-ui";

import { cn, cva, type VariantProps } from "../cn";

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

const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full items-start gap-4",
    "rounded-float border border-l-3 bg-surface p-5 shadow-pop",
    "text-body text-ink animate-in-rise",
    "data-[state=closed]:animate-in-fade data-[state=closed]:[animation-direction:reverse]",
    "data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
  ],
  {
    variants: {
      tone: {
        neutral: "border-line border-l-ink-2",
        ok: "border-line border-l-ok",
        warn: "border-line border-l-warn",
        danger: "border-line border-l-danger",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface ToastOptions extends VariantProps<typeof toastVariants> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 오른쪽에 붙는 되돌리기 등. `altText` 는 스크린리더가 읽는 대체 문구다. */
  action?: { label: string; altText: string; onSelect: () => void };
  /** ms. `0` 이면 사용자가 닫을 때까지 남는다 — 실패 알림에만 쓴다. */
  duration?: number;
}

interface QueuedToast extends ToastOptions {
  id: number;
  open: boolean;
}

interface ToastApi {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  /** 화면에 동시에 보일 최대 개수. 넘치면 오래된 것부터 닫는다. */
  limit?: number;
  /** 기본 노출 시간(ms). 판정 실패처럼 읽는 데 시간이 걸리는 것은 호출처가 늘린다. */
  duration?: number;
  /** 뷰포트 위치. 캔버스 위 도구 클러스터와 겹치지 않는 쪽을 앱이 고른다. */
  position?: "bottom-right" | "bottom-center" | "top-right" | "top-center";
}

const VIEWPORT_POSITION: Record<NonNullable<ToastProviderProps["position"]>, string> = {
  "bottom-right": "bottom-0 right-0 items-end",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-0 right-0 items-end",
  "top-center": "top-0 left-1/2 -translate-x-1/2 items-center",
};

export function ToastProvider({
  children,
  limit = 3,
  duration = 4200,
  position = "bottom-right",
}: ToastProviderProps) {
  const [queue, setQueue] = useState<readonly QueuedToast[]>([]);
  const nextId = useRef(0);
  const removalTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    /* 제어 prop으로 닫은 경우 Radix가 onOpenChange를 다시 부르지 않는다. 모든 닫힘 경로를
       큐 상태에서 정리해야 명시적 dismiss와 개수 제한도 같은 퇴장 수명을 갖는다. */
    for (const item of queue) {
      if (item.open || removalTimers.current.has(item.id)) continue;
      removalTimers.current.set(item.id, setTimeout(() => {
        removalTimers.current.delete(item.id);
        setQueue(prev => prev.filter(toast => toast.id !== item.id));
      }, 240));
    }
  }, [queue]);
  useEffect(() => () => {
    for (const timer of removalTimers.current.values()) clearTimeout(timer);
    removalTimers.current.clear();
  }, []);

  const dismiss = useCallback((id: number) => {
    setQueue(prev => prev.map(t => (t.id === id ? { ...t, open: false } : t)));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = ++nextId.current;
      setQueue(prev => {
        const next = [...prev, { ...options, id, open: true }];
        /* 넘치는 만큼 오래된 것을 «닫힘» 으로 표시한다. 배열에서 바로 빼면 퇴장 애니메이션이
           끊기고, Radix 가 포커스를 복귀시킬 대상을 잃는다. */
        const over = next.filter(t => t.open).length - limit;
        if (over <= 0) return next;
        let closed = 0;
        return next.map(t => (t.open && closed++ < over ? { ...t, open: false } : t));
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
        {queue.map(item => (
          <RadixToast.Root
            data-slot="toast"
            key={item.id}
            open={item.open}
            /* Radix 의 `duration` 은 필수 number 라 `undefined` 를 넘기면 타입이 깨진다.
               값이 없을 때는 Provider 의 기본값이 이겨야 하므로 **prop 자체를 빼야** 한다. */
            {...(item.duration === undefined ? {} : { duration: item.duration === 0 ? Infinity : item.duration })}
            onOpenChange={open => {
              if (open) return;
              dismiss(item.id);
            }}
            className={cn(toastVariants({ tone: item.tone }))}
          >
            <div className="min-w-0 flex-1">
              <RadixToast.Title className="font-semibold">{item.title}</RadixToast.Title>
              {item.description ? (
                <RadixToast.Description className="mt-1 leading-relaxed text-muted">
                  {item.description}
                </RadixToast.Description>
              ) : null}
            </div>
            {item.action ? (
              <RadixToast.Action
                data-slot="toast-action"
                altText={item.action.altText}
                onClick={item.action.onSelect}
                className="appearance-none border-0 bg-transparent p-0 font-inherit text-inherit shrink-0 cursor-pointer rounded-control border border-solid border-line-strong bg-surface px-3 py-1 text-body text-ink hover:bg-surface-2 focus-visible:focus-ring focus-visible:outline-none"
              >
                {item.action.label}
              </RadixToast.Action>
            ) : null}
            <RadixToast.Close
              data-slot="toast-close"
              aria-label="Dismiss"
              className="appearance-none border-0 bg-transparent p-0 font-inherit text-inherit -mr-1 -mt-1 shrink-0 cursor-pointer rounded-control p-1 text-muted hover:bg-surface-2 hover:text-ink focus-visible:focus-ring focus-visible:outline-none"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-6">
                <path
                  d="M4.4 4.4l7.2 7.2M11.6 4.4l-7.2 7.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport
          className={cn(
            "pointer-events-none fixed z-50 m-0 flex max-h-screen w-[min(320px,calc(100vw-24px))] flex-col gap-4 p-6 outline-none",
            VIEWPORT_POSITION[position],
          )}
        />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
