/* ── Interactive Llama Background v3 ── */
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

addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY});
addEventListener('click',()=>{clicked=true; setTimeout(()=>clicked=false,600)});
addEventListener('mouseleave',()=>{mouse.x=-999;mouse.y=-999});

/* ── particles ── */
const particles=[];
class Particle{
  constructor(x,y){
    this.x=x;this.y=y;
    this.vx=(Math.random()-.5)*7;
    this.vy=(Math.random()-.5)*7-3;
    this.life=1;
    this.emoji=['⭐','✨','🌟','💛','🧡','❤️','🎉'][Math.floor(Math.random()*7)];
    this.size=14+Math.random()*12;
  }
  update(){this.x+=this.vx;this.y+=this.vy;this.vy+=.1;this.life-=.018}
  draw(){
    ctx.globalAlpha=Math.max(0,this.life*.8);
    ctx.font=`${this.size*this.life}px serif`;
    ctx.fillText(this.emoji,this.x,this.y);
    ctx.globalAlpha=1;
  }
}

/* ── llama coat palettes ── */
const COATS=[
  {body:'#f5e6d3',accent:'#d4a574',inner:'#f0b8a8'},
  {body:'#e8d0b8',accent:'#c09060',inner:'#e8a890'},
  {body:'#f0f0f0',accent:'#c0c0c0',inner:'#f0c0c0'},
  {body:'#d4b896',accent:'#a07850',inner:'#d09878'},
  {body:'#c8a882',accent:'#8b6840',inner:'#c89070'},
  {body:'#f5dcc8',accent:'#d4a080',inner:'#f0a8a0'},
];

/* ── accessories ── */
const HATS=['none','none','sombrero','flower','bow','bandana','earring'];

