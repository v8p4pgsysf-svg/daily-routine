import subprocess, time, sys, os, json
from playwright.sync_api import sync_playwright
from clock import pin  # fixed calendar: see clock.py
os.chdir(os.path.dirname(os.path.abspath(__file__)))
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8793", "-d", "site"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
MOCK = open("mock-supabase.js").read(); JSZIP = open("node_modules/jszip/dist/jszip.min.js").read()
OUT = "review"; os.makedirs(OUT, exist_ok=True)
def routes(ctx):
    ctx.route("https://cdn.jsdelivr.net/**", lambda r: r.fulfill(body=MOCK, content_type="application/javascript"))
    ctx.route("https://cdnjs.cloudflare.com/**", lambda r: r.fulfill(body=JSZIP, content_type="application/javascript"))
    ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(body="", content_type="text/css"))
# elements whose content is wider than their box, or that stick out of the viewport
PROBE = """(pane)=>{const out=[];const vw=innerWidth;const root=document.getElementById(pane)||document.body;
 for(const el of root.querySelectorAll('*')){if(!el.offsetParent&&getComputedStyle(el).position!=='fixed')continue;
  const r=el.getBoundingClientRect();if(!r.width)continue;const cs=getComputedStyle(el);
  const tag=el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\\s+/).join('.'):'');
  if(r.right>vw+0.5||r.left<-0.5)out.push(['offscreen',tag,Math.round(r.left),Math.round(r.right),(el.textContent||'').trim().slice(0,40)]);
  else if(el.scrollWidth>el.clientWidth+1&&cs.overflowX!=='auto'&&cs.overflowX!=='scroll'&&el.clientWidth>0&&!['INPUT','SELECT','TEXTAREA'].includes(el.tagName))
   out.push(['clipped',tag,el.clientWidth,el.scrollWidth,(el.textContent||'').trim().slice(0,40)]);}
 return out}"""
findings = {}
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = pin(b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)); routes(ctx)
        pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("http://localhost:8793/"); pg.wait_for_selector("#lg-email")
        pg.fill("#lg-email", "jack@example.com"); pg.fill("#lg-pass", "Start-1234"); pg.click("#lg-btn")
        pg.wait_for_selector("#setsheet", state="visible"); pg.fill("#su-weight", "80")
        pg.click('[data-st="set-next"]'); pg.click('[data-sprog="fullbody"]')
        for _ in range(3): pg.click('[data-st="set-next"]')
        pg.click('[data-st="set-start"]'); pg.wait_for_selector("#setsheet", state="hidden"); pg.wait_for_timeout(800)
        pg.click("#tab-progress"); pg.wait_for_timeout(200)
        pg.set_input_files("#imp-file", "routine-export.zip")
        pg.wait_for_selector("#pk-saved", timeout=15000); pg.click("#pk-saved")  # first photo: save the recovery code
        pg.wait_for_function("document.getElementById('imp-msg').textContent.startsWith('Imported')", timeout=15000)
        pg.wait_for_timeout(800)
        # tick a few habits today so the Today card has a score
        pg.click("#tab-week"); pg.wait_for_timeout(300)
        tabs = [("today", "#tab-week", "pane-week"), ("training", "#tab-strength", "pane-strength"), ("progress", "#tab-progress", "pane-progress")]
        for w in (390, 375, 320):
            pg.set_viewport_size({"width": w, "height": 844})
            for scheme in ("light", "dark"):
                if w != 390 and scheme == "dark": continue
                pg.emulate_media(color_scheme=scheme)
                for name, tab, pane in tabs:
                    pg.click(tab); pg.wait_for_timeout(250); pg.evaluate("scrollTo(0,0)")
                    pg.screenshot(path=f"{OUT}/{name}-{w}-{scheme}.png", full_page=True)
                    f = pg.evaluate(PROBE, pane); hw = pg.evaluate("document.documentElement.scrollWidth")
                    if hw > w: f.append(["page-scroll", "html", w, hw, ""])
                    if f: findings[f"{name}-{w}-{scheme}"] = f
                pg.click("#setcog"); pg.wait_for_timeout(300)
                pg.screenshot(path=f"{OUT}/settings-{w}-{scheme}.png", full_page=True)
                f = pg.evaluate(PROBE, "setsheet")
                if f: findings[f"settings-{w}-{scheme}"] = f
                pg.click('[data-st="set-cancel"]'); pg.wait_for_timeout(200)
        pg.emulate_media(color_scheme="light"); pg.set_viewport_size({"width": 390, "height": 844})
        print("script errors:", errs)
        b.close()
finally:
    srv.terminate()
json.dump(findings,open("review/findings.json","w"))
for k,v in findings.items():
    print("==",k)
    seen=set()
    for t in v:
        key=(t[0],t[1],t[4])
        if key in seen: continue
        seen.add(key);print("  ",t[0],t[1][:60],t[2],t[3],repr(t[4][:30]))
