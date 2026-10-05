import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { describeComponentContract } from "../__arch__/component-contract";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "./Field";
import { FileInput } from "./FileInput";
import * as stories from "./FileInput.stories";

/* 공통 계약(C3) — 스토리 `Default` 가 유일한 픽스처다. */
describeComponentContract(stories, { slot: "file-input", axes: ["size"] });

afterEach(cleanup);

const png = (name = "plan.png", bytes = 2048) =>
  new File([new Uint8Array(bytes)], name, { type: "image/png" });
const pdf = (name = "survey.pdf") => new File(["%PDF"], name, { type: "application/pdf" });
const box = () => document.querySelector<HTMLElement>('[data-slot="file-input"]')!;
const control = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;

describe("FileInput(#109)", () => {
  it("진짜 컨트롤은 숨긴 input 하나다 — 보이는 고르기 칸은 스크린리더 · 탭 순서에 없다", () => {
    render(<FileInput aria-label="Plan image" />);
    expect(control()).toHaveAccessibleName("Plan image");
    expect(control()).toHaveClass("sr-only");
    const choose = screen.getByText("Choose file");
    expect(choose).toHaveAttribute("aria-hidden", "true");
    expect(choose).not.toHaveAttribute("tabindex");
    expect(screen.queryAllByRole("button")).toEqual([]);
    expect(screen.getByText("No file chosen")).toBeInTheDocument();
  });

  it("보이는 고르기 칸을 누르면 input 을 누른다", async () => {
    const user = userEvent.setup();
    render(<FileInput aria-label="Plan image" />);
    const click = vi.spyOn(control(), "click");
    await user.click(screen.getByText("Choose file"));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("고르면 이름 · 크기를 보이고 onFilesChange · onChange 를 부른다", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    const onChange = vi.fn();
    render(<FileInput aria-label="Plan image" onFilesChange={onFilesChange} onChange={onChange} />);
    const file = png("tower-a.png", 1572864);
    await user.upload(control(), file);
    expect(onFilesChange).toHaveBeenLastCalledWith([file]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByText("tower-a.png")).toBeInTheDocument();
    expect(screen.getByText("1.5 MB")).toHaveClass("tnum");
    expect(box()).toHaveAttribute("data-filled");
  });

  it("지우기는 값을 비우고 빈 배열을 알리고 포커스를 input 으로 돌린다", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    render(<FileInput aria-label="Plan image" onFilesChange={onFilesChange} />);
    await user.upload(control(), png());
    await user.click(screen.getByRole("button", { name: "Remove file" }));
    expect(onFilesChange).toHaveBeenLastCalledWith([]);
    expect(control().value).toBe("");
    expect(screen.getByText("No file chosen")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    expect(control()).toHaveFocus();
  });

  it("multiple 이면 여러 개를 «n files» 와 합계 크기로 보인다", async () => {
    const user = userEvent.setup();
    render(<FileInput aria-label="Drawings" multiple />);
    await user.upload(control(), [png("a.png", 1024), png("b.png", 1024)]);
    expect(screen.getByText("2 files")).toBeInTheDocument();
    expect(screen.getByText("2.0 KB")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove files" })).toBeInTheDocument();
  });

  it("끌어 올리면 data-dragging 이 켜지고, 놓으면 accept 에 맞는 파일만 고른다 — multiple 이 아니면 첫 파일 하나", () => {
    const onFilesChange = vi.fn();
    render(<FileInput aria-label="Plan image" accept="image/*,.dwg" onFilesChange={onFilesChange} />);
    fireEvent.dragOver(box());
    expect(box()).toHaveAttribute("data-dragging");
    expect(box()).toHaveClass("border-primary");
    fireEvent.dragLeave(box());
    expect(box()).not.toHaveAttribute("data-dragging");

    const first = png("first.png");
    fireEvent.drop(box(), { dataTransfer: { files: [pdf(), first, png("second.png")] } });
    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(onFilesChange).toHaveBeenLastCalledWith([first]);
    expect(screen.getByText("first.png")).toBeInTheDocument();
    expect(box()).not.toHaveAttribute("data-dragging");
  });

  it("accept 에 맞는 파일이 없으면 놓아도 아무 일도 없다", () => {
    const onFilesChange = vi.fn();
    render(<FileInput aria-label="Plan image" accept=".png" onFilesChange={onFilesChange} />);
    fireEvent.drop(box(), { dataTransfer: { files: [pdf()] } });
    expect(onFilesChange).not.toHaveBeenCalled();
    expect(screen.getByText("No file chosen")).toBeInTheDocument();
  });

  it("disabled 면 끌어 올려도 · 놓아도 반응하지 않는다", () => {
    const onFilesChange = vi.fn();
    render(<FileInput aria-label="Plan image" disabled onFilesChange={onFilesChange} />);
    expect(control()).toBeDisabled();
    expect(box()).toHaveAttribute("aria-disabled", "true");
    fireEvent.dragOver(box());
    expect(box()).not.toHaveAttribute("data-dragging");
    fireEvent.drop(box(), { dataTransfer: { files: [png()] } });
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it("Field 안에서 라벨 · 설명 · 오류가 input 에 이어진다", () => {
    render(
      <Field>
        <FieldLabel>Plan image</FieldLabel>
        <FieldControl>
          <FileInput />
        </FieldControl>
        <FieldDescription>PNG or JPG.</FieldDescription>
        <FieldError>Choose a file.</FieldError>
      </Field>,
    );
    const input = screen.getByLabelText("Plan image");
    expect(input).toBe(control());
    expect(input).toHaveAccessibleDescription("PNG or JPG. Choose a file.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    // FieldControl 은 invalid 를 aria-invalid 로 꽂는다 — 상자도 같은 파괴색 테두리를 켠다.
    expect(box()).toHaveAttribute("data-invalid");
    expect(box()).toHaveClass("border-destructive");
  });
});
