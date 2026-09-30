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
