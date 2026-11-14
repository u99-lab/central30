// TITLE: Ronda de Penáltis
// Penáltis 3D: rematas (mira + força) e depois vais para a baliza defender.
(()=>{'use strict';
const S=K.store('pe',{cups:0,wins:0,best:0,kit:0});
const KITS=[[0xffd23f,0x1b2340],[0xe8452c,0xffffff],[0x2a6bff,0xffffff],[0x1fae6b,0xffffff],[0xffffff,0x1b2340],[0x8a4dff,0xffd23f]];
const TEAMS=[['Vale Verde',0x3fbf6b,0xffffff,.1],['Buarcos United',0x35b6e8,0x10243f,.25],['Atlético da Marginal',0xff8a3d,0x222222,.4],['Estrela do Mondego',0xf2f2f2,0xc0202a,.55],['Naval 30',0x2444c9,0xffd23f,.7],['Leões de Quiaios',0x1d1d28,0xff3d5a,.85],['Sporting da Serra',0x7a1fa2,0xffffff,1]];
const GW=3.66,GH=2.44,SPOT=11,BR=.16,GRAV=7.5;
K.init({sky:0x79bdfa,fog:[90,190],fov:50,sunPos:[-25,45,35],shadow:32});
const scene=K.scene,cam=K.camera;
// ----- relvado
const ftex=K.tex(1024,1024,(c,w,h)=>{for(let i=0;i<16;i++){c.fillStyle=i%2?'#3c9f4b':'#46b056';c.fillRect(0,i*h/16,w,h/16);}
 const X=m=>512+m*16,Z=m=>160+m*16;c.strokeStyle='#f4fff4';c.lineWidth=4;c.beginPath();c.moveTo(0,Z(0));c.lineTo(w,Z(0));c.stroke();
 c.strokeRect(X(-9.16),Z(0),18.32*16,5.5*16);c.strokeRect(X(-20.15),Z(0),40.3*16,16.5*16);c.fillStyle='#f4fff4';c.beginPath();c.arc(X(0),Z(11),4,0,7);c.fill();
 c.save();c.beginPath();c.rect(0,Z(16.5),w,h);c.clip();c.beginPath();c.arc(X(0),Z(11),9.15*16,0,7);c.stroke();c.restore();});
const field=new THREE.Mesh(new THREE.PlaneGeometry(64,64),new THREE.MeshLambertMaterial({map:ftex}));field.rotation.x=-Math.PI/2;field.position.set(0,0,22);field.receiveShadow=true;scene.add(field);
K.plane(260,260,0x378f45,0,-.02,22);
// ----- baliza
for(const s of [-1,1])K.cyl(.07,.07,GH,0xffffff,s*GW,GH/2,0);
K.cyl(.07,.07,GW*2+.14,0xffffff,0,GH,0).rotation.z=Math.PI/2;
const ntex=K.tex(256,256,(c,w)=>{c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=3;for(let i=0;i<=w;i+=32){c.beginPath();c.moveTo(i,0);c.lineTo(i,w);c.moveTo(0,i);c.lineTo(w,i);c.stroke();}},[1,1]);
const netM=(rx,ry)=>{const t=ntex.clone();t.needsUpdate=true;t.repeat.set(rx,ry);return new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthWrite:false});};
const net=new THREE.Group();scene.add(net);
const nBack=new THREE.Mesh(new THREE.PlaneGeometry(GW*2,GH),netM(12,4));nBack.position.set(0,GH/2,-1.9);net.add(nBack);
const nTop=new THREE.Mesh(new THREE.PlaneGeometry(GW*2,1.9),netM(12,3));nTop.rotation.x=Math.PI/2;nTop.position.set(0,GH,-.95);net.add(nTop);
for(const s of [-1,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.9,GH),netM(3,4));m.rotation.y=Math.PI/2;m.position.set(s*GW,GH/2,-.95);net.add(m);}
// ----- bancadas e público
const crowd=[];
function stand(z0,dir,rows,wide){const cols=Math.floor(wide/.72),n=rows*cols,im=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.75,.4),new THREE.MeshLambertMaterial(),n),d=new THREE.Object3D(),col=new THREE.Color(),base=[];
 const pal=[0xe8452c,0xffd23f,0x2a6bff,0xffffff,0x1b2340,0x1fae6b,0xff8ac0,0xf2a65a];let k=0;
 for(let r=0;r<rows;r++){K.box(wide+2,1.1,2.3,r%2?0x7d87a0:0x8a94ad,0,.55+r*1.1,z0+dir*r*2.3);for(let i=0;i<cols;i++){const x=-wide/2+i*.72+K.rand(-.1,.1),y=1.5+r*1.1,z=z0+dir*(r*2.3-.2);base.push([x,y,z,K.rand(6.28)]);d.position.set(x,y,z);d.updateMatrix();im.setMatrixAt(k,d.matrix);im.setColorAt(k,col.set(K.pick(pal)));k++;}}
 K.box(wide+2,rows*1.1+5,1,0x5d6680,0,(rows*1.1+5)/2,z0+dir*(rows*2.3+.4));scene.add(im);crowd.push({im,base,d});}
