// TITLE: Mini-Golfe da Praia
// 9 buracos de mini-golfe com moinhos, areia, água e turbos.
(()=>{'use strict';
const S=K.store('mg',{best:0,aces:0});
document.documentElement.style.setProperty('--kc','#3dffa2');
K.init({sky:0x8fd3ff,fog:[70,200],fov:50,shadow:24,sunPos:[-14,34,-10],hemi:.62,sunI:.8});
const scene=K.scene,cam=K.camera,BR=.12,CUP=.24;
const HOLES=[
 {n:'Aquecimento',par:2,w:4,d:14},
 {n:'O Muro',par:2,w:5,d:15,walls:[[0,0,2.4,.5]]},
 {n:'Curva e Contracurva',par:3,w:10,d:14,tee:[-3.5,-5.6],cup:[3.5,5.6],walls:[[-1.5,2,7,.5],[1.5,-2,7,.5]]},
 {n:'Areal dos Pinos',par:3,w:6,d:16,sand:[[0,.5,6,3]],posts:[[-1.2,5,.4],[1.2,5,.4],[0,3.5,.4]]},
 {n:'O Moinho',par:3,w:5,d:16,spin:[[0,0,4.3,1.5]]},
 {n:'A Ponte',par:3,w:7,d:16,water:[[-2.25,-1,2.5,4],[2.25,-1,2.5,4]],slide:[[0,4,1.8,.45,2.2,1.4]]},
 {n:'Ziguezague Turbo',par:4,w:8,d:18,walls:[[-1.5,-4,5,.5],[1.5,0,5,.5],[-1.5,4,5,.5]],boost:[[3.1,-6.5,1.4,2.2,0,1],[-3.1,-2,1.4,2.2,0,1],[3.1,2,1.4,2.2,0,1]]},
 {n:'Pás Gémeas',par:4,w:6,d:18,spin:[[0,-2.5,4.6,1.4],[0,4,4.6,-1.9]],sand:[[-2.3,.8,1.4,3],[2.3,.8,1.4,3]]},
 {n:'Grande Final',par:4,w:10,d:20,water:[[0,-3,4,3]],walls:[[-3.4,2.5,.5,4],[3.4,2.5,.5,4]],slide:[[0,3,2.6,.45,1.7,1.3]],posts:[[-1,7.4,.35],[1,7.4,.35],[0,6,.35]]}];
// cenário fixo
K.plane(500,500,0xdcc084,0,-.06,0);
for(let i=0;i<26;i++){const a=K.rand(6.28),r=K.rand(16,60);K.palm(Math.cos(a)*r,Math.max(-30,Math.sin(a)*r),K.rand(.9,1.5));}
for(let i=0;i<8;i++){const x=K.rand(-50,50),z=K.rand(-30,-14);K.cyl(.06,.06,2.2,0xffffff,x,1.1,z,null,6);K.cyl(1.6,1.6,.3,K.pick([0xff3d5a,0xffd23f,0x2a8bff,0x35d07f]),x,2.2,z,null,8);}
for(let i=0;i<6;i++)K.cloud(K.rand(-120,120),K.rand(40,70),K.rand(-140,-40),K.rand(2,4));
const greenT=K.tex(128,128,(c,w)=>{for(let i=0;i<8;i++){c.fillStyle=i%2?'#2f9a4d':'#37a656';c.fillRect(0,i*16,w,16);}},[1,1]);
const boostT=K.tex(64,64,(c,w)=>{c.fillStyle='#ffd23f';c.fillRect(0,0,w,w);c.fillStyle='#ff7a2f';for(const y of [8,34]){c.beginPath();c.moveTo(8,y+22);c.lineTo(32,y);c.lineTo(56,y+22);c.lineTo(56,y+12);c.lineTo(32,y-10);c.lineTo(8,y+12);c.fill();}},[1,2]);
let world=null,H=null,hi=0,boxes=[],posts=[],spins=[],slides=[];
const ball=K.sph(BR,0xffffff,0,BR,0,null,14),bp={x:0,z:0},bv={x:0,z:0},last={x:0,z:0};
const dots=[];for(let i=0;i<9;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));scene.add(m);dots.push(m);}
let state='menu',strokes=0,card=[],practice=false,moving=false,sunk=0,aim={x:0,z:1,p:0},drag=null,flag=null,waterT=0;
function build(i){hi=i;H=HOLES[i];if(world)scene.remove(world);world=new THREE.Group();scene.add(world);boxes=[];posts=[];spins=[];slides=[];const w=H.w,d=H.d;
 H.tee=H.tee||[0,-d/2+1.4];H.cup=H.cup||[0,d/2-1.5];
 const g=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({map:(()=>{const t=greenT.clone();t.needsUpdate=true;t.repeat.set(1,d/4);return t;})()}));g.rotation.x=-Math.PI/2;g.position.y=.01;g.receiveShadow=true;world.add(g);
 const wall=(x,z,ww,dd,c=0xb9814a)=>{const m=K.box(ww,.4,dd,c,x,.2,z,world);K.box(ww+.06,.06,dd+.06,0xe9c9a0,x,.43,z,world);boxes.push({x,z,hw:ww/2,hd:dd/2,rot:0,m});return m;};
 wall(0,-d/2-.2,w+.8,.4);wall(0,d/2+.2,w+.8,.4);wall(-w/2-.2,0,.4,d);wall(w/2+.2,0,.4,d);
 for(const a of H.walls||[])wall(a[0],a[1],a[2],a[3]);
 for(const a of H.sand||[]){const m=K.plane(a[2],a[3],0xf2dc9b,a[0],.02,a[1],world);m.receiveShadow=true;}
 for(const a of H.water||[]){const m=K.plane(a[2],a[3],0x2f9bd8,a[0],.025,a[1],world);m.material=new THREE.MeshLambertMaterial({color:0x2f9bd8,transparent:true,opacity:.9});K.box(a[2]+.2,.05,a[3]+.2,0x1d6fa3,a[0],0,a[1],world);}
 for(const a of H.boost||[]){const t=boostT.clone();t.needsUpdate=true;const m=new THREE.Mesh(new THREE.PlaneGeometry(a[2],a[3]),new THREE.MeshBasicMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.set(a[0],.03,a[1]);world.add(m);a.t=t;}
 for(const a of H.posts||[]){K.cyl(a[2],a[2],.5,0xff3d5a,a[0],.25,a[1],world,14);K.cyl(a[2]+.04,a[2]+.04,.1,0xffffff,a[0],.5,a[1],world,14);posts.push({x:a[0],z:a[1],r:a[2],k:0});}
 for(const a of H.spin||[]){const p=new THREE.Group();p.position.set(a[0],0,a[1]);world.add(p);K.box(a[2],.35,.3,0xe8352c,0,.2,0,p);K.box(a[2]*.3,.36,.31,0xffffff,a[2]*.3,.2,0,p);K.box(a[2]*.3,.36,.31,0xffffff,-a[2]*.3,.2,0,p);K.cyl(.3,.34,.6,0x5d6680,0,.3,0,p,10);K.cyl(.06,.06,2.4,0x5d6680,0,1.2,0,p,6);const top=new THREE.Group();top.position.y=2.2;p.add(top);for(let k=0;k<4;k++){const b=K.box(.25,1.5,.05,0xffffff,0,0,0,top);b.position.set(Math.sin(k*1.57)*.75,Math.cos(k*1.57)*.75,.1);b.rotation.z=-k*1.57;}
  const b={x:a[0],z:a[1],hw:a[2]/2,hd:.15,rot:0,sp:a[3],g:p,top};boxes.push(b);spins.push(b);}
 for(const a of H.slide||[]){const m=K.box(a[2],.4,a[3],0x2a8bff,a[0],.2,a[1],world);K.box(a[2]+.05,.08,a[3]+.05,0xffffff,0,.2,0,m);const b={x:a[0],z:a[1],x0:a[0],hw:a[2]/2,hd:a[3]/2,rot:0,amp:a[4],sp:a[5],m};boxes.push(b);slides.push(b);}
 // praia à volta
 K.plane(300,120,0x2f9bd8,0,-.03,d/2+8+60,world);K.plane(300,1.6,0xffffff,0,-.02,d/2+8,world);K.plane(300,3,0xc9ad72,0,-.04,d/2+6,world);
 for(let k=0;k<22;k++){const sd=k%2?1:-1,x=sd*(w/2+K.rand(1.6,9)),z=K.rand(-d/2-4,d/2+4),r=Math.random();
  if(r<.3){K.cyl(.05,.05,2,0xffffff,x,1,z,world,6);const c=K.pick([0xff3d5a,0xffd23f,0x2a8bff,0x35d07f,0xff8a3d]);K.cyl(.1,1.4,.5,c,x,2.1,z,world,10);const t=K.box(.9,.04,1.9,K.pick([0xff8ac0,0x4fd0ff,0xffffff,0xffd23f]),x+1.3,.02,z,world);t.rotation.y=K.rand(-.4,.4);}
  else if(r<.5)K.palm(x,z,K.rand(.7,1.1),world);
  else if(r<.7){K.box(.9,.5,.9,0xcdb074,x,.25,z,world);K.box(.5,.4,.5,0xcdb074,x,.7,z,world);K.cyl(0,.2,.35,0xcdb074,x,1.05,z,world,6);K.box(.02,.4,.02,0x7a5234,x,1.3,z,world);K.box(.22,.14,.02,0xff3d5a,x+.11,1.42,z,world);}
  else if(r<.85){const b=K.sph(.32,K.pick([0xff3d5a,0xffffff,0x2a8bff]),x,.32,z,world,10);b.scale.y=1;}
  else{for(let q=0;q<5;q++){const st=K.box(.1,.05,.42,0xff7a5c,x,.03,z,world);st.rotation.y=q*1.256;st.position.x+=Math.sin(q*1.256)*.16;st.position.z+=Math.cos(q*1.256)*.16;}}}
 // buraco e bandeira
 const hole=new THREE.Mesh(new THREE.CircleGeometry(CUP,20),new THREE.MeshBasicMaterial({color:0x0b1020}));hole.rotation.x=-Math.PI/2;hole.position.set(H.cup[0],.03,H.cup[1]);world.add(hole);
 flag=new THREE.Group();flag.position.set(H.cup[0],0,H.cup[1]);K.cyl(.03,.03,2.4,0xffffff,0,1.2,0,flag,6);K.box(.7,.45,.03,0xff3d5a,.36,2.15,0,flag);world.add(flag);
 K.box(1.2,.03,.8,0x2b6f3b,H.tee[0],.02,H.tee[1],world);
 bp.x=H.tee[0];bp.z=H.tee[1];bv.x=bv.z=0;last.x=bp.x;last.z=bp.z;strokes=0;moving=false;sunk=0;ball.visible=true;ball.scale.setScalar(1);aim.p=0;const dx=H.cup[0]-bp.x,dz=H.cup[1]-bp.z,l=Math.hypot(dx,dz);aim.x=dx/l;aim.z=dz/l;
 cam.position.set(bp.x*.6,9.5,bp.z-9);}
