/* ============================================================
   唯品会特卖商城 - 个人中心脚本
   24001010817 梁钰承
   JS效果：登录态读取与展示（localStorage）、关于弹层
   ============================================================ */

var user = LiangUser.read();

if (user) {
    document.getElementById("liangNickname").textContent = user.nickname || "唯品会用户";
    var phone = user.phone || "";
    document.getElementById("liangUserPhone").textContent =
        phone ? "手机号：" + phone.slice(0, 3) + "****" + phone.slice(7) : "欢迎回来~";
    var levelEl = document.getElementById("liangLevel");
    levelEl.textContent = "个人资料";
    levelEl.href = "settings.html";
    if (user.avatar) {
        document.getElementById("liangAvatar").src = user.avatar;
    }
} 

/* ---------- 关于弹层（JS效果13：自定义弹窗） ---------- */
document.getElementById("liangAbout").addEventListener("click", function () {
    liangToast("唯品会特卖商城 v1.0 | 24001010817 梁钰承 | 高级网页设计I期末作品", 2600);
});

/* 模拟结算后的本地订单回显，不再把所有订单入口跳到购物车。 */
var ordersPanel = document.getElementById("liangOrdersPanel");
document.querySelectorAll("[data-orders]").forEach(function (button) {
    button.addEventListener("click", function () {
        var status = button.dataset.orders;
        var orders = liangReadList("liang_orders").filter(function (order) {
            return status === "全部" || order.status === status;
        });
        document.getElementById("liangOrdersTitle").textContent = status + "订单";
        document.getElementById("liangOrdersList").innerHTML = orders.length ? orders.map(function (order) {
            return '<li class="liang-order-card"><p>模拟订单 ' + order.id + ' · ' + liangEscape(order.status) + '</p>' +
                order.items.map(function (item) { return '<div class="liang-order-product"><img src="' + liangEscape(item.img) + '" alt="' + liangEscape(item.name) + '"><span>' + liangEscape(item.name) + ' × ' + item.count + '</span></div>'; }).join("") +
                '<p>合计 ¥' + Number(order.total).toFixed(2) + '</p><small>' + liangEscape(order.createdAt) + '</small></li>';
        }).join("") : '<li class="liang-empty">暂无' + liangEscape(status) + '订单</li>';
        ordersPanel.hidden = false;
        ordersPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});
document.getElementById("liangOrdersClose").addEventListener("click", function () { ordersPanel.hidden = true; });
