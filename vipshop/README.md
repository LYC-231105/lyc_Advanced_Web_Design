# 唯品会特卖商城（vipshop）

> 高级网页设计 I 期末试题 —— 手机 APP 模仿与设计（选题：唯品会）
> 作者：梁钰承　学号：24001010817　院校：大连东软信息学院

## 一、项目介绍

本项目以「唯品会」手机 APP 为原型，使用**原生 HTML5 + CSS3 + JavaScript** 完成的移动端电商网站模仿与设计，包含首页、分类、限时秒杀、商品详情、购物车、个人中心、个人设置、登录注册、后台管理共 **9 个页面**（满足不少于 8 个页面要求），覆盖一级页面（首页）、二级页面（分类 / 秒杀）、三级页面（商品详情）、个人设置（我的）、后台管理页面。

所有数据内容通过 **本地 mock 数据接口（JSON 文件）+ fetch 请求** 完成数据内容设计与接口设计；所有图片、样式、脚本资源均为**本地资源**，不依赖任何网络资源与第三方框架。

## 二、技术架构

| 类别 | 说明 |
| ---- | ---- |
| 页面结构 | 原生 HTML5 语义化标签（header / main / nav / section / footer 等） |
| 样式布局 | 原生 CSS3，Flex 弹性布局为主，CSS 变量统一样式，不使用表格布局、float 布局 |
| 交互脚本 | 原生 JavaScript（ES5+），**未使用** Bootstrap / jQuery / Vue / React / Tailwind 等任何第三方库 |
| 数据接口 | 本地 mock：`data/*.json` 共 5 个接口，全部通过 `fetch()` 访问 |
| 数据持久化 | `localStorage` 模拟本地数据库（购物车表、用户表、后台商品表） |
| 图标 | 内联 SVG 矢量图标，无需图标库 |
| 布局选择器命名 | 按规范以姓名拼音 `liang-` 为前缀（如 `liang-main`、`liang-header`、`liang-footer`）；变量、函数与 ID 使用 `liang` / `Liang` 前缀 |

## 三、目录结构

```text
vipshop/
├── index.html          # 首页（一级页面）
├── category.html       # 分类页（二级页面）
├── seckill.html        # 限时秒杀（二级页面）
├── detail.html         # 商品详情（三级页面）
├── cart.html           # 购物车
├── profile.html        # 我的（个人中心）
├── settings.html       # 个人设置
├── login.html          # 登录 / 注册
├── admin.html          # 后台管理页面
├── css/
│   └── liang.css       # 全局公共样式（liang- 前缀布局选择器）
├── js/
│   ├── liang-common.js # 公共脚本（fetch封装/Toast/购物车/返回顶部）
│   ├── index.js / category.js / detail.js / cart.js
│   ├── seckill.js / profile.js / settings.js / login.js / admin.js
├── data/               # 本地 mock 数据接口
│   ├── banners.json    # 接口1：轮播图
│   ├── products.json   # 接口2：商品列表
│   ├── seckill.json    # 接口3：限时秒杀
│   ├── categories.json # 接口4：商品分类
│   └── comments.json   # 接口5：商品评价
├── img/                # 全部图片均为本地资源
└── README.md
```

## 四、安装与运行

推荐通过本地 HTTP 服务器运行，以实际执行 `fetch()` 并读取 5 个 JSON 接口。直接双击 `index.html` 也可预览：仅在 `file://` 协议下使用自动同步的 `js/liang-mock.js` 数据快照，不把 HTTP 接口错误伪装为加载成功：

**方式一：VS Code（推荐）**
1. 用 VS Code 打开 `vipshop` 文件夹；
2. 安装插件 **Live Server**；
3. 在 `index.html` 上右键 → **Open with Live Server**。

**方式二：Python**
```bash
cd vipshop
python -m http.server 8080
# 浏览器访问 http://localhost:8080
```

**方式三：Node.js**
```bash
cd vipshop
npx serve .
# 或 npx http-server -p 8080
```

建议使用 Chrome 开发者工具切换到手机视口（如 iPhone 12 Pro）获得最佳浏览效果；页面同样适配桌面浏览器（居中 420px 手机视口容器）。

## 五、JavaScript 效果清单（14 组）

