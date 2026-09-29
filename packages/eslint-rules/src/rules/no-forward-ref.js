/* ds/no-forward-ref — `forwardRef` 사용을 잡는다.
 *
 * React 19 부터 함수 컴포넌트는 `ref` 를 일반 prop 으로 받는다. forwardRef 래퍼는 displayName·docgen·manifest 생성기
 * (계획 §2.5-c) 가 컴포넌트를 «FunctionComponent 가 아닌 ForwardRefExoticComponent» 로 보게 해 prop 추출이 갈린다.
 * Phase A 는 warn + 기준선, 기존 13곳은 Phase D 컴포넌트 정렬에서 하나씩 지운다.
 */

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "forwardRef 대신 React 19 의 ref prop 을 쓴다",
    },
    messages: {
      noForwardRef: "forwardRef is unnecessary in React 19 — take `ref` as a regular prop (`({ ref, ...props }) => …`).",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        // `forwardRef(...)` 와 `React.forwardRef(...)` 둘 다 — import 지정자는 세지 않는다(호출 하나에 경고 하나).
        const isBare = callee.type === "Identifier" && callee.name === "forwardRef";
        const isMember =
          callee.type === "MemberExpression" &&
          !callee.computed &&
          callee.property.type === "Identifier" &&
          callee.property.name === "forwardRef";
        if (isBare || isMember) {
          context.report({ node: callee, messageId: "noForwardRef" });
        }
      },
    };
  },
};

export default rule;
