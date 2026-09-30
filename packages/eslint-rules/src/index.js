/* 디자인 시스템 전용 로컬 ESLint 규칙(`ds/*`).
 *
 * 왜 워크스페이스 패키지인가: 규칙은 eslint.config.js 안에 인라인으로 둘 수도 있지만, 그러면 RuleTester 단위
 * 테스트를 붙일 자리가 없고 Phase C 의 소비자 프리셋(`@jhleeweb/squircle-design-system/eslint`)으로 옮길 때
 * 다시 떼어내야 한다. 처음부터 패키지로 두면 그 이동이 import 경로 하나로 끝난다.
 *
 * 왜 JS + JSDoc 인가: ESLint 가 config 를 Node 로 직접 import 하므로 TS 소스면 jiti 나 Node 의 type stripping 에
 * 기대야 한다. 규칙 넷은 작아서 JSDoc 타입 + `checkJs` 로 충분히 검사된다.
 */
import noBooleanStringDataAttr from "./rules/no-boolean-string-data-attr.js";
import legacyTone from "./rules/legacy-tone.js";
import noForwardRef from "./rules/no-forward-ref.js";
import noLiteralStyleValue from "./rules/no-literal-style-value.js";
import noMagicMs from "./rules/no-magic-ms.js";

/* no-boolean-string-data-attr 는 typescript-eslint 의 RuleModule 타입(타입 서비스 접근)이라 ESLint 코어 타입과 구조가 조금 다르다 —
 * 런타임 계약은 같으므로 플러그인 경계에서만 넓힌다. */
/** @type {{ meta: { name: string, version: string }, rules: Record<string, import("eslint").Rule.RuleModule> }} */
const plugin = {
  meta: { name: "@buildos/eslint-rules", version: "0.1.0" },
  rules: {
    "no-boolean-string-data-attr": /** @type {import("eslint").Rule.RuleModule} */ (/** @type {unknown} */ (noBooleanStringDataAttr)),
    "legacy-tone": legacyTone,
    "no-forward-ref": noForwardRef,
    "no-literal-style-value": noLiteralStyleValue,
    "no-magic-ms": noMagicMs,
  },
};

export default plugin;
