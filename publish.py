#!/usr/bin/env python3
"""Prepare only the public app files for a static web host; does not publish."""
import argparse
import hashlib
import importlib.util
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SITE_PATH = 'still-september'
ASSETS = ['index.html', 'style.css', 'icon-assets.js', 'icons.js', 'music-assets.js', 'photo-assets.js', 'photos.js', 'app.js', 'manifest.webmanifest']


def prepare(destination):
    for filename in ['build-icons.py', 'build-music.py', 'build-photos.py']:
        spec = importlib.util.spec_from_file_location(filename.removesuffix('.py').replace('-', '_'), ROOT / filename)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        module.build()
    app_directory = destination / SITE_PATH
    app_directory.mkdir(parents=True, exist_ok=True)
    for name in ASSETS:
        shutil.copyfile(ROOT / name, app_directory / name)
    # Serve web audio directly so playback does not wait for an 8 MB script.
    # The standalone export continues to use its embedded offline recording.
    manifest = json.loads((ROOT / 'assets/audio/track.json').read_text())
    media_directory = app_directory / 'assets/audio'
    media_directory.mkdir(parents=True, exist_ok=True)
    track = {key: manifest[key] for key in ['title', 'artist', 'album']}
    for key, filename in [('audio', manifest['file']), ('cover', manifest['cover'])]:
        source = ROOT / 'assets/audio' / filename
        shutil.copyfile(source, media_directory / filename)
        digest = hashlib.sha256(source.read_bytes()).hexdigest()[:12]
        track[key] = f'assets/audio/{filename}?v={digest}'
    (app_directory / 'music-assets.js').write_text(
        'window.PhoneBundledTrack=' + json.dumps(track, ensure_ascii=False) + ';\n',
        encoding='utf-8',
    )
    gallery = json.loads((ROOT / 'assets/photos/manifest.json').read_text())
    gallery_directory = app_directory / 'assets/photos'
    gallery_directory.mkdir(parents=True, exist_ok=True)
    photos = []
    for photo in gallery['photos']:
        source = ROOT / 'assets/photos' / photo['file']
        shutil.copyfile(source, gallery_directory / photo['file'])
        digest = hashlib.sha256(source.read_bytes()).hexdigest()[:12]
        photos.append({'id': photo['id'], 'alt': photo['alt'], 'src': f'assets/photos/{photo["file"]}?v={digest}'})
    (app_directory / 'photo-assets.js').write_text(
        'window.PhonePhotoAssets=' + json.dumps({'memoryPhotoId': gallery['memoryPhotoId'], 'photos': photos}, ensure_ascii=False) + ';\n',
        encoding='utf-8',
    )
    versions = {name: hashlib.sha256((app_directory / name).read_bytes()).hexdigest()[:12] for name in ASSETS}
    version = hashlib.sha256(''.join(versions.values()).encode()).hexdigest()[:12]
    html = (app_directory / 'index.html').read_text()
    for name, digest in versions.items():
        html = html.replace(f'"{name}"', f'"{name}?v={digest}"')
    (app_directory / 'index.html').write_text(html, encoding='utf-8')
    (destination / 'index.html').write_text(
        '<!doctype html><html lang="ko"><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        f'<meta http-equiv="refresh" content="0;url=./{SITE_PATH}/?v={version}">'
        '<title>Still September</title>'
        f'<p><a href="./{SITE_PATH}/?v={version}">Still September 열기</a></p></html>\n',
        encoding='utf-8',
    )
    print(f'Prepared version {version} in {app_directory}; nothing uploaded or published.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=ROOT / 'site')
    prepare(parser.parse_args().out.resolve())
