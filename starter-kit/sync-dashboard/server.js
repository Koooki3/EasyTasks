const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DAILY_FOLDER = path.join(ROOT, "Daily Notes");
const TEMPLATE_PATH = path.join(ROOT, "Templates", "Daily Note Template.md");
const FIXED_CONFIG_PATH = path.join(ROOT, "DOC", "fixed-tasks.json");
const HOST = "127.0.0.1";
const PORT = Number(process.env.EASYTASKS_PORT || 8765);

const TODO_HEADING_RE = /^##\s*(Tasks|To Do)\s*$/i;
const NEW_TASK_HEADING_RE = /^###\s*(New Tasks|Inbox)\s*$/i;
const H2_HEADING_RE = /^##\s+/;
const FIXED_BLOCK_START = "<!-- DAILY_FIXED_TASKS:START -->";
const FIXED_BLOCK_END = "<!-- DAILY_FIXED_TASKS:END -->";
const TASK_LINE_RE = /^(\s*)- \[( |x)\] (.*)$/;
const CREATED_MARK = "->";
const DUE_MARK = "due:";
const DONE_MARK = "done:";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function json(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(payload));
}

function text(res, status, payload, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
  });
  res.end(payload);
}

function dateFromPath(absPath) {
  const rel = path.relative(ROOT, absPath).replace(/\\/g, "/");
  const match = rel.match(/^Daily Notes\/(\d{4}-\d{2}-\d{2})\.md$/);
  return match ? match[1] : "";
}

function extractDate(text, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(text).match(new RegExp(`${escaped}\\s*(\\d{4}-\\d{2}-\\d{2})`, "i"));
  return match ? match[1] : "";
}

function normalizeTags(raw) {
  return String(raw || "")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.startsWith("#") ? item : `#${item}`))
    .join(" ");
}

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || `fixed-${Date.now()}`;
}

function parseTaskLine(line, absPath, lineNo) {
  const match = line.match(TASK_LINE_RE);
  if (!match) return null;
  const body = match[3];
  return {
    path: path.relative(ROOT, absPath).replace(/\\/g, "/"),
    absPath,
    lineNo,
    line,
    checked: match[2] === "x",
    text: body,
    created: extractDate(body, CREATED_MARK),
    due: extractDate(body, DUE_MARK),
    completion: extractDate(body, DONE_MARK),
    fixedId: (body.match(/\[fixed_id::([^\]]+)\]/) || [])[1] || "",
    isFixed: body.includes("#DAILYFIXED"),
    dailyDate: dateFromPath(absPath),
  };
}

async function walkMarkdown(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if ([".git", ".obsidian", "sync-dashboard"].includes(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkMarkdown(abs, out);
      continue;
    }
    if (!entry.name.toLowerCase().endsWith(".md")) continue;
    const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
    if (rel.startsWith("Templates/")) continue;
    out.push(abs);
  }
  return out;
}

async function readAllTasks() {
  const files = await walkMarkdown(ROOT);
  const tasks = [];
  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    const lines = raw.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const task = parseTaskLine(lines[i], file, i + 1);
      if (task) tasks.push(task);
    }
  }
  return tasks.sort((a, b) => a.path.localeCompare(b.path) || a.lineNo - b.lineNo);
}

function priorityScore(task) {
  if (task.text.includes("🔺")) return 3;
  if (task.text.includes("🔶")) return 2;
  if (task.text.includes("🔹")) return 1;
  return 0;
}

function buildMetrics(tasks) {
  const today = todayStr();
  const open = tasks.filter((task) => !task.checked);
  const done = tasks.filter((task) => task.checked);
  const fixedOpen = open.filter((task) => task.isFixed);
  const normalOpen = open.filter((task) => !task.isFixed);
  const dueOpen = open.filter((task) => task.due);
  const overdue = dueOpen.filter((task) => task.due < today);
  const doneToday = done.filter((task) => task.completion === today || task.dailyDate === today).length;
  const createdToday = tasks.filter((task) => task.created === today && !task.isFixed).length;
  return {
    total: tasks.length,
    open: open.length,
    done: done.length,
    fixedOpen: fixedOpen.length,
    normalOpen: normalOpen.length,
    createdToday,
    doneToday,
    dueOpen: dueOpen.length,
    overdue: overdue.length,
  };
}

function sortOpenTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.isFixed !== b.isFixed) return a.isFixed ? -1 : 1;
    if (!!a.due !== !!b.due) return a.due ? -1 : 1;
    if (a.due && b.due && a.due !== b.due) return a.due.localeCompare(b.due);
    const priorityDiff = priorityScore(b) - priorityScore(a);
    if (priorityDiff) return priorityDiff;
    if (a.path !== b.path) return a.path.localeCompare(b.path);
    return a.lineNo - b.lineNo;
  });
}

function sortDoneTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const da = a.completion || a.dailyDate || "";
    const db = b.completion || b.dailyDate || "";
    if (da !== db) return db.localeCompare(da);
    if (a.path !== b.path) return a.path.localeCompare(b.path);
    return b.lineNo - a.lineNo;
  });
}

