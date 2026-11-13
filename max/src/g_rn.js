// TITLE: Toca a Campainha
// Corrida de 3 faixas de casa até à escola antes do toque.
(()=>{'use strict';
const S=K.store('rn',{stars:[0,0,0,0,0],best:0,coins:0});
document.documentElement.style.setProperty('--kc','#3dffa2');
K.init({sky:0x9fdcff,fog:[60,150],fov:60,far:300,shadow:26,sunPos:[18,40,-12]});
const scene=K.scene,cam=K.camera,LX=[-2.3,0,2.3];
const DAYS=[['Segunda',480,10.5,17],['Terça',620,11.5,19],['Quarta',760,12.5,21],['Quinta',900,13.5,23],['Sexta',1050,14.5,25]];
// estrada que acompanha o jogador
const roadT=K.tex(256,256,(c,w,h)=>{c.fillStyle='#4a4f5c';c.fillRect(0,0,w,h);for(let i=0;i<900;i++){c.fillStyle=Math.random()<.5?'#525866':'#444955';c.fillRect(Math.random()*w,Math.random()*h,2,2);}c.fillStyle='#f2f2f2';for(const x of [84,170]){c.fillRect(x,20,4,100);}c.fillRect(4,0,5,h);c.fillRect(w-9,0,5,h);},[1,30]);
const road=new THREE.Mesh(new THREE.PlaneGeometry(7.6,240),new THREE.MeshLambertMaterial({map:roadT}));road.rotation.x=-Math.PI/2;road.receiveShadow=true;scene.add(road);
const walkT=K.tex(64,64,(c,w)=>{c.fillStyle='#d9d3c4';c.fillRect(0,0,w,w);c.strokeStyle='#bdb6a5';c.lineWidth=2;c.strokeRect(0,0,w,w);c.strokeRect(0,0,w/2,w/2);c.strokeRect(w/2,w/2,w/2,w/2);},[2,120]);
const walks=[-1,1].map(s=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(3.4,240),new THREE.MeshLambertMaterial({map:walkT}));m.rotation.x=-Math.PI/2;m.position.set(s*5.5,.08,0);m.receiveShadow=true;scene.add(m);K.box(.25,240,.16,0xb9b2a2,-s*1.7,0,0,m);return m;});
const grass=K.plane(400,400,0x6cc070,0,-.05,0);
const boy=K.person({shirt:0x2a8bff,shorts:0x1b2340,shoes:0xff3d5a});const pack=K.box(.42,.5,.2,0xff8a3d,0,1.1,-.24,boy);
const shieldM=new THREE.Mesh(new THREE.SphereGeometry(1.15,16,12),new THREE.MeshBasicMaterial({color:0x4fd0ff,transparent:true,opacity:.25}));shieldM.position.y=1;boy.add(shieldM);
// ----- mundo
let objs=[],deco=[],spawnZ=0,decoZ=0,nextSign=0;
const coinG=new THREE.CylinderGeometry(.34,.34,.08,14),coinM=new THREE.MeshLambertMaterial({color:0xffd23f,emissive:0x6b4a00});
function add(o){scene.add(o.m);objs.push(o);return o;}
function obstacle(type,lane,z){const g=new THREE.Group();g.position.set(LX[lane],0,z);const o={m:g,t:type,lane,z,len:.5,v:0};
 if(type==='cone'){K.cyl(.05,.3,.75,0xff7a2f,0,.38,0,g,10);K.cyl(.19,.23,.14,0xffffff,0,.42,0,g,10);K.box(.7,.06,.7,0xff7a2f,0,.03,0,g);K.cyl(.05,.3,.75,0xff7a2f,.7,.38,.2,g,10);K.box(.7,.06,.7,0xff7a2f,.7,.03,.2,g);g.position.x-=.35;o.h=.75;}
 else if(type==='bin'){K.box(.9,1.05,.8,0x2f9d57,0,.6,0,g);K.box(.96,.1,.86,0x237a43,0,1.15,0,g);K.cyl(.12,.12,.1,0x222222,-.4,.12,.3,g,8).rotation.z=1.57;K.cyl(.12,.12,.1,0x222222,.4,.12,.3,g,8).rotation.z=1.57;o.h=1.1;}
 else if(type==='bar'){K.box(.1,1.7,.1,0xdddddd,-1,.85,0,g);K.box(.1,1.7,.1,0xdddddd,1,.85,0,g);for(let i=0;i<5;i++)K.box(.42,.5,.12,i%2?0xffffff:0xe8352c,-.84+i*.42,1.45,0,g);o.h=9;o.low=1.15;}
 else if(type==='car'){const c=K.pick([0xe8352c,0x2a8bff,0xffffff,0xffd23f,0x35d07f,0x8a93ad]);K.box(1.75,.7,4,c,0,.65,0,g);K.box(1.6,.62,2.1,c,0,1.3,-.2,g);K.box(1.5,.45,2,0x9fd8ff,0,1.32,-.2,g).scale.set(1.08,1,.9);for(const [x,z2] of [[-.85,1.3],[.85,1.3],[-.85,-1.3],[.85,-1.3]])K.cyl(.36,.36,.25,0x16181f,x,.36,z2,g,10).rotation.z=1.57;o.h=9;o.len=2.1;}
 else if(type==='bike'){K.cyl(.36,.36,.06,0x222222,0,.36,.55,g,12).rotation.z=1.57;K.cyl(.36,.36,.06,0x222222,0,.36,-.55,g,12).rotation.z=1.57;K.box(.08,.08,1.1,0xe8352c,0,.7,0,g);const r=K.person({shirt:0xffd23f,shorts:0x222222,parent:g,s:.85});r.position.y=.25;r.rotation.y=Math.PI;K.pose(r,{legL:[.9],legR:[.3],armL:[-1],armR:[-1]});o.h=9;o.v=-7;o.len=.8;}
 return add(o);}
