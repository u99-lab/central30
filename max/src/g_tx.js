// TITLE: Táxi da Figueira
// Táxi contra o relógio numa cidade aberta: apanha passageiros, leva-os depressa e sem bater para ganhar mais tempo e gorjeta.
(()=>{'use strict';
const S=K.store('tx',{best:0,most:0,money:0,car:0,owned:[0]});
document.documentElement.style.setProperty('--kc','#ffd23f');
K.init({sky:0x9fd6ff,fog:[120,380],fov:60,far:800,shadow:60,sunPos:[50,90,30]});
const scene=K.scene,cam=K.camera,NB=7,D=58,BH=19,W=NB*D;
const CARS=[['Táxi clássico',0xffd23f,27,0],['Táxi turbo',0xff8a3d,31,3000],['Táxi de corrida',0x3dffa2,35,9000],['Táxi relâmpago',0xff3d8b,39,22000]];
K.plane(W+80,W+80,0x3b3f4b,W/2,0,W/2).receiveShadow=true;K.plane(1400,1400,0x6cc070,W/2,-.06,W/2);
const lineT=K.tex(32,128,(c,w,h)=>{c.fillStyle='#3b3f4b';c.fillRect(0,0,w,h);c.fillStyle='#f2f2f2';c.fillRect(13,10,6,60);},[1,1]);
for(let i=0;i<=NB;i++)for(const v of [0,1]){const t=lineT.clone();t.needsUpdate=true;t.repeat.set(1,W/8);const m=new THREE.Mesh(new THREE.PlaneGeometry(.5,W),new THREE.MeshBasicMaterial({map:t}));m.rotation.x=-Math.PI/2;if(v)m.rotation.z=Math.PI/2;m.position.set(v?W/2:i*D,.02,v?i*D:W/2);scene.add(m);}
const wT=K.tex(64,64,(c,w)=>{c.fillStyle='#fff';c.fillRect(0,0,w,w);for(let y=8;y<w;y+=16)for(let x=6;x<w;x+=15){c.fillStyle=Math.random()<.3?'#6fa8d8':'#8fc4ee';c.fillRect(x,y,8,9);}});
const bmats=[0xfff2e0,0xffd7b8,0xd8ecff,0xffe59a,0xf4c2c2,0xd6f0cf,0xe6dcff,0xf0f0f0].map(c=>new THREE.MeshLambertMaterial({color:c,map:wT}));
const park=new Set();while(park.size<7)park.add(K.irand(0,NB-1)+','+K.irand(0,NB-1));
for(let i=0;i<NB;i++)for(let j=0;j<NB;j++){const cx=(i+.5)*D,cz=(j+.5)*D;if(park.has(i+','+j)){K.box(44,.24,44,0x7fd08a,cx,.12,cz);for(let k=0;k<7;k++)K.tree(cx+K.rand(-18,18),cz+K.rand(-18,18),K.rand(1,1.8));continue;}
 K.box(44,.24,44,0xd9d3c4,cx,.12,cz);for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const h=K.rand(8,34),m=new THREE.Mesh(new THREE.BoxGeometry(18.6,h,18.6),K.pick(bmats));m.position.set(cx+a*9.5,h/2+.24,cz+b*9.5);m.castShadow=m.receiveShadow=true;scene.add(m);K.box(19,.6,19,K.pick([0xc0452c,0x5d6680,0x8a4a2e]),cx+a*9.5,h+.5,cz+b*9.5);}}
for(let i=0;i<8;i++)K.cloud(K.rand(-100,W+100),K.rand(80,120),K.rand(-100,W+100),K.rand(3,6));
const solid=(x,z)=>{const i=Math.floor(x/D),j=Math.floor(z/D);return i>=0&&j>=0&&i<NB&&j<NB&&!park.has(i+','+j)?[(i+.5)*D,(j+.5)*D]:null;};
function mkCar(col,taxi){const g=new THREE.Group(),b=new THREE.Group();g.add(b);K.box(1.9,.55,4.2,col,0,.62,0,b);K.box(1.7,.5,2.1,col,0,1.1,-.2,b);K.box(1.6,.38,2,0x9fd8ff,0,1.12,-.2,b).scale.set(1.04,1,.9);if(taxi){K.box(.7,.22,.3,0x1b1b1b,0,1.47,-.2,b);K.box(1.92,.14,4.22,0x1b1b1b,0,.5,0,b);}
 for(const [x,z] of [[-.98,1.3],[.98,1.3],[-.98,-1.3],[.98,-1.3]])K.cyl(.38,.38,.3,0x16181f,x,.38,z,g,12).rotation.z=1.57;scene.add(g);return g;}
const marker=(col,txt)=>{const g=new THREE.Group(),c=new THREE.Mesh(new THREE.CylinderGeometry(5,5,8,24,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));c.position.y=4;g.add(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:K.tex(128,128,x=>{x.font='96px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,64,70);}),depthTest:false}));s.scale.set(7,7,1);s.position.y=12;g.add(s);scene.add(g);g.visible=false;return g;};
const pickM=marker(0xffd23f,'🙋'),dropM=marker(0x3dffa2,'🏁'),pax=K.person({shirt:0xff3d8b});pax.visible=false;
let state='menu',me=null,civs=[],goal={x:0,z:0},has=false,timer=0,score=0,rides=0,fare=0,mood=1,combo=0,eng=null,engG=null,stopT=0;
const NAMES=['a D. Rosa','o Sr. Manel','a Bia','o Rui','o Stôr Paulo','a avó do Isaac','um turista','a Mika'],PLACES=['à praia','ao estádio','à escola','ao mercado','à estação','ao casino','ao farol','ao centro'];
const car=(g,x,z)=>({g,x,z,a:0,sp:0,steer:0});
function pickCiv(v){const o=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>v.ni+d[0]>=0&&v.ni+d[0]<=NB&&v.nj+d[1]>=0&&v.nj+d[1]<=NB&&!(d[0]===-v.dx&&d[1]===-v.dz)),d=K.pick(o);v.dx=d[0];v.dz=d[1];v.ni+=d[0];v.nj+=d[1];}
function newGoal(far){let i,j,n=0;do{i=K.irand(0,NB);j=K.irand(0,NB);n++;}while((Math.hypot(i*D-me.x,j*D-me.z)<(far?150:60)||Math.hypot(i*D-me.x,j*D-me.z)>(far?330:190))&&n<60);goal.x=i*D;goal.z=j*D;}
function nextPassenger(){has=false;newGoal(false);pickM.position.set(goal.x,0,goal.z);pickM.visible=true;dropM.visible=false;pax.visible=true;pax.position.set(goal.x+3.4,0,goal.z+3.4);hint('Apanha o passageiro 🙋 (pára ao pé dele)');}
function hint(t){const e=K.$('hh');if(e)e.textContent=t;}
function start(){if(me)scene.remove(me.g);for(const c of civs)scene.remove(c.g);civs=[];const c=CARS[S.data.car];me=car(mkCar(c[1],true),D*3,D*3+8);me.top=c[2];timer=75;score=0;rides=0;combo=0;stopT=0;
 for(let k=0;k<14;k++){const i=K.irand(0,NB),j=K.irand(0,NB),v=car(mkCar(K.pick([0x35d07f,0xe8352c,0xffffff,0x8a93ad,0x2a8bff,0xf4c2c2])),i*D,j*D);v.ni=i;v.nj=j;pickCiv(v);civs.push(v);}
 state='play';K.screen(null);K.play(true);K.useStick=true;K.pad([['Space','Travão de mão'],['KeyB','Travar']]);
 K.hud(`<div class="k-tl"><canvas id="mm" width="130" height="130" style="width:130px;height:130px;background:#0b1020b3;border-radius:14px;border:2px solid #ffffff2e"></canvas></div><div class="k-tc"><div class="k-pill"><small>Tempo</small><b id="ht" style="font-size:28px">1:15</b></div></div><div class="k-tr"><div class="k-pill"><small>Ganho</small><b id="hs">0 €</b></div><div class="k-pill"><small>Viagens</small><b id="hr">0</b></div><div class="k-pill"><small>Passageiro</small><b id="hm">—</b></div></div><div class="k-bc"><div class="k-hint" id="hh"></div></div>`);
 nextPassenger();engine(true);cam.position.set(me.x,6,me.z-10);K.flash('TÁXI!','Leva o máximo de passageiros',1500,'#ffd23f');}
function engine(on){const ac=K.audio();if(!ac)return;if(on&&!eng){eng=ac.createOscillator();eng.type='sawtooth';const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=650;engG=ac.createGain();engG.gain.value=0;eng.connect(f);f.connect(engG);engG.connect(ac.destination);eng.start();}if(!on&&eng){try{eng.stop();}catch{}eng=null;engG=null;}}
function crash(){if(has){mood=Math.max(.2,mood-.2);K.toast('Cuidado! O passageiro assustou-se');}K.sfx.hit();K.shake=.3;combo=0;}
function drive(c,thr,steer,hb,dt){const target=thr>0?c.top:thr<0?-8:0;if(c.sp<target)c.sp=Math.min(target,c.sp+12*dt);else c.sp=Math.max(target,c.sp-(thr<0||hb?26:7)*dt);c.steer=K.damp(c.steer,steer,10,dt);c.a-=steer*(hb?2.9:2.1)*Math.min(1,Math.abs(c.sp)/8)*(c.sp<0?-1:1)*dt;c.x+=Math.sin(c.a)*c.sp*dt;c.z+=Math.cos(c.a)*c.sp*dt;
 const s=solid(c.x,c.z)||solid(c.x+1.5,c.z)||solid(c.x-1.5,c.z)||solid(c.x,c.z+1.5)||solid(c.x,c.z-1.5);if(s){const dx=c.x-s[0],dz=c.z-s[1],px=BH+1.5-Math.abs(dx),pz=BH+1.5-Math.abs(dz);if(px>0&&pz>0){if(px<pz)c.x+=Math.sign(dx)*px;else c.z+=Math.sign(dz)*pz;if(Math.abs(c.sp)>10)crash();c.sp*=Math.pow(.05,dt);}}
 c.x=K.clamp(c.x,-6,W+6);c.z=K.clamp(c.z,-6,W+6);c.g.position.set(c.x,0,c.z);c.g.rotation.y=c.a;c.g.children[0].rotation.z=c.steer*.06*Math.min(1,c.sp/15);}
function over(){state='end';engine(false);K.play(false);pickM.visible=dropM.visible=false;const rec=score>S.data.best;if(rec)S.data.best=score;if(rides>S.data.most)S.data.most=rides;S.data.money+=score;S.save();if(rec)K.sfx.win();else K.sfx.bad();if(rides>=10)K.unlock('tx-10','Táxi · Dez passageiros numa só corrida');
 K.screen(`<div class="k-title"><em>${score} €</em></div><div class="k-lead">${rides} viagens${rec?' · Novo recorde!':' · Recorde: '+S.data.best+' €'}</div><button class="k-go" data-a="r">Outra vez</button><button class="k-alt" data-a="m">Garagem</button>`,{r:start,m:menu});}
function menu(){state='menu';engine(false);K.play(false);const d=S.data;
 K.screen(`<div class="k-title">Táxi da <em>Figueira</em></div><div class="k-lead">Apanha passageiros e leva-os depressa. Cada viagem dá mais tempo. Carteira: <b>${d.money} €</b></div><button class="k-go" data-a="go">🚕 Começar o turno</button>
 <div class="k-lab">Garagem</div><div class="k-row">${CARS.map((c,i)=>{const own=d.owned.includes(i);return `<button class="k-chip${d.car===i?' on':''}" data-a="car" data-v="${i}" ${own||d.money>=c[3]?'':'disabled'}>${c[0]}<small>${own?(d.car===i?'a usar':'usar'):c[3]+' €'} · ${Math.round(c[2]*3.6)} km/h</small></button>`;}).join('')}</div>
 <table class="k-tab"><tr><td>Melhor turno</td><td>${d.best} €</td></tr><tr><td>Mais viagens</td><td>${d.most}</td></tr></table>${K.keysHelp([['W A S D','conduzir'],['ESPAÇO','travão de mão'],['P','pausa']])}`,
 {go:start,car:v=>{v=+v;if(!d.owned.includes(v)){d.money-=CARS[v][3];d.owned.push(v);K.sfx.coin();}d.car=v;S.save();menu();}});}
K.onQuit=menu;K.me=()=>state==='play'?me&&me.g:null;
function update(dt){if(state!=='play'){const t=K.time*.06;cam.position.set(W/2+Math.sin(t)*150,70,W/2+Math.cos(t)*150);cam.lookAt(W/2,0,W/2);K.sunFollow(W/2,W/2);return;}
 const ax=K.axis(),hb=K.down('Space'),thr=K.touch&&!K.down('KeyB')?(ax.y<-.6?-1:1):K.down('KeyB')?-1:ax.y>.2?1:ax.y<-.2?-1:0;drive(me,thr,ax.x,hb,dt);
 for(const v of civs){const tx=v.ni*D+v.dz*-3.2,tz=v.nj*D+v.dx*3.2;if(Math.abs(tx-v.x)+Math.abs(tz-v.z)<3)pickCiv(v);v.a=Math.atan2(v.dx,v.dz);const dx=tx-v.x,dz=tz-v.z,d=Math.hypot(dx,dz)||1,st=Math.min(d,9*dt);v.x+=dx/d*st;v.z+=dz/d*st;v.g.position.set(v.x,0,v.z);v.g.rotation.y=v.a;
  const ex=me.x-v.x,ez=me.z-v.z,e=Math.hypot(ex,ez);if(e<2.6&&e>.01){me.x+=ex/e*(2.6-e);me.z+=ez/e*(2.6-e);if(Math.abs(me.sp)>10)crash();me.sp*=.7;}}
 for(const q of K.peers()){const dx=me.x-q.x,dz=me.z-q.z,d=Math.hypot(dx,dz);if(d<2.7&&d>.01){me.x=q.x+dx/d*2.7;me.z=q.z+dz/d*2.7;me.sp*=.6;}}
 timer-=dt;if(timer<=0){over();return;}if(timer<10&&Math.floor(timer)!==Math.floor(timer+dt))K.sfx.tick();
 const gd=Math.hypot(goal.x-me.x,goal.z-me.z);pickM.rotation.y+=dt;dropM.rotation.y-=dt;
 if(gd<6&&Math.abs(me.sp)<4){stopT+=dt;if(stopT>.35){stopT=0;if(!has){has=true;mood=1;pax.visible=false;pickM.visible=false;newGoal(true);const d=Math.hypot(goal.x-me.x,goal.z-me.z);fare={base:Math.round(d*1.6/10)*10,t0:timer,par:d/me.top*1.9+4};dropM.position.set(goal.x,0,goal.z);dropM.visible=true;K.sfx.coin();hint('Leva '+K.pick(NAMES)+' '+K.pick(PLACES)+' 🏁');}
   else{const used=fare.t0-timer,fast=used<fare.par,tip=Math.round(fare.base*(fast?.6:0)*mood/10)*10,tot=fare.base+tip+combo*20;score+=tot;rides++;combo=fast?combo+1:0;timer+=fast?16:10;K.sfx.good();K.flash('+'+tot+' €',(fast?'Rápido! ':'')+(tip?'gorjeta '+tip+' € · ':'')+'+'+(fast?16:10)+' s',1300,'#3dffa2');K.burst(new THREE.Vector3(me.x,2,me.z),[0xffd23f,0x3dffa2],18,4,6,.8);if(combo===5)K.unlock('tx-5','Táxi · Cinco viagens rápidas seguidas');nextPassenger();}}}else stopT=0;
 if(gd<14&&Math.abs(me.sp)>=4)hint(has?'Pára dentro do círculo verde':'Pára ao pé do passageiro');
 const tt=Math.ceil(timer);K.$('ht').textContent=Math.floor(tt/60)+':'+String(tt%60).padStart(2,'0');K.$('ht').style.color=timer<10?'#ff6b6b':'';K.$('hs').textContent=score+' €';K.$('hr').textContent=rides;K.$('hm').textContent=has?(mood>.8?'😀':mood>.5?'😐':'😱'):'—';
 if(engG){engG.gain.value=.03;eng.frequency.value=55+Math.abs(me.sp)*5.5;}
 cam.position.x=K.damp(cam.position.x,me.x-Math.sin(me.a)*9,7,dt);cam.position.z=K.damp(cam.position.z,me.z-Math.cos(me.a)*9,7,dt);cam.position.y=K.damp(cam.position.y,4.6,5,dt);cam.lookAt(me.x+Math.sin(me.a)*5,1.2,me.z+Math.cos(me.a)*5);K.sunFollow(me.x,me.z);
 const mm=K.$('mm');if(mm){const c=mm.getContext('2d'),s=120/W,X=v=>5+v*s;c.clearRect(0,0,130,130);c.strokeStyle='#ffffff55';c.lineWidth=2;c.beginPath();for(let i=0;i<=NB;i++){c.moveTo(X(i*D),5);c.lineTo(X(i*D),125);c.moveTo(5,X(i*D));c.lineTo(125,X(i*D));}c.stroke();c.fillStyle=has?'#3dffa2':'#ffd23f';c.beginPath();c.arc(X(goal.x),X(goal.z),5.5,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(X(me.x),X(me.z),4,0,7);c.fill();c.strokeStyle='#fff';c.beginPath();c.moveTo(X(me.x),X(me.z));c.lineTo(X(me.x)+Math.sin(me.a)*9,X(me.z)+Math.cos(me.a)*9);c.stroke();}}
const _sp=K.setPause;K.setPause=v=>{_sp(v);if(engG)engG.gain.value=K.paused?0:.03;};window.C30pause=f=>K.setPause(f===undefined?!K.paused:f);
K._dbg=()=>({state,has,score,rides,timer:timer|0,goal,me:me&&[me.x|0,me.z|0]});K._test=o=>Object.assign(me,o);
K.loop(update);menu();
})();
