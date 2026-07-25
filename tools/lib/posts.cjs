// 共享文章逻辑：CLI 脚本（new/edit/delete-post.cjs）与本地后台（admin-server.cjs）共用
// 仅使用 Node 内置模块，零外部依赖
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..", "..");
const postsDir = path.join(repoRoot, "source", "_posts");

// 固定的三个长期栏目
const CATEGORIES = ["工程实践", "技术思考", "生活随记"];

function ensurePostsDir() {
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function timestamp() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function slugify(rawSlug) {
  const slug = String(rawSlug || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
  if (!slug) {
    const now = new Date();
    return `post-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }
  return slug;
}

function bodyTemplate(category) {
  if (category === "工程实践") {
    return `## 背景\n\n这篇文章要解决什么问题？\n\n## 我做了什么\n\n- \n\n## 遇到的坑\n\n- \n\n## 结果与复盘\n\n- \n`;
  }
  if (category === "技术思考") {
    return `## 我在想什么\n\n这篇文章主要回答什么问题？\n\n## 我的判断\n\n- \n\n## 为什么我这样看\n\n- \n\n## 给未来的自己\n\n- \n`;
  }
  return `## 今天记录什么\n\n- \n\n## 我当下的感受\n\n- \n\n## 这段时间的变化\n\n- \n`;
}

// 去掉字符串两端的引号（front-matter 值可能带引号）
function unquote(value) {
  const v = String(value || "").trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    try {
      return v.startsWith('"') ? JSON.parse(v) : v.slice(1, -1);
    } catch (e) {
      return v.slice(1, -1);
    }
  }
  return v;
}

// 拆分 front-matter 与正文；已知键解析为字段，未知键原样保留在 extra，避免丢数据
function splitFrontMatter(raw) {
  const text = String(raw || "");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta = { title: "", date: "", categories: [], tags: [], extra: [] };
  if (!match) {
    return { meta, body: text };
  }
  const body = text.slice(match[0].length);
  const lines = match[1].split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const kv = line.match(/^([\w-]+):\s?(.*)$/);
    if (kv) {
      const key = kv[1];
      const val = kv[2];
      if (key === "title") { meta.title = unquote(val); i += 1; continue; }
      if (key === "date") { meta.date = val.trim(); i += 1; continue; }
      if (key === "categories" || key === "tags") {
        const arr = [];
        const inline = val.trim();
        if (inline.startsWith("[")) {
          inline.replace(/^\[|\]$/g, "").split(",").forEach((item) => {
            const t = unquote(item);
            if (t) arr.push(t);
          });
          i += 1;
        } else {
          i += 1;
          while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
            const t = unquote(lines[i].replace(/^\s*-\s+/, ""));
            if (t) arr.push(t);
            i += 1;
          }
        }
        meta[key] = arr;
        continue;
      }
      // 未知键：保留本行及其后续缩进/列表行
      meta.extra.push(line);
      i += 1;
      while (i < lines.length && /^\s+\S/.test(lines[i])) {
        meta.extra.push(lines[i]);
        i += 1;
      }
      continue;
    }
    if (line.trim() !== "") meta.extra.push(line);
    i += 1;
  }
  return { meta, body };
}

// 由字段与正文重建完整文档
function buildDoc(meta, body) {
  const m = meta || {};
  let fm = "---\n";
  fm += `title: ${JSON.stringify(m.title || "")}\n`;
  if (m.date) fm += `date: ${m.date}\n`;
  const cats = Array.isArray(m.categories) ? m.categories.filter(Boolean) : [];
  if (cats.length) {
    fm += "categories:\n" + cats.map((c) => `  - ${JSON.stringify(c)}`).join("\n") + "\n";
  } else {
    fm += "categories: []\n";
  }
  const tags = Array.isArray(m.tags) ? m.tags.filter(Boolean) : [];
  if (tags.length) {
    fm += "tags:\n" + tags.map((t) => `  - ${JSON.stringify(t)}`).join("\n") + "\n";
  } else {
    fm += "tags: []\n";
  }
  if (Array.isArray(m.extra) && m.extra.length) {
    fm += m.extra.join("\n") + "\n";
  }
  fm += "---\n";
  // 正文统一成 LF 后再拼接，避免把 CRLF/混合换行写进仓库（与阶段一换行规范化一致）
  const b = String(body == null ? "" : body).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return fm + (/^\n/.test(b) ? b : "\n" + b);
}

