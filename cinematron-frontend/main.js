const F={m:{t:"Marea Alta",g:"Aventura",d:138,r:"+12",c:"#79C7FF"},u:{t:"La Última Estación",g:"Drama",d:114,r:"+15",c:"#FF8FB8"},r:{t:"Ruido Blanco",g:"Terror",d:100,r:"+16",c:"#C9B6FF"},p:{t:"Pipo y el Faro",g:"Animación familiar",d:92,r:"Todo público",c:"#9BF0C9"},c:{t:"Código Rojo 7",g:"Acción",d:125,r:"+12",c:"#FFB566"}};
const S=[
{n:"Sala 1",f:"Pantalla gigante",c:220,p:18000,x:[["m","15:30",142],["m","18:15",96],["m","21:00",14]]},
{n:"Sala 2",f:"3D",c:140,p:18000,x:[["p","14:00",118],["p","16:15",64],["r","18:30",52],["r","20:45",0]]},
{n:"Sala 3",f:"VIP reclinable",c:48,p:32000,x:[["u","15:00",30],["u","17:30",0],["c","20:00",19],["r","22:30",36]]},
{n:"Sala 4",f:"Clásica",c:120,p:14000,x:[["c","15:00",88],["c","17:45",41],["u","20:30",22],["r","22:45",70]]}
];
let sala=-1,ppl=2;
const grid=document.getElementById('grid'),conf=document.getElementById('conf');
const cop=n=>'$'+n.toLocaleString('es-CO');
function film(k){return S.flatMap((s,si)=>s.x.map(x=>({k:x[0],h:x[1],f:x[2],si})).filter(x=>x.k===k&&(sala<0||x.si===sala)))}
function render(){
const cards=Object.keys(F).map(k=>({k,sh:film(k).sort((a,b)=>a.h.localeCompare(b.h))})).filter(c=>c.sh.length);
grid.innerHTML=cards.length?cards.map(({k,sh})=>{const f=F[k];return `<article class="film box"><div class="pos" style="background:${f.c}"><h3>${f.t}</h3><span>${f.r}</span></div><div class="body"><p class="meta">${f.g} · ${f.d} min</p><div class="times">${sh.map(x=>{const ok=x.f>=ppl;return `<button class="t" data-k="${k}" data-h="${x.h}" data-s="${x.si}" ${ok?'':'disabled'}>${x.h}<small>${S[x.si].n} · ${x.f===0?'agotada':ok?x.f+' libres':'no caben '+ppl}</small></button>`}).join('')}</div></div></article>`}).join(''):`<div class="empty box"><h3>Sin funciones</h3><p>No hay películas en esa sala. Prueba con "Todas".</p></div>`;
}
grid.addEventListener('click',e=>{const b=e.target.closest('.t');if(!b||b.disabled)return;const f=F[b.dataset.k],s=S[b.dataset.s];
conf.hidden=false;conf.innerHTML=`<div><b>${f.t}</b> · ${b.dataset.h} · ${s.n}<br>${ppl} ${ppl>1?'puestos':'puesto'} · ${cop(ppl*s.p)} en total</div><button id="ok">Reservar</button>`;
document.getElementById('ok').onclick=()=>{conf.innerHTML='<div><b>Listo para confirmar.</b> Pasa por taquilla 20 minutos antes.</div>';setTimeout(()=>conf.hidden=true,4000)}});
const pills=document.getElementById('pills');
pills.innerHTML=[`<button class="pill" data-i="-1" aria-pressed="true">Todas</button>`].concat(S.map((s,i)=>`<button class="pill" data-i="${i}" aria-pressed="false">${s.n} · ${s.f}</button>`)).join('');
pills.onclick=e=>{const b=e.target.closest('.pill');if(!b)return;sala=+b.dataset.i;pills.querySelectorAll('.pill').forEach(p=>p.setAttribute('aria-pressed',p===b));conf.hidden=true;render()};
const pn=document.getElementById('pn');
const setP=n=>{ppl=Math.min(8,Math.max(1,n));pn.textContent=ppl;conf.hidden=true;render()};
document.getElementById('mn').onclick=()=>setP(ppl-1);
document.getElementById('mp').onclick=()=>setP(ppl+1);
const all=S.flatMap((s,si)=>s.x.filter(x=>x[2]>0).map(x=>[x[1],F[x[0]].t,s.n])).sort((a,b)=>a[0].localeCompare(b[0])).slice(0,4);
document.getElementById('soon').innerHTML=all.map(x=>`<div><span>${x[1]}</span><span>${x[0]} · ${x[2]}</span></div>`).join('');
const bg=['#79C7FF','#FF8FB8','#FFE14D','#9BF0C9'];
document.getElementById('sg').innerHTML=S.map((s,i)=>{const t=s.x.length*s.c,fr=s.x.reduce((a,x)=>a+x[2],0);return `<div class="sala box" style="background:${bg[i]}"><h3>${s.n}</h3><p>${s.f} · ${s.c} puestos · ${cop(s.p)}</p><p>libre hoy en ${s.x.length} funciones</p></div>`}).join('');
render();


