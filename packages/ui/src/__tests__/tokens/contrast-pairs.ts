/*
 * 대비 쌍(계획 §2.4 D-2, C2). 크롬 색 토큰 중 «글자 / 그 밑의 면» 으로 실제 만나는 조합만 적는다 — 조합을 전부 곱하면
 * 만나지 않는 쌍(예: warning-soft 위의 destructive)이 실패를 부풀리고, 정말 읽히지 않는 쌍이 묻힌다.
 * 이름은 `--chrome-` 접두를 뺀 shadcn 어휘(B5, #22)다. 문턱은 WCAG 2.x — 본문 글자 4.5:1(AA), 글자가 아닌 UI 경계·포커스 링 3:1(1.4.11).
 */

/** 판정 3색 + info — `{tone}` · `{tone}-foreground` · `{tone}-soft` 가 톤마다 있다(chrome.light.json). */
export const TONES = ["success", "warning", "destructive", "info"] as const;

export interface ContrastPair {
  /** 글자(또는 선) 쪽 토큰. */
  readonly fg: string;
  /** 면 쪽 토큰 — 알파가 있으면 `background` 위에 합성한다. */
  readonly bg: string;
  /** WCAG 2.x 최소 비율. */
  readonly min: 4.5 | 3;
  /** 왜 이 쌍이 실제로 만나는가 — 표와 실패 메시지에 실린다. */
  readonly where: string;
}

const text = (fg: string, bg: string, where: string): ContrastPair => ({ fg, bg, min: 4.5, where });
const ui = (fg: string, bg: string, where: string): ContrastPair => ({ fg, bg, min: 3, where });

export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  // 본문 글자 3단 × 면 3단 — 페이지·카드·옅은 면 어디에나 세 글자색이 놓인다.
  ...(["foreground", "foreground-2", "muted-foreground"] as const).flatMap((fg) =>
    (["background", "card", "muted"] as const).map((bg) => text(fg, bg, `body text on ${bg}`)),
  ),
  // 보조 글자가 놓이는 더 어두운 면 둘 — 눌린 상태(secondary)와 SegmentedControl 트랙(primary-track)의 비선택 항목(#55).
  text("muted-foreground", "secondary", "muted text on pressed / rail surface"),
  text("muted-foreground", "primary-track", "unselected SegmentedControl item on its track"),
  text("primary-foreground", "primary", "solid primary button label"),
  // 판정색 — 채운 버튼·배지의 글자, 옅은 면 위의 판정색 글자(Alert·Badge soft), 카드 위의 판정색 글자(StatusDot 옆 라벨).
  ...TONES.flatMap((tone) => [
    text(`${tone}-foreground`, tone, `solid ${tone} label`),
    text(tone, `${tone}-soft`, `${tone} text on its soft surface (Alert · Badge)`),
    text(tone, "card", `${tone} text on card`),
  ]),
  text("tooltip-foreground", "tooltip", "tooltip label"),
  // 글자가 아닌 UI — primary 면(선택 상태 표시)·포커스 링·강한 경계는 3:1(1.4.11).
  ui("primary", "card", "primary surface / indicator on card"),
  ui("ring", "card", "focus ring on card"),
  ui("border-strong", "card", "strong border on card"),
];
