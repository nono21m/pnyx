"use strict";
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmtY=y=>y<0?`${-y} av. J.-C.`:`${y}`;
const PN={athenes:"Athènes",rome:"Rome",constantinople:"Constantinople",xian:"Xi'an (Chang'an)",qufu:"Qufu",kyiv:"Kyiv",novgorod:"Novgorod",moscou:"Moscou",petersbourg:"Saint-Pétersbourg",runnymede:"Runnymede",londres:"Londres",thingvellir:"Þingvellir",munster:"Münster",versailles:"Versailles",berlin:"Berlin",maastricht:"Maastricht",paris:"Paris",amsterdam:"Amsterdam",alger:"Alger",plymouth:"Plymouth",philadelphie:"Philadelphie",gettysburg:"Gettysburg",washington:"Washington",sanfrancisco:"San Francisco",portauprince:"Port-au-Prince",nankin:"Nankin",pekin:"Pékin",shanghai:"Shanghai"};
const EVB=Object.fromEntries(EV.map(e=>[e.id,e]));
const ST={year:2026,regs:new Set(Object.keys(REG)),tags:new Set(),inf:true,vb:[0,0,960,500],hl:null};
const NS="http://www.w3.org/2000/svg";
// --- échelle de temps non linéaire
const s2y=s=>s<=250?Math.round(-1100+s/250*1100):s<=500?Math.round((s-250)/250*1500):Math.round(1500+(s-500)/500*526);
const y2s=y=>y<=0?(y+1100)/1100*250:y<=1500?250+y/1500*250:500+(y-1500)/526*500;
// --- carte
const svg=$("#map");
function buildMap(){
 let h=`<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#555"/></marker></defs><g id="cty">`;
 for(const c of MAP.countries)h+=`<path class="c" data-id="${c.id}" d="${c.d}"><title>${esc(c.n)}</title></path>`;
 svg.innerHTML=h+`</g><g id="inf"></g><g id="mk"></g>`;
}
function tint(){
 const on={};for(const r of ST.regs)for(const id of REG[r].ids)on[id]=REG[r].c;
 svg.querySelectorAll(".c").forEach(p=>{const c=on[p.dataset.id];p.style.fill=c?c+"44":"";});
}
const visible=()=>EV.filter(e=>e.y<=ST.year&&ST.regs.has(e.r));
function render(){
 const k=ST.vb[2]/960, vis=visible(), byP={};
 vis.forEach(e=>(byP[e.p]=byP[e.p]||[]).push(e));
 // influences
 let hi="";
 if(ST.inf){const ids=new Set(vis.map(e=>e.id));
  for(const i of INF){if(!ids.has(i.f)||!ids.has(i.to))continue;const a=EVB[i.f],b=EVB[i.to];if(a.p===b.p)continue;
   const [x1,y1]=MAP.pts[a.p],[x2,y2]=MAP.pts[b.p],dx=x2-x1,dy=y2-y1,mx=(x1+x2)/2-dy*.2,my=(y1+y2)/2+dx*.2;
   const st=i.k==="c"?`stroke="#C62F3F" stroke-dasharray="${5*k} ${3*k}"`:i.k==="d"?`stroke="#999" stroke-dasharray="${1.5*k} ${2.5*k}"`:`stroke="#555"`;
   hi+=`<path d="M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}" fill="none" ${st} stroke-width="${1.4*k}" marker-end="url(#ar)" opacity=".85"><title>${esc(a.t+" → "+b.t+" : "+i.l)}</title></path>`;}}
 $("#inf").innerHTML=hi;
 // marqueurs
 let hm="";const recent=ST.year;
 for(const [p,es] of Object.entries(byP)){const [x,y]=MAP.pts[p],last=es[es.length-1],r=(4+Math.min(es.length,6)*.9)*k;
  const fresh=recent-last.y<=(recent>1500?25:150);
  hm+=`<g class="mk" data-p="${p}" style="cursor:pointer">${fresh?`<circle cx="${x}" cy="${y}" r="${r*1.9}" fill="${REG[last.r].c}" opacity=".25"/>`:""}<circle cx="${x}" cy="${y}" r="${r}" fill="${REG[last.r].c}" stroke="#fff" stroke-width="${1.2*k}"/>${es.length>1?`<text x="${x}" y="${y+3.2*k}" text-anchor="middle" font-size="${8.5*k}" font-weight="700" fill="#fff" pointer-events="none">${es.length}</text>`:""}</g>`;}
 $("#mk").innerHTML=hm;
 $("#ylab").textContent=fmtY(ST.year);
 $("#mapinfo").textContent=`${vis.length} événements visibles jusqu'en ${fmtY(ST.year)}. Touchez un point pour le détail ; faites glisser pour déplacer, pincez ou utilisez +/− pour zoomer.`;
}
const RT=()=>svg.clientHeight/svg.clientWidth||500/960;
function setVB(v){const W=960,H=500;let [x,y,w,h]=v;const cy=y+(h||w*RT())/2;w=Math.min(Math.max(w,60),W);h=w*RT();y=cy-h/2;x=Math.min(Math.max(x,-w*.3),W-w*.7);y=Math.min(Math.max(y,-h*.3),H-h*.7);ST.vb=[x,y,w,h];svg.setAttribute("viewBox",ST.vb.join(" "));render();}
function zoom(f,cx,cy){const [x,y,w,h]=ST.vb;cx=cx??x+w/2;cy=cy??y+h/2;setVB([cx-(cx-x)*f,cy-(cy-y)*f,w*f,h*f]);}
function bboxPts(ps,pad){const xs=ps.map(p=>MAP.pts[p][0]),ys=ps.map(p=>MAP.pts[p][1]);let x0=Math.min(...xs)-pad,x1=Math.max(...xs)+pad,y0=Math.min(...ys)-pad,y1=Math.max(...ys)+pad;let w=Math.max(x1-x0,(y1-y0)/RT());return [(x0+x1)/2-w/2,(y0+y1)/2-w*RT()/2,w,w*RT()];}
const PRESETS={"Monde":()=>[0,0,960,500],"Europe":()=>bboxPts(["thingvellir","londres","athenes","moscou","alger"],15),"Russie":()=>bboxPts(["ru_w","ru_e","ru_n","ru_s"],10),"Chine":()=>bboxPts(["xian","pekin","shanghai","qufu","nankin"],70),"Amériques":()=>bboxPts(["sanfrancisco","plymouth","portauprince"],50)};
function centerOn(p){const [x,y]=MAP.pts[p];setVB([x-110,y-57,220,115]);}
// pan / pincement
(()=>{const pts=new Map();let last=null;
 const toSvg=(cx,cy)=>{const r=svg.getBoundingClientRect();return [ST.vb[0]+(cx-r.left)/r.width*ST.vb[2],ST.vb[1]+(cy-r.top)/r.height*ST.vb[3]];};
 svg.addEventListener("pointerdown",e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);svg.setPointerCapture(e.pointerId);last=null;e.target.closest(".mk")&&(svg._tap=e.target.closest(".mk").dataset.p);svg._moved=0;});
 svg.addEventListener("pointermove",e=>{if(!pts.has(e.pointerId))return;const prev=pts.get(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);const r=svg.getBoundingClientRect();
  if(pts.size===1){const dx=(e.clientX-prev[0])/r.width*ST.vb[2],dy=(e.clientY-prev[1])/r.height*ST.vb[3];svg._moved+=Math.abs(dx)+Math.abs(dy);if(svg._moved>ST.vb[2]*.01)setVB([ST.vb[0]-dx,ST.vb[1]-dy,ST.vb[2],ST.vb[3]]);}
  else if(pts.size===2){const [a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(last){const [cx,cy]=toSvg((a[0]+b[0])/2,(a[1]+b[1])/2);zoom(last/d,cx,cy);}last=d;svg._moved=99;}});
 const up=e=>{pts.delete(e.pointerId);last=null;if(pts.size===0&&svg._tap&&svg._moved<ST.vb[2]*.01)openSheet(svg._tap);svg._tap=null;};
 svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up);
 svg.addEventListener("wheel",e=>{e.preventDefault();const [cx,cy]=toSvg(e.clientX,e.clientY);zoom(e.deltaY>0?1.15:1/1.15,cx,cy);},{passive:false});})();
