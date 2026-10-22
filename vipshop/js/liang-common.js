/* ============================================================
   唯品会特卖商城 - 公共脚本
   24001010817 梁钰承
   功能：fetch 封装、Toast 提示、底部购物车角标、返回顶部、
        购物车数据读写（localStorage 模拟本地数据库）
   ============================================================ */

/* ---------- fetch 数据接口封装（mock 数据统一入口） ----------
 * 正常运行时通过 fetch 访问 data/*.json 本地接口；
 * 当页面以 file:// 协议直接打开导致 fetch 被浏览器拦截时，
 * 自动回退到内嵌的 LiangMockData，保证离线也能完整浏览。
 * ---------------------------------------------------------- */
function liangLoadJSON(url) {
    if (location.protocol === "file:" && window.LiangMockData && LiangMockData[url]) {
        return Promise.resolve(JSON.parse(JSON.stringify(LiangMockData[url])));
    }
    return fetch(url).then(function (res) {
        if (!res.ok) {
            throw new Error("接口请求失败：" + url + " (" + res.status + ")");
        }
        return res.json();
    }).catch(function (err) {
        if (location.protocol === "file:" && window.LiangMockData && LiangMockData[url]) {
            console.warn("[liang] fetch 被拦截，已回退到内嵌数据：", url);
            return Promise.resolve(JSON.parse(JSON.stringify(LiangMockData[url])));
        }
        throw err;
    });
}

function liangReadList(key) {
    try {
        var value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch (err) { return []; }
}

var LiangCatalog = {
    merge: function (base) {
        var deleted = liangReadList("liang_admin_deleted");
        return base.concat(liangReadList("liang_admin_extra")).filter(function (g) {
            return g && Number.isFinite(g.id) && typeof g.name === "string" &&
                typeof g.brand === "string" && g.price > 0 &&
                /^img\/[a-zA-Z0-9_./-]+$/.test(g.img) && deleted.indexOf(g.id) === -1;
        });
    }
};

/* 前后台共用同一商品视图，秒杀也按 id 读取最新名称、图片和售价。 */
function liangFetchJSON(url) {
    return liangLoadJSON(url).then(function (res) {
        if (url === "data/products.json") res.data = LiangCatalog.merge(res.data);
        if (url !== "data/seckill.json") return res;
        return liangFetchJSON("data/products.json").then(function (catalog) {
            res.data = res.data.map(function (sale) {
                var product = catalog.data.find(function (g) { return g.id === sale.id; });
                if (!product || product.stock <= 0) return null;
                return Object.assign({}, sale, {
                    img: product.img, name: product.name, brand: product.brand,
                    price: product.price, originalPrice: product.marketPrice
                });
            }).filter(Boolean);
            return res;
        });
    });
}

function liangEscape(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
        return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c];
    });
}

function liangDiscount(price, marketPrice) {
    return marketPrice > 0 ? Math.min(10, price / marketPrice * 10).toFixed(1).replace(/\.0$/, "") : "10";
}

function liangProductCard(g) {
    return '<li class="liang-goods-card"><a href="detail.html?id=' + g.id + '">' +
        '<img loading="lazy" src="' + liangEscape(g.img) + '" alt="' + liangEscape(g.name) + '">' +
        '<span class="liang-goods-discount">' + liangDiscount(g.price, g.marketPrice) + '折</span>' +
        '<div class="liang-goods-info"><p class="liang-goods-brand">' + liangEscape(g.brand) + '</p>' +
        '<p class="liang-goods-name">' + liangEscape(g.name) + '</p>' +
        '<p class="liang-goods-price"><em>¥</em><strong>' + g.price + '</strong><del>¥' +
        g.marketPrice + '</del></p></div></a></li>';
}

/* 当日 20 点结束；过点切换到下一场，首页与秒杀页语义一致。 */
function liangSaleDeadline(res) {
    var now = new Date();
    var end = new Date();
    end.setHours(res.hour, res.minute, 0, 0);
    if (now >= end) end.setDate(end.getDate() + 1);
    return end;
}

/* ---------- Toast 轻提示 ---------- */
function liangToast(msg, duration) {
    var el = document.querySelector(".liang-toast");
    if (!el) {
        el = document.createElement("div");
        el.className = "liang-toast";
        document.body.appendChild(el);
    }
    el.textContent = msg;
    /* 强制回流后再加类名，保证连续调用也有过渡效果 */
    void el.offsetWidth;
    el.classList.add("liang-show");
    clearTimeout(el._timer);
    el._timer = setTimeout(function () {
        el.classList.remove("liang-show");
    }, duration || 1600);
}

/* ---------- 购物车本地数据（localStorage 模拟数据库表） ---------- */
var LiangCart = {
    KEY: "liang_cart_list",
    read: function () {
        try {
            return liangReadList(this.KEY).filter(function (g) {
                return g && Number.isFinite(g.id) && typeof g.spec === "string" &&
                    Number.isInteger(g.count) && g.count > 0 && Number.isFinite(g.price);
            });
        } catch (e) {
            return [];
        }
    },
    write: function (list) {
        localStorage.setItem(this.KEY, JSON.stringify(list));
        this.refreshBadge();
    },
    add: function (item) {
        var list = this.read();
        var inCart = list.filter(function (g) { return g.id === item.id; })
            .reduce(function (n, g) { return n + g.count; }, 0);
        if (inCart + item.count > Math.min(99, item.stock)) {
            liangToast("已达到库存或单款99件的上限");
            return false;
        }
        var old = list.find(function (g) {
            return g.id === item.id && g.spec === item.spec;
        });
        if (old) {
            old.count += item.count;
        } else {
            list.push(item);
        }
        this.write(list);
        return true;
    },
    remove: function (id, spec) {
        var list = this.read().filter(function (g) {
            return !(g.id === id && g.spec === spec);
        });
        this.write(list);
    },
    count: function () {
        return this.read().reduce(function (sum, g) { return sum + g.count; }, 0);
    },
    /* 刷新底部 tabbar 购物车角标 */
    refreshBadge: function () {
        document.querySelectorAll(".liang-cart-badge").forEach(function (b) {
            var n = LiangCart.count();
            b.textContent = n > 99 ? "99+" : n;
            b.style.display = n > 0 ? "block" : "none";
        });
    }
};

/* ---------- 返回顶部按钮 ---------- */
function liangInitBacktop() {
    var btn = document.querySelector(".liang-backtop");
    if (!btn) return;
    window.addEventListener("scroll", function () {
        btn.classList.toggle("liang-show", window.scrollY > 300);
    }, { passive: true });
    btn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ---------- 顶部返回按钮 ---------- */
function liangInitHeaderBack() {
    var btn = document.querySelector(".liang-header-back");
    if (!btn) return;
    btn.addEventListener("click", function () {
        if (history.length > 1) {
            history.back();
        } else {
            location.href = "index.html";
        }
    });
}

/* ---------- 当前登录用户读取 ---------- */
var LiangUser = {
    KEY: "liang_user_info",
    read: function () {
        try {
            return JSON.parse(localStorage.getItem(this.KEY)) || null;
        } catch (e) {
            return null;
        }
    },
    write: function (user) {
        localStorage.setItem(this.KEY, JSON.stringify(user));
        if (user.phone) localStorage.setItem("liang_profile_" + user.phone, JSON.stringify(user));
    }
};

/* ---------- 页面加载完成后的公共初始化 ---------- */
document.addEventListener("DOMContentLoaded", function () {
    LiangCart.refreshBadge();
    liangInitBacktop();
    liangInitHeaderBack();
});
