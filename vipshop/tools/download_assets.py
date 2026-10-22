"""Download the photographed demo catalog; record origins and SHA-256 hashes.

Run from any directory with Python 3. No generated images or runtime remote URLs.
"""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
PRODUCT_IDS = [186, 4, 162, 178, 119, 177, 83, 90, 166, 1, 85, 88, 84, 164, 91]
EXTRA_PRODUCTS = [
    ("dummyjson", 172), ("dummyjson", 173), ("dummyjson", 174),
    ("dummyjson", 175), ("dummyjson", 176), ("fakestore", 1),
    ("dummyjson", 163), ("dummyjson", 165), ("dummyjson", 179),
    ("dummyjson", 180), ("dummyjson", 181),
    ("dummyjson", 2), ("dummyjson", 3), ("dummyjson", 5),
    ("dummyjson", 6), ("dummyjson", 7), ("dummyjson", 8),
    ("dummyjson", 118), ("dummyjson", 120),
    ("dummyjson", 86), ("dummyjson", 87),
    ("fakestore", 2), ("fakestore", 3), ("fakestore", 4),
    ("dummyjson", 185), ("dummyjson", 187), ("dummyjson", 188), ("dummyjson", 189),
    ("dummyjson", 89), ("dummyjson", 92),
    ("dummyjson", 140), ("dummyjson", 146), ("dummyjson", 147),
    ("dummyjson", 151), ("dummyjson", 152), ("dummyjson", 153),
]


def download(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                return response.read()
        except (OSError, TimeoutError):
            if attempt == 2:
                raise


def main():
    catalog = json.loads(download("https://dummyjson.com/products?limit=0"))["products"]
    clothing = json.loads(download("https://fakestoreapi.com/products"))
    selected = []
    for local_id, (provider, pid) in enumerate(
            [("dummyjson", pid) for pid in PRODUCT_IDS] + EXTRA_PRODUCTS, 1):
        pool = catalog if provider == "dummyjson" else clothing
        product = dict(next(p for p in pool if p["id"] == pid))
        product.update(localId=local_id, provider=provider)
        if provider == "fakestore":
            product["images"] = [product["image"]]
        selected.append(product)
    tasks = []
    for local_id, product in enumerate(selected, 1):
        for view, url in enumerate(product["images"], 1):
            extension = Path(url.split("?")[0]).suffix.lower()
            origin = "dummyjson.com" if product["provider"] == "dummyjson" else "fakestoreapi.com"
            tasks.append((f"img/products/product-{local_id}-{view}{extension}", url,
                          f"https://{origin}/products/{product['id']}", product["title"]))
    tasks.append(("img/vip-favicon.ico", "https://www.vip.com/favicon.ico",
                  "https://www.vip.com/", "唯品会官网 favicon"))

    def save(task):
        relative, url, page, title = task
        path = ROOT / relative
        content = path.read_bytes() if path.exists() else download(url)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return {"file": relative, "url": url, "sourcePage": page, "subject": title,
                "downloadDate": "2026-10-15", "sha256": hashlib.sha256(content).hexdigest()}

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        manifest = list(pool.map(save, tasks))
    (ROOT / "data/image-sources.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ROOT / "tools/source-products.json").write_text(
        json.dumps(selected, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Downloaded {len(manifest)} original assets with provenance.")


if __name__ == "__main__":
    main()
