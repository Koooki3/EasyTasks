---
name: obsidian-easytasks-maintenance
description: Troubleshoot or maintain the generic EasyTasks starter kit and its documentation.
---

# EasyTasks Maintenance

Use this skill when EasyTasks renders blank, the HTML dashboard stops writing back, fixed-task sync regresses, or docs drift from the package.

Also use it after WRITINGS task-system updates to verify whether the generic package needs the same fix or workflow update.

## Triage Order

1. Read `EasyTasks/README.md`.
2. Check the affected starter-kit file:
   - dashboard note
   - daily template
   - fixed-task config
   - CSS snippet
   - sync-dashboard server or HTML
3. Confirm heading and marker contracts still match:
   - `## Tasks`
   - `### New Tasks`
   - `## Notes`
   - `<!-- DAILY_FIXED_TASKS:START -->`
   - `<!-- DAILY_FIXED_TASKS:END -->`
4. Check whether the latest WRITINGS-side change introduced a reusable fix, safer pattern, or documentation update that should be mirrored in `EasyTasks`.
5. Mirror only the generic portion.
   - Exclude vault-private tags, naming, content, and path conventions unless they are part of the starter-kit contract.
6. Re-run lightweight verification.

## Common Failure Modes

- Template tasks leaked into metrics.
- A heading rename broke task insertion.
- Fixed-task block markers were removed or edited.
- The HTML dashboard and markdown files drifted on path names.
- README steps no longer match the package layout.
- WRITINGS gained a generic fix, but EasyTasks documentation or starter files were left behind.
