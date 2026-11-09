> 最新图片修订：2026-11-09 使用内置 imagegen 生成爱达·魔都号，最终素材为 `swiper-imgs/task3/aida.jpg`（1600×900，精确 16:9）。原始生图提示词与当前实现记录见 `swiper-task3-record.html#lyc_0817_generation`；下方历史记录中的原素材路径仍对应旧版。

> 当前实现已更新为三个独立任务卡片，以下为历史对话存档。任务一现为五张照片的独立 cube 验证轮播，任务二拥有独立效果实验轮播，任务三独立提供第六件展品、键盘、调速、护照和纪念证书。共享 #lycSw4、六张照片自测等旧描述对应历史版本。

# Swiper 三关进阶 · 提示词与 AI 对话记录（任务一 / 二 / 三）

> 记录整理：2026-11-09 · lyc_0817 · 整理模型：Claude Opus 5.5
> 作答页面：`swiper-task.html`（底部「三关进阶 · 现场验证与答辩台」可现场演示）· 网页版记录：`swiper-task-record.html`
> 下面的「AI 回答」都是把提示词真实发给 AI（Claude Haiku 5.5）后拿到的原始回答；太长的地方只删去无关段落，并标注「……（略）」。

---

## 任务一 · 提示词工程师：让 AI 听懂需求

**需求拆解**：生成 `new Swiper('#lycSw4', {...})`：① 无缝循环；② 3.2 秒自动翻页，手动操作后不停止；③ 圆点分页器可点击；④ 初始效果为 cube。

### 第 1 轮提示词

> 帮我写一个 Swiper 轮播的初始化代码，容器是 #lycSw4，要能循环播放、自动翻页、下面有小圆点，效果用立方体那种。

### 第 1 轮 AI 回答（节选：JS 部分原文，另附有 HTML 和 CSS）

```js
var lyc_0817_lycSw4 = new Swiper('#lycSw4', {
  loop: true,                     // 循环播放
  effect: 'cube',                 // 立方体翻转效果
  grabCursor: true,
  speed: 800,
  cubeEffect: { shadow: true, slideShadows: true, shadowOffset: 20, shadowScale: 0.94 },
  autoplay: {
    delay: 3000,                  // 每 3 秒自动翻一页
    disableOnInteraction: false,  // 用户拖动后继续自动播放
    pauseOnMouseEnter: true       // 鼠标移上去时暂停
  },
  pagination: {
    el: '#lycSw4 .swiper-pagination',
    clickable: true
  }
});
```

AI 同时给了 CSS `#lycSw4 { width: 300px; height: 300px; }`，以及图片路径为 `img/swiper/1.jpg` 等的 HTML 结构。

**粘进页面验证：不通过。** `delay = 3000`，不是 3.2 秒；鼠标停在轮播上 5 秒，`autoplay.paused = true`，一直不翻页；附带的 CSS 把展台压成 300×300；附带 HTML 里的图片路径在项目中不存在。
截图：`.screenshots/swiper-task/task1-round1-problem.png`
**一句话结论**：第 1 轮 AI 只“猜对了一半”，不能直接采用。

### 第 2 轮提示词

> 你上一版有几处不符合我的需求，我说清楚一点：
> 1. 页面的 HTML 和 CSS 已经写好了，不要动，也不要改宽高、图片路径，我只要一段 `new Swiper('#lycSw4', {...})`，可以直接粘到页面底部的 `<script>` 里。页面里分页器的容器是 `<div class="swiper-pagination" id="lycPag4"></div>`，请直接用 `#lycPag4`。
> 2. 必须是无缝循环 loop。
> 3. 自动翻页间隔是 3.2 秒，也就是 3200 毫秒，不是 3 秒。
> 4. 用户手动拖动、点圆点之后自动播放不能停；鼠标放上去也不要暂停（不要加 pauseOnMouseEnter）。
> 5. 圆点分页器要能点击跳转。
> 6. 初始效果是 cube（立方体），切换速度 800 毫秒。
> 请只给最终可粘贴的 JS，并逐条说明每个需求对应哪个参数。

