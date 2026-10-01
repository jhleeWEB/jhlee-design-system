/* jsdom에는 레이아웃 관찰 API가 없다. 실측은 브라우저가 맡고 DOM 테스트는 수명 연결만 제공한다. */
// jest-dom 매처(toBeInTheDocument · toHaveAttribute …)를 vitest 의 expect 에 붙인다(C3).
import "@testing-library/jest-dom/vitest";

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

/* Radix Select 는 열릴 때 고른 항목을 `scrollIntoView` 하고 트리거에서 포인터 캡처를 푼다 — jsdom 에는 둘 다 없어 열린 목록을 그리는 순간 던진다(#47). */
if (typeof Element !== "undefined") {
  const stubs: Record<string, () => unknown> = {
    scrollIntoView: () => undefined,
    hasPointerCapture: () => false,
    releasePointerCapture: () => undefined,
  };
  for (const [name, value] of Object.entries(stubs)) {
    if (!(name in Element.prototype))
      Object.defineProperty(Element.prototype, name, { value, configurable: true, writable: true });
  }
}
