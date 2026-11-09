/* lyc_0817 · 2026-11-09 20:41:48 · GPT-6 · 任务三独立脚本 —— 本地图片展览、Swiper 键盘控制、调速测量、可持久化观展护照。 */
/* lyc_0817 · 2026-11-09 20:53:20 · GPT-6 · 页面集成 —— 闭包隔离任务三状态，避免与任务一、二脚本重名。 */
(function () {
'use strict';
var lyc_0817_items = [
  { id: 'tiangong', name: '天宫空间站', short: '天宫', category: '逐梦九天', text: '三舱构型的太空家园，让探索的目光越过地平线。', credit: '中国载人航天工程办公室', source: 'https://www.cmse.gov.cn/xwzx/202311/t20231128_54733.html' },
  { id: 'fuxing', name: '复兴号动车组', short: '复兴号', category: '驰骋神州', text: '从一座城市到另一座城市，以中国速度连接万家灯火。', credit: '新华网', source: 'https://www.xinhuanet.com/politics/20240614/7425bb6e550f48fa8f20f21188e2ea78/c.html' },
  { id: 'c919', name: 'C919 大飞机', short: 'C919', category: '翱翔蓝天', text: '2023 年完成首次商业飞行，国产大飞机走进日常旅途。', credit: '新华社', source: 'https://www.news.cn/2023-05/28/c_1129651535_2.htm' },
  { id: 'fendouzhe', name: '奋斗者号', short: '奋斗者', category: '探秘深蓝', text: '万米深潜，向着海洋深处的未知世界继续前行。', credit: '中国科学院沈阳分院', source: 'https://syb.cas.cn/xwzx/tpxw/202012/t20201201_5804150.html' },
  { id: 'fast', name: '中国天眼 FAST', short: '天眼', category: '聆听宇宙', text: '五百米口径的银色巨眼，在群山之间倾听星河回响。', credit: '新华社', source: 'https://www.news.cn/photo/2021-12/20/c_1128183060.htm' },
  { id: 'aida', name: '爱达·魔都号', short: '魔都号', category: '扬帆远航', text: '首艘国产大型邮轮，2024 年 1 月 1 日开启商业首航。图片为 AI 生成示意图。', credit: 'AI 生成示意图 · 1600×900', source: 'swiper-task3-record.html#lyc_0817_generation', generated: true }
];
function lyc_0817_el(lyc_0817_id) { return document.getElementById('lyc_0817_' + lyc_0817_id); }
function lyc_0817_number(lyc_0817_n) { return ('0' + lyc_0817_n).slice(-2); }
var lyc_0817_stored = [], lyc_0817_storageAvailable = true;
var lyc_0817_lastAuto = 0, lyc_0817_manualPaused = false, lyc_0817_delayValue = 3200;
var lyc_0817_reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* lyc_0817 · 2026-11-09 20:41:48 · GPT-6 · 护照读取 —— 校验存档格式、去除重复及未知展品，存储不可用时仍可在本次页面收集。 */
try {
  var lyc_0817_saved = JSON.parse(localStorage.getItem('lyc_0817_task3_passport') || '[]');
  if (Array.isArray(lyc_0817_saved)) {
    lyc_0817_stored = lyc_0817_items.map(function (lyc_0817_item) { return lyc_0817_item.id; }).filter(function (lyc_0817_id) { return lyc_0817_saved.indexOf(lyc_0817_id) !== -1; });
  }
} catch (lyc_0817_error) { lyc_0817_storageAvailable = false; }
/* lyc_0817 · 2026-11-09 20:41:48 · GPT-6 · 六件展品结构 —— 每张包含照片、替代文字、标题及简介；缩略图提供直接跳转入口。 */
lyc_0817_el('slides').innerHTML = lyc_0817_items.map(function (lyc_0817_item, lyc_0817_index) {
  return '<div class="swiper-slide"><img src="swiper-imgs/task3/' + lyc_0817_item.id + '.jpg" alt="' + lyc_0817_item.name + (lyc_0817_item.generated ? ' AI 生成示意图，横版 16:9' : '实景照片') + '"><div class="lyc_0817_caption"><p class="lyc_0817_eyebrow">' + lyc_0817_number(lyc_0817_index + 1) + ' / ' + lyc_0817_item.category + '</p><h2>' + lyc_0817_item.name + '</h2><p>' + lyc_0817_item.text + '</p></div></div>';
}).join('');
lyc_0817_el('catalog').innerHTML = lyc_0817_items.map(function (lyc_0817_item, lyc_0817_index) {
  return '<button type="button" data-index="' + lyc_0817_index + '" aria-label="查看' + lyc_0817_item.name + '"><img src="swiper-imgs/task3/' + lyc_0817_item.id + '.jpg" alt=""><b>' + lyc_0817_item.name + '</b><small>' + lyc_0817_number(lyc_0817_index + 1) + ' · ' + lyc_0817_item.category + '</small><span class="lyc_0817_seen" hidden>已盖章</span></button>';
}).join('');
function lyc_0817_clearMeter() {
  lyc_0817_lastAuto = 0;
  lyc_0817_el('measured').textContent = '等待两次连续自动翻页…';
}
function lyc_0817_updateCurrent(lyc_0817_instance) {
  lyc_0817_el('counter').textContent = lyc_0817_number(lyc_0817_instance.realIndex + 1) + ' / 06';
  Array.prototype.forEach.call(lyc_0817_el('catalog').children, function (lyc_0817_button, lyc_0817_index) {
    lyc_0817_button.setAttribute('aria-current', String(lyc_0817_index === lyc_0817_instance.realIndex));
  });
  var lyc_0817_collected = lyc_0817_stored.indexOf(lyc_0817_items[lyc_0817_instance.realIndex].id) !== -1;
  lyc_0817_el('stamp').disabled = lyc_0817_collected;
  lyc_0817_el('stamp').textContent = lyc_0817_collected ? '当前展品已盖章 ✓' : '为「' + lyc_0817_items[lyc_0817_instance.realIndex].short + '」盖章';
}
/* lyc_0817 · 2026-11-09 20:41:48 · GPT-6 · 沿用键盘创新功能 —— 方向键只在展台可见时响应，输入框内不抢按键；按键与页码实时回显。 */
var lyc_0817_swiper = new Swiper('#lyc_0817_exhibition', {
  loop: true, speed: lyc_0817_reduceMotion ? 0 : 800, grabCursor: true,
  autoplay: { delay: 3200, disableOnInteraction: false },
  keyboard: { enabled: true, onlyInViewport: true, pageUpDown: false },
  pagination: { el: '#lyc_0817_pagination', clickable: true },
  navigation: { prevEl: '#lyc_0817_prev', nextEl: '#lyc_0817_next' },
  a11y: { prevSlideMessage: '上一件展品', nextSlideMessage: '下一件展品', paginationBulletMessage: '前往第 {{index}} 件展品', slideLabelMessage: '第 {{index}} 件，共 {{slidesLength}} 件' },
  on: {
    init: function (lyc_0817_instance) { lyc_0817_updateCurrent(lyc_0817_instance); },
    slideChange: function (lyc_0817_instance) { lyc_0817_updateCurrent(lyc_0817_instance); },
    keyPress: function (lyc_0817_instance, lyc_0817_code) {
      lyc_0817_clearMeter();
      lyc_0817_el('key').textContent = '· ' + (lyc_0817_code === 37 ? '←' : '→') + ' → 第 ' + (lyc_0817_instance.realIndex + 1) + ' 件';
    },
    touchStart: lyc_0817_clearMeter,
    autoplay: function () {
      var lyc_0817_now = performance.now();
      if (lyc_0817_lastAuto) lyc_0817_el('measured').textContent = ((lyc_0817_now - lyc_0817_lastAuto) / 1000).toFixed(2) + ' 秒';
      lyc_0817_lastAuto = lyc_0817_now;
    },
    autoplayTimeLeft: function (lyc_0817_instance, lyc_0817_ms, lyc_0817_ratio) {
      if (lyc_0817_manualPaused) return;
      lyc_0817_el('countdown').textContent = lyc_0817_ms > 0 ? (lyc_0817_ms / 1000).toFixed(1) + ' 秒后切换' : '正在切换…';
      lyc_0817_el('progressfill').style.width = Math.max(0, Math.min(100, (1 - lyc_0817_ratio) * 100)) + '%';
    }
  }
});
/* lyc_0817 · 2026-11-09 20:41:48 · GPT-6 · 交互计时与播放 —— 手动翻页、隐藏页面、暂停操作会清空测量基线，避免把非连续自动播放混入结果。 */
lyc_0817_el('catalog').addEventListener('click', function (lyc_0817_event) {
  var lyc_0817_button = lyc_0817_event.target.closest('button[data-index]');
  if (!lyc_0817_button) return;
  lyc_0817_clearMeter();
  lyc_0817_swiper.slideToLoop(Number(lyc_0817_button.dataset.index));
});
['prev', 'next', 'pagination'].forEach(function (lyc_0817_id) { lyc_0817_el(lyc_0817_id).addEventListener('click', lyc_0817_clearMeter); });
document.addEventListener('visibilitychange', lyc_0817_clearMeter);
function lyc_0817_updatePlay() {
  lyc_0817_el('play').textContent = lyc_0817_manualPaused ? '继续导览' : '暂停导览';
  lyc_0817_el('play').setAttribute('aria-pressed', String(lyc_0817_manualPaused));
  if (lyc_0817_manualPaused) lyc_0817_el('countdown').textContent = '已暂停 · 可手动浏览';
}
lyc_0817_el('play').addEventListener('click', function () {
  lyc_0817_manualPaused = !lyc_0817_manualPaused;
  lyc_0817_clearMeter();
  if (lyc_0817_manualPaused) lyc_0817_swiper.autoplay.stop(); else lyc_0817_swiper.autoplay.start();
  lyc_0817_updatePlay();
});
/* lyc_0817 · 2026-11-09 20:41:48 · GPT-6 · 答辩调速 —— 校验范围，修改 delay 并重启计时；尊重用户主动暂停状态。 */
function lyc_0817_applyDelay(lyc_0817_value) {
  if (!isFinite(lyc_0817_value) || lyc_0817_value < 300 || lyc_0817_value > 20000 || lyc_0817_value % 100 !== 0) {
    lyc_0817_el('delayMessage').textContent = '请输入 300—20000 之间、以 100 为步长的毫秒数。'; return;
  }
  lyc_0817_delayValue = lyc_0817_value;
  lyc_0817_el('delay').value = lyc_0817_value;
  lyc_0817_swiper.params.autoplay.delay = lyc_0817_value;
  lyc_0817_swiper.autoplay.stop();
  if (!lyc_0817_manualPaused) lyc_0817_swiper.autoplay.start();
  lyc_0817_clearMeter();
  lyc_0817_el('delayMessage').textContent = '停留 ' + lyc_0817_value + 'ms ＋ 动画 ' + lyc_0817_swiper.params.speed + 'ms，预期间隔约 ' + ((lyc_0817_value + lyc_0817_swiper.params.speed) / 1000).toFixed(1) + ' 秒。' + (lyc_0817_manualPaused ? '继续导览后开始测量。' : '');
}
lyc_0817_el('delayForm').addEventListener('submit', function (lyc_0817_event) { lyc_0817_event.preventDefault(); lyc_0817_applyDelay(Number(lyc_0817_el('delay').value)); });
lyc_0817_el('restore').addEventListener('click', function () { lyc_0817_applyDelay(3200); });
/* lyc_0817 · 2026-11-09 20:41:48 · GPT-6 · 新增观展护照 —— 为当前展品主动盖章、去重保存、六枚完成提示及重置；自动翻页不会替用户盖章。 */
function lyc_0817_renderPassport() {
  lyc_0817_el('stampCount').textContent = '已集齐 ' + lyc_0817_stored.length + ' / 6';
  lyc_0817_el('stamps').innerHTML = lyc_0817_items.map(function (lyc_0817_item, lyc_0817_index) {
    var lyc_0817_has = lyc_0817_stored.indexOf(lyc_0817_item.id) !== -1;
    lyc_0817_el('catalog').children[lyc_0817_index].querySelector('.lyc_0817_seen').hidden = !lyc_0817_has;
    return '<span class="lyc_0817_stamp' + (lyc_0817_has ? ' lyc_0817_collected' : '') + '" aria-label="' + lyc_0817_item.name + (lyc_0817_has ? '已盖章' : '未盖章') + '"><b>' + (lyc_0817_has ? '✓' : lyc_0817_number(lyc_0817_index + 1)) + '</b>' + lyc_0817_item.short + '</span>';
  }).join('');
  lyc_0817_el('passportMessage').textContent = lyc_0817_stored.length === 6 ? '六枚印章已集齐！你已完成大国重器探索之旅。' : lyc_0817_stored.length ? '已留下 ' + lyc_0817_stored.length + ' 枚探索印记，下一站继续出发。' : '第一枚印章，等你点亮。';
  var lyc_0817_unlocked = lyc_0817_stored.length === 6;
  lyc_0817_el('rewardContent').hidden = !lyc_0817_unlocked;
  lyc_0817_el('rewardBadge').textContent = lyc_0817_unlocked ? '已解锁 ✓' : '待解锁 · ' + lyc_0817_stored.length + ' / 6';
  lyc_0817_el('rewardMessage').textContent = lyc_0817_unlocked ? '恭喜获得「大国重器探索官」称号！填写昵称，领取你的专属纪念证书。' : '再收集 ' + (6 - lyc_0817_stored.length) + ' 枚印章，即可解锁探索官称号和可下载的纪念证书。';
  if (!lyc_0817_storageAvailable) lyc_0817_el('storageMessage').textContent = '浏览器存储暂不可用，本次页面内仍可收集印章。';
  lyc_0817_updateCurrent(lyc_0817_swiper);
}
function lyc_0817_savePassport() {
  try { localStorage.setItem('lyc_0817_task3_passport', JSON.stringify(lyc_0817_stored)); } catch (lyc_0817_error) { lyc_0817_storageAvailable = false; }
  lyc_0817_renderPassport();
}
lyc_0817_el('stamp').addEventListener('click', function () {
  var lyc_0817_id = lyc_0817_items[lyc_0817_swiper.realIndex].id;
  if (lyc_0817_stored.indexOf(lyc_0817_id) === -1) lyc_0817_stored.push(lyc_0817_id);
  lyc_0817_savePassport();
});
lyc_0817_el('reset').addEventListener('click', function () { lyc_0817_stored = []; lyc_0817_savePassport(); });
/* lyc_0817 · 2026-11-09 21:11:01 · GPT-6 · 奖励证书下载 —— Canvas 绘制中文昵称、六枚印章与称号；仅在集齐时生成本地 PNG，不依赖网络服务。 */
lyc_0817_el('downloadReward').addEventListener('click', function () {
  if (lyc_0817_stored.length !== 6) return;
  var lyc_0817_name = lyc_0817_el('rewardName').value.trim().slice(0, 12) || '光影探索者';
  var lyc_0817_canvas = document.createElement('canvas');
  lyc_0817_canvas.width = 1600; lyc_0817_canvas.height = 1000;
  var lyc_0817_ctx = lyc_0817_canvas.getContext('2d');
  lyc_0817_ctx.fillStyle = '#f6f8fc'; lyc_0817_ctx.fillRect(0, 0, 1600, 1000);
  lyc_0817_ctx.fillStyle = '#ffffff'; lyc_0817_ctx.fillRect(40, 40, 1520, 920);
  lyc_0817_ctx.strokeStyle = '#d7ae63'; lyc_0817_ctx.lineWidth = 4; lyc_0817_ctx.strokeRect(64, 64, 1472, 872);
  lyc_0817_ctx.strokeStyle = '#dbe4ff'; lyc_0817_ctx.lineWidth = 2; lyc_0817_ctx.strokeRect(82, 82, 1436, 836);
  lyc_0817_ctx.textAlign = 'center'; lyc_0817_ctx.fillStyle = '#1d5bbf';
  lyc_0817_ctx.font = '28px "Microsoft YaHei", sans-serif'; lyc_0817_ctx.fillText('大国重器光影展  ·  专属观展纪念', 800, 155);
  lyc_0817_ctx.fillStyle = '#fff3d9'; lyc_0817_ctx.beginPath(); lyc_0817_ctx.arc(800, 254, 62, 0, Math.PI * 2); lyc_0817_ctx.fill();
  lyc_0817_ctx.fillStyle = '#b5822b'; lyc_0817_ctx.font = '62px serif'; lyc_0817_ctx.fillText('★', 800, 276);
  lyc_0817_ctx.fillStyle = '#0f2b5b'; lyc_0817_ctx.font = 'bold 70px "Microsoft YaHei", sans-serif'; lyc_0817_ctx.fillText('大国重器探索官', 800, 395);
  lyc_0817_ctx.font = '42px "Microsoft YaHei", sans-serif'; lyc_0817_ctx.fillText('授予：' + lyc_0817_name, 800, 493);
  lyc_0817_ctx.fillStyle = '#64748b'; lyc_0817_ctx.font = '27px "Microsoft YaHei", sans-serif';
  lyc_0817_ctx.fillText('你已探索六件大国重器，并集齐全部观展印章。', 800, 563);
  lyc_0817_items.forEach(function (lyc_0817_item, lyc_0817_index) {
    var lyc_0817_x = 300 + lyc_0817_index * 200;
    lyc_0817_ctx.strokeStyle = '#d7ae63'; lyc_0817_ctx.fillStyle = '#fffbea'; lyc_0817_ctx.beginPath(); lyc_0817_ctx.arc(lyc_0817_x, 688, 57, 0, Math.PI * 2); lyc_0817_ctx.fill(); lyc_0817_ctx.stroke();
    lyc_0817_ctx.fillStyle = '#b5822b'; lyc_0817_ctx.font = 'bold 30px "Microsoft YaHei", sans-serif'; lyc_0817_ctx.fillText('✓', lyc_0817_x, 681);
    lyc_0817_ctx.font = '21px "Microsoft YaHei", sans-serif'; lyc_0817_ctx.fillText(lyc_0817_item.short, lyc_0817_x, 717);
  });
  lyc_0817_ctx.fillStyle = '#0f2b5b'; lyc_0817_ctx.font = '28px "Microsoft YaHei", sans-serif'; lyc_0817_ctx.fillText('九天揽月 · 驰骋神州 · 探秘深蓝', 800, 819);
  lyc_0817_ctx.fillStyle = '#94a3b8'; lyc_0817_ctx.font = '20px "Microsoft YaHei", sans-serif'; lyc_0817_ctx.fillText('观展纪念 · 六枚印章全部点亮 · lyc_0817', 800, 875);
  lyc_0817_canvas.toBlob(function (lyc_0817_blob) {
    if (!lyc_0817_blob) { lyc_0817_el('downloadMessage').textContent = '证书生成失败，请重新点击下载。'; return; }
    var lyc_0817_url = URL.createObjectURL(lyc_0817_blob);
    var lyc_0817_link = document.createElement('a'); lyc_0817_link.href = lyc_0817_url; lyc_0817_link.download = '大国重器探索官-纪念证书.png';
    document.body.appendChild(lyc_0817_link); lyc_0817_link.click(); lyc_0817_link.remove();
    setTimeout(function () { URL.revokeObjectURL(lyc_0817_url); }, 10000);
    lyc_0817_el('downloadMessage').textContent = '证书已生成，请在浏览器下载中查看。';
  }, 'image/png');
});
lyc_0817_renderPassport();
if (lyc_0817_reduceMotion) {
  lyc_0817_manualPaused = true; lyc_0817_swiper.autoplay.stop(); lyc_0817_applyDelay(3200); lyc_0817_updatePlay();
}

window.lyc_0817_task3Swiper = lyc_0817_swiper;
})();
