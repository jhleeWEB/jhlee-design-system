# React 디자인 시스템 컴포넌트 패턴

`packages/ui`의 구현·검토 기준이다. 메인 화면을 기준으로 제품 페이지의 디자인을 통일한
#1243에 이어, #1245에서 실제 합성·키보드·포커스 문제를 재현하고 개선했다.
시각 토큰과 제품 상태는 유지하며 컴포넌트가 약속한 동작을 정리한다.

## 공식 패턴과 현재 구현의 비교

| 기준 | 확인한 문제 | 적용한 개선 |
|---|---|---|
| [React의 명시적 합성](https://react.dev/reference/react/Children) | Card가 직접 자식의 타입으로 머리줄을 찾아 사용자 정의 헤더를 접힌 본문에 넣음 | `header` 슬롯을 우선 사용하고 기존 직접 `CardHeader` 자식만 호환 경로로 유지 |
| [Radix Slot](https://www.radix-ui.com/primitives/docs/utilities/slot) | 장식이 붙는 메뉴·선택 컨트롤의 `asChild`가 다중 자식 예외를 내거나 다른 요소에 동작을 붙임 | `Slottable`로 사용자 요소를 명시하고 장식·이벤트·ref를 합성 |
| [Radix 합성 계약](https://www.radix-ui.com/primitives/docs/guides/composition) | `Button asChild`의 disabled/loading 상태에서도 자식 링크·핸들러가 활성화됨 | 비활성 의미와 입력 차단을 함께 적용하고 활성 상태의 자식 동작은 보존 |
| [React 상태와 트리 위치](https://react.dev/learn/preserving-and-resetting-state) | Input의 suffix 유무에 따라 input이 다른 위치에 생겨 입력값·포커스가 초기화됨 | 같은 input DOM을 유지하고 접미사가 없으면 래퍼의 레이아웃 상자만 제거 |
| [WAI 라디오 그룹 패턴](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) | 선택값이 없거나 비활성 항목이면 SegmentedControl에 키보드 진입점이 없음 | 첫 활성 항목으로 진입하고 실제 포커스를 기준으로 이동·선택하며 외부 값 타입을 보존 |
| [React useId](https://react.dev/reference/react/useId) | 토글 설명이 컨트롤과 연결되지 않고 접힌 사이드바 항목 이름이 사라짐 | 설명 ID 연결과 접힌 항목의 접근성 이름 제공 |
| [WAI 표 패턴](https://www.w3.org/WAI/ARIA/apg/patterns/table/) | DataTable의 행 선택이 마우스 클릭에만 의존 | 첫 셀에 native radio를 형제로 배치하고 표·셀 내부 버튼의 의미를 유지 |
| [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) | DrawerContent의 modal 옵션은 스크림만 숨겼고 Content.forceMount는 Portal에서 무효화됨 | 모달성은 Root에만 두고 시각 옵션·포털 수명 계약을 분리 |

## 상태는 한 곳에서 소유한다

외부에서 선택값과 콜백을 받는 Card·SegmentedControl·DataTable은 같은 값을 내부 state에
복사하지 않는다. 페이지 또는 기능이 상태를 소유하고, DS는 입력 동작과 표현을 맡는다.
Accordion·Dialog처럼 Radix가 제어·비제어 모드를 모두 제공하는 경우 그 계약을 그대로 쓴다.
근거는 [React의 상태 공유 지침](https://react.dev/learn/sharing-state-between-components)이다.

SegmentedControl은 기존 native button과 라디오 그룹 의미를 유지한다. Radix RadioGroup으로
전환도 검증했지만 설치된 버전은 빠른 keydown/keyup에서 지연 포커스와 선택값이 어긋났다.
그 위에 보정 상태를 더하는 대신 단순한 포커스 이동을 유지하고, 선택값 부재·비활성 항목·
빠른 방향키 입력을 회귀 검사한다. 복잡한 오버레이 동작은 계속 Radix에 맡긴다.

```tsx
const [collapsed, setCollapsed] = useState(false);

<Card
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
  collapsedLabel="Plan"
  header={<PlanHeader />}
>
  <PlanCanvas />
</Card>

function PlanHeader() {
  return <CardHeader variant="panel" headingLevel={2} title="Plan" />;
}
```

Card는 `header` 안의 컴포넌트 구조를 검사하지 않는다. 헤더 접기에서는 슬롯을 남기고
children만 접으며, strip 접기에서는 둘을 함께 접는다. 기존 직접 자식 `CardHeader`도
동작하지만 새 코드는 슬롯을 쓴다. `null`은 의도적으로 헤더가 없다는 뜻이다.

접힌 본문은 마운트 상태를 유지한다. `inert`와 ARIA로 입력을 막고 포커스를 남아 있는
트리거로 옮긴다. 사용자 초안·스크롤·WebGL 수명을 초기화하는 조건부 렌더링을 넣지 않는다.
Input 역시 단위 변경만으로 DOM을 교체하지 않으며 외부 ref는 항상 실제 input을 가리킨다.

## 합성하는 요소의 책임을 명확히 한다

`asChild`는 태그를 자유롭게 바꾸는 장식 옵션이 아니다. 실제 DOM 요소가 이벤트·ARIA·ref를
받아야 한다. 자식이 사용자 컴포넌트라면 받은 props와 ref를 같은 의미의 DOM 요소로 전달한다.
버튼은 버튼, 이동은 링크로 유지하고 클릭 가능한 div로 바꾸지 않는다.

```tsx
function SettingsLink(props: React.ComponentPropsWithRef<"a">) {
  return <a {...props} />;
}

<Button asChild variant="ghost">
  <SettingsLink href="#/settings">Settings</SettingsLink>
</Button>
```

React 19에서는 ref를 prop으로 받을 수 있다. 단순 래퍼는 native/Radix의
`ComponentPropsWithRef`를 사용하고 전달한다. 내부 측정 ref도 필요하면 외부 ref가 이를
덮어쓰지 않도록 같은 DOM을 노출한다. 기존 `forwardRef` 컴포넌트는 정상 동작하므로
문법을 통일하려고 전부 다시 쓰지 않는다.
[React ref 지침](https://react.dev/reference/react/forwardRef)을 따른다.

일반 이벤트 합성은 소비자 핸들러를 먼저 호출하고 `event.defaultPrevented`를 존중한다.
반면 disabled/loading이나 `dismissible={false}`는 컴포넌트의 동작 제한이다.
소비자 핸들러를 추가했다는 이유로 그 제한이 해제되어서는 안 된다.

## 래퍼가 실제 지원하는 props만 공개한다

- ScrollArea는 뷰포트와 스크롤바 구조를 소유하므로 Root/Viewport `asChild`를 받지 않는다.
  `ref`는 root, `viewportRef`는 실제 스크롤 요소를 가리킨다.
- Modal·Drawer·Popover·DropdownMenu Content는 Portal 수명을 소유한다. 현재 지원하지 않는
  `forceMount`를 공개 타입에 싣지 않는다. 커스텀 수명이 필요하면 Portal·focus lock·scroll lock을
  함께 설계한 별도 계약을 추가한다.
- Drawer의 모달성은 `<Drawer modal={false}>`로만 정한다. `DrawerContent showOverlay={false}`는
  스크림 표시만 바꾸며 모달 포커스·외부 입력 정책을 바꾸지 않는다.
- ConfirmDialog는 선택적 description과 ID 연결을 함께 소유한다. 직접 Modal/Drawer를 합성할 때
  Header의 description이나 별도 Description이 전혀 없다면 Content에
  `aria-describedby={undefined}`를 명시한다. 사용자 정의 설명 ID는 그대로 전달할 수 있다.

## 곡률 — 연속 곡률(스쿼클) 모서리

«radius 는 역할이 정하고, 곡률은 시스템이 정한다.» 컴포넌트는 `rounded-sm|md|lg|xl|full` 만 고르고 곡선 모양은 손대지 않는다(계획 Part 3, #26).
구현은 CSS `corner-shape` 하나이고 **진행형 향상**이다 — 지원 엔진(Chromium 139+)은 `squircle`(= superellipse(2), 초타원 n=4) + 보정 반경
(`--corner-k` 1.5), 미지원 엔진(2026-09: Safari 27 정식 · Firefox 정식)은 속성을 무시해 `border-radius` 원호로 떨어진다.

- **원호 강등은 결함이 아니라 허용된 폴백이다.** clip-path·mask 폴백은 스펙상 영역 밖 테두리·outline·그림자를 지워 `shadow-*` 안의 헤어라인과
  `focus-ring`(WCAG 2.4.7)이 사라지고, `filter: drop-shadow` 는 `position: fixed` 컨테이닝 블록을 바꿔 Modal 이 깨지며, Houdini 는 폴백이 필요한
  바로 그 엔진에서 안 돈다. 그래서 런타임 폴백은 없다 — Apple 기기 사용자에게 원호로 보이는 것은 이 향상의 본질적 한계이고 데모 브라우저
  (Chrome/Edge ≥139)가 데모 가치를 정한다.
- **값은 토큰, 규칙은 corner.css.** `tokens/semantic/layer.json` 의 `corner.shape`(round → squircle) · `corner.k`(1 → 1.5)가 `generated/tokens.css` 의
  `:root` 기본값과 `@supports (corner-shape: squircle)` 재정의로 나간다. 반경 사다리 md/lg/xl 은 `calc(N px * var(--corner-k, 1))` 이라 지원 엔진에서만
  커진다(같은 반경이면 스쿼클이 작아 보인다 — 대각 깊이 원호 0.293R vs K=2 0.159R). `sm`(6px)은 곱하지 않는다 — 차이가 서브픽셀이고 9–11px 은 20px 배지를
  알약으로 만든다. `src/corner.css` 는 `@supports` 안의 `*, ::before, ::after { corner-shape: var(--corner-shape) }` 와 예외뿐이며 `@layer` 로 감싸지 않는다
  (tokens.css 의 레이어 없는 요소 규칙과 같은 층). `corner` 단축 속성은 쓰지 않는다 — 미지원 엔진이 통째로 무시해 radius 까지 사라진다.
- **원형·pill 은 원호.** 초타원이면 캡슐 끝이 눌린다. `.rounded-full` · `.ds-scroll-area-thumb` · 레거시 `.switch-track/.switch-knob` · `[data-corner="round"]`(서브트리
  예외)가 `corner-shape: round` 다. TSX 의 원형은 `rounded-full` 클래스로만 적는다 — 그래야 `.rounded-full` 예외가 전부를 덮는다(`corner.spec`).
- **동심원 = `calc(바깥 토큰 − 패딩)`.** 트랙 안의 pill·탭처럼 안쪽 반경이 필요하면 그것이 유일한 허용 임의값이다 — 계수를 따라가 양쪽 엔진에서 동심이
  유지된다(SegmentedControl `rounded-[calc(var(--radius-md)-var(--spacing)*0.5)]`, 레거시 탭 `calc(var(--radius-md) - 2px)`). 미지원 엔진에서는 옛 `rounded-sm` 과
  같은 6px 이라 «다른 엔진은 불변» 이다. DropdownMenu 항목(lg 면 − 8px 패딩)은 `rounded-md` 로 둔다 — 동심원 값(18 − 8 = 10)과 12 는 눈으로 구분되지 않고,
  동심원으로 적으면 미지원 엔진의 항목이 4px 로 바뀐다(카탈로그 `Foundations/Corners` 에 두 후보가 나란히 있다).
- **킬 스위치.** `html[data-corner="round"]` 가 지원 엔진을 미지원 엔진과 같은 그림(원호 · k=1)으로 되돌린다 — 데모 직전 전량 원호 복귀, 성능 A/B.
  카탈로그의 토글이 그것을 켠다.
- **검증.** 정적 불변식 `src/__tests__/corner.spec.ts`(전역 규칙의 자리 · `--corner-k` 기본 1 · 원형 예외 대조 · 사다리 형식 · `border-radius` 원시값 래칫 ·
  임의값 형태) + Playwright `vrt/corners.spec.ts`(Chromium CSSOM 스윕과 픽셀 프로파일 — 기대값은 페이지 안 `CSS.supports` 에서 파생) + 3엔진 darwin 골든
  (`vrt/__snapshots__/corners/`, `VRT_ENGINES=1` 로컬 절차). 소비 레포는 `@jhleeweb/squircle-design-system/testing` 의 `auditCorners` 로 같은 규칙을 래칫에 건다.
  Playwright WebKit 은 trunk 라 `corner-shape` 를 이미 지원한다 — Safari 정식판의 증거가 아니다.

## 검증 기준

새 패턴은 클래스명 검사보다 사용자 동작으로 검증한다. 최소한 바뀐 계약에 해당하는
키보드·포커스·ref 정리·이벤트 취소·비활성 동작·폼 값 보존을 확인한다.
공개 API의 제한은 타입 검사에도 포함한다.

```sh
pnpm --filter @buildos/ui test
pnpm --filter @buildos/ui typecheck
pnpm typecheck
pnpm build
```

Storybook(`pnpm storybook`, 포트 6006 — `Pages/Workbench`·`Pages/Gallery`)과 제품 앱에서 레이아웃도 확인한다.
카드 간격·제목·아이콘·모달 크기, 200ms 접기와 reduced-motion, 스크롤 종료 후
500ms 뒤 페이드하는 6px 오버레이 스크롤바는 기존 시각·동작 계약을 유지한다.
