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
3. Keep filenames, headings, and markers consistent with the starter kit contract.
4. Preserve these invariants:
   - Template tasks stay out of metrics.
   - Dataview task toggles remain interactive.
   - Missing daily notes are created from the template.
   - Fixed-task markers remain unchanged.
5. After editing, reconcile documentation in the same turn.

## Validation

- Parse JSON samples.
- Run `node --check EasyTasks/starter-kit/sync-dashboard/server.js`.
- Verify README paths and commands still exist.
