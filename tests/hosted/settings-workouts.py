import subprocess, time, sys, os
from playwright.sync_api import sync_playwright
os.chdir(os.path.dirname(os.path.abspath(__file__)))
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8792", "-d", "site"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
MOCK = open("mock-supabase.js").read()
os.makedirs("shots", exist_ok=True)
def routes(ctx):
    ctx.route("https://cdn.jsdelivr.net/**", lambda r: r.fulfill(body=MOCK, content_type="application/javascript"))
    ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(body="", content_type="text/css"))
fails = []
def check(name, cond):
    print(("PASS " if cond else "FAIL ") + name); cond or fails.append(name)
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2); routes(ctx)
        pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("http://localhost:8792/"); pg.wait_for_selector("#lg-email")
        pg.fill("#lg-email", "jack@example.com"); pg.fill("#lg-pass", "Start-1234"); pg.click("#lg-btn")
        pg.wait_for_selector("#setsheet", state="visible"); pg.fill("#su-weight", "80")
        pg.click('[data-st="set-next"]'); pg.click('[data-sprog="fullbody"]')
        for _ in range(3): pg.click('[data-st="set-next"]')
        pg.click('[data-st="set-start"]'); pg.wait_for_selector("#setsheet", state="hidden"); pg.wait_for_timeout(800)
        pg.click("#setcog"); pg.wait_for_timeout(300)
        box = pg.locator("#setbody .prpanel")
        check("One box holds Programme and all three workouts", box.locator(".prline").count() == 1 and box.locator("details.swk").count() == 3)
        check("No separate workout panels left", pg.locator("#setbody details.panel.swk").count() == 0)
        sw = pg.evaluate("document.getElementById('setbody').scrollWidth"); check("No sideways scroll at 390px", sw <= 390)
        for scheme in ("light", "dark"):
            pg.emulate_media(color_scheme=scheme); pg.wait_for_timeout(150)
            box.scroll_into_view_if_needed(); box.screenshot(path=f"shots/settings-workouts-{scheme}.png")
        pg.emulate_media(color_scheme="light")
        pg.click('#setbody details[data-swk="1"] > summary'); pg.wait_for_timeout(200)
        check("A workout opens inside the box", pg.locator('#setbody details[data-swk="1"]').get_attribute("open") is not None)
        box.screenshot(path="shots/settings-workout-open.png")
        pg.click('[data-st="set-presets"]'); pg.wait_for_timeout(200)
        check("Change: switcher shows, workout rows step aside", box.locator(".pritem").count() >= 2 and box.locator("details.swk").count() == 0)
        box.screenshot(path="shots/settings-change.png")
        pg.click('[data-st="set-presets"]'); pg.wait_for_timeout(200)
        check("Close: workout rows come back", box.locator("details.swk").count() == 3)
        check("No script errors", not errs)
        b.close()
finally:
    srv.terminate()
print("ALL PASS" if not fails else f"{len(fails)} FAILED")
