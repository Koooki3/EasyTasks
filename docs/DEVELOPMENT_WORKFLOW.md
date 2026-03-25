# EasyTasks Development Workflow

## Purpose

This workflow is for maintaining the generic EasyTasks package without re-coupling it to the current WRITINGS vault.

## Rules

1. Keep the starter kit generic.
   - No personal tags, project names, diary headings, or fixed-task content.
2. Preserve bidirectional behavior.
   - Task toggles in Dataview and in `sync-dashboard` must write back to source markdown.
3. Exclude templates from metrics.
  - Use `!String(path).startsWith("Templates/")` in DataviewJS and `!contains(file.path, "Templates/")` in DQL.
  - If the starter dashboard is opened inside a larger parent vault instead of a copied standalone vault, scope queries to the package root derived from the dashboard file path before applying template exclusion.
4. Keep heading contracts stable.
   - Daily notes should keep `## Tasks`, `### New Tasks`, `## Notes`.
   - Fixed-task block markers must remain:
     - `<!-- DAILY_FIXED_TASKS:START -->`
     - `<!-- DAILY_FIXED_TASKS:END -->`
5. Treat the package as a productized starter.
   - Anything inside `EasyTasks/starter-kit/` should be runnable or copyable with minimal edits.
6. Sync generic improvements from WRITINGS promptly.
   - When WRITINGS task-system behavior changes, assess in the same turn whether the change belongs in `EasyTasks`.
   - If yes, update `EasyTasks` immediately, but only with the reusable portion.
   - Do not carry over personal content, vault-only naming, or repository-specific paths unless they are intentionally part of the public starter contract.

## Repository Sync Pass

Use this pass when WRITINGS changed first and `EasyTasks` may need to catch up.

1. Read the latest dated entries in `DOC/Obsidian任务系统执行与维护计划.md`.
2. Compare the WRITINGS task-system files against their `EasyTasks` counterparts.
3. Classify each change:
   - generic and should sync
   - vault-specific and should stay in WRITINGS only
   - already synced
4. If a maintenance rule or synchronization rule changed, update:
   - `EasyTasks/skills/obsidian-easytasks-dev/SKILL.md`
   - `EasyTasks/skills/obsidian-easytasks-maintenance/SKILL.md`
   - `EasyTasks/skills/obsidian-easytasks-repo-sync/SKILL.md`
   - `EasyTasks/docs/DEVELOPMENT_WORKFLOW.md`
5. Record the sync in the WRITINGS maintenance note in the same turn.

## Change Process

1. Read `EasyTasks/README.md` first.
2. Read only the affected starter-kit files.
3. Make the smallest possible change.
4. If the change was triggered by a WRITINGS update, explicitly decide:
   - vault-specific only
   - generic and should be synced into `EasyTasks`
5. If the change alters behavior, update:
   - `EasyTasks/README.md`
   - `EasyTasks/docs/DEVELOPMENT_WORKFLOW.md`
   - the related skill file under `EasyTasks/skills/`
   - `EasyTasks/skills/obsidian-easytasks-repo-sync/SKILL.md` when sync policy changes
6. Run lightweight verification:
   - JSON parses
   - `node --check` passes for `sync-dashboard/server.js`
   - key paths and filenames in README still match the starter kit

## Release Checklist

- Dashboard note still renders with DataviewJS enabled.
- Quick add still creates missing daily notes.
- Fixed-task sync still updates template and daily note blocks.
- HTML dashboard still reads and writes markdown files.
- README installation steps still match the actual file tree.
- Any generic WRITINGS-side improvement has either been synced into `EasyTasks` or explicitly rejected as vault-specific.
- Repository-sync instructions still describe the current WRITINGS-to-EasyTasks maintenance process.
