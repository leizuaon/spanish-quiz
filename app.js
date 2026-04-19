let words=[], round=[], idx=0, correct=0, answers=[];
const $=s=>document.getElementById(s);

function norm(s){return(s||"").toLowerCase().trim().replace(/[^a-z0-9 -]/g,"").replace(/\s+/g," ")}
function shuffle(a){let b=[...a];for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}

function showWord(){
  $("progress").textContent=`${idx+1} / 10`;
  $("score").textContent=`Score: ${correct}`;
  $("spanishWord").textContent=round[idx].es;
  $("answerInput").value="";
  $("feedback").innerHTML="&nbsp;";
  $("answerInput").focus();
}

function submit(){
  const cur=round[idx], user=$("answerInput").value, un=norm(user);
  const valid=cur.en.map(norm);
  const ok=valid.includes(un);
  if(ok){correct++;$("feedback").textContent="✅ Correct!"}
  else{$("feedback").textContent=`❌  Accepted: ${cur.en.join(", ")}`}
  answers.push({es:cur.es,given:user,accepted:cur.en,ok});
  idx++;
  if(idx>=10) return setTimeout(finish,600);
  setTimeout(showWord,600);
}

function finish(){
  $("game").classList.add("hidden");
  $("result").classList.remove("hidden");
  const grade=Math.round(correct/10*100);
  const gc=$("gradeCircle");
  gc.textContent=grade;
  gc.className="grade-circle "+(grade>=80?"great":grade>=50?"ok":"bad");
  $("summary").textContent=`${correct}/10 correct answers`;
  $("review").innerHTML=answers.map(a=>
    `<div class="review-row ${a.ok?"was-correct":""}">
      <span class="es">${a.es}</span>
      <span class="yours">${a.given||"—"}</span>
      <span class="correct-ans">${a.accepted[0]}</span>
    </div>`).join("");
}

function start(){
  idx=0;correct=0;answers=[];
  round=shuffle(words).slice(0,10);
  $("start").classList.add("hidden");
  $("result").classList.add("hidden");
  $("game").classList.remove("hidden");
  showWord();
}

async function init(){
  const r=await fetch("words-es-en.json");
  words=await r.json();
  $("startBtn").addEventListener("click",start);
  $("submitBtn").addEventListener("click",submit);
  $("answerInput").addEventListener("keydown",e=>{if(e.key==="Enter")submit()});
  $("restartBtn").addEventListener("click",start);
}
init();
