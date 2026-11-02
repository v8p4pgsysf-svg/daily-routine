"""Forgot password: email a 6-digit code (sign-in by code), then set a new password on the same card.
The mock's code is always 123456. Screenshots go to shots/. Run next to site/ (see README)."""
import subprocess, time, sys, os
from playwright.sync_api import sync_playwright
from clock import pin  # fixed calendar: see clock.py
os.chdir(os.path.dirname(os.path.abspath(__file__)))
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8797", "-d", "site"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
MOCK = open("mock-supabase.js").read()
os.makedirs("shots", exist_ok=True)
fails = []
def check(name, cond):
    print(("PASS " if cond else "FAIL ") + name); cond or fails.append(name)
def sign_out(pg):
    pg.wait_for_timeout(1500)  # let changes sync; otherwise sign-out (rightly) asks first
    pg.click("#setcog"); pg.click('[data-st="acct"]'); pg.click('[data-st="sign-out"]'); pg.wait_for_timeout(400)
    if pg.locator("#login").is_hidden(): pg.click('[data-st="sign-out"]')  # confirm if it asked
    pg.wait_for_selector("#lg-email", state="visible")
err = lambda pg: (pg.inner_text("#lg-frerr") if pg.locator("#lg-frerr").is_visible() else "")
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = pin(b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2))
        ctx.route("https://cdn.jsdelivr.net/**", lambda r: r.fulfill(body=MOCK, content_type="application/javascript"))
        ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(body="", content_type="text/css"))
        pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("http://localhost:8797/"); pg.wait_for_selector("#lg-email")

        # a wrong password points to the reset
        pg.fill("#lg-email", "jack@example.com"); pg.fill("#lg-pass", "not-it"); pg.click("#lg-btn"); pg.wait_for_selector("#lg-err", state="visible")
        check("Wrong password message points to Forgot password", "Forgot password" in pg.inner_text("#lg-err"))
        check("Sign-in card has a Forgot password link", pg.locator("#lg-forgot").is_visible())

        # step 1: email a code
        pg.click("#lg-forgot");pg.wait_for_timeout(100); pg.wait_for_timeout(100)
        check("Reset card opens with the email carried over", pg.locator("#lg-fr").is_visible() and not pg.locator("#lg-fp").is_visible()
              and pg.input_value("#lg-femail") == "jack@example.com" and pg.locator("#lg-fr1").is_visible() and not pg.locator("#lg-fr2").is_visible())
        for scheme in ("light", "dark"):
            pg.emulate_media(color_scheme=scheme); pg.wait_for_timeout(80); pg.screenshot(path=f"shots/forgot-1-{scheme}.png")
        pg.emulate_media(color_scheme="light")
        pg.fill("#lg-femail", "stranger@x.com"); pg.click("#lg-fsend"); pg.wait_for_timeout(200)
        check("Unknown email: says there's no account", "no account" in err(pg) and pg.locator("#lg-fr1").is_visible())
        pg.evaluate("window.__mockOtpRate=true"); pg.fill("#lg-femail", "Jack@Example.com "); pg.click("#lg-fsend"); pg.wait_for_timeout(200)
        check("Too soon: asks to wait a minute", "Wait a minute" in err(pg))
        pg.evaluate("window.__mockOtpRate=false;window.__mockSmtpFail=true"); pg.click("#lg-fsend"); pg.wait_for_timeout(200)
        check("Email service failing: says so, without blaming the connection", "right now" in err(pg) and "connection" not in err(pg))
        pg.evaluate("window.__mockSmtpFail=false"); pg.click("#lg-fsend"); pg.wait_for_timeout(200)
        check("Code sent: step 2 names the email (lower-cased) and focuses the code box",
              pg.locator("#lg-fr2").is_visible() and "jack@example.com" in pg.inner_text("#lg-frsub") and pg.evaluate("document.activeElement.id") == "lg-fcode"
              and pg.evaluate("window.__lastOtpEmail") == "jack@example.com" and "junk folder" in pg.inner_text("#lg-frsub"))

        # step 2: checks before the code is tried
        pg.fill("#lg-fcode", "12"); pg.fill("#lg-fp1", "New-pass-77"); pg.fill("#lg-fp2", "New-pass-77"); pg.click("#lg-fset"); pg.wait_for_timeout(100)
        check("A short code is refused before sending", "Enter the code" in err(pg))
        pg.fill("#lg-fcode", "123456"); pg.fill("#lg-fp1", "short"); pg.fill("#lg-fp2", "short"); pg.click("#lg-fset"); pg.wait_for_timeout(100)
        check("A short password is refused", "at least 8" in err(pg))
        pg.fill("#lg-fp1", "New-pass-77"); pg.fill("#lg-fp2", "New-pass-78"); pg.click("#lg-fset"); pg.wait_for_timeout(100)
        check("Mismatched passwords are refused", "don't match" in err(pg))
        pg.fill("#lg-fcode", "654321"); pg.fill("#lg-fp2", "New-pass-77"); pg.click("#lg-fset"); pg.wait_for_timeout(300)
        check("A wrong code is refused, still on the reset card", "didn't work" in err(pg) and pg.locator("#lg-fr").is_visible())
        pg.click("#lg-fresend"); pg.wait_for_timeout(200)
        check("Send a new code: sends again and says so", pg.evaluate("window.__otpSent") == 2 and "new code" in pg.inner_text("#lg-frsub"))
        pg.fill("#lg-fcode", "123456"); pg.fill("#lg-fp1", "New-pass-77"); pg.fill("#lg-fp2", "New-pass-77")
        for scheme in ("light", "dark"):
            pg.emulate_media(color_scheme=scheme); pg.wait_for_timeout(80); pg.screenshot(path=f"shots/forgot-2-{scheme}.png")
        pg.emulate_media(color_scheme="light")
        pg.click("#lg-fset"); pg.wait_for_selector("#setsheet, #tab-week", state="visible", timeout=8000); pg.wait_for_timeout(400)
        check("Right code + new password: straight into the app", pg.locator("#login").is_hidden())
        # (jack's first sign-in here: finish setup so we can sign out)
        if pg.locator("#setsheet").is_visible():
            pg.click('[data-st="set-next"]'); pg.fill("#su-weight", "80"); pg.click('[data-st="set-next"]'); pg.click('[data-sprog="fullbody"]')
            for _ in range(3): pg.click('[data-st="set-next"]')
            pg.click('[data-st="set-start"]'); pg.wait_for_selector("#setsheet", state="hidden")
        sign_out(pg)
        pg.fill("#lg-email", "jack@example.com"); pg.fill("#lg-pass", "Start-1234"); pg.click("#lg-btn"); pg.wait_for_selector("#lg-err", state="visible")
        check("Afterwards the old password no longer works", "don't match" in pg.inner_text("#lg-err"))
        pg.fill("#lg-pass", "New-pass-77"); pg.click("#lg-btn"); pg.wait_for_selector("#tab-week", state="visible", timeout=8000)
        check("…and the new one does", pg.locator("#login").is_hidden())

        # back to sign in from the reset card keeps the email
        sign_out(pg)
        pg.click("#lg-forgot");pg.wait_for_timeout(100); pg.fill("#lg-femail", "someone@example.com"); pg.click("#lg-fback"); pg.wait_for_timeout(100)
        check("Back to sign in returns to the sign-in card with that email", pg.locator("#lg-fp").is_visible() and pg.input_value("#lg-email") == "someone@example.com")
        sw = pg.evaluate("document.getElementById('login').scrollWidth"); check("No sideways scroll at 390px", sw <= 390)
        check("No script errors", not errs)
        b.close()
finally:
    srv.terminate()
print("ALL PASS" if not fails else f"{len(fails)} FAILED")
