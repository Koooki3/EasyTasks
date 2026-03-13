# EasyTasks

EasyTasks is a reusable task dashboard starter for Obsidian. It combines daily notes, Dataview queries, fixed-task synchronization, and an optional HTML control panel into a single workflow that can be copied into a new or existing vault.

EasyTasks 是一个面向 Obsidian 的通用任务仪表盘 starter。它把每日日报、Dataview 查询、固定任务同步，以及可选的 HTML 控制台整合为一套可直接部署到新旧 Vault 中的任务工作流。

## Overview | 简介

### English

EasyTasks is designed for people who want a practical task system inside Obsidian without building everything from scratch. It keeps markdown files as the source of truth, supports Dataview-based dashboarding, lets you add tasks directly into daily notes, and provides an optional local web panel for interacting with the same markdown files outside Obsidian.

### 中文

EasyTasks 适合希望在 Obsidian 内构建可用任务系统、但不想从零搭建整套方案的用户。它以 markdown 文件作为唯一真实数据源，支持基于 Dataview 的任务仪表盘、将任务直接写入日报，并提供一个可选的本地 Web 控制台，用于在 Obsidian 外操作同一批 markdown 任务。

## Key Features | 核心能力

- Daily notes remain the source of truth.
- Dataview dashboard queries exclude template files by default.
- Task checkboxes in the dashboard can write back to source files.
- Missing daily notes can be created automatically from the template.
- Fixed tasks are managed from one JSON file and synced into both template and daily notes.
- An optional local HTML dashboard can read and write the same markdown task files.

- 每日日报仍是任务数据的唯一真实来源。
- 仪表盘默认排除模板目录中的任务，避免统计污染。
- 仪表盘中的任务勾选可直接回写源文件。
- 如果目标日报不存在，可以按模板自动创建。
- 固定任务统一由一个 JSON 文件管理，并同步到模板和指定日报。
- 可选的本地 HTML 控制台可直接读写同一批 markdown 任务文件。

## Package Contents | 包含内容

- `starter-kit/dashboard/Task Dashboard.md`
  - Main dashboard note for Obsidian.
- `starter-kit/Templates/Daily Note Template.md`
  - Daily note template used by the quick-add flow.
- `starter-kit/DOC/fixed-tasks.json`
  - Source of fixed tasks.
- `starter-kit/.obsidian/daily-notes.sample.json`
  - Sample Daily Notes settings.
- `starter-kit/.obsidian/templates.sample.json`
  - Sample Templates settings.
- `starter-kit/.obsidian/plugins/dataview/data.sample.json`
  - Sample Dataview settings.
- `starter-kit/.obsidian/snippets/task-dashboard.css`
  - CSS snippet for dashboard styling.
- `starter-kit/sync-dashboard/index.html`
  - HTML dashboard UI.
- `starter-kit/sync-dashboard/server.js`
  - Local Node server for HTML dashboard read/write.
- `docs/DEVELOPMENT_WORKFLOW.md`
  - Generic maintenance workflow.
- `skills/obsidian-easytasks-dev/SKILL.md`
  - Development skill for extending the package.
- `skills/obsidian-easytasks-maintenance/SKILL.md`
  - Maintenance skill for troubleshooting and upkeep.

## Directory Layout | 目录结构

```text
EasyTasks/
├─ README.md
├─ docs/
│  └─ DEVELOPMENT_WORKFLOW.md
├─ skills/
│  ├─ obsidian-easytasks-dev/
│  │  └─ SKILL.md
│  └─ obsidian-easytasks-maintenance/
│     └─ SKILL.md
└─ starter-kit/
   ├─ .obsidian/
   │  ├─ daily-notes.sample.json
   │  ├─ templates.sample.json
   │  ├─ plugins/dataview/data.sample.json
   │  └─ snippets/task-dashboard.css
   ├─ Daily Notes/
   ├─ dashboard/Task Dashboard.md
   ├─ DOC/fixed-tasks.json
   ├─ sync-dashboard/
   │  ├─ index.html
   │  └─ server.js
   └─ Templates/Daily Note Template.md
```

## Requirements | 环境要求

### Required

- Obsidian
- Dataview plugin
- Daily Notes core plugin
- Templates core plugin

### Optional

- Node.js 18+ for the HTML sync dashboard

### 必需项

- Obsidian
- Dataview 插件
- Daily Notes 核心插件
- Templates 核心插件

### 可选项

- Node.js 18+，用于运行 HTML 同步控制台

## Deployment Guide | 部署指南

### Option A: Recommended Standard Layout | 方案 A：推荐标准布局

This is the easiest setup. Copy everything under `starter-kit/` into the root of your vault and keep the directory names unchanged.

这是最省事的部署方式。将 `starter-kit/` 下全部内容复制到 Vault 根目录，并保持目录名称不变。

Target structure:

