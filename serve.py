#!/usr/bin/env python3
"""Local preview server with automatic refresh; Python 3, no dependencies."""
import argparse
import hashlib
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
ASSETS = {
    'index.html': 'text/html; charset=utf-8',
    'style.css': 'text/css; charset=utf-8',
    'music-assets.js': 'text/javascript; charset=utf-8',
    'photo-assets.js': 'text/javascript; charset=utf-8',
    'photos.js': 'text/javascript; charset=utf-8',
    'app.js': 'text/javascript; charset=utf-8',
    'icon-assets.js': 'text/javascript; charset=utf-8',
    'icons.js': 'text/javascript; charset=utf-8',
    'manifest.webmanifest': 'application/manifest+json; charset=utf-8',
}
RELOAD = b'''<script>
(()=>{let current;let notified=false;
setInterval(async()=>{if(notified)return;try{
const response=await fetch('/__version',{cache:'no-store'});if(!response.ok)return;
const version=await response.json();if(current&&current!==version){notified=true;
const editing=['INPUT','TEXTAREA'].includes(document.activeElement.tagName);
if(editing){const button=document.createElement('button');button.textContent='New version ready - tap to refresh';button.style.cssText='position:fixed;top:65px;left:15px;right:15px;padding:15px;z-index:9999;background:#087fff;color:white;border:0;border-radius:12px';button.onclick=()=>location.reload();document.body.append(button)}else location.reload();
}current=version;}catch{}},1000)})();
</script>'''


def version():
    digest = hashlib.sha256()
    for name in sorted(ASSETS):
        path = ROOT / name
        digest.update(name.encode())
        digest.update(path.read_bytes() if path.exists() else b'missing')
    return digest.hexdigest()


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/__version':
            self.respond(json.dumps(version()).encode(), 'application/json')
            return
        name = 'index.html' if path == '/' else path.removeprefix('/')
        if name not in ASSETS or not (ROOT / name).is_file():
            self.send_error(404)
            return
        data = (ROOT / name).read_bytes()
        if name == 'index.html':
            data = data.replace(b'</body>', RELOAD + b'</body>')
        self.respond(data, ASSETS[name])

    def respond(self, data, content_type):
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(data)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f'My Phone: http://{args.host}:{args.port} (Ctrl+C to stop)', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