function applyTemplateVars(template, dateStr) {
  const now = new Date();
  const hh = `${now.getHours()}`.padStart(2, "0");
  const mm = `${now.getMinutes()}`.padStart(2, "0");
  return template
    .replace(/\{\{date:YYYY-MM-DD\}\}/g, dateStr)
    .replace(/\{\{date\}\}/g, dateStr)
    .replace(/\{\{time:HH:mm\}\}/g, `${hh}:${mm}`)
    .replace(/\{\{time\}\}/g, `${hh}:${mm}`);
}

async function ensureDailyFile(dateStr) {
  const abs = path.join(DAILY_FOLDER, `${dateStr}.md`);
  try {
    await fs.access(abs);
    return abs;
  } catch (_) {
    let template = "## Tasks\n\n### New Tasks\n\n## Notes\n";
    try {
      template = await fs.readFile(TEMPLATE_PATH, "utf8");
    } catch (_) {
      // fall back to inline template
    }
    await fs.mkdir(DAILY_FOLDER, { recursive: true });
    await fs.writeFile(abs, applyTemplateVars(template, dateStr), "utf8");
    return abs;
  }
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
    let insertHeadingAt = -1;
    for (let i = todoIndex + 1; i < todoEnd; i += 1) {
      if (lines[i].trim() === FIXED_BLOCK_END) {
        insertHeadingAt = i + 1;
        break;
      }
    }
    if (insertHeadingAt === -1) insertHeadingAt = todoIndex + 1;
    lines.splice(insertHeadingAt, 0, "", "### New Tasks", "");
    headingIndex = insertHeadingAt + 1;
  }

  let insertAt = headingIndex + 1;
  while (insertAt < lines.length && lines[insertAt].trim() === "") insertAt += 1;
  lines.splice(insertAt, 0, taskLine);
  return lines.join("\n");
}

function buildTaskLine({ title, tags, priority, due, created }) {
  const safeTags = normalizeTags(tags);
  const tagPart = safeTags ? `${safeTags} ` : "";
  const priorityPart = priority ? ` ${priority}` : "";
  const duePart = due ? ` ${DUE_MARK} ${due}` : "";
  return `- [ ] ${tagPart}${title}${priorityPart}${duePart} ${CREATED_MARK} ${created}`;
}

async function loadFixedTasks() {
  try {
    const raw = await fs.readFile(FIXED_CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.tasks) ? parsed.tasks : [];
  } catch (_) {
    return [];
  }
}

async function saveFixedTasks(tasks) {
  await fs.mkdir(path.dirname(FIXED_CONFIG_PATH), { recursive: true });
  await fs.writeFile(FIXED_CONFIG_PATH, `${JSON.stringify({ tasks }, null, 2)}\n`, "utf8");
}

function buildFixedBlock(lines) {
  const body = lines.length ? lines.join("\n") : "- [ ] #DAILYFIXED No fixed tasks defined";
  return `${FIXED_BLOCK_START}\n### Daily Fixed Tasks\n\n${body}\n${FIXED_BLOCK_END}`;
}

function upsertFixedBlock(content, block) {
  const blockRe = /<!-- DAILY_FIXED_TASKS:START -->[\s\S]*?<!-- DAILY_FIXED_TASKS:END -->/m;
  if (blockRe.test(content)) return content.replace(blockRe, block);

  const lines = content.split(/\r?\n/);
  const todoIndex = lines.findIndex((line) => TODO_HEADING_RE.test(line.trim()));
  if (todoIndex === -1) {
    lines.unshift("## Tasks", "", block, "", "### New Tasks", "");
    return lines.join("\n");
  }
  lines.splice(todoIndex + 1, 0, "", block, "");
  return lines.join("\n");
}

function fixedLineForTemplate(task) {
  return `- [ ] #DAILYFIXED [fixed_id::${task.id}] ${task.title} ${CREATED_MARK} {{date:YYYY-MM-DD}}`;
}

function fixedLineForDaily(task, dateStr) {
  return `- [ ] #DAILYFIXED [fixed_id::${task.id}] ${task.title} ${CREATED_MARK} ${dateStr}`;
}

async function syncTemplateFromFixedTasks(fixedTasks) {
  let content = "## Tasks\n\n### New Tasks\n\n## Notes\n";
  try {
    content = await fs.readFile(TEMPLATE_PATH, "utf8");
  } catch (_) {
    // keep fallback
  }
  const block = buildFixedBlock(fixedTasks.map(fixedLineForTemplate));
  await fs.mkdir(path.dirname(TEMPLATE_PATH), { recursive: true });
  await fs.writeFile(TEMPLATE_PATH, upsertFixedBlock(content, block), "utf8");
}

