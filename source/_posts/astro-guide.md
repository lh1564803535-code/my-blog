---
title: 'Astro 框架快速上手指南'
date: 2026-04-28 10:00:00
categories:
  - 工程实践
tags:
  - Astro
  - 前端
  - 教程
---

Astro 是一个现代化的 Web 框架，专注于构建快速、内容驱动的网站。它引入了“岛屿架构”（Islands Architecture），让你只在需要交互的地方加载 JavaScript。

## 为什么选择 Astro？

- 零 JS 默认：页面默认只输出纯 HTML，没有运行时 JS
- 岛屿架构：按需加载交互组件，性能极致
- Content Collections：内置的内容管理，支持 Markdown + Zod 校验
- 多框架支持：可以在同一个项目中混用 React、Vue、Svelte

## 快速开始

### 1. 创建项目

```bash
# 使用 pnpm（推荐）
pnpm create astro@latest my-blog

# 选择模板
# -> Minimal（空模板）
# -> Blog（博客模板）
# -> Portfolio（作品集模板）
```

### 2. 安装依赖

```bash
cd my-blog
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev
# -> Local: http://localhost:4321/
```

## 项目结构

一个典型的 Astro 项目结构如下：

1. `src/pages/` - 文件路由，每个文件对应一个页面
2. `src/components/` - 可复用的组件（`.astro` 格式）
3. `src/layouts/` - 页面布局模板
4. `src/content/` - Markdown/MDX 内容
5. `public/` - 静态资源

## 最佳实践

1. 使用 `client:*` 指令控制 JS 加载：`client:visible` 比 `client:load` 更省性能
2. 用 Content Collections 管理内容：自动校验 frontmatter，类型安全
3. 图片用 `<Image />` 组件：自动优化格式和尺寸

> Astro 的哲学是：Ship less JavaScript, build faster websites. 如果你的网站主要是展示内容，Astro 是目前很合适的选择。
