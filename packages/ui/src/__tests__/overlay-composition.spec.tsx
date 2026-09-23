import { createRef, type ComponentProps } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Dialog } from "radix-ui";
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { ScrollArea } from "../navigation/ScrollArea";
import { ConfirmDialog } from "../overlay/AlertDialog";
import { Drawer, DrawerContent, DrawerHeader } from "../overlay/Drawer";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger,
} from "../overlay/DropdownMenu";
import { Modal, ModalContent, ModalHeader } from "../overlay/Modal";
import { Popover, PopoverContent } from "../overlay/Popover";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.style.pointerEvents = "";
});

describe("오버레이의 Radix 합성 계약", () => {
  it("메뉴 링크에 장식과 역할을 합성하고 자식·외부 ref와 이벤트를 함께 보존한다", () => {
    const childRef = createRef<HTMLAnchorElement>();
    const detached = vi.fn();
    const ref = vi.fn((node: HTMLDivElement | null) => node ? detached : undefined);
    const clicked = vi.fn();
    const selected = vi.fn((event: Event) => event.preventDefault());
    const { unmount } = render(<DropdownMenu defaultOpen modal={false}>
      <DropdownMenuContent>
        <DropdownMenuItem asChild ref={ref} shortcut="⌘O" onSelect={selected}>
          <a ref={childRef} href="#open" onClick={clicked}>Open design</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>);
    const item = screen.getByRole("menuitem", { name: "Open design ⌘O" });
    expect(item.tagName).toBe("A");
    expect(item.getAttribute("href")).toBe("#open");
    expect(item.querySelector("a")).toBeNull();
    expect(item.querySelector("kbd")?.textContent).toBe("⌘O");
    expect(childRef.current).toBe(item);
    expect(ref).toHaveBeenCalledWith(item);
    fireEvent.keyDown(item, { key: "Enter" });
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(selected).toHaveBeenCalledTimes(1);
    unmount();
    expect(childRef.current).toBeNull();
    expect(detached).toHaveBeenCalledTimes(1);
  });

  it("체크·라디오 메뉴의 asChild도 선택 상태와 선택 이벤트를 자식 버튼에 연결한다", () => {
    const checked = vi.fn();
    const changed = vi.fn();
    render(<DropdownMenu defaultOpen modal={false}>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem asChild checked onCheckedChange={checked} onSelect={event => event.preventDefault()}>
          <button type="button">Show labels</button>
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="plan" onValueChange={changed}>
          <DropdownMenuRadioItem asChild value="model" onSelect={event => event.preventDefault()}>
            <button type="button">Model</button>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>);
    const checkbox = screen.getByRole("menuitemcheckbox", { name: "Show labels" });
    expect(checkbox.tagName).toBe("BUTTON");
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(checkbox.querySelector("svg")).not.toBeNull();
    fireEvent.click(checkbox);
    expect(checked).toHaveBeenCalledExactlyOnceWith(false);
    const radio = screen.getByRole("menuitemradio", { name: "Model" });
    expect(radio.tagName).toBe("BUTTON");
    fireEvent.click(radio);
    expect(changed).toHaveBeenCalledExactlyOnceWith("model");
  });

  it("장식이 있는 서브메뉴 트리거도 오른쪽 방향키로 열린다", async () => {
    const ref = createRef<HTMLDivElement>();
    render(<DropdownMenu defaultOpen modal={false}>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger asChild><button type="button">Views</button></DropdownMenuSubTrigger>
          <DropdownMenuSubContent ref={ref}><DropdownMenuItem>Plan view</DropdownMenuItem></DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>);
    const trigger = screen.getByRole("menuitem", { name: "Views" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.querySelector("svg")).not.toBeNull();
    fireEvent.keyDown(trigger, { key: "ArrowRight" });
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));
    expect(ref.current?.contains(screen.getByRole("menuitem", { name: "Plan view" }))).toBe(true);
  });

  it("화살표가 있는 팝오버도 소비자 요소에 역할·ref를 합성한다", () => {
    const ref = createRef<HTMLDivElement>();
    const childRef = createRef<HTMLDivElement>();
    const { unmount } = render(<Popover defaultOpen>
      <PopoverContent asChild arrow ref={ref} aria-label="View settings">
        <div ref={childRef}><input aria-label="Scale" defaultValue="100" /></div>
      </PopoverContent>
    </Popover>);
    const content = screen.getByRole("dialog", { name: "View settings" });
    expect(ref.current).toBe(content);
    expect(childRef.current).toBe(content);
    expect(content.querySelector("svg")).not.toBeNull();
    expect(content.contains(screen.getByRole("textbox", { name: "Scale" }))).toBe(true);
    unmount();
    expect(ref.current).toBeNull();
    expect(childRef.current).toBeNull();
  });

  it("Drawer Root의 modal=false는 외부 포커스·포인터·접근성 트리를 막지 않는다", () => {
    const ref = createRef<HTMLDivElement>();
    const { unmount } = render(<>
      <button type="button">Canvas tool</button>
      <Drawer open modal={false}>
        <DrawerContent ref={ref}><DrawerHeader title="Inspector" description="View settings" /></DrawerContent>
      </Drawer>
    </>);
    const outside = screen.getByRole("button", { name: "Canvas tool" });
    expect(ref.current).toBe(screen.getByRole("dialog", { name: "Inspector" }));
    expect(document.body.style.pointerEvents).not.toBe("none");
    expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
    act(() => outside.focus());
    expect(document.activeElement).toBe(outside);
    unmount();
    expect(ref.current).toBeNull();
  });

  it("showOverlay=false는 스크림만 숨기고 모달 잠금은 유지한다", () => {
    render(<Drawer defaultOpen><DrawerContent showOverlay={false}><DrawerHeader title="Inspector" description="View settings" /></DrawerContent></Drawer>);
    expect(document.querySelector(".bg-scrim")).toBeNull();
    expect(document.body.style.pointerEvents).toBe("none");
  });

  it("DS Header 밖의 사용자 정의 Description과 명시적 설명 생략을 보존한다", () => {
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(<Modal open><ModalContent ref={ref}>
      <ModalHeader title="Settings" />
      <Dialog.Description>Custom description</Dialog.Description>
    </ModalContent></Modal>);
    const content = screen.getByRole("dialog", { name: "Settings" });
    expect(ref.current).toBe(content);
    expect(document.getElementById(content.getAttribute("aria-describedby")!)?.textContent).toBe("Custom description");
    rerender(<Modal open><ModalContent ref={ref} aria-describedby={undefined}><ModalHeader title="Settings" /></ModalContent></Modal>);
    expect(ref.current).toBe(content);
    expect(content.hasAttribute("aria-describedby")).toBe(false);
    rerender(<Modal open={false}><ModalContent ref={ref} aria-describedby={undefined}><ModalHeader title="Settings" /></ModalContent></Modal>);
    expect(ref.current).toBeNull();
    expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
  });

  it("ConfirmDialog의 선택적 설명과 사용자 지정 설명 연결은 실제 노드를 가리킨다", () => {
    const ref = createRef<HTMLDivElement>();
    const common = { open: true, onOpenChange: vi.fn(), title: "Delete design", confirmLabel: "Delete", onConfirm: vi.fn(), ref };
    const { rerender } = render(<ConfirmDialog {...common} />);
    const content = screen.getByRole("alertdialog", { name: "Delete design" });
    expect(ref.current).toBe(content);
    expect(content.hasAttribute("aria-describedby")).toBe(false);
    rerender(<ConfirmDialog {...common} description="The saved design is removed." />);
    expect(document.getElementById(content.getAttribute("aria-describedby")!)?.textContent).toBe("The saved design is removed.");
    rerender(<ConfirmDialog {...common} aria-describedby="custom-confirm-description"><p id="custom-confirm-description">Custom warning</p></ConfirmDialog>);
    expect(content.getAttribute("aria-describedby")).toBe("custom-confirm-description");
    rerender(<ConfirmDialog {...common} description="Visible explanation" aria-describedby={undefined} />);
    expect(content.hasAttribute("aria-describedby")).toBe(false);
  });

  it("dismissible=false는 호출자의 바깥 이벤트 핸들러가 있어도 유지된다", async () => {
    const pointer = vi.fn();
    const interact = vi.fn();
    const changed = vi.fn();
    render(<Modal defaultOpen onOpenChange={changed}><ModalContent dismissible={false} onPointerDownOutside={pointer} onInteractOutside={interact}>
      <ModalHeader title="Apply design" description="Replace the current design." />
    </ModalContent></Modal>);
    // Radix의 바깥 포인터 리스너는 트리거의 같은 이벤트를 피하려고 다음 작업에 설치된다.
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
    fireEvent.pointerDown(document.querySelector('[data-slot="modal-scrim"]')!, { pointerType: "mouse", button: 0 });
    expect(pointer).toHaveBeenCalledTimes(1);
    expect(interact).toHaveBeenCalledTimes(1);
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Apply design" })).toBeDefined();
  });

  it("ScrollArea의 root·viewport ref와 스크롤 DOM을 독립적으로 보존한다", () => {
    const ref = createRef<HTMLDivElement>();
    const viewportRef = createRef<HTMLDivElement>();
    const { rerender, unmount } = render(<ScrollArea ref={ref} viewportRef={viewportRef}><input defaultValue="Draft" /></ScrollArea>);
    const root = ref.current!;
    const viewport = viewportRef.current!;
    const input = root.querySelector("input")!;
    input.value = "Unsaved draft";
    viewport.scrollTop = 45;
    rerender(<ScrollArea ref={ref} viewportRef={viewportRef} orientation="vertical"><input defaultValue="Draft" /></ScrollArea>);
    expect(ref.current).toBe(root);
    expect(viewportRef.current).toBe(viewport);
    expect(viewport.scrollTop).toBe(45);
    expect(root.querySelector("input")).toBe(input);
    expect(input.value).toBe("Unsaved draft");
    unmount();
    expect(ref.current).toBeNull();
    expect(viewportRef.current).toBeNull();
  });

  it("지원하지 않는 구조·포털 수명 prop은 공개 계약에 포함하지 않는다", () => {
    expectTypeOf<ComponentProps<typeof ScrollArea>>().not.toHaveProperty("asChild");
    expectTypeOf<NonNullable<ComponentProps<typeof ScrollArea>["viewportProps"]>>().not.toHaveProperty("asChild");
    expectTypeOf<ComponentProps<typeof ModalContent>>().not.toHaveProperty("forceMount");
    expectTypeOf<ComponentProps<typeof DrawerContent>>().not.toHaveProperty("forceMount");
    expectTypeOf<ComponentProps<typeof DrawerContent>>().not.toHaveProperty("modal");
    expectTypeOf<ComponentProps<typeof PopoverContent>>().not.toHaveProperty("forceMount");
    expectTypeOf<ComponentProps<typeof DropdownMenuContent>>().not.toHaveProperty("forceMount");
    expectTypeOf<ComponentProps<typeof DropdownMenuSubContent>>().not.toHaveProperty("forceMount");
  });
});
