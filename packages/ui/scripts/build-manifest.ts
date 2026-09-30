/**
 * `dist/components.manifest.json` 생성기(계획 §2.5-c, #31) — «지어낸 prop 차단의 정본».
 *
 * TS 컴파일러 API(`ts.createProgram` + checker)로 `src/index.ts` 의 export 를 순회한다. react-docgen-typescript 를 쓰지 않는 이유: `@default`
 * 처리가 미확인이고 cva·재export 에서 실패 보고가 있다 — 타입 검사기가 이미 아는 것(prop 의 optional 여부·유니언 리터럴·JSDoc 태그)을
 * 다른 도구로 다시 추정할 이유가 없다. 실행은 Node 24 의 type stripping(`node scripts/build-manifest.ts`)이라 지울 수 있는 문법만 쓴다
 * (enum·namespace·parameter property 없음, `.ts` 확장자 명시).
 *
 * 스키마(계획): `{ tokens{colors,radius,text,spacingSteps,…}, components[]{name, kind: component|compound|hook, importPath, client, description,
 * example, props[]{name,type,required,default,values[]{value,doc},description}, parts, sugar, deprecated}, utilities[] }`.
 *  - `compound` = 같은 파일의 다른 컴포넌트 이름을 접두로 가진 컴포넌트(`ModalContent` → `Modal` 의 부품). 부품은 루트의 `parts` 에 실린다.
 *  - `sugar` 는 오늘 비어 있다 — 설탕(부품만으로 조립한 편의 래퍼)은 Phase D 의 부품 1·2차와 함께 생기고, 그때 JSDoc 태그로 표시한다.
 *  - `utilities` 는 컴포넌트·훅이 아닌 값 export(`*Variants` · `cn` · 상수) — «index export 전수 포함» 게이트가 두 배열의 합집합으로 본다.
 *  - optional prop 의 `default` 는 `@default` 태그 → 같은 파일이 import 하는 cva 의 `defaultVariants` 순으로 채운다. 유니언 `values[].doc` 은
 *    설명의 «`값` — 설명» 또는 «`값`(설명)» 줄에서 읽고, 옛 tone 키는 legacy-tone 표로 «deprecated alias» 를 자동으로 단다.
 *  - `client` 는 export 가 선언된 파일의 첫 줄 `"use client"` 다(배럴의 const 별칭은 초기화식을 한 단계 따라간다).
 */
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

import { LEGACY_TONES } from "../src/eslint/rules/legacy-tone.ts";
import { SPACING_STEPS } from "../src/eslint/spacing.ts";
import { LEGACY_FILE, readTokenSources, validateTokenSources } from "../tokens/schema.ts";

/** 패키지 루트(`packages/ui`). */
export const PKG_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/** 생성물 위치 — dist 는 커밋하지 않으므로 `pnpm build` 가 tsdown 뒤에 만든다. */
export const MANIFEST_PATH = join(PKG_DIR, "dist", "components.manifest.json");
/** 소비자가 쓰는 import 경로 — 서브패스가 아닌 것은 전부 루트 배럴이다. */
export const IMPORT_PATH = "@jhleeweb/squircle-design-system";

/** 유니언 리터럴 하나. */
export interface ManifestValue {
  readonly value: string;
  /** 값의 뜻 — JSDoc 의 «`값` — 설명» 줄. 비어 있으면 게이트(KNOWN_GAPS)가 센다. */
  readonly doc: string;
}

/** prop 하나(훅은 매개변수). */
export interface ManifestProp {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  /** optional prop 의 기본값 — 비어 있으면 게이트가 센다. */
  readonly default: string;
  readonly values: readonly ManifestValue[];
  readonly description: string;
}

/** 컴포넌트 종류. */
export type ComponentKind = "component" | "compound" | "hook";

