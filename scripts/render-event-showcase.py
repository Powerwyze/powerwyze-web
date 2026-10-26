#!/usr/bin/env python3
"""Render the reviewed event manifest into static, accessible HTML. No runtime fetch."""
import html
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
events = json.loads((ROOT / 'data/event-showcase.json').read_text())
esc = html.escape

def video(event, location):
    caption = f"{location}-{event['id']}-caption"
    landscape = ' event-video-landscape' if event['width'] > event['height'] else ''
    return f'''<div class="scroll-video event-video{landscape}">
<video data-event-video controls muted loop playsinline preload="none" width="{event['width']}" height="{event['height']}" poster="{esc(event['poster'])}" aria-label="{esc(event['name'])} — {esc(event.get('category', 'Ai PhotoBooth'))}" aria-describedby="{caption}">
<source src="{esc(event['video'])}" type="video/mp4">
Your browser does not support this video. <a href="{esc(event['video'])}">Download the event clip</a>.
</video>
</div>'''

def card(event):
    alias = '<span id="turkish-tastes" aria-hidden="true"></span>' if event['id'] == 'americas-food-beverage' else ''
    return f'''<article class="work-card" id="{esc(event['id'])}">
{alias}{video(event, 'gallery')}
<div class="work-caption">
<h3>{esc(event['name'])}</h3>
<p id="gallery-{event['id']}-caption">{esc(event['copy'])}</p>
</div>
</article>'''

def replace(path, marker, markup):
    text = path.read_text()
    start, end = f'<!-- {marker}:start -->', f'<!-- {marker}:end -->'
    before, rest = text.split(start, 1)
    _, after = rest.split(end, 1)
    path.write_text(before + start + '\n' + markup + '\n' + end + after)

assert len({e['id'] for e in events}) == len(events)
assert len({e['video'] for e in events}) == len(events), 'Duplicate gallery video URL'
digests = set()
for event in events:
    for key in ('video', 'poster'):
        assert event[key].startswith('/assets/'), event[key]
        assert (ROOT / event[key].lstrip('/')).is_file(), event[key]
    digest = hashlib.sha256((ROOT / event['video'].lstrip('/')).read_bytes()).digest()
    assert digest not in digests, f"Duplicate gallery footage: {event['id']}"
    digests.add(digest)

replace(ROOT / 'index.html', 'homepage-events', '\n'.join(map(card, events)))
print(f'Rendered {len(events)} distinct reviewed gallery clips.')
