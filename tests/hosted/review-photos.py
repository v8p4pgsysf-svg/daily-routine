"""Weekly review photos: the × deletes at once with a short Undo; the file leaves storage only after the undo window.
Run next to site/ (see README). Screenshots go to shots/."""
import subprocess, time, sys, os, base64, tempfile
from playwright.sync_api import sync_playwright
os.chdir(os.path.dirname(os.path.abspath(__file__)))
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8798", "-d", "site"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
MOCK = open("mock-supabase.js").read()
os.makedirs("shots", exist_ok=True)
fails = []
def check(name, cond):
    print(("PASS " if cond else "FAIL ") + name); cond or fails.append(name)
stored = lambda pg: pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('mock-storage')||'{}')).length")
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        ctx.route("https://cdn.jsdelivr.net/**", lambda r: r.fulfill(body=MOCK, content_type="application/javascript"))
        ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(body="", content_type="text/css"))
        pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("http://localhost:8798/"); pg.wait_for_selector("#lg-email")
        pg.fill("#lg-email", "jack@example.com"); pg.fill("#lg-pass", "Start-1234"); pg.click("#lg-btn")
        pg.wait_for_selector("#setsheet", state="visible"); pg.fill("#su-weight", "80")
        pg.click('[data-st="set-next"]'); pg.click('[data-sprog="fullbody"]')
        for _ in range(3): pg.click('[data-st="set-next"]')
        pg.click('[data-st="set-start"]'); pg.wait_for_selector("#setsheet", state="hidden"); pg.wait_for_timeout(600)
        # open the weekly review and add two photos (a real JPEG made in the page)
        if pg.get_attribute("#revtoggle", "aria-expanded") != "true": pg.click("#revtoggle"); pg.wait_for_timeout(500)
        jpg = pg.evaluate("""()=>{const c=document.createElement('canvas');c.width=300;c.height=400;const x=c.getContext('2d');x.fillStyle='#7aa58b';x.fillRect(0,0,300,400);return c.toDataURL('image/jpeg',.8).split(',')[1]}""")
        f = os.path.join(tempfile.mkdtemp(), "photo.jpg"); open(f, "wb").write(base64.b64decode(jpg))
        for _ in range(2):
            pg.set_input_files("#phfile", f); pg.wait_for_function("!document.querySelector('#phadd')||!document.querySelector('#phadd').disabled", timeout=10000); pg.wait_for_timeout(300)
        check("Two photos in the review strip and in storage", pg.locator("#photos .thumb").count() == 2 and stored(pg) == 2)
        # one tap deletes
        pg.click('#photos [data-rm="0"]'); pg.wait_for_timeout(200)
        check("One tap on × deletes it from the strip", pg.locator("#photos .thumb").count() == 1)
        check("…and offers Undo", pg.locator("#ph-undo").is_visible() and "Photo deleted" in pg.inner_text("#phmsg"))
        pg.locator("#review-sec").screenshot(path="shots/review-undo.png")
        check("The file stays in storage while Undo is offered", stored(pg) == 2)
        pg.click("#ph-undo"); pg.wait_for_timeout(200)
        check("Undo puts it back in the same place", pg.locator("#photos .thumb").count() == 2 and pg.inner_text("#phmsg").strip() == "")
        # delete and let the window pass
        pg.click('#photos [data-rm="1"]'); pg.wait_for_timeout(6600)
        check("After a few seconds the Undo goes and the file is deleted", pg.locator("#photos .thumb").count() == 1 and not pg.locator("#ph-undo").is_visible() and stored(pg) == 1)
        # deleting then switching away from the app makes it final straight away
        pg.click('#photos [data-rm="0"]'); pg.wait_for_timeout(150)
        pg.evaluate("Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'))"); pg.wait_for_timeout(300)
        check("Leaving the app makes a pending delete final", stored(pg) == 0 and pg.locator("#photos .thumb").count() == 0)
        check("No 'Remove?' step anywhere", "Remove?" not in pg.inner_text("#review-sec"))
        check("No script errors", not errs)
        b.close()
finally:
    srv.terminate()
print("ALL PASS" if not fails else f"{len(fails)} FAILED")
