// TITLE: Polícias e Ladrões
// Cidade aberta de carro. Ladrão: assalta, despista a polícia e guarda o dinheiro no esconderijo. Polícia: persegue e prende os ladrões.
(()=>{'use strict';
const S=K.store('pl',{money:0,car:0,owned:[0],bestL:0,bestP:0});
document.documentElement.style.setProperty('--kc','#4fa3ff');
K.init({sky:0x9fd6ff,fog:[120,380],fov:60,far:800,shadow:60,sunPos:[50,90,30]});
const scene=K.scene,cam=K.camera,NB=7,D=58,BH=19,W=NB*D;
const CARS=[['Gazela GTi',0xe8352c,27,0],['Falcon GT',0xffd23f,31,4000],['Aurora Racer',0x8a4dff,35,12000],['Relâmpago X',0x1b1b1b,39,30000]];
// ----- cidade
K.plane(W+80,W+80,0x3b3f4b,W/2,0,W/2).receiveShadow=true;K.plane(1400,1400,0x6cc070,W/2,-.06,W/2);
const lineT=K.tex(32,128,(c,w,h)=>{c.fillStyle='#3b3f4b';c.fillRect(0,0,w,h);c.fillStyle='#f2f2f2';c.fillRect(13,10,6,60);},[1,1]);
for(let i=0;i<=NB;i++)for(const v of [0,1]){const t=lineT.clone();t.needsUpdate=true;t.repeat.set(1,W/8);const m=new THREE.Mesh(new THREE.PlaneGeometry(.5,W),new THREE.MeshBasicMaterial({map:t}));m.rotation.x=-Math.PI/2;if(v)m.rotation.z=Math.PI/2;m.position.set(v?W/2:i*D,.02,v?i*D:W/2);scene.add(m);}
const wT=K.tex(64,64,(c,w)=>{c.fillStyle='#fff';c.fillRect(0,0,w,w);for(let y=8;y<w;y+=16)for(let x=6;x<w;x+=15){c.fillStyle=Math.random()<.3?'#6fa8d8':'#8fc4ee';c.fillRect(x,y,8,9);}});
const BC=[0xfff2e0,0xffd7b8,0xd8ecff,0xffe59a,0xf4c2c2,0xd6f0cf,0xe6dcff,0xf0f0f0],bmats=BC.map(c=>new THREE.MeshLambertMaterial({color:c,map:wT}));
const park=new Set();while(park.size<7)park.add(K.irand(0,NB-1)+','+K.irand(0,NB-1));park.delete('0,0');
for(let i=0;i<NB;i++)for(let j=0;j<NB;j++){const cx=(i+.5)*D,cz=(j+.5)*D;if(park.has(i+','+j)){K.box(44,.24,44,0x7fd08a,cx,.12,cz);for(let k=0;k<7;k++)K.tree(cx+K.rand(-18,18),cz+K.rand(-18,18),K.rand(1,1.8));continue;}
 K.box(44,.24,44,0xd9d3c4,cx,.12,cz);for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const h=K.rand(8,34),m=new THREE.Mesh(new THREE.BoxGeometry(18.6,h,18.6),K.pick(bmats));m.position.set(cx+a*9.5,h/2+.24,cz+b*9.5);m.castShadow=m.receiveShadow=true;scene.add(m);K.box(19,.6,19,K.pick([0xc0452c,0x5d6680,0x8a4a2e]),cx+a*9.5,h+.5,cz+b*9.5);}}
for(let i=0;i<8;i++)K.cloud(K.rand(-100,W+100),K.rand(80,120),K.rand(-100,W+100),K.rand(3,6));
const solid=(x,z)=>{const i=Math.floor(x/D),j=Math.floor(z/D);return i>=0&&j>=0&&i<NB&&j<NB&&!park.has(i+','+j)?[(i+.5)*D,(j+.5)*D]:null;};
function mkCar(col,kind){const g=new THREE.Group(),b=new THREE.Group();g.add(b);K.box(1.9,.55,4.2,col,0,.62,0,b);K.box(1.7,.5,2.1,kind==='pol'?0x1b3a8a:col,0,1.1,-.2,b);K.box(1.6,.38,2,0x9fd8ff,0,1.12,-.2,b).scale.set(1.04,1,.9);
 if(kind==='pol'){K.box(1.92,.2,1.2,0x1b3a8a,0,.7,1.2,b);const l1=new THREE.Mesh(new THREE.BoxGeometry(.5,.2,.3),new THREE.MeshBasicMaterial({color:0xff2030})),l2=new THREE.Mesh(new THREE.BoxGeometry(.5,.2,.3),new THREE.MeshBasicMaterial({color:0x2060ff}));l1.position.set(-.4,1.47,-.2);l2.position.set(.4,1.47,-.2);b.add(l1);b.add(l2);g.userData.l=[l1,l2];}
 for(const [x,z] of [[-.98,1.3],[.98,1.3],[-.98,-1.3],[.98,-1.3]])K.cyl(.38,.38,.3,0x16181f,x,.38,z,g,12).rotation.z=1.57;scene.add(g);return g;}
const marker=(col,txt)=>{const g=new THREE.Group(),c=new THREE.Mesh(new THREE.CylinderGeometry(5,5,7,24,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));c.position.y=3.5;g.add(c);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:K.tex(128,128,(x)=>{x.font='96px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,64,70);}),depthTest:false}));s.scale.set(7,7,1);s.position.y=11;g.add(s);scene.add(g);return g;};
// ----- estado
let mode='menu',me=null,cops=[],robs=[],civs=[],spots=[],hide=null,stars=0,loot=0,score=0,lives=3,bust=0,evade=0,timer=0,wave=1,eng=null,engG=null,sirT=0;
const car=(g,x,z,a,top)=>({g,x,z,a,sp:0,top,steer:0,hp:3,nx:0,nz:0,tx:x,tz:z,stuck:0});
const node=v=>K.clamp(Math.round(v/D),0,NB);
function clear(){for(const c of [me,...cops,...robs,...civs])if(c)scene.remove(c.g);for(const s of spots)scene.remove(s.g);if(hide)scene.remove(hide.g);cops=[];robs=[];civs=[];spots=[];hide=null;me=null;}
const SP=[['🏪',400,1,0xffd23f],['💎',900,1,0xff8ac0],['🏦',1600,2,0x3dffa2]];
function newSpot(s){const t=K.pick(SP);let i,j;do{i=K.irand(0,NB);j=K.irand(0,NB);}while(me&&Math.hypot(i*D-me.x,j*D-me.z)<70||(hide&&i===1&&j===1));if(s)scene.remove(s.g);const o=s||{};o.g=marker(t[3],t[0]);o.x=i*D;o.z=j*D;o.t=t;o.g.position.set(o.x,0,o.z);if(!s)spots.push(o);}
function addCop(){let i,j;do{i=K.irand(0,NB);j=K.irand(0,NB);}while(Math.hypot(i*D-me.x,j*D-me.z)<90);cops.push(car(mkCar(0xffffff,'pol'),i*D,j*D,0,me.top*(.9+stars*.025)));}
function start(m){clear();mode=m;const c=CARS[S.data.car];me=car(mkCar(m==='pol'?0xffffff:c[1],m==='pol'?'pol':''),D,D+8,0,m==='pol'?c[2]+3:c[2]);stars=0;loot=0;score=0;lives=3;bust=0;evade=0;wave=1;timer=120;
 for(let k=0;k<12;k++){const i=K.irand(0,NB),j=K.irand(0,NB),v=car(mkCar(K.pick([0x35d07f,0xff8a3d,0xffffff,0x8a93ad,0x2a8bff,0xf4c2c2])),i*D,j*D,0,10);v.ni=i;v.nj=j;pickCiv(v);civs.push(v);}
 if(m==='lad'){hide={g:marker(0x35d07f,'🏠'),x:D,z:D};hide.g.position.set(D,0,D);for(let k=0;k<3;k++)newSpot();}else spawnRobs();
 K.screen(null);K.play(true);K.useStick=true;K.pad([['Space','Travão de mão'],['KeyB','Travar']]);hud();engine(true);cam.position.set(me.x,6,me.z-10);K.flash(m==='lad'?'ASSALTA E FOGE!':'PRENDE OS LADRÕES!',m==='lad'?'Leva o dinheiro ao esconderijo 🏠':'Bate-lhes 3 vezes',1800,'#ffd23f');}
function spawnRobs(){for(let k=0;k<4;k++){let i,j;do{i=K.irand(0,NB);j=K.irand(0,NB);}while(Math.hypot(i*D-me.x,j*D-me.z)<100);const r=car(mkCar(K.pick([0x1b1b1b,0x7a1fa2,0x8a4a2e,0x444b5c])),i*D,j*D,0,me.top*(.8+wave*.035));r.ni=i;r.nj=j;robs.push(r);}}
function pickCiv(v){const o=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>v.ni+d[0]>=0&&v.ni+d[0]<=NB&&v.nj+d[1]>=0&&v.nj+d[1]<=NB&&!(d[0]===-v.dx&&d[1]===-v.dz)),d=K.pick(o);v.dx=d[0];v.dz=d[1];v.ni+=d[0];v.nj+=d[1];}
function engine(on){const ac=K.audio();if(!ac)return;if(on&&!eng){eng=ac.createOscillator();eng.type='sawtooth';const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=650;engG=ac.createGain();engG.gain.value=0;eng.connect(f);f.connect(engG);engG.connect(ac.destination);eng.start();}if(!on&&eng){try{eng.stop();}catch{}eng=null;engG=null;}}
function drive(c,thr,steer,hb,dt){const max=c.top,target=thr>0?max:thr<0?-8:0;if(c.sp<target)c.sp=Math.min(target,c.sp+12*dt);else c.sp=Math.max(target,c.sp-(thr<0||hb?26:7)*dt);c.steer=K.damp(c.steer,steer,10,dt);
 c.a-=steer*(hb?2.9:2.1)*Math.min(1,Math.abs(c.sp)/8)*(c.sp<0?-1:1)*dt;c.x+=Math.sin(c.a)*c.sp*dt;c.z+=Math.cos(c.a)*c.sp*dt;let hit=false;
 const s=solid(c.x,c.z)||solid(c.x+1.5,c.z)||solid(c.x-1.5,c.z)||solid(c.x,c.z+1.5)||solid(c.x,c.z-1.5);if(s){const dx=c.x-s[0],dz=c.z-s[1],px=BH+1.5-Math.abs(dx),pz=BH+1.5-Math.abs(dz);if(px>0&&pz>0){if(px<pz)c.x+=Math.sign(dx)*px;else c.z+=Math.sign(dz)*pz;if(Math.abs(c.sp)>9)hit=true;c.sp*=Math.pow(.05,dt);}}
 if(c.x<-6||c.x>W+6||c.z<-6||c.z>W+6){c.x=K.clamp(c.x,-6,W+6);c.z=K.clamp(c.z,-6,W+6);c.sp*=.9;}c.g.position.set(c.x,0,c.z);c.g.rotation.y=c.a;c.g.children[0].rotation.z=c.steer*.06*Math.min(1,c.sp/15);return hit;}
function chase(c,tx,tz,dt,flee){const d=Math.hypot(tx-c.x,tz-c.z),ni=node(c.x),nj=node(c.z);
 if(!c.has){c.has=1;c.tx=ni*D;c.tz=nj*D;c.pi=-9;}
 else if(Math.hypot(c.tx-c.x,c.tz-c.z)<6){let best=flee?-1:1e9,bx=ni,bz=nj;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const i=ni+a,j=nj+b;if(i<0||j<0||i>NB||j>NB||(flee&&i===c.pi&&j===c.pj))continue;const q=Math.hypot(i*D-tx,j*D-tz)+(flee?K.rand(0,30):0);if(flee?q>best:q<best){best=q;bx=i;bz=j;}}c.pi=ni;c.pj=nj;c.tx=bx*D;c.tz=bz*D;}
 let gx=c.tx,gz=c.tz;if(!flee&&d<36&&(Math.abs(tx-c.x)<8||Math.abs(tz-c.z)<8)){gx=tx;gz=tz;c.has=0;}
 const df=K.angDiff(c.a,Math.atan2(gx-c.x,gz-c.z)),st=K.clamp(-df*2.4,-1,1);let thr=Math.abs(df)>1.2&&c.sp>10?-.3:1;if(Math.abs(c.sp)<1.5)c.stuck+=dt;else c.stuck=0;if(c.stuck>1.2){thr=-1;if(c.stuck>2.2)c.stuck=0;}drive(c,thr,thr<0&&c.stuck>0?-st:st,false,dt);}
function bump(a,b){const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d>=2.6||d<.01)return 0;const p=(2.6-d)/2,nx=dx/d,nz=dz/d;a.x-=nx*p;a.z-=nz*p;b.x+=nx*p;b.z+=nz*p;const rel=Math.abs(a.sp-b.sp*Math.cos(K.angDiff(a.a,b.a)));const s=(a.sp+b.sp)/2;a.sp=K.lerp(a.sp,s,.4);b.sp=K.lerp(b.sp,s,.4);return rel;}
function hud(){K.hud(`<div class="k-tl" style="flex-direction:column;align-items:flex-start"><canvas id="mm" width="130" height="130" style="width:130px;height:130px;background:#0b1020b3;border-radius:14px;border:2px solid #ffffff2e"></canvas></div>
 <div class="k-tc">${mode==='lad'?'<div class="k-pill"><small>Procurado</small><b id="hs"></b></div>':'<div class="k-pill"><small>Tempo</small><b id="ht">2:00</b></div>'}</div>
 <div class="k-tr">${mode==='lad'?'<div class="k-pill"><small>No carro</small><b id="hl">0 €</b></div><div class="k-pill"><small>Guardado</small><b id="hb">0 €</b></div><div class="k-pill"><small>Vidas</small><b id="hv">♥♥♥</b></div>':'<div class="k-pill"><small>Presos</small><b id="hb">0</b></div><div class="k-pill"><small>Vaga</small><b id="hv">1</b></div>'}<div class="k-pill"><small>km/h</small><b id="hk">0</b></div></div><div class="k-bc"><div class="k-hint" id="hh"></div></div>`);}
function over(){const lad=mode==='lad';mode='end';engine(false);K.play(false);const key=lad?'bestL':'bestP',rec=score>S.data[key];if(rec)S.data[key]=score;const gain=lad?score:score*600;S.data.money+=gain;S.save();if(rec)K.sfx.win();else K.sfx.bad();
 if(lad&&score>=10000)K.unlock('pl-10k','Polícias e Ladrões · 10 000 € num só golpe de sorte');if(!lad&&score>=8)K.unlock('pl-8','Polícias e Ladrões · Oito ladrões na esquadra');
 K.screen(`<div class="k-title">${lad?'<em>'+score+' €</em> guardados':'<em>'+score+'</em> ladrões presos'}</div><div class="k-lead">${rec?'Novo recorde! ':''}Ganhaste ${gain} € para a garagem.</div><button class="k-go" data-a="r">Outra vez</button><button class="k-alt" data-a="m">Menu</button>`,{r:()=>start(lad?'lad':'pol'),m:menu});}
function menu(){mode='menu';engine(false);K.play(false);const d=S.data;
 K.screen(`<div class="k-title">Polícias e <em>Ladrões</em></div><div class="k-lead">Uma cidade inteira para fugir… ou para perseguir. Carteira: <b>${d.money} €</b></div>
 <button class="k-go" data-a="lad">🦹 Jogar de LADRÃO</button><button class="k-go" data-a="pol" style="background:#fff">🚓 Jogar de POLÍCIA</button>
 <div class="k-lab">Garagem</div><div class="k-row">${CARS.map((c,i)=>{const own=d.owned.includes(i);return `<button class="k-chip${d.car===i?' on':''}" data-a="car" data-v="${i}" ${own||d.money>=c[3]?'':'disabled'}>${c[0]}<small>${own?(d.car===i?'a usar':'usar'):c[3]+' €'} · ${Math.round(c[2]*3.6)} km/h</small></button>`;}).join('')}</div>
 <table class="k-tab"><tr><td>Recorde de ladrão</td><td>${d.bestL} €</td></tr><tr><td>Recorde de polícia</td><td>${d.bestP} presos</td></tr></table>${K.keysHelp([['W A S D','conduzir'],['ESPAÇO','travão de mão'],['P','pausa']])}`,
 {lad:()=>start('lad'),pol:()=>start('pol'),car:v=>{v=+v;if(!d.owned.includes(v)){d.money-=CARS[v][3];d.owned.push(v);K.sfx.coin();}d.car=v;S.save();menu();}});}
K.onQuit=menu;
function update(dt){if(mode==='menu'||mode==='end'){const t=K.time*.06;cam.position.set(W/2+Math.sin(t)*150,70,W/2+Math.cos(t)*150);cam.lookAt(W/2,0,W/2);K.sunFollow(W/2,W/2);return;}
 const ax=K.axis(),hb=K.down('Space'),thr=K.touch&&!K.down('KeyB')?(ax.y<-.6?-1:1):K.down('KeyB')?-1:ax.y>.2?1:ax.y<-.2?-1:0;
 if(drive(me,thr,ax.x,hb,dt)){K.sfx.hit();K.shake=.3;}
 for(const v of civs){const tx=v.ni*D+v.dz*-3.2,tz=v.nj*D+v.dx*3.2;if(Math.abs(tx-v.x)+Math.abs(tz-v.z)<3)pickCiv(v);v.a=Math.atan2(v.dx,v.dz);const sp=9*dt,dx=tx-v.x,dz=tz-v.z,d=Math.hypot(dx,dz)||1;v.x+=dx/d*Math.min(d,sp);v.z+=dz/d*Math.min(d,sp);v.sp=9;v.g.position.set(v.x,0,v.z);v.g.rotation.y=v.a;if(bump(me,v)>8){K.sfx.hit();K.shake=.25;}}
 const blink=Math.floor(K.time*6)%2;
 if(mode==='lad'){let near=1e9;for(const c of cops){chase(c,me.x,me.z,dt);const d=Math.hypot(c.x-me.x,c.z-me.z);near=Math.min(near,d);if(bump(me,c)>6){K.sfx.hit();K.shake=.3;}c.g.userData.l[0].visible=!!blink;c.g.userData.l[1].visible=!blink;}
  for(let i=0;i<cops.length;i++)for(let j=i+1;j<cops.length;j++)bump(cops[i],cops[j]);
  if(stars>0){if(near<4.2&&Math.abs(me.sp)<5){bust+=dt;if(bust>1.3){lives--;loot=0;stars=0;bust=0;for(const c of cops)scene.remove(c.g);cops=[];K.sfx.bad();K.shake=.5;K.flash('APANHADO!',lives>0?'Perdeste o dinheiro do carro':'',1500,'#ff6b6b');if(lives<=0){over();return;}me.x=D;me.z=D+8;me.sp=0;}}else bust=Math.max(0,bust-dt);
   if(near>75){evade+=dt;if(evade>6){evade=0;stars--;const far=cops.sort((a,b)=>Math.hypot(b.x-me.x,b.z-me.z)-Math.hypot(a.x-me.x,a.z-me.z))[0];if(far){scene.remove(far.g);cops.splice(cops.indexOf(far),1);}K.sfx.good();K.toast(stars?'Uma estrela a menos!':'Despistaste a polícia!');if(!stars){for(const c of cops)scene.remove(c.g);cops=[];}}}else evade=0;
   while(cops.length<stars)addCop();sirT-=dt;if(sirT<=0&&near<90){sirT=.7;K.tone(blink?660:880,.33,'square',.03*Math.min(1,40/near));}}
  for(const s of spots){s.g.rotation.y+=dt;if(Math.hypot(s.x-me.x,s.z-me.z)<5.5){loot+=s.t[1];stars=Math.min(5,stars+s.t[2]);K.sfx.coin();K.sfx.good();K.flash('+'+s.t[1]+' €',s.t[0]+' assalto!',900,'#ffd23f');newSpot(s);}}
  hide.g.rotation.y-=dt;if(loot>0&&Math.hypot(hide.x-me.x,hide.z-me.z)<5.5){if(near<40)K.$('hh').textContent='Despista primeiro a polícia!';else{score+=loot;K.flash('GUARDADO!','+'+loot+' €',1200,'#3dffa2');K.sfx.win();if(stars>=5)K.unlock('pl-5','Polícias e Ladrões · Fugiste com 5 estrelas');loot=0;stars=0;for(const c of cops)scene.remove(c.g);cops=[];}}
  else K.$('hh').textContent=loot?'Leva o dinheiro ao esconderijo 🏠'+(stars?' (longe da polícia)':''):'Procura um assalto: 🏪 💎 🏦';
  K.$('hs').innerHTML='<span style="color:#ffd23f">'+'★'.repeat(stars)+'</span><span style="opacity:.25">'+'★'.repeat(5-stars)+'</span>';K.$('hl').textContent=loot+' €';K.$('hb').textContent=score+' €';K.$('hv').textContent='♥'.repeat(lives);}
 else{timer-=dt;if(timer<=0){over();return;}me.g.userData.l[0].visible=!!blink;me.g.userData.l[1].visible=!blink;sirT-=dt;if(sirT<=0){sirT=.7;K.tone(blink?660:880,.33,'square',.02);}
  for(let i=robs.length-1;i>=0;i--){const r=robs[i];chase(r,me.x,me.z,dt,true);r.cd=(r.cd||0)-dt;if(bump(me,r)>5&&r.cd<=0){r.cd=.8;r.hp--;K.sfx.hit();K.shake=.4;K.burst(new THREE.Vector3(r.x,1,r.z),[0xffd23f,0xffffff],12,5,5,.6);if(r.hp<=0){scene.remove(r.g);robs.splice(i,1);score++;timer+=12;K.sfx.good();K.flash('PRESO!','+12 s',900,'#3dffa2');}else K.toast('Ladrão: falta'+(r.hp>1?'m ':' ')+r.hp+' toque'+(r.hp>1?'s':''));}}
  if(!robs.length){wave++;timer+=25;spawnRobs();K.flash('VAGA '+wave,'Ladrões mais rápidos',1300,'#ffd23f');}
  const tt=Math.ceil(timer);K.$('ht').textContent=Math.floor(tt/60)+':'+String(tt%60).padStart(2,'0');K.$('hb').textContent=score;K.$('hv').textContent=wave;K.$('hh').textContent='Bate nos carros dos ladrões (pontos vermelhos no mapa)';}
 K.$('hk').textContent=Math.round(Math.abs(me.sp)*3.6);if(engG){engG.gain.value=.03;eng.frequency.value=55+Math.abs(me.sp)*5.5;}
 const bx=me.x-Math.sin(me.a)*9,bz=me.z-Math.cos(me.a)*9;cam.position.x=K.damp(cam.position.x,bx,7,dt);cam.position.z=K.damp(cam.position.z,bz,7,dt);cam.position.y=K.damp(cam.position.y,4.6,5,dt);cam.lookAt(me.x+Math.sin(me.a)*5,1.2,me.z+Math.cos(me.a)*5);K.sunFollow(me.x,me.z);
 const mm=K.$('mm');if(mm){const c=mm.getContext('2d'),s=120/W,X=v=>5+v*s;c.clearRect(0,0,130,130);c.strokeStyle='#ffffff55';c.lineWidth=2;c.beginPath();for(let i=0;i<=NB;i++){c.moveTo(X(i*D),5);c.lineTo(X(i*D),125);c.moveTo(5,X(i*D));c.lineTo(125,X(i*D));}c.stroke();const dot=(o,col,r)=>{c.fillStyle=col;c.beginPath();c.arc(X(o.x),X(o.z),r,0,7);c.fill();};
  if(hide)dot(hide,'#35d07f',5);for(const sp of spots)dot(sp,'#ffd23f',4);for(const p of cops)dot(p,blink?'#ff3040':'#4f8dff',3.5);for(const r of robs)dot(r,'#ff3040',4);dot(me,'#fff',4);c.strokeStyle='#fff';c.beginPath();c.moveTo(X(me.x),X(me.z));c.lineTo(X(me.x)+Math.sin(me.a)*9,X(me.z)+Math.cos(me.a)*9);c.stroke();}}
const _sp=K.setPause;K.setPause=v=>{_sp(v);if(engG)engG.gain.value=K.paused?0:.03;};window.C30pause=f=>K.setPause(f===undefined?!K.paused:f);
K._dbg=()=>({sp:spots.map(s=>[s.x,s.z]),timer,mode,stars,loot,score,cops:cops.map(c=>[Math.round(Math.hypot(c.x-me.x,c.z-me.z)),+c.sp.toFixed(0)]),me:me&&[Math.round(me.x),Math.round(me.z)],robs:robs.length});K._test=o=>{Object.assign(me,o);};
K.loop(update);menu();
})();
