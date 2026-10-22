#!/usr/bin/env python3
"""Prepare only the public app files for a static web host; does not publish."""
import argparse
import importlib.util
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SITE_PATH = 'still-september'
ASSETS = ['index.html', 'style.css', 'icon-assets.js', 'icons.js', 'music-assets.js', 'app.js', 'manifest.webmanifest']


def prepare(destination):
    for filename in ['build-icons.py', 'build-music.py']:
        spec = importlib.util.spec_from_file_location(filename.removesuffix('.py').replace('-', '_'), ROOT / filename)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        module.build()
    app_directory = destination / SITE_PATH
    app_directory.mkdir(parents=True, exist_ok=True)
    for name in ASSETS:
        shutil.copyfile(ROOT / name, app_directory / name)
    (destination / 'index.html').write_text(
        '<!doctype html><html lang="ko"><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        f'<meta http-equiv="refresh" content="0;url=./{SITE_PATH}/">'
        '<title>Still September</title>'
        f'<p><a href="./{SITE_PATH}/">Still September 열기</a></p></html>\n',
        encoding='utf-8',
    )
    print(f'Prepared the site in {app_directory}; nothing uploaded or published.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=ROOT / 'site')
    prepare(parser.parse_args().out.resolve())