### 第 2 轮 AI 回答（最终采用）

```js
var lyc_0817_lycSw4 = new Swiper('#lycSw4', {
  loop: true,
  effect: 'cube',
  speed: 800,
  autoplay: { delay: 3200, disableOnInteraction: false },
  pagination: { el: '#lycPag4', clickable: true }
});
```

AI 逐条说明：`loop: true` 负责无缝循环；`autoplay.delay: 3200` 对应 3.2 秒；`disableOnInteraction: false` 让手动操作后不停止（默认值 `true` 会停）；没写 `pauseOnMouseEnter`，它的默认值是 `false`；`pagination.clickable: true` 让圆点可点击；`effect: 'cube'` 和 `speed: 800` 对应初始效果和切换时长。

### 粘进页面验证：通过

点击页面「需求验证面板 → 一键自测」，实测结果如下：

| 需求 | 实测 |
|---|---|
| ① 无缝循环 | 在第 6 张调用 `slideNext()`，来到第 1 张 ✅ |
| ② 3.2 秒，手动后不停 | `delay=3200`、`disableOnInteraction=false`；模拟拖动后 `autoplay.running=true`，4.01 秒后又自动翻页（0.8 秒动画 + 3.2 秒停留）✅ |
| ③ 圆点可点击 | `el=#lycPag4`、`clickable=true`，共 6 个圆点；点第 3 个后 `realIndex=2` ✅ |
| ④ 初始 cube | 页面打开即 `effect='cube'`，容器带 `swiper-cube` 类 ✅ |

截图：`task1-verify-panel.png`、`task1-cube-initial.png`
**一句话结论**：第 2 轮配置粘进页面后，4 项需求全部实测通过。

### 答辩抽问

- **第一版漏掉了哪个需求？** 漏了三个：没说 3.2 秒；没说手动操作后不能停；没说圆点要能点击。另外也没交代分页器 `#lycPag4`，以及“只要 JS、不要动 HTML/CSS”。
- **第二轮怎么“说清楚”的？** 需求逐条编号；写出具体数值（3200 毫秒，不是 3 秒）；把容器写死（`#lycPag4`）；把反面要求也写出来（不要 `pauseOnMouseEnter`）；限定输出范围，并要求逐条说明对应哪个参数。
- **AI 第一次的代码错在哪？** `delay: 3000`；多加了 `pauseOnMouseEnter: true`，鼠标悬停就暂停；附带的 CSS 和 HTML 会破坏现有页面（300×300，图片路径不存在）。`disableOnInteraction: false` 和 `clickable` 是它碰巧猜对的，不能指望下次也猜对。

---

## 任务二 · creative 仿写：课堂没讲，AI 教你

**官方示例**：`swiper/demo/257-effect-creative.html` 中共有 6 种 creative 写法，结构都是 `effect: "creative"` 加 `creativeEffect: { prev, next }`。

### 第 1 次对话

> （贴官方 demo 第 1、6 段配置）……我想加第 7 个按钮「creative 电影墙」，效果要求：上一张缩小、往左移、并且带一点角度；下一张放大、从右边移进来，整体要像电影院选片墙那样能看到旁边的海报。请帮我写 creativeEffect 的配置，并解释一下 translate、rotate、scale 这几个数组/数值分别是什么意思。

AI 回答要点（原文节选）：

- “`prev`：上一张（progress = +1）……`next`：下一张（progress = -1）……Swiper 按 progress 在原样和 `prev`/`next` 之间线性插值。”
- “`next` 在右边时也是缩小的……滑到中间时会从 0.8 左右放大回 1，看起来就是‘放大着移进来’。”
- 配置：`prev: { translate: ["-50%", 0, -150], rotate: [0, 18, -4], scale: 0.82, opacity: 0.75 }`，`next: { translate: ["50%", 0, -150], rotate: [0, -18, 4], scale: 0.82, opacity: 0.75 }`，`limitProgress: 2`。
- “creative 会把所有 slide 叠到同一个位置……所以 `slidesPerView` 对它基本没用。要露出两边……海报只占约 58% 宽……`aspect-ratio: 2 / 3`”。
- “translate `[X, Y, Z]`……写字符串可以用 `%`，相对于 slide 自身的宽或高；Z 只能写数字（px）。rotate 单位是度……scale 1 是原尺寸。”

