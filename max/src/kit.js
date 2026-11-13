// Kit comum dos jogos novos da Central 30 MAX (motor, comandos, som, menus).
(()=>{'use strict';
const K=window.K={time:0,paused:false,inGame:false,shake:0};
const $=K.$=id=>document.getElementById(id);
K.rand=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
K.irand=(a,b)=>Math.floor(K.rand(a,b+1));
K.pick=a=>a[Math.floor(Math.random()*a.length)];
K.clamp=(v,a,b)=>v<a?a:v>b?b:v;
K.lerp=(a,b,t)=>a+(b-a)*t;
K.damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
K.angDiff=(a,b)=>{let d=(b-a)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d;};
K.touch=matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>1;
document.body.insertAdjacentHTML('beforeend','<div id="k-hud"></div><div id="k-flash"></div><div id="k-pad"><div id="k-stick"><i></i></div><div id="k-btns"></div></div><button id="k-pbtn" aria-label="Pausa">II</button><div id="k-toast"></div><div id="k-screen" hidden></div><div id="k-pause" hidden><div class="k-box"><div class="k-title">Pausa</div><button class="k-go" id="k-resume">Continuar</button><button class="k-alt" id="k-quit">Sair para o menu do jogo</button></div></div>');
// ---------- gravação
K.store=(name,def)=>{let data=def;try{const v=window.__C30_STORAGE__?JSON.parse(localStorage.getItem('max.'+name)):null;if(v&&typeof v==='object')data=Object.assign({},def,v);}catch{}
 const s={data,save(){if(!window.__C30_STORAGE__)return;try{localStorage.setItem('max.'+name,JSON.stringify(s.data));}catch{}}};window.C30save=()=>s.save();return s;};
K.unlock=(id,title)=>{try{window.C30&&window.C30.unlock(id,title);}catch{}};
// ---------- pausa
K.setPause=v=>{v=!!v;if(v&&!K.inGame)v=false;K.paused=v;$('k-pause').hidden=!v;if(!v)for(const k in keys)keys[k]=false;};
window.C30pause=f=>K.setPause(f===undefined?!K.paused:f);window.C30isPaused=()=>K.paused;
$('k-resume').onclick=()=>K.setPause(false);$('k-quit').onclick=()=>{K.setPause(false);K.onQuit&&K.onQuit();};
$('k-pbtn').onclick=()=>K.setPause(!K.paused);
K.play=v=>{K.inGame=!!v;$('k-pbtn').style.display=v&&K.touch?'block':'none';$('k-pad').classList.toggle('on',!!v&&K.touch);if(!v){K.setPause(false);K.hud('');}};
// ---------- comandos
const keys=K.keys={},edge={};
addEventListener('keydown',e=>{if(e.repeat)return;K.audio();if(!keys[e.code])edge[e.code]=true;keys[e.code]=true;if(/^(Space|Arrow)/.test(e.code))e.preventDefault();if(e.code==='KeyP'||(e.code==='Escape'&&parent===window))K.setPause(!K.paused);});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
K.hit=(...c)=>{let r=false;for(const k of c)if(edge[k]){edge[k]=false;r=true;}return r;};
K.down=(...c)=>c.some(k=>keys[k]);
const stick={x:0,y:0,id:null,ox:0,oy:0};K.stick=stick;K.useStick=false;
K.axis=()=>{let x=(K.down('KeyD','ArrowRight')?1:0)-(K.down('KeyA','ArrowLeft')?1:0)+stick.x,y=(K.down('KeyW','ArrowUp')?1:0)-(K.down('KeyS','ArrowDown')?1:0)+stick.y;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}return{x,y};};
const sEl=$('k-stick');
addEventListener('touchstart',e=>{K.audio();if(!K.useStick||!K.inGame||K.paused)return;for(const t of e.changedTouches){if(stick.id===null&&t.clientX<innerWidth*.5&&!t.target.closest('button')){stick.id=t.identifier;stick.ox=t.clientX;stick.oy=t.clientY;sEl.style.display='block';sEl.style.left=t.clientX+'px';sEl.style.top=t.clientY+'px';}}},{passive:true});
addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===stick.id){let dx=(t.clientX-stick.ox)/50,dy=(t.clientY-stick.oy)/50;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}stick.x=dx;stick.y=-dy;sEl.firstChild.style.transform='translate('+dx*38+'px,'+dy*38+'px)';}},{passive:true});
const tEnd=e=>{for(const t of e.changedTouches)if(t.identifier===stick.id){stick.id=null;stick.x=stick.y=0;sEl.style.display='none';sEl.firstChild.style.transform='';}};
addEventListener('touchend',tEnd);addEventListener('touchcancel',tEnd);
K.pad=list=>{const b=$('k-btns');b.innerHTML='';for(const [code,label] of list){const el=document.createElement('button');el.textContent=label;const dn=e=>{e.preventDefault();if(!keys[code])edge[code]=true;keys[code]=true;el.classList.add('dn');},up=e=>{e.preventDefault();keys[code]=false;el.classList.remove('dn');};el.addEventListener('pointerdown',dn);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('pointerleave',up);b.appendChild(el);}};
// ---------- som
let ac=null,master=null;
K.audio=()=>{if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.55;master.connect(ac.destination);}catch{}}if(ac&&ac.state==='suspended')ac.resume().catch(()=>{});return ac;};
K.tone=(f,d=.12,type='sine',v=.18,f2,delay=0)=>{if(!ac||K.paused)return;const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.03);};
let nbuf=null;
K.noise=(d=.2,v=.2,freq=1200,delay=0,q=.8)=>{if(!ac||K.paused)return;if(!nbuf){nbuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const a=nbuf.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}const t=ac.currentTime+delay,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=nbuf;s.loop=true;f.type='bandpass';f.frequency.value=freq;f.Q.value=q;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.08,d*.3));g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random());s.stop(t+d+.05);};
K.sfx={click:()=>K.tone(660,.06,'square',.06),kick:()=>{K.tone(140,.14,'sine',.4,50);K.noise(.07,.2,900);},bounce:(v=1)=>K.tone(190,.09,'sine',.22*v,90),hit:()=>{K.noise(.12,.3,500);K.tone(110,.12,'triangle',.25,50);},
 coin:()=>{K.tone(988,.07,'square',.07);K.tone(1319,.14,'square',.07,0,.07);},good:()=>[523,659,784].forEach((f,i)=>K.tone(f,.14,'triangle',.14,0,i*.08)),win:()=>[523,659,784,1047,784,1047].forEach((f,i)=>K.tone(f,.2,'triangle',.15,0,i*.12)),
 bad:()=>{K.tone(220,.25,'sawtooth',.1,110);K.tone(160,.3,'sawtooth',.09,80,.15);},whistle:(long)=>{K.tone(2350,long?.7:.25,'square',.05);K.tone(2500,long?.7:.25,'sine',.07);},
 cheer:(v=1)=>{K.noise(1.6,.16*v,1400,0,.4);K.noise(1.2,.1*v,2600,.1,.6);},ooh:()=>K.noise(.8,.1,700,0,.5),whoosh:()=>K.noise(.25,.14,1800,0,1.5),boost:()=>{K.tone(200,.5,'sawtooth',.09,900);K.noise(.4,.1,3000);},tick:()=>K.tone(880,.05,'square',.07),horn:()=>K.tone(392,.5,'square',.08)};
