"use client";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Dialog } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { IconSearch } from "../icons/icons";
import { useMergedRef } from "../lib/merge-ref";
import { Kbd } from "../primitives/Misc";
import { modalVariants } from "./Modal.variants";
import { commandVariants } from "./Command.variants";
import { dropdownMenuItemVariants } from "./DropdownMenu.variants";

/* 명령 — 검색 입력 하나와 거른 목록으로 **하나를 실행하거나 고른다**(명령 팔레트 · Combobox 의 목록).
 *
 * `cmdk` 를 들이지 않고 직접 쓴다(#61). 필요한 것이 «부분 일치로 거르기 · 묶음 · 빈 상태 · 화살표/Enter · aria-activedescendant» 뿐이고,
 * cmdk 는 점수 정렬·자체 스토어·`[cmdk-*]` 속성 어휘를 함께 가져와 DS 의 data-slot · cva · Radix 합성 계약과 겹친다.
 *
 * 모양(WAI-ARIA combobox + listbox): 포커스는 **입력에 머문다.** 입력이 `role="combobox"` 이고 `aria-controls` 로 목록(`role="listbox"`)을,
 * `aria-activedescendant` 로 강조 항목(`role="option"`, `aria-selected`)을 가리킨다 — 스크린리더는 포커스 이동 없이 강조 항목을 읽는다.
 * 키: ↓/↑ 강조 이동(비활성 건너뜀, `loop` 이면 끝에서 돈다) · Enter 실행 · 한글 IME 조합 중의 Enter 는 조합 확정이라 실행하지 않는다.
 * Escape 는 감싼 상자(CommandDialog · Combobox 의 Radix)가 닫는다.
 *
 * 등록: 보이는 항목만 레이아웃 이펙트에서 루트에 자기 노드를 알린다(Field 의 설명·오류 등록과 같은 모양). 루트는 그 목록을 DOM 순서로 들고,
 * 강조는 «사용자가 고른 항목이 아직 보이면 그것, 아니면 첫 활성 항목» 으로 **렌더 중에 파생**한다 — 이펙트에서 상태를 맞추지 않는다.
 *
 * 부품마다 `data-slot` 을 `{...rest}` **뒤**에 둔다(slot-locked, D3 #44). */

interface ItemRecord {
  readonly id: string;
  readonly value: string;
  readonly disabled: boolean;
  readonly group: string | null;
  readonly node: HTMLElement;
}

interface CommandContextValue {
  readonly label: string;
  readonly listId: string;
  readonly search: string;
  readonly setSearch: (search: string) => void;
  readonly matches: (value: string, keywords: readonly string[]) => boolean;
  /** 보이는 항목 — DOM 순서. */
  readonly items: readonly ItemRecord[];
  readonly activeId: string | null;
  readonly setActive: (id: string) => void;
  readonly register: (record: ItemRecord) => () => void;
  /** 서버 렌더·첫 하이드레이션에서는 아직 등록이 없다 — 그때 «빈 목록» 으로 그리지 않게 한다. */
  readonly hydrated: boolean;
  /** 입력의 키 — ↓/↑ 강조 이동 · Enter 실행. 처리했으면 preventDefault 한다. */
  readonly navigate: (event: React.KeyboardEvent<HTMLElement>) => void;
}

const CommandContext = createContext<CommandContextValue | null>(null);
const GroupContext = createContext<string | null>(null);
/* CommandDialog · ComboboxContent 가 «이미 면이 있다» 고 알린다 — 안의 Command 의 기본 surface 가 plain 이 된다. */
const SurfaceContext = createContext<"card" | "plain">("card");

/** 감싼 상자가 이미 면일 때 안의 `Command` 의 기본 `surface` 를 `plain` 으로 — 내부용(Combobox), 배럴에는 없다. */
export function PlainCommandSurface({ children }: { children: React.ReactNode }) {
  return <SurfaceContext.Provider value="plain">{children}</SurfaceContext.Provider>;
}

