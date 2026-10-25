// DOM smoke test: runs the real index.html + app.js in jsdom against the generated index.
// Usage: node tests/ui-smoke.js [ok|shardfail|indexfail|scriptfail]   (install jsdom first; run from a folder where it resolves)
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('fs'),path=require('path');
const ROOT=require('path').resolve(__dirname,'..'); // needs: npm install jsdom (not a site dependency)
const mode=process.argv[2]||'ok';
(async()=>{
  const html=fs.readFileSync(ROOT+'/index.html','utf8');
  const vc=new VirtualConsole(); const errs=[];
  vc.on('jsdomError',e=>errs.push('jsdomError: '+String(e.message).slice(0,120)));
  vc.on('error',(...a)=>errs.push('console.error: '+a.join(' ').slice(0,120)));
  const dom=new JSDOM(html,{url:'https://theuniversalconverter.com/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window;
  const fetched=[];
  w.fetch=async(u)=>{
    const url=String(u); fetched.push(url);
    const rel=url.replace(/^https:\/\/theuniversalconverter\.com\//,'').split('?')[0];
    if(mode==='shardfail'&&rel.includes('pairs/speed')) return {ok:false,status:503,json:async()=>({})};
    if(mode==='indexfail'&&rel.includes('units.json')) return {ok:false,status:500,json:async()=>({})};
    const f=path.join(ROOT,rel);
    if(!fs.existsSync(f)) return {ok:false,status:404,json:async()=>({}),text:async()=>''};
    const buf=fs.readFileSync(f,'utf8');
    return {ok:true,status:200,json:async()=>JSON.parse(buf),text:async()=>buf};
  };
  w.matchMedia=w.matchMedia||(()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}));
  // script loader for search-engine.js (jsdom outside-only: emulate onload by eval)
  const origAppend=w.document.head.appendChild.bind(w.document.head);
  w.document.head.appendChild=(el)=>{
    if(el.tagName==='SCRIPT'&&/search-engine\.js/.test(el.src)){
      if(mode==='scriptfail'){setTimeout(()=>el.onerror&&el.onerror(),0);return el;}
      w.eval(fs.readFileSync(ROOT+'/search-engine.js','utf8')); setTimeout(()=>el.onload&&el.onload(),0); return el;}
    return origAppend(el);
  };
  w.eval(fs.readFileSync(ROOT+'/app.js','utf8'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  const input=w.document.getElementById('globalSearch'); const box=()=>w.document.getElementById('searchResults');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function type(q){ input.value=q; input.dispatchEvent(new w.Event('input',{bubbles:true})); await sleep(900); }
  const show=(label)=>{const opts=[...box().children].map(c=>(c.getAttribute('role')||'-')+':'+c.textContent.replace(/\s+/g,' ').trim().slice(0,70)); console.log(`\n[${label}] active=${box().classList.contains('active')} rows=${opts.length}`); opts.slice(0,14).forEach(o=>console.log('  ',o)); if(opts.length>14)console.log('   ...');};
  console.log('mode',mode,'| fetched before typing:',fetched.length);
  input.dispatchEvent(new w.Event('focus'));await sleep(300);
  console.log('fetched after focus:',fetched.map(u=>u.replace('https://theuniversalconverter.com/','')));
  await type('knots'); show('knots');
  const more=[...box().children].find(c=>/Show more/.test(c.textContent));
  if(more){ more.click(); await sleep(500); show('knots after Show more'); }
  await type('knots to mph'); show('knots to mph');
  const a=box().querySelector('a'); if(a) console.log('first href:',a.getAttribute('href'));
  await type('qzxwvkj'); show('nonexistent');
  await type('<img src=x onerror=alert(1)>'); show('xss'); console.log('injected img nodes:',box().querySelectorAll('img').length);
  console.log('\nerrors:',errs.slice(0,5));
  w.close();process.exit(0);
})();
