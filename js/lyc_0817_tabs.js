/**
 * lyc_0817_tabs.js —— 可复用选项卡组件（外部引用）
 *
 * lyc_0817 · 2026-11-02 14:23:14 · DeepSeek-V4.1-Flash
 * 功能：Tab 选项卡切换 —— 通过事件监听（事件委托）绑定选项卡点击；
 *       切换时先【清除所有选项卡的选中状态】，再【设置当前元素的选中状态】，
 *       同步切换对应内容面板。组件按容器复用，页面可同时存在多组选项卡。
 *
 * 复用方式：页面放任意多个 .lyc_0817_tab-panel 结构（.lyc_0817_tab-nav 内
 *           .lyc_0817_tab-item 用 data-tab 指向面板 id），本脚本自动全部初始化。
 */
(function () {
  "use strict";

  /* lyc_0817 · 2026-11-02 14:23:14 · DeepSeek-V4.1-Flash · lyc_0817_initTabs —— 初始化一组选项卡（复用核心函数） */
  function lyc_0817_initTabs(lyc_0817_panel) {
    var lyc_0817_nav = lyc_0817_panel.querySelector(".lyc_0817_tab-nav");
    if (!lyc_0817_nav) return;

    var lyc_0817_items = lyc_0817_nav.querySelectorAll(".lyc_0817_tab-item");

    /* 事件监听：事件委托，点击导航区任意选项卡即触发 */
    lyc_0817_nav.addEventListener("click", function (lyc_0817_e) {
      var lyc_0817_current = lyc_0817_e.target.closest(".lyc_0817_tab-item");
      if (!lyc_0817_current) return; // 点在导航空白处则忽略

      /* 第一步：清除所有选项卡的选中状态（含全部内容面板） */
      lyc_0817_items.forEach(function (lyc_0817_item) {
        lyc_0817_item.classList.remove("lyc_0817_active");
      });
      lyc_0817_panel.querySelectorAll(".lyc_0817_tab-pane").forEach(function (lyc_0817_pane) {
        lyc_0817_pane.classList.remove("lyc_0817_active");
      });

      /* 第二步：设置当前元素的选中状态（选项卡 + 对应面板） */
      lyc_0817_current.classList.add("lyc_0817_active");
      var lyc_0817_target = lyc_0817_panel.querySelector("#" + lyc_0817_current.getAttribute("data-tab"));
      if (lyc_0817_target) lyc_0817_target.classList.add("lyc_0817_active");
    });
  }

  /* lyc_0817 · 2026-11-02 14:23:14 · DeepSeek-V4.1-Flash · 自动初始化 —— 遍历页面所有选项卡容器，体现组件可复用 */
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".lyc_0817_tab-panel").forEach(lyc_0817_initTabs);
  });
})();
