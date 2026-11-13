// TITLE: Cesto de Rua
// Basquetebol de lançamentos no campo da escola: contra o Rui, contra-relógio e volta ao mundo.
(()=>{'use strict';
const S=K.store('bq',{best60:0,bestVolta:0,wins:[0,0,0]});
document.documentElement.style.setProperty('--kc','#ff8a3d');
K.init({sky:0x9fdcff,fog:[60,140],fov:52,shadow:22,sunPos:[14,30,18]});
const scene=K.scene,cam=K.camera,HY=3.05,RR=.34,BR=.17,GRAV=9.8;
const RIVALS=[['Rui',.42,0xe8352c],['Bia',.58,0xb46bff],['Stôr Paulo',.74,0x1b2340]];
// ----- campo
const ct=K.tex(512,512,(c,w,h)=>{const s=25.6,X=m=>256+m*s,Z=m=>41+m*s;c.fillStyle='#2f7fb0';c.fillRect(0,0,w,h);for(let i=0;i<1500;i++){c.fillStyle=Math.random()<.5?'#3587b8':'#2a76a5';c.fillRect(Math.random()*w,Math.random()*h,3,3);}
 c.fillStyle='#e0703a';c.fillRect(X(-2.45),Z(-1.2),4.9*s,7*s);c.strokeStyle='#fff';c.lineWidth=4;c.strokeRect(X(-2.45),Z(-1.2),4.9*s,7*s);c.beginPath();c.arc(X(0),Z(5.8),1.8*s,0,7);c.stroke();
 c.beginPath();c.arc(X(0),Z(0),6.75*s,0,Math.PI);c.stroke();c.strokeRect(X(-9),Z(-1.2),18*s,18.2*s);c.beginPath();c.arc(X(0),Z(0),1.25*s,0,Math.PI);c.stroke();});
const court=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshLambertMaterial({map:ct}));court.rotation.x=-Math.PI/2;court.position.set(0,0,8.4);court.receiveShadow=true;scene.add(court);
K.plane(200,200,0x6cc070,0,-.03,8);
// tabela
K.cyl(.12,.14,3.6,0x5d6680,0,1.8,-1.5,null,8);K.box(.14,.14,1.2,0x5d6680,0,3.5,-.95);
const bbT=K.tex(128,96,(c,w,h)=>{c.fillStyle='#f6f8ff';c.fillRect(0,0,w,h);c.strokeStyle='#e8352c';c.lineWidth=6;c.strokeRect(3,3,w-6,h-6);c.strokeRect(40,44,48,36);});
const bb=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.2,.06),new THREE.MeshLambertMaterial({map:bbT}));bb.position.set(0,3.5,-.4);bb.castShadow=true;scene.add(bb);
const rim=new THREE.Mesh(new THREE.TorusGeometry(RR,.025,8,24),new THREE.MeshLambertMaterial({color:0xff5a1f}));rim.rotation.x=Math.PI/2;rim.position.set(0,HY,0);scene.add(rim);K.box(.1,.05,.14,0xff5a1f,0,HY,-.34);
const netG=new THREE.CylinderGeometry(RR,RR*.62,.5,12,3,true),net=new THREE.Mesh(netG,new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true}));net.position.set(0,HY-.25,0);scene.add(net);
// escola e recreio
K.box(46,10,6,0xfff2e0,0,5,-14);K.box(47,1,7,0xc0452c,0,10.5,-14);for(let x=-20;x<=20;x+=4)for(const y of [2.8,6.6])K.box(2.2,1.7,.2,0x9fd8ff,x,y,-10.95);
const sg=new THREE.Mesh(new THREE.BoxGeometry(12,1.4,.2),new THREE.MeshBasicMaterial({map:K.tex(512,64,(c,w,h)=>{c.fillStyle='#1b2340';c.fillRect(0,0,w,h);c.fillStyle='#ffd23f';c.font='900 40px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('ESCOLA VALE VERDE',w/2,34);})}));sg.position.set(0,9,-10.9);scene.add(sg);
for(let x=-22;x<=22;x+=2.2){K.box(.08,2.6,.08,0x8a93ad,x,1.3,-6);}K.box(44,.08,.08,0x8a93ad,0,2.6,-6);K.box(44,.08,.08,0x8a93ad,0,1.3,-6);
for(const [x,z,s] of [[-13,2,1.4],[13,3,1.6],[-15,12,1.3],[15,13,1.5],[-12,22,1.5],[12,23,1.3],[0,26,1.6]])K.tree(x,z,s);
for(const s of [-1,1]){K.box(4,.12,.7,0x9b7447,s*11.2,.6,8);K.box(.12,.6,.6,0x5d6680,s*11.2-1.7,.3,8);K.box(.12,.6,.6,0x5d6680,s*11.2+1.7,.3,8);}
const fans=[];for(let i=0;i<6;i++){const p=K.person({shirt:K.pick([0xffd23f,0x35d07f,0x2a8bff,0xff8ac0,0xffffff]),s:.95});p.position.set((i<3?-1:1)*11.2+(-1.2+(i%3)*1.2),.3,8.1);p.rotation.y=(i<3?1:-1)*Math.PI/2;K.pose(p,{legL:[-1.5],legR:[-1.5]});fans.push(p);}
for(let i=0;i<5;i++)K.cloud(K.rand(-90,90),K.rand(34,55),K.rand(-90,-30),K.rand(2,4));
// bola e jogadores
const bT=K.tex(128,64,(c,w,h)=>{c.fillStyle='#e8752a';c.fillRect(0,0,w,h);c.strokeStyle='#3a1d0c';c.lineWidth=3;c.beginPath();c.moveTo(0,32);c.lineTo(w,32);c.moveTo(32,0);c.lineTo(32,h);c.moveTo(96,0);c.lineTo(96,h);c.stroke();});
const ball=new THREE.Mesh(new THREE.SphereGeometry(BR,18,12),new THREE.MeshLambertMaterial({map:bT}));ball.castShadow=true;scene.add(ball);
const me=K.person({shirt:0xffd23f,shorts:0x1b2340,shoes:0xffffff});let foe=K.person({shirt:0xe8352c,shorts:0x222222,skin:0xd9a87c,hair:0x1c1c1c});
// ----- estado
let mode='menu',rival=0,phase='idle',turn=0,sc=[0,0],round=0,spot={x:0,z:5,d:5},power=0,pdir=1,charging=false,hold=false,streak=0,clock=0,shots=0,vIdx=0,aiT=0,flyT=0,scored=false,touchedRim=false,resT=0,wasAbove=false,jump=0;
const bv=new THREE.Vector3();let bLive=false;
const IDEAL=.7;const zoneW=()=>K.clamp(.1-spot.d*.006,.045,.09);
const timers=[];const after=(t,f)=>timers.push({t,f});
function setSpot(d,a){spot={x:Math.sin(a)*d,z:Math.cos(a)*d,d,a};}
function randSpot(){setSpot(K.rand(3.2,8.2),K.rand(-1.15,1.15));}
function who(){return turn===0?me:foe;}
function place(){const p=who(),o=turn===0?foe:me,a=spot.a;p.position.set(spot.x,0,spot.z);p.rotation.y=a+Math.PI;K.pose(p);o.position.set(spot.x+Math.cos(a)*2.2,0,spot.z-Math.sin(a)*2.2+1);o.rotation.y=a+Math.PI;K.pose(o);o.visible=mode==='vs';
 bLive=false;ball.position.set(spot.x-Math.sin(a)*.35,1.25,spot.z-Math.cos(a)*.35);power=0;charging=false;
 cam.position.set(spot.x+Math.sin(a)*3.6+Math.cos(a)*.9,2.5,spot.z+Math.cos(a)*3.6-Math.sin(a)*.9);cam.lookAt(0,2.6,0);}
function shoot(p,noise){const a=spot.a,sx=spot.x-Math.sin(a)*.35,sz=spot.z-Math.cos(a)*.35,sy=2.25,T=.95+spot.d*.075,f=1+(p-IDEAL)*.85,ang=noise;
 let vx=(0-sx)/T*f,vz=(0-sz)/T*f;const c=Math.cos(ang),s=Math.sin(ang);bv.set(vx*c-vz*s,(HY-sy+.5*GRAV*T*T)/T,vx*s+vz*c);ball.position.set(sx,sy,sz);bLive=true;flyT=0;scored=false;touchedRim=false;wasAbove=false;phase='fly';jump=.45;K.sfx.whoosh();if(mode==='volta'||mode==='t60')shots++;}
function release(){if(!charging)return;charging=false;const err=Math.abs(power-IDEAL),w=zoneW()/2;shoot(err<w*.4?IDEAL:power,err<w*.4?0:K.rand(-1,1)*(.006+err*.4));}
function pts(){return spot.d>6.75?3:2;}
function resolve(){if(phase!=='fly')return;phase='res';resT=0;const p=who()===me;
 if(scored){let v=pts();if(p){streak++;if(streak>=3){v++;}}if(mode==='vs')sc[turn]+=v;else sc[0]+=v;const swish=!touchedRim;
  K.flash(swish&&p?'LIMPINHO!':'CESTO!','+'+v+(p&&streak>=3?' 🔥 em chamas':''),1000,p?'#3dffa2':'#ff6b6b');if(p){K.sfx.good();K.sfx.cheer(.7);if(swish&&spot.d>7.5)K.unlock('bq-longe','Cesto · Limpinho de muito longe');if(streak===5)K.unlock('bq-5','Cesto · Cinco seguidos');}else K.sfx.ooh();}
 else{if(p){streak=0;K.sfx.bad();}K.flash(p?'FALHOU':'O '+RIVALS[rival][0]+' FALHOU','',800,p?'#ff6b6b':'#3dffa2');}
 hud();after(mode==='t60'?.55:1.25,next);}
function next(){if(mode==='vs'){if(turn===1){round++;if(round>=8&&sc[0]!==sc[1]||round>=12){return endVs();}randSpot();turn=0;}else turn=1;if(turn===1)aiT=K.rand(.9,1.5);}
 else if(mode==='t60'){if(clock<=0)return endT60();randSpot();}
 else{if(scored){vIdx++;if(vIdx>=7)return endVolta();}setSpot(vIdx%2?6.9:5.2,-1.2+vIdx*.4);}
 phase='aim';place();hud();}
function startVs(r){mode='vs';rival=r;scene.remove(foe);foe=K.person({shirt:RIVALS[r][2],shorts:0x222222,skin:0xd9a87c,hair:0x1c1c1c});sc=[0,0];round=0;turn=0;streak=0;randSpot();begin();}
function begin(){phase='aim';K.screen(null);K.play(true);place();hud();K.sfx.whistle();}
function endVs(){K.play(false);const win=sc[0]>sc[1];if(win){S.data.wins[rival]++;S.save();K.sfx.win();K.confetti(new THREE.Vector3(0,3,4));if(rival===2)K.unlock('bq-stor','Cesto · Ganhaste ao Stôr Paulo');}else K.sfx.bad();
 K.screen(`<div class="k-title">${win?'<em>Ganhaste!</em>':sc[0]===sc[1]?'Empate':'Perdeste'}</div><div class="k-lead">Tu ${sc[0]} – ${sc[1]} ${RIVALS[rival][0]}</div><button class="k-go" data-a="r">Desforra</button><button class="k-alt" data-a="m">Menu</button>`,{r:()=>startVs(rival),m:menu});}
function endT60(){K.play(false);const rec=sc[0]>S.data.best60;if(rec){S.data.best60=sc[0];S.save();K.sfx.win();}if(sc[0]>=40)K.unlock('bq-40','Cesto · 40 pontos num minuto');
 K.screen(`<div class="k-title"><em>${sc[0]}</em> pontos</div><div class="k-lead">${rec?'Novo recorde!':'Recorde: '+S.data.best60} · ${shots} lançamentos</div><button class="k-go" data-a="r">Outra vez</button><button class="k-alt" data-a="m">Menu</button>`,{r:startT60,m:menu});}
function endVolta(){K.play(false);const rec=!S.data.bestVolta||shots<S.data.bestVolta;if(rec){S.data.bestVolta=shots;S.save();}K.sfx.win();if(shots===7)K.unlock('bq-volta','Cesto · Volta ao mundo perfeita');
 K.screen(`<div class="k-title">Volta em <em>${shots}</em></div><div class="k-lead">${rec?'Novo recorde!':'Recorde: '+S.data.bestVolta+' lançamentos'}</div><button class="k-go" data-a="r">Outra vez</button><button class="k-alt" data-a="m">Menu</button>`,{r:startVolta,m:menu});}
function startT60(){mode='t60';sc=[0,0];clock=60;shots=0;streak=0;turn=0;randSpot();begin();}
function startVolta(){mode='volta';sc=[0,0];shots=0;vIdx=0;streak=0;turn=0;setSpot(5.2,-1.2);begin();}
function menu(){mode='menu';phase='idle';K.play(false);turn=0;setSpot(6,0);place();foe.visible=true;
 K.screen(`<div class="k-title">Cesto de <em>Rua</em></div><div class="k-lead">Mantém premido e larga na zona verde. Quanto mais longe, mais difícil.</div>
 <div class="k-lab">Um contra um</div><div class="k-row">${RIVALS.map((r,i)=>`<button class="k-chip" data-a="vs" data-v="${i}">vs ${r[0]}<small>${'★'.repeat(i+1)} · ${S.data.wins[i]} vitórias</small></button>`).join('')}</div>
 <button class="k-go" data-a="t60">⏱️ Contra-relógio (60 s)</button><button class="k-alt" data-a="volta">🌍 Volta ao mundo (7 posições)</button>
 <table class="k-tab"><tr><td>Recorde 60 s</td><td>${S.data.best60}</td></tr><tr><td>Melhor volta ao mundo</td><td>${S.data.bestVolta||'—'}</td></tr></table>${K.keysHelp([['CLIQUE','ou'],['ESPAÇO','manter e largar'],['P','pausa']])}`,
 {vs:v=>startVs(+v),t60:startT60,volta:startVolta});}
K.onQuit=menu;
function hud(){const z=zoneW()*100,top=mode==='vs'?`<div class="k-pill" style="text-align:center"><small>Ronda ${Math.min(round+1,12)}${round>=8?' · desempate':'/8'}</small><b>Tu ${sc[0]} – ${sc[1]} ${RIVALS[rival][0]}</b></div>`:mode==='t60'?`<div class="k-pill"><small>Tempo</small><b id="hc">60</b></div><div class="k-pill"><small>Pontos</small><b>${sc[0]}</b></div>`:`<div class="k-pill"><small>Posição</small><b>${Math.min(7,vIdx+1)}/7</b></div><div class="k-pill"><small>Lançamentos</small><b>${shots}</b></div>`;
 K.hud(`<div class="k-tc">${top}</div><div class="k-tr"><div class="k-pill"><small>${spot.d.toFixed(1)} m</small><b>${pts()} pts${streak>=3?' 🔥':''}</b></div></div>
 <div class="k-bc" style="flex-direction:column">${turn===0?`<div class="k-meter"><u style="left:${IDEAL*100-z/2}%;width:${z}%"></u><i id="pw" style="width:0"></i></div><div class="k-hint">Mantém premido e larga no verde</div>`:`<div class="k-hint">Vez do ${RIVALS[rival][0]}…</div>`}</div>`);}
const cv=K.renderer.domElement;
cv.addEventListener('pointerdown',()=>{K.audio();hold=true;if(phase==='aim'&&turn===0&&!K.paused){charging=true;power=0;pdir=1;}});
addEventListener('pointerup',()=>{hold=false;if(charging)release();});
function update(dt){for(let i=timers.length-1;i>=0;i--){timers[i].t-=dt;if(timers[i].t<=0){const f=timers[i].f;timers.splice(i,1);f();}}
 for(let i=0;i<fans.length;i++)fans[i].position.y=.3+(phase==='res'&&scored?Math.abs(Math.sin(K.time*9+i))*.25:0);
 if(mode==='menu'){const t=K.time*.25;cam.position.set(Math.sin(t)*9,3.4,9+Math.cos(t)*3);cam.lookAt(0,2.4,0);ball.position.set(spot.x,1.25+Math.abs(Math.sin(K.time*4))*.6-.6,spot.z-.5);return;}
 if(mode==='t60'&&K.inGame){clock-=dt;const e=K.$('hc');if(e)e.textContent=Math.max(0,Math.ceil(clock));if(clock<=0&&phase==='aim'){phase='idle';endT60();return;}}
 const p=who(),P=p.userData.P;
 if(phase==='aim'){if(turn===0){if(K.hit('Space')){charging=true;power=0;pdir=1;}if(charging){power+=pdir*dt*1.2;if(power>=1){power=1;pdir=-1;}if(power<=0){power=0;pdir=1;}if(!K.down('Space')&&!hold)release();}const e=K.$('pw');if(e)e.style.width=power*100+'%';}
  else{aiT-=dt;charging=aiT<.5;power=charging?(0.5-aiT)*1.4:0;if(aiT<=0){charging=false;const make=Math.random()<RIVALS[rival][1]-(spot.d-3)*.035;shoot(make?IDEAL+K.rand(-.012,.012):IDEAL+K.pick([-1,1])*K.rand(.07,.16),make?0:K.rand(-.03,.03));}}
  const up=charging?-1.2-power*1.6:-.5;P.armL.rotation.x=K.damp(P.armL.rotation.x,up,14,dt);P.armR.rotation.x=K.damp(P.armR.rotation.x,up,14,dt);p.position.y=charging?-.08*Math.sin(power*3):0;
  const a=spot.a;ball.position.set(spot.x-Math.sin(a)*.35,charging?1.5+power*.75:1.25+Math.abs(Math.sin(K.time*5))*.0,spot.z-Math.cos(a)*.35);}
 if(jump>0){jump-=dt;p.position.y=Math.sin((.45-jump)/.45*Math.PI)*.45;P.armL.rotation.x=P.armR.rotation.x=-2.9;if(jump<=0){p.position.y=0;}}
 if(bLive){flyT+=dt;const steps=3,h=dt/steps;for(let s=0;s<steps;s++){const py=ball.position.y,pz=ball.position.z;bv.y-=GRAV*h;ball.position.addScaledVector(bv,h);const b=ball.position;
   // aro
   const rho=Math.hypot(b.x,b.z)||1e-6,nx=b.x/rho*RR,nz=b.z/rho*RR,dx=b.x-nx,dy=b.y-HY,dz=b.z-nz,d=Math.hypot(dx,dy,dz);
   if(d<BR+.025){const ux=dx/d,uy=dy/d,uz=dz/d,vn=bv.x*ux+bv.y*uy+bv.z*uz;if(vn<0){bv.x-=1.55*vn*ux;bv.y-=1.55*vn*uy;bv.z-=1.55*vn*uz;bv.multiplyScalar(.92);if(!touchedRim||Math.abs(vn)>1.5)K.tone(520,.08,'triangle',.18,300);touchedRim=true;}b.x=nx+ux*(BR+.025);b.y=HY+uy*(BR+.025);b.z=nz+uz*(BR+.025);}
   // tabela
   if(b.z-BR<-.37&&pz-BR>=-.37&&Math.abs(b.x)<.95&&b.y>2.85&&b.y<4.15){b.z=-.37+BR;bv.z*=-.6;bv.x*=.9;K.sfx.bounce(.8);touchedRim=true;}
   if(b.y>HY)wasAbove=true;
   if(!scored&&wasAbove&&py>=HY&&b.y<HY&&rho<RR-.03&&bv.y<0){scored=true;bv.x*=.3;bv.z*=.3;net.scale.y=1.5;K.noise(.18,.25,3200,0,2);}
   if(b.y<BR){b.y=BR;if(bv.y<-1)K.sfx.bounce(Math.min(1,-bv.y/6));bv.y*=-.62;bv.x*=.8;bv.z*=.8;if(phase==='fly')resolve();}}
  ball.rotation.x-=dt*9;if(phase==='fly'&&(scored&&ball.position.y<HY-.7||flyT>4.5))resolve();
  if(who()===me&&streak>=3&&phase==='fly'&&Math.random()<dt*40)K.burst(ball.position,[0xff8a3d,0xffd23f],1,1,1,.4);}
 net.scale.y=K.damp(net.scale.y,1,8,dt);
 if(phase==='fly'||phase==='res'){const b=ball.position;cam.lookAt(b.x*.25,K.lerp(2.6,Math.max(1.6,b.y),.25),b.z*.25);}}
K._dbg={shoot:(p,n)=>shoot(p,n||0),set:(d,a)=>{timers.length=0;phase="aim";setSpot(d,a);place();},st:()=>({phase,sc,scored,mode})};
K.loop(update);menu();
})();
