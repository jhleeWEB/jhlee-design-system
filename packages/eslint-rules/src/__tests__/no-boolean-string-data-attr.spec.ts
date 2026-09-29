import rule from "../rules/no-boolean-string-data-attr.js";
import { syntaxTester, typedFile, typedTester } from "./rule-tester.js";

/* 타입 정보 없이 — 구문 폴백. */
syntaxTester.run("no-boolean-string-data-attr (syntax)", rule as never, {
  valid: [
    '<div data-collapsed={collapsed || undefined} />;',
    '<div data-scroll-active={active ? "true" : "false"} />;',
    '<div data-variant={variant} />;',
    '<div data-slot="button" />;',
    '<div data-open />;',
    '<div aria-hidden={!open} hidden={!open} />;',
  ],
  invalid: [
    { code: "<div data-open={false} />;", errors: [{ messageId: "booleanDataAttr" }] },
    { code: "<div data-closed={!open} />;", errors: [{ messageId: "booleanDataAttr" }] },
    { code: '<div data-active={value === "a"} />;', errors: [{ messageId: "booleanDataAttr" }] },
    { code: "<div data-on={Boolean(x)} />;", errors: [{ messageId: "booleanDataAttr" }] },
    { code: "<div data-on={x ? true : false} />;", errors: [{ messageId: "booleanDataAttr" }] },
  ],
});

/* 타입 정보로 — identifier 의 선언 타입을 본다. */
typedTester.run("no-boolean-string-data-attr (typed)", rule as never, {
  valid: [
    { filename: typedFile, code: 'declare const variant: "a" | "b"; const el = <div data-variant={variant} />;' },
    { filename: typedFile, code: "declare const open: boolean; const el = <div data-open={open || undefined} />;" },
    { filename: typedFile, code: "declare const n: number | undefined; const el = <div data-count={n} />;" },
    { filename: typedFile, code: "declare const t: true | undefined; const el = <div data-on={t} />;" },
  ],
  invalid: [
    { filename: typedFile, code: "declare const open: boolean; const el = <div data-open={open} />;", errors: [{ messageId: "booleanDataAttr" }] },
    { filename: typedFile, code: "declare const s: { open: boolean }; const el = <div data-open={s.open} />;", errors: [{ messageId: "booleanDataAttr" }] },
    { filename: typedFile, code: "declare const sel: boolean; declare const on: boolean; const el = <div data-selected={on ? sel : undefined} />;", errors: [{ messageId: "booleanDataAttr" }] },
    { filename: typedFile, code: "declare function isOn(): boolean; const el = <div data-on={isOn()} />;", errors: [{ messageId: "booleanDataAttr" }] },
  ],
});
