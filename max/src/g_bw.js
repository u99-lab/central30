// TITLE: Bowling da Avenida
// Bowling 3D: escolhe a posição, aponta, dá efeito e derruba os 10 pinos. 10 jogadas contra um amigo do CPU.
(()=>{'use strict';
const S=K.store('bw',{best:0,strikes:0,wins:0});
document.documentElement.style.setProperty('--kc','#ff3d8b');
K.init({sky:0x14102a,fog:[40,120],fov:50,shadow:14,hemi:.55,sunI:.6,sunPos:[4,20,6],skyLight:0xc8b8ff,groundLight:0x2a2040});
const scene=K.scene,cam=K.camera,LW=1.06,LL=18.3,PR=.12,BR=.11;
// pista de madeira, caleiras e sala
const woodT=K.tex(256,1024,(c,w,h)=>{for(let x=0;x<w;x+=16){c.fillStyle=`hsl(32,55%,${58+Math.random()*10}%)`;c.fillRect(x,0,16,h);}c.fillStyle='rgba(0,0,0,.08)';for(let y=0;y<h;y+=90)c.fillRect(0,y,w,2);c.fillStyle='#2a6bd7';for(let i=0;i<7;i++){const x=w*(.15+i*.117);c.beginPath();c.moveTo(x,h*.72);c.lineTo(x-6,h*.76);c.lineTo(x+6,h*.76);c.fill();}});
const lane=new THREE.Mesh(new THREE.PlaneGeometry(LW,LL+2),new THREE.MeshPhongMaterial({map:woodT,shininess:80}));lane.rotation.x=-Math.PI/2;lane.position.z=-LL/2+1;lane.receiveShadow=true;scene.add(lane);
for(const s of [-1,1]){K.box(.24,.05,LL+2,0x2a2f3a,s*(LW/2+.12),-.02,-LL/2+1);K.box(.3,.4,LL+2,0x6a4d8a,s*(LW/2+.39),.15,-LL/2+1);}
K.plane(40,60,0x241c3a,0,-.05,-8);
for(let k=-3;k<=3;k++)if(k){const x=k*1.9;const l=new THREE.Mesh(new THREE.PlaneGeometry(LW,LL+2),new THREE.MeshPhongMaterial({map:woodT,shininess:60}));l.rotation.x=-Math.PI/2;l.position.set(x,0,-LL/2+1);scene.add(l);}
K.box(16,3,.3,0x0b0820,0,1.5,-LL-.6);const neon=K.tex(512,64,(c,w,h)=>{c.fillStyle='#0b0820';c.fillRect(0,0,w,h);c.font='900 44px system-ui';c.textAlign='center';c.textBaseline='middle';c.shadowColor='#ff3d8b';c.shadowBlur=18;c.fillStyle='#ff9ac7';c.fillText('BOWLING DA AVENIDA',w/2,34);});
const sign=new THREE.Mesh(new THREE.PlaneGeometry(10,1.25),new THREE.MeshBasicMaterial({map:neon}));sign.position.set(0,3.6,-LL-.4);scene.add(sign);
for(let i=0;i<10;i++){const l=new THREE.PointLight(i%2?0xff3d8b:0x4fd0ff,.5,9);l.position.set(i%2?-3:3,2.5,-i*2);scene.add(l);}
// pinos e bola
const pinG=new THREE.LatheGeometry([[0,0],[.05,0],[.06,.05],[.075,.14],[.06,.24],[.035,.3],[.04,.34],[.034,.38],[0,.39]].map(p=>new THREE.Vector2(p[0]*1.55,p[1]*1.55)),14);
const pinM=new THREE.MeshPhongMaterial({color:0xfafafa,shininess:90}),stripe=new THREE.MeshBasicMaterial({color:0xe8352c});
const PIN0=[];for(let r=0;r<4;r++)for(let i=0;i<=r;i++)PIN0.push([(i-r/2)*.305,-LL+.9+r*.264*-1+0]);
const pins=PIN0.map(([x,z])=>{const g=new THREE.Group(),m=new THREE.Mesh(pinG,pinM);m.castShadow=true;g.add(m);const s=new THREE.Mesh(new THREE.CylinderGeometry(.062,.062,.03,14),stripe);s.position.y=.43;g.add(s);scene.add(g);return {g,x0:x,z0:z,x,z,vx:0,vz:0,tilt:0,dir:0,down:false,out:false};});
const ballM=new THREE.MeshPhongMaterial({color:0x2a6bd7,shininess:120});const ball=new THREE.Mesh(new THREE.SphereGeometry(BR,20,14),ballM);ball.castShadow=true;scene.add(ball);
// estado
let state='menu',players=[],turn=0,frameN=0,roll=0,phase='aim',aim={x:0,ang:0,spin:0,pow:0},pdir=1,bl={x:0,z:0,vx:0,vz:0,spin:0,live:false,gutter:false},rollT=0,pinsBefore=0,cpuT=0,swept=false;
function resetPins(all){for(const p of pins){if(all||!p.down){p.x=p.x0;p.z=p.z0;p.vx=p.vz=0;p.tilt=0;p.down=false;p.out=false;}else{p.out=true;}placePins();}}
function placePins(){for(const p of pins){p.g.visible=!p.out;p.g.position.set(p.x,0,p.z);p.g.rotation.set(0,0,0);if(p.tilt){p.g.rotation.z=Math.cos(p.dir)*p.tilt;p.g.rotation.x=Math.sin(p.dir)*p.tilt;}}}
const standing=()=>pins.filter(p=>!p.down&&!p.out).length;
function startGame(vs){players=[{name:'Tu',f:[],cpu:false}];if(vs)players.push({name:'Rui',f:[],cpu:true});turn=0;frameN=0;roll=0;resetPins(true);newRoll();K.screen(null);K.play(true);state='play';hud();}
function newRoll(){phase='aim';aim.x=0;aim.ang=0;aim.spin=0;aim.pow=0;bl={x:0,z:-.2,vx:0,vz:0,spin:0,live:false,gutter:false};ball.position.set(0,BR,-.2);pinsBefore=standing();cpuT=1.4;swept=false;K.pad([['Space','Lançar'],['KeyQ','Efeito ◀'],['KeyE','Efeito ▶']]);}
function score(f){let t=0,r=[];for(const fr of f)r.push(...fr);let i=0;const out=[];for(let k=0;k<f.length&&k<10;k++){const fr=f[k];if(fr[0]===10&&k<9){if(r[i+2]===undefined)break;t+=10+r[i+1]+r[i+2];i+=1;}else if(k<9&&fr[0]+(fr[1]||0)===10){if(fr.length<2||r[i+2]===undefined)break;t+=10+r[i+2];i+=2;}else{if(k<9&&fr.length<2)break;if(k===9&&!((fr.length===3)||(fr.length===2&&fr[0]+fr[1]<10)))break;t+=fr.reduce((a,b)=>a+b,0);i+=fr.length;}out.push(t);}return out;}
function hud(){const rows=players.map(pl=>{const sc=score(pl.f);let s='';for(let k=0;k<10;k++){const fr=pl.f[k]||[];const m=fr.map((v,j)=>v===10&&(j===0||k===9)?'X':j>0&&fr[j-1]+v===10&&fr[j-1]!==10?'/':v===0?'-':v).join(' ');s+=`<td style="border:1px solid #ffffff33;padding:2px 4px;min-width:30px;text-align:center;font-size:11px">${m||'&nbsp;'}<br><b>${sc[k]!==undefined?sc[k]:''}</b></td>`;}return `<tr><td style="padding:2px 6px;font-weight:800">${pl.name}</td>${s}</tr>`;}).join('');
 K.hud(`<div class="k-tc"><div class="k-pill" style="padding:6px"><table style="border-collapse:collapse">${rows}</table></div></div><div class="k-bc" style="flex-direction:column"><div class="k-meter" id="hm" style="width:240px;height:16px"><u style="left:62%;width:20%"></u><i id="pw" style="width:0"></i></div><div class="k-hint" id="hh"></div></div>`);}
function endRoll(){const knocked=pinsBefore-standing(),pl=players[turn],f=pl.f[frameN]||(pl.f[frameN]=[]);f.push(knocked);
 const strike=roll===0&&knocked===10,spare=roll===1&&f[0]+knocked===10&&f[0]!==10;
 if(strike||(frameN===9&&roll>0&&knocked===10&&f[roll-1]===10)){K.flash('STRIKE!','',1300,'#ff3d8b');K.sfx.win();K.confetti(new THREE.Vector3(0,.8,-LL+1));if(!pl.cpu){S.data.strikes++;S.save();}}else if(spare||(frameN===9&&roll===2&&f[1]!==10&&f[1]+knocked===10)){K.flash('SPARE!','',1100,'#4fd0ff');K.sfx.good();}else if(knocked===0)K.flash(bl.gutter?'CALEIRA':'NENHUM','',900,'#ff6b6b');else K.toast(knocked+' pino'+(knocked>1?'s':''));
 let next=false,reset=false;
 if(frameN<9){if(strike||roll===1)next=true;else roll=1;}
 else{const a=f[0],b=f[1];if(roll===0){roll=1;if(a===10)reset=true;}else if(roll===1){if(a===10||a+b===10){roll=2;if(b===10||a+b===10&&a!==10||a===10&&b===10)reset=true;}else next=true;}else next=true;}
 hud();
 setTimeout(()=>{if(state!=='play')return;if(next){roll=0;turn++;if(turn>=players.length){turn=0;frameN++;}if(frameN>=10)return endGame();resetPins(true);}else resetPins(reset);newRoll();if(players[turn].cpu)K.toast('Vez do Rui');},1700);}
function endGame(){state='end';K.play(false);const sc=players.map(p=>{const s=score(p.f);return s[s.length-1]||0;}),me=sc[0];if(me>S.data.best)S.data.best=me;let win=players.length>1&&sc[0]>sc[1];if(win)S.data.wins++;S.save();if(me>=200)K.unlock('bw-200','Bowling · 200 pontos');if(players[0].f.every(f=>f[0]===10))K.unlock('bw-300','Bowling · Jogo perfeito');K.sfx.win();
 K.screen(`<div class="k-title"><em>${me}</em> pontos</div><div class="k-lead">${players.length>1?(win?'Ganhaste ao Rui ('+sc[1]+')!':'O Rui fez '+sc[1]+'.'):'Recorde: '+S.data.best}</div><button class="k-go" data-a="r">Outra vez</button><button class="k-alt" data-a="m">Menu</button>`,{r:()=>startGame(players.length>1),m:menu});}
function menu(){state='menu';K.play(false);resetPins(true);K.screen(`<div class="k-title">Bowling da <em>Avenida</em></div><div class="k-lead">Mexe a bola para o lado, aponta, dá efeito e acerta na força.</div><button class="k-go" data-a="vs">🎳 Contra o Rui</button><button class="k-alt" data-a="solo">Treino sozinho</button><table class="k-tab"><tr><td>Melhor jogo</td><td>${S.data.best}</td></tr><tr><td>Strikes</td><td>${S.data.strikes}</td></tr><tr><td>Vitórias</td><td>${S.data.wins}</td></tr></table>${K.keysHelp([['A D','posição / pontaria'],['Q E','efeito'],['ESPAÇO','manter = força, largar = lançar'],['P','pausa']])}`,{vs:()=>startGame(true),solo:()=>startGame(false)});}
K.onQuit=menu;
let charging=false,ptrOn=false;const cv=K.renderer.domElement;
cv.addEventListener('pointerdown',e=>{K.audio();if(state==='play'&&phase==='aim'&&!players[turn].cpu){ptrOn=true;charging=true;aim.pow=0;pdir=1;}});
cv.addEventListener('pointermove',e=>{if(state==='play'&&phase==='aim'&&!players[turn].cpu&&!charging){aim.x=K.clamp((e.clientX/innerWidth-.5)*1.4,-.42,.42);aim.ang=K.clamp((.5-e.clientY/innerHeight)*-.0,-.12,.12);}});
addEventListener('pointerup',()=>{if(charging&&ptrOn){ptrOn=false;release();}});
function release(){charging=false;phase='roll';const sp=4+aim.pow*7,err=Math.abs(aim.pow-.72),dev=(Math.random()-.5)*(.02+err*.12);aim.ang+=dev;bl.x+=(Math.random()-.5)*.04;bl.vx=Math.sin(aim.ang)*sp;bl.vz=-Math.cos(aim.ang)*sp;bl.spin=aim.spin;bl.live=true;rollT=0;K.sfx.whoosh();}
function update(dt){const pl=players[turn];
 if(state==='menu'||state==='end'){const t=K.time*.2;cam.position.set(Math.sin(t)*1.8,1.7,2.6);cam.lookAt(0,.2,-LL);return;}
 if(phase==='aim'){if(pl.cpu){cpuT-=dt;aim.x=K.damp(aim.x,.08,3,dt);aim.spin=-.35;if(cpuT<.6)aim.pow=Math.min(.76,aim.pow+dt*1.8);if(cpuT<=0){aim.ang=-.004+K.rand(-.012,.012);aim.pow=.74+K.rand(-.06,.06);release();}}
  else{if(K.down('KeyA','ArrowLeft'))aim.x-=dt*.6;if(K.down('KeyD','ArrowRight'))aim.x+=dt*.6;aim.x=K.clamp(aim.x,-.42,.42);if(K.down('KeyW','ArrowUp'))aim.ang+=dt*.15;if(K.down('KeyS','ArrowDown'))aim.ang-=dt*.15;aim.ang=K.clamp(aim.ang,-.1,.1);
   if(K.hit('KeyQ'))aim.spin=Math.max(-1,aim.spin-.5);if(K.hit('KeyE'))aim.spin=Math.min(1,aim.spin+.5);if(K.hit('Space')){charging=true;aim.pow=0;pdir=1;}
   if(charging){aim.pow+=pdir*dt*1.1;if(aim.pow>=1){aim.pow=1;pdir=-1;}if(aim.pow<=0){aim.pow=0;pdir=1;}if(!K.down('Space')&&!ptrOn)release();}}
  bl.x=aim.x;ball.position.set(bl.x,BR,-.2);const pw=K.$('pw');if(pw)pw.style.width=aim.pow*100+'%';const hh=K.$('hh');if(hh)hh.textContent=pl.cpu?'Vez do Rui…':'Efeito: '+(aim.spin<0?'◀ '.repeat(-aim.spin*2):aim.spin>0?'▶ '.repeat(aim.spin*2):'nenhum')+' · mantém ESPAÇO (ou o dedo) e larga no verde';}
 if(phase==='roll'){rollT+=dt;const st=4;for(let s=0;s<st;s++){const h=dt/st;
   if(bl.live){if(!bl.gutter){bl.vx+=bl.spin*h*.55*(bl.z<-LL*.45?2.2:.6);bl.x+=bl.vx*h;bl.z+=bl.vz*h;if(Math.abs(bl.x)>LW/2-.02){bl.gutter=true;bl.x=Math.sign(bl.x)*(LW/2+.12);bl.vx=0;K.tone(160,.3,'sine',.12,90);}}else{bl.z+=bl.vz*h;}
    if(!bl.gutter)for(const p of pins){if(p.out)continue;const dx=p.x-bl.x,dz=p.z-bl.z,d=Math.hypot(dx,dz);if(d<BR+PR&&d>.001){const nx=dx/d,nz=dz/d,vn=bl.vx*nx+bl.vz*nz;if(vn>0){const k=1.2+Math.random()*.7;p.vx+=nx*vn*k;p.vz+=nz*vn*k;bl.vx-=nx*vn*.35;bl.vz-=nz*vn*.35;if(!p.down){p.down=true;p.dir=Math.atan2(nx,-nz);K.tone(700+Math.random()*400,.08,'triangle',.18,300);}}}}
    if(bl.z<-LL-.6){bl.live=false;}}
   for(const p of pins){if(p.out||(!p.vx&&!p.vz))continue;p.x+=p.vx*h;p.z+=p.vz*h;const f=Math.pow(.25,h);p.vx*=f;p.vz*=f;if(Math.hypot(p.vx,p.vz)<.05){p.vx=p.vz=0;}if(Math.abs(p.x)>LW/2+.15||p.z<-LL-.5){p.down=true;}
    for(const q of pins){if(q===p||q.out)continue;const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(d<PR*2&&d>.001){const nx=dx/d,nz=dz/d,vn=(p.vx-q.vx)*nx+(p.vz-q.vz)*nz;if(vn>0){const k=.55+Math.random()*.55;q.vx+=nx*vn*k;q.vz+=nz*vn*k;p.vx-=nx*vn*.5;p.vz-=nz*vn*.5;if(!q.down){q.down=true;q.dir=Math.atan2(nx,-nz);K.tone(800+Math.random()*300,.07,'triangle',.14,300);}}const o=(PR*2-d)/2;p.x-=nx*o;p.z-=nz*o;q.x+=nx*o;q.z+=nz*o;}}}}
  for(const p of pins)if(p.down)p.tilt=K.damp(p.tilt,1.45,9,dt);placePins();
  ball.position.set(bl.x,bl.gutter?BR-.06:BR,bl.z);ball.rotation.x-=bl.vz*dt/BR;ball.visible=bl.z>-LL-.5;
  const moving=pins.some(p=>p.vx||p.vz);if(!bl.live&&!moving&&rollT>1.2&&!swept){swept=true;phase='wait';setTimeout(endRoll,500);}if(rollT>9&&!swept){swept=true;phase='wait';endRoll();}}
 const tz=phase==='roll'&&bl.z<-6?Math.max(bl.z+3.2,-LL+3.5):2.6;cam.position.x=K.damp(cam.position.x,phase==='aim'?aim.x*.5:bl.x*.4,4,dt);cam.position.y=K.damp(cam.position.y,phase==='roll'&&bl.z<-6?1.1:1.45,3,dt);cam.position.z=K.damp(cam.position.z,tz,3,dt);cam.lookAt(cam.position.x*.6,.15,cam.position.z-6);}
K._dbg=()=>({bl:[+bl.x.toFixed(2),+bl.z.toFixed(2),+bl.vx.toFixed(2),+bl.vz.toFixed(2),bl.gutter],aim:[+aim.x.toFixed(2),+aim.ang.toFixed(3),+aim.pow.toFixed(2)],state,phase,turn,frameN,roll,standing:standing(),f:players.map(p=>JSON.stringify(p.f))});
K.loop(update);menu();
})();