stand(-9,-1,9,74);stand(48,1,8,74);
for(const s of [-1,1]){K.box(2,9,70,0x6d7690,s*40,4.5,20);K.box(1,1,60,0x1b2340,s*33,.5,20);}
const adT=K.tex(2048,64,(c,w,h)=>{c.fillStyle='#1b2340';c.fillRect(0,0,w,h);c.font='900 44px system-ui,sans-serif';c.textBaseline='middle';const t=['CENTRAL 30 MAX','TAVAREDE','VALE VERDE','FIGUEIRA DA FOZ','LIGA RELÂMPAGO'];let x=20;for(let i=0;i<8;i++){c.fillStyle=['#ffd23f','#ffffff','#3dffa2','#ff8a3d'][i%4];c.fillText(t[i%t.length],x,34);x+=c.measureText(t[i%t.length]).width+70;}});
for(const z of [-5,44]){const ad=new THREE.Mesh(new THREE.BoxGeometry(66,1.1,.3),new THREE.MeshBasicMaterial({map:adT}));ad.position.set(0,.55,z);scene.add(ad);}
for(const [x,z] of [[-36,-12],[36,-12],[-36,52],[36,52]]){K.cyl(.3,.4,22,0x9aa3b8,x,11,z,null,8);K.box(5,2.4,.6,0xfdfde8,x,22.5,z);}
for(let i=0;i<7;i++)K.cloud(K.rand(-120,120),K.rand(40,70),K.rand(-120,-40),K.rand(2,4));
// ----- bola
const btex=K.tex(128,64,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#1b2340';for(const [x,y] of [[16,16],[48,44],[80,18],[112,46],[64,60],[30,62],[98,2]]){c.beginPath();c.arc(x,y,9,0,7);c.fill();}});
const ball=new THREE.Mesh(new THREE.SphereGeometry(BR,20,14),new THREE.MeshLambertMaterial({map:btex}));ball.castShadow=true;scene.add(ball);
const bv=new THREE.Vector3();let bFly=false,bDone=true;
// ----- mira, alvo e luvas
const ring=(r,c)=>{const m=new THREE.Mesh(new THREE.RingGeometry(r*.72,r,28),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.95,side:THREE.DoubleSide,depthTest:false}));m.renderOrder=9;scene.add(m);return m;};
const aimB=ring(.36,0x0b1020),aimM=ring(.3,0xffd23f),aimDot=ring(.07,0xffffff),tgtM=ring(.55,0x3dffa2),glove=ring(.5,0x4fd0ff);
// ----- jogadores
let me,gk,foe,foeGk;
function dress(){[me,gk,foe,foeGk].forEach(p=>p&&scene.remove(p));const k=KITS[S.data.kit],t=opp;
 me=K.person({shirt:k[0],shorts:k[1],socks:k[0]});gk=K.person({shirt:0x25c2a0,shorts:0x1b2340,gloves:0xffffff,socks:0x25c2a0});
 foe=K.person({shirt:t[1],shorts:t[2],socks:t[1],skin:0xd9a87c,hair:0x1c1c1c});foeGk=K.person({shirt:0xff7a3d,shorts:0x222222,gloves:0xffffff,skin:0xd9a87c,hair:0x1c1c1c});}
