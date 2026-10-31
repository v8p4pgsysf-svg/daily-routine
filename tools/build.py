#!/usr/bin/env python3
"""Builds the live app (docs/index.html + docs/sw.js) from src/weekly-routine.html.
Usage: python3 tools/build.py
docs/ also holds files the build doesn't touch: config.js, supabase.js, icons, manifest."""
import re,sys,time,pathlib
here=pathlib.Path(__file__).parent;root=here.parent
src=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else root/"src"/"weekly-routine.html").read_text()
# the app's main script waits until someone has signed in
m=re.search(r'<script>\n\(function\(\)\{\n"use strict";.*?</script>',src,re.S)
assert m,"app script not found"
app=m.group(0)[len("<script>"):-len("</script>")]
assert "</script" not in app
body=src[:m.start()]+'<script type="text/plain" id="app-src">'+app+'</script>'+src[m.end():]
title=re.search(r"<title>(.*?)</title>",body).group(1)
body=re.sub(r"<title>.*?</title>\n?","",body,count=1)
body=body.replace('<meta name="claude:viewport-fit-sides" content="cover">\n','')
ver=time.strftime("%Y%m%d%H%M%S")
head=f'''<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="app-version" content="{ver}">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="theme-color" content="#F4F5F3" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#111412" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="Routine">
<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="apple-touch-icon.png"><link rel="icon" href="icon-192.png">
<style>:root{{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}}body{{margin:0;font:14px system-ui,-apple-system,sans-serif}}img{{max-width:100%}}[hidden]{{display:none!important}}
.rsheethd{{padding-top:calc(11px + env(safe-area-inset-top,0px))!important}}
body:not(.in)>:not(#login):not(script){{display:none!important}}
#login{{position:fixed;inset:0;z-index:100;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;gap:12px;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:24px 16px;background:#F4F5F3;color:#1A1E1B;font-family:"Hanken Grotesk",system-ui,-apple-system,sans-serif}}
.lg-card{{width:100%;max-width:360px;background:#fff;border:1px solid #E2E6E2;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:10px}}
.lg-card h1{{margin:0;font-size:1.5rem}}.lg-sub{{margin:0 0 6px;color:#6A726C;font-size:.95rem;line-height:1.45}}
.lg-card input{{min-width:0}}
.lg-card label{{font-weight:600;font-size:.88rem}}
.lg-card input{{font:inherit;font-size:1.05rem;padding:12px;border:1.5px solid #CDD3CE;border-radius:10px;background:#fff;color:inherit}}
.lg-card input:focus{{outline:none;border-color:#2E7650;box-shadow:0 0 0 3px #E4EFE8}}
#lg-code{{letter-spacing:.3em;font-family:"IBM Plex Mono",ui-monospace,monospace;text-align:center;font-size:1.3rem}}
.lg-btn{{margin-top:6px;font:inherit;font-weight:650;font-size:1rem;padding:12px;border-radius:10px;border:0;background:#2E7650;color:#fff;cursor:pointer}}.lg-btn:disabled{{opacity:.6}}
.lg-step{{display:flex;flex-direction:column;gap:10px}}
.lg-code{{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:1.15rem;font-weight:600;letter-spacing:.04em;text-align:center;padding:14px 8px;border-radius:10px;background:#F4F5F3;border:1px solid #E2E6E2;user-select:all;-webkit-user-select:all;word-break:break-all}}
.lg-codein{{font-family:"IBM Plex Mono",ui-monospace,monospace!important;letter-spacing:.04em;text-transform:uppercase}}
.lg-btn2{{background:none!important;color:inherit!important;border:1.5px solid #CDD3CE!important;margin-top:0}}
.lg-tight{{margin:0!important}}
.lg-link{{border:0;background:none;color:#6A726C;text-decoration:underline;font:inherit;font-size:.9rem;cursor:pointer;padding:6px}}
.lg-err{{margin:0;color:#A33A2E;background:#F6E5E2;border-radius:10px;padding:10px 12px;font-size:.9rem}}
#login.a2hs form{{display:none}}
.lg-steps{{margin:0;padding:0;list-style:none;counter-reset:s;display:flex;flex-direction:column;gap:10px;font-size:.95rem;line-height:1.45}}
.lg-steps li{{counter-increment:s;display:grid;grid-template-columns:26px 1fr;gap:10px;align-items:start}}
.lg-steps li::before{{content:counter(s);width:26px;height:26px;border-radius:50%;background:#E4EFE8;color:#2E7650;font-weight:700;font-size:.85rem;display:grid;place-items:center}}
.lg-ico{{width:1.05em;height:1.05em;vertical-align:-.15em;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}}
.lg-err{{transition:opacity .35s ease}}.lg-err.fade{{opacity:0}}@media (prefers-reduced-motion:reduce){{.lg-err{{transition:none}}}}
@media (prefers-color-scheme:dark){{#login{{background:#111412;color:#E7EBE8}}.lg-card{{background:#191D1A;border-color:#272D29}}.lg-card input{{background:#191D1A;border-color:#353C37}}.lg-btn{{background:#5DBA88;color:#0E1A13}}.lg-sub,.lg-link{{color:#929B95}}.lg-steps li::before{{background:#1F3328;color:#5DBA88}}.lg-err{{background:#3A1F1B;color:#E07B6E}}.lg-code{{background:#111412;border-color:#272D29}}.lg-btn2{{border-color:#353C37!important}}}}
</style>
<script src="config.js"></script>
<script src="supabase.js"></script>
</head><body>
<div id="login" hidden></div>
'''
out=head+body+'\n<script src="host.js"></script>\n</body></html>\n'
(root/"docs"/"index.html").write_text(out)
sw=(here/"sw.template.js").read_text().replace("__VERSION__",ver)
(root/"docs"/"sw.js").write_text(sw)
print("built docs/index.html",len(out),"bytes · cache",ver)