/** 컴포넌트·훅 하나. */
export interface ManifestComponent {
  readonly name: string;
  readonly kind: ComponentKind;
  readonly importPath: string;
  /** 선언 파일(패키지 루트 기준). */
  readonly source: string;
  /** 선언 파일 첫 줄이 `"use client"` 인가 — 서버 컴포넌트에서 렌더할 수 없다. */
  readonly client: boolean;
  readonly description: string;
  readonly example: string;
  readonly props: readonly ManifestProp[];
  /** 물려받는 props 타입(HTML 속성 등) — 여기 적힌 것은 `props` 에 펼치지 않는다. */
  readonly inherits: readonly string[];
  readonly parts: readonly string[];
  readonly sugar: readonly string[];
  readonly deprecated: string | false;
}

/** 컴포넌트·훅이 아닌 값 export. */
export interface ManifestUtility {
  readonly name: string;
  readonly kind: "variants" | "function" | "constant";
  readonly importPath: string;
  readonly source: string;
  readonly client: boolean;
  readonly description: string;
  readonly deprecated: string | false;
  /** cva 의 축 → 값 목록(`variants` 만). */
  readonly axes?: Readonly<Record<string, readonly string[]>>;
  /** cva 의 `defaultVariants`(`variants` 만). */
  readonly defaults?: Readonly<Record<string, string>>;
}

/** 토큰 색인 — 유틸리티 이름의 어휘. 값은 CSS 생성물이 든다. */
export interface ManifestTokens {
  readonly colors: readonly string[];
  readonly radius: readonly string[];
  readonly text: readonly string[];
  readonly shadow: readonly string[];
  readonly height: readonly string[];
  readonly container: readonly string[];
  readonly layer: readonly string[];
  readonly duration: readonly string[];
  readonly spacingSteps: readonly number[];
}

/** 매니페스트 전체. */
export interface Manifest {
  readonly package: { readonly name: string; readonly version: string };
  readonly generatedBy: string;
  readonly tokens: ManifestTokens;
  readonly components: readonly ManifestComponent[];
  readonly utilities: readonly ManifestUtility[];
}

const SRC_DIR = join(PKG_DIR, "src");
const toPosix = (p: string): string => p.split(sep).join("/");
const inSrc = (fileName: string): boolean => toPosix(fileName).startsWith(`${toPosix(SRC_DIR)}/`);

function createProgram(): ts.Program {
  const configPath = join(PKG_DIR, "tsconfig.json");
  const config = ts.readConfigFile(configPath, path => ts.sys.readFile(path));
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, PKG_DIR);
  return ts.createProgram({ rootNames: [join(SRC_DIR, "index.ts")], options: { ...parsed.options, noEmit: true } });
}

const isClientFile = (sf: ts.SourceFile): boolean => (sf.text.split("\n")[0] ?? "").trim() === '"use client";';

/**
 * 소스 안의 마지막 선언 — client·source 는 «우리 파일» 의 것이어야 한다.
 *  - 별칭 사슬(index.ts → primitives/index.ts → Button.tsx)은 한 단계씩 따라가되, 다음 고리가 src 밖(cva → class-variance-authority)이면
 *    거기서 멈춰 재수출 지정자가 있는 우리 파일(cn.ts)을 답한다.
 *  - `export const X = Y` 같은 배럴의 const 별칭은 초기화식의 심볼로 한 단계 내려간다.
 */
function originDeclaration(checker: ts.TypeChecker, exported: ts.Symbol): ts.Declaration | undefined {
  let symbol = exported;
  for (let hops = 0; hops < 16 && symbol.flags & ts.SymbolFlags.Alias; hops++) {
    const next = checker.getImmediateAliasedSymbol(symbol);
    if (!next) break;
    const nextDecl = next.valueDeclaration ?? next.declarations?.[0];
    if (!nextDecl || !inSrc(nextDecl.getSourceFile().fileName)) break;
    symbol = next;
  }
  const decl = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!decl) return undefined;
  if (ts.isVariableDeclaration(decl) && decl.initializer && /(^|\/)index\.ts$/.test(toPosix(decl.getSourceFile().fileName))) {
    const init = decl.initializer;
    const target = ts.isIdentifier(init) ? init : ts.isPropertyAccessExpression(init) ? init.name : null;
    if (target) {
      let s = checker.getSymbolAtLocation(target);
      if (s && s.flags & ts.SymbolFlags.Alias) s = checker.getAliasedSymbol(s);
      const inner = s?.valueDeclaration ?? s?.declarations?.[0];
      if (inner) return inner;
    }
  }
  return decl;
}