let opp=TEAMS[0];
// ----- estado
let mode='menu',phase='idle',myTurn=true,my=[],op=[],kickN=0,lvl=.3,cup=null,train=null,sudden=false;
const aim={x:0,y:1.2},hand={x:0,y:1.2},dive={x:0,y:1.2,t0:0,on:false};
let power=0,pdir=1,charging=false,wob=0,shooter=null,keeper=null,runT=0,kickAt=0,lean=0,shotT=0,pointerOn=false;
const timers=[];const after=(t,f)=>timers.push({t,f});
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),pl=new THREE.Plane(new THREE.Vector3(0,0,1),0),hitP=new THREE.Vector3();
function pointTo(e,o,lim){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,cam);if(ray.ray.intersectPlane(pl,hitP)){o.x=K.clamp(hitP.x,-lim,lim);o.y=K.clamp(hitP.y,.15,3.3);}}
const ptr={x:0,y:1.2};
const cv=K.renderer.domElement;
cv.addEventListener('pointerdown',e=>{K.audio();pointerOn=true;if(phase==='aim'&&myTurn){pointTo(e,aim,5);charging=true;power=0;pdir=1;}if(!myTurn)pointTo(e,ptr,4.4);});
cv.addEventListener('pointermove',e=>{if(myTurn){if(phase==='aim'&&(e.pointerType==='mouse'||pointerOn))pointTo(e,aim,5);}else pointTo(e,ptr,4.4);});
addEventListener('pointerup',()=>{pointerOn=false;if(charging&&phase==='aim')shoot();});
// ----- menus
function menu(){mode='menu';K.play(false);phase='idle';tgtM.visible=aimM.visible=aimDot.visible=aimB.visible=glove.visible=false;dress();place();
 K.screen(`<div class="k-title">Ronda de <em>Penáltis</em></div><div class="k-lead">Remata, defende e leva a taça para Tavarede.</div>
 <div class="k-lab">O teu equipamento</div><div class="k-row">${KITS.map((k,i)=>`<button class="k-chip${i===S.data.kit?' on':''}" data-a="kit" data-v="${i}" style="background:#${k[0].toString(16).padStart(6,'0')};color:#${k[1].toString(16).padStart(6,'0')}">${i===S.data.kit?'✓':'&nbsp;&nbsp;'}</button>`).join('')}</div>
 <button class="k-go" data-a="cup">🏆 Taça (3 eliminatórias)</button><button class="k-alt" data-a="quick">Jogo rápido</button><button class="k-alt" data-a="train">Treino de pontaria</button>
 <table class="k-tab"><tr><td>Taças ganhas</td><td>${S.data.cups}</td></tr><tr><td>Jogos ganhos</td><td>${S.data.wins}</td></tr><tr><td>Recorde no treino</td><td>${S.data.best}</td></tr></table>
 ${K.keysHelp([['RATO','mira'],['CLIQUE','manter = força, largar = remate'],['SETAS ESPAÇO','teclado'],['P','pausa']])}`,
 {kit:v=>{S.data.kit=+v;S.save();menu();},
  quick:()=>{K.screen(`<div class="k-title">Escolhe o <em>rival</em></div><div class="k-row">${TEAMS.map((t,i)=>`<button class="k-chip" data-a="go" data-v="${i}">${t[0]}<small>${'★'.repeat(1+Math.round(t[3]*4))}</small></button>`).join('')}</div><button class="k-alt" data-a="back">Voltar</button>`,{go:v=>{cup=null;train=null;startMatch(TEAMS[+v]);},back:menu});},
  cup:()=>{const pool=TEAMS.slice().sort(()=>Math.random()-.5).slice(0,3).sort((a,b)=>a[3]-b[3]);cup={i:0,teams:pool};train=null;cupScreen();},
  train:()=>{cup=null;train={n:0,score:0};startMatch(TEAMS[2]);}});}
function cupScreen(){const names=['Quartos de final','Meia-final','FINAL'];K.screen(`<div class="k-title">${names[cup.i]}</div><div class="k-lead">Tavarede FC  vs  <b>${cup.teams[cup.i][0]}</b></div><button class="k-go" data-a="go">Entrar em campo</button><button class="k-alt" data-a="back">Desistir</button>`,{go:()=>startMatch(cup.teams[cup.i]),back:menu});}
K.onQuit=menu;
// ----- jogo
function startMatch(t){opp=t;lvl=t[3];my=[];op=[];kickN=0;sudden=false;myTurn=true;mode='match';dress();K.screen(null);K.play(true);K.sfx.whistle(true);K.sfx.cheer(.6);nextKick();}
function place(){shooter=myTurn?me:foe;keeper=myTurn?foeGk:gk;const idle=myTurn?foe:me,idleK=myTurn?gk:foeGk;
 idle.position.set(-9,0,14);idle.rotation.y=2.4;K.pose(idle);idleK.position.set(9,0,13);idleK.rotation.y=-2.4;K.pose(idleK);
 for(const q of [me,gk,foe,foeGk]){q.rotation.set(0,0,0);q.position.y=0;}idle.rotation.y=2.4;idleK.rotation.y=-2.4;shooter.position.set(-1.5,0,SPOT+2.4);shooter.rotation.y=Math.PI-.5;K.pose(shooter);keeper.position.set(0,0,.35);K.pose(keeper);
 ball.position.set(0,BR,SPOT);ball.rotation.set(0,0,0);bv.set(0,0,0);bFly=false;bDone=true;hand.x=0;hand.y=1.2;dive.on=false;ptr.x=0;ptr.y=1.2;nBack.visible=myTurn;}
