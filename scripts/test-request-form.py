"""Local browser harness and native multipart mock. Never forwards submissions.
Run: python3 scripts/test-request-form.py; open http://127.0.0.1:8768/_tests
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse
from email.parser import BytesParser
from email.policy import default
import html
import json
ROOT = Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    fail_once_seen = False
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def end_headers(self):
        self.send_header('Content-Security-Policy', "form-action 'self'")
        self.send_header('Cache-Control','no-store')
        super().end_headers()
    def respond(self,body,status=200):
        body=body.encode(); self.send_response(status); self.send_header('Content-Type','text/html; charset=utf-8'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)
    def do_GET(self):
        path=urlparse(self.path).path
        if path=='/_tests':
            self.respond('''<!doctype html><html><head><title>Request form browser tests</title></head><body><h1>Request form tests</h1><p id="summary">Running local tests…</p><pre id="results"></pre><iframe title="Local request form" style="width:100%;height:600px"></iframe><script src="/scripts/request-form-browser-tests.js"></script></body></html>'''); return
        if path=='/_retry':
            source=(ROOT/'contact.html').read_text().replace('action="https://formsubmit.co/wyzer@powerwyze.com"','action="/_capture?fail-once=1"')
            fixture='''<script>addEventListener('load',()=>{const form=document.querySelector('form');for(const input of form.querySelectorAll('[required]')){if(input.matches(':disabled')||input.type==='file')continue;if(input.type==='radio'){if(!form.querySelector('input[name="'+CSS.escape(input.name)+'"]:checked'))input.checked=true;}else if(input.tagName==='SELECT')input.selectedIndex=1;else input.value=input.type==='email'?'fixture@example.invalid':input.type==='tel'?'2025550100':input.type==='number'?'1':'TEST FIXTURE — NOT A REQUEST';}const files=new DataTransfer();files.items.add(new File(['test fixture'],'logo.png',{type:'image/png'}));const input=document.querySelector('#company-logo');input.files=files.files;input.dispatchEvent(new Event('change'));});</script>'''
            self.respond(source.replace('</body>',fixture+'</body>')); return
        if path in ['/contact','/contact.html']:
            self.respond((ROOT/'contact.html').read_text().replace('action="https://formsubmit.co/wyzer@powerwyze.com"','action="/_capture"')); return
        super().do_GET()
    def do_POST(self):
        if urlparse(self.path).path!='/_capture': self.send_error(405); return
        length=int(self.headers.get('Content-Length','0'))
        if length>11_000_000: self.send_error(413); return
        body=self.rfile.read(length)
        message=BytesParser(policy=default).parsebytes(('Content-Type: '+self.headers['Content-Type']+'\r\nMIME-Version: 1.0\r\n\r\n').encode()+body)
        fields={}; files=[]
        for part in message.iter_parts():
            name=part.get_param('name',header='content-disposition'); filename=part.get_filename(); data=part.get_payload(decode=True)
            if filename is not None: files.append({'field':name,'filename':filename,'bytes':len(data)})
            else: fields.setdefault(name,[]).append(data.decode())
        failed='fail=1' in self.path or ('fail-once=1' in self.path and not Handler.fail_once_seen)
        if 'fail-once=1' in self.path: Handler.fail_once_seen=True
        result={'fields':fields,'files':files,'forwarded':False,'failed':failed}
        encoded=json.dumps(result).replace('<','\\u003c')
        self.respond('<!doctype html><html><body><h1>Local mock '+('503 failure' if result['failed'] else 'capture')+'</h1><p>No email sent. No production data stored.</p><pre>'+html.escape(json.dumps(result,indent=2))+'</pre><script>parent.postMessage({capture:'+encoded+'},location.origin)</script></body></html>',503 if result['failed'] else 200)
print('Local tests at http://127.0.0.1:8768/_tests',flush=True)
ThreadingHTTPServer(('127.0.0.1',8768),Handler).serve_forever()
