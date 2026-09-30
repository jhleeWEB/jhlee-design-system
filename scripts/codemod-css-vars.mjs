#!/usr/bin/env node
/* CSS 변수 코드모드(B5, #22) — `var(--chrome-<옛>)`·`var(--radius-<옛>)` 를 새 이름으로 바꾼다.
 *
 *   node scripts/codemod-css-vars.mjs <파일 또는 디렉터리>…     지정한 .css/.ts/.tsx/.mdx 를 제자리에서 고친다
 *   node scripts/codemod-css-vars.mjs --dry <경로>…             바꿀 자리만 센다
 *
 * 표는 손으로 적지 않는다 — `packages/ui/tokens/legacy.json`(alias 토큰 + 파일 머리 renames)에서 `legacy-map.mjs` 가 뽑는다. 유틸 클래스
 * 쪽 코드모드(`text-ink` → `text-foreground`)는 같은 표에서 나온 `eslint/legacy-classes.json` 을 ESLint `--fix` 가 적용한다 — 둘이 한 정본이다.
 * 옛 이름 대부분은 generated/legacy.css 의 alias 로 그대로 동작하지만 `--chrome-accent`(옛 azure → 새 옅은 면)·`--chrome-muted`(옛 회색 글자 →
 * 새 면)는 새 이름과 글자가 같아 alias 가 없다 — 그 둘은 이 스크립트를 돌려야 뜻이 지켜진다. 소비 레포도 같은 명령으로 옮긴다.
 *
 * 긴 이름을 먼저 바꾼다(`--chrome-accent-soft` 가 `--chrome-accent` 에 먼저 먹히지 않게) 하고, `var(--chrome-ink` 처럼 `var(` 뒤 이름 경계
 * (`,`·`)`·공백)까지 맞춘다 — `--chrome-ink-2` 를 `--chrome-ink` 로 오인하지 않는다. */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { legacyRenames } from "../packages/ui/tokens/legacy-map.mjs";
import { readTokenSources, validateTokenSources } from "../packages/ui/tokens/schema.ts";

const here = dirname(fileURLToPath(import.meta.url));
const TOKENS = join(here, "..", "packages", "ui", "tokens");
const EXTENSIONS = new Set([".css", ".ts", ".tsx", ".mdx", ".md", ".html"]);
const SKIP_DIRS = new Set(["node_modules", "dist", "storybook-static", ".git", "generated"]);

const { errors, tokens, renames } = validateTokenSources(readTokenSources(TOKENS));
if (errors.length) {
  console.error(`tokens: 정본 검사 실패 ${errors.length}건 — 코드모드 표를 믿을 수 없다`);
  process.exit(1);
}
const { cssVars } = legacyRenames(tokens, renames);
const entries = Object.entries(cssVars).sort(([a], [b]) => b.length - a.length || a.localeCompare(b));
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// 한 번의 치환으로 끝낸다 — 규칙마다 따로 돌리면 `--chrome-surface-2 → --chrome-muted` 뒤에 `--chrome-muted → --chrome-muted-foreground` 가
// 다시 먹어 두 번 개명된다(첫 실행에서 실제로 났다). 대안 앞쪽이 긴 이름이라 `--chrome-accent-soft` 가 `--chrome-accent` 보다 먼저 맞는다.
// `var(` 뒤(공백 허용)의 이름 + 경계 — `--chrome-ink` 뒤에 `-2` 가 이어지면 다른 이름이다.
const ONE_PASS = new RegExp(`(var\\(\\s*)(${entries.map(([from]) => escape(from)).join("|")})(?![\\w-])`, "g");

/** @param {string} text @returns {{ text: string, count: number }} */
export function codemodCssVars(text) {
  let count = 0;
  const out = text.replace(ONE_PASS, (_, prefix, name) => {
    count++;
    return `${prefix}${cssVars[name]}`;
  });
  return { text: out, count };
}

function* walk(path) {
  const st = statSync(path);
  if (st.isDirectory()) {
    for (const name of readdirSync(path)) {
      if (SKIP_DIRS.has(name)) continue;
      yield* walk(join(path, name));
    }
  } else if (EXTENSIONS.has(extname(path))) yield path;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const targets = args.filter(a => a !== "--dry");
  if (targets.length === 0) {
    console.error("사용법: node scripts/codemod-css-vars.mjs [--dry] <파일|디렉터리>…");
    process.exit(2);
  }
  let total = 0;
  for (const target of targets) {
    for (const file of walk(resolve(target))) {
      const before = readFileSync(file, "utf8");
      const { text, count } = codemodCssVars(before);
      if (count === 0) continue;
      total += count;
      console.log(`${dry ? "(dry) " : ""}${file}: ${count}`);
      if (!dry) writeFileSync(file, text);
    }
  }
  console.log(`${dry ? "바꿀 자리" : "바꿈"}: ${total}`);
}