function nextKick(){place();charging=false;power=0;wob=0;if(myTurn)cam.position.set(.5,2.9,SPOT+5.8);else cam.position.set(0,2.2,-4.2);
 if(train){phase='aim';aim.x=0;aim.y=1.2;tgtM.visible=true;tgtM.position.set(K.pick([-1,1])*K.rand(1.2,3),K.rand(.5,1.9),.05);hud();return;}
 if(myTurn){phase='aim';aim.x=0;aim.y=1.2;K.flash('REMATA!','',900,'#ffd23f');}
 else{phase='gkWait';runT=0;kickAt=K.rand(1.3,2.2);const corner=Math.random()<.45+.4*lvl;foeShot.x=K.pick([-1,1])*(corner?K.rand(2.3,3.35):K.rand(.3,2.2));foeShot.y=corner?K.rand(.3,2.05):K.rand(.3,1.7);
  if(Math.random()<.09-.04*lvl){foeShot.x*=1.25;foeShot.y+=K.rand(0,1.2);}lean=Math.random()<.78?Math.sign(foeShot.x):-Math.sign(foeShot.x);K.flash('DEFENDE!','',900,'#4fd0ff');}
 hud();}
const foeShot={x:0,y:1};
function launch(tx,ty,speed){const d=Math.hypot(tx,ty-BR,SPOT),T=d/speed;bv.set(tx/T,(ty-BR+.5*GRAV*T*T)/T,-SPOT/T);bFly=true;bDone=false;shotT=T;K.sfx.kick();return T;}
function shoot(){charging=false;phase='run';aimM.visible=aimDot.visible=aimB.visible=false;const p=power;let tx=aim.x+Math.sin(K.time*7.3)*wob,ty=aim.y+Math.cos(K.time*9.1)*wob*.6;
 if(p>.86){const o=(p-.86)/.14;ty+=o*2.6;tx+=K.rand(-1,1)*o*1.2;}if(p<.3)ty=Math.max(.2,ty-.5);
 const speed=14+p*15;runT=0;after(.38,()=>{phase='fly';const T=launch(tx,ty,speed);
  if(!train||true){const read=Math.random()<.42+.42*lvl,tr=.3-.13*lvl;dive.x=read?K.clamp(tx,-3.5,3.5):(Math.random()<.5?-Math.sign(tx||1)*K.rand(1.5,3):K.rand(-1,1));dive.y=read?K.clamp(ty,.4,2.3):K.rand(.5,1.8);dive.t0=tr;dive.v=(train?4.2:5.2+2.2*lvl);dive.on=true;dive.t=0;}});}
function result(kind){phase='result';const goal=kind==='goal',pos=ball.position.clone();
 if(train){let pts=0;if(goal){pts=50;if(Math.hypot(pos.x-tgtM.position.x,pos.y-tgtM.position.y)<.62){pts=150;K.confetti(pos);}}train.score+=pts;train.n++;K.flash(pts===150?'NO ALVO!':goal?'GOLO':kind==='save'?'DEFESA':'FORA',pts?'+'+pts:'',1100,pts?'#3dffa2':'#ff6b6b');if(pts)K.sfx.good();else K.sfx.bad();hud();
  after(1.6,()=>{if(train.n>=10)endTrain();else nextKick();});return;}
 const scored=goal;(myTurn?my:op).push(scored?1:0);
 if(myTurn){if(goal){K.flash('GOLO!','',1400,'#3dffa2');K.sfx.cheer(1);K.sfx.good();K.confetti(pos);K.shake=.25;}else{K.flash(kind==='save'?'DEFENDEU…':kind==='post'?'AO POSTE!':'PARA FORA!','',1400,'#ff6b6b');K.sfx.ooh();if(kind==='post')K.unlock('pe-poste','Penáltis · Ao ferro!');}}
 else{if(goal){K.flash('GOLO DELES','',1400,'#ff6b6b');K.sfx.ooh();}else{K.flash(kind==='save'?'QUE DEFESA!':'FALHOU!','',1400,'#3dffa2');K.sfx.cheer(1);if(kind==='save'){K.sfx.good();K.shake=.3;}}}
 hud();after(2.1,advance);}
