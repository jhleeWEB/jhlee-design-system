import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemePair } from "../../stories/decorators/ThemePair";
import { Button } from "../primitives/Button";
import { Breadcrumb } from "./Breadcrumb";
import { TopBar, type TopBarProps } from "./TopBar";

/* 3스토리 계약(본보기 Button.stories). 축은 `size`(sm · md) — Variants 는 크기 × 채움(제목만 · 슬롯 전부) 격자다.
 * 한 화면에 상단바를 여럿 그리면 제목 단계를 2 로 내린다 — 한 문서의 h1 은 하나가 맞다. */
const sizeValues = ["sm", "md"] as const;

function Logo() {
  return (
    <span
      aria-hidden="true"
      className="grid size-7 place-items-center rounded-md bg-primary font-mono text-micro font-medium text-primary-foreground"
    >
      BO
    </span>
  );
}

// 링크(href) 대신 onSelect 조각을 쓴다 — Breadcrumb 의 <a> 는 지금 UA 링크색을 지우지 않는다(이 PR 밖의 결함, 보고에 적었다).
const crumbs = [{ label: "Projects", onSelect: () => {} }, { label: "Dahisar" }];

function Actions() {
  return (
    <>
      <Button variant="ghost" size="sm">
        Share
      </Button>
      <Button size="sm" variant="solid" tone="primary">
        Save scheme
      </Button>
    </>
  );
}

const meta = {
  title: "Navigation/TopBar",
  component: TopBar,
  args: { title: "Residential Studio", eyebrow: "Planning draft", size: "md" },
  argTypes: { size: { control: "select", options: sizeValues } },
  render: (args) => (
    <TopBar {...args} leading={<Logo />} breadcrumb={<Breadcrumb items={crumbs} />} actions={<Actions />} />
  ),
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Residential Studio" })).toBeInTheDocument();
    await expect(canvas.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Save scheme" })).toBeInTheDocument();
  },
};

const cases: readonly (TopBarProps & { key: string; full: boolean })[] = sizeValues.flatMap((size) =>
  [false, true].map((full) => ({
    key: `${size}-${full}`,
    size,
    full,
    title: `Studio (${size})`,
    headingLevel: 2 as const,
  })),
);

export const Variants: Story = {
  tags: ["!manifest"],
  render: () => (
    <div className="flex flex-col gap-4">
      {/* <header> 는 구획(section) 밖에서 banner 랜드마크다 — 여럿을 나란히 두면 banner 가 겹치므로 칸마다 이름 붙은 구획에 넣는다. */}
      {cases.map(({ key, full, ...props }) => (
        <section key={key} aria-label={`Top bar ${key}`}>
          <TopBar
            {...props}
            {...(full
              ? {
                  eyebrow: "Planning draft",
                  leading: <Logo />,
                  breadcrumb: <Breadcrumb aria-label={`Breadcrumb ${key}`} items={crumbs} />,
                  actions: <Actions />,
                }
              : {})}
          />
        </section>
      ))}
    </div>
  ),
};

export const ThemeContrast: Story = {
  render: (args) => (
    <ThemePair>
      {(theme) => (
        <TopBar
          {...args}
          headingLevel={2}
          className="rounded-lg border border-border"
          leading={<Logo />}
          breadcrumb={<Breadcrumb aria-label={`Breadcrumb (${theme})`} items={crumbs} />}
          actions={<Actions />}
        />
      )}
    </ThemePair>
  ),
};
