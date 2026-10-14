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
    levelEl.textContent = "SVIP会员";
    levelEl.href = "settings.html";
    if (user.avatar) {
        document.getElementById("liangAvatar").src = user.avatar;
    }
} 

/* ---------- 关于弹层（JS效果13：自定义弹窗） ---------- */
document.getElementById("liangAbout").addEventListener("click", function () {
    liangToast("唯品会特卖商城 v1.0 | 24001010817 梁钰承 | 高级网页设计I期末作品", 2600);
});
