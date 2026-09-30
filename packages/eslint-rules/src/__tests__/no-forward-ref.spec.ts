import rule from "../rules/no-forward-ref.js";
import { syntaxTester } from "./rule-tester.js";

syntaxTester.run("no-forward-ref", rule as never, {
  valid: [
    "const Button = ({ ref, ...props }: Props) => <button ref={ref} {...props} />;",
    'import { forwardRef } from "react"; const x = 1;',
    "const forwardRefs = () => 1; forwardRefs();",
  ],
  invalid: [
    {
      code: 'import { forwardRef } from "react"; const Button = forwardRef((props, ref) => <button ref={ref} />);',
      errors: [{ messageId: "noForwardRef" }],
    },
    {
      code: 'import * as React from "react"; const Button = React.forwardRef<HTMLButtonElement, Props>((props, ref) => null);',
      errors: [{ messageId: "noForwardRef" }],
    },
  ],
});
