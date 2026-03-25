---
name: obsidian-easytasks-dev
description: Develop or refactor the generic EasyTasks starter kit without coupling it to the WRITINGS vault.
---

# EasyTasks Dev

Use this skill when changing the reusable implementation under `EasyTasks/`.

## Scope

- `EasyTasks/starter-kit/`
- `EasyTasks/docs/`
- `EasyTasks/README.md`
- `EasyTasks/skills/`

## Workflow

1. Read `EasyTasks/README.md`.
2. Confirm the change belongs to the generic package, not the vault-specific implementation.
3. If a feature is first implemented in the WRITINGS vault, explicitly assess whether any part of it is generic enough for `EasyTasks/`.
4. For repository-sync work, pair this skill with `EasyTasks/skills/obsidian-easytasks-repo-sync/SKILL.md`.
5. When the WRITINGS change includes reusable logic, patterns, docs, or workflows, update `EasyTasks` in the same turn.
6. Only sync the generic portion.
   - Do not copy personal tags, project-specific wording, vault-only paths, or private task content into `EasyTasks`.
7. Keep filenames, headings, and markers consistent with the starter kit contract.
8. Preserve these invariants:
   - Template tasks stay out of metrics.
   - Dataview task toggles remain interactive.
   - Missing daily notes are created from the template.
   - Fixed-task markers remain unchanged.
9. After editing, reconcile documentation in the same turn.

## Validation

- Parse JSON samples.
- Run `node --check EasyTasks/starter-kit/sync-dashboard/server.js`.
- Verify README paths and commands still exist.
- Verify any newly synced change is still generic and does not reintroduce WRITINGS-specific content.
- When the change came from WRITINGS, verify the sync decision is documented or obvious from the updated files.
