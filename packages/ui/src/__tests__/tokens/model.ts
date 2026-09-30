/*
 * 토큰 모델(계획 §2.4 2층 · §2.2 «Phase A/B-0 는 손 CSS 정본 + postcss 토큰 모델», #11).
 *
 * `tokens.css`·`theme.css` 를 postcss 로 읽어 커스텀 프로퍼티 하나하나를 {이름, 값, 스코프, 파일, 줄} 로 내고, 값 안의 `var(--x)` 를
 * postcss-value-parser 로 뽑아 참조 그래프를 만든다. 정규식으로 잘라 읽던 옛 `tokens.spec` 은 «다크 블록 둘의 이름 집합» 까지만 볼 수
 * 있었다 — 값이 같은지, 참조가 정의돼 있는지, `@theme inline` 이 무엇을 가리키는지는 선언 단위의 모델이 있어야 물을 수 있다.
 *
 * Phase B 가 DTCG JSON + 생성기로 정본을 옮기면 이 모델은 생성물을 읽게 되고, `tokens-snapshot.spec` 의 해석 맵이 «손 CSS == 생성물» 의
 * 비교 기준이 된다. 그래서 여기서는 값을 해석(라이트/다크 모드별 var 치환)하는 데까지 한다.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import postcss, { type AtRule, type ChildNode, type Declaration, type Node as CssNode, type Rule } from "postcss";
import valueParser, { type Node as ValueNode } from "postcss-value-parser";

/** 토큰이 정의된 자리. `@theme` 은 정적 사다리, `@theme inline` 은 모드가 갈리는 값의 매핑이다(혼용 규칙 ③·④). */
export type TokenScope = "root" | "dark-media" | "dark-attr" | "theme" | "theme-inline" | "reduced-motion";

/** 커스텀 프로퍼티 선언 하나. */
export interface Token {
  readonly name: string;
  readonly value: string;
  readonly scope: TokenScope;
  readonly file: string;
  readonly line: number;
  /** 값 안의 `var(--x)` 이름들(중첩 폴백 포함). */
  readonly refs: readonly string[];
}

/** 토큰이든 일반 선언이든, 값 안에서 `var(--x)` 를 읽은 자리. */
export interface VarReference {
  readonly name: string;
  readonly file: string;
  readonly line: number;
  /** 참조가 놓인 선언의 프로퍼티(`--chrome-ink` 또는 `border`). */
  readonly prop: string;
  /** `var(--x, fallback)` 이면 true — 정의가 없어도 렌더는 된다. */
  readonly hasFallback: boolean;
}

/** `--radius-*: initial` 같은 네임스페이스 리셋. */
export interface Reset {
  readonly namespace: string;
  readonly scope: TokenScope;
}

export interface TokenModel {
  readonly tokens: readonly Token[];
  readonly references: readonly VarReference[];
  readonly resets: readonly Reset[];
  /** `@utility <name>` 로 손수 낸 유틸리티 이름(혼용 규칙 ⑤). */
  readonly utilities: readonly string[];
}

/** 모델이 읽는 정본 파일 — 둘이 한 벌이다(theme.css 가 tokens.css 를 @import 한다). */
export const TOKEN_FILES = ["tokens.css", "theme.css"] as const;

/** `src/` 기준 경로로 읽는다 — 생성물(`generated/tokens.css`)도 같은 기준이다. */
function read(file: string): string {
  return readFileSync(fileURLToPath(new URL(`../../${file}`, import.meta.url)), "utf8");
}

/** 값 안의 `var(--x)` 이름을 전부 낸다 — `var(--a, var(--b))` 는 둘 다. */
export function varNames(value: string): { readonly names: string[]; readonly hasFallback: boolean } {
  const names: string[] = [];
  let hasFallback = false;
  const walk = (nodes: readonly ValueNode[]): void => {
    for (const node of nodes) {
      if (node.type !== "function") continue;
      if (node.value === "var") {
        const first = node.nodes[0];
        if (first && first.type === "word" && first.value.startsWith("--")) names.push(first.value);
        if (node.nodes.some(n => n.type === "div" && n.value === ",")) hasFallback = true;
      }
      walk(node.nodes);
    }
  };
  walk(valueParser(value).nodes);
  return { names, hasFallback };
}

/** 선언이 놓인 자리를 스코프로 읽는다. 컴포넌트 규칙(`.ds-*`)·`@utility` 안의 선언은 토큰이 아니라 null 이다. */
function scopeOf(node: ChildNode): TokenScope | null {
  let dark = false;
  let reducedMotion = false;
  let selector: string | null = null;
  let theme: TokenScope | null = null;
  for (let p: CssNode | undefined = node.parent; p && p.type !== "root"; p = p.parent) {
    if (p.type === "rule") selector = (p as Rule).selector;
    else if (p.type === "atrule") {
      const at = p as AtRule;
      if (at.name === "media" && /prefers-color-scheme:\s*dark/.test(at.params)) dark = true;
      else if (at.name === "media" && /prefers-reduced-motion/.test(at.params)) reducedMotion = true;
      else if (at.name === "theme") theme = at.params.trim() === "inline" ? "theme-inline" : "theme";
      else return null;
    }
  }
  if (theme) return theme;
  if (selector === null) return null;
  const normalized = selector.replace(/\s+/g, "");
  if (reducedMotion) return normalized === ":root" ? "reduced-motion" : null;
  if (/\[data-theme="dark"\]/.test(normalized)) return "dark-attr";
  if (dark) return /^:root:not\(\[data-theme="light"\]\)$/.test(normalized) ? "dark-media" : null;
  if (/^:root(,\[data-theme="light"\])?$/.test(normalized)) return "root";
  return null;
}