function useCommand(part: string): CommandContextValue {
  const context = useContext(CommandContext);
  if (!context) throw new Error(`${part} 은 <Command> 안에서만 쓴다`);
  return context;
}

const NO_KEYWORDS: readonly string[] = [];
const subscribeNothing = () => () => {};

/** 기본 거르기 — 대소문자를 무시한 부분 일치. 값과 키워드 중 하나라도 맞으면 보인다. */
function defaultFilter(value: string, search: string, keywords: readonly string[]): boolean {
  const needle = search.trim().toLocaleLowerCase();
  if (needle === "") return true;
  return [value, ...keywords].some((text) => text.toLocaleLowerCase().includes(needle));
}

/** DOM 순서로 넣는다 — 걸러졌다 다시 보이는 항목은 등록이 뒤에 오지만 목록의 자리는 그대로여야 한다. */
function insertInDomOrder(items: readonly ItemRecord[], record: ItemRecord): ItemRecord[] {
  const next = items.filter((item) => item.id !== record.id);
  const at = next.findIndex(
    (item) => record.node.compareDocumentPosition(item.node) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
  next.splice(at === -1 ? next.length : at, 0, record);
  return next;
}

/** `Command` 의 props — `<div>` 속성(ref 포함) + 검색 · 거르기 · 강조 · `surface`. */
export interface CommandProps
  extends Omit<React.ComponentPropsWithRef<"div">, "defaultValue">, VariantProps<typeof commandVariants> {
  /**
   * 입력과 목록의 접근성 이름 — 화면에는 보이지 않는다. 화면 문자열이라 영어로 적는다.
   * @default "Commands"
   */
  label?: string;
  /**
   * 제어 모드의 검색어 — `onSearchChange` 와 함께 쓴다. 생략하면 입력이 스스로 든다(비제어).
   * @default undefined
   */
  search?: string;
  /**
   * 비제어 모드의 첫 검색어.
   * @default ""
   */
  defaultSearch?: string;
  /**
   * 검색어가 바뀔 때.
   * @default undefined
   */
  onSearchChange?: (search: string) => void;
  /**
   * 검색어로 항목을 거를지 — 끄면 항목을 전부 보이고 거르기는 호출처가 한다(서버 검색 결과처럼).
   * @default true
   */
  shouldFilter?: boolean;
  /**
   * 항목 하나가 보이는가 — 값 · 검색어 · 키워드를 받는다.
   * @default 대소문자를 무시한 부분 일치
   */
  filter?: (value: string, search: string, keywords: readonly string[]) => boolean;
  /**
   * ↓/↑ 가 목록 끝에서 반대편 끝으로 돈다.
   * @default false
   */
  loop?: boolean;
  /**
   * 처음 강조할 항목의 `value` — Combobox 가 고른 값을 열 때 그 항목에서 시작하게 한다. 사용자가 움직이거나 검색하면 놓는다.
   * @default undefined
   */
  defaultValue?: string;
  /**
   * 바깥 면.
   * - `card` — 카드 바탕 · 테두리 · `rounded-lg`. 페이지 안에 놓인 명령 목록
   * - `plain` — 바탕 · 테두리 없음. 이미 면이 있는 상자(대화상자 · 팝오버) 안
   * @default "card"(CommandDialog · ComboboxContent 안에서는 "plain")
   */
  surface?: VariantProps<typeof commandVariants>["surface"];
}

/**
 * 명령의 루트 — 검색어와 강조 항목을 든다. `CommandInput`(키보드 ↓/↑ · Enter 를 받는다) · `CommandList` 를 담는다.
 * @slot command
 */
export function Command({
  className,
  label = "Commands",
  search: searchProp,
  defaultSearch = "",
  onSearchChange,
  shouldFilter = true,
  filter = defaultFilter,
  loop = false,
  defaultValue,
  surface,
  ...rest
}: CommandProps) {
  const inheritedSurface = useContext(SurfaceContext);
  const resolvedSurface = surface ?? inheritedSurface;
  const listId = `${useId()}-list`;
  const [uncontrolledSearch, setUncontrolledSearch] = useState(defaultSearch);
  const search = searchProp ?? uncontrolledSearch;
  const [items, setItems] = useState<readonly ItemRecord[]>([]);
  // 사용자가 고른 강조 — 비어 있거나 걸러져 사라졌으면 첫 활성 항목이 강조된다(아래 파생).
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  const setSearch = useCallback(
    (next: string) => {
      if (searchProp === undefined) setUncontrolledSearch(next);
      setChosenId(null);
      setTouched(true);
      onSearchChange?.(next);
    },
    [searchProp, onSearchChange],
  );
  const setActive = useCallback((id: string) => {
    setChosenId(id);
    setTouched(true);
  }, []);
  const register = useCallback((record: ItemRecord) => {
    setItems((prev) => insertInDomOrder(prev, record));
    return () => setItems((prev) => prev.filter((item) => item.id !== record.id));
  }, []);
  const matches = useCallback(
    (value: string, keywords: readonly string[]) => !shouldFilter || filter(value, search, keywords),
    [shouldFilter, filter, search],
  );

  const enabled = useMemo(() => items.filter((item) => !item.disabled), [items]);
  const active =
    enabled.find((item) => item.id === chosenId) ??
    (touched ? undefined : enabled.find((item) => item.value === defaultValue)) ??
    enabled[0] ??
    null;
  const activeId = active?.id ?? null;

  // 강조가 키보드로 움직이면 목록 안에서 보이게 한다 — 첫 렌더(아무도 움직이지 않음)에는 페이지를 스크롤하지 않는다.
  useLayoutEffect(() => {
    if (touched) active?.node.scrollIntoView?.({ block: "nearest" });
  }, [active, touched]);

  /* 키는 입력이 받는다(CommandInput 의 onKeyDown — 소비자 핸들러가 먼저 돌고 preventDefault 를 존중한다). 루트 div 에 걸면
   * 비대화형 요소의 키 핸들러가 되어(jsx-a11y) 포커스 없는 상자가 키를 먹는 모양이 된다. */
  const navigate = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.nativeEvent.isComposing) return;
      const move = (delta: 1 | -1) => {
        if (enabled.length === 0) return;
        const from = active ? enabled.indexOf(active) : -1;
        const to = loop
          ? (from + delta + enabled.length) % enabled.length
          : Math.min(Math.max(from + delta, 0), enabled.length - 1);
        setActive(enabled[to]!.id);
      };
      if (event.key === "ArrowDown") {
        event.preventDefault();
        move(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "Enter" && active) {
        event.preventDefault();
        // 항목의 클릭 경로 하나로 실행한다 — 포인터와 키보드가 같은 onSelect 를 부른다.
        active.node.click();
      }
    },
    [enabled, active, loop, setActive],
  );

  const context = useMemo<CommandContextValue>(
    () => ({
      label,
      listId,
      search,
      setSearch,
      matches,
      items,
      activeId,
      setActive,
      register,
      hydrated,
      navigate,
    }),
    [label, listId, search, setSearch, matches, items, activeId, setActive, register, hydrated, navigate],
  );

  return (
    <CommandContext.Provider value={context}>
      <div
        className={cn(commandVariants({ surface: resolvedSurface }), className)}
        {...rest}
        data-slot="command"
        data-surface={resolvedSurface satisfies "card" | "plain"}
      />
    </CommandContext.Provider>
  );
}

