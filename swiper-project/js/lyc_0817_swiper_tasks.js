/* lyc_0817 · 2026-11-09 21:11:01 · GPT-6 · 任务一与任务二 —— 分别初始化，各自拥有状态、分页器与控制区域。 */
'use strict';
/* lyc_0817 · 2026-11-09 21:11:01 · GPT-6 · 任务一 —— 固定 cube 配置，自测只重建任务一实例。 */
var lyc_0817_state = { delay: 3200 };
var lyc_0817_swiper4;
var lyc_0817_meter = { listeners: [] };
function lyc_0817_build4() {
  if (lyc_0817_swiper4) lyc_0817_swiper4.destroy(true, true);
  lyc_0817_swiper4 = new Swiper('#lycSw4', {
    loop: true, effect: 'cube', speed: 800, grabCursor: true,
    autoplay: { delay: 3200, disableOnInteraction: false },
    pagination: { el: '#lycPag4', clickable: true },
    on: { autoplay: function () { lyc_0817_meter.listeners.splice(0).forEach(function (lyc_0817_listener) { lyc_0817_listener(Date.now()); }); } }
  });
}
lyc_0817_build4();
  /* lyc_0817 · 2026-11-09 14:10:00 · Claude Opus 5.5 · 自测工具函数 —— 延时、等待下一次自动翻页、模拟一次鼠标拖动 */
  function lyc_0817_wait(lyc_0817_ms) {
    return new Promise(function (resolve) { setTimeout(resolve, lyc_0817_ms); });
  }
  function lyc_0817_waitAutoplay(lyc_0817_timeout) {
    return new Promise(function (resolve) {
      var lyc_0817_timer = setTimeout(function () { resolve(0); }, lyc_0817_timeout);
      lyc_0817_meter.listeners.push(function (lyc_0817_at) { clearTimeout(lyc_0817_timer); resolve(lyc_0817_at); });
    });
  }
  function lyc_0817_fakeDrag() {
    var lyc_0817_target = lyc_0817_swiper4.slides[lyc_0817_swiper4.activeIndex];
    var lyc_0817_rect = lyc_0817_swiper4.el.getBoundingClientRect();
    var lyc_0817_y = lyc_0817_rect.top + lyc_0817_rect.height / 2;
    var lyc_0817_x = lyc_0817_rect.left + lyc_0817_rect.width * 0.75;
    function lyc_0817_fire(lyc_0817_node, lyc_0817_type, lyc_0817_cx) {
      lyc_0817_node.dispatchEvent(new PointerEvent(lyc_0817_type, {
        bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', isPrimary: true,
        button: 0, buttons: lyc_0817_type === 'pointerup' ? 0 : 1, clientX: lyc_0817_cx, clientY: lyc_0817_y
      }));
    }
    // 像真人一样每 20ms 移动一次，共 8 步，最后松手（瞬间完成的假拖动会让 Swiper 卡在暂停状态，不能代表真实操作）
    return new Promise(function (resolve) {
      var lyc_0817_step = 0;
      lyc_0817_fire(lyc_0817_target, 'pointerdown', lyc_0817_x);
      var lyc_0817_timer = setInterval(function () {
        lyc_0817_step++;
        if (lyc_0817_step <= 8) {
          lyc_0817_fire(document, 'pointermove', lyc_0817_x - lyc_0817_step * 30);
        } else {
          clearInterval(lyc_0817_timer);
          lyc_0817_fire(document, 'pointerup', lyc_0817_x - 240);
          resolve();
        }
      }, 20);
    });
  }

  /* lyc_0817 · 2026-11-09 14:10:00 · Claude Opus 5.5 · 任务一需求验证面板 —— 逐项实测 loop / 3.2 秒 + 手动后不停 / 圆点可点 / cube，并给出一句话结论 */
  function lyc_0817_setCheck(lyc_0817_i, lyc_0817_ok, lyc_0817_detail) {
    var lyc_0817_item = document.querySelectorAll('#lyc_0817_checks .lyc_0817_check')[lyc_0817_i];
    lyc_0817_item.classList.toggle('lyc_0817_ok', lyc_0817_ok);
    lyc_0817_item.classList.toggle('lyc_0817_bad', !lyc_0817_ok);
    lyc_0817_item.querySelector('.lyc_0817_mark').textContent = lyc_0817_ok ? '✓' : '✗';
    lyc_0817_item.querySelector('small').innerHTML = lyc_0817_detail;
    return lyc_0817_ok;
  }
  document.getElementById('lyc_0817_selfTest').addEventListener('click', function () {
    var lyc_0817_btn = this;
    var lyc_0817_results = [];
    var lyc_0817_sw, lyc_0817_p;
    lyc_0817_btn.disabled = true;
    lyc_0817_btn.textContent = '自测中，约 8 秒…';
    document.getElementById('lyc_0817_t1Conclusion').textContent = '一句话结论：自测进行中…';
    lyc_0817_state.delay = 3200;
    lyc_0817_build4('cube');
    lyc_0817_wait(400).then(function () {
      // ④ 初始效果 cube
      lyc_0817_sw = lyc_0817_swiper4;
      lyc_0817_p = lyc_0817_sw.params;
      // 测 ①③④ 时先停掉自动播放，避免自动翻页和脚本翻页撞在一起导致读数不准；测 ② 前再重新启动
      lyc_0817_sw.autoplay.stop();
      lyc_0817_results[3] = lyc_0817_setCheck(3, lyc_0817_p.effect === 'cube' && lyc_0817_sw.el.classList.contains('swiper-cube'),
        'params.effect = <code>' + lyc_0817_p.effect + '</code>，容器 class 含 <code>swiper-cube</code>：' + lyc_0817_sw.el.classList.contains('swiper-cube'));
      // ③ 点击第 3 个圆点
      var lyc_0817_bullets = document.querySelectorAll('#lycPag4 .swiper-pagination-bullet');
      lyc_0817_bullets[2].click();
      return lyc_0817_wait(1100).then(function () {
        lyc_0817_results[2] = lyc_0817_setCheck(2, lyc_0817_p.pagination.clickable === true && lyc_0817_bullets.length === 5 && lyc_0817_sw.realIndex === 2,
          'pagination.el = <code>' + lyc_0817_p.pagination.el + '</code>，clickable = <code>' + lyc_0817_p.pagination.clickable +
          '</code>，圆点 ' + lyc_0817_bullets.length + ' 个；点第 3 个圆点后 realIndex = ' + lyc_0817_sw.realIndex + '（期望 2）');
      });
    }).then(function () {
      // ① 无缝循环：跳到第 5 张再往后翻
      lyc_0817_sw.slideToLoop(4, 0);
      return lyc_0817_wait(150).then(function () {
        var lyc_0817_from = lyc_0817_sw.realIndex;
        lyc_0817_sw.slideNext();
        return lyc_0817_wait(1100).then(function () {
          lyc_0817_results[0] = lyc_0817_setCheck(0, lyc_0817_p.loop === true && lyc_0817_from === 4 && lyc_0817_sw.realIndex === 0,
            'loop = <code>' + lyc_0817_p.loop + '</code>；在第 ' + (lyc_0817_from + 1) + ' 张（最后一张）调用 slideNext() 后来到第 ' + (lyc_0817_sw.realIndex + 1) + ' 张（期望第 1 张）');
        });
      });
    }).then(function () {
      // ② 重新启动自动播放，300ms 后模拟一次手动拖动，再等下一次自动翻页
      lyc_0817_sw.autoplay.start();
      var lyc_0817_before, lyc_0817_after, lyc_0817_dragAt;
      return lyc_0817_wait(300).then(function () {
        lyc_0817_before = lyc_0817_sw.realIndex;
        return lyc_0817_fakeDrag();
      }).then(function () {
        lyc_0817_dragAt = Date.now();
        lyc_0817_after = lyc_0817_sw.realIndex;
        return lyc_0817_waitAutoplay(6000);
      }).then(function (lyc_0817_at) {
        var lyc_0817_cost = lyc_0817_at ? lyc_0817_at - lyc_0817_dragAt : 0;
        lyc_0817_results[1] = lyc_0817_setCheck(1, lyc_0817_p.autoplay.delay === 3200 && lyc_0817_p.autoplay.disableOnInteraction === false &&
            lyc_0817_sw.autoplay.running && lyc_0817_at > 0,
          'autoplay.delay = <code>' + lyc_0817_p.autoplay.delay + '</code>，disableOnInteraction = <code>' + lyc_0817_p.autoplay.disableOnInteraction +
          '</code>；模拟拖动（第 ' + (lyc_0817_before + 1) + ' → ' + '第 ' + (lyc_0817_after + 1) + ' 张）后 autoplay.running = ' + lyc_0817_sw.autoplay.running +
          (lyc_0817_at ? '，拖动后 ' + (lyc_0817_cost / 1000).toFixed(2) + ' 秒又自动翻了一页（800ms 拖动动画 + 3200ms 停留）' : '，6 秒内没有自动翻页'));
      });
    }).then(function () {
      var lyc_0817_pass = lyc_0817_results.filter(Boolean).length;
      document.getElementById('lyc_0817_t1Conclusion').textContent = lyc_0817_pass === 4
        ? '一句话结论：4 项需求实测全部通过——第 2 轮配置粘进页面后，cube 初始效果、无缝循环、可点击圆点、3.2 秒自动翻页且拖动后不停，全部符合要求。'
        : '一句话结论：' + lyc_0817_pass + ' / 4 项通过，请查看标红的项目。';
      lyc_0817_btn.disabled = false;
      lyc_0817_btn.textContent = '▶ 再测一次';
    });
  });

