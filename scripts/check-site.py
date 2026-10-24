#!/usr/bin/env python3
"""Check the static marketing site without installing dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import json

ROOT = Path(__file__).resolve().parents[1]
PAGES = ["index.html", "experiences.html", "projects.html", "corporate-gifting.html",
         "experiences/ai-photo.html", "contact.html", "about.html",
         "products/robokiosk.html", "ambassadors.html", "privacy.html", "terms.html", "thanks.html"]
ALIASES = {"/": "index.html", "/products": "index.html",
           "/ai-cards/builder": "ai-cards-builder.html", "/ai-cards/pricing": "ai-cards-pricing.html",
           "/ai-cards/thanks": "ai-cards-thanks.html"}

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

errors = []
targets = set()
for name in PAGES:
    doc = Document((ROOT / name).read_text())
    ids = [a["id"] for t, a in doc.tags if "id" in a]
    if len(ids) != len(set(ids)):
        errors.append(f"{name}: duplicate IDs")
    if sum(t == "h1" for t, a in doc.tags) != 1:
        errors.append(f"{name}: expected one h1")
    for tag, attrs in doc.tags:
        for attr in ("src", "href", "poster"):
            value = attrs.get(attr, "")
            url = urlparse(value)
            if not value or url.scheme or value.startswith("#"):
                continue
            path = url.path
            local = path.lstrip("/") if path.startswith("/") else str(Path(name).parent / path)
            target = ROOT / ALIASES.get(path, local)
            if not target.is_file() and (ROOT / (local + ".html")).is_file():
                target = ROOT / (local + ".html")
            if not target.is_file():
                errors.append(f"{name}: missing {value}")
            else:
                targets.add(str(target.relative_to(ROOT)))
forms = []
for name in PAGES + ["ai-cards-builder.html"]:
    for tag, attrs in Document((ROOT / name).read_text()).tags:
        if tag == "form":
            forms.append(name)
            if attrs.get("action") != "https://formsubmit.co/wyzer@powerwyze.com":
                errors.append(f"{name}: incorrect form destination")
            if attrs.get("method", "").lower() != "post":
                errors.append(f"{name}: form must POST")
assert len(forms) == 4, f"Expected four submission flows, found {forms}"
print(json.dumps({"pages": len(PAGES), "local_targets": len(targets), "forms": forms, "errors": errors}, indent=2))
raise SystemExit(bool(errors))
