(function(){
function $(s){return document.querySelector(s)}
var btn=document.createElement('button');btn.id='fpToolsBtn';btn.type='button';btn.setAttribute('aria-label','Open fitness tools');btn.innerHTML='<i class="fa-solid fa-bolt" aria-hidden="true"></i><span>Tools</span>';
var pn=document.createElement('div');pn.id='fpTools';pn.hidden=true;pn.setAttribute('role','dialog');pn.setAttribute('aria-modal','true');pn.setAttribute('aria-label','Fitness tools');
pn.innerHTML='<div class="ft-card" data-ph="idle"><div class="ft-head"><b>Fitness tools</b><button type="button" class="ft-x" aria-label="Close">&times;</button></div>'+
'<div class="ft-tabs" role="tablist"><button type="button" role="tab" data-t="timer" aria-selected="true">Interval timer</button><button type="button" role="tab" data-t="orm" aria-selected="false">1RM</button><button type="button" role="tab" data-t="hr" aria-selected="false">HR zones</button><button type="button" role="tab" data-t="breath" aria-selected="false">Breathing</button><button type="button" role="tab" data-t="intro" aria-selected="false">Intro</button></div>'+
'<div data-p="timer"><div class="ft-row"><label>Work (sec)<input id="ftW" type="number" min="5" value="40"></label><label>Rest (sec)<input id="ftR" type="number" min="0" value="20"></label><label>Rounds<input id="ftN" type="number" min="1" value="8"></label></div><div class="ft-big" id="ftTime">00:40</div><div class="ft-ph" id="ftPh" aria-live="polite">Ready</div><button class="ft-btn" id="ftGo" type="button">Start</button><button class="ft-btn alt" id="ftRs" type="button">Reset</button></div>'+
'<div data-p="orm" hidden><div class="ft-row"><label>Weight lifted<input id="oW" type="number" min="1" value="60"></label><label>Reps (1-12)<input id="oR" type="number" min="1" max="12" value="8"></label></div><div id="oOut"></div><p class="ft-note">Estimate using the Epley formula. Stop sets with good form.</p></div>'+
'<div data-p="hr" hidden><div class="ft-row"><label>Age<input id="hA" type="number" min="10" max="100" value="30"></label><label>Resting HR (optional)<input id="hRest" type="number" min="30" max="120" placeholder="e.g. 60"></label></div><div id="hOut"></div><p class="ft-note">Estimates only (max HR = 208 &minus; 0.7 &times; age). Not medical advice.</p></div>'+
'<div data-p="breath" hidden><div class="ft-circ" id="bC"></div><div class="ft-ph" id="bL" aria-live="polite">Box breathing: 4-4-4-4</div><div style="text-align:center"><button class="ft-btn" id="bGo" type="button">Start</button></div></div>'+
'<div data-p="intro" hidden><label>Intro animation<select id="iSel"><option value="random">Random</option><option value="0">Sync (banner)</option><option value="1">Countdown</option><option value="2">Pulse</option><option value="3">Athlete</option><option value="4">Orbit</option><option value="5">Warp</option><option value="6">Glitch</option><option value="7">Particles</option><option value="8">Tunnel</option><option value="9">Neon</option><option value="off">Off</option></select></label><p style="margin-top:14px"><button class="ft-btn" id="iPrev" type="button">Preview intro</button></p></div></div>';
document.body.appendChild(btn);document.body.appendChild(pn);
function open(){pn.hidden=false;pn.querySelector('.ft-x').focus()}
function close(){pn.hidden=true;btn.focus()}
btn.onclick=open;pn.querySelector('.ft-x').onclick=close;
pn.addEventListener('click',function(e){if(e.target===pn)close()});
addEventListener('keydown',function(e){if(e.key==='Escape'&&!pn.hidden)close()});
pn.querySelectorAll('.ft-tabs button').forEach(function(b){b.onclick=function(){pn.querySelectorAll('.ft-tabs button').forEach(function(x){x.setAttribute('aria-selected',x===b)});pn.querySelectorAll('[data-p]').forEach(function(p){p.hidden=p.dataset.p!==b.dataset.t})}});
var ac;function beep(f,d){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();var o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.15;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function fmt(s){s=Math.max(0,s);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
var T={id:0,ph:'idle',left:0,rd:1},card=pn.querySelector('.ft-card');
function cfg(){return{w:Math.max(5,+$('#ftW').value||40),r:Math.max(0,+$('#ftR').value||0),n:Math.max(1,+$('#ftN').value||8)}}
function paint(){var c=cfg();$('#ftTime').textContent=fmt(T.ph==='idle'?c.w:T.left);card.dataset.ph=T.ph;$('#ftPh').textContent=T.ph==='idle'?'Ready':T.ph==='done'?'Workout complete!':(T.ph==='work'?'Work':'Rest')+' \u00b7 round '+T.rd+'/'+c.n}
function tick(){var c=cfg();T.left--;if(T.left>0&&T.left<=3)beep(660,.08);if(T.left<=0){beep(880,.3);if(T.ph==='work'){if(T.rd>=c.n){stop();T.ph='done';T.left=0;$('#ftGo').textContent='Start';return paint()}if(c.r>0){T.ph='rest';T.left=c.r}else{T.rd++;T.left=c.w}}else{T.rd++;T.ph='work';T.left=c.w}}paint()}
function stop(){clearInterval(T.id);T.id=0}
$('#ftGo').onclick=function(){if(T.id){stop();this.textContent='Resume';return}if(T.ph==='idle'||T.ph==='done'){T.ph='work';T.rd=1;T.left=cfg().w;beep(880,.3)}this.textContent='Pause';T.id=setInterval(tick,1000);paint()};
$('#ftRs').onclick=function(){stop();T.ph='idle';T.rd=1;$('#ftGo').textContent='Start';paint()};
['#ftW','#ftR','#ftN'].forEach(function(s){$(s).oninput=function(){if(T.ph==='idle')paint()}});paint();
function orm(){var w=+$('#oW').value,r=+$('#oR').value;if(!(w>0)||!(r>=1&&r<=12)){$('#oOut').innerHTML='<p class="ft-note">Enter weight and 1-12 reps.</p>';return}var e=r===1?w:w*(1+r/30),h='<div class="ft-big" style="color:#1FA2FF">'+Math.round(e)+'</div><div class="ft-ph">Estimated 1RM</div><table><tr><th>% of 1RM</th><th>Load</th></tr>';[95,90,85,80,75,70,60].forEach(function(p){h+='<tr><td>'+p+'%</td><td>'+Math.round(e*p/100)+'</td></tr>'});$('#oOut').innerHTML=h+'</table>'}
$('#oW').oninput=$('#oR').oninput=orm;orm();
function hr(){var a=+$('#hA').value,rest=+$('#hRest').value;if(!(a>=10&&a<=100)){$('#hOut').innerHTML='<p class="ft-note">Enter an age from 10 to 100.</p>';return}var mx=Math.round(208-.7*a),z=[['Warm-up',50,60],['Fat burn',60,70],['Cardio',70,80],['Hard',80,90],['Peak',90,100]],h='<div class="ft-big" style="color:#FF7A1A">'+mx+'</div><div class="ft-ph">Estimated max HR (bpm)</div><table><tr><th>Zone</th><th>Range (bpm)</th></tr>';z.forEach(function(x){function f(p){return Math.round(rest>0&&rest<mx?rest+(mx-rest)*p/100:mx*p/100)}h+='<tr><td>'+x[0]+' ('+x[1]+'&ndash;'+x[2]+'%)</td><td>'+f(x[1])+'&ndash;'+f(x[2])+'</td></tr>'});$('#hOut').innerHTML=h+'</table>'}
$('#hA').oninput=$('#hRest').oninput=hr;hr();
var bt=0,bi=0,bn=['Breathe in','Hold','Breathe out','Hold'];
$('#bGo').onclick=function(){var c=$('#bC');if(bt){clearInterval(bt);bt=0;c.classList.remove('on');$('#bL').textContent='Box breathing: 4-4-4-4';this.textContent='Start';return}bi=0;c.classList.remove('on');void c.offsetWidth;c.classList.add('on');$('#bL').textContent=bn[0];this.textContent='Stop';bt=setInterval(function(){bi=(bi+1)%4;$('#bL').textContent=bn[bi]},4000)};
var sel=$('#iSel');try{sel.value=localStorage.getItem('fp_intro')||'random'}catch(e){}
sel.onchange=function(){try{localStorage.setItem('fp_intro',sel.value)}catch(e){}};
$('#iPrev').onclick=function(){try{sessionStorage.setItem('fp_force','1');if(sel.value==='off'){localStorage.setItem('fp_intro','random');sel.value='random'}}catch(e){}location.reload()};
})();
