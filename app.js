let words=[], round=[], idx=0, correct=0, answers=[];
const $=s=>document.getElementById(s);
const STORAGE_KEY='spanish_quiz_scores';

function getHistory(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch{return[]}}
function saveScore(grade){const h=getHistory();h.push({grade,date:new Date().toISOString()});localStorage.setItem(STORAGE_KEY,JSON.stringify(h));}

function norm(s){return(s||'').toLowerCase().trim().replace(/[^a-z0-9 -]/g,'').replace(/\s+/g,' ')}
function stem(w){return w.replace(/(ing|ed|es|s|ly|er|est|ness|ment|tion|ous|ful|less|able|ible)$/,'')}
function fuzzy(a,b){if(a===b)return true;const sa=stem(a),sb=stem(b);if(sa===sb&&sa.length>=2)return true;if(a.length>=3&&b.length>=3&&(a.startsWith(b)||b.startsWith(a)))return true;return false}
function shuffle(a){let b=[...a];for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}

function showWord(){
  $('progress').textContent=`${idx+1} / 10`;
  $('score').textContent=`Score: ${correct}`;
  $('spanishWord').textContent=round[idx].es;
  $('answerInput').value='';
  $('feedback').innerHTML='&nbsp;';
  $('answerInput').focus();
}

function submit(){
  const cur=round[idx], user=$('answerInput').value, un=norm(user);
  const valid=cur.en.map(norm);
  const ok=valid.some(v=>fuzzy(un,v));
  if(ok){correct++;$('feedback').textContent='✅ Correct!'}
  else{$('feedback').textContent=`❌  Accepted: ${cur.en.join(', ')}`}
  answers.push({es:cur.es,given:user,accepted:cur.en,ok});
  idx++;
  if(idx>=10) return setTimeout(finish,600);
  setTimeout(showWord,600);
}

function finish(){
  $('game').classList.add('hidden');
  $('result').classList.remove('hidden');
  const grade=Math.round(correct/10*100);
  saveScore(grade);
  const gc=$('gradeCircle');
  gc.textContent=grade;
  gc.className='grade-circle '+(grade>=80?'great':grade>=50?'ok':'bad');
  $('summary').textContent=`${correct}/10 correct answers`;
  $('review').innerHTML=answers.map(a=>
    `<div class="review-row ${a.ok?'was-correct':''}">
      <span class="es">${a.es}</span>
      <span class="yours">${a.given||'—'}</span>
      <span class="correct-ans">${a.accepted[0]}</span>
    </div>`).join('');
  renderChart();
}

function start(){
  idx=0;correct=0;answers=[];
  round=shuffle(words).slice(0,10);
  $('start').classList.add('hidden');
  $('result').classList.add('hidden');
  $('game').classList.remove('hidden');
  showWord();
}

/* ── Chart ── */
function renderChart(){
  const hist=getHistory();
  const scores=hist.map(h=>h.grade);

  // Stats
  $('statGames').textContent=scores.length;
  $('statAvg').textContent=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):'—';
  $('statBest').textContent=scores.length?Math.max(...scores):'—';
  let streak=0,maxStreak=0;
  for(const s of scores){if(s>=70){streak++;maxStreak=Math.max(maxStreak,streak)}else streak=0}
  $('statStreak').textContent=maxStreak;

  const canvas=$('chart');
  const noData=$('noData');
  if(!scores.length){noData.classList.remove('hidden');return;}
  noData.classList.add('hidden');

  const dpr=window.devicePixelRatio||1;
  const w=canvas.clientWidth, h=canvas.clientHeight;
  canvas.width=w*dpr; canvas.height=h*dpr;
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,h);

  const pad={t:20,r:16,b:30,l:36};
  const cw=w-pad.l-pad.r, ch=h-pad.t-pad.b;

  // Grid lines
  ctx.strokeStyle='#1e293b'; ctx.lineWidth=1;
  for(let v=0;v<=100;v+=25){
    const y=pad.t+ch*(1-v/100);
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+cw,y);ctx.stroke();
    ctx.fillStyle='#475569';ctx.font='11px system-ui';ctx.textAlign='right';
    ctx.fillText(v,pad.l-6,y+4);
  }

  // Show last 20 games max
  const show=scores.slice(-20);
  const n=show.length;
  const gap=n>1?cw/(n-1):0;

  // Line
  ctx.beginPath();
  ctx.strokeStyle='#3b82f6';ctx.lineWidth=2.5;ctx.lineJoin='round';
  show.forEach((s,i)=>{
    const x=pad.l+(n>1?i*gap:cw/2), y=pad.t+ch*(1-s/100);
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.stroke();

  // Fill area
  const lastX=pad.l+(n>1?(n-1)*gap:cw/2);
  ctx.lineTo(lastX,pad.t+ch);
  ctx.lineTo(pad.l,pad.t+ch);
  ctx.closePath();
  const grad=ctx.createLinearGradient(0,pad.t,0,pad.t+ch);
  grad.addColorStop(0,'rgba(59,130,246,0.25)');grad.addColorStop(1,'rgba(59,130,246,0)');
  ctx.fillStyle=grad;ctx.fill();

  // Dots
  show.forEach((s,i)=>{
    const x=pad.l+(n>1?i*gap:cw/2), y=pad.t+ch*(1-s/100);
    ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle=s>=80?'#22c55e':s>=50?'#eab308':'#ef4444';ctx.fill();
    ctx.strokeStyle='#0f172a';ctx.lineWidth=2;ctx.stroke();
  });

  // X labels
  ctx.fillStyle='#475569';ctx.font='10px system-ui';ctx.textAlign='center';
  show.forEach((s,i)=>{
    if(n<=10||i%Math.ceil(n/10)===0||i===n-1){
      const x=pad.l+(n>1?i*gap:cw/2);
      ctx.fillText(`#${scores.length-n+i+1}`,x,h-6);
    }
  });
}

async function init(){
  const r=await fetch("words-es-en.json");
  words=await r.json();
  $("startBtn").addEventListener("click",start);
  $("submitBtn").addEventListener("click",submit);
  $("answerInput").addEventListener("keydown",e=>{if(e.key==="Enter")submit()});
  $("restartBtn").addEventListener("click",start);
  $("clearBtn").addEventListener("click",()=>{if(confirm("Clear all progress?")){localStorage.removeItem(STORAGE_KEY);renderChart()}});
  renderChart();
}
init();
