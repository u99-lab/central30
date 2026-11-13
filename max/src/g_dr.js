// TITLE: Arrancadas da Marginal
// Corridas de arranque (402 m): rotações na partida, mudanças no ponto certo, nitro, garagem e 8 rivais.
(()=>{'use strict';
const S=K.store('dr',{money:500,car:0,owned:[0],up:{m:0,c:0,n:0,p:0},lvl:0,best:0});
document.documentElement.style.setProperty('--kc','#ff3d5a');
K.init({sky:0x0b1030,fog:[80,330],fov:58,far:700,shadow:30,hemi:.55,sunI:.45,sunColor:0x9fb4ff,sunPos:[20,50,-20]});
const scene=K.scene,cam=K.camera,LEN=402;
const CARS=[['Gazela GTi',0xe8352c,1,0],['Falcon GT',0x2a8bff,1.2,3000],['Aurora Racer',0xffd23f,1.42,9000],['Relâmpago X',0xb46bff,1.66,22000]];
const RIV=[['Rui',.84,0x35d07f],['Bia',.95,0xff8ac0],['Isaac',1.06,0xffffff],['Mika',1.2,0xff8a3d],['Bruno',1.36,0x2a8bff],['Rafa',1.54,0x1b1b1b],['Stôr Paulo',1.76,0xc0c0c0],['O Patrão',2.02,0xffd23f]];
const UPS=[['m','Motor','+8% de força'],['c','Caixa','mudanças mais rápidas'],['n','Nitro','+0,5 s de nitro'],['p','Pneus','melhor arranque']];
const GR=[1,.66,.47,.36,.29,.24],VM=[15,26,38,51,65,82];
// ----- cenário
const roadT=K.tex(256,256,(c,w,h)=>{c.fillStyle='#2b2f3a';c.fillRect(0,0,w,h);for(let i=0;i<800;i++){c.fillStyle=Math.random()<.5?'#323744':'#262a34';c.fillRect(Math.random()*w,Math.random()*h,2,2);}c.fillStyle='#fff';c.fillRect(6,0,5,h);c.fillRect(w-11,0,5,h);c.fillStyle='#ffd23f';c.fillRect(125,0,6,h*.55);},[1,70]);
const road=new THREE.Mesh(new THREE.PlaneGeometry(14,700),new THREE.MeshLambertMaterial({map:roadT}));road.rotation.x=-Math.PI/2;road.position.z=250;road.receiveShadow=true;scene.add(road);
K.plane(900,900,0x141a33,0,-.05,250);K.plane(300,900,0x0d2c52,-190,-.03,250);K.plane(26,900,0x8f7f5a,-27,-.04,250);
const winT=K.tex(64,64,(c,w)=>{c.fillStyle='#1a2040';c.fillRect(0,0,w,w);for(let y=6;y<w;y+=14)for(let x=5;x<w;x+=13){c.fillStyle=Math.random()<.5?'#ffe9a0':'#262d52';c.fillRect(x,y,7,8);}},[2,3]),bm=new THREE.MeshBasicMaterial({map:winT});
for(let z=-40;z<620;z+=22){const h=K.rand(10,34),b=new THREE.Mesh(new THREE.BoxGeometry(16,h,16),bm);b.position.set(24+K.rand(0,8),h/2,z);scene.add(b);}
for(let z=-20;z<600;z+=24){for(const s of [-1,1]){K.cyl(.1,.14,7,0x8a93ad,s*8.4,3.5,z,null,6);const l=new THREE.Mesh(new THREE.SphereGeometry(.5,8,6),new THREE.MeshBasicMaterial({color:0xfff0b0}));l.position.set(s*7.6,7,z);scene.add(l);const p=new THREE.Mesh(new THREE.CircleGeometry(5,14),new THREE.MeshBasicMaterial({color:0xfff0b0,transparent:true,opacity:.12,depthWrite:false}));p.rotation.x=-Math.PI/2;p.position.set(s*5,.03,z);scene.add(p);}if(z%48===4)K.palm(-13,z+10,1.3);}
for(let i=0;i<70;i++){const st=new THREE.Mesh(new THREE.SphereGeometry(.8,5,4),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}));st.position.set(K.rand(-400,400),K.rand(90,260),K.rand(100,650));scene.add(st);}
const banner=(z,txt,col)=>{for(const s of [-1,1])K.cyl(.25,.25,7,0xdddddd,s*8,3.5,z,null,8);const b=new THREE.Mesh(new THREE.BoxGeometry(17,1.6,.4),new THREE.MeshBasicMaterial({map:K.tex(512,64,(c,w,h)=>{c.fillStyle=col;c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='900 42px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,w/2,35);})}));b.position.set(0,6.6,z);scene.add(b);};
banner(0,'ARRANCADAS DA MARGINAL','#e8352c');banner(LEN,'META · 402 m','#1b2340');
const chk=new THREE.Mesh(new THREE.PlaneGeometry(14,3),new THREE.MeshBasicMaterial({map:K.tex(128,32,(c)=>{for(let x=0;x<16;x++)for(let y=0;y<4;y++){c.fillStyle=(x+y)%2?'#111':'#fff';c.fillRect(x*8,y*8,8,8);}})}));chk.rotation.x=-Math.PI/2;chk.position.set(0,.03,LEN);scene.add(chk);
const fans=[];for(let i=0;i<26;i++){const p=K.person({shirt:K.pick([0xffd23f,0x35d07f,0x2a8bff,0xff8ac0,0xffffff,0xff8a3d])});p.position.set((i%2?1:-1)*(9.5+K.rand(0,2)),0,K.rand(-6,26));p.rotation.y=(i%2?-1:1)*1.57;fans.push(p);}
function mkCar(col,tier){const g=new THREE.Group(),b=new THREE.Group();g.add(b);K.box(1.9,.5,4.3,col,0,.62,0,b);K.box(1.7,.48,2,col,0,1.08,-.3,b);K.box(1.6,.36,1.9,0x0b1020,0,1.1,-.3,b).scale.set(1.04,1,.92);K.box(1.9,.12,.5,0x16181f,0,.42,2.15,b);
 if(tier>0)K.box(1.9,.1,.5,0x16181f,0,1.25+tier*.06,-2,b);if(tier>1)K.box(.9,.12,1.3,0x16181f,0,.9,1.2,b);for(const s of [-1,1]){const h=new THREE.Mesh(new THREE.BoxGeometry(.4,.16,.06),new THREE.MeshBasicMaterial({color:0xfff6c0}));h.position.set(s*.62,.7,2.16);b.add(h);const t=new THREE.Mesh(new THREE.BoxGeometry(.5,.14,.06),new THREE.MeshBasicMaterial({color:0xff2030}));t.position.set(s*.6,.75,-2.16);b.add(t);}
 const w=[];for(const [x,z] of [[-.98,1.35],[.98,1.35],[-.98,-1.35],[.98,-1.35]]){const m=K.cyl(.4,.4,.34,0x101217,x,.4,z,g,14);m.rotation.z=1.57;w.push(m);}g.userData={b,w};scene.add(g);return g;}
// ----- estado
let state='menu',me=null,foe=null,T=0,lightT=0,green=false,result=null;
const mkR=(g,pw,x,ai)=>({g,pw,x,ai,z:0,v:0,gear:0,rpm:0,shiftT:0,spin:0,nitro:0,nitroLeft:1,t:0,done:0,rev:0,react:-1,aiL:K.rand(.5,.9),aiS:K.rand(.86,.97)});
const power=()=>9*CARS[S.data.car][2]*(1+.08*S.data.up.m);
const torque=r=>r>1?0:r<.25?.6:1-Math.pow((r-.78)/.78,2)*.85;
function setup(){if(me){scene.remove(me.g);scene.remove(foe.g);}const r=RIV[Math.min(S.data.lvl,7)];me=mkR(mkCar(CARS[S.data.car][1],S.data.car),power(),-3.4,false);foe=mkR(mkCar(r[2],Math.min(3,S.data.lvl>>1)),9*r[1],3.4,true);for(const c of [me,foe])c.g.position.set(c.x,0,0);}
function start(){setup();state='stage';T=0;lightT=K.rand(3.2,4.6);green=false;result=null;K.screen(null);K.play(true);K.pad([['KeyW','Acelerar'],['Space','Mudança'],['KeyN','Nitro']]);
 K.hud(`<div class="k-tc" style="flex-direction:column"><div class="k-pill" style="display:flex;gap:10px;padding:10px 16px" id="lt">${'<i style="width:22px;height:22px;border-radius:50%;background:#333;display:block"></i>'.repeat(4)}</div><div class="k-pill" style="min-width:230px;position:relative;height:26px;padding:0"><i id="p1" style="position:absolute;top:3px;width:18px;height:8px;border-radius:4px;background:#ff3d5a;left:0"></i><i id="p2" style="position:absolute;bottom:3px;width:18px;height:8px;border-radius:4px;background:#fff;left:0"></i></div></div>
 <div class="k-tl"><div class="k-pill"><small>Contra</small><b>${RIV[Math.min(S.data.lvl,7)][0]}</b></div></div><div class="k-tr"><div class="k-pill"><small>km/h</small><b id="kv" style="font-size:30px">0</b></div><div class="k-pill"><small>Mudança</small><b id="kg" style="font-size:30px">N</b></div><div class="k-pill"><small>Nitro</small><b id="kn">●</b></div></div>
 <div class="k-bc" style="flex-direction:column"><div class="k-meter" style="width:min(520px,80vw);height:26px"><u style="left:86%;width:11%"></u><u id="lz" style="left:60%;width:18%;background:#4fd0ff44;border-color:#4fd0ff"></u><i id="rp" style="width:0"></i></div><div class="k-hint" id="kh">Mantém ACELERAR com as rotações na zona azul até ficar verde</div></div>`);}
function step(c,dt,thr){if(c.done)return c.v=Math.max(0,c.v-18*dt),c.z+=c.v*dt;if(!green){c.rev=K.clamp(c.rev+(thr?1.1:-1.6)*dt+(thr?Math.sin(K.time*23)*.02:0),0,1);c.rpm=c.rev;return;}
 c.t+=dt;if(c.react<0&&thr)c.react=c.t;const tyre=c.ai?.1:S.data.up.p*.035;
 if(c.react>=0&&!c.launched){c.launched=true;const q=c.rev;if(q>=.6-tyre&&q<=.78+tyre){c.v=4;if(!c.ai){K.flash('ARRANQUE PERFEITO!','',700,'#4fd0ff');K.unlock('dr-start','Arrancadas · Arranque perfeito');}}else if(q>.78+tyre){c.spin=1.1-tyre*4;if(!c.ai)K.flash('A PATINAR!','',700,'#ff8a3d');}else{c.v=.5;if(!c.ai)K.flash('ARRANQUE FRACO','',700,'#ff6b6b');}}
 if(!c.launched)return;const top=VM[c.gear]*(1+.03*(c.ai?1:S.data.up.c));c.rpm=c.v/top;if(c.shiftT>0){c.shiftT-=dt;}else if(thr){let a=c.pw*GR[c.gear]*torque(c.rpm);if(c.spin>0){c.spin-=dt;a*=.45;}if(c.nitro>0){c.nitro-=dt;a=a*1.5+3;}c.v+=a*dt;}c.v=Math.max(0,c.v-(.0005*c.v*c.v+(thr?0:2))*dt);if(c.rpm>1.02)c.v=top*1.0;
 c.z+=c.v*dt;if(c.z>=LEN){c.done=c.t;}}
function shift(c){if(!c.launched||c.gear>=5||c.shiftT>0||c.done)return;const r=c.rpm;c.gear++;c.shiftT=c.ai?.15:.2-.03*S.data.up.c;if(!c.ai){if(r>=.86&&r<=.985){c.v+=.9;K.flash('PERFEITA!','',450,'#3dffa2');K.tone(900,.08,'square',.1,1300);}else if(r<.7){c.v*=.96;K.flash('CEDO DEMAIS','',450,'#ff8a3d');}else K.tone(500,.06,'square',.08);}}
let eng=null,engG=null;function engine(on){const ac=K.audio();if(!ac)return;if(on&&!eng){eng=ac.createOscillator();eng.type='sawtooth';const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=900;engG=ac.createGain();engG.gain.value=0;eng.connect(f);f.connect(engG);engG.connect(ac.destination);eng.start();}if(!on&&eng){try{eng.stop();}catch{}eng=null;engG=null;}}
function finish(){state='end';engine(false);K.play(false);const win=me.done&&(!foe.done||me.done<foe.done),lvl=Math.min(S.data.lvl,7),prize=win?Math.round(300*Math.pow(lvl+1,1.5)):60+lvl*30;S.data.money+=prize;if(!S.data.best||me.done<S.data.best)S.data.best=+me.done.toFixed(3);
 if(win){K.sfx.win();if(S.data.lvl<8)S.data.lvl++;if(lvl===7)K.unlock('dr-patrao','Arrancadas · Ganhaste ao Patrão');if(me.done<9)K.unlock('dr-9','Arrancadas · 402 m em menos de 9 segundos');}else K.sfx.bad();S.save();
 K.screen(`<div class="k-title">${win?'<em>GANHASTE!</em>':'Perdeste…'}</div><div class="k-lead">+${prize} €</div><table class="k-tab"><tr class="me"><td>Tu</td><td>${me.done.toFixed(3)} s</td></tr><tr><td>${RIV[lvl][0]}</td><td>${foe.done?foe.done.toFixed(3)+' s':'—'}</td></tr><tr><td>Tempo de reação</td><td>${me.react.toFixed(3)} s</td></tr></table><button class="k-go" data-a="go">${win&&lvl<7?'Próximo rival':'Correr outra vez'}</button><button class="k-alt" data-a="m">Garagem</button>`,{go:start,m:menu});}
function menu(){state='menu';engine(false);K.play(false);setup();const d=S.data,lvl=Math.min(d.lvl,7),cost=k=>Math.round(400*Math.pow(1.9,d.up[k]));
 K.screen(`<div class="k-title">Arrancadas da <em>Marginal</em></div><div class="k-lead">402 metros, dois carros, uma luz verde. Carteira: <b>${d.money} €</b></div>
 <button class="k-go" data-a="go">🏁 Correr contra ${RIV[lvl][0]} ${d.lvl>=8?'(campeão!)':'· '+(lvl+1)+'/8'}</button>
 <div class="k-lab">Carros</div><div class="k-row">${CARS.map((c,i)=>{const own=d.owned.includes(i);return `<button class="k-chip${d.car===i?' on':''}" data-a="car" data-v="${i}" ${own||d.money>=c[3]?'':'disabled'}>${c[0]}<small>${own?(d.car===i?'a usar':'usar'):c[3]+' €'}</small></button>`;}).join('')}</div>
 <div class="k-lab">Melhorias</div><div class="k-row">${UPS.map(u=>`<button class="k-chip" data-a="up" data-v="${u[0]}" ${d.up[u[0]]>=5||d.money<cost(u[0])?'disabled':''}>${u[1]} ${'▮'.repeat(d.up[u[0]])}${'▯'.repeat(5-d.up[u[0]])}<small>${d.up[u[0]]>=5?'máximo':cost(u[0])+' € · '+u[2]}</small></button>`).join('')}</div>
 <table class="k-tab"><tr><td>Melhor tempo</td><td>${d.best?d.best.toFixed(3)+' s':'—'}</td></tr></table>${K.keysHelp([['W','acelerar'],['ESPAÇO','subir mudança no verde'],['N','nitro'],['P','pausa']])}`,
 {go:start,car:v=>{v=+v;if(!d.owned.includes(v)){d.money-=CARS[v][3];d.owned.push(v);K.sfx.coin();}d.car=v;S.save();menu();},up:v=>{d.money-=cost(v);d.up[v]++;S.save();K.sfx.coin();menu();}});}
K.onQuit=menu;
function update(dt){fans.forEach((f,i)=>{f.position.y=state==='race'||state==='end'?Math.abs(Math.sin(K.time*8+i))*.25:0;});
 if(state==='menu'||state==='end'){const t=K.time*.3;if(state==='menu'){cam.position.set(-3.4+Math.sin(t)*7,2.2,Math.cos(t)*7);cam.lookAt(-3.4,.8,0);}else{step(me,dt,false);step(foe,dt,false);place(dt);}return;}
 const thr=K.down('KeyW','ArrowUp');T+=dt;
 if(state==='stage'){const n=Math.min(3,Math.floor(T/(lightT/4)));const L=K.$('lt');if(L){[...L.children].forEach((e,i)=>e.style.background=i<n&&i<3?'#ffb020':'#333');}if(K.time%.5<dt&&n<3)K.sfx.tick();
  if(T>=lightT){green=true;state='race';engine(true);const L2=K.$('lt');if(L2){[...L2.children].forEach((e,i)=>e.style.background=i===3?'#3dffa2':'#333');}K.tone(880,.4,'square',.12);K.$('kh').textContent='Sobe de mudança (ESPAÇO) quando a barra chega ao verde';K.$('lz').style.display='none';}}
 step(me,dt,thr);if(K.hit('Space','ArrowRight','KeyE'))shift(me);if(K.hit('KeyN','ShiftLeft')&&me.launched&&me.nitroLeft>0&&!me.done){me.nitroLeft=0;me.nitro=1.8+.5*S.data.up.n;K.sfx.boost();K.flash('NITRO!','',600,'#4fd0ff');}
 // rival
 const fthr=green&&foe.t+dt>(.25+(1-foe.aiL)*.3)||!green;if(!green)foe.rev=K.clamp(foe.aiL*.75+Math.sin(K.time*6)*.05,0,1);step(foe,dt,green?fthr:false);if(!green)foe.rpm=foe.rev;if(foe.launched&&foe.rpm>=foe.aiS){shift(foe);foe.aiS=K.rand(.84,.98);}if(foe.launched&&foe.nitroLeft&&foe.gear>=2&&S.data.lvl>2){foe.nitroLeft=0;foe.nitro=1.6;}
 place(dt);
 const rp=K.$('rp');if(rp){rp.style.width=Math.min(100,me.rpm*100)+'%';K.$('kv').textContent=Math.round(me.v*3.6);K.$('kg').textContent=me.launched?me.gear+1:'N';K.$('kn').textContent=me.nitroLeft?'●':me.nitro>0?'🔥':'○';K.$('p1').style.left=Math.min(100,me.z/LEN*100)*.92+'%';K.$('p2').style.left=Math.min(100,foe.z/LEN*100)*.92+'%';}
 if(engG){engG.gain.value=.045;eng.frequency.value=70+me.rpm*240+(me.nitro>0?40:0);}
 if(me.spin>0||me.nitro>0)if(Math.random()<dt*40)K.burst(new THREE.Vector3(me.x+K.rand(-.9,.9),.3,me.z-2.2),me.nitro>0?[0x4fd0ff,0xffffff]:0xcccccc,1,1.5,2,.5);
 if(state==='race'&&(me.done&&(foe.done||me.t>me.done+1.5)||me.t>40)){if(!me.done)me.done=me.t;finish();}}
function place(dt){for(const c of [me,foe]){c.g.position.z=c.z;const u=c.g.userData;u.b.rotation.x=K.damp(u.b.rotation.x,c.launched&&!c.done&&c.shiftT<=0?-.035*GR[c.gear]*3:0,8,dt);u.b.position.y=!green&&c.rev>.3?Math.sin(K.time*50)*.012:0;for(const w of u.w)w.rotation.x+=(c.spin>0?40:c.v/.4)*dt;}
 if(state==='menu')return;const z=me.z;cam.position.set(K.damp(cam.position.x,-9.5,3,dt),K.damp(cam.position.y,3.2,3,dt),z-9-Math.min(4,me.v*.05));cam.lookAt(1,1,z+10);const fv=58+Math.min(22,me.v*.3);if(Math.abs(cam.fov-fv)>.3){cam.fov=K.damp(cam.fov,fv,4,dt);cam.updateProjectionMatrix();}if(me.nitro>0)K.shake=.05;K.sunFollow(0,z);}
const _sp=K.setPause;K.setPause=v=>{_sp(v);if(engG)engG.gain.value=K.paused?0:.045;};window.C30pause=f=>K.setPause(f===undefined?!K.paused:f);
K._dbg=()=>({state,z:+me.z.toFixed(0),v:+me.v.toFixed(1),g:me.gear,fz:+foe.z.toFixed(0),fd:foe.done,md:me.done});
K.me=()=>state==='stage'||state==='race'?me&&me.g:null;
K.loop(update);menu();
})();
