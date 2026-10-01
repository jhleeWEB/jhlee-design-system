import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import tokensCss from "../src/generated/tokens.css?raw";

/* Foundations/Colors — 크롬 · 캔버스 색 토큰 전부의 견본 시트(#70 · 3번).
 * 왜 따로 두는가: 컴포넌트 스냅샷에서 토큰 하나가 한 단 움직여도 글자 안쪽 몇십 픽셀만 바뀌고(#55 의 muted-foreground 가 그랬다),
 * 어떤 토큰은 오늘 아무 스토리도 칠하지 않는다. 여기서는 토큰마다 넓은 면을 칠해 어느 색이 한 단만 움직여도 VRT 가 수천 픽셀로 잡는다.
 * 목록은 생성물 `tokens.css` 를 그대로 읽는다 — 정본(tokens/*.json)에 토큰을 더하면 이 시트에 저절로 선다(손 목록은 낡는다).
 * 다크는 VRT 가 모든 스토리를 라이트·다크로 찍어 따로 두지 않는다 — 다크 스냅샷이 다크 블록의 값을 칠한다. */

/** 크롬 블록(`:root, [data-theme="light"] { … }`)과 첫 `:root` 블록의 캔버스 선언에서 이름만 정본 순서로 뽑는다. */
function tokenNames(prefix: "--chrome-" | "--canvas-"): string[] {
  const block =
    prefix === "--chrome-"
      ? (/:root,\s*\[data-theme="light"\]\s*\{([^}]*)\}/.exec(tokensCss)?.[1] ?? "")
      : (/:root\s*\{([^}]*)\}/.exec(tokensCss)?.[1] ?? "");
  const names: string[] = [];
  for (const match of block.matchAll(/(--(?:chrome|canvas)-[\w-]+)\s*:/g)) {
    const name = match[1];
    if (name?.startsWith(prefix)) names.push(name);
  }
  return names;
}

const CHROME = tokenNames("--chrome-");
const CANVAS = tokenNames("--canvas-");

function Swatch({ name }: { name: string }) {
  return (
    <li data-swatch={name} className="flex flex-col gap-1">
      <div className="h-12 rounded-sm border border-border-strong" style={{ background: `var(${name})` }} />
      <span className="font-mono text-micro text-foreground-2">{name}</span>
    </li>
  );
}

function Sheet({ label, names }: { label: string; names: readonly string[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="m-0 text-label font-semibold text-foreground">{label}</h2>
      <ul className="m-0 grid list-none grid-cols-6 gap-3 p-0">
        {names.map((name) => (
          <Swatch key={name} name={name} />
        ))}
      </ul>
    </section>
  );
}

const meta = {
  title: "Foundations/Colors",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 크롬(테마마다 다른 값)과 캔버스(흰 바탕 고정 · 다크 없음) 토큰 전부. */
export const Tokens: Story = {
  render: () => (
    <div className="flex flex-col gap-8 bg-background p-6 font-sans text-body text-foreground">
      <Sheet label="Chrome" names={CHROME} />
      <Sheet label="Canvas" names={CANVAS} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    /* 파싱이 조용히 0개를 내면 시트가 빈 채로 VRT 를 통과한다 — 정본 블록 모양이 바뀌면 여기서 먼저 깨진다. */
    const swatches = within(canvasElement).getAllByRole("listitem");
    await expect(CHROME.length).toBeGreaterThan(40);
    await expect(CANVAS.length).toBeGreaterThan(5);
    await expect(swatches).toHaveLength(CHROME.length + CANVAS.length);
  },
};
