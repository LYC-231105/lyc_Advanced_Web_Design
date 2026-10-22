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
        return liangReadList(this.KEY);
    },
    writeExtra: function (arr) { localStorage.setItem(this.KEY, JSON.stringify(arr)); },
    readDeleted: function () {
        return liangReadList(this.DELETED);
    },
    writeDeleted: function (arr) { localStorage.setItem(this.DELETED, JSON.stringify(arr)); }
};

/* ---------- 合并基础数据与本地新增，过滤已删除 ---------- */
function mergeGoods() {
    return LiangCatalog.merge(baseGoods);
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
            + "<img src='" + liangEscape(g.img) + "' alt='" + liangEscape(g.name) + "'>"
            + "<div class='liang-admin-name'><a href='detail.html?id=" + g.id + "'><span>" + liangEscape(g.brand) + " " + liangEscape(g.name) + "</span></a>"
            + "<small>" + liangEscape(g.category || "未分类") + " · 销量" + (g.sales || 0) + "</small></div>"
            + "<span class='liang-admin-price'>¥" + g.price + "</span>"
            + "<span class='liang-admin-stock'>" + (g.stock || 0) + "</span>"
            + del
            + "</div>";
    }).join("");
}

/* ---------- 初始化：fetch 商品接口 ---------- */
liangLoadJSON("data/products.json").then(function (res) {
    baseGoods = res.data;
    document.getElementById("liangNewImg").innerHTML = baseGoods.map(function (g) {
        return '<option value="' + liangEscape(g.img) + '">' + liangEscape(g.brand + " " + g.name) + '</option>';
    }).join("");
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
    syncPhotoFields();
    mask.classList.add("liang-show");
    sheet.classList.add("liang-show");
});
function closeSheet() {
    mask.classList.remove("liang-show");
    sheet.classList.remove("liang-show");
}
document.getElementById("liangSheetClose").addEventListener("click", closeSheet);
mask.addEventListener("click", closeSheet);

function syncPhotoFields() {
    var path = document.getElementById("liangNewImg").value;
    var product = baseGoods.find(function (g) { return g.img === path; });
    if (!product) return;
    document.getElementById("liangNewBrand").value = product.brand;
    document.getElementById("liangNewName").value = product.name;
    document.getElementById("liangNewCategory").value = product.category;
    document.getElementById("liangNewPreview").src = path;
    document.getElementById("liangNewPreview").alt = product.name;
}
document.getElementById("liangNewImg").addEventListener("change", syncPhotoFields);

document.getElementById("liangNewSaveBtn").addEventListener("click", function () {
    var brand = document.getElementById("liangNewBrand").value.trim();
    var name = document.getElementById("liangNewName").value.trim();
    var price = Number(document.getElementById("liangNewPrice").value);
    var stock = Number(document.getElementById("liangNewStock").value);
    var img = document.getElementById("liangNewImg").value;

    if (brand.length < 2) { liangToast("请输入品牌名称"); return; }
    if (name.length < 2) { liangToast("请输入商品名称"); return; }
    if (!Number.isFinite(price) || price <= 0 || price > 999999 || Math.abs(price * 100 - Math.round(price * 100)) > 0.000001) { liangToast("售价应大于0，且最多两位小数"); return; }
    if (!Number.isInteger(stock) || stock < 0 || stock > 999999) { liangToast("库存须为0到999999的整数"); return; }
    var source = baseGoods.find(function (g) { return g.img === img; });
    if (!source) { liangToast("请选择有效的本地商品图"); return; }

    var extra = AdminStore.readExtra();
    var newId = Math.max(Date.now(), 1001, ...extra.map(function (g) { return g.id + 1; }));
    extra.push({
        id: newId,
        brand: brand,
        name: name,
        price: price,
        marketPrice: Math.round(price * 2.5),
        img: img,
        category: document.getElementById("liangNewCategory").value,
        stock: stock,
        sales: 0,
        gallery: source.gallery.slice(),
        specs: source.specs.slice(),
        specLabel: source.specLabel || "规格",
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
    document.getElementById("liangAdminSearch").value = "";
    render("");
});
