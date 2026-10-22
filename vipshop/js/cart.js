/* ============================================================
   唯品会特卖商城 - 购物车脚本
   24001010817 梁钰承
   JS效果：列表渲染、全选联动、数量增减、删除、合计实时计算（localStorage）
   ============================================================ */

var liangChecked = {};   /* 选中状态表：key = id-spec */

var listEl = document.getElementById("liangCartList");
var totalEl = document.getElementById("liangCartTotal");
var settleEl = document.getElementById("liangSettleBtn");
var checkAllEl = document.getElementById("liangCheckAll");

/* ---------- 渲染购物车 ---------- */
function render() {
    var list = LiangCart.read();
    if (list.length === 0) {
        listEl.innerHTML =
            '<li class="liang-cart-empty">'
            + '<svg viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="1.5">'
            + '<path d="M3 4h2l2.5 12h11L21 8H6"/><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/>'
            + '</svg>'
            + '<p>购物车还是空的，快去逛逛吧~</p>'
            + '<a href="index.html" style="display:inline-block;margin-top:14px;padding:8px 26px;color:#fff;background:var(--liang-pink);border-radius:18px">去逛逛</a>'
            + '</li>';
        totalEl.textContent = "¥0";
        settleEl.textContent = "去结算(0)";
        checkAllEl.checked = false;
        checkAllEl.indeterminate = false;
        settleEl.disabled = true;
        return;
    }

    var html = "";
    list.forEach(function (g) {
        var key = g.id + "-" + g.spec;
        var checked = liangChecked[key] !== false;   /* 默认全选 */
        html += '<li class="liang-cart-item">'
            + '<input type="checkbox" class="liang-cart-check liang-cart-item-check" data-key="' + liangEscape(key) + '"' + (checked ? " checked" : "") + '>'
            + '<a href="detail.html?id=' + g.id + '"><img src="' + liangEscape(g.img) + '" alt="' + liangEscape(g.name) + '"></a>'
            + '<div class="liang-cart-body">'
            + '<h4>' + liangEscape(g.brand) + '</h4>'
            + '<p class="liang-cart-spec">' + liangEscape(g.name) + ' | ' + liangEscape(g.spec) + '</p>'
            + '<div class="liang-cart-price-row">'
            + '<p class="liang-cart-price"><em>¥</em>' + g.price + '</p>'
            + '<div class="liang-cart-count-box">'
            + '<button type="button" data-act="minus" data-key="' + liangEscape(key) + '">−</button>'
            + '<span>' + g.count + '</span>'
            + '<button type="button" data-act="plus" data-key="' + liangEscape(key) + '">+</button>'
            + '</div></div></div>'
            + '<button class="liang-cart-del" type="button" data-act="del" data-key="' + liangEscape(key) + '">✕</button>'
            + '</li>';
    });
    listEl.innerHTML = html;
    calcTotal();
    syncCheckAll();
}

/* ---------- 合计计算（只统计勾选项，JS效果11） ---------- */
function calcTotal() {
    var list = LiangCart.read();
    var total = 0;
    var count = 0;
    list.forEach(function (g) {
        var key = g.id + "-" + g.spec;
        if (liangChecked[key] !== false) {
            total += Math.round(g.price * 100) * g.count;
            count += g.count;
        }
    });
    totalEl.textContent = "¥" + (total / 100).toFixed(2);
    settleEl.textContent = "去结算(" + count + ")";
    settleEl.disabled = count === 0;
}

/* ---------- 事件委托：增减 / 删除 / 勾选 ---------- */
listEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    var key = btn.getAttribute("data-key");
    var act = btn.getAttribute("data-act");
    var id = parseInt(key.split("-")[0], 10);
    var spec = key.split("-").slice(1).join("-");

    if (act === "del") {
        LiangCart.remove(id, spec);
        liangToast("已从购物车移除");
        render();
        return;
    }

    var list = LiangCart.read();
    var item = list.find(function (g) { return g.id === id && g.spec === spec; });
    if (!item) return;
    if (act === "plus") {
        var totalCount = list.filter(function (g) { return g.id === id; }).reduce(function (sum, g) { return sum + g.count; }, 0);
        if (totalCount >= Math.min(99, item.stock || 0)) { liangToast("已达到库存或单款99件的上限"); return; }
        item.count += 1;
    }
    if (act === "minus") {
        item.count -= 1;
        if (item.count <= 0) {
            LiangCart.remove(id, spec);
            liangToast("已从购物车移除");
        } else {
            LiangCart.write(list);
        }
    } else {
        LiangCart.write(list);
    }
    render();
});

listEl.addEventListener("change", function (e) {
    if (e.target.classList.contains("liang-cart-item-check")) {
        liangChecked[e.target.getAttribute("data-key")] = e.target.checked;
        calcTotal();
        syncCheckAll();
    }
});

/* ---------- 全选 / 取消全选 ---------- */
function syncCheckAll() {
    var list = LiangCart.read();
    checkAllEl.checked = list.length > 0 && list.every(function (g) {
        return liangChecked[g.id + "-" + g.spec] !== false;
    });
    checkAllEl.indeterminate = !checkAllEl.checked && list.some(function (g) {
        return liangChecked[g.id + "-" + g.spec] !== false;
    });
}

checkAllEl.addEventListener("change", function () {
    LiangCart.read().forEach(function (g) {
        liangChecked[g.id + "-" + g.spec] = checkAllEl.checked;
    });
    render();
});

/* ---------- 去结算 ---------- */
settleEl.addEventListener("click", function () {
    if (LiangCart.read().length === 0) {
        liangToast("购物车是空的，先去逛逛吧");
        return;
    }
    var selected = LiangCart.read().filter(function (g) { return liangChecked[g.id + "-" + g.spec] !== false; });
    if (!selected.length) { liangToast("请先选择要结算的商品"); return; }
    var orders = liangReadList("liang_orders");
    orders.unshift({ id: Date.now(), createdAt: new Date().toLocaleString("zh-CN"),
        status: "待收货", items: selected,
        total: selected.reduce(function (sum, g) { return sum + Math.round(g.price * 100) * g.count; }, 0) / 100 });
    localStorage.setItem("liang_orders", JSON.stringify(orders));
    liangToast("模拟结算完成，未勾选的商品已保留");
    LiangCart.write(LiangCart.read().filter(function (g) { return liangChecked[g.id + "-" + g.spec] === false; }));
    liangChecked = {};
    render();
});

/* 校正旧版本购物车的图文、规格与库存；后台删除的商品不再参与结算。 */
settleEl.disabled = true;
liangFetchJSON("data/products.json").then(function (res) {
    var counts = {};
    var list = LiangCart.read().map(function (item) {
        var product = res.data.find(function (g) { return g.id === item.id; });
        if (!product || product.stock <= 0) return null;
        var count = Math.min(item.count, 99 - (counts[item.id] || 0), product.stock - (counts[item.id] || 0));
        counts[item.id] = (counts[item.id] || 0) + count;
        if (count <= 0) return null;
        return Object.assign({}, item, {
            name: product.name, brand: product.brand, img: product.img,
            price: product.price, stock: product.stock, count: count,
            spec: product.specs && product.specs.indexOf(item.spec) === -1 ? product.specs[0] : item.spec
        });
    }).filter(Boolean);
    var merged = [];
    list.forEach(function (item) {
        var previous = merged.find(function (g) { return g.id === item.id && g.spec === item.spec; });
        if (previous) previous.count += item.count; else merged.push(item);
    });
    LiangCart.write(merged);
    render();
}).catch(function (err) {
    console.error(err);
    liangToast("无法核对商品信息，请刷新后重试");
});
