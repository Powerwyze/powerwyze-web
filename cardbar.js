(() => {
 'use strict';
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const dialog=$('#cardologist-dialog');
 $$('[data-help-open]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));
 $('.dialog-close')?.addEventListener('click',()=>dialog.close());
 const suggestions={leads:'A branded landing page with lead capture is a great start. Add the Cardologist to answer questions and help visitors take the next step.',bookings:'Try the Service page style with your booking link. The Cardologist add-on can support appointment scheduling once your calendar is connected.',questions:'Pair a clear business profile with the Cardologist. During setup, provide your FAQs, services, and preferred tone for a chat or voice assistant.'};
 $$('[data-goal]').forEach(b=>b.addEventListener('click',()=>$('#guide-answer').textContent=suggestions[b.dataset.goal]));
 const f=$('#card-mix');if(!f)return;
 let step=0;
 const fields=f.elements;
 const params=new URLSearchParams(location.search);
 if(params.get('ai')==='1')$('#ai-addon').checked=true;
 function showStep(n,focus=true){step=n;$$('[data-step]').forEach(s=>s.hidden=Number(s.dataset.step)!==n);$$('[data-step-link]').forEach(b=>{if(Number(b.dataset.stepLink)===n)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});$('#step-back').disabled=n===0;$('#step-next').hidden=n===4;update();if(focus){const heading=$(`[data-step="${n}"] h2`);heading.tabIndex=-1;heading.focus({preventScroll:true});f.scrollIntoView({block:'start',behavior:'smooth'})}}
 function validateThrough(n){for(const panel of $$('[data-step]')){if(Number(panel.dataset.step)>n)continue;for(const input of panel.querySelectorAll('input,select,textarea')){if(!input.checkValidity()){showStep(Number(panel.dataset.step));input.reportValidity();return false}}}return true}
 $('#step-next').addEventListener('click',()=>{if(validateThrough(step))showStep(Math.min(4,step+1))});
 $('#step-back').addEventListener('click',()=>showStep(Math.max(0,step-1)));
 $$('[data-step-link]').forEach(b=>b.addEventListener('click',()=>{const next=Number(b.dataset.stepLink);if(next<=step||validateThrough(next-1))showStep(next)}));
 f.addEventListener('invalid',e=>{const panel=e.target.closest('[data-step]');if(panel?.hidden)showStep(Number(panel.dataset.step));},true);
 function update(){const name=fields.name.value.trim()||'Your name',company=fields.company.value.trim()||'YOUR BUSINESS';const ai=$('#ai-addon').checked;const card=fields.card_type.value;const qty=Math.max(1,Number(fields.quantity.value)||1);const amount=50*qty;const monthly=ai?15:5;
 $('[data-preview-name]').textContent=name;$('[data-preview-company]').textContent=company;$('[data-preview-role]').textContent=fields.role.value||'Your next great introduction.';$('[data-preview-initial]').textContent=name[0].toUpperCase();$('[data-preview-action=ai]').hidden=!ai;
 const backgrounds={'Midnight Gold':'radial-gradient(ellipse at top,#443122,#17100e 65%)','Burgundy Reserve':'linear-gradient(150deg,#552032,#160e13)','Copper Signature':'linear-gradient(150deg,#6a3f27,#1b1210)'};$('.phone-profile').style.background=backgrounds[fields.design.value];
 $('#card-total').textContent='$'+amount;$('#monthly-total').textContent='$'+monthly+'/mo';$('#ai-price-line').hidden=!ai;
 const rows=[['Card',card+' × '+qty],['Design',fields.design.value],['Landing page',fields.landing_style.value],['Automations',[...f.querySelectorAll('[name=automations]:checked')].map(i=>i.value).join(', ')||'None selected'],['AI Cardologist',ai?'Requested · $10/month':'Not added'],['Cards · one-time','$'+amount],['Hosting + add-ons','$'+monthly+'/month']];
 $('#review-details').replaceChildren(...rows.map(([label,value])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);return row}));$('#mix-summary').value=rows.map(r=>r.join(': ')).join('\n');}
 f.addEventListener('input',update);f.addEventListener('change',update);
 // Preserve native upload handler while ensuring every step is valid and summary is current.
 f.addEventListener('submit',e=>{if(!validateThrough(4)){e.preventDefault();e.stopImmediatePropagation();return}update()},true);
 $('#simulate-tap').addEventListener('click',()=>{$('#simulation').textContent='Preview: NFC tap → your branded landing page → visitor chooses a next step. Try the phone buttons below.';$('.phone').scrollIntoView({block:'center',behavior:'smooth'})});
 $$('[data-preview-action]').forEach(b=>b.addEventListener('click',()=>{const feedback={contact:'Preview: your visitor would save your contact details.',website:fields.website.value?'Preview destination: '+fields.website.value:'Add your website in Your signature to set this destination.',booking:fields.booking_url.value?'Preview destination: '+fields.booking_url.value:'Add your booking link in Your signature to set this destination.',ai:'AI preview: your configured assistant would answer here. No live agent is connected.'};$('.phone-feedback').textContent=feedback[b.dataset.previewAction]}));
 showStep(0,false);
})();
