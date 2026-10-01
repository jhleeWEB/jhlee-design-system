import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { CURSORS, cursorNames, cursorSvg, svgDataUri, type CursorName } from "../src/cursors/cursors";
import { ThemePair } from "./decorators/ThemePair";

/* Foundations/Cursors — 3D 모델링 커서(#64) 카탈로그.
 * 칸마다 두 가지를 보인다: 마우스를 올리면 그 커서가 되는 영역(`cursor: var(--cursor-<이름>)` — 생성물 generated/cursors.css)과
 * 같은 SVG 의 2배 미리보기(VRT 는 커서를 찍지 못하므로 모양은 미리보기가 기준선이 된다). 미리보기 위의 점이 핫스팟이다.
 * 변수 대신 Tailwind 유틸리티를 쓰려면 `cursor-cad-<이름>`(정적 문자열이어야 굽힌다 — 아래 UtilityClass 스토리). */

function CursorTile({ name }: { name: CursorName }) {
  const { label, hotspot, fallback } = CURSORS[name];
  return (
    <li data-cursor-tile={name} className="flex flex-col gap-2 rounded-md border border-border bg-card p-3">
      <div className="relative size-16 self-center">
        <img src={svgDataUri(cursorSvg(name))} alt={`${label} cursor`} className="block size-16" />
        {/* 핫스팟 — 32 칸 좌표를 2배(64px)로. 위치는 칸마다 달라 인라인 style 이다(색이 아니라 좌표). */}
        <span
          aria-hidden="true"
          className="absolute size-1 -translate-1/2 rounded-full bg-primary"
          style={{ left: hotspot[0] * 2, top: hotspot[1] * 2 }}
        />
      </div>
      <div
        data-cursor-target={name}
        className="flex h-ctl items-center justify-center rounded-sm border border-dashed border-border-strong text-micro text-muted-foreground"
        style={{ cursor: `var(--cursor-${name})` }}
      >
        Hover
      </div>
      <span className="font-mono text-micro text-foreground">{name}</span>
      <span className="tnum text-micro text-muted-foreground">
        {hotspot[0]} {hotspot[1]} · {fallback}
      </span>
    </li>
  );
}

function CursorGallery() {
  return (
    <div className="flex flex-col gap-4 font-sans text-body text-foreground">
      <p className="m-0 text-label text-muted-foreground">
        {cursorNames.length} cursors · 32×32 SVG · black body with a 1.5px white outline · hotspot · keyword
        fallback
      </p>
      <ul className="m-0 grid list-none grid-cols-6 gap-3 p-0">
        {cursorNames.map((n) => (
          <CursorTile key={n} name={n} />
        ))}
      </ul>
    </div>
  );
}

/* 바탕 시험 — 같은 커서가 흰 캔버스 · 크롬 바탕 · 어두운 면 위에서 모두 읽히는가(흰 외곽선의 몫). */
function Backgrounds() {
  const samples: readonly CursorName[] = [
    "select",
    "orbit",
    "pan",
    "crosshair",
    "draw",
    "zoom-window",
    "move",
    "wait",
  ];
  return (
    <div className="flex flex-col gap-3">
      {(["bg-canvas", "bg-muted", "bg-foreground"] as const).map((bg) => (
        <div key={bg} className={`flex gap-4 rounded-md p-4 ${bg}`}>
          {samples.map((n) => (
            <img
              key={n}
              src={svgDataUri(cursorSvg(n))}
              alt={`${CURSORS[n].label} cursor`}
              className="size-8"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: "Foundations/Cursors",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 전체 — 칸에 마우스를 올려 커서를 본다. 미리보기는 2배, 점이 핫스팟. */
export const Default: Story = {
  render: () => <CursorGallery />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(cursorNames.length);
    const target = canvasElement.querySelector<HTMLElement>('[data-cursor-target="orbit"]')!;
    /* 변수가 정의돼 있어야 url(...) 이 계산값에 남는다 — 정의가 없으면 auto 로 떨어진다. */
    await expect(getComputedStyle(target).cursor).toContain("url(");
  },
};

/** 바탕 시험 — 흰 캔버스 · 크롬 면 · 어두운 면. */
export const OnBackgrounds: Story = {
  render: () => <Backgrounds />,
};

/** Tailwind 유틸리티 — `cursor-cad-orbit` 같은 정적 클래스. */
export const UtilityClass: Story = {
  render: () => (
    <div className="flex gap-3 font-sans text-label text-foreground">
      <div
        data-testid="utility-orbit"
        className="cursor-cad-orbit rounded-md border border-border bg-card p-6"
      >
        cursor-cad-orbit
      </div>
      <div data-testid="utility-pan" className="cursor-cad-pan rounded-md border border-border bg-card p-6">
        cursor-cad-pan
      </div>
      <div
        data-testid="utility-crosshair"
        className="cursor-cad-crosshair rounded-md border border-border bg-card p-6"
      >
        cursor-cad-crosshair
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const id of ["utility-orbit", "utility-pan", "utility-crosshair"])
      await expect(getComputedStyle(canvas.getByTestId(id)).cursor).toContain("url(");
  },
};

/** 두 테마에 나란히 — 커서는 테마를 따르지 않는다(고정 대비). */
export const ThemeContrast: Story = {
  render: () => (
    <ThemePair>
      <Backgrounds />
    </ThemePair>
  ),
};
