import { StrictMode, act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ConfirmDialog, Modal, ModalBody, ModalContent, ModalHeader, ModalTrigger } from "../overlay";

/* 게이트(#1198)가 정한 회귀 검사.
 *
 * 이 저장소의 손으로 쓴 백드롭 다섯 계열에는 **포커스 트랩도 스크롤 락도 포털도 없었다**
 * (`createPortal` 호출 0건). 그 셋은 «있는 줄 알았는데 없는» 부류라 눈으로는 회귀를 못 잡는다.
 * 여기서 못 박는다. */

let host: HTMLDivElement;
let root: Root;

function render(ui: React.ReactNode) {
  act(() => {
    root.render(<StrictMode>{ui}</StrictMode>);
  });
}

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.body.removeAttribute("style");
  document.body.removeAttribute("data-scroll-locked");
});

describe("Modal", () => {
  it("열기 전에는 내용이 DOM 에 없다", () => {
    render(
      <Modal>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalHeader title="Apply scheme" />
          <ModalBody>body</ModalBody>
        </ModalContent>
      </Modal>,
    );
    expect(document.querySelector('[data-slot="modal"]')).toBeNull();
  });

  it("body 밖 포털로 렌더되고 스크림을 함께 세운다", () => {
    render(
      <Modal defaultOpen>
        <ModalContent>
          <ModalHeader title="Apply scheme" />
          <ModalBody>body</ModalBody>
        </ModalContent>
      </Modal>,
    );
    const modal = document.querySelector('[data-slot="modal"]');
    expect(modal).not.toBeNull();
    /* 포털이 아니면 `host` 안에 남는다 — 그러면 캔버스의 transform·overflow 가 모달을 자른다. */
    expect(host.contains(modal)).toBe(false);
    expect(document.querySelector('[data-slot="modal-scrim"]')).not.toBeNull();
  });

  it("접근 이름을 제목에서 끌어온다", () => {
    render(
      <Modal defaultOpen>
        <ModalContent>
          <ModalHeader title="Apply scheme 03" />
          <ModalBody>body</ModalBody>
        </ModalContent>
      </Modal>,
    );
    const modal = document.querySelector('[data-slot="modal"]');
    expect(modal?.getAttribute("role")).toBe("dialog");
    /* `aria-modal` 은 **없는 것이 맞다.** Radix 는 그 속성 대신 바깥 내용에 `aria-hidden` 을
       걸어 모달성을 만든다 — 스크린리더 지원이 더 낫다는 것이 그쪽의 판단이고, 실제 DOM 을
       찍어 확인했다. 여기서는 «이름이 제목에서 온다» 만 못 박는다. */
    expect(modal?.hasAttribute("aria-modal")).toBe(false);
    const labelledBy = modal?.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)?.textContent).toBe("Apply scheme 03");
  });

  it("열리면 body 스크롤을 잠그고 바깥 포인터를 막는다", () => {
    expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
    render(
      <Modal defaultOpen>
        <ModalContent>
          <ModalHeader title="Apply scheme" />
          <ModalBody>body</ModalBody>
        </ModalContent>
      </Modal>,
    );
    /* 잠기지 않으면 모달 뒤의 캔버스가 휠에 따라 움직인다 — 손으로 쓴 다섯 계열의 실제 증상.
       인라인 `overflow` 가 아니라 **속성 + 주입 스타일시트**로 잠근다(실제 DOM 을 찍어 확인).
       `body.style.overflow` 를 보면 영원히 빈 문자열이라 이 검사가 공허해진다. */
    expect(document.body.getAttribute("data-scroll-locked")).toBe("1");
    const locked = [...document.querySelectorAll("style")].some((node) =>
      /body\[data-scroll-locked\][^}]*overflow:\s*hidden/.test(node.textContent ?? ""),
    );
    expect(locked).toBe(true);
    /* 바깥은 포인터를 받지 않는다 — 스크림 아래 버튼이 눌리는 것을 막는 장치다. */
    expect(document.body.style.pointerEvents).toBe("none");
  });

  it("닫히면 잠금을 되돌린다", () => {
    render(
      <Modal defaultOpen>
        <ModalContent>
          <ModalHeader title="Apply scheme" />
          <ModalBody>body</ModalBody>
        </ModalContent>
      </Modal>,
    );
    expect(document.body.hasAttribute("data-scroll-locked")).toBe(true);
    /* 되돌리지 않으면 모달을 한 번 연 뒤로 앱 전체가 스크롤되지 않는다 — 손으로 쓴 구현이
       실제로 못 하던 뒷정리다. */
    render(
      <Modal open={false}>
        <ModalContent>
          <ModalHeader title="Apply scheme" />
          <ModalBody>body</ModalBody>
        </ModalContent>
      </Modal>,
    );
    expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
    expect(document.body.style.pointerEvents).not.toBe("none");
  });

  it("dismissible=false 면 바깥을 눌러도 닫히지 않는다", () => {
    render(
      <Modal defaultOpen>
        <ModalContent dismissible={false}>
          <ModalHeader title="Apply scheme" />
          <ModalBody>body</ModalBody>
        </ModalContent>
      </Modal>,
    );
    const scrim = document.querySelector('[data-slot="modal-scrim"]') as HTMLElement;
    act(() => {
      scrim.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
      scrim.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      scrim.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(document.querySelector('[data-slot="modal"]')).not.toBeNull();
  });
});

describe("ConfirmDialog", () => {
  it("alertdialog 로 알리고 실행 문구를 그대로 싣는다", () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="Delete this parcel?"
        description="Saved schemes for this parcel are removed too."
        confirmLabel="Delete parcel"
        onConfirm={() => {}}
      />,
    );
    const dialog = document.querySelector('[data-slot="confirm-dialog"]');
    expect(dialog?.getAttribute("role")).toBe("alertdialog");
    /* 실행 버튼은 「OK」가 아니라 무슨 일이 일어나는지를 적는다 — 이 규칙이 문서에만 남지 않게 한다. */
    const labels = [...document.querySelectorAll("button")].map((b) => b.textContent);
    expect(labels).toContain("Delete parcel");
    expect(labels).not.toContain("OK");
  });
});
