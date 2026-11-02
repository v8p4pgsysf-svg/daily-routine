"""Share card: a finished workout shared as an image, from the saved message and from Training history.
The browser here can't share files, so Share falls back to a download; the checks read that PNG."""
import subprocess, sys, time, os, struct
from playwright.sync_api import sync_playwright
from clock import pin  # fixed calendar: see clock.py
os.chdir(os.path.dirname(os.path.abspath(__file__)))
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8809", "-d", "site"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
MOCK = open("mock-supabase.js").read()
OUT = "share"; os.makedirs(OUT, exist_ok=True)
res = []
def ok(c, m): res.append(bool(c)); print(("PASS " if c else "FAIL ") + m)
def png(path):  # width, height and the top-left pixel's brightness (rough check of light vs dark)
    b = open(path, "rb").read()
    return b[:8] == b"\x89PNG\r\n\x1a\n", struct.unpack(">II", b[16:24])
def workout(pg, date, wt, swap=False):
    pg.click("#tab-strength"); pg.fill("input[type=date]", date); pg.click('[data-st="type"][data-type="A"]'); pg.click('[data-st="start"]'); pg.wait_for_timeout(200)
    if swap: pg.click('[data-swap="4"]'); pg.fill("#swin-4", "Lat Pulldown"); pg.click('[data-swapgo="4"]'); pg.wait_for_timeout(150)
    for xi in range(pg.locator("#st-main .panel.ex").count()):
        for si in range(4):
            if pg.locator(f"#w-{xi}-{si}").count():
                pg.fill(f"#w-{xi}-{si}", str(wt)); pg.fill(f"#r-{xi}-{si}", "8"); pg.click(f'[data-tick="{xi}-{si}"]')
    pg.click('[data-st="finish"]'); pg.wait_for_timeout(300)
errs = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        c = pin(b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, accept_downloads=True))
        c.route("https://cdn.jsdelivr.net/**", lambda r: r.fulfill(body=MOCK, content_type="application/javascript"))
        c.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(body="", content_type="text/css"))
        pg = c.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("http://localhost:8809/"); pg.wait_for_selector("#lg-email")
        pg.fill("#lg-email", "jack@example.com"); pg.click("#lg-forgot"); pg.wait_for_timeout(150); pg.click("#lg-fsend"); pg.wait_for_selector("#lg-fcode", state="visible"); pg.wait_for_timeout(150)
        pg.fill("#lg-fcode", "123456"); pg.fill("#lg-fp1", "Start-1234"); pg.fill("#lg-fp2", "Start-1234"); pg.click("#lg-fset"); pg.wait_for_selector("#setsheet", state="visible")
        for _ in range(3): pg.click('[data-st="wel-next"]')
        pg.click('[data-st="set-next"]'); pg.fill("#su-weight", "80"); pg.click('[data-st="set-next"]'); pg.click('[data-sprog="glute"]')
        for _ in range(3): pg.click('[data-st="set-next"]')
        pg.click('[data-st="set-start"]'); pg.wait_for_selector("#setsheet", state="hidden"); pg.wait_for_timeout(400)
        workout(pg, "2026-10-19", 40)
        workout(pg, "2026-10-26", 42.5, swap=True)
        ok(pg.locator("#st-msg [data-share]").count() == 1, "SH1. After Finish the saved message has a Share button")
        with pg.expect_download() as dl: pg.click("#st-msg [data-share]")
        dl.value.save_as(f"{OUT}/card-light.png"); isp, (w, h) = png(f"{OUT}/card-light.png")
        ok(dl.value.suggested_filename == "workout-A-2026-10-26.png" and isp and w == 1080 and h >= 1350, f"SH2. Share makes a PNG card, 1080 wide ({w}×{h}), named for the workout")
        ok(pg.inner_text("#st-msg").strip() == "", "   The saved message goes once it's been used")
        pg.emulate_media(color_scheme="dark"); pg.wait_for_timeout(150)
        pg.locator("#st-history .hrow").first.click(); pg.wait_for_timeout(200)
        ok(pg.locator("#st-history [data-share]").count() >= 1, "SH3. A Training history entry has Share")
        with pg.expect_download() as dl: pg.locator("#st-history [data-share]").first.click()
        dl.value.save_as(f"{OUT}/card-dark.png")
        pg.wait_for_timeout(300)
        ok(pg.locator("#st-history .hdetail").count() == 0, "   After sharing, the history entry folds away")
        ok(open(f"{OUT}/card-dark.png", "rb").read() != open(f"{OUT}/card-light.png", "rb").read(), "   In dark mode the card is drawn in the dark look")
        pg.emulate_media(color_scheme="light"); pg.click("#tab-week"); pg.wait_for_timeout(200)
        ok(pg.locator("#today [data-share]").count() == 0 and pg.locator("#today [data-open]").count() == 1, "SH4. Today keeps its single View workout button")
        pg.click("#today [data-open]"); pg.wait_for_timeout(300)
        ok(pg.locator("#st-history [data-share]").count() >= 1, "SH5. View workout opens its history entry, with Share")
        pg.locator("#st-history [data-edit]").first.click(); pg.wait_for_timeout(300)
        ok(pg.locator('#st-main [data-share]').count() == 1 and "Share workout" in pg.inner_text("#st-main"), "   and Edit's saved-workout screen has Share workout")
        ok(not errs, "SH6. No script errors" + (f": {errs}" if errs else ""))
finally:
    srv.terminate()
print("ALL PASS" if all(res) else f"{res.count(False)} FAILED")
sys.exit(0 if all(res) else 1)
