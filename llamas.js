/* ── Interactive Llama Background ── */
(function(){
const cv=document.getElementById('llamaBg');
const ctx=cv.getContext('2d');
let W,H,mouse={x:-999,y:-999},clicked=false;

function resize(){
  const dpr=devicePixelRatio||1;
  W=innerWidth; H=innerHeight;
  cv.width=W*dpr; cv.height=H*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resize();
addEventListener('resize',resize);

/* ── mouse tracking (through the card) ── */
addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY});
addEventListener('click',()=>{clicked=true; setTimeout(()=>clicked=false,600)});
addEventListener('mouseleave',()=>{mouse.x=-999;mouse.y=-999});

/* ── particle trails on click ── */
const particles=[];
class Particle{
  constructor(x,y){
    this.x=x;this.y=y;
    this.vx=(Math.random()-.5)*6;
    this.vy=(Math.random()-.5)*6-2;
    this.life=1;
    this.emoji=['⭐','✨','🌟','💛','🧡'][Math.floor(Math.random()*5)];
    this.size=12+Math.random()*10;
  }
  update(){this.x+=this.vx;this.y+=this.vy;this.vy+=.08;this.life-=.02}
  draw(){
    ctx.globalAlpha=Math.max(0,this.life*.6);
    ctx.font=`${this.size*this.life}px serif`;
    ctx.fillText(this.emoji,this.x,this.y);
    ctx.globalAlpha=1;
  }
}

/* ── draw llama body with canvas ── */
function drawLlama(x,y,size,flip,legPhase,lookAngle,happy){
  ctx.save();
  ctx.translate(x,y);
  const s=size/60;
  if(flip) ctx.scale(-s,s); else ctx.scale(s,s);

  // legs (animated walk)
  const legA=Math.sin(legPhase)*12;
  const legB=Math.sin(legPhase+Math.PI)*12;
  ctx.strokeStyle='#d4a574';ctx.lineWidth=5;ctx.lineCap='round';
  // back legs
  ctx.beginPath();ctx.moveTo(-10,30);ctx.lineTo(-10-legA,60);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-4,30);ctx.lineTo(-4-legB,60);ctx.stroke();
  // front legs
  ctx.beginPath();ctx.moveTo(14,30);ctx.lineTo(14+legB,60);ctx.stroke();
  ctx.beginPath();ctx.moveTo(20,30);ctx.lineTo(20+legA,60);ctx.stroke();

  // body
  ctx.fillStyle='#f5e6d3';
  ctx.beginPath();
  ctx.ellipse(5,22,22,14,0,0,Math.PI*2);
  ctx.fill();
  ctx.strokeStyle='#d4a574';ctx.lineWidth=1.5;ctx.stroke();

  // neck
  ctx.fillStyle='#f5e6d3';
  ctx.beginPath();
  ctx.moveTo(18,18);ctx.lineTo(22,-28);ctx.lineTo(32,-28);ctx.lineTo(28,20);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='#d4a574';ctx.lineWidth=1.5;ctx.stroke();

  // head (tilts toward mouse)
  ctx.save();
  ctx.translate(27,-32);
  ctx.rotate(lookAngle*.15);
  ctx.fillStyle='#f5e6d3';
  ctx.beginPath();
  ctx.ellipse(0,0,14,11,0,0,Math.PI*2);
  ctx.fill();ctx.strokeStyle='#d4a574';ctx.lineWidth=1.5;ctx.stroke();

  // ears
  ctx.fillStyle='#e8d5c0';
  ctx.beginPath();ctx.ellipse(-8,-12,4,8,-.3,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.ellipse(4,-13,4,8,.3,0,Math.PI*2);ctx.fill();ctx.stroke();

  // inner ears
  ctx.fillStyle='#f0b8a8';
  ctx.beginPath();ctx.ellipse(-8,-12,2,5,-.3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(4,-13,2,5,.3,0,Math.PI*2);ctx.fill();

  // eyes
  ctx.fillStyle='#2d1810';
  ctx.beginPath();ctx.arc(-5,-1,2.2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(6,-1,2.2,0,Math.PI*2);ctx.fill();

  // eye shine
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(-4,-2,1,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(7,-2,1,0,Math.PI*2);ctx.fill();

  // mouth / expression
  if(happy){
    ctx.strokeStyle='#2d1810';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(0,4,5,0.1,Math.PI-.1);ctx.stroke();
    // blush
    ctx.fillStyle='rgba(255,150,150,.35)';
    ctx.beginPath();ctx.ellipse(-9,3,4,2.5,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(9,3,4,2.5,0,0,Math.PI*2);ctx.fill();
  }else{
    ctx.fillStyle='#2d1810';
    ctx.beginPath();ctx.ellipse(0,5,3,1.5,0,0,Math.PI*2);ctx.fill();
  }

  ctx.restore();

  // fluffy tail
  ctx.fillStyle='#f5e6d3';
  ctx.beginPath();ctx.arc(-22,14,7,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#d4a574';ctx.lineWidth=1;ctx.stroke();

  ctx.restore();
}

/* ── llama entities ── */
const COUNT=12;
const llamas=[];
for(let i=0;i<COUNT;i++){
  // spread evenly across the full width with some randomness
  const col=i%4, row=Math.floor(i/4);
  const baseX=(col+.5)/4*innerWidth + (Math.random()-.5)*innerWidth*.15;
  // 3 ground levels so llamas roam different heights
  const groundY=[.55,.68,.82][row]*innerHeight;
  llamas.push({
    x:baseX,
    y:groundY,
    vx:(Math.random()-.5)*1.5,
    vy:0,
    size:30+row*10+Math.random()*12, // farther = smaller (depth)
    phase:Math.random()*Math.PI*2,
    flip:Math.random()>.5,
    happy:false,happyTimer:0,
    wobble:0,
    groundY:groundY,
    depth:row, // 0=top/far, 2=bottom/near
    // wander target
    targetX:Math.random()*innerWidth,
    wanderTimer:2+Math.random()*4,
    idleTimer:0,
    eating:false,
  });
}

/* ── scenery (cacti, mountains, flowers) spread across full width ── */
const scenery=[];
const sceneryTypes=['🌵','🌵','🏔️','🌺','🌻','🪨','🌿'];
for(let i=0;i<12;i++){
  const row=Math.floor(i/4);
  scenery.push({
    x:(i%4+.5)/4*innerWidth+(Math.random()-.5)*innerWidth*.2,
    y:[.52,.65,.80][row]*innerHeight + Math.random()*30,
    type:sceneryTypes[Math.floor(Math.random()*sceneryTypes.length)],
    size:16+row*6+Math.random()*12,
    sway:Math.random()*Math.PI*2
  });
}

/* ── little clouds at the top ── */
const clouds=[];
for(let i=0;i<5;i++){
  clouds.push({x:Math.random()*innerWidth,y:30+Math.random()*80,
    speed:.15+Math.random()*.3,size:30+Math.random()*25,opacity:.06+Math.random()*.04});
}

/* ── main loop ── */
let lastTime=0;
function loop(t){
  const dt=Math.min((t-lastTime)/1000,0.05);
  lastTime=t;
  ctx.clearRect(0,0,W,H);

  // sky gradient
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'rgba(15,10,30,.03)');
  sky.addColorStop(.4,'rgba(234,88,12,.04)');
  sky.addColorStop(1,'rgba(30,20,10,.08)');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

  // ambient glow spots
  ctx.fillStyle='rgba(234,88,12,.04)';
  ctx.beginPath();ctx.arc(W*.2,H*.75,W*.25,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(168,85,247,.03)';
  ctx.beginPath();ctx.arc(W*.8,H*.3,W*.2,0,Math.PI*2);ctx.fill();

  // clouds
  for(const c of clouds){
    c.x+=c.speed*dt*30;
    if(c.x>W+60)c.x=-60;
    ctx.globalAlpha=c.opacity;
    ctx.font=`${c.size}px serif`;
    ctx.fillText('☁️',c.x,c.y);
  }
  ctx.globalAlpha=1;

  // 3 rolling ground layers
  const groundColors=['rgba(34,30,20,.05)','rgba(34,30,20,.08)','rgba(34,30,20,.12)'];
  const groundYs=[.52,.65,.78];
  for(let g=0;g<3;g++){
    ctx.fillStyle=groundColors[g];
    ctx.beginPath();
    ctx.moveTo(0,H);ctx.lineTo(0,groundYs[g]*H);
    for(let i=0;i<=W;i+=30){
      ctx.lineTo(i,groundYs[g]*H+Math.sin(i*.008+g*2+t*.0002)*6);
    }
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  }

  // scenery
  for(const s of scenery){
    s.sway+=dt*.4;
    ctx.globalAlpha=.12;
    ctx.font=`${s.size}px serif`;
    ctx.fillText(s.type,s.x,s.y+Math.sin(s.sway)*2);
  }
  ctx.globalAlpha=1;

  // spawn particles on click
  if(clicked && mouse.x>0){
    for(let i=0;i<8;i++) particles.push(new Particle(mouse.x,mouse.y));
  }

  // update & draw particles
  for(let i=particles.length-1;i>=0;i--){
    particles[i].update();
    particles[i].draw();
    if(particles[i].life<=0) particles.splice(i,1);
  }

  // sort llamas by depth so far ones draw first
  llamas.sort((a,b)=>a.depth-b.depth);

  // update & draw llamas
  for(const ll of llamas){
    // wander AI
    ll.wanderTimer-=dt;
    if(ll.wanderTimer<=0){
      ll.targetX=Math.random()*W;
      ll.wanderTimer=3+Math.random()*5;
      // sometimes idle/eat
      if(Math.random()<.3){ll.idleTimer=1.5+Math.random()*2;ll.eating=true}
    }

    if(ll.idleTimer>0){
      ll.idleTimer-=dt;
      ll.vx*=.9; // slow down to idle
      if(ll.idleTimer<=0) ll.eating=false;
    }else{
      // walk toward target
      const toTarget=ll.targetX-ll.x;
      if(Math.abs(toTarget)>20){
        ll.vx+=Math.sign(toTarget)*.04;
        ll.flip=toTarget<0;
      }
    }

    // mouse attraction (overrides wander when close)
    const dx=mouse.x-ll.x, dy=mouse.y-ll.y;
    const dist=Math.sqrt(dx*dx+dy*dy);

    if(dist<220 && mouse.x>0){
      ll.vx+=(dx/dist)*.08;
      ll.flip=dx<0;
      ll.wobble=Math.atan2(dy,Math.abs(dx))*.5;
      ll.eating=false;ll.idleTimer=0;
    }else{
      ll.wobble*=.93;
    }

    // clicked nearby → happy jump!
    if(clicked && dist<250){
      ll.happy=true;ll.happyTimer=2.5;
      ll.vy=-3.5; // little jump
    }
    if(ll.happyTimer>0){ll.happyTimer-=dt}else{ll.happy=false}

    // speed cap
    ll.vx=Math.max(-2.5,Math.min(2.5,ll.vx));

    // physics
    ll.vx*=.97;
    ll.vy+=.12; // gravity
    ll.x+=ll.vx;
    ll.y+=ll.vy;

    // ground constraint (per-llama ground level)
    const gndWave=Math.sin(ll.x*.008+ll.depth*2+t*.0002)*6;
    const gnd=ll.groundY+gndWave;
    if(ll.y>gnd-ll.size*.3){
      ll.y=gnd-ll.size*.3;
      ll.vy=0;
    }

    // wrap horizontally with margin
    if(ll.x<-100) ll.x=W+80;
    if(ll.x>W+100) ll.x=-80;

    // walk animation
    const speed=Math.abs(ll.vx);
    ll.phase+=speed*dt*5;

    // depth-based opacity (far = more transparent)
    const baseAlpha=[.14,.20,.28][ll.depth];
    ctx.globalAlpha=baseAlpha+(ll.happy?.12:0);
    const lookAngle=ll.wobble+Math.sin(t*.001+ll.phase)*.08;
    drawLlama(ll.x,ll.y,ll.size,ll.flip,speed>.15?ll.phase:0,lookAngle,ll.happy||ll.eating);
    ctx.globalAlpha=1;
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
