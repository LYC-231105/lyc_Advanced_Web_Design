# AGENTS.md

## Project
- Root contains a vanilla HTML/CSS/JS project set; primary app is `vipshop/` (VIPSHOP mobile mall clone).
- No package.json at root; dependencies: none (no npm/build toolchain). Pure static files.

## Run / Serve (high-signal)
- Must serve over HTTP for `fetch()` to load `vipshop/data/*.json` (file:// uses `vipshop/js/liang-mock.js` fallback).
- From `vipshop/`: `python -m http.server 8080` or `npx serve .` / `npx http-server -p 8080`. Or VS Code Live Server on `vipshop/index.html`.
- View in mobile viewport (e.g. iPhone 12 Pro); app centers in ~420px container.

## Key Conventions (repo-specific)
- Naming: layout selectors prefixed `liang-` (e.g. `liang-main`, `liang-header`), variables/functions/IDs prefixed `liang`/`Liang`.
- CSS: Flexbox primary, CSS variables, no table/float layouts. Global styles in `vipshop/css/liang.css`.
- JS: vanilla ES5+, no frameworks. Common utilities in `vipshop/js/liang-common.js` (fetch wrapper/Toast/cart/back-to-top). Page scripts: `index.js`, `category.js`, `seckill.js`, `detail.js`, `cart.js`, `profile.js`, `settings.js`, `login.js`, `admin.js`.
- Assets: all local under `vipshop/img/`, icons inline/SVG or local files in `vipshop/img/icons/`. No external CDNs.
- Data: 5 local JSON in `vipshop/data/` fetched via `fetch()`. Persistence via `localStorage` (cart/users/admin products). Orders are simulated (no payment/shipping).
- Catalog: 9 pages (index/category/seckill/detail/cart/profile/settings/login/admin). 51 products across categories.

## Gotchas
- file:// vs http:// use different data paths (mock snapshot) — storage not shared between protocols.
- Bottom nav/icon states use CSS filters; icons may be replaced with iconfont SVGs.
- Inventory/limits enforced in cart/detail logic (e.g. per-item limits). 
- Tools: `vipshop/tools/download_assets.py` (refresh assets/manifest), `vipshop/tools/build_mock.py` (sync file:// snapshot), `vipshop/tools/verify.cjs` (checks).

## Quick Start
```bash
cd vipshop
python -m http.server 8080  # http://localhost:8080
```