function hud(){K.hud(`<div class="k-tl"><div class="k-pill"><small>Buraco ${hi+1}/9 · ${H.n}</small><b>Par ${H.par}</b></div></div><div class="k-tr"><div class="k-pill"><small>Tacadas</small><b>${strokes}</b></div>${practice?'':`<div class="k-pill"><small>Total</small><b>${card.reduce((a,b)=>a+b,0)+strokes}</b></div>`}</div>
 <div class="k-bc" style="flex-direction:column"><div class="k-meter"><i id="pw" style="width:0"></i></div><div class="k-hint">${K.touch?'Arrasta para trás e larga':'Arrasta o rato para trás e larga · ou ← → ↑ ↓ e ESPAÇO'}</div></div>`);}
function startHole(i){build(i);state='play';K.screen(null);K.play(true);hud();K.flash('Buraco '+(i+1),H.n+' · Par '+H.par,1500,'#fff');}
function menu(){state='menu';K.play(false);build(K.irand(0,8));dots.forEach(d=>d.visible=false);
 K.screen(`<div class="k-title">Mini-Golfe da <em>Praia</em></div><div class="k-lead">Nove buracos à beira-mar. Menos tacadas, melhor!</div><button class="k-go" data-a="go">⛳ Jogar os 9 buracos</button>
 <div class="k-lab">Treinar um buraco</div><div class="k-row">${HOLES.map((h,i)=>`<button class="k-chip" data-a="p" data-v="${i}">${i+1}</button>`).join('')}</div>
 <table class="k-tab"><tr><td>Melhor volta (par 28)</td><td>${S.data.best||'—'}</td></tr><tr><td>Buracos de primeira</td><td>${S.data.aces}</td></tr></table>${K.keysHelp([['RATO','arrastar para trás e largar'],['← →','apontar'],['↑ ↓','força'],['ESPAÇO','bater']])}`,
 {go:()=>{practice=false;card=[];startHole(0);},p:v=>{practice=true;card=[];startHole(+v);}});}
