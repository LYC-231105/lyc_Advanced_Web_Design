/* ============================================================
   唯品会特卖商城 - 分类页脚本
   24001010817 梁钰承
   JS效果：分类左右联动（点击左侧菜单滚动定位 + 滚动高亮）
          分类关键词过滤推荐商品
   数据接口：data/categories.json / data/products.json
   ============================================================ */

var liangCatNames = [];

/* ---------- 渲染左侧菜单与右侧内容 ---------- */
liangFetchJSON("data/categories.json").then(function (res) {
    var menuEl = document.getElementById("liangCatMenu");
    var contentEl = document.getElementById("liangCatContent");
    liangCatNames = res.data.map(function (c) { return c.name; });

    var menuHtml = "";
    var contentHtml = "";
    res.data.forEach(function (cat, i) {
        menuHtml += "<li data-index='" + i + "' class='" + (i === 0 ? "liang-active" : "") + "'>" + cat.name + "</li>";

        contentHtml += "<section class='liang-category-section' id='liangCatSec" + i + "'>";
        cat.sections.forEach(function (sec) {
            contentHtml += "<h3>" + sec.title + "</h3><ul class='liang-category-grid'>";
            sec.items.forEach(function (item) {
                contentHtml += "<li><img src='" + item.img + "' alt='" + item.name + "'><p>" + item.name + "</p></li>";
            });
            contentHtml += "</ul>";
        });
        contentHtml += "</section>";
    });
    menuEl.innerHTML = menuHtml;
    contentEl.innerHTML = contentHtml;

    /* JS效果5-1：点击左侧菜单，右侧滚动定位到对应区块 */
    menuEl.addEventListener("click", function (e) {
        if (e.target.tagName !== "LI") return;
        var idx = e.target.getAttribute("data-index");
        highlight(idx);
        document.getElementById("liangCatSec" + idx).scrollIntoView({ behavior: "smooth", block: "start" });
    });

    /* JS效果5-2：右侧滚动时反向高亮左侧菜单 */
    var sections = contentEl.querySelectorAll(".liang-category-section");
    contentEl.addEventListener("scroll", function () {
        var current = 0;
        sections.forEach(function (sec, i) {
            if (sec.getBoundingClientRect().top <= 140) current = i;
        });
        highlight(current);
    }, { passive: true });

    function highlight(idx) {
        menuEl.querySelectorAll("li").forEach(function (li) {
            li.classList.toggle("liang-active", li.getAttribute("data-index") == idx);
        });
    }

    /* 支持 index 页金刚区带来的 ?cat=参数 */
    var params = new URLSearchParams(location.search);
    var cat = params.get("cat");
    if (cat) {
        var idx = liangCatNames.indexOf(cat);
        if (idx > 0) {
            menuEl.querySelector("li[data-index='" + idx + "']").click();
        }
        if (document.getElementById("liangCatSearch")) {
            document.getElementById("liangCatSearch").value = cat;
        }
    }
}).catch(function (err) {
    console.error(err);
    liangToast("分类数据加载失败");
});

/* ---------- 分类页推荐商品 + 关键词过滤（JS效果6 搜索） ---------- */
liangFetchJSON("data/products.json").then(function (res) {
    var listEl = document.getElementById("liangCatGoods");
    var searchEl = document.getElementById("liangCatSearch");
    var allGoods = res.data;

    function render(list) {
        if (!list.length) {
            listEl.innerHTML = '<li style="width:100%;text-align:center;color:#999;padding:30px 0">没有找到相关商品~</li>';
            return;
        }
        var html = "";
        list.forEach(function (g) {
            var off = Math.round((1 - g.price / g.marketPrice) * 10);
            html += '<li class="liang-goods-card">'
                + '<a href="detail.html?id=' + g.id + '">'
                + '<img src="' + g.img + '" alt="' + g.brand + '">'
                + (off >= 5 ? '<span class="liang-goods-discount">' + off + '折</span>' : "")
                + '</a>'
                + '<div class="liang-goods-info">'
                + '<p class="liang-goods-brand">' + g.brand + '</p>'
                + '<p class="liang-goods-name">' + g.name + '</p>'
                + '<p class="liang-goods-price"><em>¥</em><strong>' + g.price + '</strong><del>¥' + g.marketPrice + '</del></p>'
                + '</div></li>';
        });
        listEl.innerHTML = html;
    }

    render(allGoods);

    searchEl.addEventListener("input", function () {
        var kw = searchEl.value.trim();
        if (!kw) { render(allGoods); return; }
        render(allGoods.filter(function (g) {
            return g.name.indexOf(kw) > -1 || g.brand.indexOf(kw) > -1 || g.category.indexOf(kw) > -1;
        }));
    });
}).catch(function (err) { console.error(err); });
