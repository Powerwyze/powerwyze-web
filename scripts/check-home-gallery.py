#!/usr/bin/env python3
"""Validate the homepage's complete, silent, nonduplicated media collection."""
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.videos = []
        self.sources = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'video': self.videos.append(attrs)
        if tag == 'source': self.sources.append(attrs['src'])

page = Page((ROOT/'index.html').read_text())
manifest = json.loads((ROOT/'data/event-showcase.json').read_text())
assert len(manifest) == 19, 'Expected nine existing and ten additional gallery clips'
assert len(page.videos) == len(page.sources) == 20, 'Expected one hero and nineteen gallery videos'
assert len(set(page.sources)) == 20, 'Duplicate homepage video URL'
assert len({item['sourceDriveId'] for item in manifest}) == 19, 'Repeated Drive source'
assert '10wqd8xLbputnXzczY0osP2Z2y7thHYoF' not in {item['sourceDriveId'] for item in manifest}, 'Hero repeated in gallery'
assert sum('data-event-video' in video for video in page.videos) == 19
assert {item['video'] for item in manifest} <= set(page.sources)
digests = set()
total_bytes = 0
for attrs, source in zip(page.videos, page.sources):
    assert source.startswith('/assets/'), 'Homepage media must be site-hosted'
    assert all(attr in attrs for attr in ('muted', 'playsinline', 'controls', 'poster', 'aria-label'))
    assert attrs.get('preload') == 'none' and 'autoplay' not in attrs
    path = ROOT/source.lstrip('/')
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    assert digest not in digests, 'Duplicate encoded media'
    digests.add(digest)
    info = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-of','json',str(path)],text=True))
    assert len(info['streams']) == 1 and info['streams'][0]['codec_name'] == 'h264', source
    assert (ROOT/attrs['poster'].lstrip('/')).is_file()
    total_bytes += path.stat().st_size
redirects = json.loads((ROOT/'vercel.json').read_text())['redirects']
assert any(rule['source'] == '/projects' and rule['destination'] == '/#our-work' for rule in redirects)
assert all('href="/projects' not in path.read_text() for path in ROOT.rglob('*.html'))
print(json.dumps({'homepage_videos':20,'gallery_clips':19,'unique_sources':20,'audio_tracks':0,'total_video_bytes':total_bytes,'old_projects_route':'/#our-work','errors':[]},indent=2))
