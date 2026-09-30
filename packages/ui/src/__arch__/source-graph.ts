/*
 * 아키텍처 가드(#11)가 쓰는 소스 그래프 — 이 패키지의 `src/` 를 읽어 «주석을 걷어낸 본문» 을 낸다.
 * 제품 앱(`apartment-configurator` 의 `src/__arch__/source-graph.ts`)에서 이식하되 import 간선·도달성은 가져오지 않았다 —
 * 여기서 본문을 읽는 스펙은 금지 패턴 래칫과 RSC 지시문 검사뿐이고, 둘 다 «어느 파일이 어느 파일을 끌어오는가» 를 묻지 않는다.
 *
 * 주석을 AST 로 걷어내는 이유는 실측이다 — theme.css 의 머리 주석은 `#0869e1` 같은 hex 와 `140ms` 같은 시간을 «왜» 의 근거로
 * 들고 있고, 컴포넌트 주석도 `forwardRef` 를 «더는 쓰지 않는다» 고 적는다. 정규식으로 본문을 세면 그 설명이 위반으로 잡힌다.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

/** `packages/ui/src` 의 절대 경로. */
export const SRC_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** 원문 조각과 1 기준 줄 번호 — 실패 메시지가 `path:line` 을 말하게 한다. */
export interface Located {
  readonly text: string;
  readonly line: number;
}

/** 한 파일의 읽은 결과. */
export interface SourceFileInfo {
  /** `src/` 기준 POSIX 경로 — 기준선의 키. OS 구분자에 흔들리지 않게 늘 `/` 다. */
  readonly path: string;
  /** 스펙·가드·스토리·생성물 — 제품 소스가 아니라서 세지 않는다. */
  readonly excluded: boolean;
  /** `.ts`·`.tsx`·`.css` 가운데 하나. */
  readonly kind: "ts" | "tsx" | "css";
  /** 주석을 같은 길이의 공백으로 덮은 본문 — 줄 번호가 원본과 같다. */
  readonly code: string;
  /** 원문 그대로. 첫 줄 지시문(`"use client"`)처럼 원문을 봐야 하는 검사가 쓴다. */
  readonly text: string;
}

const toPosix = (p: string): string => p.split(sep).join("/");

/**
 * 제품 소스가 아닌 경로 — 스펙·가드·스토리·생성물(Phase B 의 `generated/`)·스냅샷. 픽스처가 hex 와 px 를 문자열로 들고 있는 것은
 * 정상이고, 생성물은 사람이 고치는 파일이 아니다.
 */
export function isExcludedPath(path: string): boolean {
  return (
    /(^|\/)(__tests__|__arch__|__snapshots__|generated)\//.test(path) ||
    /\.(spec|test|bench)\.tsx?$/.test(path) ||
    /\.stories\.tsx$/.test(path)
  );
}

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir).sort()) {
    // 점 파일은 건너뛴다 — macOS Finder 가 폴더를 열기만 해도 `.DS_Store` 가 생기고, 그 한 개로 가드가 그 기계에서만 빨개진다.
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(toPosix(relative(SRC_ROOT, full)));
  }
}

/** `src/` 아래 모든 파일(코드·CSS·이미지·문서). 순서는 디렉터리 DFS(폴더마다 이름순)다. */
export function listFiles(): readonly string[] {
  const out: string[] = [];
  walk(SRC_ROOT, out);
  return out;
}

/** 주석 범위를 모은다. 구두점 토큰 앞의 주석까지 잡으려면 `getChildren` 으로 토큰을 전부 밟아야 한다. */
function commentRanges(sf: ts.SourceFile): readonly (readonly [number, number])[] {
  const text = sf.text;
  const seen = new Map<number, number>();
  const visit = (node: ts.Node): void => {
    // JSX 본문은 trivia 가 없다 — 글자 `//` 를 주석으로 읽지 않도록 건너뛴다.
    if (node.kind !== ts.SyntaxKind.JsxText) {
      for (const r of ts.getLeadingCommentRanges(text, node.getFullStart()) ?? []) seen.set(r.pos, r.end);
      for (const r of ts.getTrailingCommentRanges(text, node.getEnd()) ?? []) seen.set(r.pos, r.end);
    }
    for (const child of node.getChildren(sf)) visit(child);
  };
  visit(sf);
  return [...seen.entries()];
}

function blankRanges(text: string, ranges: readonly (readonly [number, number])[]): string {
  const chars = text.split("");
  for (const [pos, end] of ranges) for (let i = pos; i < end; i++) if (chars[i] !== "\n" && chars[i] !== "\r") chars[i] = " ";
  return chars.join("");
}

/** CSS 는 `/* … *\/` 하나뿐이라 정규식으로 충분하다 — 문자열 안의 `/*` 는 이 패키지 CSS 에 없다(url 도 없다). */
function blankCssComments(text: string): string {
  const ranges: [number, number][] = [];
  for (const m of text.matchAll(/\/\*[\s\S]*?\*\//g)) ranges.push([m.index, m.index + m[0].length]);
  return blankRanges(text, ranges);
}

/**
 * 한 파일을 읽는다. `text` 를 따로 받는 것은 스펙이 가짜 본문으로 검출기 자체를 검증하기 위해서다 — 검출기가 아무것도
 * 못 잡으면 래칫은 «아무것도 안 보는 초록» 이 되고, 그것을 말해 줄 다른 검사는 없다.
 */
export function parseSource(path: string, text: string): SourceFileInfo {
  const excluded = isExcludedPath(path);
  if (path.endsWith(".css")) return { path, excluded, kind: "css", code: blankCssComments(text), text };
  const kind = path.endsWith(".tsx") ? "tsx" : "ts";
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.ES2022, true, kind === "tsx" ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  return { path, excluded, kind, code: blankRanges(text, commentRanges(sf)), text };
}

let cache: ReadonlyMap<string, SourceFileInfo> | null = null;

/** `src/` 의 코드·CSS 를 한 번만 파싱한다 — 스펙 파일마다 워커가 달라 파일당 한 번이다. */
export function sourceGraph(): ReadonlyMap<string, SourceFileInfo> {
  if (cache) return cache;
  const map = new Map<string, SourceFileInfo>();
  for (const path of listFiles()) if (/\.(tsx?|css)$/.test(path)) map.set(path, parseSource(path, readFileSync(join(SRC_ROOT, path), "utf8")));
  cache = map;
  return map;
}

/** 본문 위치 → 1 기준 줄 번호. */
export function lineOf(code: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) if (code.charCodeAt(i) === 10) line++;
  return line;
}

/** 정규식의 모든 일치를 위치와 함께 낸다. */
export function matches(code: string, re: RegExp): readonly Located[] {
  return [...code.matchAll(re)].map(m => ({ text: m[0], line: lineOf(code, m.index) }));
}