const docOf = (checker: ts.TypeChecker, ...symbols: ts.Symbol[]): string => {
  for (const s of symbols) {
    const text = ts.displayPartsToString(s.getDocumentationComment(checker)).trim();
    if (text) return text;
  }
  return "";
};

const tagOf = (checker: ts.TypeChecker, name: string, ...symbols: ts.Symbol[]): string | undefined => {
  for (const s of symbols) {
    const tag = s.getJsDocTags(checker).find(t => t.name === name);
    if (tag) return ts.displayPartsToString(tag.text ?? []).trim();
  }
  return undefined;
};

const deprecatedOf = (checker: ts.TypeChecker, ...symbols: ts.Symbol[]): string | false => {
  const text = tagOf(checker, "deprecated", ...symbols);
  return text === undefined ? false : text || "deprecated";
};

/** 설명에서 값 하나의 뜻을 읽는다 — «`값` — 설명»(다음 항목 앞까지) 또는 «`값`(설명)». */
export function docForValue(description: string, value: string): string {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const dash = new RegExp("`" + escaped + "`\\s*[—–-]+\\s*([^\\n]*?)(?=\\s+[-·•]\\s+`|\\s*$)", "m").exec(description);
  if (dash?.[1]) return dash[1].trim();
  const paren = new RegExp("`" + escaped + "`\\(([^)]+)\\)").exec(description);
  if (paren?.[1]) return paren[1].trim();
  return "";
}

function typeText(checker: ts.TypeChecker, type: ts.Type): string {
  return checker.typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
}

function literalValues(type: ts.Type): string[] | null {
  if (!type.isUnion()) return type.isStringLiteral() ? [type.value] : null;
  const values: string[] = [];
  for (const member of type.types) {
    if (member.isStringLiteral()) values.push(member.value);
    else if (member.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) continue;
    else return null; // 리터럴이 아닌 것과 섞인 유니언(`string | "auto"`)은 열거가 아니다
  }
  return values.length ? values : null;
}

/** cva 호출의 `variants` 축과 `defaultVariants` — AST 에서 읽는다(타입은 `defaultVariants` 를 잃는다). */
export function readCva(decl: ts.Declaration): { axes: Record<string, string[]>; defaults: Record<string, string> } | null {
  if (!ts.isVariableDeclaration(decl) || !decl.initializer || !ts.isCallExpression(decl.initializer)) return null;
  const call = decl.initializer;
  if (!ts.isIdentifier(call.expression) || call.expression.text !== "cva") return null;
  const config = call.arguments[1];
  if (!config || !ts.isObjectLiteralExpression(config)) return { axes: {}, defaults: {} };
  const keyOf = (name: ts.PropertyName): string => (ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : name.getText());
  const axes: Record<string, string[]> = {};
  const defaults: Record<string, string> = {};
  for (const prop of config.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const key = keyOf(prop.name);
    if (key === "variants" && ts.isObjectLiteralExpression(prop.initializer)) {
      for (const axis of prop.initializer.properties) {
        if (!ts.isPropertyAssignment(axis) || !ts.isObjectLiteralExpression(axis.initializer)) continue;
        axes[keyOf(axis.name)] = axis.initializer.properties.filter(ts.isPropertyAssignment).map(v => keyOf(v.name));
      }
    }
    if (key === "defaultVariants" && ts.isObjectLiteralExpression(prop.initializer)) {
      for (const d of prop.initializer.properties) {
        if (!ts.isPropertyAssignment(d)) continue;
        const init = d.initializer;
        defaults[keyOf(d.name)] = ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init) ? init.text : init.getText();
      }
    }
  }
  return { axes, defaults };
}

