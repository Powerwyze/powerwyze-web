const { strict: assert } = require('node:assert');
const { uploadError, attachmentEntries } = require('../request-form.js');
const file = (name = 'photo.png', size = 100, type = 'image/png') => ({ name, size, type });
const group = (files, category = 'Company logo', accept = '.jpg,.jpeg,.png,.gif,.webp,.svg,.pdf') => ({ files, category, accept });
const checks = [];
function check(name, run) { run(); checks.push(name); }
check('zero optional files is valid for upload limits; HTML requires the logo', () => assert.equal(uploadError([group([])]), ''));
check('one image', () => assert.equal(uploadError([group([file()])]), ''));
check('ten images', () => assert.equal(uploadError([group(Array.from({length:10}, () => file()))]), ''));
check('eleven images rejected', () => assert.match(uploadError([group(Array.from({length:11}, () => file()))]), /no more than 10/));
check('count is combined across categories', () => assert.match(uploadError([group(Array(6).fill(file())), group(Array(5).fill(file()), 'AI photo transformation')]), /no more than 10/));
check('10 MB exact boundary allowed', () => assert.equal(uploadError([group([file('logo.png',10_000_000)])]), ''));
check('over 10 MB rejected', () => assert.match(uploadError([group([file('logo.png',10_000_001)])]), /10 MB/));
check('combined bytes across categories', () => assert.match(uploadError([group([file('logo.png',6_000_000)]),group([file('screen.png',4_000_001)],'First screen inspiration')]), /10 MB/));
check('non-image rejected', () => assert.match(uploadError([group([file('virus.exe',100,'application/octet-stream')])]), /unsupported/));
check('mismatched MIME rejected', () => assert.match(uploadError([group([file('photo.png',100,'text/html')])]), /unsupported/));
check('empty file rejected', () => assert.match(uploadError([group([file('photo.png',0)])]), /empty/));
check('uppercase extension and absent MIME supported', () => assert.equal(uploadError([group([file('LOGO.PNG',100,'')])]), ''));
check('PDF logo supported', () => assert.equal(uploadError([group([file('logo.pdf',100,'application/pdf')])]), ''));
check('PDF not allowed as AI photo reference', () => assert.match(uploadError([group([file('photo.pdf',100,'application/pdf')],'AI photo transformation','.jpg,.jpeg,.png,.gif')]), /unsupported/));
check('all ten attachments have unique fields and category mapping', () => {
  const entries = attachmentEntries([group(Array(2).fill(file())),group(Array(4).fill(file()),'AI photo transformation'),group(Array(4).fill(file()),'First screen inspiration')]);
  assert.equal(entries.length,10); assert.equal(new Set(entries.map(e=>e.key)).size,10);
  assert.equal(entries[0].key,'attachment'); assert.equal(entries[9].key,'attachment10');
  assert.equal(entries[2].category,'AI photo transformation'); assert.equal(entries[6].category,'First screen inspiration');
});
console.log(JSON.stringify({passed:checks.length,checks},null,2));