/* ── draw a single llama ── */
function drawLlama(x,y,size,flip,legPhase,lookAngle,happy,coat,hat){
  ctx.save();
  ctx.translate(x,y);
  const s=size/60;
  if(flip) ctx.scale(-s,s); else ctx.scale(s,s);

  // shadow
  ctx.fillStyle='rgba(0,0,0,.1)';
  ctx.beginPath();ctx.ellipse(5,62,26,5,0,0,Math.PI*2);ctx.fill();

  // legs
  const legA=Math.sin(legPhase)*12;
  const legB=Math.sin(legPhase+Math.PI)*12;
  ctx.strokeStyle=coat.accent;ctx.lineWidth=5.5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-10,30);ctx.lineTo(-10-legA,60);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-4,30);ctx.lineTo(-4-legB,60);ctx.stroke();
  ctx.beginPath();ctx.moveTo(14,30);ctx.lineTo(14+legB,60);ctx.stroke();
  ctx.beginPath();ctx.moveTo(20,30);ctx.lineTo(20+legA,60);ctx.stroke();

  // hooves
  ctx.fillStyle='#5a4030';
  for(const lx of [-10-legA,-4-legB,14+legB,20+legA]){
    ctx.beginPath();ctx.ellipse(lx,61,3.5,2.5,0,0,Math.PI*2);ctx.fill();
  }

  // body
  ctx.fillStyle=coat.body;
  ctx.beginPath();ctx.ellipse(5,22,24,15,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=coat.accent;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.ellipse(5,22,24,15,0,0,Math.PI*2);ctx.stroke();

  // neck
  ctx.fillStyle=coat.body;
  ctx.beginPath();
  ctx.moveTo(16,18);ctx.quadraticCurveTo(18,-10,22,-30);
  ctx.lineTo(34,-28);ctx.quadraticCurveTo(32,-5,28,20);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle=coat.accent;ctx.lineWidth=1.5;ctx.stroke();

  // head
  ctx.save();
  ctx.translate(28,-34);
  ctx.rotate(lookAngle*.15);
  ctx.fillStyle=coat.body;
  ctx.beginPath();ctx.ellipse(0,0,15,12,0,0,Math.PI*2);
  ctx.fill();ctx.strokeStyle=coat.accent;ctx.lineWidth=1.5;ctx.stroke();

  // snout
  ctx.fillStyle=coat.body;
  ctx.beginPath();ctx.ellipse(12,4,6,5,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=coat.accent;ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle=coat.inner;
  ctx.beginPath();ctx.ellipse(13,4,2,1.5,0,0,Math.PI*2);ctx.fill();

  // ears
  ctx.fillStyle=coat.body;
  ctx.beginPath();ctx.ellipse(-8,-13,4.5,9,-.3,0,Math.PI*2);ctx.fill();ctx.strokeStyle=coat.accent;ctx.lineWidth=1.5;ctx.stroke();
  ctx.beginPath();ctx.ellipse(5,-14,4.5,9,.3,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle=coat.inner;
  ctx.beginPath();ctx.ellipse(-8,-13,2.5,5.5,-.3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(5,-14,2.5,5.5,.3,0,Math.PI*2);ctx.fill();

  // eyes
  if(happy){
    ctx.strokeStyle='#2d1810';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(-5,-2,3,Math.PI+.3,-.3);ctx.stroke();
    ctx.beginPath();ctx.arc(6,-2,3,Math.PI+.3,-.3);ctx.stroke();
  }else{
    ctx.fillStyle='#2d1810';
    ctx.beginPath();ctx.arc(-5,-1,2.8,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(6,-1,2.8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(-3.8,-2.2,1.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(7.2,-2.2,1.2,0,Math.PI*2);ctx.fill();
  }

  // mouth
  if(happy){
    ctx.strokeStyle='#2d1810';ctx.lineWidth=1.8;
    ctx.beginPath();ctx.arc(1,5,6,0.15,Math.PI-.15);ctx.stroke();
    ctx.fillStyle='rgba(255,120,120,.4)';
    ctx.beginPath();ctx.ellipse(-10,4,4.5,3,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(12,4,4.5,3,0,0,Math.PI*2);ctx.fill();
  }else{
    ctx.fillStyle='#2d1810';
    ctx.beginPath();ctx.ellipse(1,5,3,1.8,0,0,Math.PI*2);ctx.fill();
  }

  // accessory
  if(hat==='sombrero'){
    ctx.fillStyle='#d4760a';
    ctx.beginPath();ctx.ellipse(0,-16,18,4,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e8960e';
    ctx.beginPath();ctx.ellipse(0,-20,9,7,0,Math.PI,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#c06000';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(0,-16,18,4,0,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#dc2626';ctx.fillRect(-9,-18,18,3);
  }else if(hat==='flower'){
    ctx.font='14px serif';ctx.fillText('🌸',-14,-18);
  }else if(hat==='bow'){
    ctx.fillStyle='#e8408a';
    ctx.beginPath();ctx.ellipse(6,-18,6,4,.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(-2,-16,5,3.5,-.3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#d02070';
    ctx.beginPath();ctx.arc(2,-17,2.5,0,Math.PI*2);ctx.fill();
  }else if(hat==='bandana'){
    ctx.fillStyle='#ea580c';
    ctx.beginPath();
    ctx.moveTo(-15,0);ctx.lineTo(15,0);ctx.lineTo(14,-4);
    ctx.quadraticCurveTo(0,-8,-14,-4);ctx.closePath();ctx.fill();
  }else if(hat==='earring'){
    ctx.fillStyle='#fbbf24';
    ctx.beginPath();ctx.arc(-12,-4,2.5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#f59e0b';ctx.lineWidth=1;ctx.stroke();
  }

  ctx.restore(); // head

  // tail
  ctx.fillStyle=coat.body;
  ctx.beginPath();ctx.arc(-24,12,8,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(-28,8,5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=coat.accent;ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(-24,12,8,0,Math.PI*2);ctx.stroke();

  ctx.restore();
}

/* ── create llamas ── */
const COUNT=16;
const llamas=[];
for(let i=0;i<COUNT;i++){
  const col=i%4, row=Math.floor(i/4)%4;
  const baseX=(col+.5)/4*innerWidth + (Math.random()-.5)*innerWidth*.18;
  const groundLevels=[.44,.57,.70,.84];
  const groundY=groundLevels[row]*innerHeight;
  llamas.push({
    x:baseX, y:groundY,
    vx:(Math.random()-.5)*1.2,
    vy:0,
    size:20+row*14+Math.random()*8,
    phase:Math.random()*Math.PI*2,
    flip:Math.random()>.5,
    happy:false,happyTimer:0,
    wobble:0,
    groundY, depth:row,
    targetX:Math.random()*innerWidth,
    wanderTimer:2+Math.random()*4,
    idleTimer:0, eating:false,
    coat:COATS[Math.floor(Math.random()*COATS.length)],
    hat:HATS[Math.floor(Math.random()*HATS.length)],
  });
}

/* ── scenery ── */
const scenery=[];
const sceneryTypes=['🌵','🌵','🪨','🌿','🌻','🌺','☘️'];
for(let i=0;i<20;i++){
  const row=Math.floor(i/5)%4;
  scenery.push({
    x:(i%5+.5)/5*innerWidth+(Math.random()-.5)*innerWidth*.18,
    y:[.42,.54,.67,.81][row]*innerHeight + Math.random()*15,
    type:sceneryTypes[Math.floor(Math.random()*sceneryTypes.length)],
    size:14+row*7+Math.random()*10,
    sway:Math.random()*Math.PI*2,
    depth:row,
  });
}

/* ── clouds ── */
const clouds=[];
for(let i=0;i<6;i++){
  clouds.push({x:Math.random()*innerWidth,y:20+Math.random()*90,
    speed:.1+Math.random()*.25,size:28+Math.random()*30,opacity:.06+Math.random()*.05});
}

/* ── stars ── */
const stars=[];
for(let i=0;i<35;i++){
  stars.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight*.35,
    size:1+Math.random()*2, twinkle:Math.random()*Math.PI*2, speed:.5+Math.random()*2});
}

/* ── Machu Picchu backdrop ── */
function drawMachuPicchu(t){
  const cx=W*.5, baseY=H*.34;
  const sw=Math.min(W*.7,600); // scale to screen
  const sh=sw*.55;
  ctx.save();
  ctx.translate(cx,baseY);

  // distant misty mountains behind
  ctx.globalAlpha=.045;
  ctx.fillStyle='#6b5b4f';
  // left mountain
  ctx.beginPath();
  ctx.moveTo(-sw*.55,sh*.1);
  ctx.lineTo(-sw*.35,-sh*.45);
  ctx.lineTo(-sw*.15,sh*.1);
  ctx.closePath();ctx.fill();
  // right mountain  
  ctx.beginPath();
  ctx.moveTo(sw*.15,sh*.1);
  ctx.lineTo(sw*.38,-sh*.55);
  ctx.lineTo(sw*.58,sh*.1);
  ctx.closePath();ctx.fill();

  // Huayna Picchu (iconic steep peak on the left)
  ctx.globalAlpha=.07;
  ctx.fillStyle='#5a4a3e';
  ctx.beginPath();
  ctx.moveTo(-sw*.22,sh*.08);
  ctx.lineTo(-sw*.18,-sh*.5);
  ctx.quadraticCurveTo(-sw*.14,-sh*.58,-sw*.10,-sh*.48);
  ctx.lineTo(-sw*.05,-sh*.1);
  ctx.lineTo(-sw*.22,sh*.08);
  ctx.closePath();ctx.fill();

  // main mountain behind ruins
  ctx.globalAlpha=.055;
  ctx.fillStyle='#6b5b4f';
  ctx.beginPath();
  ctx.moveTo(-sw*.3,sh*.1);
  ctx.lineTo(-sw*.08,-sh*.3);
  ctx.quadraticCurveTo(0,-sh*.35,sw*.08,-sh*.28);
  ctx.lineTo(sw*.3,sh*.1);
  ctx.closePath();ctx.fill();

  // terraces (the famous agricultural steps)
  ctx.globalAlpha=.06;
  for(let i=0;i<7;i++){
    const ty=sh*(-.05+i*.035);
    const tw=sw*(.12+i*.035);
    ctx.fillStyle=i%2===0?'#7a8a50':'#6b7a45';
    ctx.beginPath();
    ctx.moveTo(-tw,ty+sh*.025);
    ctx.lineTo(-tw,ty);
    ctx.quadraticCurveTo(0,ty-sh*.01,tw,ty);
    ctx.lineTo(tw,ty+sh*.025);
    ctx.closePath();ctx.fill();
  }

  // stone ruins - main temple area
  ctx.globalAlpha=.065;
  ctx.fillStyle='#a09080';
  // temple of the sun (central structure)
  ctx.fillRect(-sw*.06,sh*-.12,sw*.04,sh*.08);
  ctx.fillRect(-sw*.02,sh*-.15,sw*.05,sh*.11);
  ctx.fillRect(sw*.04,sh*-.10,sw*.04,sh*.06);
  // intihuatana (ritual stone)
  ctx.fillRect(-sw*.12,sh*-.08,sw*.03,sh*.04);
  // walls
  ctx.fillRect(sw*.08,sh*-.12,sw*.06,sh*.08);
  ctx.fillRect(sw*.15,sh*-.09,sw*.04,sh*.05);
  // small structures scattered
  ctx.fillRect(-sw*.18,sh*-.04,sw*.03,sh*.03);
  ctx.fillRect(sw*.20,sh*-.06,sw*.03,sh*.04);

  // stone blocks texture on ruins
  ctx.strokeStyle='#8a7a6a';ctx.lineWidth=.5;ctx.globalAlpha=.04;
  for(let bx=-sw*.18;bx<sw*.24;bx+=sw*.025){
    for(let by=sh*-.15;by<sh*.0;by+=sh*.02){
      if(Math.random()>.6){
        ctx.strokeRect(bx,by,sw*.02,sh*.015);
      }
    }
  }

  // windows/doors on temples
  ctx.globalAlpha=.05;
  ctx.fillStyle='#3a3028';
  // trapezoidal windows (Inca style)
  const windows=[[-sw*.04,sh*-.10],[0,sh*-.12],[sw*.01,sh*-.10],[sw*.05,sh*-.08],[sw*.10,sh*-.09]];
  for(const [wx,wy] of windows){
    ctx.beginPath();
    ctx.moveTo(wx-sw*.005,wy+sh*.025);
    ctx.lineTo(wx-sw*.003,wy);
    ctx.lineTo(wx+sw*.003,wy);
    ctx.lineTo(wx+sw*.005,wy+sh*.025);
    ctx.closePath();ctx.fill();
  }

  // mist/fog around the ruins
  ctx.globalAlpha=.03;
  ctx.fillStyle='#c0b8a8';
  for(let i=0;i<4;i++){
    const mx=(-sw*.3+i*sw*.2)+Math.sin(t*.0003+i*2)*sw*.04;
    const my=sh*(-.05+i*.02);
    ctx.beginPath();
    ctx.ellipse(mx,my,sw*.12,sh*.03,0,0,Math.PI*2);
    ctx.fill();
  }

  ctx.restore();
}

/* ── main loop ── */
let lastTime=0;
function loop(t){
  const dt=Math.min((t-lastTime)/1000,0.05);
  lastTime=t;
  ctx.clearRect(0,0,W,H);

  // sky
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'rgba(10,5,25,.06)');
  sky.addColorStop(.3,'rgba(120,40,180,.03)');
  sky.addColorStop(.6,'rgba(234,88,12,.05)');
  sky.addColorStop(1,'rgba(40,25,10,.10)');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

  // twinkling stars
  for(const st of stars){
    st.twinkle+=st.speed*dt;
    const a=.04+Math.sin(st.twinkle)*.03;
    ctx.fillStyle=`rgba(255,240,200,${a})`;
    ctx.beginPath();ctx.arc(st.x,st.y,st.size,0,Math.PI*2);ctx.fill();
  }

  // glow spots
  ctx.fillStyle='rgba(234,88,12,.035)';
  ctx.beginPath();ctx.arc(W*.15,H*.8,W*.22,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(168,85,247,.025)';
  ctx.beginPath();ctx.arc(W*.85,H*.25,W*.18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(250,200,50,.02)';
  ctx.beginPath();ctx.arc(W*.5,H*.6,W*.3,0,Math.PI*2);ctx.fill();

  // clouds
  for(const c of clouds){
    c.x+=c.speed*dt*30;
    if(c.x>W+80)c.x=-80;
    ctx.globalAlpha=c.opacity;
    ctx.font=`${c.size}px serif`;
    ctx.fillText('☁️',c.x,c.y);
  }
  ctx.globalAlpha=1;

  // ── Machu Picchu silhouette (far background) ──
  drawMachuPicchu(t);

  // rolling ground
  const groundColors=['rgba(40,35,20,.04)','rgba(40,35,20,.07)','rgba(40,35,20,.10)','rgba(40,35,20,.14)'];
  const groundYs=[.42,.55,.68,.82];
  for(let g=0;g<4;g++){
    ctx.fillStyle=groundColors[g];
    ctx.beginPath();
    ctx.moveTo(0,H);ctx.lineTo(0,groundYs[g]*H);
    for(let i=0;i<=W;i+=20){
      ctx.lineTo(i,groundYs[g]*H+Math.sin(i*.006+g*2.5+t*.00015)*8);
    }
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  }

  // collect & depth-sort all entities
  const drawables=[];
  for(const s of scenery) drawables.push({depth:s.depth+.1, draw:()=>{
    s.sway+=dt*.5;
    const a=[.08,.14,.22,.35][s.depth];
    ctx.globalAlpha=a;
    ctx.font=`${s.size}px serif`;
    ctx.fillText(s.type,s.x,s.y+Math.sin(s.sway)*2);
    ctx.globalAlpha=1;
  }});

  for(const ll of llamas) drawables.push({depth:ll.depth, draw:()=>{
    // wander
    ll.wanderTimer-=dt;
    if(ll.wanderTimer<=0){
      ll.targetX=Math.random()*W;
      ll.wanderTimer=3+Math.random()*5;
      if(Math.random()<.25){ll.idleTimer=2+Math.random()*3;ll.eating=true}
    }
    if(ll.idleTimer>0){
      ll.idleTimer-=dt; ll.vx*=.92;
      if(ll.idleTimer<=0) ll.eating=false;
    }else{
      const toTarget=ll.targetX-ll.x;
      if(Math.abs(toTarget)>25){ll.vx+=Math.sign(toTarget)*.035;ll.flip=toTarget<0}
    }

    const dx=mouse.x-ll.x, dy=mouse.y-ll.y;
    const dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<250 && mouse.x>0){
      ll.vx+=(dx/dist)*.07;ll.flip=dx<0;
      ll.wobble=Math.atan2(dy,Math.abs(dx))*.4;
      ll.eating=false;ll.idleTimer=0;
    }else{ ll.wobble*=.94 }

    if(clicked && dist<280){
      ll.happy=true;ll.happyTimer=3;ll.vy=-4;
      for(let p=0;p<5;p++) particles.push(new Particle(ll.x,ll.y-ll.size));
    }
    if(ll.happyTimer>0){ll.happyTimer-=dt}else{ll.happy=false}

    ll.vx=Math.max(-2,Math.min(2,ll.vx));
    ll.vx*=.97; ll.vy+=.12;
    ll.x+=ll.vx; ll.y+=ll.vy;

    const gndWave=Math.sin(ll.x*.006+ll.depth*2.5+t*.00015)*8;
    const gnd=ll.groundY+gndWave;
    if(ll.y>gnd-ll.size*.3){ll.y=gnd-ll.size*.3;ll.vy=0}
    if(ll.x<-120) ll.x=W+100;
    if(ll.x>W+120) ll.x=-100;

    const speed=Math.abs(ll.vx);
    ll.phase+=speed*dt*5;

    const baseAlpha=[.18,.32,.50,.70][ll.depth];
    ctx.globalAlpha=baseAlpha+(ll.happy?.15:0);
    const lookAngle=ll.wobble+Math.sin(t*.001+ll.phase)*.08;
    drawLlama(ll.x,ll.y,ll.size,ll.flip,speed>.12?ll.phase:0,lookAngle,ll.happy||ll.eating,ll.coat,ll.hat);
    ctx.globalAlpha=1;
  }});

  drawables.sort((a,b)=>a.depth-b.depth);
  for(const d of drawables) d.draw();

  // particles
  if(clicked && mouse.x>0){
    for(let i=0;i<6;i++) particles.push(new Particle(mouse.x,mouse.y));
  }
  for(let i=particles.length-1;i>=0;i--){
    particles[i].update();particles[i].draw();
    if(particles[i].life<=0) particles.splice(i,1);
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
