"use client";
import { useRef, useState } from "react";

import { cn, type VariantProps } from "../cn";
import { IconX } from "../icons/icons";
import { useMergedRef } from "../lib/merge-ref";
import { Button } from "./Button";
import { fileInputChooseClassName, fileInputVariants } from "./FileInput.variants";

/* 파일 입력 — 고르기 버튼 · 고른 파일 이름과 크기 · 지우기, 같은 자리에 끌어다 놓기(#109).
 *
 * `<input type="file">` 은 브라우저 기본 위젯이 DS 입력 상자 안에 그려져 모양이 맞지 않는다. 소비 레포는 숨긴 input 을 Button 이 `ref.click()` 으로
 * 대신 누르게 했는데, 그러면 라벨 연결(`Field`) · 고른 파일 표시 · 드래그 상태를 화면마다 다시 짓는다.
 *
 * **진짜 컨트롤은 숨긴 `<input type="file">` 이다.** 화면에서만 숨기고(sr-only) 포커스 · 이름 · 키보드는 그대로 둔다 — 라벨을 누르거나 포커스에서
 * Enter · Space 를 누르면 브라우저가 파일 창을 연다(직접 짓지 않는다). 보이는 «Choose file» 은 그 input 의 그림이라 스크린리더에 숨기고 탭 순서에도
 * 넣지 않는다(같은 동작이 두 번 읽히지 않게). `FieldControl` 이 꽂는 id · aria-describedby · aria-invalid · disabled 는 전부 그 input 으로 간다.
 *
 * 값은 **비제어**다 — 파일 input 의 값은 보안상 스크립트가 정할 수 없다(지우기만 된다). 고른 파일은 `onFilesChange` 로 알린다.
 * 별도의 큰 끌어다 놓기 면(Dropzone)은 없다(사용자 결정 2026-10-05) — 이 상자가 놓는 자리다. */

/** 바이트 수를 사람이 읽는 크기로 — 화면 문자열이라 영어 고정(1,024 진, 소수 한 자리). */
function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"] as const;
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${unit === 0 ? String(value) : value.toFixed(1)} ${units[unit] ?? "B"}`;
}

/** `accept` 한 항목(`.png` · `image/*` · `image/png`)이 파일과 맞는가 — 놓은 파일은 브라우저가 걸러 주지 않는다. */
function matchesAccept(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .some((token) => {
      if (token.startsWith(".")) return name.endsWith(token);
      if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
      return type === token;
    });
}

/** `<FileInput>` 의 props — `<input type="file">` 속성(ref 포함, `type` · `size` · 값 계열 제외) + `size` · `invalid` · 고른 파일 알림. */
export interface FileInputProps
  extends
    Omit<React.ComponentPropsWithRef<"input">, "type" | "size" | "value" | "defaultValue" | "children">,
    Omit<VariantProps<typeof fileInputVariants>, "dragging"> {
  /**
   * 고른 파일이 바뀔 때 — 고르기 · 놓기 · 지우기 모두. 지우면 빈 배열이다. `multiple` 이 아니면 길이는 0 또는 1.
   * @default undefined
   */
  onFilesChange?: ((files: File[]) => void) | undefined;
  /**
   * 고르기 버튼의 글자.
   * @default "Choose file"
   */
  chooseLabel?: string;
  /**
   * 아직 고르지 않았을 때 이름 자리에 서는 글자.
   * @default "No file chosen"
   */
  placeholder?: string;
}

/**
 * 파일 입력 — 고르기 버튼 · 고른 파일 이름과 크기 · 지우기. 같은 상자에 파일을 끌어다 놓아도 된다. `Field` 안에서 라벨 · 설명 · 오류와 이어진다.
 * `ref` 와 나머지 속성은 숨긴 `<input type="file">` 으로, `className` 은 상자로 간다.
 * @slot file-input
 */
