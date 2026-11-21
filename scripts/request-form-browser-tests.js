(async () => {
  const results = [];
  const output = document.querySelector('#results');
  const frame = document.querySelector('iframe');
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const check = (name, run) => { run(); results.push({ name, passed: true }); output.textContent = JSON.stringify(results, null, 2); };
  const load = () => new Promise(resolve => { frame.onload = () => resolve(frame.contentWindow); frame.src = '/contact'; });
  const setFiles = (win, id, count, {size = 100, name = 'image.png', type = 'image/png'} = {}) => {
    const input = win.document.getElementById(id);
    const transfer = new win.DataTransfer();
    for (let index = 0; index < count; index++) transfer.items.add(new win.File([new Uint8Array(size)], `${index}-${name}`, {type}));
    input.files = transfer.files;
    input.dispatchEvent(new win.Event('change', {bubbles:true}));
  };
  const fill = win => {
    const form = win.document.querySelector('form');
    for (const input of form.querySelectorAll('[required]')) {
      if (input.matches(':disabled') || input.type === 'file') continue;
      if (input.type === 'radio') { if (!form.querySelector(`input[name="${CSS.escape(input.name)}"]:checked`)) input.checked = true; }
      else if (input.tagName === 'SELECT') input.selectedIndex = 1;
      else input.value = input.type === 'email' ? 'fixture@example.invalid' : input.type === 'tel' ? '2025550100' : input.type === 'number' ? '1' : input.type === 'date' ? '2026-12-01' : 'TEST FIXTURE — NOT A REQUEST';
    }
    return form;
  };
  const capture = (win, fail = false) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Local mock POST timed out')), 10000);
    const listener = event => {
      if (event.source !== frame.contentWindow || event.origin !== location.origin || !event.data.capture) return;
      clearTimeout(timer); window.removeEventListener('message',listener); resolve(event.data.capture);
    };
    window.addEventListener('message', listener);
    const form = win.document.querySelector('form');
    if (fail) form.action += '?fail=1';
    form.requestSubmit();
    assert(win.document.querySelector('[type=submit]').disabled, 'submit button must lock');
  });
  try {
    let win = await load();
    let form = fill(win);
    check('zero files blocks business request', () => assert(!form.checkValidity(), 'missing logo accepted'));
    setFiles(win,'company-logo',1);
    check('one image enables valid business request', () => assert(form.checkValidity(),'valid request blocked'));
    setFiles(win,'ai-photo-reference',5); setFiles(win,'first-screen-reference',4);
    check('ten images across all categories accepted', () => assert(form.checkValidity(),'ten images blocked'));
    check('multipart keeps all ten attachments with distinct keys and category manifest', () => {
      const data = new win.FormData(form);
      const files = [...data.entries()].filter(([,v])=> v instanceof win.File);
      assert(files.length === 10, 'files dropped'); assert(new Set(files.map(([k])=>k)).size===10,'duplicate fields');
      assert(data.get('Upload categories').includes('AI photo transformation'), 'category missing');
      assert(data.get('_captcha') === 'true' && data.get('_next') === 'https://powerwyze.com/thanks?type=quote','integration changed');
    });
    setFiles(win,'first-screen-reference',5);
    check('eleven images rejected across categories', () => assert(!form.checkValidity() && win.document.querySelector('#request-file-status').textContent.includes('no more than 10'),'eleven accepted'));
    win.document.querySelector('[data-clear-upload="first-screen-reference"]').click();
    check('clear category recovers validity', () => assert(form.checkValidity(),'clear did not recover'));
    setFiles(win,'ai-photo-reference',1,{name:'bad.exe',type:'application/octet-stream'});
    check('unsupported type rejected', () => assert(!form.checkValidity(),'invalid type accepted'));
    setFiles(win,'ai-photo-reference',1,{name:'bad.png',type:'text/html'});
    check('MIME mismatch rejected', () => assert(!form.checkValidity(),'mismatch accepted'));
    setFiles(win,'ai-photo-reference',1,{size:10_000_000});
    check('combined file size rejected', () => assert(!form.checkValidity(),'oversize accepted'));
    setFiles(win,'ai-photo-reference',0); setFiles(win,'company-logo',1,{size:10_000_000});
    check('exact 10 MB accepted', () => assert(form.checkValidity(),'boundary blocked'));
    setFiles(win,'company-logo',1,{size:0});
    check('empty image rejected', () => assert(!form.checkValidity(),'empty accepted'));
    setFiles(win,'company-logo',11);
    const selector = win.document.querySelector('[data-enquiry-type]');
    selector.selectedIndex=1; selector.dispatchEvent(new win.Event('change'));
    form=fill(win);
    check('inactive uploads do not block private event', () => assert(form.checkValidity(),'inactive uploads block private event'));
    check('private payload excludes business uploads and fields', () => { const data = new win.FormData(form); assert(![...data.values()].some(v=>v instanceof win.File),'business files leaked'); assert(!data.has('Company/Organization'),'business fields leaked'); });
    win.document.querySelector('#private-hours').value='0'; win.document.querySelector('#private-hours').dispatchEvent(new win.Event('input'));
    check('private hours validation preserved', () => assert(!form.checkValidity(),'zero hours accepted'));
    selector.selectedIndex=0; selector.dispatchEvent(new win.Event('change'));
    check('switching back restores files and revalidates', () => assert(win.document.querySelector('#company-logo').files.length===11 && !form.checkValidity(),'state lost'));
    form.reset(); await new Promise(resolve=>queueMicrotask(resolve));
    check('reset clears files and errors', () => assert(!win.document.querySelector('#company-logo').files.length && win.document.querySelector('#request-file-status').dataset.error==='false','reset failed'));
    win=await load(); fill(win); setFiles(win,'company-logo',1);
    let response = await capture(win);
    check('native one-file POST captured locally', () => assert(response.files.length===1 && response.files[0].field==='attachment' && response.forwarded===false,'native post lost file'));
    win=await load(); fill(win); setFiles(win,'company-logo',2); setFiles(win,'ai-photo-reference',4); setFiles(win,'first-screen-reference',4);
    response=await capture(win);
    check('native ten-file POST captures every file', () => assert(response.files.length===10 && new Set(response.files.map(f=>f.field)).size===10 && response.fields['Upload categories'][0].includes('First screen inspiration'),'native post dropped files'));
    win=await load(); fill(win); setFiles(win,'company-logo',1);
    response=await capture(win,true);
    check('mock 503 failure creates no external request or auto retry', () => assert(response.failed && !response.forwarded,'failure not simulated'));
    document.querySelector('#summary').textContent=`PASS: ${results.length} checks. All POSTs captured locally; zero external submissions. Native back/retry is tested separately with a user-activated submit.`;
    document.body.dataset.result='passed';
  } catch(error) {
    document.querySelector('#summary').textContent='FAIL: '+error.message;
    document.body.dataset.result='failed';
  }
})();