**我没有照搬的地方**：

1. 展品都是 16:9 横图，裁成 2:3 会切掉主体，字幕条也会对不上。
2. “slidesPerView 没用”这句不准确。源码 `swiper-bundle.js` 第 9280 行显示，creative 在 `centeredSlides` 时会居中 wrapper，所以我改成 slide 宽 62%，加上 `slidesPerView: 'auto'` 和 `centeredSlides: true`。
3. AI 漏了 `speed: 800`，我保留了 800ms。
4. 只给 prev 加角度；next 不转，进场时由小放大；去掉了绕 Z 轴的歪斜。

**最终实现**：

```js
if (lyc_0817_effect === 'creative') {
  lyc_0817_cfg.slidesPerView = 'auto';      // CSS：#lycSw4.lyc_0817_wall .swiper-slide{width:62%}
  lyc_0817_cfg.centeredSlides = true;
  lyc_0817_cfg.creativeEffect = {
    limitProgress: 2,
    prev: { shadow: true, origin: 'right center', translate: ['-72%', 0, -160], rotate: [0, 30, 0], scale: 0.8, opacity: 0.85 },
    next: { shadow: true, origin: 'left center',  translate: ['78%', 0, -100], scale: 0.86 }
  };
}
```

截图：`task2-creative-wall.png`（静止画面）、`task2-creative-moving.png`（切换中间帧）

### 第 2 次对话：实现后追问

> ……1. 在我这套参数里，prev 和 next 的 transform 分别控制什么？切换过程中它们是怎么变化的？2. translate 里的百分号是相对谁计算的？3. 如果老师让我"把卡片改成转 20 度"，我应该改哪个数？

AI 回答（原文节选）：

1. “`prev` 管当前卡左边的卡……往左移自身宽度的 72%，往屏幕里退 160px，以自己的右边缘为轴绕 Y 轴转 30°，缩到 0.8……`next` 管右边的卡……往右移 78%，往里退 100px，缩到 0.86，不旋转……右边的卡进场，progress 从 -1 变到 0，参数从 `next` 的值逐渐恢复原样，也就是一边放大一边移到中间。”
2. “相对 slide 自身的宽度，不是容器宽度……你的 slide 宽 62%，所以 `-72%` 约等于容器宽度的 44.6%。Z 轴不能用百分比。”
3. “把 `prev` 的 `rotate: [0, 30, 0]` 改成 `[0, 20, 0]`……左边的卡转得浅了，梯形透视变弱……左 2 那张从 60° 变成 40°。”

**用自己的话**：prev 管“刚看完、退到左边的那张”：translate 让它往左挪、往后退，rotate 让它像门一样侧过去，scale 让它变小。next 管“排在右边、下一个上场的那张”：先待在右边、先小一点。切换时 Swiper 按进度把当前张慢慢变成 prev 的样子，同时把 next 慢慢变回原样。

### 答辩抽问

- **百分号相对谁？** 相对 slide 自身：X 方向按自身宽度，Y 方向按自身高度。Swiper 把它写在 slide 元素自己的 `transform` 上，CSS translate 的百分比相对元素自身边框盒。Z 方向只能写 px。
- **转 20 度？** 把 `prev.rotate` 的第二个数从 30 改成 20。页面调试台有「一键改成 20 度」按钮，实测 transform 变成 `rotateY(20deg)`。截图：`task2-rotate-20.png`、`task2-debug-panel.png`

---

## 任务三 · 综合创作 + 技术答辩

### ① 第六件展品「爱达·魔都号」

- `swiper-imgs/aida_modu.jpg`：AI 生图，1280×720（16:9）。提示词：`photorealistic aerial photograph of "Adora Magic City" (爱达·魔都号), China's first domestically built large cruise ship, sailing on deep blue ocean at golden hour, 16:9 landscape, cinematic travel photography, no text`
- 4 个演示台都已加入完整的第 6 张 slide（`img` + alt + `.lyc-cap` 标题和简介），实测每个轮播 6 张、6 个圆点。