K.onQuit=menu;
function finishHole(){const s=strokes,d=s-H.par;K.flash(s===1?'DE PRIMEIRA!':d<=-2?'ÁGUIA!':d===-1?'BIRDIE!':d===0?'PAR':d===1?'BOGEY':'+'+d,s+(s===1?' tacada':' tacadas'),1700,d<=0?'#3dffa2':'#ffd23f');
 if(s===1){S.data.aces++;S.save();K.unlock('mg-ace','Mini-Golfe · De primeira!');K.sfx.win();K.confetti(new THREE.Vector3(H.cup[0],1,H.cup[1]));}else if(d<=0)K.sfx.good();
 setTimeout(()=>{if(state!=='play')return;if(practice)return menu();card.push(s);if(hi<8)startHole(hi+1);else endRound();},2000);}
function endRound(){state='end';K.play(false);const tot=card.reduce((a,b)=>a+b,0),rec=!S.data.best||tot<S.data.best;if(rec){S.data.best=tot;S.save();}if(tot<=28)K.unlock('mg-par','Mini-Golfe · Volta abaixo do par');K.sfx.win();
 K.screen(`<div class="k-title">Total <em>${tot}</em></div><div class="k-lead">${tot<28?(28-tot)+' abaixo do par!':tot===28?'Mesmo no par.':(tot-28)+' acima do par'}${rec?' · Novo recorde!':''}</div><table class="k-tab">${card.map((s,i)=>`<tr class="${s<=HOLES[i].par?'me':''}"><td>${i+1}. ${HOLES[i].n} <span style="opacity:.6">(par ${HOLES[i].par})</span></td><td>${s}</td></tr>`).join('')}</table><button class="k-go" data-a="r">Jogar outra vez</button><button class="k-alt" data-a="m">Menu</button>`,{r:()=>{card=[];startHole(0);},m:menu});}