/** `CommandInput` 의 props — `<input>` 속성(ref 포함, 값은 `Command` 의 `search` 가 든다). */
export type CommandInputProps = Omit<React.ComponentPropsWithRef<"input">, "value" | "defaultValue" | "type">;

/**
 * 검색 입력 — 돋보기 아이콘과 함께 상자 머리에 선다. 포커스가 여기 머물고 목록의 강조는 `aria-activedescendant` 로 가리킨다.
 * @slot command-input
 */
export function CommandInput({ className, onChange, onKeyDown, ...rest }: CommandInputProps) {
  const command = useCommand("CommandInput");
  return (
    <div className="flex items-center gap-2 border-b border-border px-3" data-slot="command-input-wrapper">
      <IconSearch className="size-4 shrink-0 text-muted-foreground" />
      <input
        aria-label={command.label}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn(
          "h-ctl-lg w-full min-w-0 border-0 bg-transparent text-control text-foreground",
          "placeholder:text-muted-foreground focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-45",
          className,
        )}
        {...rest}
        type="text"
        role="combobox"
        aria-expanded={true}
        aria-controls={command.listId}
        aria-autocomplete="list"
        aria-activedescendant={command.activeId ?? undefined}
        value={command.search}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented) command.setSearch(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) command.navigate(event);
        }}
        data-slot="command-input"
      />
    </div>
  );
}

