/* ds/no-literal-style-value — className / cva / cn 문자열 안의 토큰 밖 값을 잡는다.
 *
 * CLAUDE.md «토큰 밖 값을 쓰지 않는다» 의 기계 판정이다. 세 부류를 본다:
 *   1. 단위·색 리터럴이 든 arbitrary 값 — `w-[16px]` `bg-[#0869e1]` `text-[rgb(…)]` `duration-[150ms]` `rounded-[7px]`
 *   2. Tailwind 기본 눈금을 그대로 쓴 것 — `duration-100` `z-50` `leading-5` `font-500` `tracking-2`
 *      (theme.css 가 `initial` 로 리셋한 사다리라 토큰 사다리 이름(`duration-fast`·`z-pop` …)을 써야 한다)
 * 계획 §2.4 의 `tsx-arbitrary-literal`·`tsx-tailwind-default-scale` 래칫을 ESLint 로 옮긴 것이다.
 *
 * 문자열이 «클래스» 인지의 판정은 자리다: JSX `className`/`class` 속성, 그리고 `cn`·`cva`·`clsx`·`twMerge`·`tv` 호출의
 * 인자(중첩 객체·배열 안까지). 그 밖의 문자열(라벨·aria)은 보지 않는다 — `"Save"` 안의 hex 를 걱정할 일은 없다.
 */

const CLASS_FUNCTIONS = new Set(["cn", "cva", "clsx", "twMerge", "tv", "cx"]);
const CLASS_ATTRIBUTES = new Set(["className", "class"]);

/* 대괄호 안에 px/rem/em/ms/s/vh/vw 단위 숫자, hex, rgb/hsl/oklch 함수가 있으면 리터럴 값이다.
 * `[&>svg]`·`[data-state=open]` 같은 선택자 arbitrary variant 는 걸리지 않는다. */
const ARBITRARY_LITERAL = /\[[^\]]*(?:\d+(?:\.\d+)?(?:px|rem|em|ms|s|vh|vw|%)\b|#[0-9a-fA-F]{3,8}\b|(?:rgb|hsl|oklch|oklab|lab|lch)a?\()[^\]]*\]/;
/* Tailwind 기본 눈금. `duration-100` 은 잡고 `duration-fast`·`duration-(--x)` 는 두 번째 세그먼트가 숫자가 아니라 통과한다. */
const DEFAULT_SCALE = /^-?(?:duration|delay|z|leading|font|tracking)-\d+(?:\.\d+)?$/;

/** 변형 접두(`hover:`·`data-[state=open]:`)와 `!` 를 떼고 유틸리티 본체만 남긴다. 대괄호 안의 `:` 는 접두 구분자가 아니다.
 * @param {string} token
 * @returns {string} */
function utilityOf(token) {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i += 1) {
    const ch = token[i];
    if (ch === "[") depth += 1;
    else if (ch === "]") depth = Math.max(0, depth - 1);
    else if (ch === ":" && depth === 0) start = i + 1;
  }
  return token.slice(start).replace(/^!/, "");
}

/** @param {string} token */
function violationOf(token) {
  const utility = utilityOf(token);
  if (ARBITRARY_LITERAL.test(utility)) return "arbitraryLiteral";
  if (DEFAULT_SCALE.test(utility)) return "defaultScale";
  return null;
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "className/cva/cn 문자열에 토큰 밖 리터럴(px·hex·rgb·기본 눈금)을 쓰지 않는다",
    },
    messages: {
      arbitraryLiteral: "`{{token}}` hard-codes a value — use a token utility from theme.css (add a token if none fits).",
      defaultScale: "`{{token}}` uses Tailwind's default scale, which theme.css resets — use the token ladder (e.g. `duration-fast`, `z-pop`).",
    },
    schema: [],
  },
  create(context) {
    /* `className={cn("…")}` 은 JSXAttribute 와 CallExpression 두 방문자가 같은 문자열에 닿는다 — 한 노드는 한 번만 보고한다. */
    const seen = new WeakSet();
    /** @param {import("estree").Node} node @param {string} text */
    const checkText = (node, text) => {
      if (seen.has(node)) return;
      seen.add(node);
      for (const token of text.split(/\s+/)) {
        if (!token) continue;
        const messageId = violationOf(token);
        if (messageId) context.report({ node, messageId, data: { token } });
      }
    };

    /** 클래스 자리 안의 모든 문자열·템플릿 조각을 본다. 조건식·객체·배열 어디에 있든 문자열이면 클래스다.
     * @param {import("estree").Node | null | undefined} node */
    const visit = node => {
      if (!node || typeof node !== "object") return;
      // JSX 노드는 estree 타입 밖이다 — `className={…}` 의 컨테이너만 벗기고 나머지는 estree 로 본다.
      if (/** @type {string} */ (node.type) === "JSXExpressionContainer") {
        visit(/** @type {any} */ (node).expression);
        return;
      }
      switch (node.type) {
        case "Literal":
          if (typeof node.value === "string") checkText(node, node.value);
          return;
        case "TemplateLiteral":
          for (const quasi of node.quasis) checkText(quasi, quasi.value.cooked ?? quasi.value.raw);
          for (const expr of node.expressions) visit(expr);
          return;
        case "ConditionalExpression":
          visit(node.consequent);
          visit(node.alternate);
          return;
        case "LogicalExpression":
          visit(node.left);
          visit(node.right);
          return;
        case "ArrayExpression":
          for (const el of node.elements) visit(el);
          return;
        case "ObjectExpression":
          for (const prop of node.properties) {
            if (prop.type !== "Property") continue;
            // cva 의 `{ solid: "bg-accent" }` 처럼 값이 클래스고, `{ "bg-[#fff]": active }` 처럼 키가 클래스일 수도 있다.
            if (prop.computed || prop.key.type === "Literal") visit(prop.key);
            visit(prop.value);
          }
          return;
        case "CallExpression":
          for (const arg of node.arguments) visit(arg);
          return;
        default:
          return;
      }
    };

    return {
      /** @param {any} node — ESLint 코어 타입에는 JSX 노드가 없다. */
      JSXAttribute(node) {
        const attr = node;
        if (attr.name.type !== "JSXIdentifier" || !CLASS_ATTRIBUTES.has(attr.name.name)) return;
        visit(attr.value);
      },
      CallExpression(node) {
        const callee = node.callee;
        const name =
          callee.type === "Identifier"
            ? callee.name
            : callee.type === "MemberExpression" && !callee.computed && callee.property.type === "Identifier"
              ? callee.property.name
              : null;
        if (name === null || !CLASS_FUNCTIONS.has(name)) return;
        for (const arg of node.arguments) visit(arg);
      },
    };
  },
};

export default rule;
