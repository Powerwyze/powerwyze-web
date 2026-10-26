#!/usr/bin/env python3
"""Render the reviewed event manifest into static, accessible HTML. No runtime fetch."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
events = json.loads((ROOT / 'data/event-showcase.json').read_text())
esc = html.escape

def video(event, location):
    caption = f"{location}-{event['id']}-caption"
    landscape = ' event-video-landscape' if event['width'] > event['height'] else ''
    return f'''<div class="scroll-video event-video{landscape}">
<video data-event-video controls muted loop playsinline preload="none" width="{event['width']}" height="{event['height']}" poster="{esc(event['poster'])}" aria-label="{esc(event['name'])} — Ai PhotoBooth event footage" aria-describedby="{caption}">
<source src="{esc(event['video'])}" type="video/mp4">
Your browser does not support this video. <a href="{esc(event['video'])}">Download the event clip</a>.
</video>
</div>'''

def card(event, index):
    return f'''<article class="work-card tone-{index}">
<div class="work-image">{video(event, 'selected')}</div>
<a class="work-caption" href="/projects#{esc(event['id'])}">
<div><h3>{esc(event['name'])}</h3><p id="selected-{event['id']}-caption">{esc(event['copy'])}</p></div><span class="work-link-arrow" aria-hidden="true">↗</span>
</a>
</article>'''

def moment(event):
    return f'''<figure>
{video(event, 'moment')}
<figcaption><h3>{esc(event['name'])}</h3><p id="moment-{event['id']}-caption">{esc(event['copy'])}</p></figcaption>
</figure>'''

def project(event):
    alias = '<span id="turkish-tastes" aria-hidden="true"></span>' if event['id'] == 'americas-food-beverage' else ''
    return f'''<article class="project-detail" id="{esc(event['id'])}">
<div class="project-video">{video(event, 'project')}</div>
<div>
{alias}
<p class="eyebrow">Ai PhotoBooth / In the field</p>
<h2>{esc(event['name'])}</h2>
<p id="project-{event['id']}-caption">{esc(event['copy'])}</p>
<a class="button" href="/contact">Plan your activation<span aria-hidden="true">↗</span></a>
</div>
</article>'''

def replace(path, marker, markup):
    text = path.read_text()
    start, end = f'<!-- {marker}:start -->', f'<!-- {marker}:end -->'
    before, rest = text.split(start, 1)
    _, after = rest.split(end, 1)
    path.write_text(before + start + '\n' + markup + '\n' + end + after)

assert len({e['id'] for e in events}) == len(events)
for event in events:
    assert 'Ai PhotoBooth' in event['copy']
    for key in ('video', 'poster'):
        assert event[key].startswith('/assets/'), event[key]
        assert (ROOT / event[key].lstrip('/')).is_file(), event[key]

replace(ROOT / 'index.html', 'selected-events', '\n'.join(card(e, i) for i, e in enumerate(events[:3])))
replace(ROOT / 'index.html', 'event-moments', '\n'.join(map(moment, events)))
replace(ROOT / 'projects.html', 'event-projects', '\n'.join(map(project, events)))
print(f'Rendered {len(events)} verified events.')