// --- fiche (bottom sheet)
function evHTML(e,opt={}){
 const out=INF.filter(i=>i.f===e.id),inn=INF.filter(i=>i.to===e.id);
 const lk=(i,id,arrow)=>`<button class="lk ${i.k}" data-go="${id}">${arrow} ${esc(EVB[id].t)} (${fmtY(EVB[id].y)}) — ${esc(i.l)}</button>`;
 return `<div class="ev${opt.fut?" fut":""}${ST.hl===e.id?" hl":""}" id="ev-${e.id}" style="border-left-color:${REG[e.r].c}"><span class="y">${fmtY(e.y)} · ${esc(REG[e.r].n)}${opt.place?" · "+esc(PN[e.p]):""}</span><h3>${esc(e.t)}</h3><p>${esc(e.d)}</p><div>${e.deb?'<span class="badge deb">date ou portée débattue</span>':""}${e.g.map(t=>`<span class="badge">${TAGS[t]}</span>`).join("")}</div>${inn.map(i=>lk(i,i.f,"←")).join("")}${out.map(i=>lk(i,i.to,"→")).join("")}${opt.map?`<button class="lk" data-go="${e.id}">📍 Voir sur la carte</button>`:""}</div>`;
}
function openSheet(p){
 const k=ST.vb[2]/960,[px,py]=MAP.pts[p];
 const near=Object.keys(PN).filter(q=>{const [x,y]=MAP.pts[q];return q===p||Math.hypot(x-px,y-py)<9*k;});
 const es=EV.filter(e=>near.includes(e.p));
 $("#shtitle").textContent=near.map(q=>PN[q]).join(" · ");
 $("#shbody").innerHTML=es.map(e=>evHTML(e,{fut:e.y>ST.year||!ST.regs.has(e.r),place:near.length>1})).join("")+(es.some(e=>e.y>ST.year)?`<p class="small">En grisé : événements postérieurs à ${fmtY(ST.year)}.</p>`:"");
 $("#sheet").classList.add("on");
 if(ST.hl){const n=document.getElementById("ev-"+ST.hl);n&&n.scrollIntoView({block:"nearest"});}
}
$("#shx").onclick=()=>$("#sheet").classList.remove("on");
function goTo(id){const e=EVB[id];ST.hl=id;ST.regs.add(e.r);if(ST.year<e.y)ST.year=e.y;
 $("#yr").value=y2s(ST.year);show("carte");chips();tint();centerOn(e.p);openSheet(e.p);}
