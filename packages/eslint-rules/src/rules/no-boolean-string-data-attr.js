/* ds/no-boolean-string-data-attr — `data-x={불리언식}` 을 잡는다.
 *
 * React 는 `data-*` 에 불리언을 주면 `"true"`/`"false"` **문자열**을 그린다. CSS 의 `[data-open]` 은 `"false"` 에도 맞으므로
 * 상태 선택자가 조용히 틀린다. 이 DS 의 관행은 presence(`data-collapsed={collapsed || undefined}`) 또는 명시 문자열
 * (`data-scroll-active={active ? "true" : "false"}`) 이다.
 *
 * 판정은 타입으로 한다: 표현식 타입에서 `undefined`/`null` 을 뺀 나머지에 `false` 가 들어갈 수 있으면 위반이다.
 * `cond || undefined` 는 `true | undefined` 라 통과하고, `open` (boolean) 과 `a === b` 는 걸린다. 타입 정보가 없는 자리
 * (config 파일·RuleTester 의 순수 구문 케이스)에서는 구문으로만 판정한다 — 리터럴 `false`·`!x`·비교 연산·`Boolean()`.
 */
import { ESLintUtils } from "@typescript-eslint/utils";
import ts from "typescript";

const COMPARISON = new Set(["===", "!==", "==", "!=", "<", ">", "<=", ">=", "instanceof", "in"]);

/** 구문만으로 «false 가 나올 수 있는 식» 인지 본다. 타입 정보가 없을 때의 폴백이다.
 * @param {import("estree").Node} node
 * @returns {boolean} */
function isSyntacticallyBoolean(node) {
  switch (node.type) {
    case "Literal":
      return node.value === false;
    case "UnaryExpression":
      return node.operator === "!";
    case "BinaryExpression":
      return COMPARISON.has(node.operator);
    case "CallExpression":
      return node.callee.type === "Identifier" && node.callee.name === "Boolean";
    case "ConditionalExpression":
      return isSyntacticallyBoolean(node.consequent) || isSyntacticallyBoolean(node.alternate);
    case "LogicalExpression":
      // `a && b` 는 a 가 falsy 면 a 를 돌려준다 — 왼쪽이 불리언이면 false 가 새어 나온다.
      return node.operator === "&&"
        ? isSyntacticallyBoolean(node.left) || isSyntacticallyBoolean(node.right)
        : isSyntacticallyBoolean(node.right);
    default:
      return false;
  }
}

/** @param {import("typescript").Type} type */
function mayBeFalse(type) {
  const parts = type.isUnion() ? type.types : [type];
  return parts.some((part) => {
    if (part.flags & ts.TypeFlags.Boolean) return true;
    if (part.flags & ts.TypeFlags.BooleanLiteral) {
      // TS 는 `false` 리터럴 타입을 intrinsicName 으로 구분한다 — 공개 API 가 없어 이 필드를 읽는다.
      return /** @type {{ intrinsicName?: string }} */ (part).intrinsicName === "false";
    }
    return false;
  });
}

/** @type {import("@typescript-eslint/utils").TSESLint.RuleModule<"booleanDataAttr", []>} */
const rule = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description: 'data-* 속성에 불리언을 넘기지 않는다 — "false" 문자열이 그려진다',
    },
    messages: {
      booleanDataAttr:
        '`{{name}}` would render the string "true"/"false" — use presence (`{{name}}={cond || undefined}`) or an explicit string.',
    },
    schema: [],
  },
  create(context) {
    const services = ESLintUtils.getParserServices(context, true);
    const typed = services.program !== null && typeof services.getTypeAtLocation === "function";

    return {
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier" || !node.name.name.startsWith("data-")) return;
        const value = node.value;
        if (
          !value ||
          value.type !== "JSXExpressionContainer" ||
          value.expression.type === "JSXEmptyExpression"
        )
          return;
        const expression = value.expression;

        let violates;
        if (typed) {
          const checker = services.program.getTypeChecker();
          const type = checker.getTypeAtLocation(services.esTreeNodeToTSNodeMap.get(expression));
          violates = mayBeFalse(type);
        } else {
          violates = isSyntacticallyBoolean(
            /** @type {import("estree").Node} */ (/** @type {unknown} */ (expression)),
          );
        }
        if (violates)
          context.report({ node: value, messageId: "booleanDataAttr", data: { name: node.name.name } });
      },
    };
  },
};

export default rule;
