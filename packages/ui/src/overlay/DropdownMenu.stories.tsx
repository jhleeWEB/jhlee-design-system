import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen } from "storybook/test";

import { ThemeSides } from "../../stories/helpers/ThemeSides";
import { Button } from "../primitives/Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./DropdownMenu";

/* 3스토리 계약(본보기 Button.stories). 메뉴는 **열린 채로** 그린다 — 트리거는 `#storybook-root` 안에 있고 상자는 포털로 뜬다.
 * 상자는 트리거 오른쪽으로 편다 — 아래로 펴면 뷰포트 끝에서 위로 뒤집혀 픽셀이 뷰포트 높이에 매인다(Radius 스토리의 실측).
 * `modal={false}` — 모달 메뉴는 바깥(트리거가 든 `#storybook-root`)을 aria-hidden 으로 가려 axe 의 aria-hidden-focus 에 걸린다
 *   (Radius 스토리 Components 의 면제가 그것이다). 모달성은 픽셀을 바꾸지 않는다.
 * `!autodocs` — 문서 페이지에 열린 메뉴 여럿이 뜨면 포커스가 페이지를 떠난다. */
const toneValues = ["neutral", "destructive"] as const;

const meta = {
  title: "Overlay/DropdownMenu",
  component: DropdownMenuContent,
  tags: ["!autodocs"],
  args: { side: "right", align: "start" },
} satisfies Meta<typeof DropdownMenuContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DropdownMenu open modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...args}>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Save revision</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async () => {
    const menu = await screen.findByRole("menu");
    await expect(menu).toHaveAttribute("data-slot", "menu");
    await expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveAttribute(
      "data-tone",
      "destructive",
    );
  },
};

/* 부품 전부 — 톤 두 값(neutral · destructive), 단축키, 비활성, 체크 · 라디오 항목, 머리글, 구분선, 하위 메뉴 트리거. */
export const Variants: Story = {
  // color-contrast: 단축키 kbd 의 text-foreground-disabled(2.43:1) — 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #20 · #24)
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  tags: ["!manifest"],
  render: (args) => (
    <DropdownMenu open modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">All parts</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...args}>
        <DropdownMenuLabel>tone</DropdownMenuLabel>
        <DropdownMenuGroup>
          {toneValues.map((tone) => (
            <DropdownMenuItem key={tone} tone={tone}>
              {tone}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem shortcut="⌘D">With shortcut</DropdownMenuItem>
          <DropdownMenuItem disabled>Unavailable</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>view</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked>Grid</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={false}>Dimensions</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="plan">
          <DropdownMenuRadioItem value="plan">Plan</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="section">Section</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Export as</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>PDF</DropdownMenuItem>
            <DropdownMenuItem>DXF</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/* 같은 메뉴를 라이트·다크로 — 포털이 칸을 벗어나므로 상자에 `data-theme` 을 직접 단다. */
export const ThemeContrast: Story = {
  // color-contrast: ThemeSides 칸 머리글(text-muted-foreground 4.33:1)이 토큰 값의 몫(contrast.spec KNOWN_FAILURES · #20 · #24) — Button ThemeContrast 와 같은 면제
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  render: (args) => (
    <ThemeSides>
      {(theme) => (
        <DropdownMenu open modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent {...args} data-theme={theme}>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Save revision</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem tone="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </ThemeSides>
  ),
};
