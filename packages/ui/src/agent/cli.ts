#!/usr/bin/env node
/// <reference types="node" />
/**
 * `jds-agent` — 소비 레포에 에이전트 계약을 심는 bin(계획 §2.5-h, #31).
 *
 * 패키지 안의 AGENTS.md 는 소비 레포의 에이전트가 자동으로 읽지 않는다(Next.js 가 `node_modules/next/dist/docs` 를 두고도 같은 문제를 겪는다).
 * 그래서 `jds-agent sync` 가 소비 레포의 `AGENTS.md` 에 **관리 블록**(`<!-- jds:begin --> … <!-- jds:end -->`)을 upsert 하고
 * `.claude/skills/jhlee-ds/` 를 복사한다. 규칙은 항상 로드되는 AGENTS.md 에, 절차는 스킬에(Vercel 실측: AGENTS.md 100% vs 스킬 53~79%).
 * 멱등이다 — 같은 버전으로 두 번 돌리면 아무것도 쓰지 않는다. 블록 밖의 글은 건드리지 않는다.
 *
 * 4.0.0 에서 패키지가 `@jhleeweb/squircle-design-system` → `@jhleeweb/jhlee-design-system` 으로 이름을 바꿨다(#91). 3.x 의 `sds-agent` 가 심은
 * 블록(`<!-- sds:begin -->`)과 스킬 폴더(`squircle-ds`)는 이 도구가 이어받는다 — 블록은 제자리에서 새 표식으로 바뀌고 옛 폴더는 지운다.
 * 그러지 않으면 소비 레포에 같은 계약이 두 벌 서고, 옛 스킬이 옛 패키지 경로(`node_modules/@jhleeweb/squircle-design-system`)를 가리킨 채 남는다.
 *
 * 화면 문자열(콘솔 출력)은 영어다 — 소비자가 보는 글자이기 때문이다.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** 관리 블록의 시작 표식 — 소비 레포 AGENTS.md 에서 이 줄과 `END` 사이만 이 도구의 것이다. */
export const BEGIN = "<!-- jds:begin -->";
/** 관리 블록의 끝 표식. */
export const END = "<!-- jds:end -->";

/** 3.x(개명 전 `sds-agent`)의 표식 — 이 사이의 블록은 새 블록으로 제자리에서 바뀐다(#91). */
export const LEGACY_MARKERS = ["<!-- sds:begin -->", "<!-- sds:end -->"] as const;

/** 3.x 가 복사한 스킬 폴더 이름 — `sync` 가 지운다(#91). */
export const LEGACY_SKILL = "squircle-ds";

/** `sync` 의 입력. */
export interface SyncOptions {
  /** 소비 레포 루트 — AGENTS.md 와 .claude/skills/ 가 여기 생긴다. */
  readonly cwd: string;
  /**
   * 이 패키지의 루트(agent/ 와 package.json 이 있는 곳). 기본은 이 파일 기준 두 단계 위 — src/agent/ 와 dist/agent/ 가 같은 깊이라 한 식이다.
   * @default 패키지 루트
   */
  readonly packageDir?: string;
}

/** 파일 하나의 결과. */
export type FileStatus = "created" | "updated" | "unchanged";

/** `sync` 의 결과 — 호출자가 그대로 찍는다. */
export interface SyncResult {
  /** 손댄 AGENTS.md 의 절대 경로. */
  readonly agentsFile: string;
  /** 관리 블록에 일어난 일. */
  readonly agents: FileStatus;
  /** 스킬을 복사한 디렉터리(`<cwd>/.claude/skills/jhlee-ds`). */
  readonly skillDir: string;
  /** 스킬 파일별 결과 — 경로는 스킬 디렉터리 기준. */
  readonly skillFiles: readonly { readonly path: string; readonly status: FileStatus }[];
  /** 지운 3.x 스킬 폴더(`<cwd>/.claude/skills/squircle-ds`) — 없었으면 `null`. */
  readonly removedLegacySkillDir: string | null;
}

/** 표식 한 쌍이 감싼 구간(끝 표식 포함) — 없거나 순서가 뒤집혔으면 `null`. */
function markedSpan(text: string, open: string, close: string): { start: number; end: number } | null {
  const start = text.indexOf(open);
  const end = text.indexOf(close);
  return start !== -1 && end > start ? { start, end: end + close.length } : null;
}

/**
 * 관리 블록을 넣거나 바꾼다. 표식이 있으면 그 사이만 바꾸고, 없으면 파일 끝에 빈 줄 하나 뒤에 붙인다.
 * 3.x 의 표식(`LEGACY_MARKERS`)만 있으면 그 블록이 같은 자리에서 새 표식 블록이 된다(#91).
 * 순수 함수 — 스펙이 파일 없이 검사한다.
 */
