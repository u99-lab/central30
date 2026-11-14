// TITLE: Lanchas da Ria
// Corridas de lanchas na ria de Aveiro: boias, ondas, turbo e 4 rivais.
(()=>{'use strict';
const S=K.store('la',{best:{},wins:0,cups:0});
document.documentElement.style.setProperty('--kc','#4fd0ff');
K.init({sky:0x8fd3ff,fog:[140,420],fov:60,far:800,shadow:50,sunPos:[40,60,20]});
const scene=K.scene,cam=K.camera;
const COURSES=[['Ria de Aveiro',[[0,0],[90,-20],[150,30],[120,110],[40,130],[-40,100],[-90,40],[-60,-20]]],['Costa Nova',[[0,0],[120,0],[170,60],[110,120],[30,90],[-30,150],[-110,110],[-120,20],[-60,-30]]],['Barra',[[0,0],[80,40],[60,120],[-20,160],[-100,120],[-60,60],[-140,10],[-80,-40]]]];
// água com ondas
const WG=new THREE.PlaneGeometry(900,900,90,90);WG.rotateX(-Math.PI/2);const wpos=WG.attributes.position,wbase=Float32Array.from(wpos.array);
const water=new THREE.Mesh(WG,new THREE.MeshPhongMaterial({color:0x14608f,shininess:40,specular:0x335577}));water.receiveShadow=true;scene.add(water);
const waveH=(x,z,t)=>Math.sin(x*.06+t*1.6)*.35+Math.sin(z*.05-t*1.2)*.3+Math.sin((x+z)*.11+t*2.3)*.12;
let world=null,P=[],N=360,boats=[],me=null,state='menu',ci=0,LAPS=3,raceT=0,startT=0,buoys=[],eng=null,engG=null;
function build(i){ci=i;if(world)scene.remove(world);world=new THREE.Group();scene.add(world);
 const curve=new THREE.CatmullRomCurve3(COURSES[i][1].map(p=>new THREE.Vector3(p[0],0,p[1])),true,'centripetal');P=curve.getSpacedPoints(N).slice(0,N);
 buoys=[];for(let j=0;j<N;j+=6)for(const s of [-1,1]){const a=P[(j+1)%N],b=P[(j+N-1)%N],tx=a.x-b.x,tz=a.z-b.z,l=Math.hypot(tx,tz),nx=-tz/l,nz=tx/l,x=P[j].x+nx*s*11,z=P[j].z+nz*s*11;const m=K.sph(.7,s>0?0xff3d5a:0x3dff7a,x,.3,z,world,10);buoys.push({m,x,z});}
 // margens com dunas, palheiros da Costa Nova e moliceiros
 const shore=(x,z)=>{for(let j=0;j<N;j+=4){if((P[j].x-x)**2+(P[j].z-z)**2<38*38)return false;}return true;};
 for(let k=0;k<140;k++){const a=K.rand(6.28),r=K.rand(160,330),x=Math.cos(a)*r+20,z=Math.sin(a)*r+60;if(!shore(x,z))continue;const d=K.sph(K.rand(8,18),0xefd9a3,x,-4,z,world,8);d.scale.y=.45;}
 for(let k=0;k<26;k++){const a=k/26*6.28,r=230,x=Math.cos(a)*r+20,z=Math.sin(a)*r+60;const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=-a;const c=K.pick([0xd8352c,0x2a6bd7,0x2b9a57,0xf2b705]);for(let s=0;s<5;s++)K.box(4,.5,.2,s%2?c:0xffffff,0,1+s*.5,1.6,g);K.box(4,2.5,3.2,0xffffff,0,1.6,0,g).material=K.mat(0xffffff);K.box(4.4,.3,3.6,0x333333,0,3,0,g);world.add(g);}
 for(let k=0;k<5;k++){const j=K.irand(0,N-1),a=P[j],g=new THREE.Group();g.position.set(a.x+K.rand(-60,60),0,a.z+K.rand(40,80));K.box(1.4,.5,8,0xf2b705,0,.25,0,g);K.box(.1,3,.1,0x7a5234,0,1.8,0,g);const sail=K.box(2.4,2.2,.05,0xfff2e0,0,2.2,0,g);world.add(g);if(!shore(g.position.x,g.position.z))world.remove(g);}
 // ponte da Barra (marco) e farol
 const fx=COURSES[i][1][2][0]+60,fz=COURSES[i][1][2][1]-60;K.cyl(2.2,2.8,40,0xffffff,fx,20,fz,world,12);for(let s=0;s<5;s++)K.cyl(2.25,2.25,2,0xd8352c,fx,6+s*8,fz,world,12);K.cyl(3,3,2,0x333333,fx,41,fz,world,12);
 for(let k=0;k<6;k++)K.cloud(K.rand(-300,300),K.rand(60,100),K.rand(-300,300),K.rand(3,6));
 const s0=P[0],s1=P[2],ang=Math.atan2(s1.x-s0.x,s1.z-s0.z);for(const s of [-1,1])K.cyl(.3,.3,7,0xffffff,s0.x+Math.cos(ang)*s*12,3.5,s0.z-Math.sin(ang)*s*12,world,8);
 const ban=new THREE.Mesh(new THREE.BoxGeometry(24,1.4,.3),new THREE.MeshBasicMaterial({map:K.tex(512,32,(c,w,h)=>{for(let x=0;x<32;x++){c.fillStyle=x%2?'#111':'#fff';c.fillRect(x*16,0,16,h/2);c.fillStyle=x%2?'#fff':'#111';c.fillRect(x*16,h/2,16,h/2);}})}));ban.position.set(s0.x,7,s0.z);ban.rotation.y=ang;world.add(ban);}
function mkBoat(col){const g=new THREE.Group(),b=new THREE.Group();g.add(b);K.box(1.8,.6,3.2,0xffffff,0,.3,-.2,b);K.box(1.82,.18,3.22,col,0,.5,-.2,b);const bow=K.box(1.28,.6,1.28,0xffffff,0,.3,1.4,b);bow.rotation.y=Math.PI/4;const bow2=K.box(1.3,.18,1.3,col,0,.5,1.4,b);bow2.rotation.y=Math.PI/4;
 K.box(1.5,.12,2.4,0xd9c9a8,0,.62,-.6,b);K.box(1.2,.5,.1,0x9fd8ff,0,.95,.05,b);K.box(.4,.6,.5,0x222222,0,.65,-2.6,b);const p=K.person({shirt:0xffd23f,parent:b,s:.7});p.position.set(0,.3,-1);K.pose(p,{legL:[-1.5],legR:[-1.5],armL:[-1.2],armR:[-1.2]});
 g.userData.b=b;scene.add(g);return g;}
const NAMES=['Tu','Rui','Bia','Isaac','Mika'],COLS=[0xe8452c,0x2a8bff,0xffd23f,0x35d07f,0xb46bff];
function grid(){for(const b of boats)scene.remove(b.g);boats=[];for(let k=0;k<5;k++){const back=8+k*6,j=(N-Math.round(back/3))%N,lat=(k%2?1:-1)*4;const a=P[(j+1)%N],b0=P[(j+N-1)%N],tx=a.x-b0.x,tz=a.z-b0.z,l=Math.hypot(tx,tz),nx=-tz/l,nz=tx/l;
 const B={id:k,name:NAMES[k],g:mkBoat(COLS[k]),x:P[j].x+nx*lat,z:P[j].z+nz*lat,a:Math.atan2(tx,tz),sp:0,idx:j,prog:j-N,boost:0,turbo:100,ai:k>0,skill:.86+k*.03+K.rand(0,.03),tl:K.rand(-5,5),fin:0,lat:0,bob:K.rand(6)};boats.push(B);if(!k)me=B;}}
function nearest(B){let best=B.idx,bd=1e9;for(let j=-10;j<=10;j++){const i=((B.idx+j)%N+N)%N,d=(P[i].x-B.x)**2+(P[i].z-B.z)**2;if(d<bd){bd=d;best=i;}}let di=best-B.idx;if(di>N/2)di-=N;if(di<-N/2)di+=N;B.prog+=di;B.idx=best;B.dist=Math.sqrt(bd);}
function engine(on){const ac=K.audio();if(!ac)return;if(on&&!eng){eng=ac.createOscillator();eng.type='sawtooth';const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=500;engG=ac.createGain();engG.gain.value=0;eng.connect(f);f.connect(engG);engG.connect(ac.destination);eng.start();}if(!on&&eng){try{eng.stop();}catch{}eng=null;engG=null;}}
const tfmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')+'.'+Math.floor(t*10%10);
function start(i){build(i);grid();state='count';startT=3.6;raceT=0;K.screen(null);K.play(true);K.useStick=true;K.pad([['Space','Turbo']]);engine(true);
 K.hud(`<div class="k-tl"><div class="k-pill"><small>Posição</small><b id="hp" style="font-size:32px">5º</b></div></div><div class="k-tr"><div class="k-pill"><small>Volta</small><b id="hl">1/${LAPS}</b></div><div class="k-pill"><small>Tempo</small><b id="ht">0:00.0</b></div></div><div class="k-bc" style="flex-direction:column"><div class="k-meter" style="width:200px;height:14px"><i id="hb" style="width:100%;background:#4fd0ff"></i></div><div class="k-hint">ESPAÇO = turbo · passa entre as boias</div></div>`);
 cam.position.set(me.x-Math.sin(me.a)*10,5,me.z-Math.cos(me.a)*10);K.flash('3','',700,'#ffd23f');}
function finish(){state='done';engine(false);K.play(false);const res=boats.slice().sort((a,b)=>(a.fin||1e9)-(b.fin||1e9)||b.prog-a.prog),pos=res.indexOf(me)+1;
 if(pos===1){S.data.wins++;K.sfx.win();K.unlock('la-'+ci,'Lanchas · Vitória na '+COURSES[ci][0]);}else K.sfx.bad();if(!S.data.best[ci]||me.fin<S.data.best[ci])S.data.best[ci]=+me.fin.toFixed(1);S.save();
 K.screen(`<div class="k-title">${pos===1?'<em>1.º lugar!</em>':pos+'.º lugar'}</div><div class="k-lead">${COURSES[ci][0]}</div><table class="k-tab">${res.map((b,i)=>`<tr class="${b===me?'me':''}"><td>${i+1}º ${b.name}</td><td>${b.fin?tfmt(b.fin):'—'}</td></tr>`).join('')}</table><button class="k-go" data-a="r">Repetir</button><button class="k-alt" data-a="m">Menu</button>`,{r:()=>start(ci),m:menu});}
function menu(){state='menu';engine(false);K.play(false);if(!world){build(0);grid();}
 K.screen(`<div class="k-title">Lanchas da <em>Ria</em></div><div class="k-lead">Três voltas entre as boias. Cuidado com as ondas e guarda o turbo para as retas.</div><div class="k-row">${COURSES.map((c,i)=>`<button class="k-chip" data-a="go" data-v="${i}">${c[0]}<small>${S.data.best[i]?'recorde '+tfmt(S.data.best[i]):'sem recorde'}</small></button>`).join('')}</div><table class="k-tab"><tr><td>Vitórias</td><td>${S.data.wins}</td></tr></table>${K.keysHelp([['W A S D','conduzir'],['ESPAÇO','turbo'],['P','pausa']])}`,{go:v=>start(+v)});}
K.onQuit=menu;K.me=()=>state==='race'||state==='count'?me&&me.g:null;
function update(dt){const t=K.time;for(let i=0;i<wpos.count;i++){const x=wbase[i*3],z=wbase[i*3+2];wpos.array[i*3+1]=waveH(x,z,t);}wpos.needsUpdate=true;if(Math.floor(t*20)%3===0)WG.computeVertexNormals();
 for(const b of buoys)b.m.position.y=.2+waveH(b.x,b.z,t);
 if(!P.length)return;if(state==='menu'||state==='done'){const j=((Math.floor(t*8)%P.length)+P.length)%P.length;cam.position.set(P[j].x+30,18,P[j].z+30);cam.lookAt(P[j].x,0,P[j].z);for(const B of boats)place(B,dt,t);return;}
 if(state==='count'){const pp=Math.ceil(startT-.6);startT-=dt;const n=Math.ceil(startT-.6);if(n!==pp){if(n>0){K.flash(String(n),'',700,'#ffd23f');K.tone(440,.18,'square',.1);}else{K.flash('VAI!','',800,'#3dffa2');K.tone(880,.4,'square',.12);state='race';}}}
 if(state==='race')raceT+=dt;
 for(const B of boats){let thr=0,steer=0,boost=false;
  if(state==='race'){if(B.ai){const look=Math.round(8+B.sp*.3),i=(B.idx+look)%N;if(Math.random()<dt*.5)B.tl=K.rand(-6,6);const a=P[(i+1)%N],b0=P[(i+N-1)%N],tx=a.x-b0.x,tz=a.z-b0.z,l=Math.hypot(tx,tz),X=P[i].x-tz/l*B.tl,Z=P[i].z+tx/l*B.tl;steer=K.clamp(-K.angDiff(B.a,Math.atan2(X-B.x,Z-B.z))*2.4,-1,1);thr=1;let gap=me.prog-B.prog;B.rb=gap>40?1.08:gap<-60?.94:1;boost=B.turbo>40&&Math.abs(steer)<.2&&Math.random()<.02;}
   else{const ax=K.axis();steer=ax.x;thr=K.touch?(ax.y<-.6?-1:1):ax.y>.2?1:ax.y<-.2?-1:0;boost=K.down('Space');}}
  if(boost&&B.turbo>0){B.turbo=Math.max(0,B.turbo-dt*35);B.boost=.15;}else B.turbo=Math.min(100,B.turbo+dt*7);if(B.boost>0)B.boost-=dt;
  const top=(B.ai?26*B.skill*(B.rb||1):27)*(B.boost>0?1.35:1)*(B.dist>13?.55:1),target=thr>0?top:thr<0?-6:0;B.sp=K.damp(B.sp,target,thr?.9:.5,dt);
  B.a-=steer*1.5*Math.min(1,Math.abs(B.sp)/8)*dt;const drift=steer*B.sp*.06;B.x+=Math.sin(B.a)*B.sp*dt+Math.cos(B.a)*drift*dt;B.z+=Math.cos(B.a)*B.sp*dt-Math.sin(B.a)*drift*dt;
  const lap0=Math.floor(B.prog/N);nearest(B);const lap1=Math.floor(B.prog/N);if(B.dist>30){const p=P[B.idx];B.x=K.lerp(B.x,p.x,.05);B.z=K.lerp(B.z,p.z,.05);}
  if(state==='race'&&lap1>lap0&&lap1>=1&&!B.fin){if(lap1>=LAPS){B.fin=raceT;if(B===me){K.flash('META!','',1800,'#ffd23f');K.sfx.cheer();setTimeout(()=>{if(state==='race')finish();},2200);}}else if(B===me){K.flash(lap1+1===LAPS?'ÚLTIMA VOLTA':'Volta '+(lap1+1),'',1000,'#fff');K.sfx.good();}}
  place(B,dt,t);if(B.sp>8&&Math.random()<dt*25)K.burst(new THREE.Vector3(B.x-Math.sin(B.a)*2.6,.3,B.z-Math.cos(B.a)*2.6),[0xffffff,0xcfeeff],1,1.5,2,.6);}
 for(let i=0;i<boats.length;i++)for(let j=i+1;j<boats.length;j++){const a=boats[i],b=boats[j],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d<2.6&&d>.01){const p=(2.6-d)/2;a.x-=dx/d*p;a.z-=dz/d*p;b.x+=dx/d*p;b.z+=dz/d*p;}}
 for(const q of K.peers()){const dx=me.x-q.x,dz=me.z-q.z,d=Math.hypot(dx,dz);if(d<3&&d>.01){me.x=q.x+dx/d*3;me.z=q.z+dz/d*3;me.sp*=.7;}}
 const order=boats.slice().sort((a,b)=>(a.fin||1e9)-(b.fin||1e9)||b.prog-a.prog);
 cam.position.x=K.damp(cam.position.x,me.x-Math.sin(me.a)*10,5,dt);cam.position.z=K.damp(cam.position.z,me.z-Math.cos(me.a)*10,5,dt);cam.position.y=K.damp(cam.position.y,4.6,4,dt);cam.lookAt(me.x+Math.sin(me.a)*6,1,me.z+Math.cos(me.a)*6);K.sunFollow(me.x,me.z);
 if(engG){engG.gain.value=.035;eng.frequency.value=60+me.sp*5+(me.boost>0?40:0);}
 const hp=K.$('hp');if(hp){hp.textContent=(order.indexOf(me)+1)+'º';K.$('hl').textContent=Math.min(LAPS,Math.max(1,Math.floor(me.prog/N)+1))+'/'+LAPS;K.$('ht').textContent=tfmt(raceT);K.$('hb').style.width=me.turbo+'%';}}
function place(B,dt,t){const y=waveH(B.x,B.z,t),g=B.g,b=g.userData.b;g.position.set(B.x,y,B.z);g.rotation.y=B.a;b.rotation.x=K.damp(b.rotation.x,-Math.min(.18,B.sp*.006)+(waveH(B.x+Math.sin(B.a)*2,B.z+Math.cos(B.a)*2,t)-y)*.25,6,dt);b.rotation.z=K.damp(b.rotation.z,(waveH(B.x+Math.cos(B.a),B.z-Math.sin(B.a),t)-y)*.4,6,dt);}
const _sp=K.setPause;K.setPause=v=>{_sp(v);if(engG)engG.gain.value=K.paused?0:.035;};window.C30pause=f=>K.setPause(f===undefined?!K.paused:f);
K._dbg=()=>({state,k:boats.map(b=>[b.name,Math.round(b.prog),+b.sp.toFixed(0),b.fin?+b.fin.toFixed(1):0])});
K.loop(update);menu();
})();
