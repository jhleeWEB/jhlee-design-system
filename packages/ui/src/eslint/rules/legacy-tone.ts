/* ds/legacy-tone — `tone="accent"` · `tone: "ok"` 같은 옛 톤 키를 잡고 새 키로 고친다(B5, #22).
 *
 * 톤 어휘는 `src/lib/tone.ts` 의 한 벌(neutral · primary · success · warning · destructive · info)이고 옛 키는 한 마이너 동안
 * `normalizeTone()` 이 런타임에서 옮겨 준다. 그래서 옛 키는 «동작은 하지만 곧 사라지는» 것이고, 이 규칙의 `--fix` 가 곧 코드모드다 —
 * 이 패키지는 루트 eslint.config.js 로, 소비 레포는 프리셋(`@jhleeweb/squircle-design-system/eslint`)으로 같은 규칙을 돌린다.
 *
 * 왜 여기(패키지 소스)에 있는가: 프리셋이 규칙을 배포물에 실어야 하는데 `packages/eslint-rules` 는 발행하지 않고, tsdown unbundle 은
 * src 밖 파일을 dist 로 옮기지 못한다. 그래서 정본은 이 파일이고 `packages/eslint-rules/src/rules/legacy-tone.js` 는 이것을 재수출한다(#31).
 *
 * 보는 자리: JSX 속성 `tone=…` 과 객체 프로퍼티 `tone: …`(toast({ tone }) · defaultVariants). 값은 문자열 리터럴이거나 삼항·`||`·`??` 의
 * 가지에 있는 문자열 리터럴이다. cva 의 `variants: { tone: { ok: "…" } }` 처럼 **키** 자리는 보지 않는다 — 그것은 컴포넌트 정의라 손으로
 * 바꾸는 것이 맞고, 자동 수정하면 컴포넌트가 새 키를 받지 않는 채 호출처만 바뀐다. */
import type { Rule } from "eslint";
import type { Literal, Node } from "estree";

/** 옛 키 → 새 키. tone.ts 의 LEGACY_TONES 와 같아야 한다 — 스펙이 그 파일을 읽어 대조한다. */
export const LEGACY_TONES = Object.freeze({
  accent: "primary",
  ok: "success",
  warn: "warning",
  danger: "destructive",
  default: "neutral",
  current: "neutral",
} as const);

/** 문자열 리터럴 노드들 — 삼항·논리식의 가지를 따라 내려간다. */
function stringLiterals(node: Node): Literal[] {
  switch (node.type) {
    case "Literal":
      return typeof node.value === "string" ? [node] : [];
    case "ConditionalExpression":
      return [...stringLiterals(node.consequent), ...stringLiterals(node.alternate)];
    case "LogicalExpression":
      return [...stringLiterals(node.left), ...stringLiterals(node.right)];
    default: {
      // TS 래퍼(`"ok" as const` · `x!`)는 estree 타입에 없다 — 문자열로 비교해 안을 본다.
      const type = node.type as string;
      if (type === "TSAsExpression" || type === "TSSatisfiesExpression" || type === "TSNonNullExpression")
        return stringLiterals((node as unknown as { expression: Node }).expression);
      return [];
    }
  }
}

/** JSXAttribute 는 ESLint 코어의 estree 타입에 없다(JSX 는 파서 확장) — 필요한 모양만 적는다. */
interface JsxAttributeNode {
  name?: { type: string; name: string };
  value?: { type: string; expression?: Node } | (Literal & { type: "Literal" }) | null;
}

/** `ds/legacy-tone` 규칙 — 옛 톤 키(accent · ok · warn · danger · default · current)를 새 키로 바꾼다. */
const legacyTone: Rule.RuleModule = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: { description: "옛 톤 키(accent · ok · warn · danger · default · current)를 새 키로 바꾼다" },
    messages: {
      legacyTone:
        '`tone="{{from}}"` is a legacy tone — use `"{{to}}"` (neutral · primary · success · warning · destructive · info).',
    },
    schema: [],
  },
  create(context) {
    const check = (valueNode: Node): void => {
      for (const literal of stringLiterals(valueNode)) {
        const from = literal.value as string;
        if (!Object.hasOwn(LEGACY_TONES, from)) continue;
        const to = LEGACY_TONES[from as keyof typeof LEGACY_TONES];
        const quote = literal.raw?.[0] ?? '"';
        context.report({
          node: literal,
          messageId: "legacyTone",
          data: { from, to },
          fix: (fixer) => fixer.replaceText(literal, `${quote}${to}${quote}`),
        });
      }
    };
    return {
      JSXAttribute(node: Node) {
        const attr = node as unknown as JsxAttributeNode;
        if (attr.name?.type !== "JSXIdentifier" || attr.name.name !== "tone" || !attr.value) return;
        if (attr.value.type === "Literal") check(attr.value as Literal);
        else if (
          attr.value.type === "JSXExpressionContainer" &&
          attr.value.expression &&
          attr.value.expression.type !== ("JSXEmptyExpression" as string)
        )
          check(attr.value.expression);
      },
      Property(node) {
        const key = node.key;
        const name = key.type === "Identifier" ? key.name : key.type === "Literal" ? String(key.value) : null;
        if (name !== "tone" || node.computed) return;
        check(node.value);
      },
    };
  },
};

export default legacyTone;
