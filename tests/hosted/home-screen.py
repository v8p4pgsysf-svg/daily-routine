import http.server, threading, functools, os, sys
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, "site"); OUT = os.path.join(HERE, "shots"); os.makedirs(OUT, exist_ok=True)
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 8791), functools.partial(http.server.SimpleHTTPRequestHandler, directory=SITE))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = "http://127.0.0.1:8791/index.html"
SAFARI = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1"
INSTA = SAFARI.replace("Safari/604.1", "Instagram 350.0.0 (iPhone15,2; iOS 18_6)")
ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36"
fails = []
def check(name, cond):
    print(("PASS " if cond else "FAIL ") + name); cond or fails.append(name)
with sync_playwright() as p:
    b = p.chromium.launch()
    def page(ua, scheme="light", touch=True, init=""):
        ctx = b.new_context(user_agent=ua, viewport={"width": 390, "height": 844}, color_scheme=scheme, has_touch=touch, is_mobile=touch, device_scale_factor=2)
        if init: ctx.add_init_script(init)
        pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_selector("#login:not([hidden])"); pg.wait_for_timeout(300); return pg, errs
    vis = lambda pg, sel: pg.locator(sel).first.is_visible()
    for scheme in ("light", "dark"):
        pg, errs = page(SAFARI, scheme)
        pg.screenshot(path=f"{OUT}/iphone-safari-{scheme}.png", full_page=True)
        if scheme == "light":
            check("iPhone Safari: card shows with the steps", vis(pg, "#lg-a2hs") and pg.locator(".lg-steps li").count() == 4)
            check("iPhone Safari: sign-in form waits behind the card", not vis(pg, "#lg-fp"))
            check("iPhone Safari: keyboard not opened (nothing focused)", pg.evaluate("document.activeElement===document.body"))
            sw = pg.evaluate("document.getElementById('login').scrollWidth")
            check("iPhone Safari: no sideways scroll at 390px", sw <= 390)
            pg.click("#lg-skip"); pg.wait_for_timeout(200)
            check("Continue in Safari: card gone, form shown", not vis(pg, "#lg-a2hs") and vis(pg, "#lg-fp"))
            pg.screenshot(path=f"{OUT}/iphone-after-skip.png")
            pg.reload(); pg.wait_for_selector("#login:not([hidden])"); pg.wait_for_timeout(300)
            check("Continue in Safari: remembered on the next visit", not vis(pg, "#lg-a2hs") and vis(pg, "#lg-fp"))
            check("No script errors (Safari)", not errs)
    pg, errs = page(INSTA)
    pg.screenshot(path=f"{OUT}/iphone-instagram.png", full_page=True)
    check("Instagram's browser: 'Open in Safari first'", "Open in Safari first" in pg.inner_text("#lg-a2hs"))
    pg, errs = page(SAFARI, init="Object.defineProperty(navigator,'standalone',{get:()=>true})")
    check("Opened from the Home Screen: no card, form shown", not vis(pg, "#lg-a2hs") and vis(pg, "#lg-fp"))
    pg, errs = page("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15", touch=False)
    check("Desktop Safari: no card", not vis(pg, "#lg-a2hs") and vis(pg, "#lg-fp"))
    pg, errs = page(ANDROID)
    check("Android before the browser offers install: no card", not vis(pg, "#lg-a2hs"))
    pg.evaluate("""window.__prompted=0;const e=new Event('beforeinstallprompt',{cancelable:true});e.prompt=async()=>{window.__prompted++};e.userChoice=Promise.resolve({outcome:'accepted'});dispatchEvent(e)""")
    pg.wait_for_timeout(100)
    check("Android: Install card appears, form still visible", vis(pg, "#lg-inst") and vis(pg, "#lg-fp"))
    pg.screenshot(path=f"{OUT}/android.png", full_page=True)
    pg.click("#lg-inst"); pg.wait_for_timeout(200)
    check("Android: Install opens the browser's prompt, then the card goes", pg.evaluate("window.__prompted") == 1 and not vis(pg, "#lg-a2hs"))
    check("No script errors (Android)", not errs)
    b.close()
print(f"{'ALL PASS' if not fails else str(len(fails))+' FAILED'}")
srv.shutdown()
