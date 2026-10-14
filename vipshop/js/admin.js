/* ============================================================
   唯品会特卖商城 - 后台管理脚本
   24001010817 梁钰承
   JS效果：fetch渲染商品列表、统计计算、关键词过滤、
          新增/删除商品（localStorage 本地持久化）
   数据接口：data/products.json
   ============================================================ */

var baseGoods = [];        /* fetch 到的基础商品表 */
var adminListEl = document.getElementById("liangAdminList");
var mask = document.getElementById("liangSheetMask");
var sheet = document.getElementById("liangSheet");

/* localStorage 记录后台新增与删除的商品 id */
var AdminStore = {
    KEY: "liang_admin_extra",
    DELETED: "liang_admin_deleted",
    readExtra: function () {
        try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; }
    },
    writeExtra: function (arr) { localStorage.setItem(this.KEY, JSON.stringify(arr)); },
    readDeleted: function () {
        try { return JSON.parse(localStorage.getItem(this.DELETED)) || []; } catch (e) { return []; }
    },
    writeDeleted: function (arr) { localStorage.setItem(this.DELETED, JSON.stringify(arr)); }
};

/* ---------- 合并基础数据与本地新增，过滤已删除 ---------- */
function mergeGoods() {
    var deleted = AdminStore.readDeleted();
    var extra = AdminStore.readExtra();
    return baseGoods
        .filter(function (g) { return deleted.indexOf(g.id) === -1; })
        .concat(extra);
}

/* ---------- 渲染 ---------- */
function render(kw) {
    var goods = mergeGoods();
    if (kw) {
        goods = goods.filter(function (g) {
            return g.name.indexOf(kw) > -1 || g.brand.indexOf(kw) > -1 || (g.category || "").indexOf(kw) > -1;
        });
    }

    /* 统计（按全部在售商品计算） */
    var all = mergeGoods();
    document.getElementById("liangStatCount").textContent = all.length;
    document.getElementById("liangStatStock").textContent = all.reduce(function (s, g) { return s + (g.stock || 0); }, 0);
    document.getElementById("liangStatSales").textContent = all.reduce(function (s, g) { return s + (g.sales || 0); }, 0);

    if (!goods.length) {
        adminListEl.innerHTML = '<p style="text-align:center;color:#999;padding:40px 0">没有匹配的商品</p>';
        return;
    }
    adminListEl.innerHTML = goods.map(function (g) {
        var key = g.id > 1000 ? g.id : "";   /* 本地新增商品 id > 1000 */
        var del = g.id > 1000
            ? "<button class='liang-admin-del' type='button' data-extra='" + g.id + "'>删除</button>"
            : "<button class='liang-admin-del' type='button' data-base='" + g.id + "'>删除</button>";
        return "<div class='liang-admin-row'>"
            + "<img src='" + g.img + "' alt='" + g.brand + "'>"
            + "<div class='liang-admin-name'><span>" + g.brand + " " + g.name + "</span>"
            + "<small>" + (g.category || "未分类") + " · 销量" + (g.sales || 0) + "</small></div>"
            + "<span class='liang-admin-price'>¥" + g.price + "</span>"
            + "<span class='liang-admin-stock'>" + (g.stock || 0) + "</span>"
            + del
            + "</div>";
    }).join("");
}

/* ---------- 初始化：fetch 商品接口 ---------- */
liangFetchJSON("data/products.json").then(function (res) {
    baseGoods = res.data;
    render("");
}).catch(function (err) {
    console.error(err);
    liangToast("后台数据加载失败");
});

/* ---------- JS效果：关键词搜索过滤 ---------- */
document.getElementById("liangAdminSearch").addEventListener("input", function () {
    render(this.value.trim());
});

/* ---------- 删除（事件委托） ---------- */
adminListEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    if (btn.getAttribute("data-extra")) {
        var id = parseInt(btn.getAttribute("data-extra"), 10);
        AdminStore.writeExtra(AdminStore.readExtra().filter(function (g) { return g.id !== id; }));
    } else if (btn.getAttribute("data-base")) {
        var baseId = parseInt(btn.getAttribute("data-base"), 10);
        var deleted = AdminStore.readDeleted();
        deleted.push(baseId);
        AdminStore.writeDeleted(deleted);
    }
    liangToast("商品已删除");
    render(document.getElementById("liangAdminSearch").value.trim());
});

/* ---------- 新增商品弹层 ---------- */
document.getElementById("liangAdminAddBtn").addEventListener("click", function () {
    mask.classList.add("liang-show");
    sheet.classList.add("liang-show");
});
function closeSheet() {
    mask.classList.remove("liang-show");
    sheet.classList.remove("liang-show");
}
document.getElementById("liangSheetClose").addEventListener("click", closeSheet);
mask.addEventListener("click", closeSheet);

document.getElementById("liangNewSaveBtn").addEventListener("click", function () {
    var brand = document.getElementById("liangNewBrand").value.trim();
    var name = document.getElementById("liangNewName").value.trim();
    var price = parseFloat(document.getElementById("liangNewPrice").value);
    var stock = parseInt(document.getElementById("liangNewStock").value, 10) || 0;
    var img = document.getElementById("liangNewImg").value;

    if (brand.length < 2) { liangToast("请输入品牌名称"); return; }
    if (name.length < 2) { liangToast("请输入商品名称"); return; }
    if (!(price > 0)) { liangToast("请输入正确的售价"); return; }

    var extra = AdminStore.readExtra();
    var newId = 1001 + extra.length;
    extra.push({
        id: newId,
        brand: brand,
        name: name,
        price: price,
        marketPrice: Math.round(price * 2.5),
        img: img,
        category: "新品",
        stock: stock,
        sales: 0,
        gallery: [img],
        desc: name
    });
    AdminStore.writeExtra(extra);
    liangToast("新增成功！");
    closeSheet();
    /* 清空表单 */
    document.getElementById("liangNewBrand").value = "";
    document.getElementById("liangNewName").value = "";
    document.getElementById("liangNewPrice").value = "";
    document.getElementById("liangNewStock").value = "";
    render("");
});
