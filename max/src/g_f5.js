// TITLE: Futebol de Rua 5x5
// Futsal de rua 5 contra 5 numa jaula: passes, remates com força, carrinhos, guarda-redes e torneio.
(()=>{'use strict';
const S=K.store('f5',{cups:0,wins:0,goals:0});
document.documentElement.style.setProperty('--kc','#3dffa2');
K.init({sky:0x9fdcff,fog:[70,170],fov:44,shadow:30,sunPos:[14,40,22]});
const scene=K.scene,cam=K.camera,PX=20,PZ=12,GZ=3,GH=2.3,BR=.22;
const TEAMS=[['Vale Verde',.3,0x3fbf6b,0xffffff],['Buarcos United',.45,0x35b6e8,0x10243f],['Atlético da Marginal',.6,0x8a4dff,0x222222],['Naval 30',.75,0x2444c9,0xffd23f],['Leões de Quiaios',.9,0x1d1d28,0xff3d5a]];
const FORM=[[-18.6,0],[-11,0],[-3,-7],[-3,7],[6,0]];
// ----- campo
const ct=K.tex(1024,640,(c,w,h)=>{c.fillStyle='#2f8f6a';c.fillRect(0,0,w,h);for(let i=0;i<10;i++){c.fillStyle=i%2?'#2a8562':'#34997270';c.fillRect(i*w/10,0,w/10,h);}c.strokeStyle='#fff';c.lineWidth=6;c.strokeRect(8,8,w-16,h-16);c.beginPath();c.moveTo(w/2,8);c.lineTo(w/2,h-8);c.stroke();c.beginPath();c.arc(w/2,h/2,80,0,7);c.stroke();
 for(const x of [8,w-8]){c.beginPath();c.arc(x,h/2,150,0,7);c.stroke();}c.fillStyle='#fff';for(const x of [w/2,170,w-170]){c.beginPath();c.arc(x,h/2,7,0,7);c.fill();}});
const pitch=new THREE.Mesh(new THREE.PlaneGeometry(PX*2+.6,PZ*2+.6),new THREE.MeshLambertMaterial({map:ct}));pitch.rotation.x=-Math.PI/2;pitch.receiveShadow=true;scene.add(pitch);
K.plane(300,300,0x8e959f,0,-.03,0);K.plane(300,80,0x6cc070,0,-.02,-60);
for(const s of [-1,1]){K.box(PX*2+1.4,1,.3,0x2444c9,0,.5,s*(PZ+.45));for(const e of [-1,1])K.box(.3,1,PZ-GZ+.2,0x2444c9,s*(PX+.45),.5,e*(GZ+(PZ-GZ)/2+.1));
 for(let x=-PX;x<=PX;x+=4)K.box(.1,3.2,.1,0x8a93ad,x,2.6,s*(PZ+.45));K.box(PX*2+1,.08,.08,0x8a93ad,0,4.2,s*(PZ+.45));
 // balizas
 for(const e of [-1,1])K.cyl(.09,.09,GH,0xffffff,s*PX,GH/2,e*GZ,null,8);const bar=K.cyl(.09,.09,GZ*2+.18,0xffffff,s*PX,GH,0,null,8);bar.rotation.x=1.57;
 const nm=new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.55}),n=new THREE.Mesh(new THREE.BoxGeometry(1.6,GH,GZ*2,3,5,10),nm);n.position.set(s*(PX+.85),GH/2,0);scene.add(n);}
