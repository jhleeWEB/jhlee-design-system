#!/usr/bin/env node
/* 토큰 생성기(계획 §2.2, #15) — `tokens/**\/*.json`(DTCG) → `src/generated/{tokens.css, theme.tailwind.css, tokens.ts, ladders.ts}`
 * + `src/generated/legacy-classes.json`(옛 유틸 이름 → 새 이름 코드모드 표, B5 #22 — 루트 eslint.config.js 와 소비자 프리셋(src/eslint)이 no-restricted-classes 의 restrict 로 읽는다.
 * 3.0.0 부터 원천은 정본 JSON 이 아니라 `legacy-map.mjs` 의 정적 표다 — 옛 이름 alias 를 지웠기 때문이다, #49).
 *
 *   node tokens/build.mjs           생성물을 쓴다
 *   node tokens/build.mjs --check   쓰지 않고 «커밋된 생성물이 최신인가» 만 본다 — CI 와 pnpm verify 가 이것을 돈다
 *
 * Style Dictionary 4 를 쓰되(usesDtcg · outputReferences · 참조 해석 · name 변환) 값 직렬화와 블록 조립은 formats/ 의 우리 포맷이 한다 —
 * 목표가 «손 CSS 와 해석 맵이 같다» 라서 SD 의 css 변환군(색 재작성)을 태울 수 없다(formats/shared.mjs 머리).
 * 다크(semantic/chrome.dark.json)는 source 가 아니라 options 로 넘긴다 — 같은 키(chrome.*)를 두 source 에 두면 SD 가 충돌로 본다.
 * 생성물은 커밋하고 `src/tokens.css`·`theme.css` 가 @import 로, `cn.ts`·`tokens/motion.ts` 가 import 로 그대로 소비한다(#18). */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import StyleDictionary from "style-dictionary";

import * as cursorSource from "../src/cursors/cursors.ts";
import { cssVars } from "./formats/css-vars.mjs";
import { cursorFiles } from "./formats/cursors.mjs";
import { legacyClassRestrictions, legacyRenames } from "./legacy-map.mjs";
import { declarations } from "./formats/shared.mjs";
import { tailwindTheme } from "./formats/tailwind-theme.mjs";
import { tsConsts } from "./formats/ts-consts.mjs";
import { readTokenSources, validateTokenSources } from "./schema.ts";

const here = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(here, "..", "src", "generated");
// 프리셋(src/eslint/index.ts)이 import 해 배포물에 실어야 하므로 src/generated/ 에 둔다 — tsdown unbundle 은 src 밖 파일을 dist 로 옮기지 못한다(#31).
const ESLINT_OUT = join(OUT_DIR, "legacy-classes.json");
const check = process.argv.includes("--check");

const sources = readTokenSources(here);
const { errors, tokens: flat, dark } = validateTokenSources(sources);
if (errors.length) {
  console.error(`tokens: 정본 검사 실패 ${errors.length}건\n${errors.map((e) => ` - ${e}`).join("\n")}`);
  process.exit(1);
}

/** 편 토큰 → SD 가 읽는 중첩 객체. `$extensions.jds` 에 file · order 를 실어 포맷이 출처와 순서를 안다. */
function nest(list) {
  const root = {};
  for (const t of list) {
    let node = root;
    for (const key of t.path.slice(0, -1)) node = node[key] ??= {};
    // $deprecated 도 싣는다 — 포맷이 `/* @deprecated */`·JSDoc @deprecated 를 낼 근거다(#22 에서 빠져 있던 것을 실측으로 잡았다).
    node[t.path.at(-1)] = {
      $type: t.type,
      $value: t.value,
      $extensions: { jds: { ...t.jds, file: t.file, order: t.order } },
      ...(t.deprecated !== undefined ? { $deprecated: t.deprecated } : {}),
    };
  }
  return root;
}

StyleDictionary.registerTransform({
  name: "name/jds",
  type: "name",
  transform: (token) => token.path.join("-"),
});
StyleDictionary.registerFormat({ name: "jds/css-vars", format: cssVars });
StyleDictionary.registerFormat({ name: "jds/tailwind-theme", format: tailwindTheme });
StyleDictionary.registerFormat({ name: "jds/ts-consts", format: tsConsts });

// 다크는 리터럴이거나 원시 참조다 — 스키마가 참조 존재를 봤으므로 여기서는 선언으로만 바꾼다.
const darkDeclarations = dark.map((t) => ({
  name: t.path.join("-"),
  declarations: declarations(t.path.join("-"), t.type, t.value, t.value, true),
}));

const sd = new StyleDictionary({
  usesDtcg: true,
  log: { warnings: "error", verbosity: "silent" },
  tokens: nest(flat),
  platforms: {
    generated: {
      transforms: ["name/jds"],
      buildPath: `${OUT_DIR}/`,
      files: [
        {
          destination: "tokens.css",
          format: "jds/css-vars",
          options: { outputReferences: true, dark: darkDeclarations },
        },
        {
          destination: "theme.tailwind.css",
          format: "jds/tailwind-theme",
          options: { outputReferences: true },
        },
        { destination: "tokens.ts", format: "jds/ts-consts", options: { kind: "motion" } },
        { destination: "ladders.ts", format: "jds/ts-consts", options: { kind: "ladders" } },
      ],
    },
  },
});
await sd.hasInitialized;
// formatPlatform 은 쓰지 않고 문자열만 돌려준다(4.4 실측: destination 에 buildPath 가 이미 붙어 온다) — --check 가 그것을 커밋본과 비교한다.
const outputs = (await sd.formatPlatform("generated")).map(({ destination, output }) => ({
  path: destination,
  name: `src/generated/${relative(OUT_DIR, destination)}`,
  output,
}));
// 코드모드 표는 SD 를 거치지 않는다 — legacy-map.mjs 의 정적 표에서 나온다(#49). JSON 은 사람이 diff 로 읽으므로 2칸 들여쓰기로.
outputs.push({
  path: ESLINT_OUT,
  name: "src/generated/legacy-classes.json",
  output: `${JSON.stringify(legacyClassRestrictions(legacyRenames()), null, 2)}\n`,
});

// 커서(#64)도 SD 를 거치지 않는다 — 정본이 `src/cursors/cursors.ts` 의 SVG 표다(formats/cursors.mjs 머리).
const cursors = cursorFiles(cursorSource);
outputs.push(
  { path: join(OUT_DIR, "cursors.css"), name: "src/generated/cursors.css", output: cursors.css },
  {
    path: join(OUT_DIR, "cursors.tailwind.css"),
    name: "src/generated/cursors.tailwind.css",
    output: cursors.tailwind,
  },
);

if (check) {
  const stale = outputs
    .filter(({ path, output }) => !existsSync(path) || readFileSync(path, "utf8") !== output)
    .map((o) => o.name);
  if (stale.length) {
    console.error(
      `tokens: 생성물이 정본과 다르다 — pnpm tokens:build 로 다시 만들고 함께 커밋한다\n${stale.map((s) => ` - ${s}`).join("\n")}`,
    );
    process.exit(1);
  }
  console.log(`tokens: 생성물 ${outputs.length}개가 최신이다`);
} else {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(dirname(ESLINT_OUT), { recursive: true });
  for (const { path, output } of outputs) writeFileSync(path, output);
  console.log(`tokens: ${outputs.map((o) => o.name).join(" · ")}`);
}