/** 컴포넌트 파일이 import 하는 `*Variants` 심볼들의 cva 축·기본값 — `@default` 가 없는 variant prop 의 기본값과 값 순서의 출처. */
function cvaInFile(checker: ts.TypeChecker, sf: ts.SourceFile): { defaults: Record<string, string>; axes: Record<string, string[]> } {
  const defaults: Record<string, string> = {};
  const axes: Record<string, string[]> = {};
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause?.namedBindings || !ts.isNamedImports(stmt.importClause.namedBindings)) continue;
    for (const el of stmt.importClause.namedBindings.elements) {
      if (!el.name.text.endsWith("Variants")) continue;
      let s = checker.getSymbolAtLocation(el.name);
      if (s && s.flags & ts.SymbolFlags.Alias) s = checker.getAliasedSymbol(s);
      const decl = s?.valueDeclaration;
      const cva = decl ? readCva(decl) : null;
      if (cva) {
        Object.assign(defaults, cva.defaults);
        Object.assign(axes, cva.axes);
      }
    }
  }
  return { defaults, axes };
}

const LEGACY_TONE_KEYS = new Set(Object.keys(LEGACY_TONES));

/** 유니언 값의 순서 — 타입 검사기의 순서는 임의라, cva 축 순서 → 나머지 알파벳 → 옛 tone 키(deprecated)는 끝으로. */
export function orderValues(values: readonly string[], axisOrder: readonly string[]): string[] {
  const rank = (v: string): [number, number, string] => {
    if (LEGACY_TONE_KEYS.has(v)) return [2, 0, v];
    const i = axisOrder.indexOf(v);
    return i === -1 ? [1, 0, v] : [0, i, v];
  };
  return [...values].sort((a, b) => {
    const [ga, ia, sa] = rank(a);
    const [gb, ib, sb] = rank(b);
    return ga - gb || ia - ib || sa.localeCompare(sb);
  });
}

function propsOf(
  checker: ts.TypeChecker,
  propsType: ts.Type,
  at: ts.Node,
  cvaDefaults: Record<string, string>,
  cvaAxes: Record<string, string[]>,
): { props: ManifestProp[]; inherits: string[] } {
  const props: ManifestProp[] = [];
  for (const p of checker.getPropertiesOfType(propsType)) {
    const decls = p.declarations ?? [];
    // 우리 소스에 선언된 prop 만 — React 의 HTML 속성(onClick · aria-* …)은 `inherits` 로 가리킨다.
    if (!decls.some(d => inSrc(d.getSourceFile().fileName))) continue;
    const decl = p.valueDeclaration ?? decls[0] ?? at;
    const type = checker.getTypeOfSymbolAtLocation(p, decl);
    const optional = Boolean(p.flags & ts.SymbolFlags.Optional);
    const description = docOf(checker, p);
    const literals = orderValues(literalValues(type) ?? [], cvaAxes[p.name] ?? []);
    const values = literals.map(value => {
      let doc = docForValue(description, value);
      if (!doc && LEGACY_TONE_KEYS.has(value)) doc = `deprecated alias of "${LEGACY_TONES[value as keyof typeof LEGACY_TONES]}"`;
      return { value, doc };
    });
    let defaultValue = tagOf(checker, "default", p) ?? "";
    if (!defaultValue && optional && cvaDefaults[p.name] !== undefined) defaultValue = JSON.stringify(cvaDefaults[p.name]);
    props.push({
      name: p.name,
      type: typeText(checker, type).replace(/^undefined \| /, "").replace(/ \| undefined$/, ""),
      required: !optional,
      default: defaultValue,
      values,
      description,
    });
  }
  const inherits: string[] = [];
  const pushInherit = (text: string): void => {
    if (!/VariantProps</.test(text) && !inherits.includes(text)) inherits.push(text);
  };
  const constituents = propsType.isIntersection() ? propsType.types : [propsType];
  for (const t of constituents) {
    const decl = t.symbol?.declarations?.[0];
    if (decl && ts.isInterfaceDeclaration(decl) && inSrc(decl.getSourceFile().fileName)) {
      for (const clause of decl.heritageClauses ?? []) for (const type of clause.types) pushInherit(type.getText());
    } else if (decl && ts.isTypeLiteralNode(decl) && inSrc(decl.getSourceFile().fileName)) {
      continue;
    } else if (t !== propsType || !t.symbol) {
      pushInherit(typeText(checker, t));
    }
  }
  return { props, inherits: inherits.filter(text => text !== "{}") };
}

