/* ============================================================
   唯品会特卖商城 - 登录/注册脚本
   24001010817 梁钰承
   JS效果：登录/注册tab切换、正则表单校验、验证码倒计时、
          登录态写入 localStorage
   ============================================================ */

var mode = "login";   /* login | register */
var errEl = document.getElementById("liangErr");
var submitBtn = document.getElementById("liangSubmitBtn");
var pwdField = document.getElementById("liangPwdField");
var codeField = document.getElementById("liangCodeField");

/* ---------- JS效果：登录/注册 tab 切换 ---------- */
document.querySelectorAll(".liang-login-tabs button").forEach(function (btn) {
    btn.addEventListener("click", function () {
        mode = btn.getAttribute("data-tab");
        document.querySelectorAll(".liang-login-tabs button").forEach(function (b) {
            b.classList.toggle("liang-active", b === btn);
        });
        var isRegister = mode === "register";
        pwdField.style.display = isRegister ? "none" : "flex";
        codeField.style.display = isRegister ? "flex" : "none";
        submitBtn.textContent = isRegister ? "注 册" : "登 录";
        errEl.textContent = "";
    });
});

/* ---------- JS效果：验证码倒计时 ---------- */
document.getElementById("liangCodeBtn").addEventListener("click", function () {
    var btn = this;
    var phoneOk = /^1[3-9]\d{9}$/.test(document.getElementById("liangPhone").value);
    if (!phoneOk) {
        errEl.textContent = "请先输入正确的11位手机号";
        return;
    }
    errEl.textContent = "";
    var left = 60;
    btn.disabled = true;
    liangToast("验证码已发送（模拟：123456）");
    var timer = setInterval(function () {
        left--;
        btn.textContent = left + "s后重发";
        if (left <= 0) {
            clearInterval(timer);
            btn.disabled = false;
            btn.textContent = "获取验证码";
        }
    }, 1000);
});

/* ---------- JS效果：提交时正则校验 ---------- */
document.getElementById("liangLoginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var phone = document.getElementById("liangPhone").value.trim();
    var pwd = document.getElementById("liangPwd").value;
    var code = document.getElementById("liangCode").value.trim();

    if (!/^1[3-9]\d{9}$/.test(phone)) {
        errEl.textContent = "手机号格式不正确，应为1开头的11位数字";
        return;
    }
    if (mode === "login") {
        if (pwd.length < 6 || pwd.length > 16) {
            errEl.textContent = "密码长度需为6-16位";
            return;
        }
    } else {
        if (code !== "123456") {
            errEl.textContent = "验证码错误（模拟验证码为123456）";
            return;
        }
    }
    if (!document.getElementById("liangAgree").checked) {
        errEl.textContent = "请先勾选同意服务条款";
        return;
    }

    errEl.textContent = "";
    LiangUser.write({ phone: phone, nickname: "用户" + phone.slice(7), avatar: "", gender: "男", birthday: "", address: "" });
    liangToast(mode === "login" ? "登录成功！" : "注册并登录成功！");
    setTimeout(function () { location.href = "profile.html"; }, 1000);
});
