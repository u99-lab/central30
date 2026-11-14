// TITLE: Comboio do Oeste
// Conduz o regional: acelera, respeita os limites de velocidade e pára com a porta certa no cais.
(()=>{'use strict';
const S=K.store('co',{best:[0,0,0]});
document.documentElement.style.setProperty('--kc','#35d07f');
K.init({sky:0x9fd0f5,fog:[120,520],fov:62,shadow:60,hemi:.7,sunI:1.05,sunPos:[40,80,20]});
const scene=K.scene,cam=K.camera;
const LINES=[{n:'Linha do Oeste',st:['Caldas da Rainha','Óbidos','Bombarral','Torres Vedras'],gap:900},{n:'Ramal da Serra',st:['Coimbra-B','Souselas','Pampilhosa','Mealhada','Aveiro'],gap:1100},{n:'Expresso da Costa',st:['Lagos','Portimão','Tunes','Loulé','Faro','Olhão'],gap:1300}];
// via: x(z) com curvas suaves
const curveX=z=>Math.sin(z*.0021)*38+Math.sin(z*.0007)*70;
let L=0,total=0,stations=[],limits=[],built=[];
function clear(){built.forEach(o=>scene.remove(o));built=[];}
const add=o=>{built.push(o);return o;};
function buildLine(){clear();const ln=LINES[L];stations=ln.st.map((n,i)=>({n,z:i*ln.gap+120}));total=stations[stations.length-1].z+200;
 limits=[];for(let i=0;i<stations.length-1;i++){const a=stations[i].z,b=stations[i+1].z;limits.push({z:a+60,v:[80,100,120][L]});limits.push({z:a+(b-a)*.5,v:[60,80,90][L]});limits.push({z:b-260,v:60});}
 const g=add(new THREE.Group());scene.add(g);
 const tg=new THREE.PlaneGeometry(2000,total+600);const grass=new THREE.Mesh(tg,new THREE.MeshLambertMaterial({color:0x3f7030}));grass.rotation.x=-Math.PI/2;grass.position.set(0,-.05,total/2);grass.receiveShadow=true;g.add(grass);
 const sl=new THREE.InstancedMesh(new THREE.BoxGeometry(2.6,.15,.3),new THREE.MeshLambertMaterial({color:0x5a4632}),Math.ceil(total/1.2));let i=0;const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),sc=new THREE.Vector3(1,1,1);
 for(let z=-100;z<total+100&&i<sl.count;z+=1.2){const a=Math.atan(curveX(z+1)-curveX(z));q.setFromAxisAngle(new THREE.Vector3(0,1,0),a);v.set(curveX(z),.08,z);m4.compose(v,q,sc);sl.setMatrixAt(i++,m4);}sl.count=i;g.add(sl);
 for(const off of [-.72,.72]){const pts=[];for(let z=-100;z<total+100;z+=6)pts.push(new THREE.Vector3(curveX(z)+off,.22,z));const c=new THREE.CatmullRomCurve3(pts);g.add(new THREE.Mesh(new THREE.TubeGeometry(c,pts.length*2,.07,4,false),new THREE.MeshPhongMaterial({color:0x9aa0a8,shininess:80})));}
 const bal=[];for(let z=-100;z<total+100;z+=6)bal.push(new THREE.Vector3(curveX(z),0,z));
 for(let z=-100;z<total+100;z+=40){const x=curveX(z);K.box(4,.12,40,0x8b8478,x,.02,z,g);}
 // postes de catenária e árvores
 for(let z=0;z<total;z+=55){const x=curveX(z);K.box(.25,6.5,.25,0x777777,x+2.6,3.25,z,g);K.box(2.8,.15,.15,0x777777,x+1.3,6.3,z,g);}
 for(let k=0;k<total/14;k++){const z=K.rand(-50,total+50),s=Math.random()<.5?-1:1,x=curveX(z)+s*K.rand(9,140);const t=K.tree(Math.random()<.3?0x4f8a3a:0x3f7a2a);t.position.set(x,0,z);t.scale.setScalar(K.rand(.8,1.6));g.add(t);}
 for(let k=0;k<total/180;k++){const z=K.rand(0,total),s=Math.random()<.5?-1:1,x=curveX(z)+s*K.rand(25,90);K.box(K.rand(6,10),K.rand(4,7),K.rand(6,9),[0xf1ebe0,0xe9d8b8,0xffffff][k%3],x,2.5,z,g);}
 // estações
 for(const st of stations){const x=curveX(st.z);K.box(4,1,90,0xc9c2b6,x-4.2,.5,st.z,g);K.box(4.2,.15,90,0xeeeeee,x-4.1,1.05,st.z,g);K.box(.15,.02,90,0xffd23f,x-2.5,1.13,st.z,g);
  K.box(6,4,12,0xf3e3c6,x-9,2,st.z,g);K.box(6.6,.5,12.6,0xb5452c,x-9,4.25,st.z,g);
  const sg=K.tex(512,96,(c,w,h)=>{c.fillStyle='#163b78';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='700 46px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(st.n,w/2,h/2+2);});
  for(const dz of [-30,30]){const p=new THREE.Mesh(new THREE.PlaneGeometry(4,.75),new THREE.MeshBasicMaterial({map:sg,side:THREE.DoubleSide}));p.position.set(x-4.2,3,st.z+dz);p.rotation.y=Math.PI/2;g.add(p);K.box(.1,2.2,.1,0x333333,x-4.2,2,st.z+dz-1.6,g);K.box(.1,2.2,.1,0x333333,x-4.2,2,st.z+dz+1.6,g);}
  // marca de paragem
  K.box(.8,.02,.3,0xff3030,x-2.4,1.14,st.z,g);const mk=K.box(.2,1.6,.2,0xffffff,x-2.4,1.9,st.z,g);
  st.people=[];for(let k=0;k<8;k++){const p=K.person({shirt:[0xe8452c,0x2a8bff,0xffd23f,0x35d07f][k%4]});p.position.set(x-4.4+K.rand(-1,1),1.12,st.z+K.rand(-30,30));p.rotation.y=-Math.PI/2;g.add(p);st.people.push(p);}}
 // placas de velocidade
 for(const l of limits){const x=curveX(l.z);const tx=K.tex(128,128,(c,w,h)=>{c.fillStyle='#fff';c.beginPath();c.arc(64,64,60,0,7);c.fill();c.lineWidth=12;c.strokeStyle='#d62828';c.stroke();c.fillStyle='#111';c.font='900 52px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(l.v,64,68);});
  const p=new THREE.Mesh(new THREE.CircleGeometry(.6,24),new THREE.MeshBasicMaterial({map:tx}));p.position.set(x+2.3,3,l.z);p.rotation.y=Math.PI;g.add(p);K.box(.1,3,.1,0x555555,x+2.3,1.5,l.z+.05,g);}}
// comboio
const train=new THREE.Group();scene.add(train);
const carM=c=>{const g=new THREE.Group();K.box(2.9,3.1,16,0xf2f2f2,0,2.3,0,g);K.box(2.6,.3,15.6,0x8a9096,0,3.95,0,g);K.box(2.92,.5,16.02,c,0,1.3,0,g);K.box(2.92,.9,15.4,0x203040,0,2.9,0,g);K.box(2.92,.25,16.02,c,0,3.6,0,g);for(const z of [-5,5])K.box(3,.8,2.6,0x222222,0,.55,z,g);return g;};
const cabin=carM(0x35a050);train.add(cabin);K.box(2.8,1.4,.2,0x8fd4ff,0,2.9,8.05,cabin);K.box(2.92,.8,.4,0xffd23f,0,1.4,8.1,cabin);
const c2=carM(0x35a050);c2.position.z=-16.6;train.add(c2);
let state='menu',z=0,v=0,thr=0,stIdx=0,score=0,fines=0,dwell=0,timer=0,doors=false,view=0,stopped=false,msg='';
const lim=zz=>{let c=[80,100,120][L];for(const l of limits)if(l.z<=zz)c=l.v;return c;};
function start(l){L=l;buildLine();z=stations[0].z;v=0;thr=0;stIdx=1;score=0;fines=0;timer=0;dwell=0;doors=false;state='play';K.screen(null);K.play(true);hud();K.toast('Partida de '+stations[0].n+' para '+stations[stations.length-1].n);}
function hud(){const nx=stations[stIdx],dist=nx?Math.max(0,nx.z-z):0,kmh=v*3.6,lm=lim(z+10);
 K.hud(`<div class="k-tl"><div class="k-pill"><small>Velocidade</small><b style="color:${kmh>lm+2?'#ff6b6b':'#fff'}">${kmh.toFixed(0)} km/h</b></div><div class="k-pill"><small>Limite</small><b>${lm}</b></div></div><div class="k-tc"><div class="k-pill" style="text-align:center"><small>Próxima: ${nx?nx.n:'—'}</small><b>${dist>999?(dist/1000).toFixed(1)+' km':dist.toFixed(0)+' m'}</b></div></div><div class="k-tr"><div class="k-pill"><small>${K.name()} · pontos</small><b>${Math.round(score)}</b></div><div class="k-pill"><small>Manete</small><b>${thr>0?'Tração '+Math.round(thr*100)+'%':thr<0?'Travão '+Math.round(-thr*100)+'%':'Neutro'}</b></div></div><div class="k-bc"><div class="k-hint">${msg||(K.touch?'▲ acelerar · ▼ travar · pára na marca vermelha':'W / ↑ tração · S / ↓ travão · C câmara · pára na marca vermelha')}</div></div>`);}
function arrive(){const st=stations[stIdx],err=Math.abs(z-st.z);let pts=0,txt;
 if(err<=2){pts=300;txt='Paragem perfeita!';}else if(err<=8){pts=200;txt='Boa paragem';}else if(err<=20){pts=90;txt='Parou um pouco fora';}else{pts=20;txt='Parou longe da marca';}
 score+=pts;K.flash(txt,st.n+' · '+err.toFixed(1)+' m · +'+pts,1600,err<=8?'#3dffa2':'#ffd23f');K.sfx.good();doors=true;dwell=4;
 st.people.forEach((p,i)=>{p.userData.board=K.rand(.2,3);});}
function finish(){state='end';K.play(false);const tot=Math.max(0,Math.round(score-fines));if(tot>S.data.best[L]){S.data.best[L]=tot;S.save();}if(fines===0&&tot>=(stations.length-1)*250)K.unlock('co-pro','Comboio · Linha perfeita');K.sfx.win();
 K.screen(`<div class="k-title"><em>Fim da linha</em></div><div class="k-lead">${LINES[L].n} · ${stations[stations.length-1].n}<br>Paragens: ${Math.round(score)} · excesso de velocidade: −${Math.round(fines)}<br><b>Total ${tot}</b> (recorde ${S.data.best[L]})</div><button class="k-go" data-a="r">Repetir</button>${L<2?'<button class="k-alt" data-a="n">Próxima linha</button>':''}<button class="k-alt" data-a="m">Menu</button>`,{r:()=>start(L),n:()=>start(L+1),m:menu});}
function menu(){state='menu';K.play(false);if(!stations.length){L=0;buildLine();z=stations[0].z;}
 K.screen(`<div class="k-title">Comboio do <em>Oeste</em></div><div class="k-lead">És maquinista: respeita os limites e pára o comboio com a marca vermelha no cais.</div><div class="k-row">${LINES.map((l,i)=>`<button class="k-chip" data-a="go" data-v="${i}">${l.n}<small>${l.st.length} estações · recorde ${S.data.best[i]}</small></button>`).join('')}</div>${K.keysHelp([['W ↑','tração'],['S ↓','travão'],['C','câmara'],['P','pausa']])}`,{go:v=>start(+v)});}
K.onQuit=menu;
K.pad([['KeyW','Tração ▲'],['KeyS','Travão ▼'],['KeyC','Câmara']]);
let hudT=0;
function update(dt){
 if(state==='menu'){const t=K.time*.15;const zz=stations[0].z+Math.sin(t)*60;cam.position.set(curveX(zz)+18,9,zz-20);cam.lookAt(curveX(zz),2,zz+10);train.position.set(curveX(stations[0].z),0,stations[0].z);return;}
 if(K.hit('KeyC'))view=(view+1)%2;
 if(state==='play'){const ax=K.axis();timer+=dt;
  if(dwell>0){dwell-=dt;thr=Math.min(thr,0);v=0;const st=stations[stIdx];st.people.forEach(p=>{if(p.userData.board!=null){p.userData.board-=dt;if(p.userData.board<0){p.position.x+=dt*2.5;if(p.position.x>curveX(st.z)-1.5)p.visible=false;}else K.walk(p,K.time*8,.6);}});
   msg='Portas abertas · '+Math.ceil(dwell)+' s';if(dwell<=0){doors=false;msg='';stIdx++;if(stIdx>=stations.length){finish();return;}K.toast('Próxima estação: '+stations[stIdx].n);K.tone(660,.15,'sine',.2);setTimeout(()=>K.tone(520,.2,'sine',.2),180);}}
  else{thr=K.clamp(thr+(ax.y>0?1:ax.y<0?-1:0)*dt*.9,-1,1);if(!ax.y&&Math.abs(thr)<.04)thr=0;
   const acc=thr>0?thr*1.1*(1-v/45):thr*1.6;v=Math.max(0,v+(acc-.04-v*v*.00025)*dt);if(v===0&&thr<0)thr=Math.max(thr,-.3);
   z+=v*dt;const kmh=v*3.6,lm=lim(z+10);if(kmh>lm+3){fines+=dt*(kmh-lm)*.6;msg='Acima do limite! Trava';}else if(msg.startsWith('Acima'))msg='';
   const st=stations[stIdx];if(st){if(v<.05&&Math.abs(z-st.z)<60&&thr<=0){v=0;arrive();}if(z>st.z+60){K.flash('Passaste a estação',st.n,1400,'#ff6b6b');K.sfx.bad();score-=100;stIdx++;if(stIdx>=stations.length){finish();return;}}}
   if(z>total-150){finish();return;}}
  if(v>1&&Math.random()<dt*v*.05)K.noise(.03,.04,300);}
 const x=curveX(z),a=Math.atan2(curveX(z+1)-x,1);train.position.set(x,.3,z);train.rotation.y=a;
 const x2=curveX(z-16.6);c2.position.set(((x2-x)+Math.sin(a)*16.6)*Math.cos(a),0,-16.6);c2.rotation.y=Math.atan2(curveX(z-15.6)-x2,1)-a;
 if(view===0){const bz=z-30;cam.position.set(curveX(bz)+7,6.5,bz);cam.lookAt(curveX(z+30),2,z+30);}
 else{cam.position.set(x+Math.sin(a)*8.2,3.4,z+Math.cos(a)*8.2);cam.lookAt(curveX(z+60),2.6,z+60);}
 hudT-=dt;if(hudT<=0&&state==='play'){hudT=.15;hud();}}
K._dbg=()=>({state,z:+z.toFixed(1),v:+(v*3.6).toFixed(1),stIdx,score:Math.round(score),fines:Math.round(fines),next:stations[stIdx]?+(stations[stIdx].z-z).toFixed(1):0});
K.loop(update);menu();
})();
