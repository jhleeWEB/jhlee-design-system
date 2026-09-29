import rule from "../rules/no-literal-style-value.js";
import { syntaxTester } from "./rule-tester.js";

syntaxTester.run("no-literal-style-value", rule as never, {
  valid: [
    '<div className="rounded-control text-body duration-fast z-pop h-ctl" />;',
    // arbitrary variant(선택자)는 값이 아니다
    '<div className="[&>svg]:size-icon data-[state=open]:bg-surface-2" />;',
    // 변수 참조 arbitrary 는 토큰이다
    '<div className="w-(--w-rail) duration-(--duration-fast)" />;',
    'cn("flex gap-2", active && "bg-accent-soft");',
    'cva("inline-flex", { variants: { size: { sm: "h-ctl-sm", md: "h-ctl" } } });',
    // 클래스 자리가 아닌 문자열은 보지 않는다
    'const label = "#0869e1 is azure"; <span title="16px" />;',
    'const w = "w-[16px]";',
  ],
  invalid: [
    { code: '<div className="rounded-[7px]" />;', errors: [{ messageId: "arbitraryLiteral", data: { token: "rounded-[7px]" } }] },
    { code: '<div className="w-[16px] h-4" />;', errors: [{ messageId: "arbitraryLiteral" }] },
    { code: '<div className="bg-[#0869e1]" />;', errors: [{ messageId: "arbitraryLiteral" }] },
    { code: '<div className="text-[rgb(0,0,0)]" />;', errors: [{ messageId: "arbitraryLiteral" }] },
    { code: '<div className="hover:duration-[150ms]" />;', errors: [{ messageId: "arbitraryLiteral" }] },
    { code: '<div className="duration-100" />;', errors: [{ messageId: "defaultScale", data: { token: "duration-100" } }] },
    { code: '<div className="z-50 leading-5" />;', errors: [{ messageId: "defaultScale" }, { messageId: "defaultScale" }] },
    { code: '<div className="md:!z-50" />;', errors: [{ messageId: "defaultScale" }] },
    { code: '<div className={`flex ${x} tracking-2`} />;', errors: [{ messageId: "defaultScale" }] },
    { code: '<div className={open ? "z-50" : "z-pop"} />;', errors: [{ messageId: "defaultScale" }] },
    { code: 'cn("flex", { "w-[16px]": wide });', errors: [{ messageId: "arbitraryLiteral" }] },
    { code: 'cn("flex", ["mt-[1rem]"]);', errors: [{ messageId: "arbitraryLiteral" }] },
    { code: 'cva("inline-flex duration-100", { variants: { tone: { ok: "bg-[#fff]" } } });', errors: [{ messageId: "defaultScale" }, { messageId: "arbitraryLiteral" }] },
    { code: 'twMerge("p-2", "p-[3px]");', errors: [{ messageId: "arbitraryLiteral" }] },
    // className 속성과 cn 호출이 겹치는 자리 — 한 번만 보고한다
    { code: '<div className={cn("w-[16px]", active && "duration-100")} />;', errors: [{ messageId: "arbitraryLiteral" }, { messageId: "defaultScale" }] },
  ],
});
