/* ============================================================
   唯品会特卖商城 - 公共脚本
   24001010817 梁钰承
   功能：fetch 封装、Toast 提示、底部购物车角标、返回顶部、
        购物车数据读写（localStorage 模拟本地数据库）
   ============================================================ */

/* ---------- fetch 数据接口封装（mock 数据统一入口） ---------- */
function liangFetchJSON(url) {
    return fetch(url).then(function (res) {
        if (!res.ok) {
            throw new Error("接口请求失败：" + url + " (" + res.status + ")");
        }
        return res.json();
    });
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
            return JSON.parse(localStorage.getItem(this.KEY)) || [];
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
        var old = list.find(function (g) {
            return g.id === item.id && g.spec === item.spec;
        });
        if (old) {
            old.count += item.count;
        } else {
            list.push(item);
        }
        this.write(list);
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
    }
};

/* ---------- 页面加载完成后的公共初始化 ---------- */
document.addEventListener("DOMContentLoaded", function () {
    LiangCart.refreshBadge();
    liangInitBacktop();
    liangInitHeaderBack();
});
