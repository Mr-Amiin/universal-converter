"""Shared helpers for the offline end-to-end tests (real Chromium + real service worker).

The site is served by a small local HTTP server that can be shut down completely, so "offline"
means connection refused, not merely a browser flag. The cross-origin live-rates URL is answered
from a fixture while "online" and aborted while offline."""
import http.server, json, os, socketserver, threading, urllib.parse

ROOT = os.environ.get("SITE_ROOT", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
PORT = int(os.environ.get("TEST_PORT", "8765"))
ORIGIN = f"http://localhost:{PORT}"
LIVE_RATES = "https://raw.githubusercontent.com/Mr-Amiin/universal-converter/data/rates.json"

class Site:
    """Static server. cloudflare=True emulates hosts that 308-redirect /index.html -> / and
    /page.html -> /page (a redirected response must never be handed to a navigation)."""
    def __init__(self, root=ROOT, cloudflare=False):
        self.root, self.cloudflare, self.httpd, self.hits, self.overrides = root, cloudflare, None, [], {}
    def _handler(site):
        class H(http.server.BaseHTTPRequestHandler):
            def log_message(self, *a): pass
            def _send(self, code, body=b"", ctype="text/html; charset=utf-8", extra=None):
                self.send_response(code)
                self.send_header("Content-Type", ctype); self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-cache")
                for k, v in (extra or {}).items(): self.send_header(k, v)
                self.end_headers()
                if self.command != "HEAD": self.wfile.write(body)
            def do_GET(self):
                u = urllib.parse.urlparse(self.path); p = urllib.parse.unquote(u.path)
                site.hits.append(self.path)
                q = ("?" + u.query) if u.query else ""
                if p in site.overrides:
                    code, body = site.overrides[p]; return self._send(code, body, "application/json" if p.endswith(".json") else "text/plain")
                if site.cloudflare:
                    if p == "/index.html": return self._send(308, extra={"Location": "/" + q})
                    if p.endswith(".html") and p != "/404.html": return self._send(308, extra={"Location": p[:-5] + q})
                fs = os.path.normpath(os.path.join(site.root, p.lstrip("/")))
                if not fs.startswith(site.root): return self._send(403)
                if os.path.isdir(fs):
                    if not p.endswith("/"): return self._send(301, extra={"Location": p + "/" + q})
                    fs = os.path.join(fs, "index.html")
                elif not os.path.isfile(fs) and site.cloudflare and os.path.isfile(fs + ".html"):
                    fs += ".html"
                if os.path.isfile(fs):
                    ctype = {".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml",
                             ".png": "image/png", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json",
                             ".html": "text/html; charset=utf-8", ".txt": "text/plain"}.get(os.path.splitext(fs)[1], "application/octet-stream")
                    return self._send(200, open(fs, "rb").read(), ctype)
                nf = os.path.join(site.root, "404.html")
                return self._send(404, open(nf, "rb").read() if os.path.isfile(nf) else b"not found")
            do_HEAD = do_GET
        return H
    def start(self):
        socketserver.ThreadingTCPServer.allow_reuse_address = True
        socketserver.ThreadingTCPServer.daemon_threads = True
        self.httpd = socketserver.ThreadingTCPServer(("127.0.0.1", PORT), self._handler())
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
    def stop(self):
        if self.httpd:
            self.httpd.shutdown(); self.httpd.server_close(); self.httpd = None

def live_rates_fixture():
    rates = json.load(open(os.path.join(ROOT, "rates.json")))
    return rates
