// TITLE: Pesca na Ria
// Lança a linha, espera que pique, e recolhe sem deixar a linha partir. 3 minutos por dia de pesca.
(()=>{'use strict';
const S=K.store('ps',{best:0,book:{}});
document.documentElement.style.setProperty('--kc','#3de0c8');
K.init({sky:0xf7c98b,fog:[80,320],fov:55,shadow:40,hemi:.75,sunI:1,sunPos:[-60,40,-80],skyLight:0xffe2b8,groundLight:0x2b5a6a});
const scene=K.scene,cam=K.camera;
const FISH=[['Faneca',.2,.6,1,0xc9a36a],['Carapau',.15,.5,1.2,0x7fa8c9],['Dourada',.4,1.8,2,0xe5c76b],['Robalo',.6,3,2.6,0x9fb3bf],['Choco',.3,1.2,1.5,0xb89a86],['Sargo',.3,1.4,1.8,0xbfc7cf],['Linguado',.3,1.5,1.6,0xa08060],['Enguia',.2,1,2.2,0x5a6a3a]];
// água
const wg=new THREE.PlaneGeometry(800,800,80,80);const water=new THREE.Mesh(wg,new THREE.MeshLambertMaterial({color:0x2f7d92,transparent:true,opacity:.95}));water.rotation.x=-Math.PI/2;scene.add(water);const wp=wg.attributes.position;
K.box(800,1,140,0xe3cf9a,0,-.3,-170);for(let i=0;i<30;i++){const p=K.palm();p.position.set(K.rand(-200,200),0,K.rand(-200,-120));scene.add(p);}
for(let i=0;i<10;i++)K.box(K.rand(5,9),K.rand(3,6),5,[0xffffff,0xf3e3c6,0x7fb3d5,0xf2c14e][i%4],-90+i*18,2,-130);
for(const [x,c] of [[-30,0xe8452c],[40,0x2a8bff],[-70,0xffd23f]]){const b=new THREE.Group();K.box(3,1,7,c,0,.4,0,b);K.box(.15,6,.15,0xffffff,0,3.5,0,b);b.position.set(x,0,-60+Math.random()*20);scene.add(b);}
// o teu barco
const boat=new THREE.Group();K.box(2.4,.8,6,0xf2f2f2,0,.3,0,boat);K.box(2.5,.25,6.1,0x2a8bff,0,.75,0,boat);K.box(1.6,.2,1,0x8a6a4a,0,.75,1.5,boat);scene.add(boat);
const me=K.person({shirt:0xe8452c});me.position.set(0,.85,1.6);me.rotation.y=Math.PI;boat.add(me);
const rod=new THREE.Group();K.cyl(.03,.05,3.6,0x2b2b2b,0,1.8,0,rod,6);rod.position.set(.35,1.6,1.2);rod.rotation.x=-.6;boat.add(rod);
const tip=new THREE.Object3D();tip.position.set(0,3.6,0);rod.add(tip);
const bob=K.sph(.32,0xff3030,0,0,0,null,12);bob.visible=false;
const lineG=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);const line=new THREE.Line(lineG,new THREE.LineBasicMaterial({color:0xffffff}));scene.add(line);line.visible=false;
let state='menu',phase='idle',power=0,pdir=1,bobP=new THREE.Vector3(),wait=0,bite=0,fish=null,tension=0,reel=0,dist=0,timeLeft=180,catchList=[],kg=0,fishPos=0,fishV=0,zone=.5;
const tipW=new THREE.Vector3();
function start(){state='play';phase='idle';timeLeft=180;catchList=[];kg=0;K.screen(null);K.play(true);hud();}
function hud(){const t=Math.max(0,Math.ceil(timeLeft));let mid='';
 if(phase==='idle')mid=K.touch?'Mantém o dedo para carregar e larga para lançar':'Mantém ESPAÇO para carregar e larga para lançar';
 else if(phase==='power')mid=`<div style="width:220px;height:14px;border-radius:7px;background:#0006;overflow:hidden"><div style="height:100%;width:${power*100}%;background:linear-gradient(90deg,#3de0c8,#ffd23f,#ff6b6b)"></div></div>`;
 else if(phase==='wait')mid='À espera que pique… (ESPAÇO para recolher)';
 else if(phase==='bite')mid='<b style="color:#ffd23f;font-size:1.3em">PICOU! Carrega já!</b>';
 else if(phase==='fight')mid=`<div style="width:240px"><div style="position:relative;height:18px;border-radius:9px;background:#0007;overflow:hidden"><div style="position:absolute;left:${(zone-.17)*100}%;width:34%;height:100%;background:#3dffa255"></div><div style="position:absolute;left:calc(${fishPos*100}% - 4px);width:8px;height:100%;background:#fff"></div></div><div style="height:6px;margin-top:4px;border-radius:3px;background:#0006"><div style="height:100%;width:${reel*100}%;background:#3de0c8"></div></div><small>${K.touch?'Toca e larga':'Mantém/larga ESPAÇO'} para manter o peixe na zona verde</small></div>`;
 K.hud(`<div class="k-tl"><div class="k-pill"><small>Tempo</small><b>${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}</b></div></div><div class="k-tr"><div class="k-pill"><small>${K.name()} · pescado</small><b>${kg.toFixed(2)} kg</b></div><div class="k-pill"><small>Peixes</small><b>${catchList.length}</b></div></div><div class="k-bc"><div class="k-hint" style="display:flex;flex-direction:column;align-items:center;gap:4px">${mid}</div></div>`);}
let held=false;
function press(){if(state!=='play')return;held=true;K.audio();
 if(phase==='idle'){phase='power';power=0;pdir=1;}
 else if(phase==='wait'){phase='idle';bob.visible=false;line.visible=false;}
 else if(phase==='bite'){phase='fight';const r=Math.random();fish=FISH[Math.min(FISH.length-1,Math.floor(r*r*FISH.length*1.15))];fish={n:fish[0],kg:K.rand(fish[1],fish[2]),str:fish[3],c:fish[4]};fishPos=.5;fishV=0;zone=.5;reel=.15;K.tone(300,.1,'square',.2);}}
function release(){held=false;if(phase==='power'){phase='wait';dist=8+power*30;const a=boat.rotation.y;bobP.set(boat.position.x-Math.sin(a)*dist,0,boat.position.z-Math.cos(a)*dist);bob.visible=true;line.visible=true;wait=K.rand(3,9);K.noise(.15,.2,1500);}}
addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat){e.preventDefault();press();}});addEventListener('keyup',e=>{if(e.code==='Space')release();});
K.renderer.domElement.addEventListener('pointerdown',press);K.pad([['KeyA','◀ Rodar'],['KeyD','Rodar ▶']]);addEventListener('pointerup',release);
function landed(){const f=fish;catchList.push(f);kg+=f.kg;S.data.book[f.n]=Math.max(S.data.book[f.n]||0,f.kg);S.save();K.flash(f.n+'!',f.kg.toFixed(2)+' kg',1400,'#3dffa2');K.sfx.good();K.burst(bob.position.clone(),0x9fe8ff,14);
 if(f.n==='Robalo'&&f.kg>2.5)K.unlock('ps-robalo','Pesca · Robalo de mais de 2,5 kg');phase='idle';bob.visible=false;line.visible=false;fish=null;}
