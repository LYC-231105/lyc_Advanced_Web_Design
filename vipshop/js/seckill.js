/* ============================================================
   唯品会特卖商城 - 限时秒杀页脚本
   24001010817 梁钰承
   JS效果：整页倒计时 + 秒杀进度条渲染
   数据接口：data/seckill.json
   ============================================================ */

liangFetchJSON("data/seckill.json").then(function (res) {
    /* 渲染秒杀商品网格 */
    var html = "";
    res.data.forEach(function (item) {
        var off = Math.round((1 - item.price / item.originalPrice) * 10);
        var percent = Math.min(100, Math.round(item.sold / item.total * 100));
        html += '<li class="liang-goods-card">'
            + '<a href="detail.html?id=' + item.id + '"><img src="' + item.img + '" alt="' + item.name + '"></a>'
            + '<div class="liang-goods-info">'
            + '<p class="liang-goods-brand">' + item.brand + '</p>'
            + '<p class="liang-goods-name">' + item.name + '</p>'
            + '<p class="liang-goods-price"><em>¥</em><strong>' + item.price + '</strong><del>¥' + item.originalPrice + '</del></p>'
            + '<div class="liang-seckill-progress">已抢' + percent + '%</div>'
            + '</div>'
            + '<span class="liang-goods-discount">' + off + '折</span>'
            + '</li>';
    });
    document.getElementById("liangSeckillList").innerHTML = html;

    /* 倒计时（JS效果12：实时倒计时） */
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    function tick() {
        var now = new Date();
        var end = new Date();
        end.setHours(res.hour, res.minute, 0, 0);
        if (now >= end) end.setDate(end.getDate() + 1);
        var diff = Math.floor((end - now) / 1000);
        document.getElementById("liangHour").textContent = pad(Math.floor(diff / 3600));
        document.getElementById("liangMinute").textContent = pad(Math.floor(diff % 3600 / 60));
        document.getElementById("liangSecond").textContent = pad(diff % 60);
    }
    tick();
    setInterval(tick, 1000);
}).catch(function (err) {
    console.error(err);
    liangToast("秒杀数据加载失败");
});