1. 首页轮播图：自动播放 + 圆点指示 + 触摸滑动切换；
2. 首页与秒杀页倒计时（按接口返回的每日20点结束时间计算，结束后进入下一演示场次）；
3. 首页「猜你喜欢」商品 fetch 渲染 + 关键词搜索过滤；
4. 返回顶部按钮（滚动监听出现/消失，平滑滚动）；
5. 分类页左侧菜单与右侧内容双向联动（点击定位 + 滚动高亮）；
6. 分类页推荐商品搜索过滤；
7. 详情页缩略图点击切换主图；
8. 详情页规格（尺码）单选切换；
9. 详情页购买数量增减（受实际库存及单款99件上限约束，多种规格合并计数）；
10. 加入购物车（localStorage 持久化 + 成功弹层）；
11. 购物车全选/单选联动、数量增减、删除、合计实时计算；
12. 秒杀页整页实时倒计时 + 抢购进度条渲染；
13. 登录/注册：tab 切换、手机号正则校验、验证码 60s 倒计时、个人设置头像本地上传预览（FileReader）、后台商品搜索/新增/删除（localStorage 持久化）。
14. 仅结算购物车勾选商品并保存模拟订单，在个人中心按订单状态查看。

## 六、数据接口说明（≥4 个，fetch 访问）

| 接口 | 文件 | 使用页面 |
| ---- | ---- | ---- |
| 轮播图 | `data/banners.json` | 首页 |
| 商品列表 | `data/products.json` | 首页 / 分类 / 详情 / 后台 |
| 限时秒杀 | `data/seckill.json` | 首页 / 秒杀页 |
| 商品分类 | `data/categories.json` | 分类页 |
| 商品评价 | `data/comments.json` | 详情页 |

## 七、页面清单（共 9 页）

| 页面 | 文件 | 层级 |
| ---- | ---- | ---- |
| 首页 | `index.html` | 一级页面 |
| 分类页 | `category.html` | 二级页面 |
| 限时秒杀 | `seckill.html` | 二级页面 |
| 商品详情 | `detail.html` | 三级页面 |
| 购物车 | `cart.html` | 其他 |
| 我的 | `profile.html` | 个人设置（我的） |
| 个人设置 | `settings.html` | 个人设置（我的） |
| 登录注册 | `login.html` | 其他 |
| 后台管理 | `admin.html` | 后台管理页面 |

## 八、图片资源与官网参考

项目运行时只引用 `vipshop/img/` 中的本地图片。148 张商品样例图片来自 DummyJSON 与 Fake Store API 商品样例网站，站点图标来自唯品会官网，共149份下载资源；没有使用 AI 生成图片。下载地址、来源页面、下载日期与 SHA-256 校验值见 `data/image-sources.json`。商品、售价、库存、评价和登录均为课程模拟数据，不代表唯品会实时商品或正式交易。

2026-10-15 实际访问了 [唯品会官网](https://www.vip.com/) 与 [唯品会手机版](https://m.vip.com/v3/index.html#/)。移动端首页参考其浅粉品牌区、白色搜索框、粉色下划线频道栏、三个特卖入口和“今日特卖”分区，继续保留课程要求的9页结构及分类/后台入口。首页显示4件秒杀商品，同排等宽且图片完整展示，完整秒杀列表通过“更多”进入。没有对应商品的“内衣”分类已删除；网站的登录弹层、营销跳转及真实购买流程未复制到演示项目。

现有51件商品：女装10款、美妆11款、鞋包16款（包含6款包袋）、男装8款、运动11款，运动鞋同时归入鞋包和运动。各分类按商品类型细分栏目，新增商品的图片、规格和详情页均保持关联。本次新增36件商品、95张下载图片，保存在 `img/products/`。

`tools/download_assets.py` 用于重新下载并生成资源清单，`tools/build_mock.py` 用于同步 `file://` 预览快照，`tools/verify.cjs` 用于验证多视口、图片、交互、库存、购物车和本地运行。

## 九、对照作业要求

- 保留9个页面、5个本地JSON接口（通过fetch访问）、原生HTML/CSS/JavaScript、作者姓名和学号，以及姓名拼音前缀。
- Word 中要求的三种典型元素对应：首页商品卡片“上图下文”、购物车“左图右文”、分类页“左右布局与导航”。前两项均有商品图片；页面主要采用Flex与Grid布局。
- 使用本地图片及内联SVG图标，无第三方前端框架，不以带文字截图替代页面结构。
- 登录是表单校验演示，后台是本地管理演示，订单不会支付或发货。HTTP和file预览的存储相互独立。
- 页面检查截图保存在 `docs/screenshots/`，只供查看和实验报告使用，不会作为页面图片加载。
- 原工程已配置Gitee远程地址；本次只修改本地vipshop。仓库公开可访问性、提交发布及Word中要求的正式实验报告/原型对比截图，仍需在交作业前确认或整理。
