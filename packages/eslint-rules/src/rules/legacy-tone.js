/* ds/legacy-tone — 정본은 `packages/ui/src/eslint/rules/legacy-tone.ts` 다(#31).
 *
 * 소비자 프리셋(`@jhleeweb/squircle-design-system/eslint`)이 이 규칙을 배포물에 실어야 하는데 이 패키지는 발행하지 않고 tsdown unbundle 은
 * src 밖 파일을 dist 로 옮기지 못한다. 그래서 규칙은 ui 소스로 옮기고 여기서는 재수출만 한다 — 워크스페이스 린트(루트 eslint.config.js)와
 * 소비 레포가 같은 파일을 돌린다. Node 24 가 `.ts` 를 그대로 읽으므로(type stripping) 빌드 없이 import 된다. */
export { default, LEGACY_TONES } from "../../../ui/src/eslint/rules/legacy-tone.ts";