/**
 * 아무 CSS 파일 묶음이든 한 모델로 읽는다(`src/` 기준 경로). 손 정본은 `loadTokenModel` 이, 생성물(`generated/*.css`)은 `generated-parity.spec` 이
 * 이것으로 읽어 같은 해석기로 두 해석 맵을 비교한다 — 비교기가 다르면 «같다» 가 뜻을 잃는다.
 */
export function loadTokenModelFrom(files: readonly string[]): TokenModel {
  const tokens: Token[] = [];
  const references: VarReference[] = [];
  const resets: Reset[] = [];
  const utilities: string[] = [];
  for (const file of files) {
    const root = postcss.parse(read(file), { from: file });
    root.walkAtRules("utility", at => {
      utilities.push(at.params.trim());
    });
    root.walkDecls((decl: Declaration) => {
      const line = decl.source?.start?.line ?? 0;
      const { names, hasFallback } = varNames(decl.value);
      for (const name of names) references.push({ name, file, line, prop: decl.prop, hasFallback });
      if (!decl.prop.startsWith("--")) return;
      const scope = scopeOf(decl);
      if (scope === null) return;
      if (decl.prop.endsWith("-*")) {
        resets.push({ namespace: decl.prop.slice(0, -2), scope });
        return;
      }
      tokens.push({ name: decl.prop, value: decl.value.replace(/\s+/g, " ").trim(), scope, file, line, refs: names });
    });
  }
  return { tokens, references, resets, utilities };
}

let cache: TokenModel | null = null;

/** 두 손 정본 파일을 한 번만 파싱한다. */
export function loadTokenModel(): TokenModel {
  cache ??= loadTokenModelFrom(TOKEN_FILES);
  return cache;
}

/** 라이트/다크 — `resolve` 가 어느 정의를 고를지 정한다. */
export type Mode = "light" | "dark";

const LIGHT_SCOPES: readonly TokenScope[] = ["root", "theme", "theme-inline"];

/**
 * 모드에서 이 이름의 정의. 다크는 `[data-theme="dark"]` 블록(토글 다크)을 우선하고 없으면 라이트 정의로 떨어진다 — 브라우저의
 * 캐스케이드와 같다. 두 다크 블록이 같다는 것은 `dark-parity.spec` 이 따로 증명하므로 여기서는 한쪽만 읽는다.
 */
export function definitionOf(model: TokenModel, name: string, mode: Mode): Token | undefined {
  const dark = mode === "dark" ? model.tokens.find(t => t.name === name && t.scope === "dark-attr") : undefined;
  return dark ?? model.tokens.find(t => t.name === name && LIGHT_SCOPES.includes(t.scope));
}

/**
 * `var(--x)` 를 끝까지 치환한 값. 정의가 없으면 폴백을, 폴백도 없으면 `var(--x)` 를 그대로 남긴다 — 그런 참조는 `references.spec` 이 잡는다.
 * 순환은 `visiting` 으로 끊고 원문을 남긴다.
 */
export function resolveValue(model: TokenModel, value: string, mode: Mode, visiting: ReadonlySet<string> = new Set()): string {
  const ast = valueParser(value);
  const substitute = (nodes: ValueNode[]): void => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;
      if (node.type !== "function") continue;
      if (node.value === "var") {
        const first = node.nodes[0];
        const name = first && first.type === "word" ? first.value : null;
        const def = name && !visiting.has(name) ? definitionOf(model, name, mode) : undefined;
        if (name && def) {
          const resolved = resolveValue(model, def.value, mode, new Set([...visiting, name]));
          nodes[i] = { type: "word", value: resolved, sourceIndex: node.sourceIndex, sourceEndIndex: node.sourceEndIndex };
          continue;
        }
        const comma = node.nodes.findIndex(n => n.type === "div" && n.value === ",");
        if (comma !== -1) {
          const fallback = valueParser.stringify(node.nodes.slice(comma + 1)).trim();
          nodes[i] = { type: "word", value: resolveValue(model, fallback, mode, visiting), sourceIndex: node.sourceIndex, sourceEndIndex: node.sourceEndIndex };
          continue;
        }
      }
      substitute(node.nodes);
    }
  };
  substitute(ast.nodes);
  return valueParser.stringify(ast.nodes).replace(/\s+/g, " ").trim();
}

/** 모드별 `이름 → 해석값` 맵. 이름 오름차순 — 스냅샷이 선언 순서에 흔들리지 않게. */
export function resolvedMap(model: TokenModel, mode: Mode): Record<string, string> {
  const names = [...new Set(model.tokens.map(t => t.name))].sort();
  const out: Record<string, string> = {};
  for (const name of names) {
    const def = definitionOf(model, name, mode);
    if (def) out[name] = resolveValue(model, def.value, mode);
  }
  return out;
}

/** `--a → --b → --c` 사슬의 길이(var 홉 수). 순환이면 Infinity. */
export function referenceDepth(model: TokenModel, name: string, mode: Mode, seen: ReadonlySet<string> = new Set()): number {
  if (seen.has(name)) return Number.POSITIVE_INFINITY;
  const def = definitionOf(model, name, mode);
  if (!def || def.refs.length === 0) return 0;
  const next = new Set([...seen, name]);
  return 1 + Math.max(...def.refs.map(ref => referenceDepth(model, ref, mode, next)));
}