function hitBall(){if(moving||sunk||aim.p<.04)return;const v=2+aim.p*15;bv.x=aim.x*v;bv.z=aim.z*v;last.x=bp.x;last.z=bp.z;moving=true;strokes++;K.tone(700,.07,'triangle',.25,300);K.noise(.05,.15,2000);aim.p=0;hud();}
// arrastar
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),pl=new THREE.Plane(new THREE.Vector3(0,1,0),0),hp=new THREE.Vector3();
const gp=e=>{ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,cam);return ray.ray.intersectPlane(pl,hp)?{x:hp.x,z:hp.z}:null;};
const cv=K.renderer.domElement;
cv.addEventListener('pointerdown',e=>{K.audio();if(state==='play'&&!moving&&!sunk&&!K.paused)drag=gp(e);});
addEventListener('pointermove',e=>{if(!drag)return;const p=gp(e);if(!p)return;const dx=drag.x-p.x,dz=drag.z-p.z,l=Math.hypot(dx,dz);if(l>.15){aim.x=dx/l;aim.z=dz/l;aim.p=Math.min(1,l/5);}else aim.p=0;});
addEventListener('pointerup',()=>{if(drag){drag=null;hitBall();}});
function collideBox(b){const c=Math.cos(b.rot),s=Math.sin(b.rot),dx=bp.x-b.x,dz=bp.z-b.z,lx=dx*c+dz*s,lz=-dx*s+dz*c,cx=K.clamp(lx,-b.hw,b.hw),cz=K.clamp(lz,-b.hd,b.hd);let ex=lx-cx,ez=lz-cz,d=Math.hypot(ex,ez);
 if(d>=BR)return;if(d<1e-5){if(b.hw-Math.abs(lx)<b.hd-Math.abs(lz)){ex=Math.sign(lx)||1;ez=0;d=-(b.hw-Math.abs(lx));}else{ex=0;ez=Math.sign(lz)||1;d=-(b.hd-Math.abs(lz));}}else{ex/=d;ez/=d;}
 const nx=ex*c-ez*s,nz=ex*s+ez*c,push=BR-d;bp.x+=nx*push;bp.z+=nz*push;const vn=bv.x*nx+bv.z*nz;if(vn<0){bv.x-=1.8*vn*nx;bv.z-=1.8*vn*nz;if(vn<-1)K.tone(240,.06,'square',.08,160);}
 if(b.sp!==undefined&&b.amp===undefined){const rx=bp.x-b.x,rz=bp.z-b.z;const tvx=-b.sp*rz,tvz=b.sp*rx,rel=(tvx-bv.x)*nx+(tvz-bv.z)*nz;if(rel>0){bv.x+=nx*rel*1.3;bv.z+=nz*rel*1.3;moving=true;}}
 else if(b.amp!==undefined&&b.vx){const rel=(b.vx-bv.x)*nx;if(rel>0){bv.x+=nx*rel*1.3;moving=true;}}}