/**
 * 거른 항목의 목록(`role="listbox"`) — 길면 `--size-command-list`(300px) 안에서 스크롤한다. 항목 · 묶음 · 빈 상태 · 구분선을 담는다.
 * 보이는 항목이 하나도 없으면 listbox 역할을 내려놓는다 — 옵션 없는 listbox 는 ARIA 위반(aria-required-children)이고, 그때 안에는 빈 상태 문장뿐이다.
 * @slot command-list
 */
export function CommandList({ className, ...rest }: React.ComponentPropsWithRef<"div">) {
  const command = useCommand("CommandList");
  const empty = command.hydrated && command.items.length === 0;
  return (
    <div
      aria-label={empty ? undefined : command.label}
      className={cn(
        "max-h-(--size-command-list) scroll-py-2 overflow-x-hidden overflow-y-auto p-2",
        className,
      )}
      {...rest}
      id={command.listId}
      role={empty ? undefined : "listbox"}
      data-slot="command-list"
    />
  );
}

/**
 * 보이는 항목이 없을 때만 그려지는 문장 — "No results found." 처럼. 가운데 정렬의 흐린 글자.
 * @slot command-empty
 */
export function CommandEmpty({ className, ...rest }: React.ComponentPropsWithRef<"div">) {
  const command = useCommand("CommandEmpty");
  if (!command.hydrated || command.items.length > 0) return null;
  return (
    <div
      className={cn("px-3 py-6 text-center text-body text-muted-foreground", className)}
      {...rest}
      role="presentation"
      data-slot="command-empty"
    />
  );
}

/** `CommandGroup` 의 props — `<div>` 속성(ref 포함) + 머리글. */
export interface CommandGroupProps extends React.ComponentPropsWithRef<"div"> {
  /**
   * 묶음의 머리글 — mono 대문자 미세라벨(DropdownMenuLabel 과 같은 모양). 묶음의 접근성 이름이 된다.
   * @default undefined
   */
  heading?: React.ReactNode;
}

/**
 * 항목 묶음(`role="group"`) — 안의 항목이 전부 걸러지면 머리글과 함께 숨는다.
 * @slot command-group
 */
export function CommandGroup({ className, heading, children, ...rest }: CommandGroupProps) {
  const command = useCommand("CommandGroup");
  const id = useId();
  const headingId = `${id}-heading`;
  const empty = command.hydrated && !command.items.some((item) => item.group === id);
  return (
    <div
      aria-labelledby={heading ? headingId : undefined}
      className={cn("not-first:mt-1", className)}
      {...rest}
      role="group"
      hidden={empty || undefined}
      data-slot="command-group"
    >
      {heading ? (
        <div
          id={headingId}
          className="px-3 py-2 font-mono text-micro tracking-caps text-muted-foreground uppercase select-none"
        >
          {heading}
        </div>
      ) : null}
      <GroupContext.Provider value={id}>{children}</GroupContext.Provider>
    </div>
  );
}

