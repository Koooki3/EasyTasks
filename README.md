# EasyTasks

EasyTasks is a reusable Obsidian task dashboard starter extracted from the vault-specific implementation in this repository. It packages a generic daily note workflow, a Dataview-based dashboard note, fixed-task sync, a lightweight HTML control panel, and Codex skills for ongoing maintenance.

EasyTasks 是从本仓库现有的 Obsidian 任务仪表盘系统中抽离出来的通用 starter。它包含一套可复用的日报任务流、基于 Dataview 的仪表盘笔记、固定任务同步机制、一个轻量 HTML 控制台，以及配套的 Codex skills。

## What Is Included

- `starter-kit/dashboard/Task Dashboard.md`
  - Generic dashboard note with overview cards, quick add, open-task list, and due queue.
- `starter-kit/Templates/Daily Note Template.md`
  - Daily note template with fixed-task block markers and a stable insertion section.
- `starter-kit/DOC/fixed-tasks.json`
  - Example fixed-task source file for template sync and daily sync.
- `starter-kit/.obsidian/*.sample.json`
  - Sample Obsidian settings for Daily Notes, Templates, and DataviewJS.
- `starter-kit/.obsidian/snippets/task-dashboard.css`
  - Dashboard styling that matches the note structure.
- `starter-kit/sync-dashboard/`
  - Local HTML + Node dashboard for direct markdown read/write outside Obsidian.
- `docs/DEVELOPMENT_WORKFLOW.md`
  - Generic maintenance workflow for this package.
- `skills/obsidian-easytasks-dev/SKILL.md`
  - Skill for developing the reusable package.
- `skills/obsidian-easytasks-maintenance/SKILL.md`
  - Skill for troubleshooting and upkeep.

## Directory Layout

```text
EasyTasks/
├─ README.md
├─ docs/
│  └─ DEVELOPMENT_WORKFLOW.md
├─ skills/
│  ├─ obsidian-easytasks-dev/SKILL.md
│  └─ obsidian-easytasks-maintenance/SKILL.md
└─ starter-kit/
   ├─ dashboard/Task Dashboard.md
   ├─ Templates/Daily Note Template.md
   ├─ DOC/fixed-tasks.json
   ├─ .obsidian/
   │  ├─ daily-notes.sample.json
   │  ├─ templates.sample.json
   │  ├─ plugins/dataview/data.sample.json
   │  └─ snippets/task-dashboard.css
   └─ sync-dashboard/
      ├─ index.html
      └─ server.js
```

## Core Design

### English

EasyTasks keeps the original system's useful invariants while removing vault-specific content:

- Daily notes are the source of truth.
- Dashboard queries exclude `Templates/`.
- Dataview task toggles still write back to source files.
- Quick add can create missing daily notes from a template.
- Fixed tasks are managed from one JSON file and synchronized into both the template and a target daily note.
- The HTML dashboard is optional, but gives you a second control surface outside Obsidian.

### 中文

EasyTasks 保留了原系统最关键的行为约束，同时去掉了当前仓库专用的内容：

- 每日日报仍是任务数据的唯一真实来源。
- 仪表盘统计默认排除 `Templates/`。
- Dataview 中勾选任务仍会回写原始 markdown 文件。
- 快速新建任务时，如果对应日报不存在，会自动按模板创建。
- 固定任务统一由一个 JSON 文件管理，并可同步到日报模板和指定日报。
- HTML 控制台是可选入口，用于在 Obsidian 外直接读写同一批 markdown 任务。

## Quick Start

### 1. Copy the Starter Kit into a Vault

Copy the contents of `EasyTasks/starter-kit/` into the root of an Obsidian vault. Keep these target paths unchanged if you want the package to work without edits:

- `Daily Notes/`
- `Templates/Daily Note Template.md`
- `DOC/fixed-tasks.json`
- `.obsidian/snippets/task-dashboard.css`
- `dashboard/Task Dashboard.md`
- `sync-dashboard/index.html`
- `sync-dashboard/server.js`

将 `EasyTasks/starter-kit/` 的内容复制到你的 Obsidian Vault 根目录。若希望零改动运行，建议保留下列路径名称：

- `Daily Notes/`
- `Templates/Daily Note Template.md`
- `DOC/fixed-tasks.json`
- `.obsidian/snippets/task-dashboard.css`
- `dashboard/Task Dashboard.md`
- `sync-dashboard/index.html`
- `sync-dashboard/server.js`

### 2. Apply Obsidian Settings

Use the sample JSON files as references:

