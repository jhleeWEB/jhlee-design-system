/* Prettier 3 — 포맷은 도구가 하고 리뷰는 내용만 본다(계획 §2.4 D-1, C4). 첫 적용은 포맷 전용 커밋 하나이고 그 해시는 .git-blame-ignore-revs 에 있다.
 *  - printWidth 110: 이 패키지의 cva 문자열·JSX 속성 줄이 80 에서는 매 줄 접혀 읽기 어렵고, 120 을 넘기면 분할 화면에서 잘린다 — 실측 절충.
 *  - prettier-plugin-tailwindcss: className·cn()·cva() 안의 클래스를 Tailwind 의 레이어 순서로 정렬한다. `tailwindStylesheet` 이 theme.css 라
 *    우리 @theme·@utility(h-ctl · z-toast · rounded-md …)를 알고 정렬한다 — 모르는 클래스는 앞에 그대로 남는다. */
export default {
  printWidth: 110,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./packages/ui/src/theme.css",
  tailwindFunctions: ["cn", "cva"],
};