export function FileInput({
  ref,
  className,
  size,
  invalid,
  onFilesChange,
  chooseLabel = "Choose file",
  placeholder = "No file chosen",
  accept,
  multiple = false,
  disabled = false,
  onChange,
  "aria-invalid": ariaInvalid,
  ...rest
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRef(ref, inputRef);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const resolvedSize = size ?? "md";
  const failed = Boolean(invalid) || ariaInvalid === true || ariaInvalid === "true";

  const commit = (next: File[]) => {
    setFiles(next);
    onFilesChange?.(next);
  };

  const clear = () => {
    // 파일 input 의 값은 빈 문자열로만 정할 수 있다 — 같은 파일을 다시 골라도 change 가 나게 비운다.
    if (inputRef.current) inputRef.current.value = "";
    commit([]);
    inputRef.current?.focus();
  };

  const drop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const accepted = [...event.dataTransfer.files].filter((file) => matchesAccept(file, accept));
    const next = multiple ? accepted : accepted.slice(0, 1);
    if (next.length === 0) return;
    /* 놓은 파일을 input 에도 싣는다 — 폼 제출(FormData)이 고른 것과 같은 값을 보낸다. DataTransfer 생성자가 없는 환경(jsdom · 옛 Safari)에서는
       상태와 콜백만 바뀐다. */
    try {
      const transfer = new DataTransfer();
      for (const file of next) transfer.items.add(file);
      if (inputRef.current) inputRef.current.files = transfer.files;
    } catch {
      /* 화면과 onFilesChange 는 그대로 동작한다. */
    }
    commit(next);
  };

  const [first] = files;
  const total = files.reduce((sum, file) => sum + file.size, 0);
  return (
    <div
      /* 묶음(group)이고 비활성이면 aria-disabled 를 든다 — 안의 글자(고르기 칸 · 이름)는 input 의 그림이라 스스로는 «비활성» 을 말하지 못한다.
         묶음이 말해 주어야 보조 기술과 대비 검사(axe 는 비활성 컨트롤의 글자를 세지 않는다)가 흐린 글자를 비활성으로 읽는다. */
      role="group"
      aria-disabled={disabled || undefined}
      data-slot="file-input"
      data-size={resolvedSize satisfies "sm" | "md" | "lg"}
      data-dragging={dragging ? "" : undefined}
      data-invalid={failed ? "" : undefined}
      data-filled={files.length > 0 ? "" : undefined}
      className={cn(fileInputVariants({ size: resolvedSize, invalid: failed, dragging }), className)}
      onDragOver={(event) => {
        // preventDefault 가 없으면 브라우저가 놓기를 받지 않고 파일을 새 탭으로 연다.
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={drop}
    >
      <input
        {...rest}
        ref={mergedRef}
        data-slot="file-input-control"
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-invalid={failed || undefined}
        onChange={(event) => {
          onChange?.(event);
          commit([...(event.currentTarget.files ?? [])]);
        }}
      />
      {/* 보이는 고르기 버튼은 숨긴 input 의 그림이다 — 누르면 input 을 누른다. 스크린리더 · 탭 순서에는 input 하나만 있다. */}
      <span
        aria-hidden="true"
        data-slot="file-input-choose"
        className={fileInputChooseClassName}
        onClick={() => inputRef.current?.click()}
      >
        {chooseLabel}
      </span>
      <span data-slot="file-input-value" className="flex min-w-0 flex-1 items-baseline gap-2">
        {first ? (
          <>
            <span className="min-w-0 truncate">
              {files.length > 1 ? `${files.length} files` : first.name}
            </span>
            <span className="shrink-0 tnum text-label text-muted-foreground">{formatBytes(total)}</span>
          </>
        ) : (
          /* 입력의 placeholder 색(foreground-disabled)이 아니다 — 이 글자는 «아직 고르지 않았다» 는 상태를 말하는 진짜 글자라 4.5:1 을 지킨다. */
          <span className="min-w-0 truncate text-muted-foreground">{placeholder}</span>
        )}
      </span>
      {first ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          /* 24px — 작은 상자(30px) 안에도 테두리와 겹치지 않게 앉는다. */
          className="h-6 w-6 shrink-0 [&_svg]:size-4"
          aria-label={files.length > 1 ? "Remove files" : "Remove file"}
          disabled={disabled}
          onClick={clear}
        >
          <IconX />
        </Button>
      ) : null}
    </div>
  );
}
