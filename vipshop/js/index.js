/* ============================================================
   唯品会特卖商城 - 首页脚本
   24001010817 梁钰承
   JS效果：1.轮播图（自动播放/圆点/触摸滑动）
          2.秒杀倒计时
          3.猜你喜欢商品渲染 + 关键词搜索过滤
   数据接口：data/banners.json / data/seckill.json / data/products.json
   ============================================================ */

/* ---------- JS效果1：轮播图 ---------- */
function liangInitBanner() {
    var listEl = document.getElementById("liangBannerList");
    var dotsEl = document.getElementById("liangBannerDots");

    liangFetchJSON("data/banners.json").then(function (res) {
        var banners = res.data;
        var html = "";
        var dots = "";
        banners.forEach(function (b, i) {
            html += '<li><a class="liang-banner-card" href="' + b.link + '">' +
                '<div class="liang-banner-copy"><small>唯品会 · 品牌特卖</small><h2>' + liangEscape(b.title) +
                '</h2><p>' + liangEscape(b.subtitle) + '</p><span>立即选购 ›</span></div>' +
                '<img src="' + b.img + '" alt="' + liangEscape(b.subtitle) + '"></a></li>';
            dots += "<button type='button' aria-label='切换到第" + (i + 1) + "张轮播' class='" + (i === 0 ? "liang-active" : "") + "'></button>";
        });
        listEl.innerHTML = html;
        dotsEl.innerHTML = dots;

        var index = 0;
        var total = banners.length;
        var timer = null;

        function go(n) {
            index = (n + total) % total;
            listEl.style.transform = "translateX(-" + index * 100 + "%)";
            dotsEl.querySelectorAll("button").forEach(function (dot, i) {
                dot.classList.toggle("liang-active", i === index);
                dot.setAttribute("aria-pressed", String(i === index));
            });
        }

        function autoPlay() {
            stopPlay();
            timer = setInterval(function () { go(index + 1); }, 3000);
        }

        function stopPlay() {
            clearInterval(timer);
        }

        /* 触摸滑动切换 */
        var startX = 0;
        var box = document.getElementById("liangBanner");
        box.addEventListener("touchstart", function (e) {
            startX = e.touches[0].clientX;
            stopPlay();
        }, { passive: true });
        box.addEventListener("touchend", function (e) {
            var diff = e.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 40) {
                go(index + (diff < 0 ? 1 : -1));
            }
            autoPlay();
        }, { passive: true });

        /* 圆点点击切换 */
        dotsEl.addEventListener("click", function (e) {
            if (e.target.tagName === "BUTTON") {
                go(Array.prototype.indexOf.call(dotsEl.children, e.target));
            }
        });

        box.addEventListener("mouseenter", stopPlay);
        box.addEventListener("mouseleave", autoPlay);
        box.addEventListener("focusin", stopPlay);
        box.addEventListener("focusout", autoPlay);
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) stopPlay(); else autoPlay();
        });
        go(0);
        autoPlay();
    }).catch(function (err) {
        console.error(err);
        liangToast("轮播图加载失败，请用本地服务器打开页面");
    });
}

/* ---------- JS效果2：秒杀倒计时 ---------- */
function liangInitSeckill() {
    var hourEl = document.getElementById("liangHour");
    var minuteEl = document.getElementById("liangMinute");
    var secondEl = document.getElementById("liangSecond");
    var labelEl = document.getElementById("liangSeckillLabel");

    function pad(n) { return n < 10 ? "0" + n : "" + n; }

    liangFetchJSON("data/seckill.json").then(function (res) {
        labelEl.textContent = res.hour + "点结束";

        function tick() {
            var now = new Date();
            var end = liangSaleDeadline(res);
            var diff = Math.floor((end - now) / 1000);
            hourEl.textContent = pad(Math.floor(diff / 3600));
            minuteEl.textContent = pad(Math.floor(diff % 3600 / 60));
            secondEl.textContent = pad(diff % 60);
        }
        tick();
        setInterval(tick, 1000);

        /* 渲染秒杀商品 */
        var html = "";
        /* 首页按唯品会首页的横向商品带展示四件，四列均完整落在当前视口内。 */
        res.data.slice(0, 4).forEach(function (item) {
            var percent = Math.min(100, Math.round(item.sold / item.total * 100));
            html += '<li class="liang-seckill-item">'
                + '<a href="detail.html?id=' + item.id + '"><img src="' + item.img + '" alt="' + liangEscape(item.name) + '"><p class="liang-seckill-name">' + liangEscape(item.name) + '</p></a>'
                + '<p class="liang-price"><em>¥</em><strong>' + item.price + '</strong></p>'
                + '<del>¥' + item.originalPrice + '</del>'
                + '<div class="liang-seckill-progress" style="--liang-progress:' + percent + '%">已抢' + percent + '%</div>'
                + '</li>';
        });
        document.getElementById("liangSeckillList").innerHTML = html;
    }).catch(function (err) { console.error(err); });
}

/* ---------- JS效果3：猜你喜欢 + 搜索过滤 ---------- */
function liangInitGoods() {
    var listEl = document.getElementById("liangGoodsList");
    var countEl = document.getElementById("liangGoodsCount");
    var inputEl = document.getElementById("liangSearchInput");
    var btnEl = document.getElementById("liangSearchBtn");
    var allGoods = [];

    function render(list) {
        if (list.length === 0) {
            listEl.innerHTML = '<li style="width:100%;text-align:center;color:#999;padding:30px 0">没有找到相关商品~</li>';
            countEl.textContent = "";
            return;
        }
        listEl.innerHTML = list.map(liangProductCard).join("");
        countEl.textContent = "共" + list.length + "件";
    }

    liangFetchJSON("data/products.json").then(function (res) {
        allGoods = res.data;
        render(allGoods);
    }).catch(function (err) {
        console.error(err);
        liangToast("商品数据加载失败");
    });

    function doSearch() {
        var kw = inputEl.value.trim().toLowerCase();
        if (!kw) {
            render(allGoods);
            return;
        }
        render(allGoods.filter(function (g) {
            return [g.name, g.brand, g.category].join(" ").toLowerCase().indexOf(kw) > -1;
        }));
        listEl.closest("section").scrollIntoView({ behavior: "smooth", block: "start" });
        liangToast(kw ? "搜索：" + kw : "");
    }

    inputEl.addEventListener("input", function () { if (!inputEl.value.trim()) render(allGoods); });
    btnEl.addEventListener("click", doSearch);
    inputEl.addEventListener("keyup", function (e) {
        if (e.key === "Enter") doSearch();
    });
}

liangInitBanner();
liangInitSeckill();
liangInitGoods();
