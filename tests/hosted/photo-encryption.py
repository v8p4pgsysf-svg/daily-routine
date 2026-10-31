"""Photo encryption end to end, against the mock (shared storage = one browser profile).
Covers: older plain photos secured on first unlock; recovery code card (Not now / saved); storage holds only
ciphertext; a second device unlocks with the password; password change; forgot password + recovery code;
start fresh; new recovery code from Settings; export gets the real photo; delete account removes everything.
Screenshots go to shots/. Run next to site/ (see README)."""
import subprocess, time, sys, os, base64, tempfile, json
from playwright.sync_api import sync_playwright
os.chdir(os.path.dirname(os.path.abspath(__file__)))
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8799", "-d", "site"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
MOCK = open("mock-supabase.js").read()
os.makedirs("shots", exist_ok=True)
fails = []
def check(name, cond):
    print(("PASS " if cond else "FAIL ") + name); cond or fails.append(name)
URL = "http://localhost:8799/"
REC = "(()=>{const r=Object.values(JSON.parse(localStorage.getItem('mock-db')||'{}')).find(r=>r.id==='photokey');return r?r.data:null})()"
HEADS = "Object.fromEntries(Object.entries(JSON.parse(localStorage.getItem('mock-storage')||'{}')).map(([k,v])=>[k.split('/')[1],atob(v.split(',')[1]).slice(0,4)]))"
def shot(pg, name):
    for scheme in ("light", "dark"):
        pg.emulate_media(color_scheme=scheme); pg.wait_for_timeout(80); pg.screenshot(path=f"shots/{name}-{scheme}.png")
    pg.emulate_media(color_scheme="light")
def sign_in(pg, pw, email="jack@example.com"):
    pg.wait_for_selector("#lg-email", state="visible"); pg.fill("#lg-email", email); pg.fill("#lg-pass", pw); pg.click("#lg-btn")
def finish_setup(pg):
    pg.wait_for_selector("#setsheet", state="visible"); pg.fill("#su-weight", "80"); pg.click('[data-st="set-next"]'); pg.click('[data-sprog="fullbody"]')
    for _ in range(3): pg.click('[data-st="set-next"]')
    pg.click('[data-st="set-start"]'); pg.wait_for_selector("#setsheet", state="hidden")
def sign_out(pg):
    pg.wait_for_timeout(1500)
    pg.click("#setcog"); pg.click('[data-st="acct"]'); pg.click('[data-st="sign-out"]'); pg.wait_for_timeout(400)
    if pg.locator("#login").is_hidden() or pg.locator("#lg-email").count() == 0: pg.click('[data-st="sign-out"]')
    pg.wait_for_selector("#lg-email", state="visible")
def open_review(pg):
    pg.click("#tab-week"); pg.wait_for_timeout(200)
    if pg.get_attribute("#revtoggle", "aria-expanded") != "true": pg.click("#revtoggle"); pg.wait_for_timeout(500)
def upload(pg, f):
    pg.set_input_files("#phfile", f)
