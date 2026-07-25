// 博客可视化后台：零外部依赖的本地 HTTP 服务，全部逻辑复用 tools/lib/posts.cjs
// 仅监听 127.0.0.1；关闭窗口即停止。发布走现有 publish-blog.cjs（git add/commit/push -> GitHub Actions）
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const crypto = require("crypto");
const posts = require("./lib/posts.cjs");

const HOST = "127.0.0.1";
const PORT = Number(process.env.ADMIN_PORT || 4777);
const adminDir = path.join(__dirname, "admin");
const repoRoot = posts.repoRoot;

// 每次启动生成一次性管理令牌，注入首页；所有写操作必须回带该令牌（自定义头）
// 这可拦住 CSRF：跨站表单无法设置自定义头，跨站 fetch 带自定义头会触发预检而被浏览器拦下
const TOKEN = crypto.randomBytes(24).toString("hex");

function isWriteMethod(m) {
  return m === "POST" || m === "PUT" || m === "DELETE";
}

// 写操作准入校验：令牌 + Origin + Sec-Fetch-Site 三重防护
function checkWrite(req) {
  if (req.headers["x-admin-token"] !== TOKEN) return false;
  const origin = req.headers["origin"];
  if (origin && origin !== `http://${HOST}:${PORT}` && origin !== `http://localhost:${PORT}`) return false;
  const site = req.headers["sec-fetch-site"];
  if (site && site !== "same-origin" && site !== "none") return false;
  return true;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

// 防点击劫持：后台页面禁止被任何站点以 iframe 嵌入
const FRAME_HEADERS = {
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
};

function sendJson(res, code, obj) {
  const body = Buffer.from(JSON.stringify(obj), "utf8");
  res.writeHead(code, Object.assign({ "Content-Type": "application/json; charset=utf-8", "Content-Length": body.length }, FRAME_HEADERS));
  res.end(body);
}

function sendText(res, code, text, type) {
  const body = Buffer.from(text, "utf8");
  res.writeHead(code, Object.assign({ "Content-Type": type || "text/plain; charset=utf-8", "Content-Length": body.length }, FRAME_HEADERS));
  res.end(body);
}

function serveStatic(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendText(res, 404, "Not Found");
      return;
    }
    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, Object.assign({ "Content-Type": type, "Content-Length": data.length }, FRAME_HEADERS));
    res.end(data);
  });
}

function readBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limitBytes) {
        reject(new Error("请求体过大"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function readJson(req) {
  const buf = await readBody(req, 25 * 1024 * 1024);
  if (!buf.length) return {};
  return JSON.parse(buf.toString("utf8"));
}

function gitStatus() {
  try {
    const r = spawnSync("git", ["status", "--porcelain"], { cwd: repoRoot, encoding: "utf8" });
    const lines = (r.stdout || "").split(/\r?\n/).filter(Boolean);
    return { changes: lines.length, dirty: lines.length > 0 };
  } catch (e) {
    return { changes: 0, dirty: false, error: String(e) };
  }
}

async function handleApi(req, res, url) {
  const pathname = url.pathname;
  const method = req.method;
  try {
    if (isWriteMethod(method) && !checkWrite(req)) {
      return sendJson(res, 403, { ok: false, error: "禁止：无效的管理令牌或来源（防跨站请求）" });
    }
    if (pathname === "/api/posts" && method === "GET") {
      return sendJson(res, 200, { categories: posts.CATEGORIES, posts: posts.listPosts(), git: gitStatus() });
    }
    if (pathname === "/api/post" && method === "GET") {
      const name = url.searchParams.get("name");
      const content = posts.readPost(name);
      const parsed = posts.splitFrontMatter(content);
      return sendJson(res, 200, { name, content, meta: parsed.meta, body: parsed.body });
    }
    if (pathname === "/api/post" && method === "POST") {
      const body = await readJson(req);
      const result = posts.createPost(body);
      return sendJson(res, 200, { ok: true, name: result.name, slug: result.slug });
    }
    if (pathname === "/api/post" && method === "PUT") {
      const body = await readJson(req);
      let content = body.content;
      if (body.meta) {
        if (!String(body.meta.title || "").trim()) {
          return sendJson(res, 400, { ok: false, error: "标题不能为空" });
        }
        content = posts.buildDoc(body.meta, body.body != null ? body.body : "");
      }
      posts.writePost(body.name, content);
      return sendJson(res, 200, { ok: true });
    }
    if (pathname === "/api/post" && method === "DELETE") {
      const name = url.searchParams.get("name");
      const r = posts.deletePost(name);
      return sendJson(res, 200, { ok: true, removedAsset: r.removedAsset });
    }
    if (pathname === "/api/upload" && method === "POST") {
      const body = await readJson(req);
      const raw = String(body.dataBase64 || "").replace(/^data:[^;]+;base64,/, "");
      const buf = Buffer.from(raw, "base64");
      const r = posts.saveImage(body.name, body.filename, buf);
      return sendJson(res, 200, { ok: true, filename: r.filename });
    }
    if (pathname === "/api/publish" && method === "POST") {
      const r = spawnSync("node", [path.join(__dirname, "publish-blog.cjs")], { cwd: repoRoot, encoding: "utf8" });
      const out = (r.stdout || "") + (r.stderr || "");
      const ok = r.status === 0;
      // 失败时把脚本输出的最后几行透传给页面，避免只显示无意义的状态码
      const tail = out.split(/\r?\n/).filter(Boolean).slice(-3).join("；");
      return sendJson(res, 200, { ok, code: r.status, output: out, error: ok ? undefined : ("发布失败：" + (tail || ("退出码 " + r.status))) });
    }
    if (pathname === "/api/preview" && method === "POST") {
      spawn("node", [path.join(__dirname, "preview-blog.cjs")], { cwd: repoRoot, detached: true, stdio: "ignore" }).unref();
      return sendJson(res, 200, { ok: true, url: "http://localhost:4000/my-blog/" });
    }
    if (pathname === "/api/git" && method === "GET") {
      return sendJson(res, 200, gitStatus());
    }
    return sendJson(res, 404, { ok: false, error: "未知接口" });
  } catch (err) {
    return sendJson(res, 400, { ok: false, error: String(err && err.message ? err.message : err) });
  }
}

const server = http.createServer((req, res) => {
  // 防 DNS 重绑定（对齐 Jupyter 的做法）：只接受本机 Host 访问
  const reqHost = String(req.headers.host || "");
  if (reqHost !== `${HOST}:${PORT}` && reqHost !== `localhost:${PORT}`) {
    sendText(res, 403, "Forbidden");
    return;
  }
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url);
    return;
  }
  let rel = url.pathname === "/" ? "/index.html" : url.pathname;
  rel = rel.replace(/\.\.+/g, "");
  const filePath = path.join(adminDir, rel);
  if (!filePath.startsWith(adminDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }
  if (rel === "/index.html") {
    fs.readFile(filePath, "utf8", (err, html) => {
      if (err) { sendText(res, 404, "Not Found"); return; }
      sendText(res, 200, html.replace(/__ADMIN_TOKEN__/g, TOKEN), "text/html; charset=utf-8");
    });
    return;
  }
  serveStatic(res, filePath);
});

server.listen(PORT, HOST, () => {
  console.log("");
  console.log("=== 博客可视化后台已启动 ===");
  console.log(`请在浏览器打开： http://${HOST}:${PORT}/`);
  console.log("（仅本机可访问；关闭此窗口即停止后台）");
  console.log("");
  if (process.env.ADMIN_OPEN === "1") {
    try {
      spawn("cmd", ["/c", "start", "", `http://${HOST}:${PORT}/`], { detached: true, stdio: "ignore" }).unref();
    } catch (e) {
      // 打开浏览器失败不影响服务本身
    }
  }
});