/**
 * 묶음 사이 구분선 — 목록의 안쪽 여백까지 가로지른다. 검색 중에는 숨는다(거른 결과 사이의 선은 묶음을 가르지 못한다).
 * @slot command-separator
 */
export function CommandSeparator({ className, ...rest }: React.ComponentPropsWithRef<"div">) {
  const command = useCommand("CommandSeparator");
  return (
    <div
      className={cn("-mx-2 my-2 h-px bg-border", className)}
      {...rest}
      role="none"
      hidden={command.search !== "" || undefined}
      data-slot="command-separator"
    />
  );
}

/** `CommandItem` 의 props — `<div>` 속성(ref 포함) + 값 · 선택 · 톤 · 단축키. */
export interface CommandItemProps extends Omit<React.ComponentPropsWithRef<"div">, "onSelect"> {
  /**
   * 거르기와 `onSelect` 에 쓰는 값.
   * @default children 이 문자열이면 그 글자
   */
  value?: string;
  /**
   * 값 밖에서도 맞힐 낱말 — "Export as PDF" 를 "print" 로도 찾게.
   * @default []
   */
  keywords?: readonly string[];
  /**
   * 고를 수 없게 — 보이지만 강조·실행을 건너뛴다.
   * @default false
   */
  disabled?: boolean;
  /**
   * 누르거나 Enter 로 실행할 때 — 항목의 `value` 를 받는다.
   * @default undefined
   */
  onSelect?: (value: string) => void;
  /**
   * 톤.
   * - `neutral` — 일반 동작(기본)
   * - `destructive` — 되돌릴 수 없는 동작(삭제). 글자와 강조 면이 붉다
   * @default "neutral"
   */
  tone?: "neutral" | "destructive";
  /**
   * 오른쪽에 붙는 단축키 표기(`Kbd` 칩) — "⌘K". 표기일 뿐 키를 묶지 않는다.
   * @default undefined
   */
  shortcut?: string;
}

/**
 * 실행·선택 항목(`role="option"`) — 검색어에 맞지 않으면 그려지지 않는다. 강조되면 DropdownMenu 항목과 같은 옅은 면이 깔린다.
 * @slot command-item
 */
export function CommandItem(props: CommandItemProps) {
  return <SlottedCommandItem {...props} slot="command-item" />;
}

/** 항목을 `slot` 이름으로 그린다 — 내부용(ComboboxItem 이 자기 이름으로 그린다), 배럴에는 없다. Button 의 SlottedButton 과 같은 이유. */
export function SlottedCommandItem({
  className,
  value,
  keywords = NO_KEYWORDS,
  disabled = false,
  onSelect,
  tone,
  shortcut,
  children,
  onClick,
  onKeyDown,
  onPointerMove,
  onPointerDown,
  ref,
  slot,
  ...rest
}: CommandItemProps & { slot: string }) {
  const command = useCommand("CommandItem");
  const group = useContext(GroupContext);
  const id = useId();
  const text = value ?? (typeof children === "string" ? children : "");
  const visible = command.matches(text, keywords);
  const node = useRef<HTMLDivElement>(null);
  const composedRef = useMergedRef(ref, node);
  const { register } = command;
  useLayoutEffect(() => {
    if (!visible || !node.current) return undefined;
    return register({ id, value: text, disabled, group, node: node.current });
  }, [visible, id, text, disabled, group, register]);
  if (!visible) return null;
  const active = command.activeId === id;
  return (
    <div
      ref={composedRef}
      className={cn(dropdownMenuItemVariants({ tone }), className)}
      {...rest}
      id={id}
      role="option"
      aria-selected={active}
      aria-disabled={disabled || undefined}
      data-highlighted={active ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-value={text satisfies string}
      // 포커스는 입력에 머문다(aria-activedescendant) — 탭 순서에 넣지 않되, 스크립트가 항목에 포커스를 주면 Enter · Space 로도 실행한다.
      tabIndex={-1}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        if (!disabled) onSelect?.(text);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        // pointermove(진입이 아니라) — 키보드로 옮긴 강조를 스크롤로 지나가는 포인터가 빼앗지 않는다.
        if (!event.defaultPrevented && !disabled && !active) command.setActive(id);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        // 누르는 순간 입력이 포커스를 잃지 않게 — 강조·caret 이 입력에 남는다.
        if (!event.defaultPrevented) event.preventDefault();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !disabled) onSelect?.(text);
      }}
      data-slot={slot satisfies string}
      // cva 축은 해석된 값(기본값 포함)으로 찍는다 — 스토리 격자·소비자 선택자가 같은 이름을 읽는다.
      data-tone={tone ?? "neutral"}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {/* 칩(20px + 테두리)이 글줄보다 높아 단축키가 있는 줄만 2px 커졌다(VRT 실측) — 음수 여백으로 줄 높이에서 뺀다. */}
      {shortcut ? <Kbd className="-my-1">{shortcut}</Kbd> : null}
    </div>
  );
}