function hookParams(checker: ts.TypeChecker, sig: ts.Signature): ManifestProp[] {
  return sig.parameters.map(param => {
    const decl = param.valueDeclaration;
    const type = decl ? checker.getTypeOfSymbolAtLocation(param, decl) : checker.getDeclaredTypeOfSymbol(param);
    const optional = decl !== undefined && ts.isParameter(decl) && (decl.questionToken !== undefined || decl.initializer !== undefined);
    const defaultValue = decl && ts.isParameter(decl) && decl.initializer ? decl.initializer.getText() : "";
    return { name: param.name, type: typeText(checker, type), required: !optional, default: defaultValue, values: [], description: docOf(checker, param) };
  });
}

/** 토큰 색인 — DTCG 정본에서 legacy 파일을 뺀 이름. */
export function tokenIndex(): ManifestTokens {
  const { errors, tokens } = validateTokenSources(readTokenSources(join(PKG_DIR, "tokens")));
  if (errors.length) throw new Error(`tokens: ${errors.join("\n")}`);
  const names = (group: string, scope?: string): string[] =>
    tokens.filter(t => t.file !== LEGACY_FILE && t.path[0] === group && (scope === undefined || t.sds.scope === scope)).map(t => t.path.slice(1).join("-"));
  return {
    colors: names("color", "theme-inline"),
    radius: names("radius"),
    text: names("text"),
    shadow: names("shadow"),
    height: names("height"),
    container: names("container"),
    layer: names("layer"),
    duration: names("duration").filter(n => !n.includes("-")), // 컴포넌트 전용(toast-enter …)은 유틸리티가 아니다
    spacingSteps: [...SPACING_STEPS],
  };
}