function lost(why){K.flash(why,'',1200,'#ff6b6b');K.sfx.bad();phase='idle';bob.visible=false;line.visible=false;fish=null;}
function end(){state='end';K.play(false);if(kg>S.data.best){S.data.best=kg;}S.save();if(catchList.length>=8)K.unlock('ps-8','Pesca · 8 peixes num dia');K.sfx.win();
 const list=catchList.map(f=>`<tr><td>${f.n}</td><td>${f.kg.toFixed(2)} kg</td></tr>`).join('')||'<tr><td>Nada hoje…</td><td></td></tr>';
 K.screen(`<div class="k-title">Fim do <em>dia</em></div><div class="k-lead">${K.name()}: ${catchList.length} peixes · ${kg.toFixed(2)} kg (recorde ${S.data.best.toFixed(2)} kg)</div><table class="k-tab">${list}</table><button class="k-go" data-a="r">Outro dia</button><button class="k-alt" data-a="m">Menu</button>`,{r:start,m:menu});}
function menu(){state='menu';K.play(false);phase='idle';bob.visible=false;line.visible=false;const bk=Object.entries(S.data.book).map(([n,k])=>`${n} ${k.toFixed(2)} kg`).join(' · ');
 K.screen(`<div class="k-title">Pesca na <em>Ria</em></div><div class="k-lead">Três minutos ao pôr do sol. Lança, espera que o flutuador afunde e recolhe sem partir a linha.</div><button class="k-go" data-a="s">Ir pescar</button><div class="k-lead"><small>${bk?'Maiores: '+bk:'Ainda não pescaste nada.'}</small></div>${K.keysHelp([['ESPAÇO','carregar / lançar / recolher'],['A D','rodar o barco'],['P','pausa']])}`,{s:start});}
