/* Browser regression checks. Usage: node tools/verify.cjs (server on port 8080). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.resolve(__dirname, '..');
const BASE = 'http://127.0.0.1:8080/';
const pages = ['index', 'category', 'seckill', 'detail', 'cart', 'profile', 'settings', 'login', 'admin'];
const screenshotDir = path.join(ROOT, 'docs/screenshots');
fs.mkdirSync(screenshotDir, { recursive: true });

(async () => {
    const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [], external = [], failures = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('request', request => {
        if (/^https?:/.test(request.url()) && !request.url().startsWith(BASE)) external.push(request.url());
    });
    page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
    async function go(file) {
        await page.goto(BASE + file, { waitUntil: 'networkidle' });
    }
    async function imageCheck() {
        await page.locator('img').evaluateAll(images => images.forEach(img => { img.loading = 'eager'; }));
        await page.waitForFunction(() => Array.from(document.images).every(img => img.complete));
        const broken = await page.locator('img').evaluateAll(images => images.filter(img => !img.naturalWidth).map(img => img.src));
        assert.deepEqual(broken, [], 'Broken images on ' + page.url());
    }

    for (const width of [320, 390, 420, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        for (const name of pages) {
            await go(name + '.html');
            await imageCheck();
            assert.match(await page.title(), /24001010817梁钰承/);
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
            assert.equal(overflow, false, `${name} overflows at ${width}px`);
            if (name === 'index') {
                const layout = await page.locator('#liangSeckillList').evaluate(list => {
                    const box = list.getBoundingClientRect();
                    const images = Array.from(list.querySelectorAll('img'));
                    const rects = images.map(img => img.getBoundingClientRect());
                    return { count: images.length, contained: rects.every(rect => rect.left >= box.left - 1 && rect.right <= box.right + 1),
                        sameRow: rects.every(rect => Math.abs(rect.top - rects[0].top) < 1),
                        uncropped: images.every(img => getComputedStyle(img).objectFit === 'contain') };
                });
                assert.deepEqual(layout, { count: 4, contained: true, sameRow: true, uncropped: true }, `Four complete images at ${width}px`);
                if (width === 390) {
                    await page.screenshot({ path: path.join(screenshotDir, 'home-preview.png') });
                    await page.locator('.liang-seckill').evaluate(section => {
                        window.scrollTo(0, window.scrollY + section.getBoundingClientRect().top - 110);
                    });
                    await page.locator('.liang-seckill').screenshot({ path: path.join(screenshotDir, 'seckill-four.png') });
                    await page.evaluate(() => window.scrollTo(0, 0));
                }
            }
            if (width === 390) await page.screenshot({ path: path.join(screenshotDir, name + '.png'), fullPage: true });
        }
    }
    console.log('PASS: 9 pages at 320/390/420/1280px; titles, images, overflow; all four sale images fully visible.');

    await page.setViewportSize({ width: 390, height: 844 });
    const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/products.json'))).data;
    const categories = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/categories.json'))).data;
    const categoryCount = name => products.filter(p => p.category === name || (p.tags || []).includes(name)).length;
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/image-sources.json')));
    for (const entry of manifest) {
        assert.ok(entry.file.startsWith('img/'));
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, entry.file))).digest('hex'), entry.sha256);
    }
    const sourceFiles = new Set(manifest.map(entry => entry.file));
    for (const product of products) {
        assert.ok(product.gallery.every(file => sourceFiles.has(file)), 'Each photo has a download source');
        await go('detail.html?id=' + product.id);
        assert.equal(await page.locator('#liangName').textContent(), product.brand + ' ' + product.name);
        assert.equal(await page.locator('#liangMainImg').getAttribute('src'), product.gallery[0]);
        assert.equal(await page.locator('#liangThumbs button').count(), product.gallery.length);
        assert.equal(await page.locator('#liangSpecName').textContent(), product.specLabel);
        await page.locator('#liangThumbs button').last().click();
        assert.ok((await page.locator('#liangMainImg').getAttribute('src')).endsWith(product.gallery.at(-1)));
        await imageCheck();
    }
    await go('index.html');
    assert.equal(await page.locator('#liangSeckillList .liang-seckill-item').count(), 4);
    assert.equal(await page.locator('#liangSeckillList img').count(), 4);
    assert.equal(await page.locator('#liangSeckillList img').evaluateAll(images => images.every(img => img.naturalWidth > 0)), true);
    assert.equal(await page.locator('#liangGoodsList .liang-goods-card').count(), products.length);
    await page.locator('#liangSearchInput').fill('puma');
    await page.locator('#liangSearchBtn').click();
    assert.equal(await page.locator('#liangGoodsList .liang-goods-card').count(), 1);
    await page.locator('#liangSearchInput').fill('');
    assert.equal(await page.locator('#liangGoodsList .liang-goods-card').count(), products.length);
    await page.locator('#liangBannerDots button').nth(1).click();
    assert.equal(await page.locator('#liangBannerDots button').nth(1).getAttribute('aria-pressed'), 'true');
    await go('category.html?cat=' + encodeURIComponent('美妆'));
    assert.equal(await page.locator('#liangCatGoods .liang-goods-card').count(), categoryCount('美妆'));
    await page.locator('#liangCatMenu button').filter({ hasText: '男装' }).click();
    assert.equal(await page.locator('#liangCatGoods .liang-goods-card').count(), categoryCount('男装'));
    assert.equal(await page.locator('#liangCatSearch').inputValue(), '男装');
    assert.equal(await page.locator('#liangCatMenu button').filter({ hasText: '内衣' }).count(), 0);
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        assert.equal(await page.locator('#liangCatSec' + i + ' a').count(), categoryCount(category.name));
        for (const group of category.sections) {
            const block = page.locator('#liangCatSec' + i + ' .liang-category-group').filter({ has: page.locator('h4', { hasText: group.title }) });
            assert.ok(group.items.length > 0);
            assert.equal(await block.locator('a').count(), group.items.length);
            for (const item of group.items) {
                const product = products.find(p => p.id === item.productId);
                assert.equal(item.name, product.name);
                assert.equal(item.img, product.img);
            }
        }
    }
    await go('category.html?cat=' + encodeURIComponent('鞋包'));
    await imageCheck();
    const bags = page.locator('#liangCatSec2 .liang-category-group').first();
    assert.match(await bags.locator('h4').textContent(), /包袋精选/);
    assert.equal(await bags.locator('a').count(), 6);
    await page.screenshot({ path: path.join(screenshotDir, 'category-bags.png') });
    await bags.locator('a').first().click();
    assert.match(page.url(), /id=16/);
    assert.equal(await page.locator('#liangSpecName').textContent(), '颜色');
    await page.locator('#liangAddCart').click();
    await go('cart.html');
    assert.match(await page.locator('.liang-cart-item').textContent(), /深蓝色双提手手提包/);
    await go('category.html?q=PUMA');
    await page.locator('#liangCatGoods a').first().click();
    assert.match(page.url(), /id=8/);
    console.log(`PASS: ${products.length} product galleries, ${manifest.length} verified local assets, five populated categories, six bags, correct specs, search and links.`);

    await page.evaluate(() => localStorage.clear());
    await go('detail.html?id=1');
    assert.equal(await page.locator('#liangOffTag').textContent(), '3.3折');
    await page.locator('#liangCountPlus').click();
    await page.locator('#liangAddCart').click();
    await page.locator('#liangSheetClose').click();
    await go('detail.html?id=2');
    await page.locator('#liangAddCart').click();
    await go('cart.html');
    assert.equal(await page.locator('.liang-cart-item').count(), 2);
    await page.locator('.liang-cart-item-check').nth(1).uncheck();
    assert.equal(await page.locator('#liangCartTotal').textContent(), '¥398.00');
    await page.locator('#liangSettleBtn').click();
    assert.equal(await page.locator('.liang-cart-item').count(), 1);
    assert.match(await page.locator('.liang-cart-item').textContent(), /唇膏/);
    await page.locator('#liangCheckAll').uncheck();
    assert.equal(await page.locator('#liangSettleBtn').isDisabled(), true);
    assert.equal(await page.locator('#liangCartTotal').textContent(), '¥0.00');
    await page.locator('.liang-cart-del').click();
    assert.equal(await page.locator('#liangCheckAll').isChecked(), false);
    await go('profile.html');
    await page.locator('.liang-order-nav [data-orders="全部"]').click();
    assert.equal(await page.locator('.liang-order-card').count(), 1);
    await page.locator('.liang-order-nav [data-orders="待付款"]').click();
    assert.equal(await page.locator('.liang-order-card').count(), 0);
    console.log('PASS: cart quantities, cents totals, subset checkout, empty selection and orders.');

    await go('admin.html');
    await page.locator('#liangAdminAddBtn').click();
    await page.locator('#liangNewImg').selectOption('img/products/product-8-1.webp');
    assert.match(await page.locator('#liangNewName').inputValue(), /Future Rider/);
    await page.locator('#liangNewName').fill('测试鞋 <img src=x onerror=alert(1)>');
    await page.locator('#liangNewPrice').fill('19.99');
    await page.locator('#liangNewStock').fill('-1');
    await page.locator('#liangNewSaveBtn').click();
    assert.equal(await page.locator('#liangSheet').evaluate(el => el.classList.contains('liang-show')), true);
    await page.locator('#liangNewStock').fill('2');
    await page.locator('#liangNewSaveBtn').click();
    assert.equal(await page.locator('#liangStatCount').textContent(), String(products.length + 1));
    const addedId = await page.evaluate(() => JSON.parse(localStorage.getItem('liang_admin_extra'))[0].id);
    await go('index.html');
    assert.equal(await page.locator('#liangGoodsList .liang-goods-card').count(), products.length + 1);
    assert.equal(await page.locator('#liangGoodsList img').count(), products.length + 1, 'Text must not inject HTML');
    await go('category.html');
    assert.equal(await page.locator('.liang-category-group').filter({ has: page.locator('h4', { hasText: '更多好物' }) }).locator('a[href="detail.html?id=' + addedId + '"]').count(), 1);
    await go('detail.html?id=' + addedId);
    await page.locator('#liangCountPlus').click();
    await page.locator('#liangCountPlus').click();
    assert.equal(await page.locator('#liangCount').textContent(), '2');
    await page.locator('#liangAddCart').click();
    await page.locator('#liangSheetClose').click();
    await page.locator('#liangAddCart').click();
    await go('cart.html');
    assert.equal(await page.locator('#liangCartTotal').textContent(), '¥39.98');
    await page.locator('[data-act="plus"]').click();
    assert.equal(await page.locator('#liangCartTotal').textContent(), '¥39.98');
    await go('admin.html');
    await page.locator(`[data-extra="${addedId}"]`).click();
    await go('index.html');
    assert.equal(await page.locator('#liangGoodsList .liang-goods-card').count(), products.length);
    await go('cart.html');
    assert.equal(await page.locator('.liang-cart-item').count(), 0);
    await go('admin.html');
    await page.locator('[data-base="2"]').click();
    await go('category.html');
    assert.equal(await page.locator('#liangCatContent a[href="detail.html?id=2"]').count(), 0);
    await go('seckill.html');
    assert.equal(await page.locator('a[href="detail.html?id=2"]').count(), 0);
    console.log('PASS: backend/frontend persistence, input validation, HTML escaping, stock, deletion.');

    await go('login.html');
    await page.locator('[data-tab="register"]').click();
    await page.locator('#liangPhone').fill('13800138000');
    await page.locator('#liangCode').fill('123456');
    await page.locator('#liangSubmitBtn').click();
    assert.match(await page.locator('#liangErr').textContent(), /获取验证码/);
    await page.locator('#liangCodeBtn').click();
    await page.locator('#liangSubmitBtn').click();
    await page.waitForURL('**/profile.html');
    await go('settings.html');
    await page.locator('#liangNicknameInput').fill('测试同学');
    await page.locator('#liangAvatarFile').setInputFiles(path.join(ROOT, 'img/products/product-8-1.webp'));
    await page.waitForFunction(() => document.getElementById('liangAvatarPreview').src.startsWith('data:image/'));
    await page.locator('#liangSaveBtn').click();
    await page.waitForURL('**/profile.html');
    assert.equal(await page.locator('#liangNickname').textContent(), '测试同学');
    await go('settings.html');
    assert.equal(await page.locator('#liangAvatarPreview').isVisible(), true);
    await page.locator('#liangLogout').click();
    await page.waitForURL('**/login.html');
    await page.locator('#liangPhone').fill('13800138000');
    await page.locator('#liangPwd').fill('demo123');
    await page.locator('#liangSubmitBtn').click();
    await page.waitForURL('**/profile.html');
    assert.equal(await page.locator('#liangNickname').textContent(), '测试同学');
    console.log('PASS: demo registration, verification state, avatar preview, saved profile and relogin.');

    assert.deepEqual(errors, [], 'Browser script errors');
    assert.deepEqual(external, [], 'Runtime external resources');
    assert.deepEqual(failures, [], 'Failed HTTP resources');
    const offline = await browser.newContext();
    const local = await offline.newPage();
    const fileErrors = [];
    local.on('pageerror', err => fileErrors.push(err.message));
    for (const name of pages) {
        await local.goto('file:///' + path.join(ROOT, name + '.html').replace(/\\/g, '/'));
        await local.waitForLoadState('load');
    }
    await local.goto('file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/'));
    await local.waitForSelector('#liangGoodsList .liang-goods-card');
    assert.equal(await local.locator('#liangGoodsList .liang-goods-card').count(), products.length);
    assert.deepEqual(fileErrors, []);
    console.log('PASS: no script/HTTP errors, no external runtime requests; 9 file:// previews.');
    await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
