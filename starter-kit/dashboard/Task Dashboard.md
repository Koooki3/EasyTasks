> Toggle a task here and Dataview will write back to the source markdown file directly.

## Overview
<div class="module-subtitle">A compact operational view for daily execution, fixed routines, and due-date pressure.</div>

```dataviewjs
const DASHBOARD_PATH = String(dv.current().file.path ?? "");
const PACKAGE_ROOT = DASHBOARD_PATH.includes("/dashboard/") ? DASHBOARD_PATH.split("/dashboard/")[0] : "";
const SCOPE_PREFIX = PACKAGE_ROOT ? `${PACKAGE_ROOT}/` : "";

function inScope(path) {
  const value = String(path ?? "");
  return value.startsWith(SCOPE_PREFIX) && !value.startsWith(`${SCOPE_PREFIX}Templates/`);
}

function textOf(task) {
  return String(task?.text ?? task?.visual ?? "");
}

function dateKey(value) {
  if (!value) return "";
  if (typeof value === "string") return window.moment(value).isValid() ? window.moment(value).format("YYYY-MM-DD") : String(value).slice(0, 10);
  if (typeof value.toISODate === "function") return value.toISODate();
  const raw = String(value);
  return window.moment(raw).isValid() ? window.moment(raw).format("YYYY-MM-DD") : raw.slice(0, 10);
}

const pages = dv.pages("").where((p) => inScope(p.file.path));
const tasks = [];
for (const page of pages) {
  for (const task of (page.file?.tasks ?? [])) tasks.push(task);
}

const today = window.moment().format("YYYY-MM-DD");
const open = tasks.filter((task) => !task.completed && String(task?.status ?? " ") !== "-");
const done = tasks.filter((task) => task.completed && String(task?.status ?? " ") !== "-");
const fixedOpen = open.filter((task) => textOf(task).includes("#DAILYFIXED"));
const createdToday = tasks.filter((task) => dateKey(task.created) === today && !textOf(task).includes("#DAILYFIXED")).length;
const doneToday = done.filter((task) => dateKey(task.completion) === today).length;

const root0 = dv.container;
root0.classList.add("task-dashboard");
const hero = root0.createDiv({ cls: "dashboard-hero" });
hero.createEl("div", { cls: "dashboard-hero-date", text: `Today - ${window.moment().format("YYYY-MM-DD dddd")}` });
hero.createEl("div", { cls: "dashboard-hero-title", text: "EasyTasks Command Deck" });
hero.createEl("div", {
  cls: "dashboard-hero-meta",
  text: `Open ${open.length} - Fixed ${fixedOpen.length} - Done today ${doneToday}`
});

const chips = root0.createDiv({ cls: "dashboard-chip-wrap" });
[
  ["Normal open", open.length - fixedOpen.length],
  ["Fixed open", fixedOpen.length],
  ["Created today", createdToday],
  ["Done today", doneToday]
].forEach(([label, value]) => {
  const card = chips.createDiv({ cls: "dashboard-chip" });
  card.createEl("span", { cls: "dashboard-chip-label", text: label });
  card.createEl("span", { cls: "dashboard-chip-value", text: String(value) });
});
```

## Quick Add
<div class="module-subtitle">Create a task in a daily note. Missing daily files are created from the template automatically.</div>

