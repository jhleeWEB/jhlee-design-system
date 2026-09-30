#!/usr/bin/env node
/* 유틸 클래스 코드모드(B5, #22) — `text-ink` → `text-foreground` · `rounded-control` → `rounded-md` 를 **한 번에** 바꾼다.
 *
 *   node scripts/codemod-classes.mjs <파일 또는 디렉터리>…     .ts/.tsx/.mdx/.html 을 제자리에서 고친다
 *   node scripts/codemod-classes.mjs --dry <경로>…             바꿀 자리만 센다
 *
 * ESLint 의 `no-restricted-classes --fix`(src/generated/legacy-classes.json)도 같은 표로 같은 일을 하지만 **accent · muted 두 이름은 그쪽에 없다** —
 * 옛 `bg-accent`(azure)와 새 `bg-accent`(옅은 면)는 글자가 같아 린트가 «고친 것» 과 «원래 새 것» 을 구분할 수 없고, --fix 가 반복 검사하며
 * `bg-surface-2 → bg-muted → bg-muted-foreground` 로 두 번 고쳐 버린다(tokens/legacy-map.mjs 머리). 이 스크립트는 정규식 한 번으로 끝내므로
 * 그 문제가 없다. 그래서 순서가 있다: 소비 레포는 **이 스크립트를 먼저 한 번** 돌리고(그 뒤로는 옛 이름이 없으니 다시 돌릴 일이 없다),
 * 그 다음부터 린트가 남은 것을 잡는다. 두 번 돌리면 새 `bg-accent` 가 `bg-primary` 로 바뀐다 — 한 번만.
 *
 * 클래스 토큰의 경계: 앞은 공백·따옴표·백틱·`{`·`(`·`,`·줄 머리, 뒤는 공백·따옴표·백틱·`}`·`)`·`,`·줄 끝. variant 접두(`hover:`·`data-[x]:`)와
 * 불투명도(`/40`)는 그대로 둔다. `var(--chrome-…)` 는 다른 스크립트(codemod-css-vars.mjs)다. */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { legacyClassRenames, legacyRenames } from "../packages/ui/tokens/legacy-map.mjs";
import { readTokenSources, validateTokenSources } from "../packages/ui/tokens/schema.ts";

const here = dirname(fileURLToPath(import.meta.url));
const TOKENS = join(here, "..", "packages", "ui", "tokens");
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mdx", ".md", ".html"]);
const SKIP_DIRS = new Set(["node_modules", "dist", "storybook-static", ".git", "generated"]);

const { errors, tokens, renames } = validateTokenSources(readTokenSources(TOKENS));
if (errors.length) {
  console.error(`tokens: 정본 검사 실패 ${errors.length}건 — 코드모드 표를 믿을 수 없다`);
  process.exit(1);
}
// 린트 표는 `^…$` 로 클래스 하나를 맞춘다 — 여기서는 앵커를 떼고 토큰 경계로 감싸 본문 전체에 한 번 적용한다.
const rules = legacyClassRenames(legacyRenames(tokens, renames)).map(({ pattern, fix }) => ({
  body: pattern.slice(1, -1),
  fix,
}));
const ONE_PASS = new RegExp(
  `(^|[\\s"'\`{(,])(?:${rules.map((r, i) => `(?<r${i}>${r.body})`).join("|")})(?=[\\s"'\`})]|,|$)`,
  "gm",
);

/** @param {string} text @returns {{ text: string, count: number }} */
export function codemodClasses(text) {
  let count = 0;
  const out = text.replace(ONE_PASS, (...args) => {
    const groups = args.at(-1);
    const lead = args[1];
    for (let i = 0; i < rules.length; i++) {
      const hit = groups[`r${i}`];
      if (hit === undefined) continue;
      count++;
      // 린트 표의 `$1$2-new$3` 를 그대로 재사용한다 — 하위 그룹은 개별 패턴을 다시 돌려 얻는다.
      return lead + hit.replace(new RegExp(`^${rules[i].body}$`), rules[i].fix);
    }
    return args[0];
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
  const targets = args.filter((a) => a !== "--dry");
  if (targets.length === 0) {
    console.error("사용법: node scripts/codemod-classes.mjs [--dry] <파일|디렉터리>…");
    process.exit(2);
  }
  let total = 0;
  for (const target of targets) {
    for (const file of walk(resolve(target))) {
      const before = readFileSync(file, "utf8");
      const { text, count } = codemodClasses(before);
      if (count === 0) continue;
      total += count;
      console.log(`${dry ? "(dry) " : ""}${file}: ${count}`);
      if (!dry) writeFileSync(file, text);
    }
  }
  console.log(`${dry ? "바꿀 자리" : "바꿈"}: ${total}`);
}