function advance(){kickN++;const n=Math.max(my.length,op.length),a=my.reduce((x,y)=>x+y,0),b=op.reduce((x,y)=>x+y,0);let over=false;
 if(my.length===op.length){if(n>=5&&a!==b)over=true;else if(n>=5)sudden=true;}
 if(!over&&n<=5&&!sudden){const leftA=5-my.length,leftB=5-op.length;if(a>b+leftB||b>a+leftA)over=true;}
 if(over){endMatch(a>b,a,b);return;}myTurn=!myTurn;nextKick();}
function endMatch(win,a,b){K.play(false);if(win){S.data.wins++;K.sfx.win();K.sfx.cheer(1);K.confetti(new THREE.Vector3(0,3,6));}else K.sfx.bad();
 if(win&&sudden)K.unlock('pe-morte','Penáltis · Nervos de aço na morte súbita');if(win&&b===0)K.unlock('pe-zero','Penáltis · Baliza a zeros');
 if(cup&&win){cup.i++;if(cup.i>=3){S.data.cups++;S.save();K.unlock('pe-taca','Penáltis · Taça para Tavarede');K.screen(`<div class="k-title">🏆 <em>CAMPEÃO!</em></div><div class="k-lead">Ganhaste a final por ${a}–${b}. A taça vai para Tavarede!</div><button class="k-go" data-a="m">Festejar</button>`,{m:menu});return;}
  S.save();K.screen(`<div class="k-title"><em>Passaste!</em></div><div class="k-lead">${a}–${b} contra ${opp[0]}.</div><button class="k-go" data-a="n">Próxima eliminatória</button>`,{n:cupScreen});return;}
 S.save();K.screen(`<div class="k-title">${win?'<em>Vitória!</em>':'Derrota'}</div><div class="k-lead">${a}–${b} contra ${opp[0]}${cup?'. Ficaste pelo caminho na taça.':''}</div><button class="k-go" data-a="r">${cup?'Voltar ao menu':'Jogar outra vez'}</button>${cup?'':'<button class="k-alt" data-a="m">Menu</button>'}`,{r:()=>cup?menu():startMatch(opp),m:menu});}
function endTrain(){K.play(false);const s=train.score,rec=s>S.data.best;if(rec){S.data.best=s;S.save();}if(s>=1000)K.unlock('pe-mira','Penáltis · Pontaria de craque (1000 no treino)');if(rec)K.sfx.win();
 K.screen(`<div class="k-title"><em>${s}</em> pontos</div><div class="k-lead">${rec?'Novo recorde!':'Recorde: '+S.data.best}</div><button class="k-go" data-a="r">Outra vez</button><button class="k-alt" data-a="m">Menu</button>`,{r:()=>{train={n:0,score:0};startMatch(TEAMS[2]);},m:menu});}
const dots=(a,col)=>{let s='';const n=Math.max(5,a.length+(a.length>=5?1:0));for(let i=0;i<n;i++)s+=`<i style="display:inline-block;width:13px;height:13px;border-radius:50%;margin:0 2px;border:2px solid #fff;background:${a[i]===1?col:a[i]===0?'#ff4d5e':'transparent'}"></i>`;return s;};
function hud(){if(train){K.hud(`<div class="k-tc"><div class="k-pill"><small>Treino · bola ${Math.min(10,train.n+1)}/10</small><b>${train.score}</b></div></div><div class="k-bc" style="flex-direction:column"><div class="k-meter"><u style="left:60%;width:26%"></u><i id="pw" style="width:0"></i></div><div class="k-hint">Acerta no círculo verde: 150 pontos</div></div>`);return;}
 const a=my.reduce((x,y)=>x+y,0),b=op.reduce((x,y)=>x+y,0);
 K.hud(`<div class="k-tc"><div class="k-pill" style="text-align:center"><small>${sudden?'Morte súbita':'Tavarede FC  ·  '+opp[0]}</small>${dots(my,'#3dffa2')} <b>&nbsp;${a} – ${b}&nbsp;</b> ${dots(op,'#ffd23f')}</div></div>
 <div class="k-bc" style="flex-direction:column">${myTurn?'<div class="k-meter"><u style="left:60%;width:26%"></u><i id="pw" style="width:0"></i></div><div class="k-hint">Aponta e mantém premido: larga na zona verde</div>':'<div class="k-hint">Leva as luvas até à bola — repara para onde ele se inclina</div>'}</div>`);}
