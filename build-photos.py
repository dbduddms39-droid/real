#!/usr/bin/env python3
"""Bundle the gallery's original uploaded photos for offline viewing."""
import base64
import hashlib
import json
import mimetypes
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def read_photos():
    folder = ROOT / 'assets/photos'
    manifest = json.loads((folder / 'manifest.json').read_text())
    photos = manifest['photos']
    ids = set()
    for photo in photos:
        if Path(photo['file']).name != photo['file']:
            raise ValueError('Photo filenames must stay inside assets/photos')
        if photo['id'] in ids:
            raise ValueError('Duplicate gallery photo ID')
        ids.add(photo['id'])
        data = (folder / photo['file']).read_bytes()
        if hashlib.sha256(data).hexdigest() != photo['sha256']:
            raise ValueError('Photo checksum does not match the uploaded source')
    if manifest['memoryPhotoId'] is not None and manifest['memoryPhotoId'] not in ids:
        raise ValueError('The memory photo must be in the gallery')
    return manifest


def build():
    manifest = read_photos()
    photos = []
    for photo in manifest['photos']:
        mime = mimetypes.guess_type(photo['file'])[0]
        if mime not in {'image/jpeg', 'image/png', 'image/webp', 'image/avif'}:
            raise ValueError('Unsupported gallery image type')
        data = (ROOT / 'assets/photos' / photo['file']).read_bytes()
        photos.append({
            'id': photo['id'], 'alt': photo['alt'],
            'src': f'data:{mime};base64,' + base64.b64encode(data).decode(),
        })
    assets = {'memoryPhotoId': manifest['memoryPhotoId'], 'photos': photos}
    (ROOT / 'photo-assets.js').write_text(
        'window.PhonePhotoAssets=' + json.dumps(assets, ensure_ascii=False) + ';\n',
        encoding='utf-8',
    )
    print(f'Bundled {len(photos)} original gallery photos for offline use.')


if __name__ == '__main__':
    build()
