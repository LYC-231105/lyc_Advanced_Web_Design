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
        return;
    }

    var html = "";
    list.forEach(function (g) {
        var key = g.id + "-" + g.spec;
        var checked = liangChecked[key] !== false;   /* 默认全选 */
        html += '<li class="liang-cart-item">'
            + '<input type="checkbox" class="liang-cart-check liang-cart-item-check" data-key="' + key + '"' + (checked ? " checked" : "") + '>'
            + '<a href="detail.html?id=' + g.id + '"><img src="' + g.img + '" alt="' + g.name + '"></a>'
            + '<div class="liang-cart-body">'
            + '<h4>' + g.brand + '</h4>'
            + '<p class="liang-cart-spec">' + g.name + ' | ' + g.spec + '</p>'
            + '<div class="liang-cart-price-row">'
            + '<p class="liang-cart-price"><em>¥</em>' + g.price + '</p>'
            + '<div class="liang-cart-count-box">'
            + '<button type="button" data-act="minus" data-key="' + key + '">−</button>'
            + '<span>' + g.count + '</span>'
            + '<button type="button" data-act="plus" data-key="' + key + '">+</button>'
            + '</div></div></div>'
            + '<button class="liang-cart-del" type="button" data-act="del" data-key="' + key + '">✕</button>'
            + '</li>';
    });
    listEl.innerHTML = html;
    calcTotal();
}

/* ---------- 合计计算（只统计勾选项，JS效果11） ---------- */
function calcTotal() {
    var list = LiangCart.read();
    var total = 0;
    var count = 0;
    list.forEach(function (g) {
        var key = g.id + "-" + g.spec;
        if (liangChecked[key] !== false) {
            total += g.price * g.count;
            count += g.count;
        }
    });
    totalEl.textContent = "¥" + total;
    settleEl.textContent = "去结算(" + count + ")";
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
    if (act === "plus") item.count = Math.min(99, item.count + 1);
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
    checkAllEl.checked = list.every(function (g) {
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
    liangToast("下单成功！感谢在唯品会购物~");
    LiangCart.write([]);
    liangChecked = {};
    render();
});

render();
syncCheckAll();
