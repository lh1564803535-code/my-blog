# 博客使用指南

## 你的博客地址

部署后访问：https://lh1564803535-code.github.io/my-blog/

推送代码到 GitHub 后，GitHub Actions 会自动构建部署，通常 1-2 分钟生效。

---

## 写新文章

在 `src/content/blog/` 目录下新建 `.md` 文件，比如 `my-new-post.md`：

```markdown
---
title: "文章标题"
date: 2026-05-10
tags: ["标签1", "标签2"]
description: "一句话摘要"
---

正文内容，支持 Markdown 语法。
```

保存后推送到 GitHub，新文章就自动上线了。

---

## 删除文章

直接删除对应的 `.md` 文件，推送即可。

---

## 修改个人信息

编辑 `src/content/about/index.md`，修改自我介绍、技能栈、经历时间线。

---

## 修改网站标题/副标题

编辑 `src/layouts/BaseLayout.astro`，搜索 `保持思考` 和 `dalong's blog`，替换成你想要的内容。

---

## 修改社交链接

编辑 `src/layouts/BaseLayout.astro`，搜索 `github.com/lh1564803535-code`，替换成你的链接。

---

## 本地预览

```bash
cd d:\MyProjects\my-blog
pnpm build
npx serve dist -l 4321
```

浏览器打开 http://localhost:4321

---

## 推送到 GitHub 的完整流程

```bash
cd d:\MyProjects\my-blog
git add -A
git commit -m "你的提交信息"
git push
```

推送后 GitHub Actions 自动部署，1-2 分钟后线上生效。

---

## 常用 Git 命令

```bash
# 查看改了什么
git status

# 查看具体改动
git diff

# 撤销未提交的修改
git checkout -- 文件路径

# 提交信息用英文
git commit -m "add: 新文章 xxx"
git commit -m "fix: 修复 xxx"
git commit -m "update: 更新 xxx"
```

---

## 项目结构

```
src/
  content/
    blog/          ← 文章放这里（.md 文件）
    projects/      ← 项目放这里
    about/         ← 关于页内容
  pages/           ← 页面路由
  layouts/         ← 布局模板
  styles/          ← 全局样式
public/            ← 静态资源（图片、favicon）
```

---

## 主题色调

当前是极简文学风（白底 + #2e405b 深蓝灰文字）。

修改配色：编辑 `src/styles/global.css`，搜索 `--color-primary` 修改主色调。