K.onQuit=menu;
let hudT=0;
function update(dt){const t=K.time;
 for(let i=0;i<wp.count;i++){const x=wp.getX(i),y=wp.getY(i);wp.setZ(i,Math.sin(x*.08+t*1.2)*.12+Math.cos(y*.07+t)*.1);}wp.needsUpdate=true;
 boat.position.y=Math.sin(t*1.3)*.08;boat.rotation.z=Math.sin(t*1.1)*.03;
 if(state==='play'){timeLeft-=dt;const ax=K.axis();if(phase==='idle'||phase==='power')boat.rotation.y-=ax.x*dt*.8;
  if(phase==='power'){power+=pdir*dt*1.1;if(power>1){power=1;pdir=-1;}if(power<0){power=0;pdir=1;}rod.rotation.x=-.6+power*.9;}else rod.rotation.x+=(-.6-rod.rotation.x)*dt*4;
  if(phase==='wait'){wait-=dt;bob.position.set(bobP.x,Math.sin(t*2)*.05,bobP.z);if(wait<=0){phase='bite';bite=K.rand(.9,1.6);K.tone(880,.08,'sine',.3);K.tone(990,.08,'sine',.3);}}
  if(phase==='bite'){bite-=dt;bob.position.set(bobP.x,-.25+Math.sin(t*20)*.1,bobP.z);if(bite<=0){phase='wait';wait=K.rand(3,8);K.toast('Fugiu o isco… espera outra vez');}}
  if(phase==='fight'){fishV+=(Math.sin(t*fish.str*1.7)+Math.sin(t*3.1+fish.kg))*dt*fish.str*.9;fishV*=.96;fishPos=K.clamp(fishPos+fishV*dt,0,1);if(fishPos<=0||fishPos>=1)fishV*=-.5;
   zone=K.clamp(zone+(held?1:-1)*dt*.9,.17,.83);const inZ=Math.abs(fishPos-zone)<.17;reel=K.clamp(reel+(inZ?.16:-.12)*dt/Math.max(.6,fish.kg*.35),0,1);
   rod.rotation.x=-.2+Math.sin(t*12)*.05*(inZ?1:3);const k=1-reel;bob.position.set(boat.position.x+(bobP.x-boat.position.x)*k,-.1,boat.position.z+(bobP.z-boat.position.z)*k);if(Math.random()<dt*6)K.burst(bob.position.clone(),0xd8f6ff,2);
   if(reel>=1)landed();else if(reel<=0)lost('Partiu a linha!');}
  if(timeLeft<=0&&phase!=='fight'){end();return;}
  hudT-=dt;if(hudT<=0){hudT=.1;hud();}}
 rod.updateMatrixWorld(true);tip.getWorldPosition(tipW);if(line.visible){const p=lineG.attributes.position;p.setXYZ(0,tipW.x,tipW.y,tipW.z);p.setXYZ(1,bob.position.x,bob.position.y,bob.position.z);p.needsUpdate=true;}
 const a=boat.rotation.y,cd=state==='menu'?16:10;const ang=state==='menu'?t*.1:a;cam.position.set(boat.position.x+Math.sin(ang)*cd,state==='menu'?6:4.6,boat.position.z+Math.cos(ang)*cd);cam.lookAt(boat.position.x-Math.sin(ang)*14,0,boat.position.z-Math.cos(ang)*14);}
K._dbg=()=>({state,phase,n:catchList.length,kg:+kg.toFixed(2),reel:+reel.toFixed(2),t:Math.round(timeLeft)});
K.loop(update);menu();
})();
