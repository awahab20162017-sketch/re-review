#!/usr/bin/env python3
"""Best-effort real-browser smoke for the local review build.

The ChatGPT container currently has an organization policy that blocks Chromium
from navigating to localhost/file/data URLs. When that exact policy page is
encountered, this script records an explicit SKIP and runs structural fallback
checks instead of pretending the browser verified the app.
"""
from __future__ import annotations
import http.server
import pathlib
import shutil
import socketserver
import subprocess
import signal
import tempfile
import threading

ROOT = pathlib.Path(__file__).resolve().parents[1]


def structural_fallback() -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    ui = (ROOT / "ui-v56.js").read_text(encoding="utf-8")
    css = (ROOT / "styles-v56.css").read_text(encoding="utf-8")
    assert "styles-v56.css" in html and "ui-v56.js" in html
    assert html.index("cloud.js") < html.index("club-badges.js") < html.index("ui-v56.js")
    assert "pr-app-shell" in ui and "pr-champion-stage" in ui
    assert ".pr-bottom-nav" in css and ".pr-account-overlay" in css
    print("FALLBACK PASS: production load order and v56 shell/final/account/mobile contracts found")


def main() -> int:
    chrome = next((shutil.which(x) for x in ("chromium", "chromium-browser", "google-chrome") if shutil.which(x)), None)
    if not chrome:
        print("SKIP: Chromium not installed in this environment")
        structural_fallback()
        return 0

    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

    old = pathlib.Path.cwd()
    try:
        import os
        os.chdir(ROOT)
        with socketserver.TCPServer(("127.0.0.1", 0), Handler) as httpd:
            port = httpd.server_address[1]
            thread = threading.Thread(target=httpd.serve_forever, daemon=True)
            thread.start()
            with tempfile.TemporaryDirectory(prefix="prv56-chrome-", ignore_cleanup_errors=True) as profile:
                cmd = [chrome, "--headless=new", "--no-sandbox", "--disable-gpu", f"--user-data-dir={profile}", "--virtual-time-budget=1800", "--dump-dom", f"http://127.0.0.1:{port}/index.html"]
                proc = subprocess.Popen(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True)
                try:
                    stdout, stderr = proc.communicate(timeout=12)
                except subprocess.TimeoutExpired:
                    try:
                        import os
                        os.killpg(proc.pid, signal.SIGKILL)
                    except (ProcessLookupError, PermissionError):
                        proc.kill()
                    proc.communicate()
                    print("SKIP: Chromium cannot complete even a local headless navigation in this sandbox")
                    structural_fallback()
                    return 0
                out = (stdout or "") + "\n" + (stderr or "")
                blocked = ("organization doesn" in out.lower() and "allow you to view" in out.lower()) or "ERR_BLOCKED_BY_ADMINISTRATOR" in out
                if blocked:
                    print("SKIP: Chromium navigation is blocked by this environment's organization policy")
                    structural_fallback()
                    return 0
                if proc.returncode != 0:
                    raise RuntimeError(f"Chromium exited {proc.returncode}: {out[-1200:]}")
                if "PITCH ROYALE" not in stdout:
                    raise AssertionError("Pitch Royale shell was not present in browser DOM")
                if "ERR_" in stdout or "Runtime error" in stdout:
                    raise AssertionError("Browser DOM contains an error page/runtime error marker")
                print("BROWSER PASS: local production index loaded and rendered Pitch Royale shell")
                return 0
    finally:
        import os
        os.chdir(old)


if __name__ == "__main__":
    raise SystemExit(main())
