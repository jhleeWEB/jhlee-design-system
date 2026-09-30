/* eslint-plugin-react 는 타입을 싣지 않는다(7.37 실측). 프리셋이 쓰는 모양(플러그인 객체)만 선언한다 — d.ts 에는 나가지 않는다(값 import 만). */
declare module "eslint-plugin-react" {
  import type { ESLint } from "eslint";

  const plugin: ESLint.Plugin;
  export default plugin;
}
