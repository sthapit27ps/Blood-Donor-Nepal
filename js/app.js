/* ═════════ sthapit27ps · 1. SETTINGS ═════════ */
const ADMIN_PASSWORD = "admin123"; // demo only. A real site needs a real backend login.
const TYPES = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const AREAS = ["Kathmandu","Lalitpur","Bhaktapur","Pokhara","Biratnagar","Birgunj","Butwal","Chitwan","Dharan","Nepalgunj","Dhangadhi","Janakpur","Hetauda"];
// Who can donate to whom (red cell compatibility)
const CAN_GIVE = {"O-":["O-"],"O+":["O+","O-"],"A-":["A-","O-"],"A+":["A+","A-","O+","O-"],"B-":["B-","O-"],"B+":["B+","B-","O+","O-"],"AB-":["AB-","A-","B-","O-"],"AB+":TYPES};

/* ═════════ sthapit27ps · 2. DATA (saved in browser) ═════════ */
const KEY = "bdn_v1";
const uid = () => Math.random().toString(36).slice(2,9);
const ago = d => new Date(Date.now() - d*864e5).toISOString().slice(0,10);
let db;
function seed(){
  return {
    users:[
      {id:"u1",name:"Anita Gurung",phone:"9800000001",type:"O-",area:"Pokhara",age:27,last:ago(120),kyc:"verified",cit:"12-34-567",donations:5,blocked:false},
      {id:"u2",name:"Bikash Shrestha",phone:"9800000002",type:"A+",area:"Kathmandu",age:31,last:ago(30),kyc:"verified",cit:"98-76-543",donations:2,blocked:false},
      {id:"u3",name:"Sunita Rai",phone:"9800000003",type:"B+",area:"Dharan",age:24,last:"",kyc:"pending",cit:"45-67-890",donations:0,blocked:false},
      {id:"u4",name:"Ramesh Thapa",phone:"9800000004",type:"O+",area:"Lalitpur",age:36,last:ago(200),kyc:"verified",cit:"11-22-333",donations:9,blocked:false}],
    requests:[
      {id:"r1",by:"Hari Karki",type:"A+",units:2,area:"Kathmandu",hospital:"Bir Hospital",urgency:"urgent",status:"open",at:ago(0)},
      {id:"r2",by:"Maya Tamang",type:"O-",units:1,area:"Pokhara",hospital:"Western Regional Hospital",urgency:"normal",status:"open",at:ago(1)}],
    swaps:[{id:"s1",by:"Prakash B.",have:"B+",need:"A+",area:"Kathmandu",note:"Family donor available on weekends"}],
    logs:[{t:Date.now()-36e5,m:"System started with demo data"}]
  };
}
try{ db = JSON.parse(localStorage.getItem(KEY)) }catch(e){}
if(!db) db = seed();
let meId = null; try{ meId = localStorage.getItem(KEY+"_me") }catch(e){}
let isAdmin = false, adminTab = "overview", pickedType = "", pickedType2 = "";
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(db)) }catch(e){} }
function log(m){ db.logs.unshift({t:Date.now(),m}); db.logs = db.logs.slice(0,80); save(); }
const me = () => db.users.find(u => u.id === meId);
const esc = s => String(s??"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(m){ const t=document.createElement("div"); t.className="toast"; t.textContent=m; document.body.append(t); setTimeout(()=>t.remove(),2600); }
function daysSince(d){ return d ? Math.floor((Date.now()-new Date(d))/864e5) : 999; }
function eligible(u){ const d = daysSince(u.last); return {ok: d>=90 && u.age>=18 && u.age<=60, wait: Math.max(0,90-d)}; }
function badge(n){ return n>=10?"Gold hero":n>=5?"Silver lifesaver":n>=1?"Bronze donor":"New member"; }
function donorsFor(type, area){
  return db.users.filter(u => CAN_GIVE[type].includes(u.type) && u.kyc==="verified" && !u.blocked && eligible(u).ok && (!area || u.area===area));
}
const areaOpts = (all) => (all?'<option value="">All areas</option>':'') + AREAS.map(a=>`<option>${a}</option>`).join("");
function typePicker(id, cur){ return `<div class="types" id="${id}">${TYPES.map(t=>`<button type="button" class="${t===cur?"on":""}" data-t="${t}">${t}</button>`).join("")}</div>`; }

/* ═════════ sthapit27ps · 3. PAGES ═════════ */
const pages = {
home(){
  const verified = db.users.filter(u=>u.kyc==="verified").length;
  const nOpen = db.requests.filter(r=>r.status==="open").length;
  return `<section class="hero">
    <h1>Need blood? Ask someone from your own district.</h1>
    <p class="facts"><b>${db.users.length}</b> people have signed up and <b>${verified}</b> are verified. <b>${nOpen}</b> ${nOpen===1?"request is":"requests are"} open today.</p>
    <a class="btn" href="#request">Request blood</a> <a class="btn alt" href="#join" style="background:transparent;color:var(--red)">Become a donor</a>
  </section>
  <div class="card"><h2>Find donors</h2>
    <div class="row"><div><label>Blood type needed</label>${typePicker("pk1",pickedType)}</div>
    <div><label for="fa">Area</label><select id="fa">${areaOpts(true)}</select></div></div>
    <div id="found"></div></div>
  <div class="card"><h2>Can I donate today?</h2>
    <div class="row"><div><label for="ea">Age</label><input id="ea" type="number" value="25" min="1"></div>
    <div><label for="ed">Last donated (leave empty if never)</label><input id="ed" type="date"></div></div>
    <p id="eres" style="margin:12px 0 0"></p>
    <p class="note">Rule of thumb: age 18 to 60 and at least 90 days since your last donation. A health worker makes the final call.</p></div>`;
},
request(){
  const open = db.requests.filter(r=>r.status==="open");
  return `<div class="card"><h2>Request blood</h2>
    <form id="rq"><label>Blood type needed</label>${typePicker("pk2",pickedType)}
    <div class="row"><div><label for="rn">Your name</label><input id="rn" required value="${esc(me()?.name||"")}"></div>
    <div><label for="ru">Units needed</label><input id="ru" type="number" min="1" max="10" value="1"></div></div>
    <div class="row"><div><label for="ra">Area</label><select id="ra">${areaOpts()}</select></div>
    <div><label for="rh">Hospital</label><input id="rh" required placeholder="e.g. Patan Hospital"></div></div>
    <label for="rg">How urgent?</label><select id="rg"><option value="normal">Within a few days</option><option value="urgent">Urgent, today</option></select>
    <p id="rmatch" class="tag" style="margin:12px 0 0"></p>
    <div style="margin-top:12px"><button>Send request</button></div></form></div>
  <div class="card"><h2>Open requests</h2>${open.length?open.map(r=>`<div class="item"><div class="bt">${r.type}</div>
    <div class="grow"><b>${esc(r.hospital)}</b>, ${esc(r.area)}<br><small>${r.units} unit(s) for ${esc(r.by)} · ${r.at}</small></div>
    ${r.urgency==="urgent"?'<span class="tag red">Urgent</span>':'<span class="tag">Normal</span>'}
    <button class="sm" data-help="${r.id}">I can donate</button></div>`).join(""):"<p>No open requests right now. That is good news.</p>"}</div>`;
},
exchange(){
  const m = me();
  return `<div class="card"><h2>Blood exchange board</h2>
    <form id="sw"><div class="row"><div><label>We can offer</label>${typePicker("pk3",pickedType)}</div><div><label>We need</label>${typePicker("pk4",pickedType2)}</div></div>
    <div class="row"><div><label for="sa">Area</label><select id="sa">${areaOpts()}</select></div><div><label for="sn">Short note</label><input id="sn" maxlength="80" placeholder="e.g. Available after 4 pm"></div></div>
    <div style="margin-top:12px"><button>Post to board</button></div></form></div>
  <div class="card"><h2>Open swaps</h2>${db.swaps.length?db.swaps.map(s=>{
    const match = m && s.have===m.type;
    return `<div class="item"><div class="bt">${s.have}→${s.need}</div><div class="grow"><b>${esc(s.by)}</b>, ${esc(s.area)}<br><small>${esc(s.note)}</small></div>
    ${match?'<span class="tag ok">Matches your type</span>':""}<button class="sm alt" data-swap="${s.id}">Contact</button></div>`}).join(""):"<p>No swaps posted yet.</p>"}</div>`;
},
join(){
  const m = me();
  if(m){ const e=eligible(m);
    return `<div class="card"><h2>Hello, ${esc(m.name)}</h2>
    <p><span class="tag red">${m.type}</span> <span class="tag">${esc(m.area)}</span> <span class="tag ${m.kyc==="verified"?"ok":m.kyc==="rejected"?"red":"warn"}">KYC ${m.kyc}</span> <span class="tag">${badge(m.donations)}</span></p>
    <p>${m.donations} donation(s) so far. ${e.ok?"You are eligible to donate now.":(m.age<18||m.age>60?"Donors must be 18 to 60.":`You can donate again in ${e.wait} day(s).`)}</p>
    ${m.kyc!=="verified"?'<p class="note">Your KYC is waiting for admin review. Only verified donors appear in search results.</p>':""}
    <button class="sm" id="don">I donated today</button> <button class="sm gray" id="out">Log out</button></div>`; }
  return `<div class="card"><h2>Become a donor</h2>
    <form id="rg"><div class="row"><div><label for="n">Full name</label><input id="n" required></div><div><label for="p">Phone</label><input id="p" required pattern="9[78][0-9]{8}" title="10-digit Nepali mobile number" placeholder="98XXXXXXXX"></div></div>
    <label>Blood type</label>${typePicker("pk5",pickedType)}
    <div class="row"><div><label for="a">Area</label><select id="a">${areaOpts()}</select></div><div><label for="g">Age</label><input id="g" type="number" min="18" max="60" required></div></div>
    <label for="l">Last donated (optional)</label><input id="l" type="date">
    <h3 style="margin-top:22px">KYC verification</h3>
    <div class="row"><div><label for="c">Citizenship number</label><input id="c" required></div><div><label for="f">Photo of citizenship card</label><input id="f" type="file" accept="image/*"></div></div>
    <p class="note" style="margin-top:12px">Demo note: the photo is not uploaded anywhere. Only its file name is kept for the admin to see.</p>
    <div style="margin-top:12px"><button>Register and send KYC</button></div></form></div>`;
},
admin(){
  if(!isAdmin) return `<div class="card" style="max-width:420px;margin:auto"><h2>Admin login</h2><form id="al"><label for="ap">Password</label><input id="ap" type="password" required><p style="color:var(--mute);font-size:.9rem">Demo password: ${ADMIN_PASSWORD}</p><button>Log in</button></form></div>`;
  const tabs = ["overview","requests","users","logs"];
  let body = "";
  if(adminTab==="overview"){
    const max = Math.max(1,...TYPES.map(t=>db.users.filter(u=>u.type===t).length));
    const pend = db.users.filter(u=>u.kyc==="pending").length, urg = db.requests.filter(r=>r.status==="open"&&r.urgency==="urgent").length;
    body = `<div class="stats" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:18px">
      <div class="stat"><b>${pend}</b><span>KYC to review</span></div><div class="stat"><b>${urg}</b><span>urgent requests</span></div>
      <div class="stat"><b>${db.users.length}</b><span>users</span></div><div class="stat"><b>${db.swaps.length}</b><span>swaps</span></div></div>
      <div class="card"><h3>Donors by blood type</h3><div class="bars">${TYPES.map(t=>{const n=db.users.filter(u=>u.type===t).length;return `<div><b>${t}</b><span style="width:${n/max*70}%"></span>${n}</div>`}).join("")}</div>
      <p style="color:var(--mute);margin:10px 0 0">Types with few donors are where a donation drive helps most.</p></div>`;
  } else if(adminTab==="requests"){
    body = `<div class="card tblwrap"><table><tr><th>Type</th><th>Hospital</th><th>Area</th><th>Status</th><th></th></tr>${db.requests.map(r=>`<tr><td><b>${r.type}</b> ×${r.units}</td><td>${esc(r.hospital)}<br><small>${esc(r.by)}</small></td><td>${esc(r.area)}</td>
      <td><span class="tag ${r.status==="open"?"warn":r.status==="fulfilled"?"ok":"red"}">${r.status}</span></td>
      <td>${r.status==="open"?`<button class="sm" data-rs="${r.id}:fulfilled">Fulfilled</button> <button class="sm gray" data-rs="${r.id}:rejected">Reject</button>`:""}</td></tr>`).join("")}</table></div>`;
  } else if(adminTab==="users"){
    body = `<div class="card tblwrap"><table><tr><th>Name</th><th>Type</th><th>KYC</th><th></th></tr>${db.users.map(u=>`<tr><td>${esc(u.name)}<br><small>${esc(u.area)} · ${esc(u.phone)} · ID ${esc(u.cit)}${u.file?" · "+esc(u.file):""}</small></td><td><b>${u.type}</b></td>
      <td><span class="tag ${u.kyc==="verified"?"ok":u.kyc==="pending"?"warn":"red"}">${u.blocked?"blocked":u.kyc}</span></td>
      <td>${u.kyc==="pending"?`<button class="sm" data-us="${u.id}:verify">Verify</button> <button class="sm gray" data-us="${u.id}:reject">Reject</button> `:""}<button class="sm gray" data-us="${u.id}:block">${u.blocked?"Unblock":"Block"}</button></td></tr>`).join("")}</table></div>`;
  } else {
    body = `<div class="card"><button class="sm alt" id="csv">Download users as CSV</button><div style="margin-top:10px">${db.logs.map(l=>`<div class="item"><small style="min-width:140px">${new Date(l.t).toLocaleString()}</small><div class="grow">${esc(l.m)}</div></div>`).join("")}</div></div>`;
  }
  return `<h2>Admin dashboard</h2><div class="tabs">${tabs.map(t=>`<button data-at="${t}" class="${t===adminTab?"on":""}">${t[0].toUpperCase()+t.slice(1)}</button>`).join("")}<button class="gray" id="alo">Log out</button></div>${body}`;
}};

/* ═════════ sthapit27ps · 4. ROUTER + EVENTS ═════════ */
const labels = {home:"Home",request:"Request",exchange:"Exchange",join:"Join",admin:"Admin"};
const ICONS={home:'<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',request:'<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z"/>',exchange:'<path d="M5 8h13l-3-3M19 16H6l3 3"/>',join:'<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>',admin:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'};
function render(){
  const r = (location.hash||"#home").slice(1); const page = pages[r]?r:"home";
  document.getElementById("nav").innerHTML = Object.keys(labels).map(k=>`<a href="#${k}" class="${k===page?"on":""}"><svg viewBox="0 0 24 24">${ICONS[k]}</svg>${labels[k]}</a>`).join("");
  document.getElementById("app").innerHTML = pages[page]();
  wire(page);
}
addEventListener("hashchange", () => { pickedType=""; pickedType2=""; render(); window.scrollTo(0,0); });
const $ = id => document.getElementById(id);
function pick(id, cb){ const el=$(id); if(!el) return; el.onclick = e => { const t=e.target.dataset.t; if(!t) return; [...el.children].forEach(b=>b.classList.toggle("on",b.dataset.t===t)); cb(t); }; }

function wire(page){
  if(page==="home"){
    const show = () => { const out=$("found"); if(!pickedType){ out.innerHTML='<p style="color:var(--mute)">Pick a blood type above.</p>'; return; }
      const list = donorsFor(pickedType, $("fa").value);
      out.innerHTML = list.length ? list.map(u=>`<div class="item"><div class="bt">${u.type}</div><div class="grow"><b>${esc(u.name)}</b> <span class="tag ok">KYC verified</span><br><small>${esc(u.area)} · ${badge(u.donations)}</small></div><button class="sm" data-call="${u.id}">Show phone</button></div>`).join("")
        : `<p>No verified donors available for ${pickedType} here yet. Try another area or <a href="#request">post a request</a>.</p>`; };
    pick("pk1", t => { pickedType=t; show(); }); $("fa").onchange = show; show();
    const chk = () => { const e=eligible({age:+$("ea").value,last:$("ed").value}); $("eres").innerHTML = e.ok?'<span class="tag ok">You can donate now</span>':`<span class="tag warn">${+$("ea").value<18||+$("ea").value>60?"Age must be 18 to 60":"Wait "+e.wait+" more day(s)"}</span>`; };
    $("ea").oninput = $("ed").oninput = chk; chk();
  }
  if(page==="request"){
    const upd = () => { const n = pickedType ? donorsFor(pickedType,$("ra").value).length : 0; $("rmatch").textContent = pickedType ? `${n} eligible verified donor(s) in ${$("ra").value}` : "Pick a blood type to see matching donors"; };
    pick("pk2", t => { pickedType=t; upd(); }); $("ra").onchange = upd; upd();
    $("rq").onsubmit = e => { e.preventDefault(); if(!pickedType) return toast("Please pick a blood type");
      const r={id:uid(),by:$("rn").value.trim(),type:pickedType,units:+$("ru").value,area:$("ra").value,hospital:$("rh").value.trim(),urgency:$("rg").value,status:"open",at:ago(0)};
      db.requests.unshift(r); log(`New ${r.urgency} request: ${r.type} ×${r.units} at ${r.hospital}`); toast("Request sent to donors in " + r.area); pickedType=""; render(); };
    document.querySelectorAll("[data-help]").forEach(b => b.onclick = () => { const r=db.requests.find(x=>x.id===b.dataset.help); log(`${me()?.name||"A visitor"} offered to donate for request at ${r.hospital}`); toast("Thank you. The hospital will be told you are willing."); });
  }
  if(page==="exchange"){
    pick("pk3", t => pickedType=t); pick("pk4", t => pickedType2=t);
    $("sw").onsubmit = e => { e.preventDefault(); if(!pickedType||!pickedType2) return toast("Pick both blood types");
      db.swaps.unshift({id:uid(),by:me()?.name||"Guest",have:pickedType,need:pickedType2,area:$("sa").value,note:$("sn").value||"No note"}); log(`Swap posted: ${pickedType} for ${pickedType2}`); pickedType=pickedType2=""; toast("Posted to the board"); render(); };
    document.querySelectorAll("[data-swap]").forEach(b => b.onclick = () => { log("Someone contacted a swap post"); toast("Contact request sent"); });
  }
  if(page==="join"){
    if(me()){ $("out").onclick = () => { meId=null; try{localStorage.removeItem(KEY+"_me")}catch(e){} render(); };
      $("don").onclick = () => { const u=me(); if(!eligible(u).ok) return toast("Not eligible yet"); u.donations++; u.last=ago(0); log(`${u.name} recorded a donation`); toast("Thank you for saving lives!"); render(); }; }
    else { pick("pk5", t => pickedType=t);
      $("rg").onsubmit = e => { e.preventDefault(); if(!pickedType) return toast("Pick your blood type");
        const u={id:uid(),name:$("n").value.trim(),phone:$("p").value,type:pickedType,area:$("a").value,age:+$("g").value,last:$("l").value,kyc:"pending",cit:$("c").value.trim(),file:$("f").files[0]?.name||"",donations:0,blocked:false};
        db.users.push(u); meId=u.id; try{localStorage.setItem(KEY+"_me",u.id)}catch(e){} log(`New registration: ${u.name} (${u.type}), KYC submitted`); toast("Registered! KYC is under review."); render(); }; }
  }
  if(page==="admin"){
    if(!isAdmin){ $("al").onsubmit = e => { e.preventDefault(); if($("ap").value===ADMIN_PASSWORD){ isAdmin=true; log("Admin logged in"); render(); } else toast("Wrong password"); }; return; }
    document.querySelectorAll("[data-at]").forEach(b => b.onclick = () => { adminTab=b.dataset.at; render(); });
    $("alo").onclick = () => { isAdmin=false; render(); };
    document.querySelectorAll("[data-rs]").forEach(b => b.onclick = () => { const [id,s]=b.dataset.rs.split(":"); const r=db.requests.find(x=>x.id===id); r.status=s; log(`Request at ${r.hospital} marked ${s}`); render(); });
    document.querySelectorAll("[data-us]").forEach(b => b.onclick = () => { const [id,a]=b.dataset.us.split(":"); const u=db.users.find(x=>x.id===id);
      if(a==="verify") u.kyc="verified"; if(a==="reject") u.kyc="rejected"; if(a==="block") u.blocked=!u.blocked; log(`${u.name}: ${a}`); render(); });
    if($("csv")) $("csv").onclick = () => { const rows=[["name","phone","type","area","kyc"],...db.users.map(u=>[u.name,u.phone,u.type,u.area,u.kyc])];
      const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(rows.map(r=>r.join(",")).join("\n")); a.download="donors.csv"; a.click(); };
  }
  document.querySelectorAll("[data-call]").forEach(b => b.onclick = () => { const u=db.users.find(x=>x.id===b.dataset.call); b.outerHTML=`<b>${esc(u.phone)}</b>`; log(`Phone viewed for ${u.name}`); });
}
render();
/* ═════════ sthapit27ps · END ═════════ */
