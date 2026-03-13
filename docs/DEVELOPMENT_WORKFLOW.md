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

## Change Process

1. Read `EasyTasks/README.md` first.
2. Read only the affected starter-kit files.
3. Make the smallest possible change.
4. If the change alters behavior, update:
   - `EasyTasks/README.md`
   - `EasyTasks/docs/DEVELOPMENT_WORKFLOW.md`
   - the related skill file under `EasyTasks/skills/`
5. Run lightweight verification:
   - JSON parses
   - `node --check` passes for `sync-dashboard/server.js`
   - key paths and filenames in README still match the starter kit

## Release Checklist

- Dashboard note still renders with DataviewJS enabled.
- Quick add still creates missing daily notes.
- Fixed-task sync still updates template and daily note blocks.
- HTML dashboard still reads and writes markdown files.
- README installation steps still match the actual file tree.
