#!/usr/bin/env node
/* 토큰 생성기(계획 §2.2, #15) — `tokens/**\/*.json`(DTCG) → `src/generated/{tokens.css, theme.tailwind.css, legacy.css, tokens.ts, ladders.ts}`.
 *
 *   node tokens/build.mjs           생성물을 쓴다
 *   node tokens/build.mjs --check   쓰지 않고 «커밋된 생성물이 최신인가» 만 본다 — CI 와 pnpm verify 가 이것을 돈다
 *
 * Style Dictionary 4 를 쓰되(usesDtcg · outputReferences · 참조 해석 · name 변환) 값 직렬화와 블록 조립은 formats/ 의 우리 포맷이 한다 —
 * 목표가 «손 CSS 와 해석 맵이 같다» 라서 SD 의 css 변환군(색 재작성)을 태울 수 없다(formats/shared.mjs 머리).
 * 다크(semantic/chrome.dark.json)는 source 가 아니라 options 로 넘긴다 — 같은 키(chrome.*)를 두 source 에 두면 SD 가 충돌로 본다.
 * 생성물은 커밋한다. 아직 연결하지 않는다(B3) — tokens.css · theme.css · cn.ts 는 손 정본 그대로이고 generated-parity.spec 이 둘의 동일성을 증명한다. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import StyleDictionary from "style-dictionary";

import { cssVars } from "./formats/css-vars.mjs";
import { declarations } from "./formats/shared.mjs";
import { tailwindTheme } from "./formats/tailwind-theme.mjs";
import { tsConsts } from "./formats/ts-consts.mjs";
import { readTokenSources, validateTokenSources } from "./schema.ts";

const here = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(here, "..", "src", "generated");
const check = process.argv.includes("--check");

const sources = readTokenSources(here);
const { errors, tokens: flat, dark } = validateTokenSources(sources);
if (errors.length) {
  console.error(`tokens: 정본 검사 실패 ${errors.length}건\n${errors.map(e => ` - ${e}`).join("\n")}`);
  process.exit(1);
}

/** 편 토큰 → SD 가 읽는 중첩 객체. `$extensions.sds` 에 file · order 를 실어 포맷이 출처와 순서를 안다. */
function nest(list) {
  const root = {};
  for (const t of list) {
    let node = root;
    for (const key of t.path.slice(0, -1)) node = node[key] ??= {};
    node[t.path.at(-1)] = { $type: t.type, $value: t.value, $extensions: { sds: { ...t.sds, file: t.file, order: t.order } } };
  }
  return root;
}

StyleDictionary.registerTransform({ name: "name/sds", type: "name", transform: token => token.path.join("-") });
StyleDictionary.registerFormat({ name: "sds/css-vars", format: cssVars });
StyleDictionary.registerFormat({ name: "sds/tailwind-theme", format: tailwindTheme });
StyleDictionary.registerFormat({ name: "sds/ts-consts", format: tsConsts });

// 다크는 리터럴이거나 라이트 토큰 참조다 — 스키마가 참조 존재를 봤으므로 여기서는 선언으로만 바꾼다.
const darkDeclarations = dark.map(t => ({ name: t.path.join("-"), declarations: declarations(t.path.join("-"), t.type, t.value, t.value, true) }));

const sd = new StyleDictionary({
  usesDtcg: true,
  log: { warnings: "error", verbosity: "silent" },
  tokens: nest(flat),
  platforms: {
    generated: {
      transforms: ["name/sds"],
      buildPath: `${OUT_DIR}/`,
      files: [
        { destination: "tokens.css", format: "sds/css-vars", options: { outputReferences: true, dark: darkDeclarations } },
        { destination: "theme.tailwind.css", format: "sds/tailwind-theme", options: { outputReferences: true } },
        { destination: "legacy.css", format: "sds/css-vars", options: { outputReferences: true, legacy: true } },
        { destination: "tokens.ts", format: "sds/ts-consts", options: { kind: "motion" } },
        { destination: "ladders.ts", format: "sds/ts-consts", options: { kind: "ladders" } },
      ],
    },
  },
});
await sd.hasInitialized;
// formatPlatform 은 쓰지 않고 문자열만 돌려준다(4.4 실측: destination 에 buildPath 가 이미 붙어 온다) — --check 가 그것을 커밋본과 비교한다.
const outputs = (await sd.formatPlatform("generated")).map(({ destination, output }) => ({ path: destination, name: relative(OUT_DIR, destination), output }));

if (check) {
  const stale = outputs.filter(({ path, output }) => !existsSync(path) || readFileSync(path, "utf8") !== output).map(o => o.name);
  if (stale.length) {
    console.error(`tokens: 생성물이 정본과 다르다 — pnpm tokens:build 로 다시 만들고 함께 커밋한다\n${stale.map(s => ` - src/generated/${s}`).join("\n")}`);
    process.exit(1);
  }
  console.log(`tokens: 생성물 ${outputs.length}개가 최신이다`);
} else {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const { path, output } of outputs) writeFileSync(path, output);
  console.log(`tokens: ${outputs.map(o => `src/generated/${o.name}`).join(" · ")}`);
}