```dataviewjs
const DASHBOARD_PATH = String(dv.current().file.path ?? "");
const PACKAGE_ROOT = DASHBOARD_PATH.includes("/dashboard/") ? DASHBOARD_PATH.split("/dashboard/")[0] : "";
const ROOT_PREFIX = PACKAGE_ROOT ? `${PACKAGE_ROOT}/` : "";
const DAILY_FOLDER = `${ROOT_PREFIX}Daily Notes`;
const TEMPLATE_PATH = `${ROOT_PREFIX}Templates/Daily Note Template.md`;
const TODO_HEADING_RE = /^##\s*(Tasks|To Do)\s*$/i;
const NEW_TASK_HEADING_RE = /^###\s*(New Tasks|Inbox)\s*$/i;
const H2_HEADING_RE = /^##\s+/;
const FIXED_BLOCK_END_RE = /^<!--\s*DAILY_FIXED_TASKS:END\s*-->\s*$/;

const root = dv.container;
root.classList.add("task-dashboard");

const panel = root.createDiv({ cls: "task-dashboard-create" });
panel.createEl("h3", { text: "Add task to daily note" });
panel.createEl("p", {
  cls: "task-dashboard-hint",
  text: "Tasks are inserted under the 'New Tasks' section. Missing daily notes are created in the package scope."
});

const titleRow = panel.createDiv({ cls: "task-dashboard-row" });
const titleInput = titleRow.createEl("input");
titleInput.placeholder = "Task title";
titleInput.className = "task-dashboard-input task-dashboard-title";

const metaRow = panel.createDiv({ cls: "task-dashboard-row task-dashboard-row-meta" });
const dateGroup = metaRow.createDiv({ cls: "task-dashboard-field" });
dateGroup.createEl("label", { cls: "task-dashboard-label", text: "Daily note date" });
const dateInput = dateGroup.createEl("input");
dateInput.type = "date";
dateInput.value = window.moment().format("YYYY-MM-DD");
dateInput.className = "task-dashboard-input";

const dueGroup = metaRow.createDiv({ cls: "task-dashboard-field" });
dueGroup.createEl("label", { cls: "task-dashboard-label", text: "Due date" });
const dueInput = dueGroup.createEl("input");
dueInput.type = "date";
dueInput.className = "task-dashboard-input";

const tagRow = panel.createDiv({ cls: "task-dashboard-row" });
const tagsInput = tagRow.createEl("input");
tagsInput.placeholder = "Tags separated by spaces";
tagsInput.className = "task-dashboard-input";

const priorityRow = panel.createDiv({ cls: "task-dashboard-row task-dashboard-row-meta" });
const priorityGroup = priorityRow.createDiv({ cls: "task-dashboard-field" });
priorityGroup.createEl("label", { cls: "task-dashboard-label", text: "Priority" });
const prioritySelect = priorityGroup.createEl("select");
prioritySelect.className = "task-dashboard-input";
[
  { label: "None", value: "" },
  { label: "High 🔽", value: "🔽" },
  { label: "Medium 🔼", value: "🔼" },
  { label: "Low 🔺", value: "🔺" }
].forEach((item) => {
  const option = prioritySelect.createEl("option");
  option.value = item.value;
  option.text = item.label;
});

const actions = panel.createDiv({ cls: "task-dashboard-actions" });
const addButton = actions.createEl("button", { text: "Add task" });
addButton.className = "task-dashboard-btn";
const openButton = actions.createEl("button", { text: "Open daily note" });
openButton.className = "task-dashboard-btn task-dashboard-btn-secondary";
const statusText = panel.createDiv({ cls: "task-dashboard-status" });

function normalizeTags(raw) {
  return String(raw || "")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.startsWith("#") ? item : `#${item}`))
    .join(" ");
}

function applyTemplateVars(template, dateStr) {
  const baseDate = window.moment(dateStr, "YYYY-MM-DD", true);
  const now = window.moment();
  return template
    .replace(/\{\{date:([^}]+)\}\}/g, (_, fmt) => baseDate.format(fmt.trim()))
    .replace(/\{\{time:([^}]+)\}\}/g, (_, fmt) => now.format(fmt.trim()))
    .replace(/\{\{date\}\}/g, baseDate.format("YYYY-MM-DD"))
    .replace(/\{\{time\}\}/g, now.format("HH:mm"));
}

async function ensureDailyFile(dateStr) {
  const dailyPath = `${DAILY_FOLDER}/${dateStr}.md`;
  let file = app.vault.getAbstractFileByPath(dailyPath);
  if (!file) {
    let templateText = "## Tasks\n\n### New Tasks\n\n## Notes\n";
    const templateFile = app.vault.getAbstractFileByPath(TEMPLATE_PATH);
    if (templateFile) templateText = await app.vault.cachedRead(templateFile);
    file = await app.vault.create(dailyPath, applyTemplateVars(templateText, dateStr));
  }
  return file;
}

