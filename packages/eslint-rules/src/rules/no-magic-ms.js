/* ds/no-magic-ms — 시간 값을 숫자 리터럴로 적는 것을 잡는다.
 *
 * 왜: 토스트 220/180ms · 접기 200ms · 툴팁 350ms 같은 값이 컴포넌트마다 흩어지면 «토스트 퇴장이 큐 유예보다 짧아야 한다»
 * 같은 불변식(계획 §2.4 motion.spec)을 검사할 자리가 없다. 시간은 `tokens/motion.ts` 한 곳(Phase B1)에서 가져온다.
 *
 * 잡는 자리 셋: `setTimeout`/`setInterval` 의 둘째 인자 · JSX `duration=`·`delayDuration=`·`skipDelayDuration=` ·
 * 같은 이름의 객체 프로퍼티와 기본값 매개변수(`delayDuration = 350`). `0` 은 «다음 틱» 관용구라 시간 토큰이 아니어서 뺀다.
 */

const TIMER_CALLEES = new Set(["setTimeout", "setInterval"]);
const TIMER_OWNERS = new Set(["window", "globalThis", "self"]);
const DURATION_PROPS = new Set(["duration", "delayDuration", "skipDelayDuration"]);

/** @param {import("estree").Node | null | undefined} node */
function isMagicNumber(node) {
  if (!node) return false;
  if (node.type === "Literal" && typeof node.value === "number") return node.value !== 0;
  // `-1`·`+300` — 부호가 붙어도 리터럴이다.
  if (node.type === "UnaryExpression" && (node.operator === "-" || node.operator === "+")) {
    return isMagicNumber(node.argument);
  }
  return false;
}

/** @param {import("estree").Expression | import("estree").Super} callee */
function isTimerCallee(callee) {
  if (callee.type === "Identifier") return TIMER_CALLEES.has(callee.name);
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    TIMER_OWNERS.has(callee.object.name) &&
    callee.property.type === "Identifier" &&
    TIMER_CALLEES.has(callee.property.name)
  );
}

/** @param {import("estree").Node} key */
function keyName(key) {
  if (key.type === "Identifier") return key.name;
  if (key.type === "Literal" && typeof key.value === "string") return key.value;
  return null;
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "시간(ms)은 숫자 리터럴이 아니라 모션 토큰에서 가져온다",
    },
    messages: {
      magicMs: "Magic duration `{{value}}` — import it from the motion tokens instead of inlining a number.",
    },
    schema: [],
  },
  create(context) {
    /** @param {import("estree").Node} node */
    const report = (node) =>
      context.report({ node, messageId: "magicMs", data: { value: context.sourceCode.getText(node) } });

    return {
      CallExpression(node) {
        if (!isTimerCallee(node.callee)) return;
        const delay = node.arguments[1];
        if (delay && isMagicNumber(delay)) report(delay);
      },
      /** @param {any} node — ESLint 코어 타입에는 JSX 노드가 없다. */
      JSXAttribute(node) {
        const attr = node;
        if (attr.name.type !== "JSXIdentifier" || !DURATION_PROPS.has(attr.name.name)) return;
        const value = attr.value;
        if (value && value.type === "JSXExpressionContainer" && isMagicNumber(value.expression)) {
          report(value.expression);
        }
      },
      Property(node) {
        const name = keyName(node.key);
        if (name === null || !DURATION_PROPS.has(name) || node.computed) return;
        // `{ duration: 200 }` 과 매개변수 구조분해 기본값 `{ delayDuration = 350 }` — 후자는 value 가 AssignmentPattern 이다.
        const value = node.value.type === "AssignmentPattern" ? node.value.right : node.value;
        if (isMagicNumber(value)) report(value);
      },
    };
  },
};

export default rule;