function physics(dt){const sp=Math.hypot(bv.x,bv.z);let fr=1.0,dec=.9;for(const a of H.sand||[])if(Math.abs(bp.x-a[0])<a[2]/2&&Math.abs(bp.z-a[1])<a[3]/2){fr=4.5;dec=3;}
 for(const a of H.boost||[])if(Math.abs(bp.x-a[0])<a[2]/2&&Math.abs(bp.z-a[1])<a[3]/2){bv.x+=a[4]*26*dt;bv.z+=a[5]*26*dt;if(Math.random()<dt*20)K.tone(500,.05,'sine',.05,900);}
 if(sp>0){const ns=Math.max(0,sp*Math.exp(-fr*dt)-dec*dt);bv.x*=ns/sp;bv.z*=ns/sp;}
 bp.x+=bv.x*dt;bp.z+=bv.z*dt;for(const b of boxes)collideBox(b);
 for(const p of posts){const dx=bp.x-p.x,dz=bp.z-p.z,d=Math.hypot(dx,dz);if(d<p.r+BR&&d>1e-5){const nx=dx/d,nz=dz/d;bp.x=p.x+nx*(p.r+BR);bp.z=p.z+nz*(p.r+BR);const vn=bv.x*nx+bv.z*nz;if(vn<0){bv.x-=2.05*vn*nx;bv.z-=2.05*vn*nz;p.k=1;K.tone(880,.08,'square',.1,1320);}}}
 const hw=H.w/2-BR,hd=H.d/2-BR;if(bp.x<-hw){bp.x=-hw;bv.x=Math.abs(bv.x)*.8;}if(bp.x>hw){bp.x=hw;bv.x=-Math.abs(bv.x)*.8;}if(bp.z<-hd){bp.z=-hd;bv.z=Math.abs(bv.z)*.8;}if(bp.z>hd){bp.z=hd;bv.z=-Math.abs(bv.z)*.8;}
 for(const a of H.water||[])if(Math.abs(bp.x-a[0])<a[2]/2-.02&&Math.abs(bp.z-a[1])<a[3]/2-.02&&!waterT){waterT=.9;bv.x=bv.z=0;K.noise(.4,.3,900);K.burst(new THREE.Vector3(bp.x,.2,bp.z),[0x9fd8ff,0xffffff],16,3,5,.7);K.flash('SPLASH!','+1 tacada',900,'#4fd0ff');strokes++;hud();}
 const cx=H.cup[0]-bp.x,cz=H.cup[1]-bp.z,cd=Math.hypot(cx,cz),s2=Math.hypot(bv.x,bv.z);
 if(cd<CUP){if(s2<6.5){sunk=.0001;moving=false;bv.x=bv.z=0;K.tone(520,.1,'sine',.25,260);K.tone(390,.2,'sine',.2,0,.1);finishHole();}else if(cd>.03){bv.x+=cx/cd*8*dt;bv.z+=cz/cd*8*dt;}}
 else if(cd<CUP+.25&&s2<3){bv.x+=cx/cd*3*dt;bv.z+=cz/cd*3*dt;}}
