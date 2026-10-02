/*
 * `jds-agent sync`(계획 §2.5-h, #31) — 소비 레포 AGENTS.md 관리 블록 upsert + 스킬 복사. 계약은 **멱등**과 **블록 밖 불변**이다:
 * 두 번 돌리면 아무것도 쓰지 않고, 사용자의 다른 절은 글자 하나 바뀌지 않는다. 임시 디렉터리에서 실제 파일로 확인한다.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  BEGIN,
  END,
  LEGACY_MARKERS,
  LEGACY_SKILL,
  defaultPackageDir,
  parseArgs,
  repoSlug,
  sync,
  upsertBlock,
} from "../../agent/cli";

const dirs: string[] = [];
const tmp = (): string => {
  const dir = mkdtempSync(join(tmpdir(), "jds-agent-"));
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

  it("3.x 의 표식(sds) 블록은 같은 자리에서 새 표식 블록이 된다 — 계약이 두 벌 서지 않는다(#91)", () => {
    const [open, close] = LEGACY_MARKERS;
    const migrated = upsertBlock(`# Mine\n\n${open}\nOLD\n${close}\n\n## After\n`, "A");
    expect(migrated).toEqual({ text: `# Mine\n\n${BEGIN}\nA\n${END}\n\n## After\n`, status: "updated" });
  });
});

describe("sync", { timeout: 30_000 }, () => {
  it("AGENTS.md 블록과 스킬을 만들고, 두 번째 실행은 unchanged 다(멱등)", () => {
    const cwd = tmp();
    writeFileSync(join(cwd, "AGENTS.md"), "# Consumer\n\n규칙 하나.\n");
    const first = sync({ cwd });
    expect(first.agents).toBe("updated");
    expect(first.skillFiles.map((f) => f.status)).toEqual(["created"]);
    expect(first.skillFiles.map((f) => f.path)).toEqual(["SKILL.md"]);
    const agents = readFileSync(join(cwd, "AGENTS.md"), "utf8");
    expect(
      agents.startsWith(
        "# Consumer\n\n규칙 하나.\n\n<!-- jds:begin -->\n## 디자인 시스템 계약(에이전트) — @jhleeweb/jhlee-design-system v",
      ),
    ).toBe(true);
    // 채워지지 않은 자리표시자가 없다 — `{{` 자체는 본문의 JSX 예(`style={{ … }}`)에도 있다.
    expect(agents).not.toMatch(/\{\{(name|version|repo)\}\}/);
    // 없는 컴포넌트는 지어내지 않고 요청한다 — 양식 URL 은 package.json 의 repository 에서 채워진다(#96).
    expect(agents).toContain(
      "https://github.com/jhleeWEB/jhlee-design-system/issues/new?template=component-request.yml",
    );
    expect(agents.trimEnd().endsWith(END)).toBe(true);
    const skill = readFileSync(join(cwd, ".claude/skills/jhlee-ds/SKILL.md"), "utf8");
    expect(skill.startsWith("---\nname: jhlee-ds\n")).toBe(true);
    expect(skill).not.toMatch(/\{\{(name|version|repo)\}\}/);
    expect(skill).toContain(
      "jq '.components[] | select(.name == \"Select\")' node_modules/@jhleeweb/jhlee-design-system/dist/components.manifest.json",
    );

    const second = sync({ cwd });
    expect(second.agents).toBe("unchanged");
    expect(second.skillFiles.map((f) => f.status)).toEqual(["unchanged"]);
    expect(readFileSync(join(cwd, "AGENTS.md"), "utf8")).toBe(agents);
  });

  it("3.x 가 복사한 스킬 폴더(squircle-ds)를 지우고, 없으면 아무것도 지우지 않는다(#91)", () => {
    const cwd = tmp();
    const legacy = join(cwd, ".claude/skills", LEGACY_SKILL);
    mkdirSync(legacy, { recursive: true });
    writeFileSync(join(legacy, "SKILL.md"), "---\nname: squircle-ds\n---\n");
    expect(sync({ cwd }).removedLegacySkillDir).toBe(legacy);
    expect(existsSync(legacy)).toBe(false);
    expect(existsSync(join(cwd, ".claude/skills/jhlee-ds/SKILL.md"))).toBe(true);
    expect(sync({ cwd }).removedLegacySkillDir).toBeNull();
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

describe("repoSlug", () => {
  it("package.json repository.url 의 여러 꼴에서 <owner>/<repo> 를 읽고, GitHub 가 아니면 null 이다(#96)", () => {
    expect(repoSlug("git+https://github.com/jhleeWEB/jhlee-design-system.git")).toBe(
      "jhleeWEB/jhlee-design-system",
    );
    expect(repoSlug("https://github.com/o/r/")).toBe("o/r");
    expect(repoSlug("git@github.com:o/r.git")).toBe("o/r");
    expect(repoSlug("https://gitlab.com/o/r")).toBeNull();
    expect(repoSlug(undefined)).toBeNull();
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
