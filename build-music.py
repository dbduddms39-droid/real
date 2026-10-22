#!/usr/bin/env python3
"""Bundle the user-provided recording and its embedded artwork for offline use."""
import base64
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def build():
    folder = ROOT / 'assets/audio'
    manifest = json.loads((folder / 'track.json').read_text())
    audio = (folder / manifest['file']).read_bytes()
    cover = (folder / manifest['cover']).read_bytes()
    if hashlib.sha256(audio).hexdigest() != manifest['sha256']:
        raise ValueError('Audio checksum does not match the uploaded source')
    if hashlib.sha256(cover).hexdigest() != manifest['coverSha256']:
        raise ValueError('Cover checksum does not match the extracted artwork')
    track = {
        'title': manifest['title'], 'artist': manifest['artist'], 'album': manifest['album'],
        'audio': 'data:' + manifest['mime'] + ';base64,' + base64.b64encode(audio).decode(),
        'cover': 'data:' + manifest['coverMime'] + ';base64,' + base64.b64encode(cover).decode(),
    }
    content = '// Generated from the user-provided MP3 by build-music.py.\n'
    content += 'window.PhoneBundledTrack=' + json.dumps(track, ensure_ascii=False, separators=(',', ':')) + ';\n'
    (ROOT / 'music-assets.js').write_text(content)
    print(f'Bundled uploaded recording ({len(audio)} bytes) and original artwork ({len(cover)} bytes).')


if __name__ == '__main__':
    build()
