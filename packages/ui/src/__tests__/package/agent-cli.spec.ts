/*
 * `sds-agent sync`(계획 §2.5-h, #31) — 소비 레포 AGENTS.md 관리 블록 upsert + 스킬 복사. 계약은 **멱등**과 **블록 밖 불변**이다:
 * 두 번 돌리면 아무것도 쓰지 않고, 사용자의 다른 절은 글자 하나 바뀌지 않는다. 임시 디렉터리에서 실제 파일로 확인한다.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { BEGIN, END, defaultPackageDir, parseArgs, sync, upsertBlock } from "../../agent/cli";

const dirs: string[] = [];
const tmp = (): string => {
  const dir = mkdtempSync(join(tmpdir(), "sds-agent-"));
  dirs.push(dir);
  return dir;
};
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("upsertBlock", () => {
  it("없으면 만들고, 있으면 블록만 바꾸고, 같으면 건드리지 않는다", () => {
    const created = upsertBlock(null, "A");
    expect(created).toEqual({ text: `${BEGIN}\nA\n${END}\n`, status: "created" });
    const appended = upsertBlock("# Mine\n\ntext\n", "A");
    expect(appended.status).toBe("updated");
    expect(appended.text).toBe(`# Mine\n\ntext\n\n${BEGIN}\nA\n${END}\n`);
    const replaced = upsertBlock(`# Mine\n\n${BEGIN}\nOLD\n${END}\n\n## After\n`, "A");
    expect(replaced.text).toBe(`# Mine\n\n${BEGIN}\nA\n${END}\n\n## After\n`);
    expect(upsertBlock(replaced.text, "A")).toEqual({ text: replaced.text, status: "unchanged" });
  });
});

describe("sync", { timeout: 30_000 }, () => {
  it("AGENTS.md 블록과 스킬을 만들고, 두 번째 실행은 unchanged 다(멱등)", () => {
    const cwd = tmp();
    writeFileSync(join(cwd, "AGENTS.md"), "# Consumer\n\n규칙 하나.\n");
    const first = sync({ cwd });
    expect(first.agents).toBe("updated");
    expect(first.skillFiles.map(f => f.status)).toEqual(["created"]);
    expect(first.skillFiles.map(f => f.path)).toEqual(["SKILL.md"]);
    const agents = readFileSync(join(cwd, "AGENTS.md"), "utf8");
    expect(agents.startsWith("# Consumer\n\n규칙 하나.\n\n<!-- sds:begin -->\n## 디자인 시스템 계약(에이전트) — @jhleeweb/squircle-design-system v")).toBe(true);
    expect(agents).not.toContain("{{name}}");
    expect(agents.trimEnd().endsWith(END)).toBe(true);
    const skill = readFileSync(join(cwd, ".claude/skills/squircle-ds/SKILL.md"), "utf8");
    expect(skill.startsWith("---\nname: squircle-ds\n")).toBe(true);
    expect(skill).toContain("jq '.components[] | select(.name == \"Select\")' node_modules/@jhleeweb/squircle-design-system/dist/components.manifest.json");

    const second = sync({ cwd });
    expect(second.agents).toBe("unchanged");
    expect(second.skillFiles.map(f => f.status)).toEqual(["unchanged"]);
    expect(readFileSync(join(cwd, "AGENTS.md"), "utf8")).toBe(agents);
  });

  it("AGENTS.md 가 없으면 블록만으로 만든다", () => {
    const cwd = tmp();
    expect(sync({ cwd }).agents).toBe("created");
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(true);
  });

  it("패키지 루트는 src/agent 와 dist/agent 에서 같은 곳이다", () => {
    expect(existsSync(join(defaultPackageDir(), "agent", "AGENTS.block.md"))).toBe(true);
  });
});

describe("parseArgs", () => {
  it("sync · --cwd · 모르는 인자", () => {
    expect(parseArgs(["sync"])).toEqual({ command: "sync", cwd: process.cwd() });
    expect(parseArgs(["sync", "--cwd", "/x"])).toEqual({ command: "sync", cwd: "/x" });
    expect(parseArgs([])).toEqual({ command: "help", cwd: process.cwd() });
    expect(parseArgs(["--cwd"])).toEqual({ error: "--cwd needs a directory" });
    expect(parseArgs(["frobnicate"])).toEqual({ error: "Unknown argument: frobnicate" });
  });
});