```text
YourVault/
├─ .obsidian/
├─ Daily Notes/
├─ dashboard/
│  └─ Task Dashboard.md
├─ DOC/
│  └─ fixed-tasks.json
├─ sync-dashboard/
│  ├─ index.html
│  └─ server.js
└─ Templates/
   └─ Daily Note Template.md
```

### Option B: Custom Layout | 方案 B：自定义布局

You can rename folders and files, but then you must update the hard-coded paths in:

- `starter-kit/dashboard/Task Dashboard.md`
- `starter-kit/sync-dashboard/server.js`
- your Obsidian plugin settings

你也可以改目录和文件名，但改名后必须同步修改以下位置中的路径：

- `starter-kit/dashboard/Task Dashboard.md`
- `starter-kit/sync-dashboard/server.js`
- Obsidian 对应插件配置

## Step-by-Step Setup | 逐步安装步骤

### 1. Copy Files | 复制文件

Copy the following from `starter-kit/` into your vault:

- `dashboard/Task Dashboard.md`
- `Templates/Daily Note Template.md`
- `DOC/fixed-tasks.json`
- `.obsidian/snippets/task-dashboard.css`
- `sync-dashboard/index.html`
- `sync-dashboard/server.js`

将 `starter-kit/` 中以下内容复制到你的 Vault：

- `dashboard/Task Dashboard.md`
- `Templates/Daily Note Template.md`
- `DOC/fixed-tasks.json`
- `.obsidian/snippets/task-dashboard.css`
- `sync-dashboard/index.html`
- `sync-dashboard/server.js`

### 2. Configure Daily Notes | 配置 Daily Notes

Reference:

- `starter-kit/.obsidian/daily-notes.sample.json`

Set:

- folder: `Daily Notes`
- format: `YYYY-MM-DD`
- template: `Templates/Daily Note Template.md`

参考：

- `starter-kit/.obsidian/daily-notes.sample.json`

建议设置：

- folder: `Daily Notes`
- format: `YYYY-MM-DD`
- template: `Templates/Daily Note Template.md`

### 3. Configure Templates | 配置 Templates

Reference:

- `starter-kit/.obsidian/templates.sample.json`

Set the templates folder to:

- `Templates`

参考：

- `starter-kit/.obsidian/templates.sample.json`

将模板目录设置为：

- `Templates`

### 4. Configure Dataview | 配置 Dataview

Reference:

- `starter-kit/.obsidian/plugins/dataview/data.sample.json`

Make sure:

- Dataview is installed
- DataviewJS is enabled

参考：

- `starter-kit/.obsidian/plugins/dataview/data.sample.json`

请确认：

- Dataview 已安装
- DataviewJS 已开启

### 5. Enable the CSS Snippet | 启用 CSS 片段

Enable `task-dashboard.css` in Obsidian Appearance settings.

在 Obsidian 外观设置中启用 `task-dashboard.css`。

### 6. Open the Dashboard Note | 打开仪表盘

Open:

- `dashboard/Task Dashboard.md`

Expected result:

- overview cards render
- quick-add panel renders
- open task list is interactive
- due queue renders

打开：

- `dashboard/Task Dashboard.md`

预期结果：

- 概览卡片正常显示
- 快速新建面板正常显示
- 未完成任务列表可交互
- 截止日期队列正常显示

## Reproducible Minimal Setup | 最小可复现部署

If you want to reproduce the system from scratch in a clean vault, follow this exact sequence:

如果你希望在一个全新的 Vault 中从零复现整套系统，可以严格按下面顺序操作：

1. Create a new empty Obsidian vault.
2. Enable `Daily Notes` and `Templates`.
3. Install `Dataview`.
4. Copy all files from `starter-kit/` into the new vault root.
5. Apply the three sample JSON settings manually.
6. Enable the CSS snippet.
7. Open `dashboard/Task Dashboard.md`.
8. Create or open today's daily note once.
9. Add a task from the dashboard quick-add section.
10. Confirm the new task appears in `Daily Notes/YYYY-MM-DD.md`.
11. Toggle the task from the dashboard and confirm the checkbox writes back to the daily note.

1. 新建一个空白 Obsidian Vault。
2. 启用 `Daily Notes` 和 `Templates`。
3. 安装 `Dataview`。
4. 将 `starter-kit/` 全部文件复制到新 Vault 根目录。
5. 手动套用 3 份 sample JSON 的关键配置。
6. 启用 CSS snippet。
7. 打开 `dashboard/Task Dashboard.md`。
8. 先创建或打开一次当天日报。
9. 在仪表盘的快速新建区域添加一个任务。
10. 确认该任务已写入 `Daily Notes/YYYY-MM-DD.md`。
11. 在仪表盘中勾选该任务，并确认状态已回写到日报源文件。

## HTML Sync Dashboard | HTML 同步控制台

### What It Does

The HTML dashboard is a local companion UI. It reads and writes the same markdown files used by Obsidian.