function injectTask(content, taskLine) {
  const lines = content.split(/\r?\n/);
  let todoIndex = lines.findIndex((line) => TODO_HEADING_RE.test(line.trim()));
  if (todoIndex === -1) {
    lines.push("", "## Tasks", "", "### New Tasks", "", "## Notes", "");
    todoIndex = lines.findIndex((line) => TODO_HEADING_RE.test(line.trim()));
  }

  let todoEnd = lines.findIndex((line, index) => index > todoIndex && H2_HEADING_RE.test(line.trim()));
  if (todoEnd === -1) todoEnd = lines.length;

  let headingIndex = -1;
  for (let i = todoIndex + 1; i < todoEnd; i += 1) {
    if (NEW_TASK_HEADING_RE.test(lines[i].trim())) {
      headingIndex = i;
      break;
    }
  }

  if (headingIndex === -1) {
    let insertAt = todoIndex + 1;
    for (let i = todoIndex + 1; i < todoEnd; i += 1) {
      if (FIXED_BLOCK_END_RE.test(lines[i].trim())) {
        insertAt = i + 1;
        break;
      }
    }
    lines.splice(insertAt, 0, "", "### New Tasks", "");
    headingIndex = insertAt + 1;
  }

  let taskIndex = headingIndex + 1;
  while (taskIndex < lines.length && lines[taskIndex].trim() === "") taskIndex += 1;
  lines.splice(taskIndex, 0, taskLine);
  return lines.join("\n");
}

async function addTask() {
  const title = titleInput.value.trim();
  const day = dateInput.value;
  if (!title) return new Notice("Task title is required.");
  if (!day) return new Notice("Please choose a date.");

  const taskLine = `- [ ] ${normalizeTags(tagsInput.value)}${tagsInput.value.trim() ? " " : ""}${title}${prioritySelect.value ? ` ${prioritySelect.value}` : ""}${dueInput.value ? ` due: ${dueInput.value}` : ""} -> ${window.moment().format("YYYY-MM-DD")}`;
  const file = await ensureDailyFile(day);
  await app.vault.process(file, (content) => injectTask(content, taskLine));
  statusText.setText(`Written to ${DAILY_FOLDER}/${day}.md`);
  titleInput.value = "";
  tagsInput.value = "";
  dueInput.value = "";
  prioritySelect.value = "";
}

addButton.onclick = addTask;
openButton.onclick = async () => {
  const file = await ensureDailyFile(dateInput.value);
  app.workspace.getLeaf(true).openFile(file);
};
```

## Open Tasks
<div class="module-subtitle">Dataview checkboxes remain interactive and write back to the source file. Cancelled tasks are excluded.</div>

```dataviewjs
const DASHBOARD_PATH = String(dv.current().file.path ?? "");
const PACKAGE_ROOT = DASHBOARD_PATH.includes("/dashboard/") ? DASHBOARD_PATH.split("/dashboard/")[0] : "";
const SCOPE_PREFIX = PACKAGE_ROOT ? `${PACKAGE_ROOT}/` : "";
const pages = dv.pages("").where((p) => String(p.file.path ?? "").startsWith(SCOPE_PREFIX) && !String(p.file.path ?? "").startsWith(`${SCOPE_PREFIX}Templates/`));
const rows = [];
for (const page of pages) {
  for (const task of (page.file?.tasks ?? [])) {
    if (!task.completed && String(task?.status ?? " ") !== "-") rows.push(task);
  }
}
dv.taskList(rows, false);
```

## Due Queue
<div class="module-subtitle">Use due dates for near-term pressure. Cancelled tasks are excluded.</div>

```dataviewjs
const DASHBOARD_PATH = String(dv.current().file.path ?? "");
const PACKAGE_ROOT = DASHBOARD_PATH.includes("/dashboard/") ? DASHBOARD_PATH.split("/dashboard/")[0] : "";
const SCOPE_PREFIX = PACKAGE_ROOT ? `${PACKAGE_ROOT}/` : "";
const pages = dv.pages("").where((p) => String(p.file.path ?? "").startsWith(SCOPE_PREFIX) && !String(p.file.path ?? "").startsWith(`${SCOPE_PREFIX}Templates/`));
const rows = [];
for (const page of pages) {
  for (const task of (page.file?.tasks ?? [])) {
    if (!task.completed && String(task?.status ?? " ") !== "-" && task.due) rows.push(task);
  }
}
rows.sort((a, b) => String(a.due ?? "").localeCompare(String(b.due ?? "")) || String(a.text ?? "").localeCompare(String(b.text ?? "")));
dv.taskList(rows, false);
```

## Recent Activity
<div class="module-subtitle">Shows up to 20 recent created, completed, and cancelled task events within the package scope.</div>

```dataviewjs
const DASHBOARD_PATH = String(dv.current().file.path ?? "");
const PACKAGE_ROOT = DASHBOARD_PATH.includes("/dashboard/") ? DASHBOARD_PATH.split("/dashboard/")[0] : "";
const SCOPE_PREFIX = PACKAGE_ROOT ? `${PACKAGE_ROOT}/` : "";
const pages = dv.pages("").where((p) => String(p.file.path ?? "").startsWith(SCOPE_PREFIX) && !String(p.file.path ?? "").startsWith(`${SCOPE_PREFIX}Templates/`));
const tasks = [];
for (const page of pages) {
  for (const task of (page.file?.tasks ?? [])) tasks.push(task);
}

