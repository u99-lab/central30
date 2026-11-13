// TITLE: Mata no Recreio
// Jogo do mata 4 contra 4 no recreio: atira, desvia-te e apanha a bola no ar.
(()=>{'use strict';
const S=K.store('mt',{lvl:0,wins:0});
document.documentElement.style.setProperty('--kc','#ffd23f');
K.init({sky:0x9fdcff,fog:[60,140],fov:46,shadow:22,sunPos:[10,32,14]});
const scene=K.scene,cam=K.camera,CX=9,CZ=4.6,BR=.24,G=7;
const RIVALS=[['7.º A',.12,0x35b6e8],['8.º B',.4,0xe8352c],['9.º C',.68,0x8a4dff],['Os Stôres',.95,0x1b2340]];
// ----- recreio
const ct=K.tex(512,256,(c,w,h)=>{c.fillStyle='#c96a4a';c.fillRect(0,0,w,h);for(let i=0;i<1400;i++){c.fillStyle=Math.random()<.5?'#d0714f':'#bf6243';c.fillRect(Math.random()*w,Math.random()*h,3,3);}c.fillStyle='#3b8fc4';c.fillRect(0,0,w/2,h);for(let i=0;i<700;i++){c.fillStyle=Math.random()<.5?'#4197cc':'#3586ba';c.fillRect(Math.random()*w/2,Math.random()*h,3,3);}
 c.strokeStyle='#fff';c.lineWidth=6;c.strokeRect(5,5,w-10,h-10);c.beginPath();c.moveTo(w/2,0);c.lineTo(w/2,h);c.stroke();c.beginPath();c.arc(w/2,h/2,40,0,7);c.stroke();});
const court=new THREE.Mesh(new THREE.PlaneGeometry(CX*2+.8,CZ*2+.8),new THREE.MeshLambertMaterial({map:ct}));court.rotation.x=-Math.PI/2;court.receiveShadow=true;scene.add(court);
K.plane(200,200,0x8e959f,0,-.03,0);K.plane(200,60,0x6cc070,0,-.02,-42);
for(const s of [-1,1]){K.box(CX*2+2.6,.5,.3,0xe9c9a0,0,.25,s*(CZ+1.15));K.box(.3,.5,CZ*2+2.6,0xe9c9a0,s*(CX+1.15),.25,0);}
K.box(50,10,6,0xfff2e0,0,5,-17);K.box(51,1,7,0xc0452c,0,10.5,-17);for(let x=-22;x<=22;x+=4)for(const y of [2.8,6.6])K.box(2.2,1.7,.2,0x9fd8ff,x,y,-13.95);
const sg=new THREE.Mesh(new THREE.BoxGeometry(12,1.4,.2),new THREE.MeshBasicMaterial({map:K.tex(512,64,(c,w,h)=>{c.fillStyle='#1b2340';c.fillRect(0,0,w,h);c.fillStyle='#ffd23f';c.font='900 40px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('ESCOLA VALE VERDE',w/2,34);})}));sg.position.set(0,9,-13.9);scene.add(sg);
for(const [x,z,s] of [[-16,-9,1.5],[16,-9,1.6],[-20,2,1.4],[20,3,1.5],[-8,-10,1.2],[8,-10,1.3]])K.tree(x,z,s);
const fans=[];for(let i=0;i<10;i++){const p=K.person({shirt:K.pick([0xffd23f,0x35d07f,0x2a8bff,0xff8ac0,0xffffff,0xff8a3d]),s:.9});p.position.set(-9+i*2,.28,-CZ-1.5);K.pose(p,{legL:[-1.5],legR:[-1.5]});fans.push(p);}
K.box(22,.1,.6,0x9b7447,0,.55,-CZ-1.6);K.box(22,.1,.6,0x9b7447,0,.5,CZ+2);
for(let i=0;i<5;i++)K.cloud(K.rand(-90,90),K.rand(34,55),K.rand(-110,-40),K.rand(2,4));
// ----- jogadores e bolas
const ring=new THREE.Mesh(new THREE.RingGeometry(.5,.66,24),new THREE.MeshBasicMaterial({color:0xffd23f,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;scene.add(ring);
const aimR=new THREE.Mesh(new THREE.RingGeometry(.25,.36,20),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,side:THREE.DoubleSide}));aimR.rotation.x=-Math.PI/2;scene.add(aimR);
let P=[],balls=[],me=null,state='menu',lvl=0,score=[0,0],roundOver=false,mouse={x:0,z:0,t:-9},catchCd=0;
const timers=[];const after=(t,f)=>timers.push({t,f});const FL=(...a)=>state==='play'&&K.flash(...a);
const _t=K.tone,_n=K.noise;K.tone=(f,d,...r)=>(state!=='menu'||d<=.06)&&_t(f,d,...r);K.noise=(...a)=>state!=='menu'&&_n(...a);
function mkTeams(){for(const p of P)scene.remove(p.g);P=[];const rc=RIVALS[lvl][2];
 for(let t=0;t<2;t++)for(let i=0;i<4;i++){const g=K.person(t===0?{shirt:0xffd23f,shorts:0x1b2340,hair:K.pick([0x3a2a1c,0x1c1c1c,0xb5651d,0xd9b34a])}:{shirt:rc,shorts:0x222222,skin:K.pick([0xf0c8a0,0xd9a87c,0xb07d56]),hair:K.pick([0x3a2a1c,0x1c1c1c,0xb5651d]),s:lvl===3?1.12:1});
  P.push({g,team:t,i,x:0,z:0,a:0,alive:true,hold:null,L:t===0?.45:RIVALS[lvl][1],think:0,tx:0,tz:0,dodgeT:0,catchT:0,throwT:0,outT:0,runT:0,wander:0});}
 for(const b of balls)scene.remove(b.m);balls=[];for(let i=0;i<3;i++){const m=K.sph(BR,[0xff3d5a,0x35d07f,0xff8a3d][i],0,BR,0,null,14);balls.push({m,x:0,y:BR,z:0,vx:0,vy:0,vz:0,st:'ground',live:false,team:0,by:null,seen:new Set()});}}
function resetRound(){roundOver=false;for(const p of P){const s=p.team?1:-1;p.alive=true;p.hold=null;p.x=s*(6.5+(p.i%2)*1.2);p.z=-3.3+p.i*2.2;p.a=s>0?-Math.PI/2:Math.PI/2;p.think=K.rand(.3,1);p.dodgeT=p.catchT=p.throwT=p.outT=0;p.g.visible=true;p.g.rotation.set(0,p.a,0);p.g.position.y=0;}
 balls.forEach((b,i)=>{b.x=0;b.z=(i-1)*3;b.y=BR;b.vx=b.vy=b.vz=0;b.st='ground';b.live=false;b.seen.clear();});me=P[0];if(state==='play')hud();FL('MATA!','Ronda '+(score[0]+score[1]+1),1100,'#ffd23f');K.sfx.whistle();}
const alive=t=>P.filter(p=>p.team===t&&p.alive);
function throwBall(p,tx,tz,speed){const b=p.hold;if(!b)return;p.hold=null;p.throwT=.3;const dx=tx-p.x,dz=tz-p.z,d=Math.max(2,Math.hypot(dx,dz)),T=d/speed;b.st='air';b.live=true;b.team=p.team;b.by=p;b.seen.clear();b.x=p.x+dx/d*.6;b.z=p.z+dz/d*.6;b.y=1.45;b.vx=dx/d*speed;b.vz=dz/d*speed;b.vy=(1-1.45+.5*G*T*T)/T;p.a=Math.atan2(dx,dz);K.sfx.whoosh();}
function out(p,by){p.alive=false;p.outT=.01;if(p.hold){const b=p.hold;p.hold=null;b.st='air';b.live=false;b.vx=K.rand(-2,2);b.vy=3;b.vz=K.rand(-2,2);}K.sfx.hit();K.burst(new THREE.Vector3(p.x,1.2,p.z),[0xffffff,0xffd23f],12,4,5,.6);
 if(p.team===1){FL('FORA!','',600,'#3dffa2');if(by===me)K.sfx.good();}else if(p===me){K.shake=.4;FL('FOSTE ATINGIDO','',900,'#ff6b6b');}
 if(p===me){const n=alive(0)[0];if(n)me=n;}hud();check();}
function revive(t){const p=P.find(q=>q.team===t&&!q.alive);if(!p)return;p.alive=true;p.outT=0;p.x=(t?1:-1)*8;p.z=K.rand(-3,3);p.g.visible=true;p.g.rotation.set(0,p.a,0);p.g.position.y=0;K.burst(new THREE.Vector3(p.x,1,p.z),0x3dffa2,14,3,5,.7);}
function check(){if(roundOver)return;const a=alive(0).length,b=alive(1).length;if(a&&b)return;roundOver=true;if(state!=='play'){after(2,()=>{if(state!=='play')resetRound();});return;}const w=a?0:1;score[w]++;FL(w===0?'RONDA GANHA!':'RONDA PERDIDA',score[0]+' – '+score[1],1800,w===0?'#3dffa2':'#ff6b6b');if(w===0){K.sfx.cheer();K.sfx.good();if(a===4)K.unlock('mt-4','Mata · Ronda perfeita (ninguém da turma atingido)');}else K.sfx.ooh();
 after(2.2,()=>{if(score[w]>=2)endMatch(w===0);else resetRound();});}
function endMatch(win){state='end';K.play(false);if(win){S.data.wins++;if(lvl>=S.data.lvl&&lvl<3)S.data.lvl=lvl+1;S.save();K.sfx.win();K.confetti(new THREE.Vector3(0,3,0));if(lvl===3)K.unlock('mt-stores','Mata · Ganhaste aos Stôres!');}else K.sfx.bad();
 K.screen(`<div class="k-title">${win?'<em>Vitória do 7.º B!</em>':'Derrota…'}</div><div class="k-lead">${score[0]} – ${score[1]} contra ${RIVALS[lvl][0]}</div>${win&&lvl<3?'<button class="k-go" data-a="n">Próximo adversário</button>':''}<button class="k-alt" data-a="r">Repetir</button><button class="k-alt" data-a="m">Menu</button>`,{n:()=>start(lvl+1),r:()=>start(lvl),m:menu});}
function start(l){timers.length=0;lvl=l;score=[0,0];mkTeams();state='play';K.screen(null);K.play(true);K.useStick=true;K.pad([['Space','Atirar'],['KeyE','Apanhar']]);resetRound();}
function menu(){state='menu';K.play(false);if(!P.length){mkTeams();resetRound();K.hud('');}
 K.screen(`<div class="k-title">Mata no <em>Recreio</em></div><div class="k-lead">7.º B contra o resto da escola. Acerta neles, desvia-te e apanha a bola no ar para recuperar um colega!</div>
 <div class="k-row">${RIVALS.map((r,i)=>`<button class="k-chip" data-a="go" data-v="${i}" ${i<=S.data.lvl?'':'disabled'}>${r[0]}<small>${i<=S.data.lvl?'★'.repeat(i+1):'🔒'}</small></button>`).join('')}</div>
 <table class="k-tab"><tr><td>Jogos ganhos</td><td>${S.data.wins}</td></tr></table>
 ${K.keysHelp([['W A S D','mexer'],['RATO','apontar · clique atira'],['ESPAÇO','atirar ao mais próximo'],['E','apanhar no ar'],['P','pausa']])}`,{go:v=>start(+v)});}
K.onQuit=menu;
function hud(){if(state!=='play')return;const d=(t,c)=>{let s='';for(let i=0;i<4;i++)s+=`<i style="display:inline-block;width:15px;height:15px;border-radius:50%;margin:0 2px;background:${i<alive(t).length?c:'#ffffff30'}"></i>`;return s;};
 K.hud(`<div class="k-tc"><div class="k-pill" style="text-align:center"><small>7.º B &nbsp;${score[0]} – ${score[1]}&nbsp; ${RIVALS[lvl][0]}</small>${d(0,'#ffd23f')} &nbsp;vs&nbsp; ${d(1,'#'+RIVALS[lvl][2].toString(16).padStart(6,'0'))}</div></div><div class="k-bc"><div class="k-hint" id="hh"></div></div>`);}
// rato
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),pl=new THREE.Plane(new THREE.Vector3(0,1,0),0),hp=new THREE.Vector3(),cv=K.renderer.domElement;
const gp=e=>{ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,cam);if(ray.ray.intersectPlane(pl,hp)){mouse.x=hp.x;mouse.z=hp.z;mouse.t=K.time;}};
cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')gp(e);});
cv.addEventListener('pointerdown',e=>{K.audio();if(e.pointerType!=='mouse'||state!=='play'||K.paused)return;gp(e);if(e.button===2)tryCatch();else playerThrow(true);});
cv.addEventListener('contextmenu',e=>e.preventDefault());
function nearestFoe(p){let best=null,bd=1e9;for(const q of P)if(q.team!==p.team&&q.alive){const d=(q.x-p.x)**2+(q.z-p.z)**2;if(d<bd){bd=d;best=q;}}return best;}
function playerThrow(useMouse){if(!me||!me.alive||!me.hold||roundOver)return;if(useMouse&&K.time-mouse.t<4)throwBall(me,mouse.x,mouse.z,18);else{const q=nearestFoe(me);if(q)throwBall(me,q.x+(q.vx||0)*.35,q.z+(q.vz||0)*.35,18);}}
function tryCatch(){if(!me||!me.alive||me.hold||catchCd>0)return;me.catchT=.38;catchCd=1;K.tone(500,.08,'sine',.1,800);}
function moveTo(p,tx,tz,sp,dt){const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);if(d<.15){p.vx=p.vz=0;return;}p.vx=dx/d*sp;p.vz=dz/d*sp;}
function ai(p,dt){const s=p.team?1:-1,L=p.L;p.think-=dt;
 for(const b of balls)if(b.live&&b.team!==p.team){const sp2=b.vx*b.vx+b.vz*b.vz;if(sp2<4)continue;const t=((p.x-b.x)*b.vx+(p.z-b.z)*b.vz)/sp2;if(t>0&&t<.75){const cx=b.x+b.vx*t-p.x,cz=b.z+b.vz*t-p.z;if(cx*cx+cz*cz<1.3){
   if(!b.seen.has(p)){b.seen.add(p);const r=Math.random();p.react=r<.22+.5*L?'dodge':r<.3+.72*L&&!p.hold?'catch':'none';if(p.react==='dodge'){const l=Math.sqrt(sp2);let nx=-b.vz/l,nz=b.vx/l;if(nx*(-cx)+nz*(-cz)<0||(cx===0&&Math.random()<.5)){nx=-nx;nz=-nz;}p.tx=p.x+nx*2.2;p.tz=K.clamp(p.z+nz*2.2,-CZ+.5,CZ-.5);p.dodgeT=.45;}}
   if(p.react==='catch'&&t<.16)p.catchT=.25;}}}
 if(p.dodgeT>0){p.dodgeT-=dt;moveTo(p,p.tx,p.tz,6.2,dt);return;}
 if(p.hold){const front=s*(1.2+p.i*.5);p.wander-=dt;if(p.wander<=0){p.wander=K.rand(.4,1);p.tz=K.rand(-CZ+.8,CZ-.8);}moveTo(p,front,p.tz,4,dt);
  if(p.think<=0&&!roundOver){const foes=P.filter(q=>q.team!==p.team&&q.alive);if(foes.length){const q=K.pick(foes),sp=13+6*L,d=Math.hypot(q.x-p.x,q.z-p.z),T=d/sp,e=1.5-1.25*L;throwBall(p,q.x+(q.vx||0)*T*(.3+.7*L)+K.rand(-e,e),q.z+(q.vz||0)*T*(.3+.7*L)+K.rand(-e,e),sp);}p.think=K.rand(.9,2.2)-L*.6;}return;}
 let best=null,bd=1e9;for(const b of balls){if(b.st==='held'||b.live)continue;if(b.x*s<-.3)continue;if(P.some(q=>q!==p&&q.team===p.team&&q.alive&&!q.hold&&q.goal===b&&q!==me))continue;const d=(b.x-p.x)**2+(b.z-p.z)**2;if(d<bd){bd=d;best=b;}}
 p.goal=best;if(best){moveTo(p,K.clamp(best.x,s>0?.35:-CX+.4,s>0?CX-.4:-.35),best.z,5,dt);return;}
 p.wander-=dt;if(p.wander<=0){p.wander=K.rand(.5,1.4);p.tx=s*K.rand(2.5,8);p.tz=K.rand(-CZ+.6,CZ-.6);}moveTo(p,p.tx,p.tz,3.4,dt);}
function update(dt){for(let i=timers.length-1;i>=0;i--){timers[i].t-=dt;if(timers[i].t<=0){const f=timers[i].f;timers.splice(i,1);f();}}
 fans.forEach((f,i)=>f.position.y=.28+(roundOver?Math.abs(Math.sin(K.time*9+i))*.22:0));
 const demo=state!=='play';if(catchCd>0)catchCd-=dt;
 for(const p of P){if(!p.alive){if(p.outT>0){p.outT+=dt;if(p.outT<.5){p.g.rotation.x=-p.outT*3;p.g.position.y=0;}else{p.g.rotation.set(0,0,0);p.g.position.set((p.team?1:-1)*(3+p.i*1.4),.28,CZ+1.9);p.g.rotation.y=Math.PI;K.pose(p.g,{legL:[-1.5],legR:[-1.5]});p.outT=0;}}continue;}
  const s=p.team?1:-1;p.vx=p.vz=0;
  if(p===me&&!demo){const ax=K.axis();p.vx=ax.x*5.8;p.vz=-ax.y*5.8;if(K.hit('Space'))playerThrow(false);if(K.hit('KeyE','ShiftLeft','KeyF'))tryCatch();if(p.catchT>0){p.vx*=.4;p.vz*=.4;}}else ai(p,dt);
  if(p.catchT>0)p.catchT-=dt;if(p.throwT>0)p.throwT-=dt;
  p.x+=p.vx*dt;p.z+=p.vz*dt;p.x=s>0?K.clamp(p.x,.3,CX-.3):K.clamp(p.x,-CX+.3,-.3);p.z=K.clamp(p.z,-CZ+.3,CZ-.3);
  for(const q of P)if(q!==p&&q.alive&&q.team===p.team){const dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz);if(d<.7&&d>.01){p.x+=dx/d*(.7-d)*.5;p.z+=dz/d*(.7-d)*.5;}}
  const mv=Math.hypot(p.vx,p.vz);if(mv>.5){p.runT+=dt*mv*2.2;}
  let face=p.a;if(p===me&&!demo&&K.time-mouse.t<4)face=Math.atan2(mouse.x-p.x,mouse.z-p.z);else if(p.hold||mv<.5){const q=nearestFoe(p);if(q)face=Math.atan2(q.x-p.x,q.z-p.z);}else face=Math.atan2(p.vx,p.vz);p.a+=K.angDiff(p.a,face)*Math.min(1,dt*12);
  p.g.position.set(p.x,0,p.z);p.g.rotation.set(0,p.a,0);const Q=p.g.userData.P;if(mv>.5)K.walk(p.g,p.runT,.9);else K.pose(p.g);
  if(p.hold){Q.armR.rotation.set(-2.6,0,0);}if(p.throwT>0){Q.armR.rotation.set(-2.6+(1-p.throwT/.3)*3.4,0,0);}if(p.catchT>0){Q.armL.rotation.set(-1.5,0,.3);Q.armR.rotation.set(-1.5,0,-.3);}
  // apanhar bola do chão
  if(!p.hold&&p.throwT<=0)for(const b of balls)if(b.st!=='held'&&!b.live&&b.y<.7&&(b.x-p.x)**2+(b.z-p.z)**2<1){b.st='held';p.hold=b;b.holder=p;p.think=K.rand(.5,1.5)-p.L*.4;if(p===me)K.sfx.tick();break;}}
 for(const b of balls){if(b.st==='held'){const p=b.holder;if(!p||p.hold!==b){b.st='ground';continue;}b.x=p.x+Math.sin(p.a)*.1+Math.cos(p.a)*-.34;b.z=p.z+Math.cos(p.a)*.1+Math.sin(p.a)*.34;b.y=2.05;}
  else{if(b.st==='air'){b.vy-=G*dt;b.y+=b.vy*dt;if(b.y<BR){b.y=BR;if(b.vy<-1.5)K.sfx.bounce(.6);b.vy*=-.5;b.live=false;b.vx*=.8;b.vz*=.8;if(Math.abs(b.vy)<.8){b.st='ground';b.vy=0;}}}
   else{const f=Math.pow(.25,dt);b.vx*=f;b.vz*=f;}
   b.x+=b.vx*dt;b.z+=b.vz*dt;if(Math.abs(b.x)>CX+.8){b.x=Math.sign(b.x)*(CX+.8);b.vx*=-.6;b.live=false;}if(Math.abs(b.z)>CZ+.8){b.z=Math.sign(b.z)*(CZ+.8);b.vz*=-.6;b.live=false;}
   if(b.live)for(const p of P){if(!p.alive||p.team===b.team)continue;if((b.x-p.x)**2+(b.z-p.z)**2<.42&&b.y<1.95){
     if(p.catchT>0&&!p.hold){b.live=false;b.st='held';p.hold=b;b.holder=p;p.catchT=0;p.think=K.rand(.4,1);K.sfx.good();FL(p.team===0?'APANHOU!':'ELES APANHARAM!','',800,p.team===0?'#3dffa2':'#ff6b6b');if(p===me)K.unlock('mt-catch','Mata · Apanhada no ar');const th=b.by;if(th&&th.alive)out(th,p);revive(p.team);hud();}
     else{b.live=false;b.vx*=-.35;b.vz*=-.35;b.vy=3;out(p,b.by);}break;}}}
  b.m.position.set(b.x,b.y,b.z);b.m.rotation.x+=dt*(b.vz*3);b.m.rotation.z-=dt*(b.vx*3);}
 if(demo){const t=K.time*.15;cam.position.set(Math.sin(t)*16,9,14+Math.cos(t)*3);cam.lookAt(0,.5,0);ring.visible=aimR.visible=false;return;}
 ring.visible=!!me&&me.alive;if(me){ring.position.set(me.x,.04,me.z);cam.position.x=K.damp(cam.position.x,me.x*.3,3,dt);}cam.position.y=13.5;cam.position.z=14.5;cam.lookAt(cam.position.x,0,.2);
 aimR.visible=K.time-mouse.t<4&&!!me&&!!me.hold;aimR.position.set(mouse.x,.05,mouse.z);
 const hh=K.$('hh');if(hh)hh.textContent=!me||!me.alive?'':me.hold?(K.touch?'Atirar!':'Clica para atirar (ou ESPAÇO)'):'Apanha uma bola · E para a agarrar no ar';}
K._dbg=()=>({state,score,a:alive(0).length,b:alive(1).length,me:me&&[+me.x.toFixed(1),+me.z.toFixed(1),!!me.hold,me.alive]});
K.loop(update);menu();
})();