HTML 控制台是一个本地辅助入口，它直接读写与 Obsidian 相同的 markdown 文件。

### How to Run

From the vault root:

```powershell
node sync-dashboard/server.js
```

Then open:

- [http://127.0.0.1:8765](http://127.0.0.1:8765)

在 Vault 根目录运行：

```powershell
node sync-dashboard/server.js
```

然后打开：

- [http://127.0.0.1:8765](http://127.0.0.1:8765)

### What to Verify

- the page loads
- KPI cards render
- quick add writes into a daily note
- fixed tasks can be added and synced
- checkbox toggles write back to markdown

- 页面可正常打开
- KPI 卡片正常渲染
- 快速新建可写入日报
- 固定任务可新增并同步
- 勾选框可回写 markdown

## Task Format Contract | 任务格式约定

EasyTasks uses plain markdown task lines with lightweight markers:

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
- `[fixed_id::...]`: stable sync identifier for fixed tasks

说明：

- `-> YYYY-MM-DD`：创建日期
- `due: YYYY-MM-DD`：截止日期
- `done: YYYY-MM-DD`：完成日期
- `#DAILYFIXED`：固定任务标记
- `[fixed_id::...]`：固定任务同步使用的稳定标识

## Fixed Task Workflow | 固定任务工作流

1. Edit `DOC/fixed-tasks.json`.
2. Sync the template fixed-task block.
3. Sync a target daily note when needed.
4. Keep these markers unchanged:
   - `<!-- DAILY_FIXED_TASKS:START -->`
   - `<!-- DAILY_FIXED_TASKS:END -->`

1. 编辑 `DOC/fixed-tasks.json`。
2. 将固定任务同步到日报模板中的固定任务区块。
3. 需要时再同步到指定日报。
4. 保持以下标记不变：
   - `<!-- DAILY_FIXED_TASKS:START -->`
   - `<!-- DAILY_FIXED_TASKS:END -->`

## How the Dashboard Works | 仪表盘工作原理

### Obsidian Dashboard

- reads tasks from the vault with Dataview
- excludes `Templates/` from metrics
- writes back through Dataview task interactivity
- inserts new tasks into the `### New Tasks` section

### HTML Dashboard

- scans markdown files directly
- writes changed task lines back to disk
- uses the same fixed-task source file
- depends on the same heading conventions

### Obsidian 仪表盘

- 通过 Dataview 读取 Vault 中的任务
- 统计时排除 `Templates/`
- 依赖 Dataview 的任务交互能力回写源文件
- 将新任务插入到 `### New Tasks` 区块

### HTML 控制台

- 直接扫描 markdown 文件
- 将修改后的任务行直接回写到磁盘
- 使用相同的固定任务配置文件
- 依赖相同的标题结构约定

## Troubleshooting | 排错

### Dashboard is blank | 仪表盘为空白

Check:

- Dataview is installed
- DataviewJS is enabled
- `Task Dashboard.md` paths still match your vault structure

检查：

- Dataview 是否已安装
- DataviewJS 是否已开启
- `Task Dashboard.md` 中的路径是否仍与当前 Vault 结构一致

### New tasks are inserted in the wrong place | 新任务插入位置不对

Check whether your daily note still contains:

- `## Tasks`
- `### New Tasks`

检查日报中是否仍保留：

- `## Tasks`
- `### New Tasks`

### Fixed tasks do not sync | 固定任务不同步

Check:

- `DOC/fixed-tasks.json` is valid JSON
- the fixed-task markers still exist
- template and daily note paths are unchanged or updated consistently

检查：

- `DOC/fixed-tasks.json` 是否为合法 JSON
- 固定任务标记是否仍然存在
- 模板与日报路径是否未改名，或已同步更新相关代码路径

### HTML dashboard cannot write back | HTML 控制台无法回写

Check:

- Node.js version
- server is started from the vault root
- markdown files were not changed concurrently by another entry point

检查：

- Node.js 版本
- 服务是否在 Vault 根目录启动
- 同一任务是否被其他入口同时修改

## Development and Maintenance | 开发与维护

Use:

- `docs/DEVELOPMENT_WORKFLOW.md`
- `skills/obsidian-easytasks-dev/SKILL.md`
- `skills/obsidian-easytasks-maintenance/SKILL.md`

维护时建议配合使用：

- `docs/DEVELOPMENT_WORKFLOW.md`
- `skills/obsidian-easytasks-dev/SKILL.md`
- `skills/obsidian-easytasks-maintenance/SKILL.md`

## Known Limits | 已知限制

- The HTML dashboard assumes a single local Node process.
- Concurrent edits from multiple entry points can still conflict.
- Both dashboards currently rely on stable headings rather than a dedicated task-id system.

- HTML 控制台默认假定由单个本地 Node 进程提供服务。
- 多入口同时修改同一任务时仍可能产生冲突。
- 当前两套入口都依赖稳定标题结构，而不是独立 task-id 体系。
