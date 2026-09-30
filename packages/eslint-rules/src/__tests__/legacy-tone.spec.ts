import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { expect, it } from "vitest";

import rule, { LEGACY_TONES } from "../rules/legacy-tone.js";
import { syntaxTester } from "./rule-tester.js";

syntaxTester.run("legacy-tone", rule as never, {
  valid: [
    '<Button tone="primary" />;',
    '<Badge tone="success" />;',
    '<Alert tone={busy ? "warning" : "info"} />;',
    'toast({ tone: "destructive", title: "x" });',
    "const v = { tone };",
    // cva 의 변형 키 자리는 보지 않는다 — 컴포넌트 정의는 손으로 바꾼다.
    'cva("", { variants: { tone: { ok: "text-success" } } });',
    '<Button data-tone="ok" />;',
    "const tone = getTone(); <Button tone={tone} />;",
  ],
  invalid: [
    { code: '<Button tone="accent" />;', output: '<Button tone="primary" />;', errors: [{ messageId: "legacyTone" }] },
    { code: "<Button tone={'danger'} />;", output: "<Button tone={'destructive'} />;", errors: [{ messageId: "legacyTone" }] },
    { code: '<Td tone={ok ? "ok" : "warn"} />;', output: '<Td tone={ok ? "success" : "warning"} />;', errors: [{ messageId: "legacyTone" }, { messageId: "legacyTone" }] },
    { code: '<Spinner tone={props.tone ?? "current"} />;', output: '<Spinner tone={props.tone ?? "neutral"} />;', errors: [{ messageId: "legacyTone" }] },
    { code: 'toast({ tone: "ok", title: "Saved" });', output: 'toast({ tone: "success", title: "Saved" });', errors: [{ messageId: "legacyTone" }] },
    { code: 'const d = { defaultVariants: { tone: "default" } };', output: 'const d = { defaultVariants: { tone: "neutral" } };', errors: [{ messageId: "legacyTone" }] },
  ],
});

it("규칙의 표가 packages/ui 의 tone.ts 와 같다 — 둘이 갈리면 --fix 가 런타임과 다른 키를 쓴다", () => {
  const source = readFileSync(fileURLToPath(new URL("../../../ui/src/lib/tone.ts", import.meta.url)), "utf8");
  const block = /const LEGACY_TONES = \{([\s\S]*?)\} as const/.exec(source)?.[1] ?? "";
  const fromSource = Object.fromEntries([...block.matchAll(/(\w+):\s*"(\w+)"/g)].map(m => [m[1], m[2]]));
  expect(fromSource).toEqual({ ...LEGACY_TONES });
});