// ---------- interface
K.hud=h=>{$('k-hud').innerHTML=h;};
let scrH={};
K.screen=(html,handlers)=>{const s=$('k-screen');if(html==null){s.hidden=true;s.innerHTML='';return;}scrH=handlers||{};s.innerHTML='<div class="k-box">'+html+'</div>';s.hidden=false;s.scrollTop=0;};
$('k-screen').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;K.audio();K.sfx.click();const f=scrH[b.dataset.a];if(f)f(b.dataset.v,b);});
let flT=0;K.flash=(text,sub='',ms=1500,color='#fff')=>{const f=$('k-flash');f.style.setProperty('--fc',color);f.innerHTML='<b>'+text+'</b>'+(sub?'<span>'+sub+'</span>':'');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');clearTimeout(flT);flT=setTimeout(()=>f.classList.remove('on'),ms);};
let toT=0;K.toast=t=>{const e=$('k-toast');e.textContent=t;e.classList.add('on');clearTimeout(toT);toT=setTimeout(()=>e.classList.remove('on'),2600);};
K.keysHelp=rows=>'<div class="k-keys">'+rows.map(r=>r[0].split(' ').map(k=>'<kbd>'+k+'</kbd>').join('')+' '+r[1]).join(' &nbsp;·&nbsp; ')+'</div>';
// ---------- 3D
const mats=new Map();
K.mat=(c,o)=>{if(c&&c.isMaterial)return c;const k=c+(o?JSON.stringify(o):'');let m=mats.get(k);if(!m){m=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));mats.set(k,m);}return m;};
K.mesh=(geo,c,x=0,y=0,z=0,p)=>{const m=new THREE.Mesh(geo,K.mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;(p||K.scene).add(m);return m;};
const geos=new Map(),G=(k,f)=>{let g=geos.get(k);if(!g){g=f();geos.set(k,g);}return g;};
K.box=(w,h,d,c,x,y,z,p)=>K.mesh(G('b'+w+','+h+','+d,()=>new THREE.BoxGeometry(w,h,d)),c,x,y,z,p);
K.cyl=(rt,rb,h,c,x,y,z,p,seg=16)=>K.mesh(G('c'+rt+','+rb+','+h+','+seg,()=>new THREE.CylinderGeometry(rt,rb,h,seg)),c,x,y,z,p);
K.sph=(r,c,x,y,z,p,seg=18)=>K.mesh(G('s'+r+','+seg,()=>new THREE.SphereGeometry(r,seg,Math.max(8,seg*.7|0))),c,x,y,z,p);
K.plane=(w,d,c,x,y,z,p)=>{const m=K.mesh(G('p'+w+','+d,()=>new THREE.PlaneGeometry(w,d)),c,x,y,z,p);m.rotation.x=-Math.PI/2;m.castShadow=false;return m;};
K.tex=(w,h,draw,rep)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d'),w,h);const t=new THREE.CanvasTexture(cv);t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}return t;};
K.init=(o={})=>{const r=K.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.domElement.id='k-canvas';document.body.prepend(r.domElement);
 const s=K.scene=new THREE.Scene(),sky=o.sky===undefined?0x8fd3ff:o.sky;s.background=new THREE.Color(sky);if(o.fog)s.fog=new THREE.Fog(o.fogColor===undefined?sky:o.fogColor,o.fog[0],o.fog[1]);
 K.camera=new THREE.PerspectiveCamera(o.fov||55,1,.1,o.far||700);
 K.hemi=new THREE.HemisphereLight(o.skyLight||0xffffff,o.groundLight||0x7f9a6a,o.hemi===undefined?.78:o.hemi);s.add(K.hemi);
 const sun=K.sun=new THREE.DirectionalLight(o.sunColor||0xfff1d0,o.sunI===undefined?.85:o.sunI);sun.position.set(...(o.sunPos||[30,55,25]));sun.castShadow=true;const z=o.shadow||45;Object.assign(sun.shadow.camera,{left:-z,right:z,top:z,bottom:-z,near:1,far:260});sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0006;s.add(sun);s.add(sun.target);
 const rs=()=>{r.setSize(innerWidth,innerHeight,false);K.camera.aspect=innerWidth/innerHeight;K.camera.updateProjectionMatrix();};addEventListener('resize',rs);rs();return s;};
// o sol segue um ponto (para sombras em mundos grandes)
K.sunFollow=(x,z)=>{const o=K.sun.userData.off||(K.sun.userData.off=K.sun.position.clone());K.sun.position.set(x+o.x,o.y,z+o.z);K.sun.target.position.set(x,0,z);};
K.person=(o={})=>{const g=new THREE.Group(),skin=o.skin||0xf0c8a0,shirt=o.shirt||0xe8452c,shorts=o.shorts||0x22305a,hair=o.hair||0x3a2a1c,P={};
 P.torso=K.box(.52,.62,.28,shirt,0,1.08,0,g);K.box(.54,.22,.3,shorts,0,.72,0,g);
 P.head=K.box(.36,.36,.36,skin,0,1.6,0,g);K.box(.38,.13,.38,hair,0,1.79,0,g);K.box(.38,.2,.1,hair,0,1.68,-.15,g);
 for(const s of [-1,1]){const leg=new THREE.Group();leg.position.set(s*.14,.66,0);g.add(leg);K.box(.19,.5,.21,o.legs||skin,0,-.25,0,leg);K.box(.19,.16,.21,o.socks||0xffffff,0,-.5,0,leg);K.box(.2,.12,.32,o.shoes||0x222222,0,-.62,.05,leg);P[s<0?'legL':'legR']=leg;
  const arm=new THREE.Group();arm.position.set(s*.34,1.34,0);g.add(arm);K.box(.15,.26,.17,shirt,0,-.1,0,arm);K.box(.13,.4,.15,o.gloves||skin,0,-.42,0,arm);P[s<0?'armL':'armR']=arm;}
 g.userData.P=P;(o.parent||K.scene).add(g);if(o.s)g.scale.setScalar(o.s);return g;};
K.walk=(p,t,amp=.9)=>{const P=p.userData.P,s=Math.sin(t)*amp;P.legL.rotation.x=s;P.legR.rotation.x=-s;P.armL.rotation.x=-s*.8;P.armR.rotation.x=s*.8;};
K.pose=(p,o={})=>{const P=p.userData.P;for(const k of ['legL','legR','armL','armR']){const v=o[k]||[0,0,0];P[k].rotation.set(v[0]||0,v[1]||0,v[2]||0);}};
K.tree=(x,z,s=1,c=0x3f9a4a,p)=>{const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);K.cyl(.18,.26,1.6,0x7a5234,0,.8,0,g,8);K.sph(1.15,c,0,2.4,0,g,9);K.sph(.8,c,.5,3.1,.2,g,8);K.sph(.75,c,-.5,2.9,-.3,g,8);(p||K.scene).add(g);return g;};
K.palm=(x,z,s=1,p)=>{const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);g.rotation.y=K.rand(6.28);for(let i=0;i<5;i++)K.cyl(.16,.2,1,0x9b7447,i*.06,.5+i*.95,0,g,7).rotation.z=-.06;for(let i=0;i<7;i++){const l=K.box(2.3,.06,.5,0x2f9d4f,0,0,0,g);l.position.set(.3+Math.cos(i*.9)*1.05,5-.25,Math.sin(i*.9)*1.05);l.rotation.y=-i*.9;l.rotation.z=-.35;}(p||K.scene).add(g);return g;};
K.cloud=(x,y,z,s=1)=>{const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);const m=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.92,fog:false});for(const [a,b,c,r] of [[0,0,0,3],[3,.4,0,2.3],[-3,.2,.5,2.4],[1,1.2,-.5,2]]){const q=new THREE.Mesh(G('s'+r+',9',()=>new THREE.SphereGeometry(r,9,7)),m);q.position.set(a,b,c);q.scale.y=.6;g.add(q);}K.scene.add(g);return g;};
// partículas
const fx=[];const fxG=new THREE.BoxGeometry(.14,.14,.14);
K.burst=(pos,colors,n=14,sp=5,up=5,life=1)=>{if(!Array.isArray(colors))colors=[colors];for(let i=0;i<n;i++){let p=fx.find(q=>!q.on);if(!p){if(fx.length>260)break;p={m:new THREE.Mesh(fxG,new THREE.MeshBasicMaterial()),v:new THREE.Vector3(),on:false,t:0,l:1};K.scene.add(p.m);fx.push(p);}p.on=true;p.m.visible=true;p.m.material.color.set(K.pick(colors));p.m.position.copy(pos);p.m.scale.setScalar(K.rand(.6,1.6));p.v.set(K.rand(-sp,sp),K.rand(up*.3,up),K.rand(-sp,sp));p.t=0;p.l=life*K.rand(.6,1.2);}};
K.confetti=pos=>K.burst(pos,[0xff3d5a,0xffd23f,0x3dffa2,0x4fa3ff,0xffffff,0xb98bff],60,7,11,2.2);
const upFx=dt=>{for(const p of fx){if(!p.on)continue;p.t+=dt;if(p.t>p.l||p.m.position.y<-1){p.on=false;p.m.visible=false;continue;}p.v.y-=14*dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=dt*8;p.m.rotation.z+=dt*6;}};
K.loop=(update,render)=>{let last=performance.now();const f=now=>{requestAnimationFrame(f);const dt=Math.min(.05,(now-last)/1000);last=now;if(!K.paused){K.time+=dt;update(dt);upFx(dt);}
 if(K.shake>0.001){const c=K.camera;c.position.x+=K.rand(-1,1)*K.shake;c.position.y+=K.rand(-1,1)*K.shake;K.shake*=Math.pow(.02,dt);}
 if(render)render();else K.renderer.render(K.scene,K.camera);for(const k in edge)edge[k]=false;};requestAnimationFrame(f);};
})();