function dateKey(value) {
  if (!value) return "";
  if (typeof value === "string") return window.moment(value).isValid() ? window.moment(value).format("YYYY-MM-DD") : String(value).slice(0, 10);
  if (typeof value.toISODate === "function") return value.toISODate();
  const raw = String(value);
  return window.moment(raw).isValid() ? window.moment(raw).format("YYYY-MM-DD") : raw.slice(0, 10);
}

function markerDate(text, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(text).match(new RegExp(`${escaped}\\s*(\\d{4}-\\d{2}-\\d{2})`));
  return match ? match[1] : "";
}

const CANCEL_MARK = "cancel:";
const activity = [];
for (const task of tasks) {
  const text = String(task?.text ?? task?.visual ?? "");
  const created = dateKey(task.created);
  const completion = dateKey(task.completion);
  const cancelled = markerDate(text, CANCEL_MARK);
  if (created) activity.push({ label: "Created", tone: "created", date: created, task });
  if (completion) activity.push({ label: "Completed", tone: "completed", date: completion, task });
  if (String(task?.status ?? " ") === "-" || cancelled) {
    activity.push({ label: "Cancelled", tone: "cancelled", date: cancelled || created, task });
  }
}

const rows = activity
  .filter((item) => item.date)
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 20);

if (!rows.length) {
  dv.el("div", "No recent task activity.", { cls: "task-dashboard-hint" });
} else {
  const board = dv.container.createDiv({ cls: "task-activity-board" });
  rows.forEach((row) => {
    const item = board.createDiv({ cls: "task-activity-row" });
    item.createEl("span", { cls: `task-activity-badge ${row.tone}`.trim(), text: row.label });
    item.createEl("div", {
      cls: `task-activity-text ${row.tone === "cancelled" ? "cancelled" : ""}`.trim(),
      text: String(row.task?.text ?? row.task?.visual ?? "")
    });
    item.createEl("div", { cls: "task-activity-meta", text: row.date });
  });
}
```

## Completed Tasks
<div class="module-subtitle">Shows up to 10 recently completed tasks in the package scope.</div>

```dataviewjs
const DASHBOARD_PATH = String(dv.current().file.path ?? "");
const PACKAGE_ROOT = DASHBOARD_PATH.includes("/dashboard/") ? DASHBOARD_PATH.split("/dashboard/")[0] : "";
const SCOPE_PREFIX = PACKAGE_ROOT ? `${PACKAGE_ROOT}/` : "";
const pages = dv.pages("").where((p) => String(p.file.path ?? "").startsWith(SCOPE_PREFIX) && !String(p.file.path ?? "").startsWith(`${SCOPE_PREFIX}Templates/`));
const rows = [];
for (const page of pages) {
  for (const task of (page.file?.tasks ?? [])) {
    if (task.completed && String(task?.status ?? " ") !== "-") rows.push(task);
  }
}
rows.sort((a, b) => String(b.completion ?? "").localeCompare(String(a.completion ?? "")));
dv.taskList(rows.slice(0, 10), false);
```

## Fixed Task Signal

```dataviewjs
const DASHBOARD_PATH = String(dv.current().file.path ?? "");
const PACKAGE_ROOT = DASHBOARD_PATH.includes("/dashboard/") ? DASHBOARD_PATH.split("/dashboard/")[0] : "";
const DAILY_SCOPE = PACKAGE_ROOT ? `${PACKAGE_ROOT}/Daily Notes` : "Daily Notes";
const today = window.moment().format("YYYY-MM-DD");
const page = dv.page(`${DAILY_SCOPE}/${today}`);
const openFixed = (page?.file?.tasks ?? []).filter((task) => !task.completed && String(task?.status ?? " ") !== "-" && String(task?.text ?? "").includes("#DAILYFIXED")).length;
dv.table(["Open Fixed Tasks"], [[openFixed]]);
```