/** 매니페스트를 만든다 — 파일은 쓰지 않는다(스펙이 메모리에서 검사한다). */
export function buildManifest(): Manifest {
  const program = createProgram();
  const checker = program.getTypeChecker();
  const indexSf = program.getSourceFile(join(SRC_DIR, "index.ts"));
  if (!indexSf) throw new Error("src/index.ts 를 프로그램이 읽지 못했다");
  const moduleSymbol = checker.getSymbolAtLocation(indexSf);
  if (!moduleSymbol) throw new Error("src/index.ts 의 모듈 심볼이 없다");
  const pkg = JSON.parse(readFileSync(join(PKG_DIR, "package.json"), "utf8")) as { name: string; version: string };

  const components: ManifestComponent[] = [];
  const utilities: ManifestUtility[] = [];
  const fileOf = new Map<string, string>();

  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const target = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    if (!(target.flags & ts.SymbolFlags.Value)) continue; // 타입 export 는 런타임 이름이 아니다
    const decl = originDeclaration(checker, exported);
    if (!decl) continue;
    const sf = decl.getSourceFile();
    const name = exported.name;
    const source = inSrc(sf.fileName) ? toPosix(relative(PKG_DIR, sf.fileName)) : toPosix(sf.fileName);
    const client = isClientFile(sf);
    const description = docOf(checker, exported, target);
    const deprecated = deprecatedOf(checker, exported, target);
    const type = checker.getTypeOfSymbolAtLocation(target, target.valueDeclaration ?? decl);
    const signatures = type.getCallSignatures();
    fileOf.set(name, source);

    if (/^use[A-Z]/.test(name)) {
      const sig = signatures[0];
      components.push({
        name, kind: "hook", importPath: IMPORT_PATH, source, client, description, example: tagOf(checker, "example", exported, target) ?? "",
        props: sig ? hookParams(checker, sig) : [], inherits: [], parts: [], sugar: [], deprecated,
      });
      continue;
    }
    if (name.endsWith("Variants")) {
      const cva = readCva(target.valueDeclaration ?? decl);
      utilities.push({ name, kind: "variants", importPath: IMPORT_PATH, source, client, description, deprecated, axes: cva?.axes ?? {}, defaults: cva?.defaults ?? {} });
      continue;
    }
    const pascal = /^[A-Z][a-z]/.test(name);
    if (pascal && (signatures.length > 0 || type.getConstructSignatures().length > 0)) {
      const sig = signatures[0];
      const param = sig?.parameters[0];
      const propsType = param ? checker.getTypeOfSymbolAtLocation(param, param.valueDeclaration ?? decl) : null;
      const cva = cvaInFile(checker, sf);
      const { props, inherits } = propsType ? propsOf(checker, propsType, decl, cva.defaults, cva.axes) : { props: [], inherits: [] };
      components.push({
        name, kind: "component", importPath: IMPORT_PATH, source, client, description, example: tagOf(checker, "example", exported, target) ?? "",
        props, inherits, parts: [], sugar: [], deprecated,
      });
      continue;
    }
    utilities.push({ name, kind: signatures.length > 0 ? "function" : "constant", importPath: IMPORT_PATH, source, client, description, deprecated });
  }

  // 부품 판정 — 같은 파일의 다른 컴포넌트 이름을 접두로 가지면 부품이다. 다른 파일이면 우연한 접두(Segmented ↔ SegmentedControl)다.
  // 루트는 «자기보다 짧은 접두 컴포넌트가 없는 것» 이고, 부품은 가장 긴 **루트** 접두에 붙는다 — `DropdownMenuSubContent` 는
  // `DropdownMenuSub`(부품)가 아니라 `DropdownMenu` 의 부품이다. 부품이 부품을 가지면 색인이 두 단계가 되어 LLM 이 루트를 놓친다.
  const prefixOf = (c: ManifestComponent, candidates: readonly ManifestComponent[]): string | null => {
    let root: string | null = null;
    for (const other of candidates) {
      if (other === c || other.kind !== "component" || other.source !== c.source) continue;
      if (c.name.startsWith(other.name) && /^[A-Z]/.test(c.name.slice(other.name.length)) && (root === null || other.name.length > root.length)) root = other.name;
    }
    return root;
  };
  const roots = components.filter(c => c.kind === "component" && prefixOf(c, components) === null);
  const parts = new Map<string, string[]>();
  const kinds = new Map<string, ComponentKind>();
  for (const c of components) {
    if (c.kind !== "component") continue;
    const root = prefixOf(c, roots);
    if (root) {
      kinds.set(c.name, "compound");
      parts.set(root, [...(parts.get(root) ?? []), c.name]);
    }
  }
  const finished = components
    .map(c => ({ ...c, kind: kinds.get(c.name) ?? c.kind, parts: [...(parts.get(c.name) ?? [])].sort((a, b) => a.localeCompare(b)) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    package: { name: pkg.name, version: pkg.version },
    generatedBy: "scripts/build-manifest.ts",
    tokens: tokenIndex(),
    components: finished,
    utilities: utilities.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/** 직렬화 — 키 순서는 위 인터페이스 순서 그대로, 끝에 개행. */
export function serializeManifest(manifest: Manifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

/** dist 에 쓴다 — `pnpm build` 가 tsdown 뒤에 부른다(tsdown 의 clean 이 dist 를 비우므로 순서가 중요하다). */
export function writeManifest(): Manifest {
  const manifest = buildManifest();
  if (!existsSync(dirname(MANIFEST_PATH))) mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(MANIFEST_PATH, serializeManifest(manifest));
  return manifest;
}

const invoked = process.argv[1] ? realpathSync(process.argv[1]) : "";
if (invoked && invoked === fileURLToPath(import.meta.url)) {
  const manifest = writeManifest();
  console.log(`manifest: ${manifest.components.length} components · ${manifest.utilities.length} utilities → ${relative(PKG_DIR, MANIFEST_PATH)}`);
}