### ② 新能力：keyboard 键盘控制

**关键对话 1**

> ……页面里一共有 4 个轮播。我想给 #lycSw4 加上「键盘方向键 ← → 切换」的功能，课上没讲过。请给我加了键盘控制之后的完整配置，并解释新加的参数是什么作用。

AI 回答（节选）：

```js
new Swiper('#lycSw4', {
  loop: true, speed: 800, effect: 'cube', grabCursor: true,
  autoplay: { delay: 3200, disableOnInteraction: false },
  pagination: { el: '#lycPag4', clickable: true },
  keyboard: {
    enabled: true,          // 开启键盘控制
    onlyInViewport: true,   // 只有轮播出现在可视区域内时才响应按键
    pageUpDown: false       // 不让 PageUp / PageDown 键切换
  }
});
```

“只想控制 #lycSw4，就只给它加 `keyboard`，其他 3 个不加……用键盘切换后自动播放会继续……光标在 input / textarea 里打字时，Swiper 会忽略方向键。”

**关键对话 2**

> ……如果把 delay 改成 1000，两次自动翻页之间实际要隔多久？……不刷新、不重建实例，怎么在控制台里让新的 delay 立刻生效？

AI 回答（节选）：“大约 1800ms，也就是 delay 1000 加上动画 800……动画结束（触发 `transitionEnd`）后，才开始下一轮 `delay` 倒计时。”

```js
var s = document.querySelector('#lycSw4').swiper;
s.params.autoplay.delay = 1000;
s.autoplay.stop();
s.autoplay.start();
```

截图：`task3-aida-keyboard.png`（按 ← → 后回显“→ (39) → 第 6 张”）、`task3-delay-1000.png`（实测 1.83 秒）

### ③ 答辩四连问

1. **这段代码什么意思？** `keyboard.enabled` 让 ← → 翻页；`onlyInViewport` 让 `#lycSw4` 只在屏幕里时才响应；`pageUpDown: false` 把 PageUp/PageDown 留给页面滚动；`on.keyPress` 在轮播下方回显“最近一次按键 → 第几张”。
2. **AI 第一次哪里不对，我改了什么？** AI 给的 `new Swiper` 没赋值给变量。我的页面换效果时要先 destroy 再 new，照抄的话一换效果键盘就丢了，所以我把 `keyboard` 写进公共配置函数 `lyc_0817_config4()`，实例保存在 `lyc_0817_swiper4`。另外：任务二 AI 建议裁成 2:3 竖图、说 slidesPerView 没用，我改成 62% 宽加 `centeredSlides`，并补回 `speed: 800`；任务一第 1 轮的 3000ms 和 `pauseOnMouseEnter` 在第 2 轮改正。
3. **新参数的作用？** `keyboard.enabled / onlyInViewport / pageUpDown`、`on.keyPress(swiper, keyCode)`（37 是 ←，39 是 →）；任务二新增的 `slidesPerView: 'auto'`、`centeredSlides: true`、`creativeEffect.limitProgress: 2`。
4. **现场把 delay 改成指定值？** 在页面「任务三 · 现场修改 autoplay.delay」输入并应用，或者在控制台改 `params.autoplay.delay` 再 `stop()` + `start()`。预期间隔 ≈ delay + speed，因为动画结束后才重新倒计时。实测：delay=3200 时间隔 4.04 秒；delay=1000 时间隔 1.83 秒。若改成 5000，预期约 5.8 秒。

---

## 提交物

| 文件 | 说明 |
|---|---|
| `swiper-task.html` | 能运行的页面（初始 cube、creative 电影墙、6 件展品、键盘、现场验证与答辩台） |
| `swiper-task-record.html` | 提示词访问入口（网页版） |
| `swiper-task-record.md` | 本文件（GitHub 直接阅读） |
| `swiper-imgs/aida_modu.jpg` | AI 生成的第六件展品图片 |
| `.screenshots/swiper-task/` | 全部验证截图 |
