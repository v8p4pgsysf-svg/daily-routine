"""Presentation sweep of tonight's new screens at 390/375/320, light and dark; flags overflow."""
import subprocess, time, sys, os, json, base64, tempfile
from playwright.sync_api import sync_playwright
from clock import pin  # fixed calendar: see clock.py
os.chdir(os.path.dirname(os.path.abspath(__file__)))
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8800", "-d", "site"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
MOCK = open("mock-supabase.js").read()
OUT = "sweep"; os.makedirs(OUT, exist_ok=True)
SAFARI = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1"
PROBE = """(sel)=>{const out=[];const vw=innerWidth;const root=document.querySelector(sel)||document.body;
 for(const el of root.querySelectorAll('*')){if(!el.offsetParent&&getComputedStyle(el).position!=='fixed')continue;
  const r=el.getBoundingClientRect();if(!r.width)continue;const cs=getComputedStyle(el);
  const tag=el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(typeof el.className==='string'&&el.className?'.'+el.className.trim().split(/\\s+/).join('.'):'');
  if(r.right>vw+0.5||r.left<-0.5)out.push(['offscreen',tag,Math.round(r.left),Math.round(r.right),(el.textContent||'').trim().slice(0,30)]);
  else if(el.scrollWidth>el.clientWidth+1&&!['auto','scroll'].includes(cs.overflowX)&&el.clientWidth>0&&!['INPUT','SELECT','TEXTAREA'].includes(el.tagName))
   out.push(['clipped',tag,el.clientWidth,el.scrollWidth,(el.textContent||'').trim().slice(0,30)]);}
 if(document.documentElement.scrollWidth>vw)out.push(['page-scroll','html',vw,document.documentElement.scrollWidth,'']);
 return out}"""
findings = {}
def snap(pg, name, sel="body"):
    w = pg.viewport_size["width"]
    for scheme in ("light", "dark"):
        if w != 390 and scheme == "dark": continue
        pg.emulate_media(color_scheme=scheme); pg.wait_for_timeout(80)
        pg.screenshot(path=f"{OUT}/{name}-{w}-{scheme}.png", full_page=True)
    pg.emulate_media(color_scheme="light")
    f = pg.evaluate(PROBE, sel)
    if f: findings[f"{name}-{w}"] = f
def ctx_for(b, w, ua=None):
    c = pin(b.new_context(viewport={"width": w, "height": 760}, device_scale_factor=2, **({"user_agent": ua, "is_mobile": True, "has_touch": True} if ua else {})))
    c.route("https://cdn.jsdelivr.net/**", lambda r: r.fulfill(body=MOCK, content_type="application/javascript"))
    c.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(body="", content_type="text/css"))
    return c
errs = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w in (390, 375, 320):
            # Home Screen card (iPhone Safari)
            c = ctx_for(b, w, SAFARI); pg = c.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto("http://localhost:8800/"); pg.wait_for_selector("#lg-a2hs"); snap(pg, "a2hs", "#login"); c.close()
            # sign-in screens (desktop UA so no Home Screen card)
            c = ctx_for(b, w); pg = c.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto("http://localhost:8800/"); pg.wait_for_selector("#lg-email")
            pg.fill("#lg-email", "jack@example.com"); pg.fill("#lg-pass", "nope"); pg.click("#lg-btn"); pg.wait_for_selector("#lg-err", state="visible")
            snap(pg, "signin-error", "#login")
            pg.click("#lg-new"); pg.wait_for_timeout(100); snap(pg, "create-account", "#login")
            pg.click("#lg-have"); pg.click("#lg-forgot");pg.wait_for_timeout(100); pg.wait_for_timeout(100); snap(pg, "forgot-1", "#login")
            pg.click("#lg-fsend"); pg.wait_for_selector("#lg-fcode", state="visible"); pg.wait_for_timeout(100); snap(pg, "forgot-2", "#login")
            pg.fill("#lg-fcode", "123456"); pg.fill("#lg-fp1", "Start-1234"); pg.fill("#lg-fp2", "Start-1234"); pg.click("#lg-fset")
            pg.wait_for_selector("#setsheet", state="visible"); pg.click('[data-st="wel-next"]'); pg.click('[data-st="wel-next"]'); pg.click('[data-st="set-next"]'); pg.fill("#su-weight", "80"); pg.click('[data-st="set-next"]'); pg.click('[data-sprog="fullbody"]')
            for _ in range(3): pg.click('[data-st="set-next"]')
            pg.click('[data-st="set-start"]'); pg.wait_for_selector("#setsheet", state="hidden"); pg.wait_for_timeout(500)
            # feedback sheet
            if pg.locator("#fbbtn").is_visible(): pg.click("#fbbtn")
            else: pg.click("#setcog"); pg.wait_for_timeout(200); pg.click('#setbody [data-st="feedback"]')
            pg.wait_for_timeout(200); pg.click('[data-st="fb-send"]'); pg.wait_for_timeout(100); snap(pg, "feedback", "#fbsheet")
            pg.click('[data-st="fb-cancel"]')
            if pg.locator("#setsheet").is_visible(): pg.click('[data-st="set-cancel"]')
            # recovery code card (first photo) and settings account drop-down
            pg.click("#tab-week"); pg.wait_for_timeout(100)
            if pg.get_attribute("#revtoggle", "aria-expanded") != "true": pg.click("#revtoggle"); pg.wait_for_timeout(400)
            jpg = pg.evaluate("""()=>{const c=document.createElement('canvas');c.width=30;c.height=40;c.getContext('2d').fillRect(0,0,30,40);return c.toDataURL('image/jpeg').split(',')[1]}""")
            f = os.path.join(tempfile.mkdtemp(), "p.jpg"); open(f, "wb").write(base64.b64decode(jpg))
            pg.set_input_files("#phfile", f); pg.wait_for_selector("#pk-saved", timeout=10000); snap(pg, "recovery-code", "#login")
            pg.click("#pk-saved"); pg.wait_for_timeout(1200)
            pg.locator("#review-sec").screenshot(path=f"{OUT}/review-photo-{w}.png")
            pg.click("#setcog"); pg.wait_for_timeout(200); pg.click('[data-st="acct"]'); pg.wait_for_timeout(150)
            pg.evaluate("document.getElementById('setsheet').scrollTop=1e6"); pg.wait_for_timeout(100); snap(pg, "settings-account", "#setsheet")
            pg.click('[data-st="set-cancel"]'); pg.wait_for_timeout(1500)
            # unlock card (device without the key) and recovery card
            pg.evaluate("localStorage.removeItem('routine-pk')"); pg.reload(); pg.wait_for_selector("#pk-pw", timeout=10000); snap(pg, "unlock", "#login")
            pg.click("#pk-later"); pg.wait_for_timeout(200)
            pg.evaluate("window.__routineHost && 0"); c.close()
        b.close()
finally:
    srv.terminate()
print("script errors:", errs)
for k, v in findings.items():
    print("==", k); seen = set()
    for t in v:
        key = (t[0], t[1], t[4])
        if key in seen: continue
        seen.add(key); print("  ", t[0], t[1][:50], t[2], t[3], repr(t[4]))
