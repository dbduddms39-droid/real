#!/usr/bin/env python3
"""Export a self-contained HTML file and ZIPs. No dependencies required."""
import argparse
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent
ASSETS = ['index.html', 'style.css', 'icon-assets.js', 'icons.js', 'music-assets.js', 'app.js', 'manifest.webmanifest']
PROJECT = ASSETS + ['build-icons.py', 'build-music.py', 'publish.py', '.github/workflows/publish.yml', 'serve.py', 'export.py', 'README.md', 'PREVIEW.md', 'DESIGN.md', 'assets/icons/sources.json', '.gitignore', '.vscode/tasks.json']


def export(destination):
    from importlib.util import spec_from_file_location, module_from_spec
    spec = spec_from_file_location('build_icons', ROOT / 'build-icons.py')
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    module.build()
    music_spec = spec_from_file_location('build_music', ROOT / 'build-music.py')
    music_module = module_from_spec(music_spec)
    music_spec.loader.exec_module(music_module)
    music_module.build()
    project_files = PROJECT + [str(p.relative_to(ROOT)) for p in sorted((ROOT / 'assets/icons').glob('*.png'))]
    project_files += [str(p.relative_to(ROOT)) for p in sorted((ROOT / 'assets/audio').iterdir()) if p.is_file()]
    destination.mkdir(parents=True, exist_ok=True)
    html = (ROOT / 'index.html').read_text()
    html = html.replace('<link rel="manifest" href="manifest.webmanifest">', '')
    html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + (ROOT / 'style.css').read_text() + '\n</style>')
    for filename in ['icon-assets.js', 'icons.js', 'music-assets.js', 'app.js']:
        source = (ROOT / filename).read_text().replace('</script', r'<\/script')
        html = html.replace(f'<script src="{filename}"></script>', '<script>\n' + source + '\n</script>')
    (destination / 'my-phone.html').write_text(html)
    for filename, names in [('my-phone-site.zip', ASSETS), ('my-phone-project.zip', project_files)]:
        with ZipFile(destination / filename, 'w', ZIP_DEFLATED) as archive:
            for name in names:
                archive.write(ROOT / name, name)
    print(f'Exported my-phone.html, my-phone-site.zip, my-phone-project.zip to {destination}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=ROOT / 'exports')
    export(parser.parse_args().out.resolve())
