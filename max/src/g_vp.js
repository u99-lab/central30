// TITLE: Vólei de Praia
// 1 contra 1 na areia: corre para a bola, salta para cortar. Primeiro a 11 (com 2 de vantagem).
(()=>{'use strict';
const S=K.store('vp',{wins:[0,0,0]});
document.documentElement.style.setProperty('--kc','#ffd23f');
K.init({sky:0x8fd3ff,fog:[80,260],fov:50,shadow:22,hemi:.75,sunI:1.1,sunPos:[20,40,25]});
const scene=K.scene,cam=K.camera,CW=4.5,CL=8,NH=2.3,G=11,BR=.22;
const RIV=[['Marta',.55,5.2],['Tiago',.75,6],['Inês',.92,6.8]];
// praia
K.plane(400,400,0xead7a0,0,0,0);const sea=K.plane(400,200,0x2f8fb5,0,.02,-130);K.plane(400,6,0xf6f0e0,0,.03,-31);
for(let i=0;i<24;i++){const p=K.palm();p.position.set(K.rand(-60,60),0,K.rand(18,40));scene.add(p);}
for(let i=0;i<8;i++){const u=new THREE.Group();K.cyl(.05,.05,2.4,0xffffff,0,1.2,0,u,6);K.cyl(.01,1.4,.5,[0xe8452c,0x2a8bff,0xffd23f,0x35d07f][i%4],0,2.5,0,u,10);u.position.set(-30+i*8+K.rand(-2,2),0,K.rand(-22,-14));scene.add(u);}
// campo
for(const [w,d,x,z] of [[CW*2,.06,0,CL],[CW*2,.06,0,-CL],[.06,CL*2,CW,0],[.06,CL*2,-CW,0]])K.box(w,.02,d,0x2a6bd7,x,.02,z);
for(const s of [-1,1])K.cyl(.06,.06,NH+.2,0xdddddd,s*(CW+.4),(NH+.2)/2,0,null,8);
const net=K.box(CW*2+.8,.9,.03,0x111111,0,NH-.45,0);net.material.transparent=true;net.material.opacity=.55;K.box(CW*2+.8,.08,.06,0xffffff,0,NH,0);
// crowd
for(let i=0;i<22;i++){const p=K.person([0xe8452c,0x2a8bff,0xffd23f,0x35d07f,0xffffff][i%5]);p.position.set(K.rand(-14,14),0,(i%2?1:-1)*K.rand(11,13));p.rotation.y=p.position.z>0?Math.PI:0;scene.add(p);}
const mkP=c=>{const p=K.person(c);p.scale.setScalar(1.25);scene.add(p);return p;};
const meM=mkP(0xe8452c),opM=mkP(0x2a8bff);
const ballM=K.sph(BR,0xffffff,0,1,0,null,18);const stripe=K.tex(64,32,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#ffd23f';c.fillRect(0,0,w,h/3);c.fillStyle='#2a6bd7';c.fillRect(0,h*2/3,w,h/3);});ballM.material=new THREE.MeshLambertMaterial({map:stripe});
const shadow=new THREE.Mesh(new THREE.CircleGeometry(BR*1.2,16),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.25}));shadow.rotation.x=-Math.PI/2;scene.add(shadow);
const me={x:0,z:5,y:0,vy:0},op={x:0,z:-5,y:0,vy:0},b={x:0,y:3,z:5,vx:0,vy:0,vz:0};
let state='menu',lvl=0,sc=[0,0],server=0,serveT=0,last=-1,touches=0,cool=[0,0],pause=0,opJump=0;
function serve(who){server=who;const p=who===0?me:op;b.x=p.x;b.z=p.z+(who===0?-.4:.4);b.y=2.6;b.vx=b.vy=b.vz=0;serveT=who===0?99:1.1;last=-1;pause=0;}
function start(l){lvl=l;sc=[0,0];me.x=0;me.z=5;op.x=0;op.z=-5;serve(0);state='play';K.screen(null);K.play(true);hud();K.sfx.whistle();}
function hud(){K.hud(`<div class="k-tc"><div class="k-pill" style="text-align:center"><small>Primeiro a 11</small><b>${K.name()} ${sc[0]} – ${sc[1]} ${RIV[lvl][0]}</b></div></div><div class="k-bc"><div class="k-hint">${serveT>50?(K.touch?'Toca no botão para servir':'ESPAÇO para servir'):(K.touch?'Joystick para correr · botão para saltar':'W A S D correr · ESPAÇO saltar e cortar')}</div></div>`);}
// bater: manda a bola para o outro lado com uma parábola até um alvo
function hitTo(from,tx,tz,hgt){const dx=tx-b.x,dz=tz-b.z,d=Math.hypot(dx,dz);const T=K.clamp(d/(hgt?13:7.5),.55,1.6);b.vx=dx/T;b.vz=dz/T;b.vy=(.5*G*T*T-(b.y-.3))/T;last=from;}
function point(w){sc[w]++;K.flash(w===0?'Ponto!':'Ponto d'+(RIV[lvl][0]==='Tiago'?'o ':'a ')+RIV[lvl][0],sc[0]+' – '+sc[1],1000,w===0?'#3dffa2':'#ff6b6b');w===0?K.sfx.good():K.sfx.bad();hud();
 if(sc[w]>=11&&sc[w]-sc[1-w]>=2){state='over';setTimeout(()=>end(w===0),1300);return;}pause=1.3;setTimeout(()=>{if(state==='play'){serve(w);hud();}},1300);}
function end(win){state='end';K.play(false);if(win){S.data.wins[lvl]++;S.save();K.sfx.win();if(lvl===2)K.unlock('vp-ines','Vólei · Ganhaste à Inês');}
 K.screen(`<div class="k-title">${win?'<em>Ganhaste!</em>':'Perdeste'}</div><div class="k-lead">${K.name()} ${sc[0]} – ${sc[1]} ${RIV[lvl][0]}</div><button class="k-go" data-a="r">Desforra</button>${win&&lvl<2?'<button class="k-alt" data-a="n">Próxima adversária</button>':''}<button class="k-alt" data-a="m">Menu</button>`,{r:()=>start(lvl),n:()=>start(lvl+1),m:menu});}
function menu(){state='menu';K.play(false);K.screen(`<div class="k-title">Vólei de <em>Praia</em></div><div class="k-lead">Um contra um na areia. Põe-te debaixo da bola para a devolver; salta perto da rede para cortar.</div><div class="k-row">${RIV.map((r,i)=>`<button class="k-chip" data-a="go" data-v="${i}">vs ${r[0]}<small>${'★'.repeat(i+1)} · ${S.data.wins[i]} vitórias</small></button>`).join('')}</div>${K.keysHelp([['W A S D','correr'],['ESPAÇO','servir / saltar'],['P','pausa']])}`,{go:v=>start(+v)});}
K.onQuit=menu;
const jump=()=>{if(state!=='play')return;if(serveT>50){serveT=0;hitTo(0,K.rand(-CW+1,CW-1),-K.rand(3,6.5),false);b.vy+=1;K.tone(300,.08,'triangle',.3);hud();return;}if(me.y<=0)me.vy=4.6;};
K.useStick=true;K.pad([['Space','Saltar']]);
function predict(){let x=b.x,y=b.y,z=b.z,vx=b.vx,vy=b.vy,vz=b.vz;for(let i=0;i<300;i++){vy-=G*.016;x+=vx*.016;y+=vy*.016;z+=vz*.016;if(y<1.3&&vy<0)return {x,z};}return {x,z};}
function contact(p,who){const top=p.y+2.1;const dx=b.x-p.x,dz=b.z-p.z;if(cool[who]>0)return;if(Math.hypot(dx,dz)<1&&b.y<top+.5&&b.y>top-1.6){cool[who]=.35;
 const dir=who===0?-1:1;const spike=p.y>.6&&Math.abs(p.z)<2.6;
 if(who===0){const ax=K.axis();const tx=K.clamp(b.x+ax.x*3+K.rand(-1,1),-CW+.5,CW-.5);hitTo(0,tx,dir*(spike?K.rand(2.5,5):K.rand(3,6.8)),spike);if(spike){b.vy=-2;K.flash('CORTE!','',500,'#ffd23f');}}
 else{const L=RIV[lvl][1];const away=me.x>0?-1:1;const tx=K.clamp(away*K.rand(1,CW-.6)*L+K.rand(-1.5,1.5)*(1-L),-CW+.5,CW-.5);hitTo(1,tx,dir*K.rand(3,6.8),spike);if(spike)b.vy=-2;}
 K.tone(spike?200:340,.09,'triangle',.35,120);}}
function update(dt){
 if(state==='menu'||state==='end'){const t=K.time*.15;cam.position.set(Math.sin(t)*16,7,Math.cos(t)*16);cam.lookAt(0,1,0);place();return;}
 cam.position.set(me.x*.4,6.2,CL+7.5);cam.lookAt(me.x*.25,1.2,-1.5);
 if(state!=='play'){place();return;}
 if(K.hit('Space'))jump();cool[0]-=dt;cool[1]-=dt;
 const ax=K.axis(),sp=6.2;me.x=K.clamp(me.x+ax.x*sp*dt,-CW-1.5,CW+1.5);me.z=K.clamp(me.z-ax.y*sp*dt,.6,CL+2);
 me.vy-=G*1.1*dt;me.y=Math.max(0,me.y+me.vy*dt);op.vy-=G*1.1*dt;op.y=Math.max(0,op.y+op.vy*dt);
 // adversária
 const R=RIV[lvl];let tx=0,tz=-4.5;if(b.vz<0||(b.z<0&&serveT<=0)){const pr=predict();tx=pr.x;tz=Math.min(-.7,pr.z-.3);}
 if(serveT>0&&serveT<50&&server===1){tx=op.x;tz=op.z;}
 const dx=tx-op.x,dz=tz-op.z,d=Math.hypot(dx,dz),st=Math.min(d,R[2]*dt);if(d>.01){op.x+=dx/d*st;op.z+=dz/d*st;}op.x=K.clamp(op.x,-CW-1.5,CW+1.5);op.z=K.clamp(op.z,-CL-2,-.6);
 if(op.y<=0&&b.z<0&&b.vz<0&&Math.abs(op.z)<2.8&&b.y>2.6&&b.y<3.6&&Math.hypot(b.x-op.x,b.z-op.z)<1.6&&Math.random()<R[1]*.08)op.vy=4.6;
 if(serveT>0&&serveT<50){serveT-=dt;b.x=op.x;b.z=op.z+.4;b.y=2.6;if(serveT<=0){hitTo(1,K.rand(-CW+1,CW-1),K.rand(3,6.5),false);b.vy+=1;K.tone(300,.08,'triangle',.3);}place();return;}
 if(serveT>50){if(K.hit('Space'))jump();b.x=me.x;b.z=me.z-.4;b.y=2.6;place();return;}
 if(pause>0){pause-=dt;b.vy-=G*dt;b.x+=b.vx*dt;b.z+=b.vz*dt;b.y=Math.max(BR,b.y+b.vy*dt);if(b.y<=BR){b.vy=0;b.vx*=.9;b.vz*=.9;}place();return;}
 const steps=3,h=dt/steps;for(let i=0;i<steps;i++){b.vy-=G*h;const pz=b.z;b.x+=b.vx*h;b.y+=b.vy*h;b.z+=b.vz*h;
  if(Math.sign(pz)!==Math.sign(b.z)&&b.y<NH+BR&&Math.abs(b.x)<CW+.4){b.z=pz;b.vz*=-.3;b.vx*=.5;K.noise(.06,.15,600);}
  contact(me,0);contact(op,1);
  if(b.y<=BR){b.y=BR;const inX=Math.abs(b.x)<=CW+.05,inZ=Math.abs(b.z)<=CL+.05;let w;if(inX&&inZ)w=b.z>0?1:0;else w=last===0?1:last===1?0:(b.z>0?1:0);K.burst(new THREE.Vector3(b.x,.1,b.z),0xead7a0,10);if(!(inX&&inZ))K.toast('Fora!');point(w);b.vy=2;break;}}
 place();}
function place(){meM.position.set(me.x,me.y,me.z);meM.rotation.y=Math.PI;opM.position.set(op.x,op.y,op.z);opM.rotation.y=0;
 const t=K.time;if(state==='play'){K.walk(meM,t*10,Math.min(1,Math.abs(K.axis().x)+Math.abs(K.axis().y)));K.walk(opM,t*10,.6);}
 ballM.position.set(b.x,b.y,b.z);ballM.rotation.x+=.05;shadow.position.set(b.x,.04,b.z);}
K._dbg=()=>({state,sc,serveT:+serveT.toFixed(1),b:[+b.x.toFixed(1),+b.y.toFixed(1),+b.z.toFixed(1)],me:[+me.x.toFixed(1),+me.z.toFixed(1)]});
K.loop(update);menu();
})();
