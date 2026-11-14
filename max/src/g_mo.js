// TITLE: Motocross das Dunas
// Mota de motocross numa pista de saltos: acelera, equilibra no ar, faz mortais e chega à meta.
(()=>{'use strict';
const S=K.store('mo',{best:{},flips:0});
document.documentElement.style.setProperty('--kc','#ff8a3d');
K.init({sky:0xffc98a,fog:[90,260],fov:55,shadow:40,sunPos:[-20,40,30],sunColor:0xffe0b0});
const scene=K.scene,cam=K.camera,G=24;
// pistas: perfis de altura ao longo de x (a mota anda em 2D, o mundo é 3D)
const TRACKS=[['Dunas de Mira',12,[[0,0],[40,0],[52,4],[58,0],[90,0],[104,7],[112,0],[150,0],[160,3],[168,3],[176,0],[210,0],[226,9],[234,0],[270,0],[282,5],[290,5],[296,0],[330,0]]],
 ['Pedreira',16,[[0,0],[30,0],[44,6],[50,6],[54,0],[80,0],[90,10],[96,10],[100,0],[130,0],[146,12],[152,0],[180,4],[190,4],[198,0],[230,0],[240,8],[250,0],[262,6],[270,0],[310,0],[326,14],[334,0],[370,0]]],
 ['Monte Real',20,[[0,0],[24,0],[40,10],[46,0],[70,0],[84,13],[90,13],[94,0],[120,0],[140,16],[146,0],[170,2],[176,9],[182,0],[214,0],[230,18],[236,0],[262,0],[274,7],[280,0],[288,7],[294,0],[330,0],[352,20],[358,0],[400,0]]]];
let H=[],track=0,world=null,LEN=0;
function hAt(x){if(x<=H[0][0])return H[0][1];for(let i=0;i<H.length-1;i++){const a=H[i],b=H[i+1];if(x<=b[0]){const t=(x-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*(t*t*(3-2*t))*.0+(b[1]-a[1])*t*1;}}return H[H.length-1][1];}
function slope(x){return (hAt(x+.3)-hAt(x-.3))/.6;}
function build(i){track=i;H=TRACKS[i][2];LEN=H[H.length-1][0];if(world)scene.remove(world);world=new THREE.Group();scene.add(world);
 const pts=[];for(let x=-20;x<=LEN+20;x+=1)pts.push(x);const pos=[],idx=[];pts.forEach((x,k)=>{const y=hAt(x);pos.push(x,y,-5,x,y,5,x,-3,-5,x,-3,5);if(k){const a=(k-1)*4,b=k*4;idx.push(a,a+1,b,a+1,b+1,b,a,b,a+2,b,b+2,a+2,a+1,a+3,b+1,b+1,a+3,b+3);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xc98a4f,side:THREE.DoubleSide}));m.receiveShadow=true;world.add(m);
 K.plane(1200,400,0xe6c58a,LEN/2,-3,0,world);
 for(let k=0;k<60;k++){const x=K.rand(-40,LEN+40),z=K.pick([-1,1])*K.rand(12,90),d=K.sph(K.rand(6,16),0xe8cf98,x,-4,z,world,8);d.scale.y=.4;}
 for(let k=0;k<40;k++){const x=K.rand(0,LEN),z=-K.rand(9,40);K.palm(x,z,K.rand(.7,1.1),world);}
 for(let x=0;x<LEN;x+=6)for(const z of [-5.5,5.5])K.box(.5,.5,.5,x%12?0xff3d5a:0xffffff,x,hAt(x)+.25,z,world);
 for(const [x,t] of [[0,'PARTIDA'],[LEN-6,'META']]){for(const z of [-6,6])K.cyl(.3,.3,7,0xffffff,x,hAt(x)+3.5,z,world,8);const b=new THREE.Mesh(new THREE.BoxGeometry(.3,1.5,12),new THREE.MeshBasicMaterial({map:K.tex(512,64,(c,w,h)=>{c.fillStyle='#1b2340';c.fillRect(0,0,w,h);c.fillStyle='#ffd23f';c.font='900 44px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(t,w/2,34);})}));b.position.set(x,hAt(x)+6.6,0);b.rotation.y=Math.PI/2;world.add(b);}
 for(let k=0;k<5;k++){const c=K.cloud(K.rand(0,LEN),K.rand(40,70),K.rand(-120,-60),K.rand(3,5));scene.remove(c);world.add(c);}
 const fans=[];for(let k=0;k<30;k++){const x=K.rand(10,LEN-10),p=K.person({shirt:K.pick([0xff3d5a,0xffd23f,0x2a8bff,0x35d07f,0xffffff]),parent:world});p.position.set(x,hAt(x),-K.rand(8,12));p.rotation.y=0;}}
// mota
const bike=new THREE.Group(),bb=new THREE.Group();bike.add(bb);scene.add(bike);
K.box(1.5,.35,.3,0xff8a3d,0,.75,0,bb);K.box(.6,.25,.32,0x222222,-.2,1,0,bb);K.box(.5,.4,.3,0x333333,.1,.55,0,bb);K.box(.08,.7,.08,0xaaaaaa,.75,.85,0,bb).rotation.z=-.4;K.box(.08,.08,.7,0x222222,.9,1.2,0,bb);
const wheels=[];for(const x of [-.75,.85]){const w=K.cyl(.42,.42,.18,0x15171d,x,.42,0,bb,14);w.rotation.x=Math.PI/2;wheels.push(w);}
const rider=K.person({shirt:0xff8a3d,shorts:0x1b2340,parent:bb,s:.8});rider.position.set(-.15,.75,0);rider.rotation.y=Math.PI/2;K.pose(rider,{legL:[-1,0,0],legR:[-1,0,0],armL:[-1.3],armR:[-1.3]});K.box(.32,.32,.32,0xffd23f,0,2.05*.8,0,rider).position.set(0,1.62,0);
const st={x:0,y:0,vx:0,vy:0,a:0,va:0,air:false,airT:0,rot:0,crash:0,t:0,flips:0,fin:0,lastFlip:0};
let state='menu',eng=null,engG=null,ghost=[],rec=[];
function engine(on){const ac=K.audio();if(!ac)return;if(on&&!eng){eng=ac.createOscillator();eng.type='sawtooth';const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=1200;engG=ac.createGain();engG.gain.value=0;eng.connect(f);f.connect(engG);engG.connect(ac.destination);eng.start();}if(!on&&eng){try{eng.stop();}catch{}eng=null;engG=null;}}
const tfmt=t=>t.toFixed(2)+' s';
function start(i){build(i);Object.assign(st,{x:2,y:hAt(2),vx:0,vy:0,a:0,va:0,air:false,rot:0,crash:0,t:0,flips:0,fin:0});rec=[];state='count';cd=3.5;K.screen(null);K.play(true);K.pad([['KeyW','Acelerar'],['KeyA','◀ Inclinar'],['KeyD','Inclinar ▶'],['KeyS','Travar']]);engine(true);
 K.hud(`<div class="k-tl"><div class="k-pill"><small>${TRACKS[i][0]}</small><b id="ht">0.00 s</b></div></div><div class="k-tr"><div class="k-pill"><small>Mortais</small><b id="hf">0</b></div></div><div class="k-tc"><div class="k-meter" style="width:min(300px,50vw);height:12px"><i id="hp" style="width:0;background:#ff8a3d"></i></div></div><div class="k-bc"><div class="k-hint">W acelera · no ar A/D inclina (dá mortais) · aterra com as rodas!</div></div>`);}
let cd=0;
function crash(){st.crash=1.6;K.sfx.hit();K.shake=.6;K.burst(new THREE.Vector3(st.x,st.y+.8,0),[0xc98a4f,0xffd23f],20,4,6,.8);K.flash('QUEDA!','',900,'#ff6b6b');st.t+=2;}
function finish(){state='done';engine(false);K.play(false);const b=S.data.best[track],rec2=!b||st.t<b;if(rec2)S.data.best[track]=+st.t.toFixed(2);S.data.flips+=st.flips;S.save();K.sfx.win();K.confetti(new THREE.Vector3(st.x,st.y+2,0));if(st.flips>=3)K.unlock('mo-3','Motocross · 3 mortais numa corrida');
 K.screen(`<div class="k-title"><em>${tfmt(st.t)}</em></div><div class="k-lead">${rec2?'Novo recorde!':'Recorde: '+tfmt(b)} · ${st.flips} mortais (−${st.flips} s)</div><button class="k-go" data-a="r">Repetir</button>${track<2?'<button class="k-alt" data-a="n">Próxima pista</button>':''}<button class="k-alt" data-a="m">Menu</button>`,{r:()=>start(track),n:()=>start(track+1),m:menu});}
function menu(){state='menu';engine(false);K.play(false);if(!world)build(0);
 K.screen(`<div class="k-title">Motocross das <em>Dunas</em></div><div class="k-lead">Salta, dá mortais no ar (cada um tira 1 segundo) e aterra direito.</div><div class="k-row">${TRACKS.map((t,i)=>`<button class="k-chip" data-a="go" data-v="${i}">${t[0]}<small>${S.data.best[i]?tfmt(S.data.best[i]):'sem recorde'}</small></button>`).join('')}</div><table class="k-tab"><tr><td>Mortais no total</td><td>${S.data.flips}</td></tr></table>${K.keysHelp([['W','acelerar'],['S','travar'],['A D','inclinar (no ar: mortais)'],['P','pausa']])}`,{go:v=>start(+v)});}
K.onQuit=menu;K.me=()=>state==='race'?bike:null;
function update(dt){
 if(state==='menu'||state==='done'){const t=K.time*.1;cam.position.set(((t*40)%LEN),hAt((t*40)%LEN)+8,22);cam.lookAt((t*40)%LEN+10,hAt((t*40)%LEN),0);return;}
 if(state==='count'){const pp=Math.ceil(cd-.5);cd-=dt;const n=Math.ceil(cd-.5);if(n!==pp){if(n>0){K.flash(String(n),'',700,'#ffd23f');K.tone(440,.18,'square',.1);}else{K.flash('VAI!','',700,'#3dffa2');K.tone(880,.4,'square',.12);state='race';}}}
 const gas=K.down('KeyW','ArrowUp','Space'),brk=K.down('KeyS','ArrowDown'),lean=(K.down('KeyA','ArrowLeft')?1:0)-(K.down('KeyD','ArrowRight')?1:0),ax=K.axis();const ln=lean||(-ax.x);
 if(state==='race'){st.t+=dt;
  if(st.crash>0){st.crash-=dt;st.vx*=Math.pow(.2,dt);if(st.crash<=0){st.y=hAt(st.x);st.a=Math.atan(slope(st.x));st.va=0;st.air=false;st.vx=2;}}
  else if(!st.air){const sl=Math.atan(slope(st.x));st.a=K.damp(st.a,sl,14,dt);const acc=(gas||ax.y>.3?18:0)-(brk?22:0)-Math.sin(sl)*G*.9;st.vx+=acc*dt;st.vx*=Math.pow(.92,dt);st.vx=K.clamp(st.vx,-4,TRACKS[track][1]+8);
   const nx=st.x+st.vx*dt*Math.cos(sl),ny=hAt(nx);const nsl=Math.atan(slope(nx));if(nsl<sl-.25&&st.vx>6){st.air=true;st.vy=st.vx*Math.sin(sl);st.va=0;st.rot=0;st.airT=0;}st.x=nx;st.y=st.air?st.y+st.vy*dt:ny;}
  else{st.airT+=dt;st.vy-=G*dt;st.x+=st.vx*Math.cos(0)*dt*.98;st.y+=st.vy*dt;st.va=K.damp(st.va,ln*4.2,5,dt);st.a+=st.va*dt;st.rot+=st.va*dt;
   const fl=Math.floor(Math.abs(st.rot)/(Math.PI*2));if(fl>st.lastFlip){st.lastFlip=fl;st.flips++;st.t-=1;K.flash('MORTAL!','−1 s',800,'#ff8a3d');K.sfx.good();}
   const gy=hAt(st.x);if(st.y<=gy){const sl=Math.atan(slope(st.x)),d=Math.abs(K.angDiff(st.a,sl));st.y=gy;st.air=false;st.lastFlip=0;if(d>.7){crash();st.a=sl;}else{st.a=sl;st.vx*=1-d*.4;K.sfx.bounce(.8);if(st.airT>1)K.toast('Boa aterragem!');}}}
  if(st.x>=LEN-6&&!st.fin){st.fin=1;K.flash('META!','',1500,'#ffd23f');setTimeout(finish,1600);state='fin';}}
 else if(state==='fin'){st.vx*=Math.pow(.3,dt);st.x+=st.vx*dt;st.y=hAt(st.x);}
 st.x=Math.max(0,st.x);bike.position.set(st.x,st.y,0);bb.rotation.z=st.a;bb.position.y=st.crash>0?.0:0;rider.visible=true;if(st.crash>0)bb.rotation.z+=Math.sin(st.crash*20)*.3;
 for(const w of wheels)w.rotation.y-=st.vx*dt/.42;
 cam.position.x=K.damp(cam.position.x,st.x+3,5,dt);cam.position.y=K.damp(cam.position.y,st.y+3.5,4,dt);cam.position.z=K.damp(cam.position.z,15,3,dt);cam.lookAt(st.x+4,st.y+1,0);K.sunFollow(st.x,0);
 if(engG){engG.gain.value=state==='race'?.04:0;eng.frequency.value=70+Math.abs(st.vx)*9+(st.air?60:0)+(gas?40:0);}
 const ht=K.$('ht');if(ht){ht.textContent=tfmt(Math.max(0,st.t));K.$('hf').textContent=st.flips;K.$('hp').style.width=Math.min(100,st.x/LEN*100)+'%';}}
const _sp=K.setPause;K.setPause=v=>{_sp(v);if(engG)engG.gain.value=0;};window.C30pause=f=>K.setPause(f===undefined?!K.paused:f);
K._dbg=()=>({state,x:+st.x.toFixed(1),y:+st.y.toFixed(1),vx:+st.vx.toFixed(1),air:st.air,flips:st.flips,t:+st.t.toFixed(1)});
K.loop(update);menu();
})();
