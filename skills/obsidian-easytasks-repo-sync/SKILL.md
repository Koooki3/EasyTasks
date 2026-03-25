---
name: obsidian-easytasks-repo-sync
description: Synchronize generic task-system improvements from the WRITINGS vault into the EasyTasks package.
---

# EasyTasks Repo Sync

Use this skill after WRITINGS task-system updates when you need to decide what should be mirrored into `EasyTasks/`.

## Scope

- WRITINGS-side sources:
  - `任务仪表盘.md`
  - `.obsidian/snippets/task-dashboard.css`
  - `sync-dashboard/`
  - `Templates/日报模板.md`
  - `DOC/每日固定任务.json`
  - `DOC/Obsidian任务系统执行与维护计划.md`
- EasyTasks-side targets:
  - `EasyTasks/starter-kit/`
  - `EasyTasks/docs/`
  - `EasyTasks/README.md`
  - `EasyTasks/skills/`

## Sync Workflow

1. Read the latest dated update entries in `DOC/Obsidian任务系统执行与维护计划.md`.
2. Check which WRITINGS task-system files changed after the last EasyTasks sync.
3. Build a sync decision for each change:
   - generic and should sync
   - vault-specific and should not sync
   - already present in EasyTasks
4. Sync only reusable parts:
   - generic Dataview patterns
   - generic task-state semantics
   - reusable UI patterns
   - deployment or maintenance documentation
5. Reject anything vault-private:
   - personal tags
   - project-specific notes
   - repository-only paths
   - dashboard domains unrelated to EasyTasks
6. Update EasyTasks skills and workflow docs when the maintenance process itself changes.
7. Reconcile the WRITINGS maintenance note in the same turn with a dated sync record.

## Validation

- `node --check EasyTasks/starter-kit/sync-dashboard/server.js`
- sample JSON files still parse
- README paths still match the starter-kit layout
- synced changes remain package-generic