function coins(lane,z,n,arc){for(let i=0;i<n;i++){const m=new THREE.Mesh(coinG,coinM);m.rotation.z=Math.PI/2;const y=arc?1+Math.sin(i/(n-1)*Math.PI)*1.2:1;m.position.set(LX[lane],y,z+i*1.5);add({m,t:'coin',lane,z:z+i*1.5,y});}}
function power(kind,lane,z){const g=new THREE.Group();g.position.set(LX[lane],1.1,z);if(kind==='ima'){K.box(.2,.6,.2,0xe8352c,-.25,0,0,g);K.box(.2,.6,.2,0xe8352c,.25,0,0,g);K.box(.7,.2,.2,0xe8352c,0,.4,0,g);K.box(.2,.16,.2,0xffffff,-.25,-.36,0,g);K.box(.2,.16,.2,0xffffff,.25,-.36,0,g);}else{K.box(.6,.7,.3,0x4fd0ff,0,0,0,g);K.box(.4,.3,.1,0x2a8bff,0,-.1,.2,g);}add({m:g,t:kind,lane,z,y:1.1});}
function row(z,diff){const r=Math.random(),free=K.irand(0,2);
 if(r<.16){coins(K.irand(0,2),z,6,false);return;}
 const types=diff>.5?['cone','bin','bar','car','car','bike']:['cone','bin','bar','car','cone'];let blocked=0;
 for(let l=0;l<3;l++){if(l===free)continue;if(Math.random()<.45+diff*.4){obstacle(K.pick(types),l,z+K.rand(-1,1));blocked++;}}
 if(!blocked)obstacle(K.pick(types),(free+1)%3,z);
 const rr=Math.random();if(rr<.5)coins(free,z-3,5,false);else if(rr<.6){const t=K.pick(['cone','bin']);obstacle(t,free,z);coins(free,z-3,5,true);}
 else if(rr<.64)power(K.pick(['ima','mochila']),free,z);}
