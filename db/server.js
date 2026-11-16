/* lyc_0817 · 2026-11-12 13:51:33 · DeepSeek-V4.1-Flash · 诗词数据服务器 ——
   读取同目录下的 db.json，向浏览器开放两个 GET 接口：
   ① /api/poems   返回 poems 数组（pic / title / content / author）
   ② /api/authors 返回 authors 数组（name / dynasty / intro）
   启动方式：在本 db 文件夹内执行 node server.js，端口 3005。 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const lyc_0817_app = express();
const lyc_0817_port = 3005;
const lyc_0817_dbPath = path.join(__dirname, 'db.json');

/* lyc_0817 · 读取数据库文件 —— 每次请求都重新读一次，改完 db.json 刷新页面即可看到新数据 */
function lyc_0817_readDb() {
  return JSON.parse(fs.readFileSync(lyc_0817_dbPath, 'utf-8'));
}

/* lyc_0817 · 跨域通行证 —— 允许页面用 file:// 或其它端口直接请求本接口 */
lyc_0817_app.use(function (req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

/* lyc_0817 · 接口一：诗词列表 —— 返回 db.json 中的 poems 数组 */
lyc_0817_app.get('/api/poems', function (req, res) {
  try {
    res.json(lyc_0817_readDb().poems);
  } catch (err) {
    // db.json 写法有误（少引号、多逗号）时会走到这里，避免整个服务崩掉
    res.status(500).json({ error: 'db.json 解析失败：' + err.message });
  }
});

/* lyc_0817 · 接口二：作者列表 —— 返回 db.json 中的 authors 数组 */
lyc_0817_app.get('/api/authors', function (req, res) {
  try {
    res.json(lyc_0817_readDb().authors);
  } catch (err) {
    res.status(500).json({ error: 'db.json 解析失败：' + err.message });
  }
});

/* lyc_0817 · 启动监听 —— 终端出现下面这行提示即代表服务已就绪 */
lyc_0817_app.listen(lyc_0817_port, function () {
  console.log('数据服务器已启动：http://localhost:' + lyc_0817_port + '/api/poems');
  console.log('作者接口：http://localhost:' + lyc_0817_port + '/api/authors');
});
