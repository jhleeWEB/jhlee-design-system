/* `*.variants.ts` 는 지시문·훅이 없는 모듈이다 — 서버 컴포넌트도 className 을 얻으려 부를 수 있다(Input.variants.ts 와 같은 이유).
 *
 * 축(cva)이 없다 — 묶음 상자는 한 모양이다(#84 «과설계하지 않는다»). 인스펙터는 설정 항목마다 이 상자를 하나씩 세워 위아래로 쌓으므로
 * 상자마다 여백 · legend 자리 · 글자가 같아야 줄이 맞는다. 그래서 상자 · legend · 설명의 클래스를 여기 한 벌로 두고 배럴에 내보내지 않는다.
 *
 * 치수는 사용자 앱 인스펙터의 묶음 상자(테두리 1px · 반경 12px · 안쪽 12px · legend 좌우 4px, 2026-10-02 실측)를 역할 사다리로 옮긴 것이다.
 *  - 상자: `rounded-lg`(역할 표 «면») · `border-border`(구획선) · 좌우 · 아래 12px(`px-3 pb-3` — Accordion 본문 · Card `pad="sm"` 과 같은 단).
 *  - 위는 4px(`pt-1`)뿐이다 — 렌더된 legend 의 아래 절반(줄 높이의 반)이 이미 선 아래를 차지한다. 12px 를 더 두면 첫 줄이 선에서 22px 떨어져
 *    좌우(12px)보다 위만 헐거워졌다(Storybook 실측). 4px 를 두면 선 → 첫 줄이 줄 높이의 반 + 4px 로 좌우 여백과 거의 같다.
 *  - 바탕은 칠하지 않는다 — 놓인 면(카드 · 패널)을 그대로 비춘다. 네이티브 fieldset 은 바탕을 테두리선 아래에서부터 칠하므로, 상자에만 면을
 *    깔면 legend 의 위 절반은 바깥 면에, 아래 절반은 상자 면에 걸쳐 두 색으로 갈린다. */

/** 묶음 상자 — 네이티브 `<fieldset>` 의 UA 모양을 걷고 면 하나로 세운다. 안의 항목은 12px 간격으로 세로로 쌓인다. */
export const fieldsetClassName = [
  /* UA 의 2px groove 테두리 · 좌우 2px 바깥 여백 · `min-inline-size: min-content` 를 걷는다 — 마지막 것이 남으면 그리드 · flex 안에서 상자가
     내용보다 좁아지지 못해 인스펙터 폭을 밀어낸다. */
  "m-0 min-w-0 rounded-lg border border-solid border-border",
  /* legend 는 flex 항목이 아니다 — 렌더된 legend 는 fieldset 이 따로 배치하고, flex 는 그 아래 내용 상자에만 걸린다(Chromium · Firefox · WebKit). */
  "flex flex-col gap-3 px-3 pt-1 pb-3",
  "font-sans text-body text-foreground",
  /* 비활성 — 안의 네이티브 컨트롤은 자기 `disabled:` 상태로 흐려진다. 글자 부품은 그 상태를 모르므로 여기서 함께 흐린다: 이 상자의 legend · 설명과
     안에 쌓인 FieldLabel · FieldDescription(묶음은 대개 Field 행으로 채운다). 투명도는 FieldLabel 의 비활성과 같은 45% 다. */
  "disabled:[&>legend]:opacity-45 disabled:[&>[data-slot=fieldset-description]]:opacity-45",
  "disabled:[&_[data-slot=field-label]]:opacity-45 disabled:[&_[data-slot=field-description]]:opacity-45",
].join(" ");

/**
 * 위 테두리선에 걸치는 제목 — 면 제목 역할(`text-body font-semibold`, #80). 좌우 4px 가 끊긴 자리를 글자보다 넓혀 선이 글자에 닿지 않는다.
 * 자리는 상자의 안쪽 여백 끝(12px)이라 왼쪽 모서리 호(`rounded-lg` 12px)가 끝나는 곳에서 선이 끊긴다.
 */
export const fieldsetLegendClassName = "px-1 text-body font-semibold text-foreground";

/** legend 아래 보조 문장 — 보조 문장 역할(`text-body`, 흐린 글자). UA 의 `<p>` 위아래 1em 여백을 걷는다(preflight 없음). */
export const fieldsetDescriptionClassName = "m-0 text-body text-muted-foreground";
