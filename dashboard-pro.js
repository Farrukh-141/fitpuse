(function(){
var B='#1FA2FF',O='#FF7A1A',C='#00E5FF';
function ds(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function key(i){var d=new Date();d.setDate(d.getDate()-i);return ds(d)}
function sum(a,f){return a.reduce(function(s,x){return s+(+x[f]||0)},0)}
function st(k){var w=state.workouts.filter(function(x){return x.date===k}),m=state.meals.filter(function(x){return x.date===k}),wa=state.water[k]||{},a=state.activity[k]||{};
  return{k:k,w:w,m:m,wn:w.length,min:sum(w,'duration')+(+a.minutes||0),burn:sum(w,'calories'),eat:sum(m,'calories'),pro:sum(m,'protein'),carb:sum(m,'carbs'),fat:sum(m,'fat'),water:+wa.amount||0,wgoal:+wa.goal||2500,steps:+a.steps||0,on:!!(w.length||m.length||wa.amount>0||a.steps>0||a.minutes>0)}}
function ring(r,p,col){var c=2*Math.PI*r;return '<circle cx="90" cy="90" r="'+r+'" stroke="'+col+'" opacity=".18"/><circle class="pr" cx="90" cy="90" r="'+r+'" stroke="'+col+'" stroke-dasharray="'+(c*p).toFixed(1)+' '+c.toFixed(1)+'"/>'}
function card(cls,t,ic,body){return '<div class="card glass pro-card '+cls+'"><h4><i class="fa-solid fa-'+ic+'"></i> '+t+'</h4>'+body+'</div>'}
function bar(l,v,t,col){var p=Math.min(100,t?v/t*100:0);return '<div class="pb"><div class="pbl"><span>'+l+'</span><b>'+Math.round(v)+' / '+Math.round(t)+' g</b></div><div class="pbt"><i style="width:'+p+'%;background:'+col+'"></i></div></div>'}
function lab(k){var d=new Date(k+'T00:00:00'),t=key(0),y=key(1);return k===t?'Today':k===y?'Yesterday':d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}
function pro(){
  if(typeof state==='undefined'||!state.current)return;
  var sec=document.getElementById('sec-dashboard');if(!sec)return;
  var el=document.getElementById('proWrap');
  if(!el){el=document.createElement('div');el.id='proWrap';el.addEventListener('click',onClick);try{if(localStorage.getItem('fp_pro')==='0')el.classList.add('pro-off')}catch(e){}sec.appendChild(el)}
  var T=st(key(0)),goal=calorieGoal(),pc=Math.min(1,T.eat/goal),pw=Math.min(1,T.water/T.wgoal),ps=Math.min(1,T.steps/10000),pm=Math.min(1,T.min/60),score=Math.round((pc+pw+ps+pm)/4*100),i,days=[];
  for(i=0;i<84;i++)days.push(st(key(83-i)));
  var wk=days.slice(77),streak=0;
  for(i=83;i>=0;i--){if(days[i].on)streak++;else if(i!==83)break}
  var lvl=score>=100?'Champion':score>=75?'Almost there':score>=50?'Strong':score>=25?'Building':'Warm up';
  var lg=[['Calories',T.eat+' / '+goal,pc,O],['Water',T.water+' / '+T.wgoal+' ml',pw,B],['Steps',T.steps+' / 10000',ps,C],['Active min',T.min+' / 60',pm,'#A78BFA']].map(function(x){return '<div class="lg"><i style="background:'+x[3]+'"></i><span>'+x[0]+'</span><b>'+x[1]+'</b><em>'+Math.round(x[2]*100)+'%</em></div>'}).join('');
  var hero='<div class="card glass pro-card pro-hero"><div class="ph-ring"><svg viewBox="0 0 180 180" role="img" aria-label="FitScore '+score+'"><g transform="rotate(-90 90 90)" fill="none" stroke-width="12" stroke-linecap="round">'+ring(78,pc,O)+ring(60,pw,B)+ring(42,ps,C)+'</g><text x="90" y="92" text-anchor="middle" class="sc">'+score+'</text><text x="90" y="112" text-anchor="middle" class="sl">FITSCORE</text></svg></div>'+
   '<div class="ph-mid"><span class="ph-tag">'+lvl+'</span><h2>Your day at a glance</h2><div class="lgs">'+lg+'</div></div>'+
   '<div class="ph-act"><button data-act="workout"><i class="fa-solid fa-dumbbell"></i>Log workout</button><button data-act="meal"><i class="fa-solid fa-utensils"></i>Log meal</button><button data-act="water"><i class="fa-solid fa-droplet"></i>+250 ml</button><button data-act="steps"><i class="fa-solid fa-shoe-prints"></i>+1,000 steps</button><button data-act="min"><i class="fa-solid fa-stopwatch"></i>+10 min</button><button data-act="goal"><i class="fa-solid fa-bullseye"></i>New goal</button></div></div>';
  var mx=Math.max(30,Math.max.apply(null,wk.map(function(d){return d.min}))),bars=wk.map(function(d,j){var h=Math.round(d.min/mx*110),x=16+j*58,dn=new Date(d.k+'T00:00:00').toLocaleDateString(undefined,{weekday:'short'}).slice(0,2);return '<rect x="'+x+'" y="'+(130-h)+'" width="36" height="'+Math.max(2,h)+'" rx="7" fill="'+(j===6?O:B)+'"/><text x="'+(x+18)+'" y="'+(122-h)+'" text-anchor="middle" class="bv">'+(d.min||'')+'</text><text x="'+(x+18)+'" y="150" text-anchor="middle" class="bd">'+dn+'</text>'}).join('');
  var wc=card('s7','Last 7 days','chart-column','<svg viewBox="0 0 420 160" class="chart" role="img" aria-label="Active minutes, last 7 days"><line x1="0" y1="130" x2="420" y2="130" class="ax"/>'+bars+'</svg><div class="chips"><span><b>'+sum(wk,'wn')+'</b> workouts</span><span><b>'+sum(wk,'burn')+'</b> kcal burned</span><span><b>'+Math.round(sum(wk,'steps')/7)+'</b> avg steps</span></div>');
  var dots=wk.map(function(d){return '<i class="'+(d.on?'on':'')+'"></i>'}).join('');
  var sk=card('s5','Streak','fire','<div class="streak"><b>'+streak+'</b><span>day'+(streak===1?'':'s')+' in a row</span></div><div class="dots">'+dots+'</div><p class="muted">Log anything each day to keep it alive.</p>');
  var mt=[['Protein',T.pro,goal*.25/4,B],['Carbs',T.carb,goal*.5/4,O],['Fat',T.fat,goal*.25/9,C]],mc=card('s4','Macros today','bowl-food',mt.map(function(x){return bar(x[0],x[1],x[2],x[3])}).join('')+'<p class="muted">Targets: 25% protein, 50% carbs, 25% fat of your calorie goal.</p>');
  var ins=[],hr=new Date().getHours();
  if(!T.wn&&!(state.activity[key(0)]||{}).minutes)ins.push(['person-running','No workout yet today. Even 10 minutes counts.']);
  if(T.water<T.wgoal*(hr>=12?.5:.25))ins.push(['droplet','Drink about '+Math.max(0,T.wgoal-T.water)+' ml more to reach your water goal.']);
  if(T.steps<10000)ins.push(['shoe-prints','Only '+(10000-T.steps)+' steps to your daily goal.']);
  if(T.eat>goal)ins.push(['triangle-exclamation','You are '+(T.eat-goal)+' kcal over your calorie goal.']);
  if(T.eat&&T.pro<goal*.25/4*.6)ins.push(['drumstick-bite','Protein is low today. Try eggs, yogurt or chicken.']);
  if(streak>=3)ins.push(['fire','Great consistency: '+streak+' days in a row.']);
  if(score>=100)ins=[['trophy','All daily goals complete. Recover well!']];
  if(!ins.length)ins.push(['circle-check','You are on track. Keep going!']);
  var ic=card('s4','Smart tips','lightbulb','<ul class="tips">'+ins.slice(0,4).map(function(x){return '<li><i class="fa-solid fa-'+x[0]+'"></i><span>'+x[1]+'</span></li>'}).join('')+'</ul>');
  var anyW=days.some(function(d){return d.water>=d.wgoal&&d.water>0}),any10=days.some(function(d){return d.steps>=10000});
  var bd=[['First workout','dumbbell',state.workouts.length>0],['3-day streak','fire',streak>=3],['7-day streak','fire-flame-curved',streak>=7],['Hydration hero','droplet',anyW],['10k steps','shoe-prints',any10],['Goal crusher','trophy',state.goals.some(function(g){return g.completed})]],un=bd.filter(function(b){return b[2]}).length;
  var bc=card('s4','Badges '+un+'/6','medal','<div class="badges">'+bd.map(function(b){return '<div class="bg '+(b[2]?'on':'')+'"><i class="fa-solid fa-'+b[1]+'"></i><span>'+b[0]+'</span></div>'}).join('')+'</div>');
  var hm=card('s5','12-week activity','calendar-days','<div class="heat">'+days.map(function(d){var n=(d.wn>0)+(d.eat>0)+(d.water>0)+(d.steps>0)+(d.min>0);return '<i class="l'+Math.min(4,n)+'" title="'+lab(d.k)+'"></i>'}).join('')+'</div><div class="hl"><span>Less</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>More</span></div>');
  var feed=state.workouts.map(function(x){return{d:x.date,t:x.name||x.title||'Workout',m:(x.duration||0)+' min \u00b7 '+(x.calories||0)+' kcal',i:'dumbbell'}}).concat(state.meals.map(function(x){return{d:x.date,t:x.name||x.title||'Meal',m:(x.calories||0)+' kcal',i:'utensils'}})).sort(function(a,b){return a.d<b.d?1:a.d>b.d?-1:0}).slice(0,6);
  var fc=card('s4','Recent activity','clock-rotate-left',feed.length?'<ul class="feed">'+feed.map(function(f){return '<li><i class="fa-solid fa-'+f.i+'"></i><div><b>'+escapeHTML(String(f.t))+'</b><small>'+f.m+'</small></div><em>'+(f.d?lab(f.d):'')+'</em></li>'}).join('')+'</ul>':'<p class="muted">Nothing logged yet. Use the quick buttons above to start.</p>');
  var gl=state.goals.filter(function(g){return !g.completed}).slice(0,3),gc=card('s3','Goals','bullseye',gl.length?gl.map(function(g){var p=Math.min(100,g.target?g.current/g.target*100:0);return '<div class="pb"><div class="pbl"><span>'+escapeHTML(String(g.title))+'</span><b>'+Math.round(p)+'%</b></div><div class="pbt"><i style="width:'+p+'%;background:'+B+'"></i></div></div>'}).join(''):'<p class="muted">No active goals. Press New goal.</p>');
  el.innerHTML='<div class="pro-bar"><div><h2>Command center</h2><p class="muted">Everything in one place, updated live.</p></div><button type="button" data-act="tg" class="pro-tg">'+(el.classList.contains('pro-off')?'Show pro view':'Simple view')+'</button></div><div class="pro-grid">'+hero+wc+sk+mc+ic+bc+hm+fc+gc+'</div>';
}
function onClick(e){
  var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act,el=document.getElementById('proWrap');
  if(a==='tg'){el.classList.toggle('pro-off');try{localStorage.setItem('fp_pro',el.classList.contains('pro-off')?'0':'1')}catch(x){}b.textContent=el.classList.contains('pro-off')?'Show pro view':'Simple view';return}
  if(a==='water'){todayWater().amount+=250;toast('+250 ml water','success')}
  else if(a==='steps'){todayActivity().steps+=1000;toast('+1,000 steps','success')}
  else if(a==='min'){todayActivity().minutes+=10;toast('+10 active minutes','success')}
  else{var s={workout:'workouts',meal:'nutrition',goal:'goals'}[a];navigateTracker(s);setTimeout(function(){var m=document.querySelector('#sec-'+s+' [data-modal]');if(m)m.click()},60);return}
  save();renderAll();
}
var orig=window.renderDashboard;
if(typeof orig==='function'){window.renderDashboard=function(){orig.apply(this,arguments);try{pro()}catch(e){console.error('pro dashboard',e)}};try{pro()}catch(e){}}
})();