/** `CommandDialog` 의 props — Radix `Dialog.Root` 의 열림 · 모달성 + 상자(`Dialog.Content`) 속성(ref 포함, `forceMount` 제외). */
export interface CommandDialogProps extends Omit<
  React.ComponentPropsWithRef<typeof Dialog.Content>,
  "forceMount" | "title"
> {
  /**
   * 제어 모드의 열림.
   * @default undefined
   */
  open?: boolean;
  /**
   * 비제어 모드의 첫 열림.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * 열림이 바뀔 때 — Escape · 스크림 클릭 · 항목 실행 뒤 닫기에 쓴다.
   * @default undefined
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * 대화상자의 접근성 이름 — 화면에는 보이지 않는다(입력이 곧 머리다). 화면 문자열이라 영어로 적는다.
   * @default "Command palette"
   */
  title?: string;
  /**
   * 보이지 않는 한 줄 설명 — 대화상자의 `aria-describedby` 가 된다. 없으면 describedby 를 비운다.
   * @default undefined
   */
  description?: string;
}

/**
 * 명령 팔레트 — 스크림 위 화면 위쪽 1/5 자리에 뜨는 대화상자. 자식으로 `Command`(입력 · 목록)를 둔다 — 그 `Command` 의 기본 면은 `plain` 이다.
 * 포커스 트랩 · 스크롤 락 · Escape · 포커스 복귀는 Radix Dialog 가 맡는다(Modal 과 같다). 위치를 가운데가 아니라 위쪽에 두는 이유:
 * 검색할수록 목록이 줄어드는데 가운데 정렬이면 입력이 위아래로 튄다.
 * @slot command-dialog
 */
export function CommandDialog({
  open,
  defaultOpen,
  onOpenChange,
  title = "Command palette",
  description,
  className,
  children,
  ...rest
}: CommandDialogProps) {
  return (
    <Dialog.Root
      {...(open === undefined ? {} : { open })}
      {...(defaultOpen === undefined ? {} : { defaultOpen })}
      {...(onOpenChange === undefined ? {} : { onOpenChange })}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          data-slot="command-dialog-scrim"
          className="fixed inset-0 z-scrim animate-in-fade bg-scrim"
        />
        <Dialog.Content
          {...(description ? {} : { "aria-describedby": undefined })}
          className={cn(modalVariants({ size: "md" }), "top-1/5 translate-y-0", className)}
          {...rest}
          data-slot="command-dialog"
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          {description ? <Dialog.Description className="sr-only">{description}</Dialog.Description> : null}
          <SurfaceContext.Provider value="plain">{children}</SurfaceContext.Provider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
