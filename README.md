# dalong's blog - Hexo 源项目

这是博客 [dalong's blog](https://lh1564803535-code.github.io/my-blog/) 的 Hexo 源码仓库。

以后写文章只需要新增一篇 Markdown，然后提交到 GitHub；GitHub Actions 会自动构建并发布到 GitHub Pages。

## 目录结构

```text
blog/
|- _config.yml
|- package.json
|- source/
|  |- _posts/
|  |- about/index.md
|- themes/typography/
`- .github/workflows/deploy.yml
```

## 本地使用

```powershell
npm install
npm run build
npm run server
```

本地预览地址默认是 `http://localhost:4000/my-blog/`。

## 新建文章

```powershell
npx hexo new post "我的新文章"
```

生成的文件位于 `source/_posts/`。Front matter 示例：

```yaml
---
title: 我的新文章
date: 2026-07-21 10:00:00
categories:
  - 技术
tags:
  - Hexo
  - 前端
---
```

## 部署方式

仓库使用 GitHub Actions 部署 Pages。

1. 把仓库推到 GitHub。
2. 进入仓库 `Settings -> Pages`。
3. 把 `Source` 改成 `GitHub Actions`。
4. 之后每次 push 到 `main` 都会自动发布。

## 常改位置

- 站点标题、描述、URL：`_config.yml`
- 主题标题、GitHub、RSS：`themes/typography/_config.yml`
- 文章内容：`source/_posts/`
- 关于页：`source/about/index.md`
