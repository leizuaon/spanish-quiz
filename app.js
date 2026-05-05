let words=[], round=[], idx=0, correct=0, answers=[], currentOptions=[], selectedCategory='all';
const $=s=>document.getElementById(s);
const STORAGE_KEY='spanish_quiz_scores';
const CATEGORY_LABELS={all:'All words',food:'Food',travel:'Travel',daily:'Day-to-day'};
const CATEGORY_KEYWORDS={
  food:[
    'food','eat','drink','water','coffee','tea','milk','bread','rice','meat','fish','chicken','egg',
    'fruit','vegetable','apple','banana','orange','salt','sugar','cook','kitchen','breakfast','lunch','dinner'
  ],
  travel:[
    'travel','trip','journey','flight','airport','station','train','bus','car','taxi','ticket','hotel',
    'map','street','road','city','country','tourist','passport','luggage','bag','beach','mountain'
  ],
  daily:[
    'day','morning','afternoon','night','today','tomorrow','yesterday','home','house','work','school',
    'family','friend','money','phone','time','week','month','year','sleep','walk','talk','help','clean'
  ]
};

function getHistory(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch{return[]}}
function saveScore(grade){const h=getHistory();h.push({grade,date:new Date().toISOString()});localStorage.setItem(STORAGE_KEY,JSON.stringify(h));}

function norm(s){return(s||'').toLowerCase().trim().replace(/[^a-z0-9 -]/g,'').replace(/\s+/g,' ')}
function stem(w){return w.replace(/(ing|ed|es|s|ly|er|est|ness|ment|tion|ous|ful|less|able|ible)$/,'')}
function fuzzy(a,b){if(a===b)return true;const sa=stem(a),sb=stem(b);if(sa===sb&&sa.length>=2)return true;if(a.length>=3&&b.length>=3&&(a.startsWith(b)||b.startsWith(a)))return true;return false}
function shuffle(a){let b=[...a];for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}

function assignCategory(word){
  const txt=(word.en||[]).map(norm).join(' ');
  for(const category of ['food','travel','daily']){
    for(const kw of CATEGORY_KEYWORDS[category]){
      const re=new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i');
      if(re.test(txt)) return category;
    }
  }
  return 'daily';
}

function getCategoryPool(){
  if(selectedCategory==='all') return words;
  const pool=words.filter(w=>w.category===selectedCategory);
  return pool.length>=10?pool:words;
}

function uniquePrimaryTranslations(pool, exclude=[]){
  const seen=new Set(exclude.map(norm));
  const out=[];
  for(const w of shuffle(pool)){
    const t=(w.en&&w.en[0])?w.en[0]:'';
    const nt=norm(t);
    if(!t||seen.has(nt)) continue;
    seen.add(nt);
    out.push(t);
  }
  return out;
}

function showWord(){
  $('progress').textContent=`${idx+1} / 10`;
  $('progressFill').style.width=`${(idx+1)*10}%`;
  $('score').textContent=`${correct} ✓`;
  $('activeCategory').textContent=`Category: ${CATEGORY_LABELS[selectedCategory]}`;
  $('spanishWord').textContent=round[idx].es;
  $('feedback').innerHTML='&nbsp;';
  
  const cur=round[idx];
  const correct_en=cur.en[0];
  const pool=getCategoryPool();
  const wrong_options=uniquePrimaryTranslations(pool,[correct_en]).slice(0,4);
  if(wrong_options.length<4){
    wrong_options.push(...uniquePrimaryTranslations(words,[correct_en,...wrong_options]).slice(0,4-wrong_options.length));
  }
  currentOptions=shuffle([correct_en,...wrong_options]);
  
  document.querySelectorAll('.option-btn').forEach((btn,i)=>{
    btn.textContent=currentOptions[i];
    btn.className='option-btn';
    btn.disabled=false;
    btn.onclick=()=>selectOption(i);
  });
}

function selectOption(selectedIdx){
  const cur=round[idx];
  const selected=currentOptions[selectedIdx];
  const correct_en=cur.en[0];
  const ok=selected===correct_en;
  
  document.querySelectorAll('.option-btn').forEach((btn,i)=>{
    btn.disabled=true;
    if(i===selectedIdx){
      btn.classList.add(ok?'correct':'wrong');
    }else if(currentOptions[i]===correct_en){
      btn.classList.add('correct');
    }
  });
  
  if(ok){
    correct++;
    $('feedback').textContent='✅ Correct!';
  }else{
    $('feedback').textContent=`❌ Correct answer: ${correct_en}`;
  }
  
  answers.push({es:cur.es,given:selected,accepted:cur.en,ok});
  idx++;
  if(idx>=10) return setTimeout(finish,800);
  setTimeout(showWord,800);
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
  selectedCategory=$('categorySelect').value;
  round=shuffle(getCategoryPool()).slice(0,10);
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
  ctx.strokeStyle='#ea580c';ctx.lineWidth=2.5;ctx.lineJoin='round';
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
  grad.addColorStop(0,'rgba(234,88,12,0.25)');grad.addColorStop(1,'rgba(234,88,12,0)');
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
  words=words.map(w=>({...w,category:assignCategory(w)}));
  $("startBtn").addEventListener("click",start);
  $("restartBtn").addEventListener("click",start);
  $("clearBtn").addEventListener("click",()=>{if(confirm("Clear all progress?")){localStorage.removeItem(STORAGE_KEY);renderChart()}});
  renderChart();
}
init();
