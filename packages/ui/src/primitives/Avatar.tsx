"use client";
import { Children, createContext, useContext } from "react";
import { Avatar as Radix } from "radix-ui";

import { cn, type VariantProps } from "../cn";
import { avatarGroupVariants, avatarVariants } from "./Avatar.variants";

/* 아바타 — 사람(또는 팀)을 **이름과 함께** 가리킨다(#62).
 *
 * 이미지의 로딩 상태는 Radix Avatar 가 든다: 이미지가 실제로 그려질 때까지(그리고 실패하면 영영) 이니셜 폴백을 보인다 —
 * 깨진 이미지 아이콘이나 빈 원이 먼저 번쩍이지 않는다. 이름(`name`)이 필수인 것은 그것이 이미지의 alt 이자 폴백의 접근 가능한 이름이기 때문이다.
 * 부품(Image · Fallback)을 따로 내보내지 않는다 — 두 부품의 조합 규칙(alt · 이니셜 · 이름)은 하나뿐이라 소비자가 다시 짤 이유가 없다. */

type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>;

/* 묶음이 크기를 정하면 그 안의 아바타가 따른다 — 아바타마다 size 를 적게 두면 한 줄 안에서 지름이 갈린다(Tabs 의 variant 와 같은 이유). */
const AvatarSizeContext = createContext<AvatarSize | undefined>(undefined);

/** 이름에서 이니셜 — 첫 낱말과 마지막 낱말의 첫 글자(한 낱말이면 한 글자). 서로게이트 쌍을 자르지 않게 코드 포인트로 센다. */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = Array.from(words[0] ?? "")[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1] ?? "")[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

/** `Avatar` 의 props — Radix `Avatar.Root`(`<span>`) 속성(ref 포함) + `name` · `src` · `size`. */
export interface AvatarProps
  extends
    Omit<React.ComponentPropsWithRef<typeof Radix.Root>, "children">,
    VariantProps<typeof avatarVariants> {
  /** 누구인가 — 이미지의 `alt` 이자 폴백(이니셜)의 접근 가능한 이름이다. 이니셜도 여기서 만든다. */
  name: string;
  /**
   * 이미지 주소. 없거나 불러오지 못하면 이니셜을 보인다.
   * @default undefined
   */
  src?: string | undefined;
}

/**
 * 아바타 — 이미지가 그려지면 이미지, 아니면 이름의 이니셜. 지름은 `size`(묶음 안에서는 `AvatarGroup` 의 것)를 따른다.
 * @slot avatar
 */
export function Avatar({ name, src, size, className, ...rest }: AvatarProps) {
  const groupSize = useContext(AvatarSizeContext);
  const resolved: AvatarSize = size ?? groupSize ?? "md";
  return (
    <Radix.Root
      className={cn(avatarVariants({ size: resolved }), className)}
      {...rest}
      data-slot="avatar"
      data-size={resolved satisfies AvatarSize}
    >
      {src ? <Radix.Image src={src} alt={name} className="size-full object-cover" /> : null}
      <Radix.Fallback role="img" aria-label={name} className="leading-none">
        {initialsOf(name)}
      </Radix.Fallback>
    </Radix.Root>
  );
}

/** `AvatarGroup` 의 props — `<div>` 속성(ref 포함) + `max` · `size`. 묶음의 이름(`aria-label`)을 준다. */
export interface AvatarGroupProps
  extends React.ComponentPropsWithRef<"div">, VariantProps<typeof avatarGroupVariants> {
  /**
   * 보일 아바타의 최대 수 — 넘치는 만큼은 `+N` 하나로 접는다. 주지 않으면 전부 보인다.
   * @default undefined
   */
  max?: number | undefined;
}

/**
 * 아바타 묶음 — 이웃이 겹쳐 선다. `max` 를 넘으면 나머지를 `+N` 원 하나로 접고, 그 원은 «N more» 로 읽힌다.
 * 크기는 묶음이 정하고 안의 아바타가 따른다.
 * @slot avatar-group
 */
export function AvatarGroup({ max, size, className, children, ...rest }: AvatarGroupProps) {
  const resolved: AvatarSize = size ?? "md";
  const items = Children.toArray(children);
  const shown = max !== undefined && items.length > max ? items.slice(0, Math.max(0, max)) : items;
  const hidden = items.length - shown.length;
  return (
    <AvatarSizeContext.Provider value={resolved}>
      <div
        role="group"
        className={cn(avatarGroupVariants({ size: resolved }), className)}
        {...rest}
        data-slot="avatar-group"
        data-size={resolved satisfies AvatarSize}
      >
        {shown}
        {hidden > 0 ? (
          <span
            role="img"
            aria-label={`${hidden} more`}
            className={cn(avatarVariants({ size: resolved }), "bg-muted tnum text-muted-foreground")}
          >
            +{hidden}
          </span>
        ) : null}
      </div>
    </AvatarSizeContext.Provider>
  );
}
