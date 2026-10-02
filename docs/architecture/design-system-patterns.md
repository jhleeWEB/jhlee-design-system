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

## 모서리 — 일반 border-radius(스쿼클 폐기 결정 기록)

컴포넌트는 `rounded-xs|sm|md|lg|xl|full`(4/6/8/12/16/9999px 고정 원호)만 고르고, **역할이 단을 정한다**(#80 — 작은 표시 `xs` · 칩 `sm` ·
컨트롤과 메뉴 항목 `md` · 면 `lg` · 화면을 가리는 것 `xl`, 표는 `packages/ui/tokens/README.md` «역할 → 토큰»). 원형·pill 은 `rounded-full` 로만 적고,
트랙 안의 pill·탭처럼 안쪽 반경이 필요하면 동심원 `calc(바깥 토큰 − 패딩)` 이 유일한 허용 임의값이다(Tabs · ToggleGroup · SegmentedControl 칸
`rounded-[calc(var(--radius-md)-var(--spacing))]` — 트랙 `rounded-md` − 여백 `p-1` = 4px).

**결정 기록(2026-09-30, #36).** #26·#27 이 CSS `corner-shape: squircle`(K=2) 진행형 향상 + 보정 반경(`--corner-k` 1.5)으로 모든 크롬 모서리를
스쿼클로 만들었으나, Chromium 에서 초타원의 안쪽 윤곽(바깥 곡선 − 테두리 폭)이 같은 지수의 초타원이 아니라 모서리 중앙에서 두 윤곽 간격이
벌어져 **1px 테두리가 모서리에서 두꺼워 보였다**. CSS 만으로 안쪽 윤곽을 따로 그릴 길이 없어(clip-path·mask 는 테두리·outline·그림자를 지운다)
사용자 결정으로 폐기하고 원호로 돌아갔다. `src/corner.css` 는 서브패스 호환용 빈 파일, `--corner-shape`·`--corner-k` 는 `round`·`1` 고정 호환 alias 다.
`src/__tests__/corner.spec.ts` 가 «배포 CSS·제품 소스에 `corner-shape` 없음 · 사다리 px 고정 · 원시 반경 래칫 · 임의값은 동심원만» 을 지키고,
소비 레포는 `@jhleeweb/squircle-design-system/testing` 의 `auditCorners` 로 같은 규칙을 래칫에 건다.

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

Storybook(`pnpm storybook`, 포트 6006 — `Pages/Workbench` 와 컴포넌트 스토리)과 제품 앱에서 레이아웃도 확인한다.
카드 간격·제목·아이콘·모달 크기, 200ms 접기와 reduced-motion, 스크롤 종료 후
500ms 뒤 페이드하는 6px 오버레이 스크롤바는 기존 시각·동작 계약을 유지한다.