document.addEventListener("click",e=>{const g=e.target.closest("[data-go]");if(g){e.preventDefault();goTo(g.dataset.go);}});
// --- puces aires / thèmes
function chips(){
 const rc=Object.entries(REG).map(([k,r])=>`<button class="chip${ST.regs.has(k)?"":" off"}" data-r="${k}"><i style="background:${r.c}"></i>${esc(r.n)}</button>`).join("");
 $("#regchips").innerHTML=rc;$("#regchips2").innerHTML=rc;
 $("#tagchips").innerHTML=Object.entries(TAGS).map(([k,t])=>`<button class="chip${ST.tags.has(k)?" sel":""}" data-t="${k}">${t}</button>`).join("");
}
document.addEventListener("click",e=>{const r=e.target.closest("[data-r]"),t=e.target.closest("[data-t]");
 if(r){const k=r.dataset.r;if(ST.regs.has(k)&&ST.regs.size>1)ST.regs.delete(k);else ST.regs.add(k);chips();tint();render();frise();}
 if(t){const k=t.dataset.t;ST.tags.has(k)?ST.tags.delete(k):ST.tags.add(k);chips();frise();}});
$("#presets").innerHTML=Object.keys(PRESETS).map(k=>`<button class="chip" data-ps="${k}">${k}</button>`).join("");
$("#presets").onclick=e=>{const b=e.target.closest("[data-ps]");if(!b)return;setVB(PRESETS[b.dataset.ps]());};
// --- temps
const yr=$("#yr");yr.oninput=()=>{ST.year=s2y(+yr.value);render();};
const years=[...new Set(EV.map(e=>e.y))].sort((a,b)=>a-b);
$("#prev").onclick=()=>{const y=[...years].reverse().find(v=>v<ST.year);if(y!==undefined){ST.year=y;yr.value=y2s(y);render();}};
$("#next").onclick=()=>{const y=years.find(v=>v>ST.year);if(y!==undefined){ST.year=y;yr.value=y2s(y);render();}};
let timer=null;$("#play").onclick=()=>{if(timer){clearInterval(timer);timer=null;$("#play").textContent="▶ Lecture";return;}
 if(ST.year>=2026){ST.year=years[0];}$("#play").textContent="⏸ Pause";
 timer=setInterval(()=>{const y=years.find(v=>v>ST.year);if(y===undefined){$("#play").click();return;}ST.year=y;yr.value=y2s(y);render();},900);};