- `starter-kit/.obsidian/daily-notes.sample.json`
- `starter-kit/.obsidian/templates.sample.json`
- `starter-kit/.obsidian/plugins/dataview/data.sample.json`

Minimum plugin assumptions:

- Daily Notes enabled
- Templates enabled
- Dataview installed
- DataviewJS enabled

使用 `starter-kit/.obsidian/` 下的 sample 配置作为参考，至少保证：

- 已启用 Daily Notes
- 已启用 Templates
- 已安装 Dataview
- DataviewJS 已开启

### 3. Enable the CSS Snippet

Copy `starter-kit/.obsidian/snippets/task-dashboard.css` into your vault snippet directory, then enable the snippet in Obsidian Appearance settings.

将 `starter-kit/.obsidian/snippets/task-dashboard.css` 放到你的 vault snippet 目录，并在 Obsidian 的外观设置中启用它。

### 4. Open the Dashboard Note

Open `dashboard/Task Dashboard.md`. You should see:

- Overview cards
- Quick-add panel
- Interactive open-task list
- Due queue

打开 `dashboard/Task Dashboard.md` 后，你应能看到：

- 概览卡片
- 快速新建面板
- 可交互的未完成任务列表
- 截止日期队列

### 5. Optional: Run the HTML Sync Dashboard

From the vault root:

```powershell
node sync-dashboard/server.js
```

Then open [http://127.0.0.1:8765](http://127.0.0.1:8765).

在 Vault 根目录运行：

```powershell
node sync-dashboard/server.js
```

然后访问 [http://127.0.0.1:8765](http://127.0.0.1:8765)。

## Task Format Contract

EasyTasks expects plain markdown tasks and uses a few lightweight conventions:

```markdown
- [ ] #project Ship the draft 🔺 due: 2026-03-15 -> 2026-03-13
- [ ] #DAILYFIXED [fixed_id::exercise] Move your body for 20 minutes -> 2026-03-13
- [x] Review weekly plan done: 2026-03-13 -> 2026-03-13
```

Meaning:

- `-> YYYY-MM-DD`: created date
- `due: YYYY-MM-DD`: due date
- `done: YYYY-MM-DD`: completion date
- `#DAILYFIXED`: fixed-task marker
- `[fixed_id::...]`: stable identifier for syncing fixed tasks

说明：

- `-> YYYY-MM-DD`：创建日期
- `due: YYYY-MM-DD`：截止日期
- `done: YYYY-MM-DD`：完成日期
- `#DAILYFIXED`：固定任务标记
- `[fixed_id::...]`：固定任务同步所需的稳定 ID

## Fixed Task Workflow

### English

1. Edit `DOC/fixed-tasks.json`.
2. Sync the template fixed-task block.
3. Sync a target daily note when needed.
4. Keep the block markers unchanged.

### 中文

1. 编辑 `DOC/fixed-tasks.json`。
2. 将固定任务同步回日报模板。
3. 需要时再同步到指定日报。
4. 不要改动固定任务块的起止注释标记。

## Codex Skills

This package includes two local skills:

- `EasyTasks/skills/obsidian-easytasks-dev/SKILL.md`
  - Use when extending or refactoring the reusable package.
- `EasyTasks/skills/obsidian-easytasks-maintenance/SKILL.md`
  - Use when fixing render issues, sync regressions, or documentation drift.

本包附带两个本地 skill：

- `EasyTasks/skills/obsidian-easytasks-dev/SKILL.md`
  - 适用于继续开发或重构通用包。
- `EasyTasks/skills/obsidian-easytasks-maintenance/SKILL.md`
  - 适用于排查渲染异常、同步回写故障或文档漂移。

## Development Notes

Use `docs/DEVELOPMENT_WORKFLOW.md` as the maintenance contract. When you change behavior, update README and the relevant skill file in the same turn.

以 `docs/DEVELOPMENT_WORKFLOW.md` 作为后续维护基线。只要行为发生变化，就应同时更新 README 和对应的 skill 文件。

## Known Limits

- The starter kit assumes a single vault-local Node process for the HTML dashboard.
- Concurrent edits from multiple entry points can still conflict.
- The dashboard note and HTML dashboard intentionally share simple heading contracts rather than a heavier task-id system.

- 当前 starter 假定 HTML 控制台由单个本地 Node 进程提供服务。
- 多入口同时写同一任务仍可能发生冲突。
- 仪表盘笔记与 HTML 控制台目前依赖稳定标题结构，而不是更重的 task-id 体系。