const HC=[0xfff2e0,0xffd7b8,0xbfe6ff,0xffe59a,0xf4b6c2,0xc9f0c0,0xffffff],RC=[0xc0452c,0x8a4a2e,0x5d6680,0xb5532f];
function house(z,s){const g=new THREE.Group(),w=K.rand(6,9),h=K.rand(3.5,7),d=K.rand(6,9);g.position.set(s*(8.2+w/2+K.rand(0,2)),0,z);K.box(w,h,d,K.pick(HC),0,h/2,0,g);K.box(w+.6,.5,d+.6,K.pick(RC),0,h+.25,0,g);K.box(1.1,2,.15,0x7a5234,-s*(w/2),1,K.rand(-1.5,1.5),g).rotation.y=1.57;
 for(let y=1.8;y<h-1;y+=2.4)for(const zz of [-d/3.4,d/3.4])K.box(.12,1,1,0x9fd8ff,-s*(w/2+.02),y+.3,zz,g);scene.add(g);deco.push({m:g,z});}
function decoRow(z){for(const s of [-1,1]){house(z,s);const r=Math.random();if(r<.4){const t=K.tree(s*(7.3),z+5,K.rand(.8,1.2));deco.push({m:t,z:z+5});}else if(r<.7){const g=new THREE.Group();g.position.set(s*4.3,0,z+5);K.cyl(.07,.09,4.2,0x5d6680,0,2.1,0,g,6);K.box(.9,.12,.25,0x5d6680,-s*.4,4.2,0,g);scene.add(g);deco.push({m:g,z:z+5});}}}
function sign(z,txt){const g=new THREE.Group();g.position.set(4.6,0,z);K.cyl(.06,.06,2.6,0x8a93ad,0,1.3,0,g,6);const m=new THREE.Mesh(new THREE.BoxGeometry(2.2,.9,.08),new THREE.MeshBasicMaterial({map:K.tex(256,96,(c,w,h)=>{c.fillStyle='#1b63c9';c.fillRect(0,0,w,h);c.strokeStyle='#fff';c.lineWidth=6;c.strokeRect(5,5,w-10,h-10);c.fillStyle='#fff';c.font='900 40px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,w/2,h/2+2,w-24);})}));m.position.y=2.7;m.rotation.y=Math.PI;g.add(m);scene.add(g);deco.push({m:g,z});}
let school=null;
function mkSchool(z){school=new THREE.Group();school.position.set(0,0,z+16);K.box(34,9,10,0xfff2e0,0,4.5,6,school);K.box(35,1,11,0xc0452c,0,9.5,6,school);for(let x=-14;x<=14;x+=4)for(const y of [2.6,6.2])K.box(2.2,1.6,.2,0x9fd8ff,x,y,.95,school);K.box(4,3.4,.3,0x7a5234,0,1.7,.95,school);
 const b=new THREE.Mesh(new THREE.BoxGeometry(14,1.8,.3),new THREE.MeshBasicMaterial({map:K.tex(512,64,(c,w,h)=>{c.fillStyle='#1b2340';c.fillRect(0,0,w,h);c.fillStyle='#ffd23f';c.font='900 40px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('ESCOLA VALE VERDE',w/2,34);})}));b.position.set(0,8,.9);school.add(b);
 for(const s of [-1,1]){K.box(.5,3,.5,0xdddddd,s*4.2,1.5,-12,school);K.box(12,1.6,.2,0x8a93ad,s*10.4,.8,-12,school);}K.box(9,.5,.4,0x35d07f,0,3.2,-12,school);K.box(40,.1,26,0xd9d3c4,0,.06,-2,school);
 for(let i=0;i<7;i++){const p=K.person({shirt:K.pick([0xe8352c,0xffd23f,0x35d07f,0xb46bff,0xffffff]),parent:school});p.position.set(K.rand(-12,12),.06,K.rand(-9,-1));p.rotation.y=K.rand(6.28);}scene.add(school);}
function clearWorld(){for(const o of objs)scene.remove(o.m);for(const d of deco)scene.remove(d.m);objs=[];deco=[];if(school){scene.remove(school);school=null;}}
// ----- estado
let state='menu',day=0,endless=false,z=0,sp=0,maxSp=17,lane=1,x=0,y=0,vy=0,slide=0,stumble=0,inv=0,clock=0,dist=0,got=0,magnet=0,shield=false,goal=0,runT=0,finT=0;
function start(d,inf){clearWorld();day=d;endless=inf;const D=DAYS[d]||DAYS[4];goal=inf?1e9:D[1];maxSp=inf?26:D[3];sp=inf?12:D[2];z=0;lane=1;x=0;y=0;vy=0;slide=0;stumble=0;inv=0;dist=0;got=0;magnet=0;shield=false;runT=0;
 clock=inf?0:Math.round(goal/((D[2]+D[3])/2)*1.16);spawnZ=38;decoZ=-10;nextSign=inf?1e9:Math.ceil((goal-100)/100)*100;if(!inf){mkSchool(goal);for(let r=100;goal-r>60;r+=100)sign(goal-r,'ESCOLA '+r+' m');}state='run';K.screen(null);K.play(true);K.pad([['Space','Saltar'],['KeyS','Deslizar']]);
 K.hud(`<div class="k-tl"><div class="k-pill"><small>${inf?'Recreio sem fim':D[0]+'-feira'}</small><b id="hc">0:00</b></div></div><div class="k-tr"><div class="k-pill"><small>Cromos</small><b id="hg">0</b></div><div class="k-pill" id="hpw" style="display:none"></div></div><div class="k-tc"><div class="k-meter" style="width:min(300px,46vw);height:14px"><i id="hb" style="width:0;background:#3dffa2"></i></div></div>`);
 K.flash(inf?'CORRE!':'A CAMPAINHA TOCA EM '+clock+' s','',1500,'#ffd23f');K.sfx.whistle();}
function menu(){state='menu';goal=1e9;K.play(false);clearWorld();z=0;spawnZ=20;decoZ=-10;x=0;y=0;lane=1;
 K.screen(`<div class="k-title">Toca a <em>Campainha</em></div><div class="k-lead">Sais de casa atrasado. Chega à Escola Vale Verde antes do toque!</div>
 <div class="k-lab">A semana</div><div class="k-row">${DAYS.map((d,i)=>{const open=i===0||S.data.stars[i-1]>0;return `<button class="k-chip" data-a="day" data-v="${i}" ${open?'':'disabled'}>${d[0]}<small>${open?'★'.repeat(S.data.stars[i])+'☆'.repeat(3-S.data.stars[i]):'🔒'}</small></button>`;}).join('')}</div>
 <button class="k-go" data-a="inf">♾️ Recreio sem fim</button><table class="k-tab"><tr><td>Recorde sem fim</td><td>${S.data.best} m</td></tr><tr><td>Cromos apanhados</td><td>${S.data.coins}</td></tr></table>
 ${K.keysHelp([['A D','mudar de faixa'],['W ESPAÇO','saltar'],['S','deslizar'],['P','pausa']])}<div class="k-keys">No telemóvel: desliza o dedo para os lados, para cima e para baixo.</div>`,{day:v=>start(+v,false),inf:()=>start(4,true)});}
K.onQuit=menu;
function hit(o){if(inv>0)return;if(shield){shield=false;inv=1.2;K.sfx.hit();K.flash('A MOCHILA SALVOU-TE','',800,'#4fd0ff');scene.remove(o.m);o.dead=true;return;}
 K.sfx.hit();K.shake=.5;K.burst(new THREE.Vector3(x,1,z+.5),[0xffffff,0xffd23f],14,4,5,.6);
 if(endless){over();return;}stumble=.9;inv=1.6;sp=Math.max(5,sp*.4);K.flash('AI!','',600,'#ff6b6b');}
function over(){state='over';K.play(false);const d=Math.floor(dist),rec=d>S.data.best;if(rec)S.data.best=d;S.data.coins+=got;S.save();if(d>=1500)K.unlock('rn-1500','Campainha · 1500 m sem tropeçar');if(rec)K.sfx.win();else K.sfx.bad();
 K.screen(`<div class="k-title"><em>${d} m</em></div><div class="k-lead">${rec?'Novo recorde!':'Recorde: '+S.data.best+' m'} · ${got} cromos</div><button class="k-go" data-a="r">Outra vez</button><button class="k-alt" data-a="m">Menu</button>`,{r:()=>start(4,true),m:menu});}
function arrive(){state='fin';finT=0;K.sfx.cheer();K.sfx.win();K.confetti(new THREE.Vector3(0,3,z+6));}
function endDay(ok){state='over';K.play(false);S.data.coins+=got;let st=0;if(ok){st=clock>goal/maxSp*.22?3:clock>goal/maxSp*.1?2:1;if(st>S.data.stars[day])S.data.stars[day]=st;if(day===4)K.unlock('rn-sexta','Campainha · Semana completa sem faltas');if(S.data.stars.every(v=>v===3))K.unlock('rn-3x5','Campainha · Aluno exemplar (15 estrelas)');}else K.sfx.bad();S.save();
 K.screen(ok?`<div class="k-title"><em>${'★'.repeat(st)}${'☆'.repeat(3-st)}</em></div><div class="k-lead">Chegaste com ${Math.ceil(clock)} s de avanço e ${got} cromos.</div>${day<4?'<button class="k-go" data-a="n">Dia seguinte</button>':''}<button class="k-alt" data-a="r">Repetir</button><button class="k-alt" data-a="m">Menu</button>`
  :`<div class="k-title">Tocou! 🔔</div><div class="k-lead">Faltavam ${Math.max(1,Math.floor(goal-dist))} m. Levaste falta de atraso…</div><button class="k-go" data-a="r">Tentar outra vez</button><button class="k-alt" data-a="m">Menu</button>`,{n:()=>start(day+1,false),r:()=>start(day,false),m:menu});}
// gestos
let tsx=0,tsy=0,tsOn=false;const cv=K.renderer.domElement;
cv.addEventListener('touchstart',e=>{const t=e.changedTouches[0];tsx=t.clientX;tsy=t.clientY;tsOn=true;},{passive:true});
cv.addEventListener('touchmove',e=>{if(!tsOn)return;const t=e.changedTouches[0],dx=t.clientX-tsx,dy=t.clientY-tsy;if(Math.abs(dx)>32||Math.abs(dy)>32){tsOn=false;if(Math.abs(dx)>Math.abs(dy))act(dx>0?'r':'l');else act(dy<0?'u':'d');}},{passive:true});
function act(a){if(state!=='run'||stumble>0||K.paused)return;if(a==='l'&&lane>0){lane--;K.sfx.whoosh();}if(a==='r'&&lane<2){lane++;K.sfx.whoosh();}if(a==='u'&&y<=.01){vy=8.2;slide=0;K.tone(300,.15,'sine',.12,600);}if(a==='d'){if(y>.01)vy=-14;else{slide=.65;K.noise(.3,.1,600);}}}
function update(dt){const P=boy.userData.P;
 if(state==='menu'||state==='over'){z+=dt*4;runT+=dt*8;K.walk(boy,runT,.6);boy.rotation.set(0,0,0);boy.position.set(0,0,z);cam.position.set(4,2.6,z+5.5);cam.lookAt(0,1.2,z);}
 else if(state==='fin'){finT+=dt;z+=dt*Math.max(0,5-finT*2.4);boy.position.set(x,Math.abs(Math.sin(finT*7))*.5,z);K.pose(boy,{armL:[-2.8,0,-.3],armR:[-2.8,0,.3]});cam.position.x=K.damp(cam.position.x,5,2,dt);cam.position.y=K.damp(cam.position.y,2.4,2,dt);cam.position.z=K.damp(cam.position.z,z+6,2,dt);cam.lookAt(x,1.2,z);if(finT>3)endDay(true);}
 else{if(K.hit('KeyA','ArrowLeft'))act('l');if(K.hit('KeyD','ArrowRight'))act('r');if(K.hit('KeyW','ArrowUp','Space'))act('u');if(K.hit('KeyS','ArrowDown'))act('d');
  sp=Math.min(maxSp,sp+dt*(stumble>0?0:endless?.22:.5+(maxSp-sp)*.25));if(stumble>0)stumble-=dt;if(inv>0)inv-=dt;if(magnet>0)magnet-=dt;if(slide>0)slide-=dt;
  z+=sp*dt;dist=z;runT+=dt*sp*.75;x=K.damp(x,LX[lane],16,dt);vy-=24*dt;y+=vy*dt;if(y<=0){if(vy<-6)K.sfx.bounce(.4);y=0;vy=0;}
  if(endless)clock+=dt;else{const c0=Math.ceil(clock);clock-=dt;const c1=Math.ceil(clock);if(c1!==c0&&c1<=5&&c1>0)K.sfx.tick();if(clock<=0){K.sfx.horn();endDay(false);return;}}
  // gerar
  const diff=endless?Math.min(1,dist/1500):.2+day*.17;while(spawnZ<z+130&&spawnZ<goal-30){row(spawnZ,diff);spawnZ+=K.rand(13,19)+sp*.35;}
  
  // objetos
  for(const o of objs){if(o.dead)continue;if(o.v){o.z+=o.v*dt;o.m.position.z=o.z;}const dz=o.z-z;
   if(o.t==='coin'||o.t==='ima'||o.t==='mochila'){o.m.rotation.y+=dt*5;if(magnet>0&&o.t==='coin'&&dz<9&&dz>-1){o.m.position.x=K.damp(o.m.position.x,x,9,dt);o.m.position.y=K.damp(o.m.position.y,y+1,9,dt);o.z=K.damp(o.z,z,7,dt);o.m.position.z=o.z;}
    if(Math.abs(dz)<.9&&Math.abs(o.m.position.x-x)<.9&&Math.abs(o.m.position.y-(y+1))<1.1){o.dead=true;scene.remove(o.m);if(o.t==='coin'){got++;K.sfx.coin();}else if(o.t==='ima'){magnet=8;K.sfx.good();K.flash('ÍMAN!','',700,'#ff6b6b');}else{shield=true;K.sfx.good();K.flash('MOCHILA-ESCUDO','',700,'#4fd0ff');}}}
   else if(Math.abs(dz)<o.len+.35&&Math.abs(LX[o.lane]-x)<1){if(o.low){if(slide<=0)hit(o);}else if(y<o.h-.12)hit(o);if(state!=='run')return;}}
  if(z>goal){arrive();return;}
  // boneco
  boy.position.set(x,y,z);boy.rotation.z=(LX[lane]-x)*-.12;boy.visible=inv<=0||Math.floor(K.time*14)%2===0;shieldM.visible=shield;
  if(slide>0&&y<=.01){boy.rotation.x=-1.25;boy.position.y=.25;K.pose(boy,{legL:[1.2],legR:[.9],armL:[.5],armR:[.5]});}
  else{boy.rotation.x=stumble>0?.5:.12;if(y>.05)K.pose(boy,{legL:[.9],legR:[-.5],armL:[-2.4],armR:[-2.4]});else K.walk(boy,runT,1.15);}
  cam.position.x=K.damp(cam.position.x,x*.55,8,dt);cam.position.y=K.damp(cam.position.y,3.5+y*.3,6,dt);cam.position.z=z-6.2;cam.lookAt(x*.6,1.5,z+7);
  const hc=K.$('hc');if(hc){const c=Math.max(0,Math.ceil(clock));hc.textContent=Math.floor(c/60)+':'+String(c%60).padStart(2,'0');hc.style.color=!endless&&clock<6?'#ff6b6b':'';K.$('hg').textContent=got;K.$('hb').style.width=(endless?(dist%500)/5:dist/goal*100)+'%';const pw=K.$('hpw');pw.style.display=magnet>0||shield?'block':'none';pw.textContent=(magnet>0?'🧲 '+Math.ceil(magnet)+'s ':'')+(shield?'🎒':'');if(endless)hc.textContent=Math.floor(dist)+' m';}}
 // cenário
 road.position.set(0,0,z+90);roadT.offset.y=-(z/8)%1;walks.forEach(w=>{w.position.z=z+90;w.material.map.offset.y=-(z/2)%1;});grass.position.z=z+60;K.sunFollow(0,z+8);
 while(decoZ<z+150&&decoZ<goal-4){decoRow(decoZ);decoZ+=K.rand(10,12.5);}
 for(let i=objs.length-1;i>=0;i--){const o=objs[i];if(o.dead||o.z<z-12){scene.remove(o.m);objs.splice(i,1);}}
 for(let i=deco.length-1;i>=0;i--)if(deco[i].z<z-22){scene.remove(deco[i].m);deco.splice(i,1);}}
K.loop(update);menu();
})();
