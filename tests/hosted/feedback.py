"""Feedback: the icon (375px and up) and Settings → Send feedback (everyone) open the same sheet;
sending stores one row as the signed-in person; offline keeps the draft. Screenshots go to shots/.
Run next to site/ (see README)."""
import subprocess, time, sys, os, json
from playwright.sync_api import sync_playwright
os.chdir(os.path.dirname(os.path.abspath(__file__)))
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8796", "-d", "site"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
MOCK = open("mock-supabase.js").read()
os.makedirs("shots", exist_ok=True)
fails = []
def check(name, cond):
    print(("PASS " if cond else "FAIL ") + name); cond or fails.append(name)
TOPBAR = """()=>{const t=document.querySelector('.tabs');const r=t.getBoundingClientRect();
  const vis=[...t.children].filter(e=>e.offsetParent);const last=vis[vis.length-1].getBoundingClientRect();
  const cog=document.getElementById('setcog').getBoundingClientRect();
  return {overflow:t.scrollWidth>t.clientWidth+1,cogRightGap:Math.round(r.right-cog.right),wrapped:vis.some(e=>e.getBoundingClientRect().top>r.top+20)}}"""
fb = lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('mock-feedback')||'[]')")
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        ctx.route("https://cdn.jsdelivr.net/**", lambda r: r.fulfill(body=MOCK, content_type="application/javascript"))
        ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(body="", content_type="text/css"))
        pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("http://localhost:8796/"); pg.wait_for_selector("#lg-email")
        pg.fill("#lg-email", "jack@example.com"); pg.fill("#lg-pass", "Start-1234"); pg.click("#lg-btn")
        pg.wait_for_selector("#setsheet", state="visible"); pg.fill("#su-weight", "80")
        pg.click('[data-st="set-next"]'); pg.click('[data-sprog="fullbody"]')
        for _ in range(3): pg.click('[data-st="set-next"]')
        pg.click('[data-st="set-start"]'); pg.wait_for_selector("#setsheet", state="hidden"); pg.wait_for_timeout(500)

        # top bar at each width
        for w, shown in ((390, True), (375, True), (320, False)):
            pg.set_viewport_size({"width": w, "height": 844}); pg.wait_for_timeout(150)
            m = pg.evaluate(TOPBAR)
            check(f"{w}px: icon {'shown' if shown else 'hidden'}, nothing overflows, cog at the right edge",
                  pg.locator("#fbbtn").is_visible() == shown and not m["overflow"] and not m["wrapped"] and m["cogRightGap"] <= 1)
            for scheme in ("light", "dark"):
                if w != 375 and scheme == "dark": continue
                pg.emulate_media(color_scheme=scheme); pg.locator(".tabs").screenshot(path=f"shots/topbar-{w}-{scheme}.png")
            pg.emulate_media(color_scheme="light")
        pg.set_viewport_size({"width": 390, "height": 844}); pg.wait_for_timeout(150)

        # open from the icon, send an empty message, then a real one
        pg.click("#fbbtn"); pg.wait_for_timeout(200)
        check("Icon opens the feedback sheet, with the text box focused", pg.locator("#fbsheet").is_visible() and pg.evaluate("document.activeElement.id") == "fb-text")
        pg.fill("#fb-text", "No kind chosen"); pg.click('[data-st="fb-send"]'); pg.wait_for_timeout(100)
        check("Idea or Problem must be chosen first; nothing sent", "Choose Idea or Problem" in pg.inner_text("#fb-msg") and fb(pg) == [])
        pg.click('[data-fbk="problem"]')
        check("Choosing one clears the hint", pg.inner_text("#fb-msg").strip() == "")
        pg.fill("#fb-text", ""); pg.click('[data-st="fb-send"]'); pg.wait_for_timeout(100)
        check("An empty message is refused; nothing sent", "Write something first" in pg.inner_text("#fb-msg") and fb(pg) == [])
        check("The intro no longer mentions who reads it", "whoever runs" not in pg.inner_text("#fbbody"))
        check("Choosing Problem changes the prompt", "What happened" in pg.get_attribute("#fb-text", "placeholder"))
        pg.fill("#fb-text", "The Log cardio button didn't respond on Tuesday.")
        for scheme in ("light", "dark"):
            pg.emulate_media(color_scheme=scheme); pg.wait_for_timeout(100); pg.screenshot(path=f"shots/feedback-sheet-{scheme}.png")
        pg.emulate_media(color_scheme="light")
        # cancel keeps the draft
        pg.click('[data-st="fb-cancel"]'); pg.wait_for_timeout(100); pg.click("#fbbtn"); pg.wait_for_timeout(150)
        check("Cancel keeps the draft and the chosen kind", "Log cardio" in pg.input_value("#fb-text") and pg.get_attribute('[data-fbk="problem"]', "aria-pressed") == "true")
        # offline: kept, with a clear message
        pg.evaluate("window.__mockOffline=true"); pg.click('[data-st="fb-send"]'); pg.wait_for_timeout(300)
        check("Offline: says so and keeps the message", "offline" in pg.inner_text("#fb-msg") and "Log cardio" in pg.input_value("#fb-text") and fb(pg) == [])
        pg.evaluate("window.__mockOffline=false"); pg.click('[data-st="fb-send"]'); pg.wait_for_timeout(300)
        check("Send: says thanks", "Thanks" in pg.inner_text("#fbbody"))
        rows = fb(pg); r = rows[0] if rows else {}
        check("One row saved as the signed-in person, with kind, message, version and device",
              len(rows) == 1 and r.get("email") == "jack@example.com" and r.get("kind") == "problem" and "Log cardio" in r.get("message", "")
              and len(r.get("app_version", "")) == 14 and "browser" in r.get("device", ""))
        pg.wait_for_timeout(1700)
        check("The sheet closes itself after the thanks", not pg.locator("#fbsheet").is_visible())
        pg.click("#fbbtn"); pg.wait_for_timeout(150)
        check("Next time it starts empty", pg.input_value("#fb-text") == "" and pg.get_attribute('[data-fbk="problem"]', "aria-pressed") == "false")
        pg.click('[data-st="fb-cancel"]')

        # Settings → Send feedback, on the narrowest screen (no icon there)
        pg.set_viewport_size({"width": 320, "height": 700}); pg.wait_for_timeout(150)
        pg.click("#setcog"); pg.wait_for_timeout(200)
        btn = pg.locator('#setbody [data-st="feedback"]')
        check("Settings ends with a centred red Send feedback link, no box",
              btn.count() == 1 and pg.evaluate("document.getElementById('setbody').lastElementChild.className") == "fbset"
              and pg.locator("#setbody .fbset .panel").count() == 0
              and abs(pg.evaluate("(()=>{const b=document.querySelector('.fblink').getBoundingClientRect();return (b.left+b.right)/2-innerWidth/2})()")) < 2)
        pg.evaluate("document.getElementById('setsheet').scrollTop=1e6"); pg.wait_for_timeout(100)
        for scheme in ("light", "dark"):
            pg.emulate_media(color_scheme=scheme); pg.wait_for_timeout(100); pg.screenshot(path=f"shots/settings-bottom-320-{scheme}.png")
        pg.emulate_media(color_scheme="light")
        btn.click(); pg.wait_for_timeout(200)
        check("It opens the sheet on top of Settings", pg.locator("#fbsheet").is_visible() and pg.locator("#setsheet").is_visible())
        pg.fill("#fb-text", "Could there be a rowing option?"); pg.click('[data-fbk="idea"]'); pg.click('[data-st="fb-send"]'); pg.wait_for_timeout(1900)
        check("Sent from Settings; back on Settings afterwards", len(fb(pg)) == 2 and fb(pg)[1]["kind"] == "idea" and not pg.locator("#fbsheet").is_visible() and pg.locator("#setsheet").is_visible())
        sw = pg.evaluate("document.getElementById('setsheet').scrollWidth"); check("No sideways scroll at 320px", sw <= 320)
        check("No script errors", not errs)
        b.close()
finally:
    srv.terminate()
print("ALL PASS" if not fails else f"{len(fails)} FAILED")