function update(dt){if(!H)return;
 for(const s of spins){s.rot+=s.sp*dt;s.g.rotation.y=-s.rot;s.top.rotation.z+=dt*2;}
 for(const s of slides){const nx=s.x0+Math.sin(K.time*s.sp)*s.amp;s.vx=(nx-s.x)/dt;s.x=nx;s.m.position.x=nx;}
 for(const a of H.boost||[])a.t.offset.y=(K.time*1.5)%1;for(const p of posts)if(p.k>0)p.k-=dt*4;
 if(flag){flag.children[1].rotation.y=Math.sin(K.time*3)*.3;const d=Math.hypot(H.cup[0]-bp.x,H.cup[1]-bp.z);flag.position.y=K.damp(flag.position.y,d<1.6?1.6:0,6,dt);}
 if(state==='menu'||state==='end'){const t=K.time*.2;cam.position.set(Math.sin(t)*(H.w+6),8,Math.cos(t)*(H.d*.6+4));cam.lookAt(0,0,0);ball.position.set(bp.x,BR,bp.z);return;}
 if(waterT>0){waterT-=dt;ball.visible=false;if(waterT<=0){waterT=0;bp.x=last.x;bp.z=last.z;bv.x=bv.z=0;moving=false;ball.visible=true;}}
 else if(sunk){sunk+=dt;ball.position.y=BR-Math.min(.3,sunk*1.2);ball.scale.setScalar(Math.max(.4,1-sunk));}
 else{const st=4;for(let i=0;i<st;i++)physics(dt/st);const sp=Math.hypot(bv.x,bv.z);if(moving&&sp<.07&&!sunk){bv.x=bv.z=0;moving=false;if(strokes>=9&&state==='play'){K.flash('Limite de tacadas','',1000,'#ff6b6b');strokes=10;sunk=.0001;finishHole();}}if(sp>.07)moving=true;
  ball.position.set(bp.x,BR,bp.z);ball.rotation.x+=bv.z*dt/BR;ball.rotation.z-=bv.x*dt/BR;}
 // mira pelo teclado
 if(!moving&&!sunk&&!drag){const r=(K.down('ArrowLeft','KeyA')?1:0)-(K.down('ArrowRight','KeyD')?1:0);if(r){const a=Math.atan2(aim.x,aim.z)+r*1.4*dt;aim.x=Math.sin(a);aim.z=Math.cos(a);}aim.p=K.clamp(aim.p+((K.down('ArrowUp','KeyW')?1:0)-(K.down('ArrowDown','KeyS')?1:0))*.6*dt,0,1);if(K.hit('Space','Enter'))hitBall();}
 const show=!moving&&!sunk&&aim.p>.03;dots.forEach((d,i)=>{d.visible=show;if(show)d.position.set(bp.x+aim.x*(.4+i*(.25+aim.p*.55)),.12,bp.z+aim.z*(.4+i*(.25+aim.p*.55)));});
 const pw=K.$('pw');if(pw)pw.style.width=aim.p*100+'%';
 const tx=bp.x*.75,tz=bp.z-8.2;cam.position.x=K.damp(cam.position.x,tx,3,dt);cam.position.z=K.damp(cam.position.z,tz,3,dt);cam.position.y=K.damp(cam.position.y,8.6,3,dt);cam.lookAt(cam.position.x,0,cam.position.z+10.2);}
K._dbg={hit:(x,z,p)=>{const l=Math.hypot(x,z);aim.x=x/l;aim.z=z/l;aim.p=p;hitBall();},st:()=>({x:+bp.x.toFixed(2),z:+bp.z.toFixed(2),strokes,moving,sunk:!!sunk,hi})};
K.loop(update);menu();
})();
