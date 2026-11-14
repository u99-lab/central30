// TITLE: Hóquei de Mesa
// Air hockey 3D no café: mexe o batedor, marca no adversário, primeiro a 7 ganha.
(()=>{'use strict';
const S=K.store('ah',{wins:[0,0,0],best:0});
document.documentElement.style.setProperty('--kc','#4fd0ff');
K.init({sky:0x120c26,fog:[30,90],fov:46,shadow:8,hemi:.55,sunI:.7,sunPos:[2,14,4],skyLight:0xb8c8ff,groundLight:0x261a40});
const scene=K.scene,cam=K.camera,TW=2.2,TL=4,PR=.13,MR=.2,GW=.62;
const RIV=[['Rui',.45],['Bia',.65],['Stôr Paulo',.85]];
// mesa
const tT=K.tex(256,512,(c,w,h)=>{c.fillStyle='#e9f6ff';c.fillRect(0,0,w,h);c.fillStyle='rgba(0,80,160,.12)';for(let y=6;y<h;y+=12)for(let x=6;x<w;x+=12){c.beginPath();c.arc(x,y,1.2,0,7);c.fill();}c.strokeStyle='#e8352c';c.lineWidth=5;c.beginPath();c.moveTo(0,h/2);c.lineTo(w,h/2);c.stroke();c.beginPath();c.arc(w/2,h/2,40,0,7);c.stroke();c.strokeStyle='#2a6bd7';for(const y of [0,h]){c.beginPath();c.arc(w/2,y,70,0,7);c.stroke();}});
const top=new THREE.Mesh(new THREE.PlaneGeometry(TW,TL),new THREE.MeshPhongMaterial({map:tT,shininess:120}));top.rotation.x=-Math.PI/2;top.position.y=.9;top.receiveShadow=true;scene.add(top);
for(const s of [-1,1]){K.box(.12,.14,TL+.24,0x2a6bd7,s*(TW/2+.06),.97,0);for(const e of [-1,1])K.box((TW-GW)/2,.14,.12,0x2a6bd7,e*(GW/2+(TW-GW)/4),.97,s*(TL/2+.06));}
K.box(TW+.3,.8,TL+.3,0x1b2340,0,.45,0);for(const [x,z] of [[-1,-1.8],[1,-1.8],[-1,1.8],[1,1.8]])K.box(.12,.5,.12,0x111111,x,.1,z);
// café à volta
K.plane(40,40,0x3a2a48,0,0,0);K.box(20,6,.3,0x2a1d3a,0,3,-8);K.box(.3,6,20,0x2a1d3a,-8,3,0);K.box(.3,6,20,0x2a1d3a,8,3,0);
const neon=K.tex(512,64,(c,w,h)=>{c.fillStyle='#120c26';c.fillRect(0,0,w,h);c.font='900 42px system-ui';c.textAlign='center';c.textBaseline='middle';c.shadowColor='#4fd0ff';c.shadowBlur=16;c.fillStyle='#bdf0ff';c.fillText('CAFÉ CENTRAL',w/2,34);});
const sg=new THREE.Mesh(new THREE.PlaneGeometry(6,.75),new THREE.MeshBasicMaterial({map:neon}));sg.position.set(0,3.6,-7.8);scene.add(sg);
for(const [x,c] of [[-3,0xff3d8b],[3,0x4fd0ff]]){const l=new THREE.PointLight(c,.9,10);l.position.set(x,3,-2);scene.add(l);}
K.box(2.4,1,.8,0x6a4d8a,-5,.5,-6);K.box(2.4,1,.8,0x6a4d8a,5,.5,-6);
// batedores e disco
const mallet=c=>{const g=new THREE.Group();K.cyl(MR,MR,.06,c,0,.03,0,g,24);K.cyl(.07,.08,.14,c,0,.12,0,g,14);K.sph(.08,c,0,.2,0,g,12);g.position.y=.9;scene.add(g);return g;};
const meM=mallet(0xe8352c),opM=mallet(0x2a6bd7);const puck=K.cyl(PR,PR,.04,0x111111,0,.92,0,null,24);
const me={x:0,z:1.4,vx:0,vz:0},op={x:0,z:-1.4,vx:0,vz:0},pk={x:0,z:0,vx:0,vz:0};
let state='menu',score=[0,0],lvl=0,serveT=0,ptr=null,ptrOn=false;
function reset(towards){pk.x=0;pk.z=towards>0?.6:-.6;pk.vx=pk.vz=0;serveT=.8;}
function start(l){lvl=l;score=[0,0];me.x=0;me.z=1.4;op.x=0;op.z=-1.4;reset(1);state='play';K.screen(null);K.play(true);hud();K.sfx.whistle();}
function hud(){K.hud(`<div class="k-tc"><div class="k-pill" style="text-align:center"><small>Primeiro a 7</small><b>${K.name()} ${score[0]} – ${score[1]} ${RIV[lvl][0]}</b></div></div><div class="k-bc"><div class="k-hint">${K.touch?'Arrasta o dedo para mexer o batedor':'Rato ou W A S D para mexer o batedor'}</div></div>`);}
function goal(who){score[who]++;K.flash(who===0?'GOLO!':'GOLO DELE',score[0]+' – '+score[1],1100,who===0?'#3dffa2':'#ff6b6b');if(who===0){K.sfx.good();K.confetti(new THREE.Vector3(0,1.4,-TL/2));}else K.sfx.bad();hud();
 if(score[who]>=7){setTimeout(()=>end(who===0),1200);state='over';return;}reset(who===0?-1:1);}
function end(win){state='end';K.play(false);if(win){S.data.wins[lvl]++;S.save();K.sfx.win();if(lvl===2)K.unlock('ah-stor','Hóquei · Ganhaste ao Stôr Paulo');if(score[1]===0)K.unlock('ah-7-0','Hóquei · 7–0!');}
 K.screen(`<div class="k-title">${win?'<em>Ganhaste!</em>':'Perdeste'}</div><div class="k-lead">${K.name()} ${score[0]} – ${score[1]} ${RIV[lvl][0]}</div><button class="k-go" data-a="r">Desforra</button>${win&&lvl<2?'<button class="k-alt" data-a="n">Próximo adversário</button>':''}<button class="k-alt" data-a="m">Menu</button>`,{r:()=>start(lvl),n:()=>start(lvl+1),m:menu});}
function menu(){state='menu';K.play(false);K.screen(`<div class="k-title">Hóquei de <em>Mesa</em></div><div class="k-lead">No Café Central. Mexe o batedor e manda o disco para a baliza dele.</div><div class="k-row">${RIV.map((r,i)=>`<button class="k-chip" data-a="go" data-v="${i}">vs ${r[0]}<small>${'★'.repeat(i+1)} · ${S.data.wins[i]} vitórias</small></button>`).join('')}</div>${K.keysHelp([['RATO','mexer o batedor'],['W A S D','mexer com o teclado'],['P','pausa']])}`,{go:v=>start(+v)});}
K.onQuit=menu;
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),pl=new THREE.Plane(new THREE.Vector3(0,1,0),-.9),hp=new THREE.Vector3(),cv=K.renderer.domElement;
const toTable=e=>{ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,cam);if(ray.ray.intersectPlane(pl,hp))ptr={x:hp.x,z:hp.z};};
cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||ptrOn)toTable(e);});cv.addEventListener('pointerdown',e=>{K.audio();ptrOn=true;toTable(e);});addEventListener('pointerup',()=>{ptrOn=false;});
function moveMallet(m,tx,tz,maxV,dt,zmin,zmax){tx=K.clamp(tx,-TW/2+MR,TW/2-MR);tz=K.clamp(tz,zmin,zmax);const dx=tx-m.x,dz=tz-m.z,d=Math.hypot(dx,dz),st=Math.min(d,maxV*dt);const nx=d?m.x+dx/d*st:m.x,nz=d?m.z+dz/d*st:m.z;m.vx=(nx-m.x)/dt;m.vz=(nz-m.z)/dt;m.x=nx;m.z=nz;}
function hit(m){const dx=pk.x-m.x,dz=pk.z-m.z,d=Math.hypot(dx,dz);if(d<PR+MR&&d>1e-4){const nx=dx/d,nz=dz/d;pk.x=m.x+nx*(PR+MR);pk.z=m.z+nz*(PR+MR);const rv=(pk.vx-m.vx)*nx+(pk.vz-m.vz)*nz;if(rv<0){pk.vx-=1.9*rv*nx;pk.vz-=1.9*rv*nz;K.tone(500+Math.min(600,-rv*60),.05,'triangle',.25,250);}}}
function update(dt){
 if(state==='menu'||state==='end'){const t=K.time*.2;cam.position.set(Math.sin(t)*4,3.2,Math.cos(t)*4);cam.lookAt(0,.9,0);return;}
 cam.position.set(0,3.4,3.3);cam.lookAt(0,.6,-.3);
 if(state!=='play'){puck.position.set(pk.x,.92,pk.z);return;}
 // tu
 let tx=me.x,tz=me.z;if(ptr){tx=ptr.x;tz=ptr.z;}const ax=K.axis();if(ax.x||ax.y){tx=me.x+ax.x*.6;tz=me.z-ax.y*.6;ptr=null;}
 moveMallet(me,tx,tz,9,dt,.12,TL/2-MR);
 // adversário: defende a baliza e ataca quando o disco está do lado dele
 const L=RIV[lvl][1];let ox=K.clamp(pk.x*(.5+L*.5),-GW,GW),oz=-TL/2+.45;if(pk.z<-.1&&pk.vz<3){ox=pk.x;oz=pk.z-(pk.z<-TL/2+.6?-.15:.12);}
 moveMallet(op,ox+Math.sin(K.time*3)*.05*(1-L),oz,3+L*5,dt,-TL/2+MR,-.12);
 if(serveT>0)serveT-=dt;
 const steps=6,h=dt/steps;for(let i=0;i<steps;i++){if(serveT<=0){pk.x+=pk.vx*h;pk.z+=pk.vz*h;}const f=Math.pow(.7,h);pk.vx*=f;pk.vz*=f;const sp=Math.hypot(pk.vx,pk.vz);if(sp>14){pk.vx*=14/sp;pk.vz*=14/sp;}
  if(Math.abs(pk.x)>TW/2-PR){pk.x=Math.sign(pk.x)*(TW/2-PR);pk.vx*=-.9;K.tone(300,.04,'square',.08);}
  if(Math.abs(pk.z)>TL/2-PR){if(Math.abs(pk.x)<GW/2){goal(pk.z<0?0:1);break;}pk.z=Math.sign(pk.z)*(TL/2-PR);pk.vz*=-.9;K.tone(300,.04,'square',.08);}
  hit(me);hit(op);}
 meM.position.set(me.x,.9,me.z);opM.position.set(op.x,.9,op.z);puck.position.set(pk.x,.92,pk.z);}
K._dbg=()=>({state,score,pk:[+pk.x.toFixed(2),+pk.z.toFixed(2)]});
K.loop(update);menu();
})();