async function syncDailyFromFixedTasks(dateStr, fixedTasks) {
  const dailyPath = await ensureDailyFile(dateStr);
  const current = await fs.readFile(dailyPath, "utf8");
  const block = buildFixedBlock(fixedTasks.map((task) => fixedLineForDaily(task, dateStr)));
  await fs.writeFile(dailyPath, upsertFixedBlock(current, block), "utf8");
  return dailyPath;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function getDashboardPayload() {
  const tasks = await readAllTasks();
  const open = sortOpenTasks(tasks.filter((task) => !task.checked));
  const done = sortDoneTasks(tasks.filter((task) => task.checked)).slice(0, 50);
  const ddl = [...open]
    .filter((task) => task.due)
    .sort((a, b) => a.due.localeCompare(b.due) || priorityScore(b) - priorityScore(a));
  return {
    ok: true,
    today: todayStr(),
    root: ROOT,
    metrics: buildMetrics(tasks),
    open,
    ddl,
    done,
  };
}

async function toggleTask(body) {
  const abs = path.join(ROOT, body.path || "");
  const raw = await fs.readFile(abs, "utf8");
  const lines = raw.split(/\r?\n/);
  const index = Number(body.lineNo) - 1;
  if (index < 0 || index >= lines.length) throw new Error("Task line is out of range.");
  if (lines[index] !== body.line) throw new Error("Source line changed. Refresh before retrying.");
  const replacement = body.checked
    ? lines[index].replace("- [ ]", `- [x] ${DONE_MARK} ${todayStr()}`)
    : lines[index].replace("- [x]", "- [ ]").replace(new RegExp(`\\s${DONE_MARK}\\s\\d{4}-\\d{2}-\\d{2}`), "");
  lines[index] = replacement;
  await fs.writeFile(abs, lines.join("\n"), "utf8");
  return { ok: true };
}

async function addTask(body) {
  const title = String(body.title || "").trim();
  const date = String(body.date || "").trim() || todayStr();
  if (!title) throw new Error("Task title is required.");
  const taskLine = buildTaskLine({
    title,
    tags: body.tags,
    priority: body.priority,
    due: body.due,
    created: todayStr(),
  });
  const dailyPath = await ensureDailyFile(date);
  const current = await fs.readFile(dailyPath, "utf8");
  await fs.writeFile(dailyPath, injectTask(current, taskLine), "utf8");
  return { ok: true, path: path.relative(ROOT, dailyPath).replace(/\\/g, "/") };
}

async function addFixedTask(body) {
  const title = String(body.title || "").trim();
  if (!title) throw new Error("Fixed task title is required.");
  const tasks = await loadFixedTasks();
  tasks.push({
    id: slugify(body.id || title),
    title,
    created: todayStr(),
  });
  await saveFixedTasks(tasks);
  await syncTemplateFromFixedTasks(tasks);
  return { ok: true, tasks };
}

async function deleteFixedTask(body) {
  const id = String(body.id || "").trim();
  const tasks = (await loadFixedTasks()).filter((task) => task.id !== id);
  await saveFixedTasks(tasks);
  await syncTemplateFromFixedTasks(tasks);
  return { ok: true, tasks };
}

async function route(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method === "GET" && req.url === "/") {
    const html = await fs.readFile(path.join(__dirname, "index.html"), "utf8");
    return text(res, 200, html, "text/html; charset=utf-8");
  }
  if (req.method === "GET" && req.url === "/api/health") {
    return json(res, 200, { ok: true, root: ROOT, today: todayStr(), port: PORT });
  }
  if (req.method === "GET" && req.url === "/api/dashboard") {
    return json(res, 200, await getDashboardPayload());
  }
  if (req.method === "GET" && req.url === "/api/fixed/list") {
    return json(res, 200, { ok: true, tasks: await loadFixedTasks() });
  }
  if (req.method === "POST" && req.url === "/api/task/toggle") {
    return json(res, 200, await toggleTask(await readBody(req)));
  }
  if (req.method === "POST" && req.url === "/api/task/add") {
    return json(res, 200, await addTask(await readBody(req)));
  }
  if (req.method === "POST" && req.url === "/api/fixed/add") {
    return json(res, 200, await addFixedTask(await readBody(req)));
  }
  if (req.method === "POST" && req.url === "/api/fixed/delete") {
    return json(res, 200, await deleteFixedTask(await readBody(req)));
  }
  if (req.method === "POST" && req.url === "/api/fixed/sync-template") {
    const tasks = await loadFixedTasks();
    await syncTemplateFromFixedTasks(tasks);
    return json(res, 200, { ok: true, tasks });
  }
  if (req.method === "POST" && req.url === "/api/fixed/sync-daily") {
    const body = await readBody(req);
    const date = String(body.date || "").trim() || todayStr();
    const tasks = await loadFixedTasks();
    const file = await syncDailyFromFixedTasks(date, tasks);
    return json(res, 200, { ok: true, path: path.relative(ROOT, file).replace(/\\/g, "/") });
  }
  return json(res, 404, { ok: false, error: "Not found." });
}

const server = http.createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    json(res, 500, { ok: false, error: error.message || String(error) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`EasyTasks dashboard server listening on http://${HOST}:${PORT}`);
});
