/* Vite 의 `?raw` import — 파일 내용을 문자열로 싣는다. tsconfig.stories 는 `vite/client` 타입을 싣지 않으므로(types: node) 이것만 선언한다. */
declare module "*?raw" {
  const content: string;
  export default content;
}