def thumbs_ready(pg):
    pg.wait_for_function("[...document.querySelectorAll('#photos .thumb img')].every(i=>i.src.startsWith('blob:'))", timeout=10000)
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        ctx.route("https://cdn.jsdelivr.net/**", lambda r: r.fulfill(body=MOCK, content_type="application/javascript"))
        ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(body="", content_type="text/css"))
        pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_selector("#lg-email")
        jpg = pg.evaluate("""()=>{const c=document.createElement('canvas');c.width=300;c.height=400;const x=c.getContext('2d');x.fillStyle='#7aa58b';x.fillRect(0,0,300,400);return c.toDataURL('image/jpeg',.8)}""")
        f = os.path.join(tempfile.mkdtemp(), "photo.jpg"); open(f, "wb").write(base64.b64decode(jpg.split(",")[1]))
        # an older, unencrypted photo already in jack's folder (from before this change)
        uid = pg.evaluate("""(e=>{let h=0;for(const c of e)h=(h*31+c.charCodeAt(0))>>>0;const x=h.toString(16).padStart(8,"0");return `${x}-0000-4000-8000-${x}${x.slice(0,4)}`})('jack@example.com')""")
        OLD = "a" * 32
        pg.evaluate(f"localStorage.setItem('mock-storage',JSON.stringify({{'{uid}/{OLD}':{json.dumps(jpg)}}}))")

        # 1. first sign-in: a key is made; the older photo gets secured once a recovery code is saved
        sign_in(pg, "Start-1234"); finish_setup(pg)
        pg.wait_for_selector("#pk-saved", timeout=10000)
        code = pg.inner_text("#pk-code").strip()
        check("Older plain photo: the recovery code card appears on its own", len(code) == 23 and code.count("-") == 3)
        shot(pg, "enc-recovery-code")
        rec = pg.evaluate(REC)
        check("A key record exists, locked with the password, no recovery lock yet", rec and rec.get("pw") and not rec.get("rc"))
        pg.click("#pk-saved"); pg.wait_for_timeout(1500)
        heads = pg.evaluate(HEADS)
        check("The older photo is now encrypted in storage", heads.get(OLD) == "RPE1")
        check("The record now has a recovery lock too", bool(pg.evaluate(REC).get("rc")))
        check("The unlocked key is kept on this device", bool(pg.evaluate("localStorage.getItem('routine-pk')")))

        # 2. new photo: encrypted before upload, shown decrypted
        open_review(pg); upload(pg, f); pg.wait_for_timeout(300)
        check("No second recovery code card once one is saved", not pg.locator("#pk-saved").is_visible())
        pg.wait_for_function("document.querySelectorAll('#photos .thumb').length===1", timeout=10000); thumbs_ready(pg)
        heads = pg.evaluate(HEADS); new_ids = [k for k in heads if k != OLD]
        check("Storage holds only scrambled bytes (no JPEG anywhere)", len(heads) == 2 and all(v == "RPE1" for v in heads.values()))
        check("The photo shows in the review from memory", pg.get_attribute("#photos .thumb img", "src").startswith("blob:"))
        exp = pg.evaluate(f"window.__routineHost.photoBlob('{new_ids[0]}').then(b=>b.arrayBuffer()).then(a=>[...new Uint8Array(a).slice(0,2)])")
        check("Export gets the real photo back (a JPEG)", exp == [255, 216])

        # 3. a second device (no key here yet): asks for the password once, because there are photos
        pg.wait_for_timeout(1500); pg.evaluate("localStorage.removeItem('routine-pk')"); pg.reload()
        pg.wait_for_selector("#pk-pw", timeout=10000)
        check("New device with photos: asks for the password", "Unlock your photos" in pg.inner_text("#login"))
        open_photo_locked = pg.evaluate("document.querySelector('#photos .thumb img')?.src||''")
        check("Until then, the photo shows as locked", open_photo_locked.startswith("data:image/svg"))
        shot(pg, "enc-unlock")
        pg.fill("#pk-pw", "wrong-one"); pg.click("#pk-go"); pg.wait_for_timeout(500)
        check("Wrong password is refused", "isn't right" in pg.inner_text("#login"))
        pg.fill("#pk-pw", "Start-1234"); pg.click("#pk-go"); pg.wait_for_selector("#login", state="hidden", timeout=10000)
        open_review(pg); thumbs_ready(pg)
        check("Right password: the photo shows", pg.get_attribute("#photos .thumb img", "src").startswith("blob:"))

        # 4. change password in Settings: the key follows it
        pg.click("#setcog"); pg.click('[data-st="acct"]'); pg.click('[data-st="pw-open"]')
        pg.fill("#pw1", "Second-pass-1"); pg.fill("#pw2", "Second-pass-1"); pg.click('[data-st="pw-save"]'); pg.wait_for_timeout(1500)
        pg.click('[data-st="set-cancel"]'); pg.wait_for_timeout(200)
        sign_out(pg); sign_in(pg, "Second-pass-1"); pg.wait_for_selector("#tab-week", state="visible"); pg.wait_for_timeout(1500)
        open_review(pg); thumbs_ready(pg)
        check("After a password change, signing in shows photos with no prompts", not pg.locator("#pk-pw").is_visible() and not pg.locator("#pk-rc").is_visible())

        # 5. forgot password: the recovery code unlocks the photos
        sign_out(pg); pg.click("#lg-forgot"); pg.fill("#lg-femail", "jack@example.com"); pg.click("#lg-fsend"); pg.wait_for_selector("#lg-fcode", state="visible")
        pg.fill("#lg-fcode", "123456"); pg.fill("#lg-fp1", "Third-pass-1"); pg.fill("#lg-fp2", "Third-pass-1"); pg.click("#lg-fset")
        pg.wait_for_selector("#pk-rc", timeout=10000)
        check("After a reset: asks for the recovery code", "Enter your recovery code" in pg.inner_text("#login"))
        shot(pg, "enc-recover")
        pg.fill("#pk-rc", "AAAAA-BBBBB-CCCCC-DDDDD"); pg.click("#pk-go"); pg.wait_for_timeout(500)
        check("Wrong recovery code is refused", "doesn't match" in pg.inner_text("#login"))
        pg.fill("#pk-rc", code.lower().replace("-", " ")); pg.click("#pk-go"); pg.wait_for_selector("#login", state="hidden", timeout=10000)
        open_review(pg); thumbs_ready(pg)
        check("Right code (typed loosely): photos unlocked", pg.get_attribute("#photos .thumb img", "src").startswith("blob:"))
        sign_out(pg); sign_in(pg, "Third-pass-1"); pg.wait_for_selector("#tab-week", state="visible"); pg.wait_for_timeout(1500)
        open_review(pg); thumbs_ready(pg)
        check("…and the key now follows the new password (no prompt next sign-in)", not pg.locator("#pk-rc").is_visible())

        # 6. new recovery code from Settings
        old_rc = pg.evaluate(REC)["rc"]["ct"]
        pg.click("#setcog"); pg.click('[data-st="acct"]'); pg.click('[data-st="new-rc"]'); pg.wait_for_selector("#pk-saved")
        check("Settings: New photo recovery code shows a new code", "Your new recovery code" in pg.inner_text("#login"))
        code2 = pg.inner_text("#pk-code").strip(); pg.click("#pk-saved"); pg.wait_for_timeout(800)
        check("…and replaces the old one", pg.evaluate(REC)["rc"]["ct"] != old_rc and code2 != code)
        pg.click('[data-st="set-cancel"]'); pg.wait_for_timeout(200)

        # 7. reset again without the code: start fresh; old photos show locked; new ones work
        sign_out(pg); pg.click("#lg-forgot"); pg.fill("#lg-femail", "jack@example.com"); pg.click("#lg-fsend"); pg.wait_for_selector("#lg-fcode", state="visible")
        pg.fill("#lg-fcode", "123456"); pg.fill("#lg-fp1", "Fourth-pass-1"); pg.fill("#lg-fp2", "Fourth-pass-1"); pg.click("#lg-fset")
        pg.wait_for_selector("#pk-none", timeout=10000); pg.click("#pk-none")
        check("I don't have it: explains what happens", "Start without your old photos" in pg.inner_text("#login"))
        shot(pg, "enc-fresh")
        pg.click("#pk-fresh"); pg.wait_for_selector("#login", state="hidden", timeout=10000)
        open_review(pg); pg.wait_for_timeout(1500)
        check("Old photos show as locked", pg.get_attribute("#photos .thumb img", "src").startswith("data:image/svg"))
        upload(pg, f); pg.wait_for_selector("#pk-saved", timeout=10000)
        check("First photo with the new key asks for a new recovery code", "Save your recovery code" in pg.inner_text("#login"))
        pg.click("#pk-cancel"); pg.wait_for_timeout(500)
        check("Not now: the photo isn't added, and no error shows", pg.locator("#photos .thumb").count() == 1 and pg.inner_text("#phmsg").strip() == "")
        upload(pg, f); pg.wait_for_selector("#pk-saved", timeout=10000); pg.click("#pk-saved")
        pg.wait_for_function("document.querySelectorAll('#photos .thumb').length===2", timeout=10000); pg.wait_for_timeout(500)
        srcs = pg.evaluate("[...document.querySelectorAll('#photos .thumb img')].map(i=>i.src.slice(0,10))")
        check("New photo works next to the locked old one", srcs[0].startswith("data:image") and srcs[1].startswith("blob:"))
        pg.locator("#review-sec").screenshot(path="shots/enc-locked-and-new.png")

        # 8. delete account: photos and the key record go
        pg.wait_for_timeout(1500)
        pg.click("#setcog"); pg.click('[data-st="acct"]'); pg.click('[data-st="del-open"]'); pg.fill("#del-confirm", "DELETE"); pg.click('[data-st="del-go"]')
        pg.wait_for_selector("#lg-email", state="visible", timeout=10000)
        check("Delete account removes photos and the key record", pg.evaluate(HEADS) == {} and pg.evaluate(REC) is None and not pg.evaluate("localStorage.getItem('routine-pk')"))
        check("No script errors", not errs)
        b.close()
finally:
    srv.terminate()
print("ALL PASS" if not fails else f"{len(fails)} FAILED")