/* lyc_0817 · 2026-11-09 21:11:01 · GPT-6 · 任务二 —— 独立效果切换、保留当前展品、旋转参数实验；不绑定任务三键盘和计时事件。 */
(function () {
  var lyc_0817_instance, lyc_0817_angle = 30;
  var lyc_0817_container = document.getElementById('lyc_0817_task2Swiper');
  function lyc_0817_build(lyc_0817_effect) {
    var lyc_0817_index = lyc_0817_instance ? lyc_0817_instance.realIndex : 0;
    if (lyc_0817_instance) lyc_0817_instance.destroy(true, true);
    lyc_0817_container.classList.toggle('lyc_0817_wall', lyc_0817_effect === 'creative');
    var lyc_0817_config = {
      loop: true, effect: lyc_0817_effect, speed: 800, grabCursor: true, initialSlide: lyc_0817_index,
      // lyc_0817 · 2026-11-09 21:29:37 · GPT-6 · 对齐原版效果台 —— 保留 3.2 秒停留，手动操作后继续自动播放，切换效果时一并重建。
      autoplay: { delay: 3200, disableOnInteraction: false },
      pagination: { el: '#lyc_0817_task2Pagination', clickable: true }
    };
    if (lyc_0817_effect === 'creative') {
      lyc_0817_config.slidesPerView = 'auto';
      lyc_0817_config.centeredSlides = true;
      lyc_0817_config.creativeEffect = {
        limitProgress: 2,
        prev: { shadow: true, origin: 'right center', translate: ['-72%', 0, -160], rotate: [0, lyc_0817_angle, 0], scale: 0.8, opacity: 0.85 },
        next: { shadow: true, origin: 'left center', translate: ['78%', 0, -100], scale: 0.86 }
      };
    }
    lyc_0817_instance = new Swiper(lyc_0817_container, lyc_0817_config);
    window.lyc_0817_task2Instance = lyc_0817_instance;
    document.querySelectorAll('#lyc_0817_task2 .lyc-fx button').forEach(function (lyc_0817_button) {
      lyc_0817_button.classList.toggle('lyc-on', lyc_0817_button.dataset.fx === lyc_0817_effect);
      lyc_0817_button.setAttribute('aria-pressed', String(lyc_0817_button.dataset.fx === lyc_0817_effect));
    });
    document.getElementById('lyc_0817_creativeOut').textContent = lyc_0817_effect === 'creative'
      ? '当前效果：creative 电影墙\n上一张：左移 72%，缩小为 0.8 倍，Y 轴旋转 ' + lyc_0817_angle + ' 度。\n下一张：在右侧 78% 的位置以 0.86 倍大小等待，进场时恢复原大小。\n实际配置：\n' + JSON.stringify(lyc_0817_instance.params.creativeEffect, null, 2)
      : '当前效果：' + lyc_0817_effect + '。点击 creative 电影墙，或应用下方角度参数，可继续实验。';
  }
  document.querySelectorAll('#lyc_0817_task2 .lyc-fx button').forEach(function (lyc_0817_button) {
    lyc_0817_button.addEventListener('click', function () { lyc_0817_build(lyc_0817_button.dataset.fx); });
  });
  function lyc_0817_applyAngle(lyc_0817_value) {
    if (!isFinite(lyc_0817_value) || Math.abs(lyc_0817_value) > 180) {
      document.getElementById('lyc_0817_creativeOut').textContent = '请输入 -180 到 180 之间的角度。'; return;
    }
    lyc_0817_angle = lyc_0817_value;
    document.getElementById('lyc_0817_rotateInput').value = lyc_0817_value;
    lyc_0817_build('creative');
  }
  document.getElementById('lyc_0817_rotateApply').addEventListener('click', function () { lyc_0817_applyAngle(Number(document.getElementById('lyc_0817_rotateInput').value)); });
  document.getElementById('lyc_0817_rotate20').addEventListener('click', function () { lyc_0817_applyAngle(20); });
  // lyc_0817 · 2026-11-09 21:29:37 · GPT-6 · 默认效果 —— 任务二沿用原版 slide 起始效果；任务一仍按作业要求使用 cube。
  lyc_0817_build('slide');
})();