// 防路径穿越：文件名必须是纯文件名且以 .md 结尾，且落在 _posts 内
function safePostPath(name) {
  const base = path.basename(String(name || ""));
  if (base !== String(name) || !/^[^\\/]+\.md$/i.test(base)) {
    throw new Error("非法文件名: " + name);
  }
  const full = path.join(postsDir, base);
  const rel = path.relative(postsDir, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("非法路径: " + name);
  }
  return full;
}

function listPosts() {
  ensurePostsDir();
  return fs
    .readdirSync(postsDir)
    .filter((name) => name.toLowerCase().endsWith(".md"))
    .map((name) => {
      const full = path.join(postsDir, name);
      const stat = fs.statSync(full);
      const { meta } = splitFrontMatter(fs.readFileSync(full, "utf8"));
      return {
        name,
        base: name.replace(/\.md$/i, ""),
        title: meta.title || name.replace(/\.md$/i, ""),
        date: meta.date || "",
        categories: meta.categories,
        tags: meta.tags,
        mtime: stat.mtimeMs,
      };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

function readPost(name) {
  const full = safePostPath(name);
  if (!fs.existsSync(full)) throw new Error("文章不存在: " + name);
  return fs.readFileSync(full, "utf8");
}

function writePost(name, content) {
  const full = safePostPath(name);
  // 落盘前统一成 LF，杜绝 CRLF/混合换行进入仓库
  const normalized = String(content == null ? "" : content).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  fs.writeFileSync(full, normalized, "utf8");
  return { name: path.basename(full) };
}

function createPost(input) {
  ensurePostsDir();
  const opts = input || {};
  const title = String(opts.title || "").trim();
  if (!title) throw new Error("标题不能为空");
  const category = CATEGORIES.indexOf(opts.category) !== -1 ? opts.category : CATEGORIES[0];
  let slug = slugify(opts.slug || "");
  let full = path.join(postsDir, `${slug}.md`);
  if (fs.existsSync(full)) {
    slug = `${slug}-${Date.now()}`;
    full = path.join(postsDir, `${slug}.md`);
  }
  const tags = Array.isArray(opts.tags)
    ? opts.tags.map((t) => String(t).trim()).filter(Boolean)
    : String(opts.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  const content = buildDoc(
    { title, date: timestamp(), categories: [category], tags, extra: [] },
    bodyTemplate(category)
  );
  fs.writeFileSync(full, content, "utf8");
  const assetDir = path.join(postsDir, slug);
  if (!fs.existsSync(assetDir)) fs.mkdirSync(assetDir, { recursive: true });
  return { name: `${slug}.md`, slug, filePath: full, assetDir };
}

function deletePost(name) {
  const full = safePostPath(name);
  const base = path.basename(full).replace(/\.md$/i, "");
  const assetDir = path.join(postsDir, base);
  let removedAsset = false;
  if (fs.existsSync(full)) fs.rmSync(full, { force: true });
  if (fs.existsSync(assetDir) && fs.statSync(assetDir).isDirectory()) {
    fs.rmSync(assetDir, { recursive: true, force: true });
    removedAsset = true;
  }
  return { name: path.basename(full), removedAsset };
}

// 保存图片到文章同名配图夹，返回可在正文中引用的文件名
function saveImage(name, filename, buffer) {
  const base = path.basename(safePostPath(name)).replace(/\.md$/i, "");
  const assetDir = path.join(postsDir, base);
  if (!fs.existsSync(assetDir)) fs.mkdirSync(assetDir, { recursive: true });
  const safeName = path.basename(String(filename || "image.png")).replace(/[^\w.\-]/g, "_");
  let target = path.join(assetDir, safeName);
  if (fs.existsSync(target)) {
    const ext = path.extname(safeName);
    target = path.join(assetDir, `${path.basename(safeName, ext)}-${Date.now()}${ext}`);
  }
  fs.writeFileSync(target, buffer);
  return { filename: path.basename(target) };
}

module.exports = {
  repoRoot,
  postsDir,
  CATEGORIES,
  timestamp,
  slugify,
  bodyTemplate,
  splitFrontMatter,
  buildDoc,
  listPosts,
  readPost,
  writePost,
  createPost,
  deletePost,
  saveImage,
};
