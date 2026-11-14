// TITLE: Estaciona Já
// 15 níveis de estacionamento: entra no lugar verde, bem direito, sem tocar em nada.
(()=>{'use strict';
const S=K.store('ej',{stars:[],best:0});
document.documentElement.style.setProperty('--kc','#3dffa2');
K.init({sky:0xa8d8ff,fog:[70,180],fov:50,shadow:30,sunPos:[18,40,12]});
const scene=K.scene,cam=K.camera;
// parque: alcatrão, linhas e prédios à volta
const lotT=K.tex(512,512,(c,w,h)=>{c.fillStyle='#4a4f5a';c.fillRect(0,0,w,h);for(let i=0;i<2500;i++){c.fillStyle=Math.random()<.5?'#525866':'#444955';c.fillRect(Math.random()*w,Math.random()*h,2,2);}});
const lot=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshLambertMaterial({map:lotT}));lot.rotation.x=-Math.PI/2;lot.receiveShadow=true;scene.add(lot);
K.plane(300,300,0x6cc070,0,-.05,0);
for(const [x,z,w,d,h,c] of [[-48,0,12,80,14,0xfff2e0],[48,0,12,80,18,0xffd7b8],[0,-48,92,12,12,0xd8ecff],[0,48,92,12,16,0xf4c2c2]]){K.box(w,h,d,c,x,h/2,z);K.box(w+.5,.6,d+.5,0xc0452c,x,h+.3,z);}
for(let i=0;i<10;i++)K.tree(K.rand(-60,60)*(Math.random()<.5?1:-1),K.pick([-58,58]),K.rand(1,1.5));
const ink=[];const line=(x,z,w,d,col=0xf4f4f4)=>{const m=K.plane(w,d,col,x,.02,z);m.material=new THREE.MeshBasicMaterial({color:col});ink.push(m);return m;};
// carro do jogador
function mkCar(col){const g=new THREE.Group(),b=new THREE.Group();g.add(b);K.box(1.8,.55,4,col,0,.6,0,b);K.box(1.62,.5,2,col,0,1.08,-.25,b);K.box(1.5,.38,1.9,0x9fd8ff,0,1.1,-.25,b).scale.set(1.04,1,.9);
 for(const s of [-1,1]){const h=new THREE.Mesh(new THREE.BoxGeometry(.4,.15,.05),new THREE.MeshBasicMaterial({color:0xfff6c0}));h.position.set(s*.6,.65,2.02);b.add(h);const t=new THREE.Mesh(new THREE.BoxGeometry(.4,.15,.05),new THREE.MeshBasicMaterial({color:0xff2030}));t.position.set(s*.6,.7,-2.02);b.add(t);}
 const w=[];for(const [x,z] of [[-.92,1.3],[.92,1.3],[-.92,-1.3],[.92,-1.3]]){const p=new THREE.Group();p.position.set(x,.36,z);const m=K.cyl(.36,.36,.28,0x15171d,0,0,0,p,12);m.rotation.z=1.57;g.add(p);w.push(p);}g.userData={b,w};scene.add(g);return g;}
const me={g:mkCar(0xe8452c),x:0,z:0,a:0,sp:0,steer:0};
// níveis: [nome, partida, lugar alvo {x,z,a}, obstáculos (carros parados e cones), tempo para 3 estrelas]
const C=(x,z,a)=>({t:'car',x,z,a}),N=(x,z)=>({t:'cone',x,z});
const row=(z,a,from,to,skip,step=3.2)=>{const o=[];for(let x=from;x<=to+.01;x+=step)if(Math.abs(x-skip)>.1)o.push(C(x,z,a));return o;};
const LEVELS=[
 ['Primeiro lugar',[0,-20,0],{x:0,z:8,a:0},[],12],
 ['Entre dois',[0,-20,0],{x:0,z:10,a:0},[C(-3.2,10,0),C(3.2,10,0)],14],
 ['Fila de carros',[-12,-18,0],{x:3.2,z:10,a:0},row(10,0,-9.6,12.8,3.2),16],
 ['De marcha-atrás',[0,-4,0],{x:0,z:-16,a:0},[C(-3.2,-16,0),C(3.2,-16,0)],16],
 ['Em espinha',[-14,-14,0],{x:4,z:9,a:.6},[C(0,9,.6),C(8,9,.6),C(-4,9,.6)],16],
 ['Lugar de lado',[-18,4,Math.PI/2],{x:2,z:12,a:Math.PI/2},[C(-4.6,12,Math.PI/2),C(8.6,12,Math.PI/2)],18],
 ['Cones apertados',[0,-22,0],{x:0,z:14,a:0},[N(-2,0),N(2,0),N(-2,4),N(2,4),N(-1.6,8),N(1.6,8),C(-3.2,14,0),C(3.2,14,0)],18],
 ['Ziguezague',[-16,-20,0],{x:14,z:16,a:0},[N(-8,-10),N(-8,-6),N(-4,-2),N(0,2),N(4,6),N(8,10),C(10.8,16,0),C(17.2,16,0)],22],
 ['Paralelo',[-16,0,Math.PI/2],{x:2,z:6,a:Math.PI/2},[C(-3.6,6,Math.PI/2),C(7.6,6,Math.PI/2)],20],
 ['Parque cheio',[0,-22,0],{x:-6.4,z:10,a:Math.PI},row(10,Math.PI,-16,16,-6.4).concat(row(-2,0,-16,16,99)),24],
 ['Garagem',[0,-20,0],{x:0,z:16,a:Math.PI},[N(-2.2,10),N(2.2,10),N(-2.2,13),N(2.2,13),N(-2.2,16),N(2.2,16),N(-2.2,19),N(2.2,19),N(0,20.5)],24],
 ['Rotunda',[0,-22,0],{x:-14,z:0,a:Math.PI/2},[N(0,0),N(3,0),N(-3,0),N(0,3),N(0,-3),N(2,2),N(-2,2),N(2,-2),N(-2,-2),C(-14,-3.4,Math.PI/2),C(-14,3.4,Math.PI/2)],24],
 ['Paralelo difícil',[-18,-2,Math.PI/2],{x:3,z:6,a:Math.PI/2},[C(-2.4,6,Math.PI/2),C(8.4,6,Math.PI/2),N(3,8.4),N(0,8.4),N(6,8.4)],24],
 ['Corredor estreito',[0,-24,0],{x:0,z:20,a:0},[...[-16,-12,-8,-4,0,4,8,12].flatMap(z=>[N(-1.9,z),N(1.9,z)]),C(-3.2,20,0),C(3.2,20,0)],26],
 ['Mestre do parque',[18,-20,-Math.PI/2],{x:-12,z:14,a:-Math.PI/2},[...row(-6,0,-16,16,99,4),C(-12,10.6,-Math.PI/2),C(-12,17.4,-Math.PI/2),N(-4,14),N(-4,10),N(-4,18)],30]];
let lv=0,state='menu',objs=[],spot=null,T=0,hits=0,okT=0,camMode=0;
const conesG=new THREE.ConeGeometry(.28,.7,10);
function clear(){for(const o of objs)scene.remove(o.m);objs=[];for(const m of ink)scene.remove(m);ink.length=0;if(spot)scene.remove(spot);}
function load(i){clear();lv=i;const L=LEVELS[i];me.x=L[1][0];me.z=L[1][1];me.a=L[1][2];me.sp=0;me.steer=0;T=0;hits=0;okT=0;
 for(const o of L[3]){if(o.t==='car'){const g=mkCar(K.pick([0x2a8bff,0xffffff,0x35d07f,0xffd23f,0x8a93ad,0x1b2340]));g.position.set(o.x,0,o.z);g.rotation.y=o.a;objs.push({m:g,t:'car',x:o.x,z:o.z,a:o.a,hw:.95,hd:2.05});}
  else{const m=new THREE.Mesh(conesG,K.mat(0xff7a2f));m.position.set(o.x,.35,o.z);m.castShadow=true;scene.add(m);objs.push({m,t:'cone',x:o.x,z:o.z,r:.35});}}
 // linhas dos lugares (só dos carros parados e do alvo)
 const t=L[2];spot=new THREE.Group();spot.position.set(t.x,.03,t.z);spot.rotation.y=t.a;const fill=new THREE.Mesh(new THREE.PlaneGeometry(2.6,5),new THREE.MeshBasicMaterial({color:0x3dffa2,transparent:true,opacity:.28}));fill.rotation.x=-Math.PI/2;spot.add(fill);
 for(const [x,z,w,d] of [[-1.3,0,.12,5],[1.3,0,.12,5],[0,2.5,2.72,.12],[0,-2.5,2.72,.12]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({color:0x3dffa2}));m.rotation.x=-Math.PI/2;m.position.set(x,.01,z);spot.add(m);}
 const ar=new THREE.Mesh(new THREE.ConeGeometry(.5,1,3),new THREE.MeshBasicMaterial({color:0x3dffa2}));ar.rotation.x=-Math.PI/2;ar.position.set(0,.02,1.5);spot.add(ar);scene.add(spot);
 for(const o of objs)if(o.t==='car'){const g=new THREE.Group();g.position.set(o.x,.025,o.z);g.rotation.y=o.a;for(const sx of [-1.3,1.3]){const m=new THREE.Mesh(new THREE.PlaneGeometry(.12,5),new THREE.MeshBasicMaterial({color:0xf4f4f4}));m.rotation.x=-Math.PI/2;m.position.x=sx;g.add(m);}scene.add(g);ink.push(g);}
 state='play';K.screen(null);K.play(true);K.useStick=true;K.pad([['Space','Travão'],['KeyC','Câmara']]);
 K.hud(`<div class="k-tl"><div class="k-pill"><small>Nível ${i+1}/${LEVELS.length}</small><b>${L[0]}</b></div></div><div class="k-tr"><div class="k-pill"><small>Tempo</small><b id="ht">0.0</b></div><div class="k-pill"><small>Toques</small><b id="hh">0</b></div></div><div class="k-bc" style="flex-direction:column"><div class="k-meter" style="width:220px;height:14px"><i id="hp" style="width:0;background:#3dffa2"></i></div><div class="k-hint" id="hi">Entra no lugar verde, bem direito, e pára</div></div>`);
 K.flash('NÍVEL '+(i+1),L[0],1300,'#3dffa2');}
function menu(){state='menu';K.play(false);if(!objs.length)load(0),state='menu',K.play(false);
 const done=S.data.stars;K.screen(`<div class="k-title">Estaciona <em>Já</em></div><div class="k-lead">15 lugares cada vez mais apertados. Entra no verde, bem direito, sem bater.</div>
 <div class="k-row">${LEVELS.map((L,i)=>{const open=i===0||done[i-1]>0;return `<button class="k-chip" data-a="go" data-v="${i}" ${open?'':'disabled'}>${i+1}<small>${open?'★'.repeat(done[i]||0)+'☆'.repeat(3-(done[i]||0)):'🔒'}</small></button>`;}).join('')}</div>
 <table class="k-tab"><tr><td>Estrelas</td><td>${done.reduce((a,b)=>a+(b||0),0)} / ${LEVELS.length*3}</td></tr></table>${K.keysHelp([['W S','acelerar · marcha-atrás'],['A D','virar'],['ESPAÇO','travão'],['C','câmara'],['P','pausa']])}`,{go:v=>load(+v)});}
K.onQuit=menu;K.me=()=>state==='play'?me.g:null;
function win(){state='done';K.play(false);const L=LEVELS[lv],st=hits>0?1:T<L[4]?3:T<L[4]*1.6?2:1;if(st>(S.data.stars[lv]||0))S.data.stars[lv]=st;S.save();K.sfx.win();K.confetti(new THREE.Vector3(me.x,1.5,me.z));
 if(lv===LEVELS.length-1)K.unlock('ej-mestre','Estaciona Já · Mestre do parque');if(S.data.stars.filter(s=>s===3).length===LEVELS.length)K.unlock('ej-45','Estaciona Já · 45 estrelas');
 K.screen(`<div class="k-title"><em>${'★'.repeat(st)}${'☆'.repeat(3-st)}</em></div><div class="k-lead">Estacionado em ${T.toFixed(1)} s${hits?' · '+hits+' toque'+(hits>1?'s':''):' · sem tocar em nada'}</div>${lv<LEVELS.length-1?'<button class="k-go" data-a="n">Próximo nível</button>':''}<button class="k-alt" data-a="r">Repetir</button><button class="k-alt" data-a="m">Níveis</button>`,{n:()=>load(lv+1),r:()=>load(lv),m:menu});}
function corners(x,z,a,hw,hd){const c=Math.cos(a),s=Math.sin(a);return [[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([u,v])=>[x+u*c+v*s,z-u*s+v*c]);}
function obbHit(A,B){const axes=[];for(const P of [A,B])for(let i=0;i<2;i++){const p=P[i],q=P[i+1];axes.push([q[1]-p[1],p[0]-q[0]]);}
 for(const [ax,az] of axes){let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;for(const p of A){const d=p[0]*ax+p[1]*az;a0=Math.min(a0,d);a1=Math.max(a1,d);}for(const p of B){const d=p[0]*ax+p[1]*az;b0=Math.min(b0,d);b1=Math.max(b1,d);}if(a1<b0||b1<a0)return false;}return true;}
let hitCd=0;
function update(dt){if(state==='menu'||state==='done'){const t=K.time*.15;cam.position.set(Math.sin(t)*30,22,Math.cos(t)*30);cam.lookAt(0,0,0);return;}
 if(K.hit('KeyC'))camMode=(camMode+1)%2;
 const ax=K.axis(),brake=K.down('Space'),thr=ax.y;const tgt=thr>0?9:thr<0?-5:0;
 if(brake)me.sp=K.damp(me.sp,0,8,dt);else if(thr)me.sp=K.damp(me.sp,tgt,1.6,dt);else me.sp=K.damp(me.sp,0,2.2,dt);
 me.steer=K.damp(me.steer,ax.x,6,dt);const ox=me.x,oz=me.z,oa=me.a;me.a-=me.steer*me.sp*.18*dt;me.x+=Math.sin(me.a)*me.sp*dt;me.z+=Math.cos(me.a)*me.sp*dt;
 me.x=K.clamp(me.x,-40,40);me.z=K.clamp(me.z,-40,40);
 // choques
 hitCd-=dt;const mine=corners(me.x,me.z,me.a,.9,2);let bump=false;
 for(const o of objs){if(o.t==='car'){if(obbHit(mine,corners(o.x,o.z,o.a,o.hw,o.hd)))bump=true;}else if(!o.down){const lx=(o.x-me.x)*Math.cos(me.a)-(o.z-me.z)*Math.sin(me.a),lz=(o.x-me.x)*Math.sin(me.a)+(o.z-me.z)*Math.cos(me.a);if(Math.abs(lx)<.9+o.r&&Math.abs(lz)<2+o.r){o.down=true;o.m.rotation.z=1.4;o.m.position.y=.2;o.m.position.x+=Math.sin(me.a)*.6;hits++;K.sfx.bounce();K.toast('Derrubaste um cone!');}}}
 if(bump){me.x=ox;me.z=oz;me.a=oa;if(Math.abs(me.sp)>.6&&hitCd<=0){hits++;hitCd=.8;K.sfx.hit();K.shake=.2;K.toast('Bateste!');}me.sp*=-.2;}
 const u=me.g.userData;me.g.position.set(me.x,0,me.z);me.g.rotation.y=me.a;for(let i=0;i<4;i++){u.w[i].children[0].rotation.x+=me.sp*dt/.36;if(i<2)u.w[i].rotation.y=me.steer*.5;}
 // dentro do lugar?
 const t=LEVELS[lv][2],dx=me.x-t.x,dz=me.z-t.z,lx=dx*Math.cos(t.a)-dz*Math.sin(t.a),lz=dx*Math.sin(t.a)+dz*Math.cos(t.a),da=Math.abs(K.angDiff(me.a,t.a)),da2=Math.min(da,Math.PI-da);
 const inside=Math.abs(lx)<.45&&Math.abs(lz)<.6&&da2<.12;T+=dt;
 if(inside&&Math.abs(me.sp)<.4){okT+=dt;if(okT>1){win();return;}}else okT=Math.max(0,okT-dt*2);
 const q=Math.max(0,1-Math.hypot(lx,lz)/6)*(1-Math.min(1,da2/.6));K.$('ht').textContent=T.toFixed(1);K.$('hh').textContent=hits;K.$('hp').style.width=(inside?100*Math.min(1,okT):q*80)+'%';K.$('hi').textContent=inside?(Math.abs(me.sp)<.4?'Perfeito… aguenta!':'Pára o carro'):Math.hypot(lx,lz)<3?(da2>.12?'Endireita o carro':'Quase lá'):'Entra no lugar verde, bem direito, e pára';
 // câmara
 if(camMode===0){cam.position.x=K.damp(cam.position.x,me.x-Math.sin(me.a)*8.5,4,dt);cam.position.z=K.damp(cam.position.z,me.z-Math.cos(me.a)*8.5,4,dt);cam.position.y=K.damp(cam.position.y,8.5,4,dt);cam.lookAt(me.x+Math.sin(me.a)*3,0,me.z+Math.cos(me.a)*3);}
 else{cam.position.x=K.damp(cam.position.x,me.x,5,dt);cam.position.z=K.damp(cam.position.z,me.z-1,5,dt);cam.position.y=K.damp(cam.position.y,20,5,dt);cam.lookAt(me.x,0,me.z);}}
K._dbg=()=>({state,lv,T:+T.toFixed(1),hits,x:+me.x.toFixed(1),z:+me.z.toFixed(1)});K._put=(o)=>Object.assign(me,o);
load(0);K.loop(update);menu();
})();