// ----- ciclo
function update(dt){for(let i=timers.length-1;i>=0;i--){timers[i].t-=dt;if(timers[i].t<=0){const f=timers[i].f;timers.splice(i,1);f();}}
 for(const c of crowd){const amp=(phase==='result')?.28:.05;for(let i=0;i<c.base.length;i+=1){const b=c.base[i];c.d.position.set(b[0],b[1]+Math.abs(Math.sin(K.time*(phase==='result'?9:2)+b[3]))*amp,b[2]);c.d.updateMatrix();c.im.setMatrixAt(i,c.d.matrix);}c.im.instanceMatrix.needsUpdate=true;}
 if(mode==='menu'){const t=K.time*.2;cam.position.set(Math.sin(t)*14,4.5,20+Math.cos(t)*4);cam.lookAt(0,1.4,2);return;}
 // câmara
 if(myTurn){cam.position.x=K.damp(cam.position.x,.5+aim.x*.1,4,dt);cam.position.y=K.damp(cam.position.y,2.9,4,dt);cam.position.z=K.damp(cam.position.z,SPOT+5.8,4,dt);cam.lookAt(aim.x*.2,1.0,0);}
 else{cam.position.x=K.damp(cam.position.x,hand.x*.2,4,dt);cam.position.y=K.damp(cam.position.y,2.2,4,dt);cam.position.z=K.damp(cam.position.z,-4.2,4,dt);cam.lookAt(hand.x*.3,1.2,SPOT);}
 // rematar
 if(phase==='aim'&&myTurn){const sp=3.4*dt;if(K.down('ArrowLeft','KeyA'))aim.x-=sp;if(K.down('ArrowRight','KeyD'))aim.x+=sp;if(K.down('ArrowUp','KeyW'))aim.y+=sp;if(K.down('ArrowDown','KeyS'))aim.y-=sp;aim.x=K.clamp(aim.x,-5,5);aim.y=K.clamp(aim.y,.15,3.3);
  if(K.hit('Space')){charging=true;power=0;pdir=1;}if(charging){power+=pdir*dt*1.15;if(power>=1){power=1;pdir=-1;}if(power<=0){power=0;pdir=1;}if(!K.down('Space')&&!pointerOn)shoot();}
  wob=K.damp(wob,train?.12:(.1+.42*lvl)*(sudden?1.35:1),2,dt);const wx=Math.sin(K.time*7.3)*wob,wy=Math.cos(K.time*9.1)*wob*.6;
  aimM.visible=aimDot.visible=phase==='aim';aimM.position.set(aim.x+wx,aim.y+wy,.06);aimDot.position.copy(aimM.position);aimB.position.copy(aimM.position);aimB.visible=true;aimM.scale.setScalar(1+Math.sin(K.time*6)*.06);const pw=K.$('pw');if(pw)pw.style.width=(power*100)+'%';}
 if(phase==='run'){runT+=dt;shooter.position.z=K.lerp(SPOT+2.4,SPOT+.7,Math.min(1,runT/.38));shooter.position.x=K.lerp(-1.5,-.38,Math.min(1,runT/.38));K.walk(shooter,runT*22,1);}
 if(phase==='fly'&&shooter){const P=shooter.userData.P;P.legR.rotation.x=K.damp(P.legR.rotation.x,-1.3,18,dt);}
 // guarda-redes do computador
 if(dive.on&&myTurn){dive.t+=dt;if(dive.t>dive.t0){const dx=dive.x-hand.x,dy=dive.y-hand.y,d=Math.hypot(dx,dy),st=dive.v*dt;if(d>st){hand.x+=dx/d*st;hand.y+=dy/d*st;}else{hand.x=dive.x;hand.y=dive.y;}}}
 // tu na baliza
 if(!myTurn&&mode==='match'){if(phase==='gkWait'||phase==='gkFly'){const sp=5*dt;if(K.down('ArrowLeft','KeyA'))ptr.x+=sp;if(K.down('ArrowRight','KeyD'))ptr.x-=sp;if(K.down('ArrowUp','KeyW'))ptr.y+=sp;if(K.down('ArrowDown','KeyS'))ptr.y-=sp;ptr.x=K.clamp(ptr.x,-4.4,4.4);ptr.y=K.clamp(ptr.y,.15,3);
   const dx=ptr.x-hand.x,dy=ptr.y-hand.y,d=Math.hypot(dx,dy),st=7.2*dt;if(d>st){hand.x+=dx/d*st;hand.y+=dy/d*st;}else{hand.x=ptr.x;hand.y=ptr.y;}}
  glove.visible=phase==='gkWait'||phase==='gkFly';glove.position.set(hand.x,hand.y,.5);
  if(phase==='gkWait'){runT+=dt;const k=Math.max(0,1-(kickAt-runT)/.7);shooter.position.z=K.lerp(SPOT+2.4,SPOT+.7,k);shooter.position.x=K.lerp(-1.5,-.38,k);if(k>0)K.walk(shooter,runT*20,1);shooter.rotation.z=lean*.18*Math.min(1,runT/.6);
   if(runT>=kickAt){phase='gkFly';launch(foeShot.x,foeShot.y,12.5+4.5*lvl);}}
  if(phase==='gkFly'){const P=shooter.userData.P;P.legR.rotation.x=K.damp(P.legR.rotation.x,-1.3,18,dt);}}
 else glove.visible=false;
 // pose do guarda-redes
 if(keeper&&mode==='match'){const lx=hand.x,up=Math.max(0,hand.y-1.5);keeper.position.x=lx*.78;keeper.position.y=up*.75+Math.min(.5,Math.abs(lx)*.12);keeper.rotation.z=-lx*.34*(myTurn?1:1);const P=keeper.userData.P,a=Math.min(1,(Math.abs(lx)+up)*.9);P.armL.rotation.set(-Math.PI*(.15+.8*a),0,-.4);P.armR.rotation.set(-Math.PI*(.15+.8*a),0,.4);}
 // bola
 if(!bDone){const pz=ball.position.z;bv.y-=GRAV*dt;ball.position.addScaledVector(bv,dt);ball.rotation.x-=dt*14;ball.rotation.z+=dt*5;
  if(ball.position.y<BR){ball.position.y=BR;if(bv.y<-1.5)K.sfx.bounce(.6);bv.y*=-.45;bv.x*=.8;bv.z*=.8;}
  if(bFly&&pz>0&&ball.position.z<=.25){bFly=false;const x=ball.position.x,y=ball.position.y,hx=hand.x,hy=hand.y;
   const saved=Math.hypot(x-hx,y-hy)<(myTurn?.72:.86)||(Math.abs(x-keeper.position.x)<.42&&y<1.75&&Math.abs(hx)<1);
   if(saved){bv.set(K.rand(-4,4)+(x-hx)*4,K.rand(2,5),K.rand(5,9));K.sfx.hit();K.burst(ball.position,0xffffff,10,3,3,.5);result('save');}
   else if((Math.abs(Math.abs(x)-GW)<.17&&y<GH+.1)||(Math.abs(y-GH)<.17&&Math.abs(x)<GW+.1)){bv.set(Math.sign(x)*K.rand(2,6),K.rand(1,4),K.rand(6,10));K.tone(900,.25,'triangle',.3,500);K.shake=.2;result('post');}
   else if(Math.abs(x)<GW&&y<GH){result('goal');}
   else result('miss');}
  if(ball.position.z<-1.7&&Math.abs(ball.position.x)<GW+.2&&ball.position.y<GH+.2){ball.position.z=-1.7;bv.multiplyScalar(.12);nBack.scale.z=1;nBack.position.z=-2.15;}
  if(ball.position.z<-4.6){bv.z=Math.abs(bv.z)*.3;ball.position.z=-4.6;}
  if(bv.lengthSq()<.02&&ball.position.y<=BR+.01&&phase==='result')bDone=true;}
 nBack.position.z=K.damp(nBack.position.z,-1.9,6,dt);}
K.loop(update);menu();
})();
