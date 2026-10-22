/* ============================================================
   唯品会特卖商城 - 商品详情页脚本
   24001010817 梁钰承
   JS效果：缩略图切换主图、规格选择、数量增减、加入购物车（localStorage）
   数据接口：data/products.json（?id= 取商品）/ data/comments.json
   ============================================================ */

var goods = null;          /* 当前商品 */
var liangSpec = "默认规格";
var liangBuyCount = 1;

/* ---------- 解析地址栏商品 id ---------- */
var params = new URLSearchParams(location.search);
var goodsId = parseInt(params.get("id"), 10) || 1;

/* ---------- 拉取商品数据并渲染 ---------- */
liangFetchJSON("data/products.json").then(function (res) {
    goods = res.data.find(function (g) { return g.id === goodsId; });
    if (!goods) {
        liangToast("商品不存在，已为你返回首页");
        setTimeout(function () { location.href = "index.html"; }, 1500);
        return;
    }
    document.title = goods.brand + " " + goods.name + "-唯品会-24001010817梁钰承";

    /* 图集 */
    var gallery = goods.gallery && goods.gallery.length ? goods.gallery : [goods.img];
    var mainImg = document.getElementById("liangMainImg");
    var thumbsEl = document.getElementById("liangThumbs");
    mainImg.src = gallery[0];
    mainImg.alt = goods.brand + " " + goods.name;
    thumbsEl.innerHTML = gallery.map(function (src, i) {
        return "<button type='button' aria-label='查看商品第" + (i + 1) + "张图片'><img src='" + liangEscape(src) + "' alt='" + liangEscape(goods.name) + " 视角" + (i + 1) + "' class='" + (i === 0 ? "liang-active" : "") + "'></button>";
    }).join("");

    /* JS效果7：点击缩略图切换主图 */
    thumbsEl.addEventListener("click", function (e) {
        var button = e.target.closest("button");
        if (!button) return;
        var image = button.querySelector("img");
        mainImg.src = image.src;
        thumbsEl.querySelectorAll("img").forEach(function (t) {
            t.classList.toggle("liang-active", t === image);
        });
    });

    /* 价格信息 */
    var off = liangDiscount(goods.price, goods.marketPrice);
    document.getElementById("liangPrice").textContent = goods.price;
    document.getElementById("liangMarketPrice").textContent = "¥" + goods.marketPrice;
    document.getElementById("liangOffTag").textContent = off + "折";
    document.getElementById("liangName").textContent = goods.brand + " " + goods.name;
    document.getElementById("liangDesc").textContent = goods.desc;
    document.getElementById("liangStock").textContent = "库存 " + goods.stock + " 件";
    document.getElementById("liangSpecName").textContent = goods.specLabel || "规格";

    /* 规格按钮（JS效果8：单选高亮） */
    var specs = goods.specs && goods.specs.length ? goods.specs : ["默认规格"];
    var specsEl = document.getElementById("liangSpecs");
    specsEl.innerHTML = specs.map(function (s, i) {
        return "<button type='button' class='" + (i === 0 ? "liang-active" : "") + "'>" + liangEscape(s) + "</button>";
    }).join("");
    liangSpec = specs[0];
    document.getElementById("liangAddCart").disabled = goods.stock <= 0;
    document.getElementById("liangBuyNow").disabled = goods.stock <= 0;
    if (goods.stock <= 0) document.getElementById("liangAddCart").textContent = "已售罄";
    specsEl.addEventListener("click", function (e) {
        if (e.target.tagName !== "BUTTON") return;
        liangSpec = e.target.textContent;
        specsEl.querySelectorAll("button").forEach(function (b) {
            b.classList.toggle("liang-active", b === e.target);
        });
    });

    /* 评价列表 */
    return liangFetchJSON("data/comments.json").then(function (cres) {
        var list = cres.data.filter(function (c) { return c.productId === goods.id; });
        document.getElementById("liangReviewCount").textContent = list.length;
        var html = "";
        list.forEach(function (c) {
            html += "<li><div class='liang-review-user'>"
                + "<span class='liang-review-avatar'>" + c.user.charAt(0) + "</span>"
                + "<b>" + c.user + "</b><time>" + c.time + "</time></div>"
                + "<p class='liang-review-stars'>" + "★".repeat(c.stars) + "☆".repeat(5 - c.stars) + "</p>"
                + "<p class='liang-review-text'>" + c.content + "</p></li>";
        });
        document.getElementById("liangReviews").innerHTML = html || "<li style='color:#999;font-size:13px'>暂无评价</li>";
    });
}).catch(function (err) {
    console.error(err);
    liangToast("商品数据加载失败");
});

/* ---------- 数量增减（JS效果9） ---------- */
var countEl = document.getElementById("liangCount");
document.getElementById("liangCountMinus").addEventListener("click", function () {
    liangBuyCount = Math.max(1, liangBuyCount - 1);
    countEl.textContent = liangBuyCount;
});
document.getElementById("liangCountPlus").addEventListener("click", function () {
    if (!goods || goods.stock <= 0) return;
    liangBuyCount = Math.min(99, goods.stock, liangBuyCount + 1);
    countEl.textContent = liangBuyCount;
});

/* ---------- 加入购物车（JS效果10：localStorage 本地持久化 + 弹层） ---------- */
var mask = document.getElementById("liangSheetMask");
var sheet = document.getElementById("liangSheet");

function openSheet(msg) {
    document.getElementById("liangSheetMsg").textContent = msg;
    mask.classList.add("liang-show");
    sheet.classList.add("liang-show");
}
function closeSheet() {
    mask.classList.remove("liang-show");
    sheet.classList.remove("liang-show");
}
document.getElementById("liangSheetClose").addEventListener("click", closeSheet);
mask.addEventListener("click", closeSheet);

document.getElementById("liangAddCart").addEventListener("click", function () {
    if (!goods) return;
    var added = LiangCart.add({
        id: goods.id,
        spec: liangSpec,
        count: liangBuyCount,
        name: goods.name,
        brand: goods.brand,
        price: goods.price,
        img: goods.img,
        stock: goods.stock
    });
    if (!added) return;
    openSheet(goods.brand + " " + goods.name + " × " + liangBuyCount + "（" + liangSpec + "）已加入购物车");
});

document.getElementById("liangBuyNow").addEventListener("click", function () {
    if (!goods) return;
    var added = LiangCart.add({
        id: goods.id,
        spec: liangSpec,
        count: liangBuyCount,
        name: goods.name,
        brand: goods.brand,
        price: goods.price,
        img: goods.img,
        stock: goods.stock
    });
    if (!added) return;
    location.href = "cart.html";
});
