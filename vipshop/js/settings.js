/* ============================================================
   唯品会特卖商城 - 个人设置脚本
   24001010817 梁钰承
   JS效果：预设头像切换、本地上传头像预览（FileReader）、
          表单校验、资料保存与回显（localStorage）、退出登录
   ============================================================ */

var liangAvatarSrc = "img/logo.png";   /* 当前选中的头像 */

/* ---------- 回显已保存资料 ---------- */
var user = LiangUser.read();
if (user) {
    document.getElementById("liangNicknameInput").value = user.nickname || "";
    document.getElementById("liangAddress").value = user.address || "";
    if (user.birthday) document.getElementById("liangBirthday").value = user.birthday;
    if (user.avatar) {
        liangAvatarSrc = user.avatar;
        document.querySelectorAll("#liangAvatarPicker img").forEach(function (img) {
            img.classList.toggle("liang-active", img.getAttribute("data-src") === user.avatar);
        });
    }
    document.querySelectorAll("input[name='liangGender']").forEach(function (r) {
        r.checked = r.value === (user.gender || "男");
    });
}

/* ---------- JS效果：预设头像单选 ---------- */
var pickerEl = document.getElementById("liangAvatarPicker");
pickerEl.addEventListener("click", function (e) {
    var img = e.target.closest("img");
    if (!img) return;
    liangAvatarSrc = img.getAttribute("data-src");
    pickerEl.querySelectorAll("img").forEach(function (t) {
        t.classList.toggle("liang-active", t === img);
    });
});

/* ---------- JS效果：本地上传头像（FileReader 本地预览） ---------- */
document.getElementById("liangAvatarFile").addEventListener("change", function () {
    var file = this.files[0];
    if (!file) return;
    if (file.type.indexOf("image/") !== 0) {
        liangToast("请选择图片文件");
        return;
    }
    var reader = new FileReader();
    reader.onload = function () {
        liangAvatarSrc = reader.result;
        pickerEl.querySelectorAll("img").forEach(function (img) { img.classList.remove("liang-active"); });
        liangToast("头像已选择，记得点击保存");
    };
    reader.readAsDataURL(file);
});

/* ---------- JS效果：保存校验 + 写入 localStorage ---------- */
document.getElementById("liangSaveBtn").addEventListener("click", function () {
    var nickname = document.getElementById("liangNicknameInput").value.trim();
    var address = document.getElementById("liangAddress").value.trim();
    var birthday = document.getElementById("liangBirthday").value;
    var gender = document.querySelector("input[name='liangGender']:checked").value;

    if (nickname.length < 2 || nickname.length > 12) {
        liangToast("昵称长度需为 2-12 位");
        return;
    }
    if (address && address.length < 5) {
        liangToast("收货地址太短啦");
        return;
    }

    var old = LiangUser.read() || {};
    LiangUser.write({
        phone: old.phone || "",
        nickname: nickname,
        gender: gender,
        birthday: birthday,
        address: address,
        avatar: liangAvatarSrc
    });
    liangToast("保存成功！");
    setTimeout(function () { location.href = "profile.html"; }, 1200);
});

/* ---------- 退出登录 ---------- */
document.getElementById("liangLogout").addEventListener("click", function () {
    localStorage.removeItem(LiangUser.KEY);
    liangToast("已退出登录");
    setTimeout(function () { location.href = "login.html"; }, 1000);
});