export function upsertBlock(
  existing: string | null,
  block: string,
): { readonly text: string; readonly status: FileStatus } {
  const managed = `${BEGIN}\n${block.trimEnd()}\n${END}\n`;
  if (existing === null) return { text: managed, status: "created" };
  const span = markedSpan(existing, BEGIN, END) ?? markedSpan(existing, ...LEGACY_MARKERS);
  let next: string;
  if (span) {
    next = existing.slice(0, span.start) + managed + existing.slice(span.end).replace(/^\n/, "");
  } else {
    const head = existing.length === 0 ? "" : `${existing.replace(/\n*$/, "")}\n\n`;
    next = head + managed;
  }
  return next === existing ? { text: existing, status: "unchanged" } : { text: next, status: "updated" };
}

function writeIfChanged(path: string, text: string): FileStatus {
  if (!existsSync(path)) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
    return "created";
  }
  if (readFileSync(path, "utf8") === text) return "unchanged";
  writeFileSync(path, text);
  return "updated";
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** 이 파일 기준 패키지 루트 — `src/agent/cli.ts` 와 `dist/agent/cli.js` 모두 두 단계 위다. */
export function defaultPackageDir(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
}

/** AGENTS.md 블록 upsert + 스킬 복사. */
export function sync(options: SyncOptions): SyncResult {
  const packageDir = options.packageDir ?? defaultPackageDir();
  const pkg = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")) as {
    name: string;
    version: string;
  };
  const agentDir = join(packageDir, "agent");
  const block = readFileSync(join(agentDir, "AGENTS.block.md"), "utf8")
    .replaceAll("{{name}}", pkg.name)
    .replaceAll("{{version}}", pkg.version);

  const agentsFile = join(options.cwd, "AGENTS.md");
  const existing = existsSync(agentsFile) ? readFileSync(agentsFile, "utf8") : null;
  const upserted = upsertBlock(existing, block);
  if (upserted.status !== "unchanged") {
    mkdirSync(dirname(agentsFile), { recursive: true });
    writeFileSync(agentsFile, upserted.text);
  }

  const skillSource = join(agentDir, "skills", "jhlee-ds");
  const skillDir = join(options.cwd, ".claude", "skills", "jhlee-ds");
  const skillFiles = walk(skillSource).map((file) => {
    const rel = relative(skillSource, file);
    const target = join(skillDir, rel);
    const text = readFileSync(file, "utf8")
      .replaceAll("{{name}}", pkg.name)
      .replaceAll("{{version}}", pkg.version);
    return { path: rel, status: writeIfChanged(target, text) };
  });

  const legacySkillDir = join(options.cwd, ".claude", "skills", LEGACY_SKILL);
  const removedLegacySkillDir = existsSync(legacySkillDir) ? legacySkillDir : null;
  if (removedLegacySkillDir) rmSync(removedLegacySkillDir, { recursive: true, force: true });

  return { agentsFile, agents: upserted.status, skillDir, skillFiles, removedLegacySkillDir };
}

const USAGE = `Usage: jds-agent sync [--cwd <dir>]

  sync   Upsert the managed block (<!-- jds:begin --> … <!-- jds:end -->) into <dir>/AGENTS.md
         and copy the jhlee-ds skill into <dir>/.claude/skills/jhlee-ds/. Idempotent.
         A 3.x block (<!-- sds:begin -->) is replaced in place and the old
         .claude/skills/squircle-ds/ folder is removed.
`;

/** 인자 파싱 — 순수 함수라 스펙이 본다. 모르는 인자는 오류다(오타를 조용히 무시하지 않는다). */
export function parseArgs(
  argv: readonly string[],
): { readonly command: "sync" | "help"; readonly cwd: string } | { readonly error: string } {
  let command: "sync" | "help" | null = null;
  let cwd = process.cwd();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "sync" && command === null) command = "sync";
    else if (arg === "--help" || arg === "-h") command = "help";
    else if (arg === "--cwd") {
      const value = argv[++i];
      if (!value) return { error: "--cwd needs a directory" };
      cwd = resolve(value);
    } else return { error: `Unknown argument: ${arg}` };
  }
  return { command: command ?? "help", cwd };
}

/** bin 진입 — `process.exitCode` 로 끝난다. */
export function main(argv: readonly string[]): number {
  const parsed = parseArgs(argv);
  if ("error" in parsed) {
    console.error(`${parsed.error}\n\n${USAGE}`);
    return 2;
  }
  if (parsed.command === "help") {
    console.log(USAGE);
    return 0;
  }
  const result = sync({ cwd: parsed.cwd });
  console.log(`AGENTS.md: ${result.agents} (${result.agentsFile})`);
  for (const file of result.skillFiles)
    console.log(`skill: ${file.status} ${join(".claude/skills/jhlee-ds", file.path)}`);
  if (result.removedLegacySkillDir)
    console.log(`skill: removed ${join(".claude/skills", LEGACY_SKILL)} (renamed to jhlee-ds in 4.0.0)`);
  return 0;
}

// `npx jds-agent` 는 bin 심링크로 들어온다 — realpath 로 비교해야 «직접 실행» 을 알아본다. 스펙은 함수를 import 하므로 여기로 오지 않는다.
const invoked = process.argv[1] ? realpathSync(process.argv[1]) : "";
if (invoked && invoked === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
