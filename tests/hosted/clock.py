"""Every hosted suite runs on the same fixed calendar: Monday 26 Oct 2026, 12:00, ticking forward in real time.

Without this, results depended on the real date (a new account signed up mid-week gets a starter week, Sunday shows
the review, and so on). One offset is shared by every page, so two "devices" agree on the time; sync keeps the newest
change by timestamp, and per-page clocks made the second device run behind the first.
"""
import datetime, time

OFFSET_MS = int((datetime.datetime(2026, 10, 26, 12, 0).timestamp() - time.time()) * 1000)
SCRIPT = """(()=>{const RD=Date,off=%d;class FD extends RD{constructor(...a){a.length?super(...a):super(RD.now()+off)}static now(){return RD.now()+off}};window.Date=FD})()""" % OFFSET_MS


def pin(ctx):
    """Call right after creating a browser context, before opening any page."""
    ctx.add_init_script(SCRIPT)
    return ctx
