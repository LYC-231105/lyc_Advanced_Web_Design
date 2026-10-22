/* 分类页：24001010817 梁钰承。分类图、名称与详情链接共用商品 id。 */
Promise.all([liangFetchJSON("data/categories.json"), liangFetchJSON("data/products.json")])
    .then(function (results) {
        var categories = results[0].data;
        var products = results[1].data;
        var menuEl = document.getElementById("liangCatMenu");
        var contentEl = document.getElementById("liangCatContent");
        var listEl = document.getElementById("liangCatGoods");
        var searchEl = document.getElementById("liangCatSearch");
        var params = new URLSearchParams(location.search);
        function matches(g, word) {
            return [g.name, g.brand, g.category].concat(g.tags || []).join(" ").toLowerCase().indexOf(word.toLowerCase()) !== -1;
        }
        function renderGoods() {
            var keyword = searchEl.value.trim();
            var list = products.filter(function (g) { return matches(g, keyword); });
            listEl.innerHTML = list.length ? list.map(liangProductCard).join("") : '<li class="liang-empty">暂无相关商品，试试其他分类或关键词。</li>';
        }
        menuEl.innerHTML = categories.map(function (cat, i) {
            return '<li><button type="button" data-index="' + i + '">' + liangEscape(cat.name) + '</button></li>';
        }).join("");
        contentEl.innerHTML = categories.map(function (cat, i) {
            var list = products.filter(function (g) {
                return g.category === cat.name || (g.tags || []).indexOf(cat.name) !== -1;
            });
            var used = {};
            var groups = (cat.sections || []).map(function (group) {
                var items = (group.items || []).map(function (item) {
                    return list.find(function (g) { return g.id === item.productId; });
                }).filter(function (g) {
                    if (!g || used[g.id]) return false;
                    used[g.id] = true;
                    return true;
                });
                return { title: group.title, items: items };
            });
            var extra = list.filter(function (g) { return !used[g.id]; });
            if (extra.length) groups.push({ title: "更多好物", items: extra });
            var body = groups.filter(function (group) { return group.items.length; }).map(function (group) {
                return '<div class="liang-category-group"><h4>' + liangEscape(group.title) + '<span>' + group.items.length + '款</span></h4><ul class="liang-category-grid">' + group.items.map(function (g) {
                    return '<li><a href="detail.html?id=' + g.id + '"><img loading="lazy" src="' + liangEscape(g.img) + '" alt="' + liangEscape(g.name) + '"><p>' + liangEscape(g.name) + '</p></a></li>';
                }).join("") + '</ul></div>';
            }).join("");
            return '<section class="liang-category-section" id="liangCatSec' + i + '"><h3>' + liangEscape(cat.name) + '精选</h3>' +
                (body || '<p class="liang-empty">新品筹备中，先逛逛其他分类吧。</p>') + '</section>';
        }).join("");
        function highlight(index) {
            menuEl.querySelectorAll("button").forEach(function (button, i) {
                button.parentElement.classList.toggle("liang-active", i === index);
                button.setAttribute("aria-pressed", String(i === index));
            });
        }
        function select(index, smooth) {
            var section = document.getElementById("liangCatSec" + index);
            var top = section.getBoundingClientRect().top - contentEl.getBoundingClientRect().top + contentEl.scrollTop;
            contentEl.scrollTo({ top: top, behavior: smooth ? "smooth" : "instant" });
            highlight(index);
            searchEl.value = categories[index].name;
            renderGoods();
        }
        menuEl.addEventListener("click", function (event) {
            var button = event.target.closest("button[data-index]");
            if (button) select(Number(button.dataset.index), true);
        });
        contentEl.addEventListener("scroll", function () {
            var current = 0;
            var top = contentEl.getBoundingClientRect().top;
            contentEl.querySelectorAll("section").forEach(function (section, i) {
                if (section.getBoundingClientRect().top <= top + 30) current = i;
            });
            if (contentEl.scrollTop + contentEl.clientHeight >= contentEl.scrollHeight - 2) current = categories.length - 1;
            highlight(current);
        }, { passive: true });
        searchEl.addEventListener("input", renderGoods);
        var initial = categories.findIndex(function (cat) { return cat.name === params.get("cat"); });
        if (initial >= 0) select(initial, false); else highlight(0);
        if (params.has("q")) searchEl.value = params.get("q");
        renderGoods();
    }).catch(function (err) {
        console.error(err);
        liangToast("分类数据加载失败，请刷新重试");
    });
