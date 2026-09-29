import rule from "../rules/no-magic-ms.js";
import { syntaxTester } from "./rule-tester.js";

syntaxTester.run("no-magic-ms", rule as never, {
  valid: [
    "setTimeout(fn, motion.toastExitMs);",
    "setTimeout(fn, 0);",
    "window.setTimeout(fn);",
    "<Tooltip delayDuration={motion.tooltipDelayMs} />;",
    '<Tooltip duration="fast" />;',
    "const t = { duration: motion.slow };",
    "function Tooltip({ delayDuration = motion.tooltipDelayMs }) {}",
    "foo.setTimeout(fn, 200);",
  ],
  invalid: [
    { code: "setTimeout(fn, 200);", errors: [{ messageId: "magicMs", data: { value: "200" } }] },
    { code: "window.setTimeout(fn, 500);", errors: [{ messageId: "magicMs" }] },
    { code: "setInterval(fn, 1000);", errors: [{ messageId: "magicMs" }] },
    { code: "<Tooltip delayDuration={350} />;", errors: [{ messageId: "magicMs", data: { value: "350" } }] },
    { code: "<Toast duration={4000} />;", errors: [{ messageId: "magicMs" }] },
    { code: "<Tooltip skipDelayDuration={-1} />;", errors: [{ messageId: "magicMs" }] },
    { code: "const t = { duration: 200 };", errors: [{ messageId: "magicMs" }] },
    { code: "function Tooltip({ delayDuration = 350 }) {}", errors: [{ messageId: "magicMs" }] },
  ],
});
