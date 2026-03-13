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
