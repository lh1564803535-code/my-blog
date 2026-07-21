const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { spawn } = require("child_process");

const repoRoot = path.join(__dirname, "..");
const postsDir = path.join(repoRoot, "source", "_posts");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || index === process.argv.length - 1) {
    return "";
  }
  return process.argv[index + 1];
}

function resolveSlug(rawSlug) {
  const slug = rawSlug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
  if (!slug) {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `post-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }
  return slug;
}

function yamlQuote(value) {
  return JSON.stringify(value);
}

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function bodyTemplate(category) {
  if (category === "工程实践") {
    return `## 背景

这篇文章要解决什么问题？

## 我做了什么

- 

## 遇到的坑

- 

## 结果与复盘

- 
`;
  }

  if (category === "技术思考") {
    return `## 我在想什么

这篇文章主要回答什么问题？

## 我的判断

- 

## 为什么我这样看

- 

## 给未来的自己

- 
`;
  }

  return `## 今天记录什么

- 

## 我当下的感受

- 

## 这段时间的变化

- 
`;
}

function openFile(filePath) {
  spawn("powershell", ["-NoProfile", "-Command", `Start-Process -LiteralPath '${filePath.replace(/'/g, "''")}'`], {
    cwd: repoRoot,
    detached: true,
    stdio: "ignore",
  }).unref();
}

async function main() {
  const argTitle = getArg("--title").trim();
  const argCategory = getArg("--category").trim();
  const argTags = getArg("--tags").trim();
  const argSlug = getArg("--slug").trim();

  console.log("");
  console.log("=== 新建博客文章 ===");
  console.log("");

  const title = argTitle || (await ask("文章标题: ")).trim();
  if (!title) {
    console.log("标题不能为空。");
    process.exit(1);
  }

  const categoryMap = {
    "1": "工程实践",
    "2": "技术思考",
    "3": "生活随记",
    "工程实践": "工程实践",
    "技术思考": "技术思考",
    "生活随记": "生活随记",
  };

  let choice = argCategory;
  if (!choice) {
    console.log("");
    console.log("选择分类：");
    console.log("1. 工程实践");
    console.log("2. 技术思考");
    console.log("3. 生活随记");
    choice = (await ask("输入 1 / 2 / 3（默认 1）: ")).trim();
  }

  const category = categoryMap[choice] || "工程实践";

  const tagInput = argTags || (await ask("标签（英文逗号分隔，可留空）: ")).trim();
  const slugInput = argSlug || (await ask("文章网址别名 slug（建议英文，可留空）: ")).trim();
  let slug = resolveSlug(slugInput);
  let filePath = path.join(postsDir, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    slug = `${slug}-${Date.now()}`;
    filePath = path.join(postsDir, `${slug}.md`);
  }

  const tags = tagInput
    ? tagInput.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  const tagBlock = tags.length
    ? tags.map((item) => `  - ${yamlQuote(item)}`).join("\n")
    : "  []";
  const content = `---
title: ${yamlQuote(title)}
date: ${timestamp()}
categories:
  - ${yamlQuote(category)}
tags:
${tagBlock}
---

${bodyTemplate(category)}`;

  fs.writeFileSync(filePath, content, "utf8");
  rl.close();

  console.log("");
  console.log("文章已创建：");
  console.log(filePath);
  console.log("");

  openFile(filePath);
  console.log("文件已经帮你打开。写完后，双击“发布博客.cmd”即可上线。");
}

main().catch((error) => {
  rl.close();
  console.error(error);
  process.exit(1);
});
