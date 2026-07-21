# dalong's blog - Hexo 源项目

这是博客 [dalong's blog](https://lh1564803535-code.github.io/my-blog/) 的 Hexo 源码仓库。

以后写文章只需要新增一篇 Markdown，提交到 GitHub 后，GitHub Actions 会自动构建并发布到 GitHub Pages。

## 目录结构

```text
blog/
|- _config.yml
|- package.json
|- docs/CONTENT_STRATEGY.md
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

本地预览地址默认是 [http://localhost:4000/my-blog/](http://localhost:4000/my-blog/)。

## 内容分类

博客目前建议长期保持 3 个顶层分类：

- 工程实践
- 技术思考
- 生活随记

详细规则见 [docs/CONTENT_STRATEGY.md](C:/Users/lhhaoshuai/Documents/blog/docs/CONTENT_STRATEGY.md)。

## 新建文章

```powershell
npx hexo new post "我的新文章"
```

生成的文件位于 [source/_posts](C:/Users/lhhaoshuai/Documents/blog/source/_posts)。

默认模板已经带了分类提示，你只需要把 `categories` 和 `tags` 改成这篇文章对应的内容即可。

Front matter 示例：

```yaml
---
title: 我的新文章
date: 2026-07-21 10:00:00
categories:
  - 工程实践
tags:
  - SRE
  - Kubernetes
---
```

## 发布流程

写完后执行：

```powershell
git add .
git commit -m "新增文章：我的新文章"
git push
```

推送到 `main` 后，GitHub Actions 会自动发布到：

[https://lh1564803535-code.github.io/my-blog/](https://lh1564803535-code.github.io/my-blog/)

## 常改位置

- 站点标题、描述、URL：[ _config.yml ](C:/Users/lhhaoshuai/Documents/blog/_config.yml)
- 主题标题、GitHub、RSS：[ themes/typography/_config.yml ](C:/Users/lhhaoshuai/Documents/blog/themes/typography/_config.yml)
- 文章内容：[ source/_posts ](C:/Users/lhhaoshuai/Documents/blog/source/_posts)
- 关于页：[ source/about/index.md ](C:/Users/lhhaoshuai/Documents/blog/source/about/index.md)
- 内容结构说明：[ docs/CONTENT_STRATEGY.md ](C:/Users/lhhaoshuai/Documents/blog/docs/CONTENT_STRATEGY.md)
