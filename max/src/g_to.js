// TITLE: Torre do Porto
// Empilhar contentores: a grua passa de um lado para o outro, larga no momento certo; o que sobra cai.
(()=>{'use strict';
const S=K.store('to',{best:0,perfect:0});
document.documentElement.style.setProperty('--kc','#ffb23f');
K.init({sky:0x8fc4ee,fog:[60,220],fov:50,shadow:30,hemi:.7,sunI:1,sunPos:[20,40,15]});
const scene=K.scene,cam=K.camera,H=1.1;
K.plane(400,400,0x3d6e8f,0,-.02,0);K.box(30,1,30,0x8a8f96,0,-.5,0);
for(let i=0;i<6;i++){const g=new THREE.Group();K.box(1,24,1,0xe8452c,0,12,0,g);K.box(10,1,1,0xe8452c,4,24,0,g);g.position.set(-40+i*16,0,-48-(i%2)*10);scene.add(g);}
K.box(160,1,46,0x8a8f96,0,-.5,-52);for(let c=0;c<12;c++){const n=1+((c*7)%3);for(let k=0;k<n;k++)K.box(6,2.6,2.4,[0x2a8bff,0x35d07f,0xe8452c,0xffd23f][(c+k)%4],-60+c*11,1.3+k*2.6,-34-(c%2)*4);}
const COLS=[0x2a8bff,0xe8452c,0x35d07f,0xffd23f,0xb46bff,0xff8a3d,0x3de0c8];
let stack=[],cur=null,dir=1,axis='x',speed=6,state='menu',score=0,combo=0,falling=[],camY=4;
const box=(w,d,c,x,y,z)=>{const m=K.box(w,H,d,c,x,y,z);const tx=K.tex(64,64,(g,W,Hh)=>{g.fillStyle='#fff';g.fillRect(0,0,W,Hh);g.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<W;i+=8)g.fillRect(i,0,3,Hh);});m.material=new THREE.MeshLambertMaterial({color:c,map:tx});return m;};
function newLayer(){const top=stack[stack.length-1];axis=axis==='x'?'z':'x';const y=top.y+H;const c=COLS[stack.length%COLS.length];const o={w:top.w,d:top.d,x:top.x,z:top.z,y};o[axis]=-9;o.m=box(o.w,o.d,c,o.x,y,o.z);dir=1;cur=o;speed=Math.min(14,6+stack.length*.18);}
function start(){[...stack,...falling].forEach(o=>scene.remove(o.m));if(cur)scene.remove(cur.m);stack=[];falling=[];score=0;combo=0;const b={w:5,d:5,x:0,z:0,y:H/2};b.m=box(5,5,0x6b7280,0,b.y,0);stack.push(b);axis='z';newLayer();state='play';K.screen(null);K.play(true);hud();}
function hud(){K.hud(`<div class="k-tc"><div class="k-pill" style="text-align:center"><small>${K.name()} · altura</small><b>${score}</b></div></div><div class="k-tr"><div class="k-pill"><small>Recorde</small><b>${S.data.best}</b></div></div><div class="k-bc"><div class="k-hint">${K.touch?'Toca para largar o contentor':'ESPAÇO ou clique para largar'}</div></div>`);}
function drop(){if(state!=='play')return;const top=stack[stack.length-1],sz=axis==='x'?'w':'d';const delta=cur[axis]-top[axis],ov=cur[sz]-Math.abs(delta);
 if(ov<=0){falling.push({m:cur.m,v:0,r:K.rand(-1,1)});cur=null;over();return;}
 if(Math.abs(delta)<.12){cur[axis]=top[axis];combo++;K.tone(500+combo*80,.12,'sine',.3);if(combo>=3){cur.w=Math.min(5,cur.w+.15);cur.d=Math.min(5,cur.d+.15);}K.flash('Perfeito!',combo>1?'x'+combo:'',500,'#3dffa2');S.data.perfect++;}
 else{combo=0;const cutW=cur[sz]-ov,sign=Math.sign(delta);const f={w:cur.w,d:cur.d,x:cur.x,z:cur.z,y:cur.y};f[sz]=cutW;f[axis]=cur[axis]+sign*(ov/2);cur[sz]=ov;cur[axis]=top[axis]+delta/2;f[axis]=cur[axis]+sign*(ov/2+cutW/2);f.m=box(f.w,f.d,cur.m.material.color.getHex(),f.x,f.y,f.z);falling.push({m:f.m,v:0,r:K.rand(-1,1)*2});K.tone(200,.1,'square',.2);}
 scene.remove(cur.m);cur.m=box(cur.w,cur.d,cur.m.material.color.getHex(),cur.x,cur.y,cur.z);stack.push(cur);score++;hud();K.sfx.click&&K.sfx.click();newLayer();}
function over(){state='over';K.sfx.bad();if(score>S.data.best){S.data.best=score;K.toast('Novo recorde: '+score);}S.save();if(score>=25)K.unlock('to-25','Torre do Porto · 25 contentores');if(score>=50)K.unlock('to-50','Torre do Porto · 50 contentores');K.play(false);
 setTimeout(()=>K.screen(`<div class="k-title">Caiu!</div><div class="k-lead">${K.name()}: ${score} contentores · recorde ${S.data.best}</div><button class="k-go" data-a="r">Outra vez</button><button class="k-alt" data-a="m">Menu</button>`,{r:start,m:menu}),900);}
function menu(){state='menu';K.play(false);K.screen(`<div class="k-title">Torre do <em>Porto</em></div><div class="k-lead">Larga cada contentor em cima do anterior. O que fica de fora cai ao mar. 3 perfeitos seguidos fazem crescer a base.</div><button class="k-go" data-a="s">Começar</button><div class="k-lead"><small>Recorde: ${S.data.best}</small></div>${K.keysHelp([['ESPAÇO','largar'],['CLIQUE','largar'],['P','pausa']])}`,{s:start});}
K.onQuit=menu;
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();drop();}});
K.renderer.domElement.addEventListener('pointerdown',()=>{K.audio();drop();});
function update(dt){
 if(cur&&state==='play'){cur[axis]+=dir*speed*dt;if(Math.abs(cur[axis])>9){cur[axis]=9*Math.sign(cur[axis]);dir*=-1;}cur.m.position.set(cur.x,cur.y,cur.z);}
 for(const f of falling){f.v+=20*dt;f.m.position.y-=f.v*dt;f.m.rotation.z+=f.r*dt;f.m.rotation.x+=f.r*.5*dt;}
 falling=falling.filter(f=>{if(f.m.position.y<-30){scene.remove(f.m);return false;}return true;});
 const ty=(stack.length?stack[stack.length-1].y:0)+4;camY+=(ty-camY)*Math.min(1,dt*3);
 const a=state==='menu'?K.time*.3:.8;cam.position.set(Math.cos(a)*17,camY+6,Math.sin(a)*17);cam.lookAt(0,camY-2.5,0);}
K._dbg=()=>({state,score,n:stack.length,w:cur?+cur.w.toFixed(2):0,off:cur&&stack.length?+(cur[axis]-stack[stack.length-1][axis]).toFixed(2):0});
K.loop(update);menu();
})();
