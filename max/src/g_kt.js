// TITLE: Kart da Marginal
// Corridas de karts com derrapagens, turbos e objetos, em 3 pistas.
(()=>{'use strict';
const S=K.store('kt',{cups:0,best:{},wins:0});
document.documentElement.style.setProperty('--kc','#ff8a3d');
K.init({sky:0x8fd3ff,fog:[140,460],fov:62,far:1000,shadow:55,sunPos:[40,70,30]});
const scene=K.scene,cam=K.camera;
const TRACKS=[
 {n:'Marginal da Figueira',th:'praia',pts:[[0,0],[60,-10],[110,10],[130,60],[100,100],[50,90],[20,120],[-40,130],[-80,90],[-60,40],[-90,0],[-50,-30]]},
 {n:'Serra da Boa Viagem',th:'serra',pts:[[0,0],[50,0],[90,-30],[140,-20],[150,30],[110,50],[120,100],[70,120],[40,80],[0,110],[-50,90],[-40,40],[-80,10],[-40,-20]]},
 {n:'Noite em Tavarede',th:'noite',pts:[[0,0],[70,0],[100,30],[70,60],[100,90],[70,120],[10,110],[-20,70],[-70,90],[-110,50],[-80,10],[-100,-30],[-50,-40]]}];
const THEME={praia:{sky:0x8fd3ff,ground:0xefd9a3,hemi:.85,sun:.85,fog:[140,460],sunC:0xfff1d0},serra:{sky:0xffb984,ground:0x4f8a45,hemi:.72,sun:.8,fog:[90,340],sunC:0xffc890},noite:{sky:0x0d1330,ground:0x1c2238,hemi:.5,sun:.4,fog:[70,300],sunC:0x9fb4ff}};
const HW=6.5,N=640,LAPS=3,NAMES=['Tu','Rui','Bia','Isaac','Mika','Bruno'],COLS=[0xff3d5a,0x2a8bff,0xffd23f,0x35d07f,0xb46bff,0xff8a3d],DIFF=[['Fácil',.84],['Normal',.92],['Difícil',1]];
let world=null,P=[],Tn=[],Nr=[],curv=[],seg=1,track=null,ti=0,diff=1;
const roadT=K.tex(128,128,(c,w,h)=>{c.fillStyle='#3d414d';c.fillRect(0,0,w,h);for(let i=0;i<500;i++){c.fillStyle=Math.random()<.5?'#454a57':'#373b46';c.fillRect(Math.random()*w,Math.random()*h,2,2);}c.fillStyle='#f4f4f4';c.fillRect(5,0,4,h);c.fillRect(w-9,0,4,h);c.fillStyle='#ffd23f';c.fillRect(62,0,4,h*.5);},[1,1]);
const curbT=K.tex(32,64,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#e8352c';c.fillRect(0,0,w,h/2);},[1,1]);
const qT=K.tex(64,64,(c,w)=>{c.fillStyle='#ffd23f';c.fillRect(0,0,w,w);c.fillStyle='#ff8a3d';c.fillRect(0,0,w,6);c.fillRect(0,w-6,w,6);c.fillRect(0,0,6,w);c.fillRect(w-6,0,6,w);c.fillStyle='#1b2340';c.font='900 46px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('?',32,35);});
const winT=K.tex(64,64,(c,w)=>{c.fillStyle='#232a48';c.fillRect(0,0,w,w);for(let y=6;y<w;y+=14)for(let x=5;x<w;x+=13){c.fillStyle=Math.random()<.55?'#ffe9a0':'#2f385c';c.fillRect(x,y,7,8);}},[2,3]);
function ribbon(o1,o2,y,mat,vs){const pos=[],uv=[],idx=[];for(let i=0;i<=N;i++){const p=P[i%N],n=Nr[i%N];pos.push(p.x+n.x*o1,y,p.z+n.z*o1,p.x+n.x*o2,y,p.z+n.z*o2);uv.push(0,i*vs,1,i*vs);if(i<N){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.receiveShadow=true;world.add(m);return m;}
const farFrom=(x,z,d)=>{for(let i=0;i<N;i+=3){const dx=P[i].x-x,dz=P[i].z-z;if(dx*dx+dz*dz<d*d)return false;}return true;};
function buildTrack(i){ti=i;if(world)scene.remove(world);world=new THREE.Group();scene.add(world);track=TRACKS[i];const th=THEME[track.th];
 scene.background.set(th.sky);scene.fog.color.set(th.sky);scene.fog.near=th.fog[0];scene.fog.far=th.fog[1];K.hemi.intensity=th.hemi;K.sun.intensity=th.sun;K.sun.color.set(th.sunC);
 const curve=new THREE.CatmullRomCurve3(track.pts.map(p=>new THREE.Vector3(p[0],0,p[1])),true,'centripetal'),pts=curve.getSpacedPoints(N);P=pts.slice(0,N);Tn=[];Nr=[];curv=[];seg=curve.getLength()/N;
 for(let j=0;j<N;j++){const a=P[(j+N-1)%N],b=P[(j+1)%N],t=new THREE.Vector3(b.x-a.x,0,b.z-a.z).normalize();Tn.push(t);Nr.push(new THREE.Vector3(-t.z,0,t.x));}
 for(let j=0;j<N;j++){const a=Tn[(j+N-6)%N],b=Tn[(j+6)%N];curv.push(Math.abs(K.angDiff(Math.atan2(a.x,a.z),Math.atan2(b.x,b.z))));}
 const g=K.plane(1400,1400,th.ground,20,-.05,50,world);g.receiveShadow=true;
 ribbon(-HW,HW,.01,new THREE.MeshLambertMaterial({map:roadT,side:THREE.DoubleSide}),seg/8);
 const cm=new THREE.MeshLambertMaterial({map:curbT,side:THREE.DoubleSide});ribbon(-HW-1.1,-HW,.02,cm,seg/3);ribbon(HW,HW+1.1,.02,cm,seg/3);
 // partida
 const s0=P[0],t0=Tn[0],n0=Nr[0],ang=Math.atan2(t0.x,t0.z);
 const chk=new THREE.Mesh(new THREE.PlaneGeometry(HW*2,2),new THREE.MeshBasicMaterial({map:K.tex(128,16,(c,w,h)=>{for(let x=0;x<16;x++)for(let y=0;y<2;y++){c.fillStyle=(x+y)%2?'#111':'#fff';c.fillRect(x*8,y*8,8,8);}})}));chk.rotation.order='YXZ';chk.rotation.set(-Math.PI/2,ang,0);chk.position.set(s0.x,.03,s0.z);world.add(chk);
 for(const s of [-1,1])K.cyl(.25,.25,7,0xdddddd,s0.x+n0.x*s*(HW+1.6),3.5,s0.z+n0.z*s*(HW+1.6),world,8);
 const ban=new THREE.Mesh(new THREE.BoxGeometry(HW*2+3.6,1.6,.4),new THREE.MeshBasicMaterial({map:K.tex(512,64,(c,w,h)=>{c.fillStyle='#1b2340';c.fillRect(0,0,w,h);c.fillStyle='#ffd23f';c.font='900 40px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('PARTIDA  ·  '+track.n.toUpperCase(),w/2,34,w-20);})}));ban.position.set(s0.x,6.6,s0.z);ban.rotation.y=ang;world.add(ban);
 // cenário
 const rnd=()=>{const j=K.irand(0,N-1),s=K.pick([-1,1]),d=HW+K.rand(5,60);return [P[j].x+Nr[j].x*s*d,P[j].z+Nr[j].z*s*d];};
 if(track.th==='praia'){const sea=K.plane(1400,500,0x2f9bd8,20,-.02,-285,world);sea.receiveShadow=false;K.plane(1400,14,0xfff6dc,20,-.01,-42,world);
  for(let k=0;k<70;k++){const [x,z]=rnd();if(z>-36&&farFrom(x,z,HW+4))K.palm(x,z,K.rand(.9,1.5),world);}
  for(let k=0;k<26;k++){const [x,z]=rnd();if(z>-30&&farFrom(x,z,HW+11)){const h=K.rand(8,26),b=K.box(K.rand(8,13),h,K.rand(8,13),K.pick([0xfff2e0,0xffd7b8,0xbfe6ff,0xffe59a,0xf4b6c2]),x,h/2,z,world);b.rotation.y=K.rand(3);K.box(3,.5,3,0xe8452c,x,h+.25,z,world);}}
  for(let k=0;k<30;k++){const [x,z]=rnd();if(z>-36&&farFrom(x,z,HW+3)){const u=new THREE.Group();u.position.set(x,0,z);K.cyl(.06,.06,2.2,0xffffff,0,1.1,0,u,6);K.cyl(1.6,1.6,.1,K.pick([0xff3d5a,0xffd23f,0x2a8bff,0x35d07f]),0,2.2,0,u,8).scale.y=3;world.add(u);}}}
 else if(track.th==='serra'){for(let k=0;k<230;k++){const [x,z]=rnd();if(farFrom(x,z,HW+4)){const s=K.rand(1,2.4),t=new THREE.Group();t.position.set(x,0,z);t.scale.setScalar(s);K.cyl(.15,.2,1,0x6b4a2e,0,.5,0,t,6);K.cyl(0,1.2,2.2,0x2f7d43,0,2,0,t,7);K.cyl(0,.9,1.8,0x37914e,0,3.2,0,t,7);world.add(t);}}
  for(let k=0;k<40;k++){const [x,z]=rnd();if(farFrom(x,z,HW+3)){const r=K.sph(K.rand(.8,2.6),0x8d8f98,x,.2,z,world,6);r.scale.y=.7;}}
  for(let k=0;k<5;k++){const a=k*1.3,m=K.cyl(0,K.rand(90,140),K.rand(70,120),0x5d7f6a,Math.cos(a)*420+20,30,Math.sin(a)*420+50,world,6);m.castShadow=false;}}
 else{const bm=new THREE.MeshBasicMaterial({map:winT});for(let k=0;k<90;k++){const [x,z]=rnd();if(farFrom(x,z,HW+10)){const h=K.rand(8,34),b=new THREE.Mesh(new THREE.BoxGeometry(K.rand(8,14),h,K.rand(8,14)),bm);b.position.set(x,h/2,z);world.add(b);}}
  for(let j=0;j<N;j+=20){const s=(j/20)%2?1:-1,x=P[j].x+Nr[j].x*s*(HW+2.2),z=P[j].z+Nr[j].z*s*(HW+2.2);K.cyl(.1,.14,6,0x8a93ad,x,3,z,world,6);const l=new THREE.Mesh(new THREE.SphereGeometry(.45,8,6),new THREE.MeshBasicMaterial({color:0xfff0b0}));l.position.set(x-Nr[j].x*s*.9,6,z-Nr[j].z*s*.9);world.add(l);const pool=new THREE.Mesh(new THREE.CircleGeometry(4.5,16),new THREE.MeshBasicMaterial({color:0xfff0b0,transparent:true,opacity:.13,depthWrite:false}));pool.rotation.x=-Math.PI/2;pool.position.set(x-Nr[j].x*s*3,.04,z-Nr[j].z*s*3);world.add(pool);}
  for(let k=0;k<60;k++){const st=new THREE.Mesh(new THREE.SphereGeometry(.9,5,4),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}));st.position.set(K.rand(-500,500),K.rand(120,300),K.rand(-500,500));world.add(st);}}
 for(let k=0;k<6;k++){const c=K.cloud(K.rand(-300,300),K.rand(70,110),K.rand(-300,300),K.rand(3,6));scene.remove(c);world.add(c);if(track.th==='noite')c.visible=false;}
 // caixas
 boxes=[];for(const f of [.16,.42,.66,.86])for(const l of [-3.6,0,3.6]){const j=Math.floor(f*N),m=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,1.2),new THREE.MeshBasicMaterial({map:qT}));m.position.set(P[j].x+Nr[j].x*l,1.2,P[j].z+Nr[j].z*l);world.add(m);boxes.push({m,t:0});}
 for(const b of bananas)scene.remove(b.m);bananas=[];for(const b of balls)scene.remove(b.m);balls=[];}
let boxes=[],bananas=[],balls=[];
// ----- karts
function mkKart(col){const g=new THREE.Group(),b=new THREE.Group();g.add(b);K.box(1.15,.3,2,col,0,.38,0,b);K.box(.85,.24,.8,col,0,.44,1.05,b);K.box(1.4,.14,.3,0x1b1f2e,0,.3,1.45,b);K.box(1.4,.1,.5,0x1b1f2e,0,.95,-1,b);K.box(.1,.5,.1,0x1b1f2e,-.5,.7,-1,b);K.box(.1,.5,.1,0x1b1f2e,.5,.7,-1,b);
 K.box(.6,.55,.2,0x1b1f2e,0,.75,-.6,b);K.box(.5,.5,.36,0xffffff,0,.85,-.3,b);K.sph(.27,col,0,1.32,-.28,b,10);K.box(.36,.14,.1,0x1b2340,0,1.34,-.05,b);K.cyl(.2,.2,.05,0x1b1f2e,0,.85,.25,b,10).rotation.x=1.1;
 const w=[];for(const [x,z] of [[-.78,.8],[.78,.8],[-.8,-.75],[.8,-.75]]){const p=new THREE.Group();p.position.set(x,.32,z);const m=K.cyl(.32,.32,.3,0x16181f,0,0,0,p,12);m.rotation.z=Math.PI/2;K.cyl(.15,.15,.32,0xdddddd,0,0,0,p,8).rotation.z=Math.PI/2;g.add(p);w.push(p);}
 g.userData={b,w};scene.add(g);return g;}
let karts=[],me=null,state='menu',raceT=0,startT=0,order=[],cup=null,finishN=0,eng=null,engG=null,lapT=0,bestLap=0,startBoostOk=false;
function grid(){for(const k of karts)scene.remove(k.g);karts=[];const ord=[1,2,3,4,5,0];
 ord.forEach((id,slot)=>{const back=6+slot*4.2,j=((N-Math.round(back/seg))%N+N)%N,lat=(slot%2?1:-1)*2.6,k={id,name:NAMES[id],g:mkKart(COLS[id]),x:P[j].x+Nr[j].x*lat,z:P[j].z+Nr[j].z*lat,a:Math.atan2(Tn[j].x,Tn[j].z),sp:0,idx:j,prog:j-N,lat,dr:0,ch:0,boost:0,spin:0,item:null,itT:0,fin:0,ai:id!==0,skill:DIFF[diff][1]*(1-(id-1)*.018),tl:lat,top:31,steer:0,va:0};
  karts.push(k);if(id===0)me=k;});}
const ITEMS={turbo:'🚀',banana:'🍌',bola:'⚽'};
function giveItem(k){const pos=order.indexOf(k),r=Math.random();k.item=pos===0?(r<.7?'banana':'turbo'):pos>=4?(r<.5?'turbo':'bola'):(r<.36?'turbo':r<.68?'banana':'bola');k.itT=K.rand(1,4);if(k===me){K.sfx.coin();hudItem();}}
function useItem(k){const it=k.item;if(!it)return;k.item=null;if(k===me)hudItem();
 if(it==='turbo'){k.boost=1.6;if(k===me)K.sfx.boost();}
 else if(it==='banana'){const m=new THREE.Group();K.sph(.42,0xffe14a,0,.35,0,m,8).scale.set(1,.55,1.5);scene.add(m);const x=k.x-Math.sin(k.a)*2.4,z=k.z-Math.cos(k.a)*2.4;m.position.set(x,0,z);bananas.push({m,x,z,o:k,t:0});if(k===me)K.sfx.whoosh();}
 else{const m=K.sph(.5,0xffffff,k.x,.6,k.z,scene,10);balls.push({m,s:k.idx+3,lat:k.lat,o:k,t:0});if(k===me)K.sfx.kick();}}
function spinOut(k,why){if(k.spin>0||k.fin)return;k.spin=1.25;k.boost=0;k.dr=0;k.ch=0;K.burst(new THREE.Vector3(k.x,.8,k.z),[0xffd23f,0xffffff],16,5,5,.7);if(k===me){K.sfx.hit();K.shake=.5;K.flash(why,'',900,'#ff6b6b');}}
function nearest(k){let best=k.idx,bd=1e9;for(let j=-14;j<=14;j++){const i=((k.idx+j)%N+N)%N,d=(P[i].x-k.x)**2+(P[i].z-k.z)**2;if(d<bd){bd=d;best=i;}}let di=best-k.idx;if(di>N/2)di-=N;if(di<-N/2)di+=N;k.prog+=di;k.idx=best;k.lat=(k.x-P[best].x)*Nr[best].x+(k.z-P[best].z)*Nr[best].z;}
function stepKart(k,dt){let thr=0,steer=0,drift=false;
 if(state==='race'&&!k.spin){if(k.ai){const look=Math.round(7+Math.abs(k.sp)*.35),i=(k.idx+look)%N;if(Math.random()<dt*.4)k.tl=K.rand(-4.2,4.2);const tx=P[i].x+Nr[i].x*k.tl,tz=P[i].z+Nr[i].z*k.tl,d=K.angDiff(k.a,Math.atan2(tx-k.x,tz-k.z));steer=K.clamp(-d*2.6,-1,1);
   let cv=0;for(let j=3;j<24;j+=3)cv=Math.max(cv,curv[(k.idx+j)%N]);let gap=me.prog-k.prog,rb=gap>50?1.07:gap<-70?.95:1;if(k.fin)rb=.8;const vt=Math.min(k.top*k.skill*rb,19.5/Math.max(.05,cv));thr=k.sp>vt?-.4:1;
   if(k.item){k.itT-=dt;if(k.itT<=0&&(k.item!=='turbo'||cv<.2))useItem(k);}}
  else if(!k.fin){const ax=K.axis();steer=ax.x;thr=K.touch&&!K.down('KeyS','ArrowDown','KeyB')?(ax.y<-.6?-1:1):ax.y>0.2?1:ax.y<-.2?-1:0;drift=K.down('Space');if(K.hit('KeyE','ShiftLeft','ShiftRight','KeyX'))useItem(k);}
  else{const i=(k.idx+10)%N,d=K.angDiff(k.a,Math.atan2(P[i].x-k.x,P[i].z-k.z));steer=K.clamp(-d*2.6,-1,1);thr=k.sp>16?0:1;}}
 const off=Math.abs(k.lat)>HW+.9;if(k.boost>0)k.boost-=dt;
 if(k.spin>0){k.spin-=dt;k.sp*=Math.pow(.12,dt);k.va+=dt*14;if(k.spin<=0){k.va=0;k.spin=0;}}
 else{const max=(k.boost>0?42:k.top*(k.ai?1:1))*(off&&k.boost<=0?.48:1),target=thr>0?max:thr<0?-9:0;if(k.sp<target)k.sp=Math.min(target,k.sp+(k.boost>0?34:13)*dt);else k.sp=Math.max(target,k.sp-(thr<0?30:off?24:8)*dt);
  if(!k.ai){if(drift&&!k.dr&&Math.abs(steer)>.3&&k.sp>13){k.dr=Math.sign(steer);k.ch=0;}
   if(k.dr){if(!drift||k.sp<9){if(k.ch>.7){k.boost=.45+Math.min(1.25,k.ch*.42);K.sfx.boost();K.flash(k.ch>2?'SUPER TURBO!':'TURBO!','',600,k.ch>2?'#ff8a3d':'#4fd0ff');if(k.ch>3.2)K.unlock('kt-drift','Kart · Derrapagem de mestre');}k.dr=0;k.ch=0;}else{k.ch+=dt*(.7+.6*Math.max(0,steer*k.dr));steer=k.dr*.6+steer*.7;if(Math.random()<dt*30)K.burst(new THREE.Vector3(k.x-Math.sin(k.a)*1,.2,k.z-Math.cos(k.a)*1),k.ch>2?0xff8a3d:k.ch>.7?0x4fd0ff:0xdddddd,2,2,2.5,.35);}}}
  k.a-=steer*(k.dr?2.5:1.95)*Math.min(1,Math.abs(k.sp)/9)*(k.sp<0?-1:1)*dt;}
 k.steer=K.damp(k.steer,steer,10,dt);const ma=k.a+k.dr*.24;k.x+=Math.sin(ma)*k.sp*dt;k.z+=Math.cos(ma)*k.sp*dt;nearest(k);
 const lim=HW+7.5;if(Math.abs(k.lat)>lim){const ex=k.lat-Math.sign(k.lat)*lim,n=Nr[k.idx];k.x-=n.x*ex;k.z-=n.z*ex;k.sp*=Math.pow(.2,dt);k.lat=Math.sign(k.lat)*lim;}
 // objetos
 if(state==='race'&&!k.fin){for(const b of boxes)if(!k.item&&(k.ai||b.t<=0)&&(b.m.position.x-k.x)**2+(b.m.position.z-k.z)**2<(k.ai?3.6:5.5)){giveItem(k);if(!k.ai){b.t=2;b.m.visible=false;K.burst(b.m.position,[0xffd23f,0xff8a3d],10,4,4,.5);K.flash(ITEMS[k.item],'E para usar',700,'#fff');}}
  for(let i=bananas.length-1;i>=0;i--){const b=bananas[i];if((b.o!==k||b.t>.6)&&(b.x-k.x)**2+(b.z-k.z)**2<2){scene.remove(b.m);bananas.splice(i,1);spinOut(k,'CASCA!');}}}
 const g=k.g,u=g.userData;g.position.set(k.x,0,k.z);g.rotation.y=k.a-k.dr*.38+k.va;u.b.rotation.z=K.damp(u.b.rotation.z,k.steer*.07*Math.min(1,k.sp/20)+k.dr*.05,8,dt);u.b.position.y=off&&Math.abs(k.sp)>4?Math.sin(K.time*40+k.id)*.05:0;
 for(let i=0;i<4;i++){u.w[i].children[0].rotation.x+=k.sp*dt/.32;u.w[i].children[1].rotation.x+=k.sp*dt/.32;if(i<2)u.w[i].rotation.y=-k.steer*.45;}}
// ----- corrida
function startRace(i){buildTrack(i);grid();state='count';startT=3.6;raceT=0;lapT=0;bestLap=0;finishN=0;order=karts.slice();K.screen(null);K.play(true);K.useStick=true;K.pad([['Space','Derrapar'],['KeyE','Objeto'],['KeyB','Travar']]);hud();engine(true);camSnap();K.flash('3','',700,'#ffd23f');}
function engine(on){const ac=K.audio();if(!ac)return;if(on&&!eng){eng=ac.createOscillator();eng.type='sawtooth';const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=700;engG=ac.createGain();engG.gain.value=0;eng.connect(f);f.connect(engG);engG.connect(ac.destination);eng.start();}if(!on&&eng){try{eng.stop();}catch{}eng=null;engG=null;}}
function hud(){K.hud(`<div class="k-tl" style="flex-direction:column;align-items:flex-start"><div class="k-pill"><small>Posição</small><b id="hp" style="font-size:34px">6º</b><span style="opacity:.6"> /6</span></div><canvas id="mm" width="120" height="120" style="width:120px;height:120px;background:#0b102099;border-radius:14px;border:2px solid #ffffff2e"></canvas></div>
 <div class="k-tr"><div class="k-pill"><small>Volta</small><b id="hl">1/${LAPS}</b></div><div class="k-pill"><small>Tempo</small><b id="ht">0:00.0</b></div></div>
 <div class="k-tc"><div class="k-pill" style="min-width:64px;text-align:center"><small>Objeto</small><b id="hi" style="font-size:26px">–</b></div></div><div class="k-bc"><div class="k-meter" id="hdw" style="width:160px;height:14px;opacity:0"><i id="hd" style="width:0;background:#4fd0ff"></i></div></div>`);}
function hudItem(){const e=K.$('hi');if(e)e.textContent=me.item?ITEMS[me.item]:'–';}
const tfmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')+'.'+Math.floor(t*10%10);
let camA=0;function camSnap(){camA=me.a;cam.position.set(me.x-Math.sin(me.a)*8,4,me.z-Math.cos(me.a)*8);}
function finishRace(){state='done';engine(false);K.play(false);const res=karts.slice().sort((a,b)=>(a.fin||1e9)-(b.fin||1e9)||b.prog-a.prog),pos=res.indexOf(me)+1,PTS=[10,7,5,3,2,1];
 const key=ti+'-'+diff,old=S.data.best[key];if(!old||me.fin<old)S.data.best[key]=+me.fin.toFixed(2);if(pos===1){S.data.wins++;K.sfx.win();K.unlock('kt-win'+ti,'Kart · Vitória em '+track.n);}else if(pos<=3)K.sfx.good();else K.sfx.bad();
 if(cup){res.forEach((k,i)=>cup.pts[k.id]+=PTS[i]);cup.r++;}S.save();
 const tab='<table class="k-tab">'+res.map((k,i)=>`<tr class="${k===me?'me':''}"><td>${i+1}º &nbsp;${k.name}</td><td>${k.fin?tfmt(k.fin):'—'}${cup?' &nbsp;+'+PTS[i]:''}</td></tr>`).join('')+'</table>';
 if(cup&&cup.r>=3){const tot=karts.slice().sort((a,b)=>cup.pts[b.id]-cup.pts[a.id]),won=tot[0]===me;if(won){S.data.cups++;S.save();K.unlock('kt-cup','Kart · Taça da Costa de Prata');K.sfx.win();}
  K.screen(`<div class="k-title">${won?'🏆 <em>Taça ganha!</em>':'Fim da taça'}</div><table class="k-tab">${tot.map((k,i)=>`<tr class="${k===me?'me':''}"><td>${i+1}º &nbsp;${k.name}</td><td>${cup.pts[k.id]} pts</td></tr>`).join('')}</table><button class="k-go" data-a="m">Menu</button>`,{m:menu});cup=null;return;}
 K.screen(`<div class="k-title">${pos===1?'<em>1.º lugar!</em>':pos+'.º lugar'}</div><div class="k-lead">${track.n} · melhor volta ${bestLap?tfmt(bestLap):'—'}</div>${tab}<button class="k-go" data-a="n">${cup?'Próxima corrida':'Repetir'}</button><button class="k-alt" data-a="m">Menu</button>`,{n:()=>startRace(cup?cup.r:ti),m:menu});}
function menu(){state='menu';engine(false);K.play(false);if(!world)buildTrack(0);if(!karts.length)grid();
 K.screen(`<div class="k-title">Kart da <em>Marginal</em></div><div class="k-lead">Derrapa para ganhar turbo, apanha as caixas e chega em primeiro.</div>
 <div class="k-lab">Dificuldade</div><div class="k-row">${DIFF.map((d,i)=>`<button class="k-chip${i===diff?' on':''}" data-a="d" data-v="${i}">${d[0]}</button>`).join('')}</div>
 <button class="k-go" data-a="cup">🏆 Taça da Costa de Prata (3 corridas)</button>
 <div class="k-lab">Corrida única</div><div class="k-row">${TRACKS.map((t,i)=>`<button class="k-chip" data-a="one" data-v="${i}">${t.n}<small>${S.data.best[i+'-'+diff]?'recorde '+tfmt(S.data.best[i+'-'+diff]):'sem recorde'}</small></button>`).join('')}</div>
 <table class="k-tab"><tr><td>Taças</td><td>${S.data.cups}</td></tr><tr><td>Vitórias</td><td>${S.data.wins}</td></tr></table>
 ${K.keysHelp([['W A S D','conduzir'],['ESPAÇO','derrapar (larga = turbo)'],['E','usar objeto'],['P','pausa']])}`,
 {d:v=>{diff=+v;menu();},cup:()=>{cup={r:0,pts:[0,0,0,0,0,0]};startRace(0);},one:v=>{cup=null;startRace(+v);}});}
K.onQuit=()=>{cup=null;menu();};
function update(dt){if(state==='menu'||state==='done'){const t=K.time*.12,j=Math.floor((t*40)%N+N)%N;cam.position.set(P[j].x+Nr[j].x*14,9,P[j].z+Nr[j].z*14);const q=P[(j+30)%N];cam.lookAt(q.x,1,q.z);K.sunFollow(P[j].x,P[j].z);if(state==='done')for(const k of karts)stepKart(k,dt);return;}
 if(state==='count'){const p=Math.ceil(startT-.6);startT-=dt;const n=Math.ceil(startT-.6);if(n!==p){if(n>0){K.flash(String(n),'',700,'#ffd23f');K.tone(440,.18,'square',.1);}else{K.flash('VAI!','',800,'#3dffa2');K.tone(880,.4,'square',.12);state='race';startBoostOk=true;}}}
 if(state==='race'){raceT+=dt;lapT+=dt;if(startBoostOk){if(raceT>.4)startBoostOk=false;else if(K.hit('KeyW','ArrowUp')){me.boost=1;startBoostOk=false;K.sfx.boost();K.flash('ARRANQUE PERFEITO!','',800,'#4fd0ff');K.unlock('kt-start','Kart · Arranque perfeito');}}}
 for(const k of karts){const lap0=Math.floor(k.prog/N);stepKart(k,dt);const lap1=Math.floor(k.prog/N);
  if(state==='race'&&lap1>lap0&&lap1>=1&&!k.fin){if(lap1>=LAPS){k.fin=raceT;finishN++;if(k===me){K.flash('META!',(order.indexOf(me)+1)+'.º lugar',2000,'#ffd23f');K.sfx.cheer();setTimeout(()=>{if(state==='race')finishRace();},2600);}}
   else if(k===me){if(!bestLap||lapT<bestLap)bestLap=lapT;K.flash(lap1+1===LAPS?'ÚLTIMA VOLTA!':'Volta '+(lap1+1),tfmt(lapT),1100,'#fff');K.sfx.good();lapT=0;}}}
 // choques entre karts
 for(let i=0;i<karts.length;i++)for(let j=i+1;j<karts.length;j++){const a=karts[i],b=karts[j],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d<1.7&&d>.01){const p=(1.7-d)/2,nx=dx/d,nz=dz/d;a.x-=nx*p;a.z-=nz*p;b.x+=nx*p;b.z+=nz*p;const s=(a.sp+b.sp)/2;a.sp=K.lerp(a.sp,s,.3);b.sp=K.lerp(b.sp,s,.3);if((a===me||b===me)&&Math.random()<.2)K.sfx.bounce(.5);}}
 for(const b of boxes){if(b.t>0){b.t-=dt;if(b.t<=0)b.m.visible=true;}b.m.rotation.y+=dt*2;b.m.rotation.x+=dt;b.m.position.y=1.2+Math.sin(K.time*3+b.m.position.x)*.15;}
 for(const b of bananas)b.t+=dt;
 for(let i=balls.length-1;i>=0;i--){const b=balls[i];b.t+=dt;b.s+=50*dt/seg;const j=((Math.floor(b.s)%N)+N)%N;let tgt=null,bd=1e9;for(const k of karts){if(k===b.o||k.fin)continue;let d=k.prog-b.o.prog;if(d>0&&d<bd){bd=d;tgt=k;}}if(tgt)b.lat=K.damp(b.lat,tgt.lat,6,dt);const x=P[j].x+Nr[j].x*b.lat,z=P[j].z+Nr[j].z*b.lat;b.m.position.set(x,.6+Math.abs(Math.sin(b.t*9))*.5,z);b.m.rotation.x+=dt*12;let dead=b.t>5;
  for(const k of karts)if(k!==b.o&&(k.x-x)**2+(k.z-z)**2<3.4){spinOut(k,'BOLADA!');dead=true;if(b.o===me){K.sfx.good();K.toast('Acertaste no '+k.name+'!');}break;}if(dead){scene.remove(b.m);balls.splice(i,1);}}
 order=karts.slice().sort((a,b)=>(a.fin||1e9)-(b.fin||1e9)||b.prog-a.prog);
 // câmara e HUD
 camA+=K.angDiff(camA,me.a-me.dr*.2)*Math.min(1,dt*5);const bd=8+(me.boost>0?1.5:0),tx=me.x-Math.sin(camA)*bd,tz=me.z-Math.cos(camA)*bd;cam.position.x=K.damp(cam.position.x,tx,12,dt);cam.position.z=K.damp(cam.position.z,tz,12,dt);cam.position.y=K.damp(cam.position.y,3.7,5,dt);cam.lookAt(me.x+Math.sin(camA)*6,1.2,me.z+Math.cos(camA)*6);
 const fv=62+Math.max(0,me.sp-24)*.7+(me.boost>0?8:0);if(Math.abs(cam.fov-fv)>.2){cam.fov=K.damp(cam.fov,fv,4,dt);cam.updateProjectionMatrix();}K.sunFollow(me.x,me.z);
 if(engG){engG.gain.value=.03;eng.frequency.value=55+Math.abs(me.sp)*5.5+(me.dr?25:0);}
 const hp=K.$('hp');if(hp){hp.textContent=(order.indexOf(me)+1)+'º';K.$('hl').textContent=Math.min(LAPS,Math.max(1,Math.floor(me.prog/N)+1))+'/'+LAPS;K.$('ht').textContent=tfmt(raceT);K.$('hdw').style.opacity=me.dr?1:0;const hd=K.$('hd');hd.style.width=Math.min(100,me.ch/3.2*100)+'%';hd.style.background=me.ch>2?'#ff8a3d':me.ch>.7?'#4fd0ff':'#ddd';
  const mm=K.$('mm'),c=mm.getContext('2d');c.clearRect(0,0,120,120);let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<N;i+=8){x0=Math.min(x0,P[i].x);x1=Math.max(x1,P[i].x);z0=Math.min(z0,P[i].z);z1=Math.max(z1,P[i].z);}const sc=100/Math.max(x1-x0,z1-z0),X=x=>10+(x-x0)*sc,Z=z=>10+(z-z0)*sc;c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();for(let i=0;i<=N;i+=8){const p=P[i%N];i?c.lineTo(X(p.x),Z(p.z)):c.moveTo(X(p.x),Z(p.z));}c.stroke();
  for(const k of karts){c.fillStyle='#'+COLS[k.id].toString(16).padStart(6,'0');c.beginPath();c.arc(X(k.x),Z(k.z),k===me?5:3.5,0,7);c.fill();if(k===me){c.strokeStyle='#fff';c.lineWidth=2;c.stroke();}}}}
const _sp=K.setPause;K.setPause=v=>{_sp(v);if(engG)engG.gain.value=K.paused?0:.03;};window.C30pause=f=>K.setPause(f===undefined?!K.paused:f);
K._auto=()=>{me.ai=true;};
K._dbg=()=>({seg,state,k:karts.map(k=>[k.name,Math.round(k.prog),+k.lat.toFixed(1),+k.sp.toFixed(0),k.fin?+k.fin.toFixed(1):0])});
K.me=()=>state==='race'||state==='count'?me&&me.g:null;
K.loop(update);menu();
})();
