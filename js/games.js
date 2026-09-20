import { sorting, scams, events, reserve, budgetScore, shuffled, validRecord } from './game-data.js';
const arena=document.querySelector('#game-arena');
const library=document.querySelector('#game-library');
const KEY='moneyguide.games.v1';
const titles={budget:'Campus Cash',sort:'Needs or Wants?',scam:'Scam Spotter'};
let game=null;
let records={};
let storageOK=true;
try {
  const raw=localStorage.getItem(KEY);
  if(raw) {
    const parsed=JSON.parse(raw);
    if(!parsed || parsed.version!==1 || !parsed.scores || typeof parsed.scores!=='object')throw Error('Invalid save');
    for(const id of Object.keys(titles))if(parsed.scores[id]) {
      if(!validRecord(parsed.scores[id]))throw Error('Invalid score');
      records[id]=parsed.scores[id];
    }
  }
} catch { storageOK=false; document.querySelector('#game-storage-note').textContent='Saved game scores could not be read. You can still play; existing saved data will not be overwritten.'; }
function showRecords() {
  document.querySelectorAll('[data-best]').forEach(node=>{
    const record=records[node.dataset.best];
    node.textContent=record?`Best: ${record.best}/100 · ${record.plays} completed ${record.plays===1?'game':'games'}`:'Your first score is waiting';
  });
}
showRecords();
function focusHeading() {arena.querySelector('h2')?.focus({preventScroll:true});}
function frame(content,stage='') {
  arena.innerHTML=`<div class="game-topbar"><button type="button" data-exit>← All games</button><span>${titles[game.id]}${stage?' · '+stage:''}</span></div><div class="game-panel">${content}</div>`;
  focusHeading();
}
function start(id) {
  if(!Object.hasOwn(titles,id))return;
  game={id,index:0,correct:0,streak:0,bestStreak:0,answered:false,finished:false,balance:0,decisions:0};
  library.hidden=true;arena.hidden=false;
  if(id==='budget')plan();
  else {game.cards=shuffled(id==='sort'?sorting:scams);question();}
  arena.scrollIntoView({block:'start',behavior:'instant'});
}
function plan() {
  frame(`<p class="eyebrow">PLAN THE MONTH</p><h2 tabindex="-1">Make 1,000 credits work for you.</h2><p>Rent and transport cost 450. Choose your food and fun budgets; everything left becomes your reserve. Your challenge: cover three surprises and finish with at least 150 saved.</p><p class="games-language">Credits are fictional game money, not your selected currency. These amounts are not a suggested real-life budget.</p><div class="budget-control"><label for="game-food">Food <output id="food-value">150 credits</output></label><input id="game-food" type="range" min="100" max="250" step="10" value="150"></div><div class="budget-control"><label for="game-fun">Fun & extras <output id="fun-value">100 credits</output></label><input id="game-fun" type="range" min="0" max="300" step="10" value="100"></div><div class="game-stats"><div class="game-stat"><span>Essentials</span><strong id="essential-value">600</strong></div><div class="game-stat"><span>Fun & extras</span><strong id="extra-value">100</strong></div><div class="game-stat"><span>Reserve</span><strong id="reserve-value">300</strong></div></div><div class="game-budget-bar" aria-hidden="true"><span></span><span></span><span></span></div><p id="budget-hint" aria-live="polite"></p><button class="button" data-lock>Lock my plan →</button>`,'Setup');
  arena.querySelectorAll('input').forEach(input=>input.addEventListener('input',updatePlan));updatePlan();
}
function updatePlan() {
  const food=Number(arena.querySelector('#game-food').value),fun=Number(arena.querySelector('#game-fun').value);
  const balance=reserve(food,fun);
  for(const [id,value] of [['food-value',food+' credits'],['fun-value',fun+' credits'],['essential-value',450+food],['extra-value',fun],['reserve-value',balance]])arena.querySelector('#'+id).textContent=value;
  [450+food,fun,balance].forEach((amount,i)=>arena.querySelectorAll('.game-budget-bar span')[i].style.width=amount/10+'%');
  arena.querySelector('#budget-hint').textContent=balance>=280?'You have room for the savings goal and some surprises.':balance>=150?'Your goal is covered for now. What if something unexpected happens?':'This plan leaves less than your 150-credit goal. Adjust it or see what happens.';
}
function question() {
  game.answered=false;
  if(game.id==='budget') {
    const card=events[game.index];
    frame(`<progress class="game-progress" value="${game.index}" max="3" aria-label="Situations completed"></progress><p class="eyebrow">SURPRISE ${game.index+1} / 3</p><h2 tabindex="-1">${card.title}</h2><div class="game-stats"><div class="game-stat"><span>Reserve left</span><strong>${game.balance}</strong></div><div class="game-stat"><span>Savings goal</span><strong>150</strong></div><div class="game-stat"><span>Smart moves</span><strong>${game.decisions}</strong></div></div><p class="game-question">${card.text}</p><div class="game-options">${card.options.map((o,i)=>`<button data-choice="${i}" type="button">${o.text} · ${o.cost} credits</button>`).join('')}</div><div id="game-response" aria-live="polite"></div>`,'Decision '+(game.index+1)+' of 3');
  } else {
    const card=game.cards[game.index],total=game.cards.length;
    frame(`<progress class="game-progress" value="${game.index}" max="${total}" aria-label="Rounds completed"></progress><p class="eyebrow">${game.id==='sort'?'READ THE CONTEXT':'INVESTIGATE THE MESSAGE'} · ${game.index+1} / ${total}</p><h2 tabindex="-1">${card.title}</h2><div class="game-question">${card.from?`<p class="eyebrow">${card.from}</p>`:''}<p>${card.text}</p></div><div class="game-options ${game.id==='sort'?'sort-options':''}">${(card.options || ['Need','Want']).map((label,i)=>`<button type="button" data-choice="${i}">${label}</button>`).join('')}</div><p>${game.correct} correct · Current streak: ${game.streak}</p><div id="game-response" aria-live="polite"></div>`,'Round '+(game.index+1)+' of '+total);
  }
}
function answer(index) {
  if(game.answered || game.finished)return;
  const card=game.id==='budget'?events[game.index]:game.cards[game.index];
  const count=card.options?.length || 2;
  if(!Number.isInteger(index) || index<0 || index>=count)return;
  game.answered=true;
  let heading,explanation;
  if(game.id==='budget') {
    const choice=card.options[index];game.balance-=choice.cost;game.decisions+=choice.points;
    heading=game.balance<0?'Your reserve ran out.':choice.points?'A thoughtful move.':'See the trade-off.';
    explanation=choice.why+` Reserve now: ${game.balance} credits.`+(game.balance<0?' A negative reserve means this plan has a shortfall, not that the game gave you a loan.':'');
    arena.querySelector('.game-stat strong').textContent=game.balance;
    arena.querySelectorAll('.game-stat strong')[2].textContent=game.decisions;
  } else {
    const correct=index===card.answer;game.correct+=Number(correct);game.streak=correct?game.streak+1:0;game.bestStreak=Math.max(game.bestStreak,game.streak);
    heading=correct?'You spotted it.':'A useful lesson.';explanation=card.why;
  }
  arena.querySelectorAll('[data-choice]').forEach((button,i)=>{button.disabled=true;button.classList.toggle('chosen',i===index);});
  arena.querySelector('#game-response').innerHTML=`<div class="game-feedback"><strong>${heading}</strong><p>${explanation}</p></div><button class="button" data-next type="button">${game.index+1===(game.id==='budget'?3:game.cards.length)?'See my results':'Next round'} →</button>`;
  arena.querySelector('[data-next]').focus({preventScroll:true});
}
function finish() {
  if(game.finished)return;
  game.finished=true;
  const score=game.id==='budget'?budgetScore(game.balance,game.decisions):Math.round(game.correct/game.cards.length*100);
  const previous=records[game.id]?.best ?? -1;
  records[game.id]={best:Math.max(score,previous),plays:Math.min(999999,(records[game.id]?.plays || 0)+1)};
  if(storageOK)try {localStorage.setItem(KEY,JSON.stringify({version:1,scores:records}));}catch {storageOK=false;document.querySelector('#game-storage-note').textContent='Your score is available for this visit, but this browser could not save it.';}
  showRecords();
  const recap=game.id==='budget'?`You finished with ${game.balance} credits and made ${game.decisions} of 3 reserve-friendly choices. ${game.balance>=150?'Savings goal reached.':'Try another plan to protect a larger cushion.'}`:`You answered ${game.correct} of ${game.cards.length} correctly. Your longest streak was ${game.bestStreak}.`;
  const lesson=game.id==='budget'?'A buffer gives you options. This game awards up to 40 points for protecting your 150-credit goal and 20 for each reserve-friendly decision.':game.id==='sort'?'Needs and wants depend on your situation. Planning for wants is allowed; make the trade-off a conscious one.':'Pause, check the source independently, and protect your information. Pressure is a reason to slow down.';
  frame(`<p class="eyebrow">${score>previous && previous>=0?'NEW PERSONAL BEST':'CHALLENGE COMPLETE'}</p><h2 tabindex="-1">${score>=80?'A smarter money move.':'Practice turns into progress.'}</h2><div class="game-result-score">${score}<small> / 100</small></div><p>${recap}</p><div class="game-feedback"><strong>Your takeaway</strong><p>${lesson}</p></div><p>Best score: ${records[game.id].best}/100. ${storageOK?'Saved in this browser.':'Not saved permanently.'}</p><div class="game-result-actions"><button class="button" type="button" data-replay>Play again ↻</button><button class="button button-secondary" type="button" data-exit>Choose another game</button><a class="text-link" data-requires-profile href="module.html?id=${game.id==='budget'?2:game.id==='sort'?1:9}">Keep learning →</a></div>`,'Results');
}
function exitGame() {
  const id=game?.id;game=null;arena.hidden=true;arena.innerHTML='';library.hidden=false;document.querySelector(`[data-start="${id}"]`)?.focus();
}
document.querySelectorAll('[data-start]').forEach(button=>button.addEventListener('click',()=>start(button.dataset.start)));
arena.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button || !game)return;
  if(button.hasAttribute('data-exit')) {exitGame();return;}
  if(button.hasAttribute('data-replay')) {start(game.id);return;}
  if(button.hasAttribute('data-lock')) {game.balance=reserve(Number(arena.querySelector('#game-food').value),Number(arena.querySelector('#game-fun').value));question();return;}
  if(button.hasAttribute('data-choice'))answer(Number(button.dataset.choice));
  if(button.hasAttribute('data-next') && game.answered && !game.finished) {game.index++;game.index===(game.id==='budget'?3:game.cards.length)?finish():question();}
});