$("#inftg").onclick=()=>{ST.inf=!ST.inf;$("#inftg").classList.toggle("sel",ST.inf);render();};
// --- frise
const ERAS=[[-9999,476,"Antiquité"],[476,1492,"Moyen Âge"],[1492,1789,"Époque moderne"],[1789,1914,"Long XIXe siècle"],[1914,1991,"XXe siècle"],[1991,9999,"Depuis 1991"]];
function frise(){
 const es=EV.filter(e=>ST.regs.has(e.r)&&(ST.tags.size===0||e.g.some(t=>ST.tags.has(t))));
 $("#frise").innerHTML=ERAS.map(([a,b,n])=>{const l=es.filter(e=>e.y>=a&&e.y<b);return l.length?`<div class="era">${n} · ${l.length}</div>`+l.map(e=>evHTML(e,{place:1,map:1})).join(""):"";}).join("")||'<p class="small">Aucun événement pour ces filtres.</p>';
}
// --- thèmes
function themes(){
 const card=o=>`<div class="card"><h3>${esc(o.t)}</h3><p>${esc(o.d)}</p><p class="small">${esc(o.a)}</p>${o.ev.map(id=>`<button class="lk" data-go="${id}">📍 ${esc(EVB[id].t)} (${fmtY(EVB[id].y)})</button>`).join("")}</div>`;
 $("#themes").innerHTML=`<h2 class="sec">Thèmes parents</h2>${OUV.filter(o=>o.k==="p").map(card).join("")}<h2 class="sec">Thèmes contradictoires</h2>${OUV.filter(o=>o.k==="c").map(card).join("")}`;
}
// --- quiz
const QZ={o:[],i:0,s:0,done:false};
const best=()=>{try{return +localStorage.getItem("pnyx-best")||0}catch(e){return 0}};
function qStart(){QZ.o=QUIZ.map((_,i)=>i).sort(()=>Math.random()-.5);QZ.i=0;QZ.s=0;qShow();}
function qShow(){
 if(QZ.i>=QZ.o.length){const b=Math.max(best(),QZ.s);try{localStorage.setItem("pnyx-best",b)}catch(e){}
  $("#quiz").innerHTML=`<div class="card"><h3>Score : ${QZ.s} / ${QUIZ.length}</h3><p class="small">Meilleur score sur cet appareil : ${b} / ${QUIZ.length}</p><button class="btn" id="qre">Recommencer</button></div>`;$("#qre").onclick=qStart;return;}
 const q=QUIZ[QZ.o[QZ.i]];
 $("#quiz").innerHTML=`<p class="small">Question ${QZ.i+1} / ${QUIZ.length} · score ${QZ.s}</p><div class="card"><h3>${esc(q.q)}</h3>${q.o.map((o,j)=>`<button class="opt" data-j="${j}">${esc(o)}</button>`).join("")}<p id="qx" class="small"></p><button class="btn" id="qn" style="display:none">Suivante</button></div>`;
 $("#quiz").querySelectorAll(".opt").forEach(b=>b.onclick=()=>{if($("#qn").style.display==="inline-block")return;const j=+b.dataset.j;
  $("#quiz").querySelectorAll(".opt")[q.a].classList.add("ok");if(j===q.a)QZ.s++;else b.classList.add("ko");
  $("#qx").textContent=(j===q.a?"Exact. ":"Non. ")+q.x;$("#qn").style.display="inline-block";});
 $("#qn").onclick=()=>{QZ.i++;qShow();};
}
// --- plus
const PT={"Synthèse":()=>`<div id="syn">${SYN}</div>`,
"Sources":()=>`<div class="card"><h3>Vérifiées en ligne</h3>${SOURCES.w.map(([t,u])=>`<p>${esc(t)}<br><a href="${u}" target="_blank" rel="noopener">${u}</a></p>`).join("")}</div><div class="card"><h3>Références classiques [B]</h3><p class="small">Non revérifiées en ligne dans cette version.</p>${SOURCES.b.map(b=>`<p>${esc(b)}</p>`).join("")}</div>`,
"Versions":()=>`<div class="card">${VERSIONS.map(v=>`<p><b>${v[0]}</b> · ${v[1]}<br>${esc(v[2])}</p>`).join("")}</div>`,
"À propos":()=>`<div class="card"><h3>Pnyx</h3><p>La Pnyx est la colline d'Athènes où siégeait l'assemblée des citoyens. De là au pixel : comment les peuples se sont gouvernés, et comment les idées ont circulé.</p><p><b>Limites v1-1</b> : contenu rédigé avec une IA, à vérifier avant tout usage pédagogique. Couverture : Grèce, Rome, Europe, États-Unis, Haïti, Russie, Chine. Absents pour l'instant : Afrique, monde musulman, Inde, Japon, Amérique latine.</p><p><b>Installer sur iPhone</b> : Safari (ou Chrome) → Partager → Sur l'écran d'accueil. Fonctionne hors ligne après une première ouverture connectée.</p></div>`};
function plus(k="Synthèse"){$("#plustabs").innerHTML=Object.keys(PT).map(t=>`<button class="chip${t===k?" sel":""}" data-pt="${t}">${t}</button>`).join("");$("#plus").innerHTML=PT[k]();}
$("#plustabs").onclick=e=>{const b=e.target.closest("[data-pt]");b&&plus(b.dataset.pt);};
// --- navigation
function show(v){document.querySelectorAll(".view").forEach(s=>s.classList.toggle("on",s.id==="v-"+v));document.querySelectorAll("nav.bar button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));if(v!=="carte")$("#sheet").classList.remove("on");$("main").scrollTop=0;}
document.querySelectorAll("nav.bar button").forEach(b=>b.onclick=()=>show(b.dataset.v));
// --- init
buildMap();chips();tint();setVB([0,0,960,500]);addEventListener("resize",()=>setVB(ST.vb));frise();themes();qStart();plus();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