K.box(60,11,6,0xfff2e0,0,5.5,-24);K.box(61,1,7,0xc0452c,0,11.5,-24);for(let x=-26;x<=26;x+=4)for(const y of [3,7.2])K.box(2.2,1.8,.2,0x9fd8ff,x,y,-20.95);
for(const [x,z,s] of [[-27,-14,1.6],[27,-14,1.7],[-30,4,1.5],[30,5,1.6],[-14,-16,1.3],[14,-16,1.4]])K.tree(x,z,s);
const fans=[];for(let i=0;i<22;i++){const p=K.person({shirt:K.pick([0xffd23f,0x35d07f,0x2a8bff,0xff8ac0,0xffffff,0xff8a3d])});p.position.set(-21+i*2,0,-PZ-2-(i%2)*1.1);fans.push(p);}
for(let i=0;i<5;i++)K.cloud(K.rand(-90,90),K.rand(40,60),K.rand(-120,-50),K.rand(2,4));
const bT=K.tex(128,64,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#1b2340';for(const [x,y] of [[16,16],[48,44],[80,18],[112,46],[64,60],[30,62],[98,2]]){c.beginPath();c.arc(x,y,9,0,7);c.fill();}});
const ballM=new THREE.Mesh(new THREE.SphereGeometry(BR,16,12),new THREE.MeshLambertMaterial({map:bT}));ballM.castShadow=true;scene.add(ballM);
const ring=new THREE.Mesh(new THREE.RingGeometry(.55,.72,24),new THREE.MeshBasicMaterial({color:0xffd23f,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;scene.add(ring);
// ----- estado
let P=[],ball={x:0,y:BR,z:0,vx:0,vy:0,vz:0,owner:null,free:0,last:null},ctl=null,state='menu',score=[0,0],clock=0,half=1,lvl=0,cup=null,charge=0,charging=false,freeze=0,golden=false,opp=TEAMS[0];
const timers=[];const after=(t,f)=>timers.push({t,f});
function teams(){for(const p of P)scene.remove(p.g);P=[];for(let t=0;t<2;t++)for(let i=0;i<5;i++){const gk=i===0,g=K.person(t===0?{shirt:gk?0x25c2a0:0xffd23f,shorts:0x1b2340,socks:0xffd23f,gloves:gk?0xffffff:undefined}:{shirt:gk?0xff7a3d:opp[2],shorts:opp[3]===0xffffff?0x222222:opp[3],skin:K.pick([0xf0c8a0,0xd9a87c,0xb07d56]),hair:0x1c1c1c,gloves:gk?0xffffff:undefined});
  P.push({g,t,i,gk,x:0,z:0,a:0,vx:0,vz:0,run:0,kick:0,tack:0,tcd:0,stun:0,hold:0});}}
function kickoff(t){for(const p of P){const s=p.t?-1:1;p.x=FORM[p.i][0]*s;p.z=FORM[p.i][1]*(p.t?-1:1);p.a=s>0?1.57:-1.57;p.vx=p.vz=0;p.stun=p.tack=0;}const k=P.find(p=>p.t===t&&p.i===4);k.x=(t?1:-1)*.6;k.z=0;ball.x=0;ball.z=0;ball.y=BR;ball.vx=ball.vy=ball.vz=0;ball.owner=null;ball.free=0;freeze=1.1;ctl=P[4];}
const sgn=p=>p.t?-1:1;
function give(p){ball.owner=p;ball.last=p;ball.vx=ball.vy=ball.vz=0;if(p.t===0&&!p.gk)ctl=p;if(p.gk)p.hold=.7;}
function kick(p,dx,dz,sp,up){const l=Math.hypot(dx,dz)||1;ball.owner=null;ball.x=p.x+dx/l*.8;ball.z=p.z+dz/l*.8;ball.y=BR+.05;ball.vx=dx/l*sp;ball.vz=dz/l*sp;ball.vy=up;ball.free=.25;ball.last=p;p.kick=.3;p.a=Math.atan2(dx,dz);K.sfx.kick();}
function pass(p,ix,iz){let best=null,bs=-1e9;for(const q of P){if(q.t!==p.t||q===p||q.gk)continue;const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);let sc=(ix||iz)?(dx*ix+dz*iz)/d*10-d*.15:dx*sgn(p)*.5-d*.1;for(const o of P)if(o.t!==p.t){const t=K.clamp(((o.x-p.x)*dx+(o.z-p.z)*dz)/(d*d),0,1);if(Math.hypot(p.x+dx*t-o.x,p.z+dz*t-o.z)<1.3)sc-=4;}if(sc>bs){bs=sc;best=q;}}
 if(!best)return;const dx=best.x+best.vx*.4-p.x,dz=best.z+best.vz*.4-p.z,d=Math.hypot(dx,dz);kick(p,dx,dz,K.clamp(8+d*.9,10,22),d>14?2.5:.3);if(p.t===0)ctl=best;}
function shoot(p,pw,bias){const s=sgn(p),gx=s*PX,err=p===ctl?.5:1.6-1.2*(p.t?lvl:.5),tz=K.clamp((bias||K.pick([-1,1]))*2.3+K.rand(-err,err),-3.4,3.4);kick(p,gx-p.x,tz-p.z,17+pw*13,1.2+pw*4.5);}
function goal(t){score[t]++;if(t===0){S.data.goals++;K.sfx.cheer();K.sfx.good();K.flash('GOLO!',score[0]+' – '+score[1],1700,'#3dffa2');K.confetti(new THREE.Vector3(PX-2,2,0));}else{K.sfx.ooh();K.flash('GOLO DELES',score[0]+' – '+score[1],1700,'#ff6b6b');}K.shake=.3;state='goal';hud();
 after(2,()=>{if(golden)return end();state='play';kickoff(1-t);});}
function hud(){K.hud(`<div class="k-tc"><div class="k-pill" style="text-align:center"><small>${golden?'Golo de ouro':half+'.ª parte'} · <span id="hc"></span></small><b>Tavarede ${score[0]} – ${score[1]} ${opp[0]}</b></div></div><div class="k-bc" style="flex-direction:column"><div class="k-meter" id="hm" style="opacity:0;width:200px;height:16px"><i id="pw" style="width:0"></i></div><div class="k-hint" id="hh"></div></div>`);}
function startMatch(o,l){opp=o;lvl=l;score=[0,0];clock=90;half=1;golden=false;teams();kickoff(0);state='play';K.screen(null);K.play(true);K.useStick=true;K.pad([['Space','Remate / Carrinho'],['KeyF','Passe / Trocar']]);hud();K.sfx.whistle();}
function end(){state='end';K.play(false);const win=score[0]>score[1];if(win){S.data.wins++;K.sfx.win();}else K.sfx.bad();if(win&&score[1]===0&&score[0]>=3)K.unlock('f5-3-0','Futebol de Rua · Vitória por 3 ou mais sem sofrer');
 if(cup&&win){cup.i++;if(cup.i>=3){S.data.cups++;S.save();K.unlock('f5-taca','Futebol de Rua · Taça do Bairro');K.confetti(new THREE.Vector3(0,3,0));K.screen(`<div class="k-title">🏆 <em>CAMPEÕES!</em></div><div class="k-lead">A Taça do Bairro é de Tavarede. Final: ${score[0]}–${score[1]}</div><button class="k-go" data-a="m">Festejar</button>`,{m:menu});cup=null;return;}
  S.save();K.screen(`<div class="k-title"><em>Passaste!</em></div><div class="k-lead">${score[0]}–${score[1]} contra ${opp[0]}</div><button class="k-go" data-a="n">${cup.i===2?'FINAL':'Meia-final'}</button>`,{n:()=>startMatch(cup.t[cup.i],cup.t[cup.i][1])});return;}
 S.save();K.screen(`<div class="k-title">${win?'<em>Vitória!</em>':'Derrota'}</div><div class="k-lead">Tavarede ${score[0]} – ${score[1]} ${opp[0]}${cup?' · ficaste pelo caminho':''}</div><button class="k-go" data-a="r">${cup?'Menu':'Desforra'}</button>${cup?'':'<button class="k-alt" data-a="m">Menu</button>'}`,{r:()=>{if(cup){cup=null;menu();}else startMatch(opp,lvl);},m:menu});}
function menu(){state='menu';K.play(false);if(!P.length){teams();kickoff(0);}
 K.screen(`<div class="k-title">Futebol de Rua <em>5x5</em></div><div class="k-lead">Na jaula não há bolas fora: passa, remata e defende.</div><button class="k-go" data-a="cup">🏆 Taça do Bairro</button>
 <div class="k-lab">Jogo rápido</div><div class="k-row">${TEAMS.map((t,i)=>`<button class="k-chip" data-a="go" data-v="${i}">${t[0]}<small>${'★'.repeat(i+1)}</small></button>`).join('')}</div>
 <table class="k-tab"><tr><td>Taças</td><td>${S.data.cups}</td></tr><tr><td>Vitórias</td><td>${S.data.wins}</td></tr><tr><td>Golos marcados</td><td>${S.data.goals}</td></tr></table>
 ${K.keysHelp([['W A S D','correr'],['ESPAÇO','remate (manter = força) · sem bola: carrinho'],['F','passe · sem bola: trocar de jogador'],['SHIFT','sprint'],['P','pausa']])}`,
 {go:v=>{cup=null;startMatch(TEAMS[+v],TEAMS[+v][1]);},cup:()=>{const t=TEAMS.slice().sort(()=>Math.random()-.5).slice(0,3).sort((a,b)=>a[1]-b[1]);cup={i:0,t};startMatch(t[0],t[0][1]);}});}
K.onQuit=()=>{cup=null;menu();};
function mv(p,tx,tz,sp){const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);if(d<.25){p.vx=p.vz=0;return;}p.vx=dx/d*sp;p.vz=dz/d*sp;}
function ai(p,dt,chaser){const s=sgn(p),L=p.t?lvl:.55,o=ball.owner,spd=5.2+L*1.6;
 if(p.gk){const gx=-s*18.7;if(o===p){p.hold-=dt;mv(p,gx,p.z,2);if(p.hold<=0)pass(p,s,0);return;}const dz=K.clamp(ball.z*.65,-2.7,2.7),near=Math.hypot(ball.x-gx,ball.z)<5&&!o;mv(p,near?ball.x:gx,near?ball.z:dz,near?5.5:3.4+L*2.2);return;}
 if(o===p){const gx=s*PX,dg=Math.hypot(gx-p.x,p.z);let tz=p.z*.9,blocked=false;for(const q of P)if(q.t!==p.t&&!q.gk){const fx=(q.x-p.x)*s,dz=q.z-p.z;if(fx>0&&fx<3.2&&Math.abs(dz)<1.8){blocked=true;tz=p.z+(dz>0?-4:4);}}
   if(dg<11&&Math.abs(p.z)<7&&Math.random()<dt*(2+L*4)){shoot(p,.5+L*.4);return;}if(blocked&&Math.random()<dt*(1.2+L*2)){pass(p,0,0);return;}mv(p,gx-s*4,K.clamp(tz,-PZ+1,PZ-1),spd*.92);return;}
 if(chaser){const tx=ball.x+ball.vx*.25,tz=ball.z+ball.vz*.25;mv(p,tx,tz,spd);if(o&&o.t!==p.t&&p.tcd<=0&&Math.hypot(o.x-p.x,o.z-p.z)<1.25&&Math.random()<dt*(1.2+L*3.2)){p.tcd=.9;if(Math.random()<.45+L*.3){steal(p,o);}}return;}
 const att=o&&o.t===p.t,hx=K.clamp(FORM[p.i][0]*s+ball.x*.55+(att?s*5:-s*2),-PX+2,PX-2),hz=K.clamp(FORM[p.i][1]*s+ball.z*.3,-PZ+1,PZ-1);mv(p,hx,hz,spd*.8);}
function steal(p,o){o.stun=.45;ball.owner=null;give(p);K.sfx.hit();if(p===ctl||o===ctl)K.shake=.15;}
function update(dt){for(let i=timers.length-1;i>=0;i--){timers[i].t-=dt;if(timers[i].t<=0){const f=timers[i].f;timers.splice(i,1);f();}}
 fans.forEach((f,i)=>f.position.y=state==='goal'?Math.abs(Math.sin(K.time*9+i))*.3:0);
 if(state==='menu'||state==='end'){const t=K.time*.15;cam.position.set(Math.sin(t)*26,12,24+Math.cos(t)*4);cam.lookAt(0,.5,0);ring.visible=false;if(state==='end')return;}
 const demo=state==='menu';if(freeze>0)freeze-=dt;const live=(state==='play'||demo)&&freeze<=0;
 if(state==='play'&&freeze<=0&&!golden){clock-=dt;if(clock<=0){if(half===1){half=2;clock=90;K.sfx.whistle(true);K.flash('INTERVALO','2.ª parte',1400,'#fff');kickoff(1);hud();}else if(score[0]===score[1]){golden=true;K.flash('GOLO DE OURO','Quem marcar ganha',1600,'#ffd23f');kickoff(0);hud();}else{K.sfx.whistle(true);end();return;}}}
 // quem persegue a bola
 const ch=[null,null];for(const t of [0,1]){let bd=1e9;for(const p of P)if(p.t===t&&!p.gk&&ball.owner!==p){const d=Math.hypot(p.x-ball.x,p.z-ball.z);if(d<bd){bd=d;ch[t]=p;}}if(ball.owner&&ball.owner.t===t)ch[t]=null;}
 if(!demo&&ctl&&ball.owner!==ctl&&(!ball.owner||ball.owner.t!==0)&&K.hit('KeyF','KeyQ','KeyJ')&&ch[0])ctl=ch[0];
 for(const p of P){p.vx=p.vz=0;if(p.tcd>0)p.tcd-=dt;if(p.kick>0)p.kick-=dt;
  if(p.stun>0){p.stun-=dt;}else if(!live){}
  else if(p===ctl&&!demo){const ax=K.axis(),sp=(K.down('ShiftLeft','ShiftRight')?7.6:6.3)*(ball.owner===p?.92:1);
   if(p.tack>0){p.tack-=dt;p.vx=Math.sin(p.a)*10;p.vz=Math.cos(p.a)*10;const o=ball.owner;if(o&&o.t!==0&&Math.hypot(o.x-p.x,o.z-p.z)<1.3)steal(p,o);}
   else{p.vx=ax.x*sp;p.vz=-ax.y*sp;if(ball.owner===p){if(K.hit('Space')){charging=true;charge=0;}if(charging){charge=Math.min(1,charge+dt*1.5);if(!K.down('Space')){charging=false;const fw=Math.sin(p.a)>-.3;if(fw)shoot(p,charge,ax.y>.3?-1:ax.y<-.3?1:0);else kick(p,Math.sin(p.a),Math.cos(p.a),14+charge*10,1+charge*3);}}if(K.hit('KeyF','KeyJ','KeyE'))pass(p,ax.x,-ax.y);}
    else{charging=false;if(K.hit('Space')&&p.tcd<=0){p.tack=.3;p.tcd=1;K.sfx.whoosh();}}}}
  else ai(p,dt,ch[p.t]===p&&(p.t===1||demo||p!==ctl));
  p.x+=p.vx*dt;p.z+=p.vz*dt;p.x=K.clamp(p.x,-PX+.4,PX-.4);p.z=K.clamp(p.z,-PZ+.4,PZ-.4);
  for(const q of P)if(q!==p){const dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz);if(d<.75&&d>.01){p.x+=dx/d*(.75-d)*.5;p.z+=dz/d*(.75-d)*.5;}}
  const m=Math.hypot(p.vx,p.vz);if(m>.5){p.a+=K.angDiff(p.a,Math.atan2(p.vx,p.vz))*Math.min(1,dt*14);p.run+=dt*m*2.1;K.walk(p.g,p.run,.95);}else K.pose(p.g);
  p.g.position.set(p.x,0,p.z);p.g.rotation.set(p.tack>0?-1.1:p.stun>0?.5:0,p.a,0);if(p.kick>0)p.g.userData.P.legR.rotation.x=-1.4;if(p.gk&&ball.owner===p){p.g.userData.P.armL.rotation.x=p.g.userData.P.armR.rotation.x=-1.4;}}
 // bola
 const o=ball.owner;if(o){ball.x=o.x+Math.sin(o.a)*.75;ball.z=o.z+Math.cos(o.a)*.75;ball.y=o.gk?1.1:BR;ballM.rotation.x+=dt*Math.hypot(o.vx,o.vz)*3;}
 else{if(ball.free>0)ball.free-=dt;ball.vy-=16*dt;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.z+=ball.vz*dt;if(ball.y<BR){ball.y=BR;if(ball.vy<-3)K.sfx.bounce(.5);ball.vy*=-.5;if(Math.abs(ball.vy)<1)ball.vy=0;const f=Math.pow(.45,dt);ball.vx*=f;ball.vz*=f;}
  if(Math.abs(ball.z)>PZ-BR){ball.z=Math.sign(ball.z)*(PZ-BR);ball.vz*=-.75;K.sfx.bounce(.4);}
  if(Math.abs(ball.x)>PX-BR){if(Math.abs(ball.z)<GZ-.1&&ball.y<GH){if(Math.abs(ball.x)>PX+.5&&state==='play'){goal(ball.x>0?0:1);ball.vx*=.1;ball.vz*=.1;}else if(Math.abs(ball.x)>PX+1.3){ball.x=Math.sign(ball.x)*(PX+1.3);ball.vx*=-.2;}}else if(Math.abs(ball.x)<PX+.4||Math.abs(ball.z)>=GZ-.1){if(Math.abs(Math.abs(ball.z)-GZ)<.25&&ball.y<GH+.2)K.tone(900,.2,'triangle',.25,500);ball.x=Math.sign(ball.x)*(PX-BR);ball.vx*=-.75;K.sfx.bounce(.4);}}
  if(live&&ball.free<=0&&ball.y<1.5)for(const p of P){if(p.stun>0||p.kick>0)continue;const d=Math.hypot(p.x-ball.x,p.z-ball.z),sp=Math.hypot(ball.vx,ball.vz);if(d<(p.gk?1.25:.85)){if(p.gk){const L=p.t?lvl:.55;if(sp<15||Math.random()<.35+L*.5){give(p);K.sfx.hit();if(sp>15&&p.t===1)K.flash('DEFESA!','',600,'#ff8a3d');}else{ball.free=.3;}}else if(sp<19||ball.last&&ball.last.t===p.t)give(p);else{ball.vx*=-.4;ball.vz*=.5;ball.free=.2;}break;}}
  ballM.rotation.x+=ball.vz*dt*3;ballM.rotation.z-=ball.vx*dt*3;}
 ballM.position.set(ball.x,ball.y,ball.z);
 if(demo)return;ring.visible=!!ctl;if(ctl)ring.position.set(ctl.x,.04,ctl.z);
 const cx=K.clamp(ball.x*.72,-13,13);cam.position.x=K.damp(cam.position.x,cx,4,dt);cam.position.y=17.5;cam.position.z=23.5;cam.lookAt(cam.position.x,0,1.2);
 const hc=K.$('hc');if(hc){const c=Math.max(0,Math.ceil(clock));hc.textContent=golden?'∞':Math.floor(c/60)+':'+String(c%60).padStart(2,'0');K.$('hm').style.opacity=charging?1:0;K.$('pw').style.width=charge*100+'%';K.$('hh').textContent=ball.owner===ctl?'ESPAÇO remata · F passa':ball.owner&&ball.owner.t===0?'':'ESPAÇO carrinho · F troca de jogador';}}
K._dbg=()=>({state,score,clock:clock|0,ball:[+ball.x.toFixed(1),+ball.z.toFixed(1)],own:ball.owner?ball.owner.t+':'+ball.owner.i:null});K._demo=()=>{ctl=null;};
K.me=()=>state==='play'||state==='goal'?ctl&&ctl.g:null;
K.loop(update);menu();
})();
