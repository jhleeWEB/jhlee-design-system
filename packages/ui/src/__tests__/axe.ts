/* axe-core 를 jsdom 에서 직접 부른다(계획 §2.4 D-3, C3). 별도 매처 패키지 대신 15줄 헬퍼인 이유: 실패 메시지에 규칙 id·대상 선택자를 우리가
 * 고른 모양으로 실어야 KNOWN_* 래칫과 같은 키로 읽힌다. jsdom 은 레이아웃·색을 계산하지 않아 `color-contrast`(브라우저 층 addon-a11y 가 실측)와
 * `region`(스토리 조각은 랜드마크 밖이 정상)을 끈다. */
import axe from "axe-core";

const JSDOM_OFF = ["color-contrast", "region"] as const;

/** 위반을 `rule: selector, selector` 줄로 낸다 — 빈 배열이 통과다. */
export async function axeViolations(node: Element, disabledRules: readonly string[] = []): Promise<string[]> {
  const rules = Object.fromEntries([...JSDOM_OFF, ...disabledRules].map(id => [id, { enabled: false }]));
  const results = await axe.run(node, { rules, resultTypes: ["violations"] });
  return results.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(" ")).join(", ")}`);
}
