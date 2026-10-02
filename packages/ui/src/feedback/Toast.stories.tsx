import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { MOTION } from "../generated/tokens";
import { Button } from "../primitives/Button";
import { ToastProvider, useToast, type ToastOptions } from "./Toast";

/* 3스토리 계약(본보기 primitives/Button.stories). 대상은 ToastProvider — 큐 밖의 속성은 뷰포트(ol)로 간다.
 *
 * 결정성: 토스트는 마운트 때 한 번(`Seed`) 띄우고 `duration: 0`(닫을 때까지 남는다)으로 둔다 — 자동 해제 타이머가 스크린샷과
 * 경주하지 않는다. 진입 애니메이션은 유한이라 VRT(animations: "disabled")가 끝 프레임을 찍는다.
 * Variants·ThemeContrast 는 뷰포트에 `static` 을 넘겨 흐름 안에 놓는다(fixed 는 한 화면에 하나만 설 수 있다) — className 전달의 쓰임새이기도 하다. */
const toneValues = ["neutral", "success", "warning", "destructive"] as const;
const positionValues = ["bottom-right", "bottom-center", "top-right", "top-center"] as const;

const SAMPLE: Record<(typeof toneValues)[number], ToastOptions> = {
  neutral: { title: "Link copied", duration: 0 },
  success: { title: "Layout saved", description: "Version 12 is now the current layout.", duration: 0 },
  warning: {
    title: "3 values are placeholders",
    description: "They will be replaced when the source file is linked.",
    duration: 0,
  },
  destructive: {
    title: "Export failed",
    description: "The file could not be written.",
    action: { label: "Retry", altText: "Retry the export", onSelect: () => {} },
    duration: 0,
  },
};

/** 마운트 때 한 번만 띄운다 — StrictMode 의 이중 effect 에도 두 번 쌓이지 않게 ref 로 막는다. */
function Seed({ toasts }: { toasts: readonly ToastOptions[] }) {
  const { toast } = useToast();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    for (const options of toasts) toast(options);
  }, [toast, toasts]);
  return null;
}

const meta = {
  title: "Feedback/Toast",
  component: ToastProvider,
  args: { position: "bottom-right", limit: 3, children: null },
  argTypes: { position: { control: "select", options: positionValues } },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /* 뷰포트는 fixed 라 제 상자가 비어 보인다 — 앱 자리의 글 한 줄이 루트의 첫 보이는 자식이 되어 VRT 가 렌더 완료를 기다릴 수 있다. */
  render: (args) => (
    <ToastProvider {...args}>
      <p className="m-0 text-body text-foreground">
        Notifications stack in the corner chosen by the position prop.
      </p>
      <Seed toasts={[{ ...SAMPLE.success, tone: "success" }]} />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.ownerDocument.querySelector('[data-slot="toast-viewport"]');
    await expect(viewport).toHaveTextContent("Layout saved");
  },
};

export const Variants: Story = {
  tags: ["!manifest"],
  args: { limit: toneValues.length },
  render: (args) => (
    <ToastProvider {...args} className="static">
      <Seed toasts={toneValues.map((tone) => ({ ...SAMPLE[tone], tone }))} />
    </ToastProvider>
  ),
};

export const ThemeContrast: Story = {
  args: { limit: toneValues.length },
  /* ThemePair 는 같은 자식을 두 번 그려 뷰포트 region 의 이름이 겹친다(landmark-unique) — 같은 모양의 두 칸을 여기서 펴고
     `label` 로 칸마다 이름을 준다. 모양은 stories/decorators/ThemePair 와 같다. */
  render: (args) => (
    <div className="grid grid-cols-2 gap-0 font-sans text-body">
      {(["light", "dark"] as const).map((theme) => (
        <section
          key={theme}
          data-theme={theme}
          data-testid={`theme-${theme}`}
          className="flex flex-col gap-3 bg-background p-6 text-foreground"
        >
          <span className="font-mono text-micro font-medium tracking-caps text-muted-foreground uppercase">
            {theme}
          </span>
          <ToastProvider {...args} className="static" label={`Notifications · ${theme}`}>
            <Seed toasts={toneValues.map((tone) => ({ ...SAMPLE[tone], tone }))} />
          </ToastProvider>
        </section>
      ))}
    </div>
  ),
};

/** 타이머 토스트를 버튼으로 띄운다 — 하단 막대가 남은 시간을 줄이고, 뷰포트에 마우스를 올리면 타이머와 막대가 함께 멈춘다. */
function TimerDemo() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      {toneValues.map((tone) => (
        <Button
          key={tone}
          size="sm"
          variant="outline"
          /* duration 을 비워 Provider 의 기본 시간(MOTION.toastDefaultMs)을 쓴다 — SAMPLE 의 duration: 0 을 덮어 지운다. */
          onClick={() => toast({ ...SAMPLE[tone], tone, duration: undefined })}
        >
          Show {tone}
        </Button>
      ))}
    </div>
  );
}

/**
 * 시간이 있는 토스트 — 하단 막대가 남은 시간을 보여 준다. 실시간이라 VRT 에서 뺀다(`!vrt`): 막대는 유한 애니메이션이라
 * 스냅샷이 끝 프레임(빈 막대)만 찍어 쓸모가 없고, 자동 해제가 촬영과 경주한다. 동작은 play 가 본다.
 */
export const Timer: Story = {
  tags: ["!vrt", "!manifest"],
  args: { limit: toneValues.length },
  render: (args) => (
    <ToastProvider {...args}>
      <TimerDemo />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Show success" }));
    const toastEl = await waitFor(() => {
      const el = doc.querySelector<HTMLElement>('[data-slot="toast"][data-tone="success"]');
      if (!el) throw new Error("toast not shown");
      return el;
    });
    const bar = toastEl.querySelector<HTMLElement>('[data-slot="toast-progress"]');
    await expect(bar).not.toBeNull();
    await expect(bar?.style.animationDuration).toBe(`${MOTION.toastDefaultMs}ms`);
    /* 뷰포트에 포인터가 들어오면 Radix 가 타이머를 멈추고 막대도 멈춘다. */
    await userEvent.hover(toastEl);
    await waitFor(() => expect(toastEl).toHaveAttribute("data-paused"));
    await userEvent.unhover(toastEl);
    await waitFor(() => expect(toastEl).not.toHaveAttribute("data-paused"));
  },
};
