# AGENTS.md

## 文档语言约定
- 所有说明文字、检查条目统一使用简体中文；文件路径、HTML、CSS、JS 标识符保留英文原文。本项目内生成的所有文档、检查清单均遵守此约定。

## HTML / JS 注释规则
- 新建 HTML 文件时必须加入注释，尤其是 JS 部分代码的主要功能实现处；独立放在 `js/` 下的外部脚本，同样要在文件头部与主要功能块加注释。
- 注释内容包括：`lyc_0817`（作者标识）、时间（yyyy-MM-dd HH:mm:ss）、使用模型、功能名称及简介。
- JS 主功能块的注释格式示例：
```js
/* lyc_0817 · 2026-11-02 14:23:14 · DeepSeek-V4.1-Flash · 功能名称 —— 功能简介 */
```

## 项目
- 根目录是一套纯 HTML/CSS/JS 静态项目；主应用为 `vipshop/`（唯品会移动端商城仿站）。
- 根目录没有 package.json；无任何依赖（无 npm/构建工具链），全部为纯静态文件。

## 运行 / 调试（高价值信息）
- 必须通过 HTTP 访问，`fetch()` 才能加载 `vipshop/data/*.json`（file:// 协议下使用 `vipshop/js/liang-mock.js` 兜底数据）。
- 在 `vipshop/` 目录下运行：`python -m http.server 8080` 或 `npx serve .` / `npx http-server -p 8080`；也可以用 VS Code Live Server 打开 `vipshop/index.html`。
- 请用移动端视口查看（如 iPhone 12 Pro）；页面在 ~420px 容器中居中显示。

## 关键约定（仓库专属）
- 命名：布局类选择器以 `liang-` 前缀（如 `liang-main`、`liang-header`），变量/函数/id 以 `liang`/`Liang` 前缀。
- CSS：以 Flexbox 为主，使用 CSS 变量，禁用 table/float 布局。全局样式在 `vipshop/css/liang.css`。
- JS：原生 ES5+，不用框架。公共工具在 `vipshop/js/liang-common.js`（fetch 封装/Toast/购物车/返回顶部）。各页面脚本：`index.js`、`category.js`、`seckill.js`、`detail.js`、`cart.js`、`profile.js`、`settings.js`、`login.js`、`admin.js`。
- 资源：全部本地化在 `vipshop/img/`，图标为内联/SVG 或 `vipshop/img/icons/` 本地文件，禁止外部 CDN。
- 数据：`vipshop/data/` 下 5 个本地 JSON，通过 `fetch()` 加载；持久化用 `localStorage`（购物车/用户/管理员商品）。订单为模拟数据（无支付/物流）。
- 页面清单：9 个页面（index/category/seckill/detail/cart/profile/settings/login/admin），共 51 个商品，覆盖多个分类。

## 易错点
- file:// 与 http:// 走不同数据路径（mock 快照），两种协议的 localStorage 不互通。
- 底部导航/图标状态用 CSS filter 实现；图标可能替换为 iconfont SVG。
- 库存与限购在 cart/detail 逻辑中校验（如单品限购数量）。
- 工具脚本：`vipshop/tools/download_assets.py`（刷新资源/清单）、`vipshop/tools/build_mock.py`（同步 file:// 快照）、`vipshop/tools/verify.cjs`（检查脚本）。

## 快速开始
```bash
cd vipshop
python -m http.server 8080  # http://localhost:8080
```
