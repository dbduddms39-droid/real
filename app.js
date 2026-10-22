'use strict';
const $=s=>document.querySelector(s);
const symbols=window.PhoneIcons;
const story={owner:'양정원',initials:'정원',birthday:{title:'지우 생일',month:9,day:7},song:{title:'어떻게 지내',artist:'오반',searchUrl:'https://music.apple.com/kr/search?term='+encodeURIComponent('오반 어떻게 지내')}};
function paintSymbols(root=document){root.querySelectorAll('[data-symbol]').forEach(el=>el.innerHTML=symbols.symbol(el.dataset.symbol))}
paintSymbols();
const pages=[['FaceTime','캘린더','사진','카메라','메일','메모','미리 알림','시계','뉴스','TV','팟캐스트','App Store','지도','건강','지갑','설정'],['계산기','파일','단축어','연락처','음악','도서','날씨']];
const dock=['전화','Safari','메시지','음악'];const allApps=[...new Set([...pages.flat(),...dock])];let pageIndex=0;let interval;let toastTimer;let holdTimer;let note='';let lastAppButton=null;
let iconAppearance='light',iconSize='small';
try{note=localStorage.getItem('my-phone-note')||'';const saved=JSON.parse(localStorage.getItem('my-phone-appearance')||'{}');if(['light','dark','clear'].includes(saved.appearance))iconAppearance=saved.appearance;if(['small','large'].includes(saved.size))iconSize=saved.size}catch{}
function applyAppearance(){const phone=$('.phone');phone.classList.remove('theme-dark','theme-clear','icons-large');if(iconAppearance!=='light')phone.classList.add('theme-'+iconAppearance);if(iconSize==='large')phone.classList.add('icons-large');document.querySelectorAll('[data-appearance]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.appearance===iconAppearance)));document.querySelectorAll('[data-icon-size]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.iconSize===iconSize)))}
function saveAppearance(){try{localStorage.setItem('my-phone-appearance',JSON.stringify({appearance:iconAppearance,size:iconSize}))}catch{toast('사용자화 설정을 저장할 수 없어 현재 화면에만 적용합니다.')}}

function makeIcon(name){const b=document.createElement('button');b.className='app-icon';b.dataset.app=name;b.setAttribute('aria-label',name);b.innerHTML=`<span class="icon">${symbols.app(name,iconAppearance)}</span><span class="app-label">${name}</span>`;return b}
function showPage(index){pageIndex=index;$('#apps').replaceChildren(...pages[index].map(makeIcon));document.querySelectorAll('[data-page]').forEach(b=>{const selected=Number(b.dataset.page)===index;b.classList.toggle('selected',selected);b.setAttribute('aria-current',selected?'page':'false')});tick()}
dock.forEach(name=>$('#dock').append(makeIcon(name)));
function toast(text){$('#toast').textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').textContent='',4500)}
function home(restore=false){clearTimeout(holdTimer);$('#customize').hidden=true;clearInterval(interval);$('#app').hidden=true;$('#control').hidden=true;$('#lock').hidden=true;$('#home').hidden=false;['home','app','lock'].forEach(id=>$('#'+id).inert=false);if(restore&&lastAppButton?.isConnected)lastAppButton.focus()}
function openControl(){$('#customize').hidden=true;['home','app','lock'].forEach(id=>$('#'+id).inert=true);$('#control').hidden=false;$('#close-control').focus()}
function closeControl(){['home','app','lock'].forEach(id=>$('#'+id).inert=false);$('#control').hidden=true;$('#control-button').focus()}
function tick(){const now=new Date();const time=`${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;$('#status-time').textContent=time;$('#lock-time').textContent=time;$('#lock-date').textContent=now.toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'long'});$('#widget-date').textContent=now.getDate();$('#widget-day').textContent=now.toLocaleDateString('ko-KR',{weekday:'long'});const transforms={hour:(now.getHours()%12)*30+now.getMinutes()/2,minute:now.getMinutes()*6,second:now.getSeconds()*6};for(const [hand,angle]of Object.entries(transforms))document.querySelectorAll(`[data-clock-hand="${hand}"]`).forEach(el=>el.setAttribute('transform',`rotate(${angle} 50 50)`));document.querySelectorAll('[data-calendar-date]').forEach(el=>el.textContent=now.getDate());document.querySelectorAll('[data-calendar-weekday]').forEach(el=>el.textContent=now.toLocaleDateString('ko-KR',{weekday:'long'}))}

function placeholder(name){const content=document.createElement('div');content.className='app-placeholder';content.innerHTML=`<span class="icon">${symbols.app(name)}</span><h2></h2><p class="muted"></p>`;content.querySelector('h2').textContent=name;const descriptions={'카메라':'카메라 화면은 준비 중입니다. 이 데모는 카메라 권한을 요청하지 않습니다.','Safari':'브라우저 화면 미리보기입니다. 실제 웹 탐색 기능은 아직 연결되지 않았습니다.','메일':'메일 계정이 연결되지 않았습니다.','메시지':'아직 대화가 없습니다. 실제 문자 발송 기능은 연결되지 않았습니다.','FaceTime':'FaceTime 스타일 미리보기입니다. 실제 영상 통화는 지원하지 않습니다.','음악':'라이브러리가 비어 있습니다. 재생할 음악이 연결되지 않았습니다.','App Store':'App Store 화면 미리보기입니다. 앱 설치는 지원하지 않습니다.'};content.querySelector('p').textContent=descriptions[name]||'기본 앱 화면입니다. 실제 서비스와 연결되는 기능은 아직 준비 중입니다.';return content}
function openApp(name){home();$('#home').hidden=true;$('#app').hidden=false;$('#app').className='app';$('#app-title').textContent=name;const c=$('#app-content');c.replaceChildren();c.scrollTop=0;
if(name==='메모'){$('#app').classList.add('notes-app');c.innerHTML='<p class="notes-date"></p><textarea aria-label="메모" placeholder="메모를 입력하세요"></textarea><p class="muted">이 브라우저에 자동 저장됩니다.</p>';c.querySelector('.notes-date').textContent=new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric'});const t=c.querySelector('textarea');t.value=note;t.oninput=()=>{note=t.value;try{localStorage.setItem('my-phone-note',note)}catch{toast('저장 공간을 사용할 수 없어 현재 화면에서만 유지됩니다.')}}}
else if(name==='설정'){c.innerHTML=`<h1>설정</h1><div class="card profile"><span class="avatar">${story.initials}</span><div><strong>${story.owner}</strong><p class="muted">${story.owner}의 iPhone</p></div></div><div class="card"><div class="row"><span class="row-label"><span class="settings-icon" style="background:#ff9500" data-symbol="airplane"></span>비행기 모드</span><input id="settings-airplane" class="setting-switch" type="checkbox" aria-label="비행기 모드 시뮬레이션"></div><div class="row"><span class="row-label"><span class="settings-icon" data-symbol="wifi"></span>Wi-Fi</span><span id="settings-wifi"></span></div><div class="row"><span class="row-label"><span class="settings-icon" data-symbol="bluetooth"></span>Bluetooth</span><span id="settings-bluetooth"></span></div></div><div class="card"><label class="row"><span class="row-label"><span class="settings-icon" style="background:#5856d6" data-symbol="moon"></span>다크 배경</span><input class="setting-switch" type="checkbox" id="dark"></label><div class="row"><span class="row-label"><span class="settings-icon" style="background:#5856d6" data-symbol="sun"></span>홈 화면 사용자화</span><button id="settings-customize">열기</button></div><div class="row"><span class="row-label"><span class="settings-icon" style="background:#888" data-symbol="mirror"></span>제어 센터</span><button id="settings-control">열기</button></div><div class="row"><span class="row-label"><span class="settings-icon" style="background:#888" data-symbol="lock"></span>화면 잠금</span><button id="settings-lock">잠그기</button></div></div><p class="muted">이 화면의 설정은 웹 데모에만 적용됩니다.</p>`;paintSymbols(c);$('#dark').checked=document.body.classList.contains('dark');$('#dark').onchange=e=>document.body.classList.toggle('dark',e.target.checked);$('#settings-control').onclick=openControl;$('#settings-customize').onclick=openCustomize;$('#settings-lock').onclick=lock;syncSettings();$('#settings-airplane').onchange=()=>toggleControl($('.airplane'))}
else if(name==='시계'){c.innerHTML='<h1>세계 시계</h1><div class="card padded"><div class="big-clock" id="live-clock"></div><p class="clock-city"></p></div><p class="muted">기기에 설정된 시간대를 표시합니다.</p>';c.querySelector('.clock-city').textContent=Intl.DateTimeFormat().resolvedOptions().timeZone;const update=()=>$('#live-clock').textContent=new Date().toLocaleTimeString('ko-KR',{hour12:false});update();interval=setInterval(update,1000)}
else if(name==='캘린더'){renderCalendar(c)}
else if(name==='사진'){c.innerHTML='<h1>보관함</h1><p class="muted">샘플 배경 · 4장</p><div class="gallery"></div>';for(let i=0;i<4;i++){const b=document.createElement('button');b.className='photo';b.setAttribute('aria-label',`샘플 배경 ${i+1} 보기`);b.onclick=()=>{const background=getComputedStyle(b).background;c.replaceChildren();const preview=document.createElement('div');preview.className='photo-preview';preview.style.background=background;const back=document.createElement('button');back.textContent='‹ 보관함으로';back.style.cssText='background:none;color:#007aff;padding:12px 0';back.onclick=()=>openApp('사진');c.append(back,preview)};c.querySelector('.gallery').append(b)}}
else if(name==='날씨'){c.innerHTML='<div style="text-align:center;padding-top:22px"><h1 style="font-size:30px;font-weight:400;margin-bottom:0">서울</h1><div style="font-size:88px;font-weight:200;letter-spacing:-6px">21°</div><p style="font-size:19px;margin:0">맑음</p><p>최고:24° · 최저:16°</p><div class="card padded muted" style="margin-top:35px">디자인을 위한 예시 날씨입니다.<br>실시간 기상 정보와 연결되지 않았습니다.</div></div>'}
else if(name==='전화'){c.innerHTML='<div class="dial-display" aria-live="polite"></div><div class="dial"></div><p class="muted" style="text-align:center">번호 입력 데모 · 실제 통화는 연결되지 않습니다.</p>';const letters=['','ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ','','+',''];['1','2','3','4','5','6','7','8','9','*','0','#','⌫','통화'].forEach((key,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',key);b.textContent=key;if(letters[i]){const s=document.createElement('small');s.textContent=letters[i];b.append(s)}if(key==='통화'){b.className='call';b.innerHTML=symbols.app('전화')}b.onclick=()=>{const d=c.querySelector('.dial-display');if(key==='⌫')d.textContent=d.textContent.slice(0,-1);else if(key==='통화')toast('전화 연결 없이 번호 입력만 지원하는 데모입니다.');else if(d.textContent.length<18)d.textContent+=key};c.querySelector('.dial').append(b)})}
else if(name==='계산기'){calculator(c)}
else if(name==='미리 알림'){c.innerHTML='<h1 style="color:#007aff">미리 알림</h1><div class="card" id="reminder-list"></div><form id="reminder-form"><label class="muted" for="reminder-input">새로운 미리 알림</label><div class="row"><input class="app-search" id="reminder-input" placeholder="할 일 입력" required maxlength="120"><button type="submit">추가</button></div></form><p class="muted">현재 화면에서만 유지됩니다.</p>';$('#reminder-form').onsubmit=e=>{e.preventDefault();const input=$('#reminder-input'),text=input.value.trim();if(!text)return;const row=document.createElement('label');row.className='row';const check=document.createElement('input');check.type='checkbox';const span=document.createElement('span');span.textContent=text;span.style.cssText='flex:1;overflow-wrap:anywhere';check.onchange=()=>span.style.textDecoration=check.checked?'line-through':'none';row.append(check,span);$('#reminder-list').append(row);input.value=''}}
else if(name==='음악'){renderMusic(c)}
else if(name==='검색'){renderSearch(c)}
else c.append(placeholder(name));
$('#back').focus({preventScroll:true});
}

function renderCalendar(container){
 const now=new Date(),birthday=story.birthday;
 let year=now.getFullYear(),month=now.getMonth(),selectedDay=now.getDate();
 const isBirthday=(m,d)=>m===birthday.month-1&&d===birthday.day;
 function render(){
  container.innerHTML=`<div class="calendar-toolbar"><button id="calendar-prev" aria-label="이전 달">${symbols.symbol('back')}</button><button id="calendar-today">오늘</button><button id="calendar-next" aria-label="다음 달">${symbols.symbol('chevron')}</button></div><h1 id="calendar-month" style="color:#ff3b30">${year}년 ${month+1}월</h1><div class="card"><div class="calendar-grid"></div></div><div id="calendar-events" class="card padded"></div>`;
  const grid=container.querySelector('.calendar-grid');
  ['일','월','화','수','목','금','토'].forEach(day=>{const label=document.createElement('span');label.className='day-name';label.textContent=day;grid.append(label)});
  for(let i=0;i<new Date(year,month,1).getDay();i++)grid.append(document.createElement('span'));
  for(let day=1;day<=new Date(year,month+1,0).getDate();day++){
   const button=document.createElement('button');button.className='calendar-day';button.textContent=day;
   const today=year===now.getFullYear()&&month===now.getMonth()&&day===now.getDate();
   if(today){button.classList.add('today');button.setAttribute('aria-current','date')}
   if(day===selectedDay)button.classList.add('selected');
   if(isBirthday(month,day))button.classList.add('has-event');
   button.setAttribute('aria-label',`${year}년 ${month+1}월 ${day}일${isBirthday(month,day)?', '+birthday.title:''}${today?', 오늘':''}`);
   button.setAttribute('aria-pressed',String(day===selectedDay));
   button.onclick=()=>{selectedDay=day;render()};grid.append(button);
  }
  const events=container.querySelector('#calendar-events');
  const date=document.createElement('strong');date.textContent=new Date(year,month,selectedDay).toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'long'});events.append(date);
  if(isBirthday(month,selectedDay)){
   const event=document.createElement('div');event.className='birthday-event';
   event.innerHTML='<span class="event-time">하루 종일</span><div><strong></strong><p class="muted">생일 · 매년 반복</p></div>';
   event.querySelector('strong').textContent=birthday.title;events.append(event);
  }else{
   const empty=document.createElement('p');empty.className='muted';empty.textContent='등록된 일정이 없습니다.';events.append(empty);
   const link=document.createElement('button');link.className='birthday-link';link.setAttribute('aria-label','9월 7일 지우 생일 보기');
   link.innerHTML='<span class="birthday-date">9월<strong>7</strong></span><span><strong></strong><small>하루 종일 · 매년</small></span><span class="birthday-chevron">›</span>';
   link.querySelector('span:nth-child(2)>strong').textContent=birthday.title;
   link.onclick=()=>{const next=new Date(now.getFullYear(),birthday.month-1,birthday.day);const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());if(next<today)next.setFullYear(next.getFullYear()+1);year=next.getFullYear();month=birthday.month-1;selectedDay=birthday.day;render()};container.append(link);
  }
  $('#calendar-prev').onclick=()=>navigate(-1);$('#calendar-next').onclick=()=>navigate(1);
  $('#calendar-today').onclick=()=>{year=now.getFullYear();month=now.getMonth();selectedDay=now.getDate();render()};
 }
 function navigate(delta){const date=new Date(year,month+delta,1);year=date.getFullYear();month=date.getMonth();selectedDay=1;render()}
 render();
}

function calculator(c){$('#app').classList.add('dark-app');c.innerHTML='<div class="calculator-display" aria-live="polite">0</div><div class="calculator-keys"></div>';let value='0',stored=null,op=null,fresh=true;const display=c.querySelector('.calculator-display');const compute=()=>{const a=stored,b=Number(value);const result=op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:b===0?NaN:a/b;value=Number.isFinite(result)?String(Number(result.toPrecision(10))):'오류'};for(const key of ['AC','+/−','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','=']){const b=document.createElement('button');b.textContent=key;if(['+','−','×','÷','='].includes(key))b.className='operation';if(['AC','+/−','%'].includes(key))b.className='utility';if(key==='0')b.className='zero';b.onclick=()=>{if(key==='AC'){value='0';stored=null;op=null;fresh=true}else if(key==='+/−'){if(value!=='오류')value=String(-Number(value))}else if(key==='%'){if(value!=='오류')value=String(Number(value)/100)}else if(['+','−','×','÷','='].includes(key)){if(op&&stored!==null&&!fresh)compute();if(key==='='){op=null;stored=null}else if(value!=='오류'){stored=Number(value);op=key}fresh=true}else{if(fresh||value==='오류'){value=key==='.'?'0.':key;fresh=false}else if(value.length<14){if(key==='.'&&!value.includes('.'))value+='.';else if(key!=='.')value=value==='0'?key:value+key}}display.textContent=value};c.querySelector('.calculator-keys').append(b)}}
function renderSearch(c){c.innerHTML='<h1>검색</h1><input id="app-search" class="app-search" type="search" placeholder="앱 검색" aria-label="앱 검색"><div id="results" class="card" style="margin-top:18px"></div>';const update=()=>{const results=$('#results');results.replaceChildren();allApps.filter(name=>name.toLowerCase().includes($('#app-search').value.toLowerCase())).forEach(name=>{const b=document.createElement('button');b.className='row result';b.innerHTML=`<span class="row-label"><span class="icon">${symbols.app(name)}</span><span></span></span>`;b.querySelector('.row-label>span:last-child').textContent=name;b.onclick=()=>openApp(name);results.append(b)});if(!results.children.length){const p=document.createElement('p');p.className='muted';p.textContent='검색 결과가 없습니다.';results.append(p)}};$('#app-search').oninput=update;update();setTimeout(()=>$('#app-search')?.focus(),50)}
function syncSettings(){if(!$('#settings-airplane'))return;$('#settings-airplane').checked=$('.airplane').getAttribute('aria-pressed')==='true';$('#settings-wifi').textContent=$('.wifi-toggle').getAttribute('aria-pressed')==='true'?'켜짐':'끔';$('#settings-bluetooth').textContent=$('.bluetooth').getAttribute('aria-pressed')==='true'?'켬':'끔'}
function toggleControl(button){const active=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(active));button.classList.toggle('active',active);if(button.classList.contains('focus'))button.querySelector('small').textContent=active?'켬':'끔';syncSettings()}
function lock(){home();$('#home').hidden=true;$('#lock').hidden=false;$('#unlock').focus()}
function flashlight(){const active=$('#flashlight').getAttribute('aria-pressed')!=='true';['flashlight','control-torch'].forEach(id=>$('#'+id).setAttribute('aria-pressed',String(active)));toast(active?'손전등 아이콘을 켰습니다. 실제 기기 플래시는 제어하지 않습니다.':'손전등 시뮬레이션을 껐습니다.')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-app]');if(b){lastAppButton=b;openApp(b.dataset.app)}});
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>showPage(Number(b.dataset.page)));
$('#back').onclick=()=>home(true);$('#done').onclick=()=>home(true);$('#home-button').onclick=()=>home(true);$('#unlock').onclick=()=>home();$('#control-button').onclick=openControl;$('#close-control').onclick=closeControl;$('#lock-button').onclick=lock;
const audio=$('#music-audio');let audioUrl=null;const bundledTrack=window.PhoneBundledTrack;let musicBundled=false;let musicGeneration=0,musicStored=false,musicRestoring=true,musicStarting=false,musicNeedsTap=false,musicPlaybackError=false;audio.volume=Number($('#volume').value)/100;
function paintMusicArtwork(root=document){
 if(!bundledTrack?.cover)return;
 root.querySelectorAll('.track-art,.track-art-small').forEach(element=>{
  const image=document.createElement('img');image.src=bundledTrack.cover;image.alt='오반 — 어떻게 지내 앨범 커버';image.draggable=false;element.replaceChildren(image);element.classList.add('has-cover');
  if(element.classList.contains('track-art'))element.setAttribute('aria-label','어떻게 지내 앨범 커버');
 });
}
function connectBundledMusic(){
 ++musicGeneration;musicBundled=true;musicRestoring=false;musicStored=false;musicNeedsTap=false;musicPlaybackError=false;
 audio.pause();if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=null;audio.src=bundledTrack.audio;audio.load();syncMusic();requestMusicPlayback();
}
function formatMusicTime(seconds){if(!Number.isFinite(seconds))return '0:00';return `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`}
function renderMusic(container){
 $('#app').classList.add('music-app');
 container.innerHTML=`<div class="music-library-heading"><span>보관함</span><small>${story.owner}의 음악</small></div><button id="music-track" class="music-track-row" aria-label="어떻게 지내 곡 정보"><span class="track-art-small" aria-hidden="true">OVAN</span><span><strong>${story.song.title}</strong><small>${story.song.artist}</small></span><span class="music-track-selected">♪</span></button><section class="music-player" aria-label="지금 재생 중"><div class="track-art" role="img" aria-label="곡 제목으로 구성한 임시 아트워크"><span>OVAN</span><strong>어떻게<br>지내</strong><small>양정원의 보관함</small></div><div class="music-track-title"><div><h1>${story.song.title}</h1><p>${story.song.artist}</p></div><span class="music-heart" aria-label="보관함에 추가됨">♥</span></div><input id="music-seek" class="music-seek" type="range" min="0" max="0" value="0" step="0.1" aria-label="재생 위치" disabled><div class="music-times"><span id="music-elapsed">0:00</span><span id="music-duration">—:—</span></div><div class="music-controls"><button id="music-rewind" aria-label="10초 뒤로">${symbols.symbol('previous')}</button><button id="music-play" aria-label="음원 파일 연결 후 재생">${symbols.symbol('play')}</button><button id="music-forward" aria-label="10초 앞으로">${symbols.symbol('next')}</button><button id="music-repeat" aria-label="한 곡 반복" aria-pressed="false">${symbols.symbol('repeat')}</button></div><p id="music-status" class="music-status" role="status"></p><div class="music-actions"><label class="audio-file-button" for="music-file">음원 파일 연결<input id="music-file" type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac"></label><a id="music-service" target="_blank" rel="noopener noreferrer">Apple Music에서 찾기 ↗</a></div><button id="music-disconnect" class="music-disconnect" hidden>연결한 음원 지우기</button><p id="music-source-note" class="music-source-note">처음 한 번 음원 파일을 연결해 주세요.</p></section>`;
 paintMusicArtwork(container);$('#music-service').href=story.song.searchUrl;$('#music-disconnect').onclick=disconnectMusic;
 $('#music-track').onclick=()=>container.querySelector('.music-player').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 $('#music-play').onclick=toggleMusic;$('#music-rewind').onclick=()=>seekMusic(-10);$('#music-forward').onclick=()=>seekMusic(10);
 $('#music-repeat').onclick=()=>{audio.loop=!audio.loop;syncMusic()};
 $('#music-seek').oninput=e=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,Number(e.target.value));syncMusic()};
 $('#music-file').onchange=e=>{
  const file=e.target.files?.[0];if(!file)return;
  if(file.type&&!file.type.startsWith('audio/')&&!/\.(mp3|m4a|wav|ogg|aac)$/i.test(file.name)){toast('재생할 수 있는 음원 파일을 선택해 주세요.');return}
  connectMusic(file,true);
 };
 syncMusic();
}
function openMusicStorage(){
 return new Promise((resolve,reject)=>{
  if(!window.indexedDB){reject(new Error('Storage unavailable'));return}
  const request=indexedDB.open('yang-jeongwon-phone-media',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('tracks');
  request.onsuccess=()=>{request.result.onversionchange=()=>request.result.close();resolve(request.result)};
  request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Storage blocked'));
 });
}
async function readStoredMusic(){
 const database=await openMusicStorage();
 return new Promise((resolve,reject)=>{const transaction=database.transaction('tracks','readonly');const request=transaction.objectStore('tracks').get('ovan-how-are-you');let file;
  request.onsuccess=()=>file=request.result;transaction.oncomplete=()=>{database.close();resolve(file)};transaction.onerror=transaction.onabort=()=>{database.close();reject(transaction.error)};
 });
}
async function writeStoredMusic(file,generation){
 const database=await openMusicStorage();
 if(generation!==musicGeneration){database.close();return false}
 return new Promise((resolve,reject)=>{const transaction=database.transaction('tracks','readwrite');const store=transaction.objectStore('tracks');if(file)store.put(file,'ovan-how-are-you');else store.delete('ovan-how-are-you');transaction.oncomplete=()=>{database.close();resolve(true)};transaction.onerror=transaction.onabort=()=>{database.close();reject(transaction.error)};});
}
function connectMusic(file,remember){
 const generation=++musicGeneration;musicBundled=false;musicRestoring=false;musicNeedsTap=false;musicPlaybackError=false;musicStored=!remember;
 audio.pause();if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(file);audio.src=audioUrl;audio.load();syncMusic();
 requestMusicPlayback();
 if(remember)writeStoredMusic(file,generation).then(saved=>{if(generation===musicGeneration){musicStored=saved;syncMusic()}}).catch(()=>{if(generation===musicGeneration){musicStored=false;syncMusic()}});
}
async function requestMusicPlayback(){
 const generation=musicGeneration;musicStarting=true;musicNeedsTap=false;musicPlaybackError=false;syncMusic();
 try{await audio.play()}
 catch(error){if(generation!==musicGeneration)return;if(error.name==='NotAllowedError')musicNeedsTap=true;else if(error.name!=='AbortError')musicPlaybackError=true}
 finally{if(generation===musicGeneration){musicStarting=false;syncMusic()}}
}
async function restoreMusic(){
 if(bundledTrack?.audio){connectBundledMusic();return}
 const generation=musicGeneration;
 try{const file=await readStoredMusic();if(generation===musicGeneration&&file instanceof Blob&&file.size>0)connectMusic(file,false)}
 catch{}
 finally{musicRestoring=false;syncMusic()}
}
function disconnectMusic(){
 const generation=++musicGeneration;musicBundled=false;audio.pause();audio.removeAttribute('src');audio.load();if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=null;musicStored=false;musicNeedsTap=false;musicStarting=false;musicPlaybackError=false;musicRestoring=false;
 if('mediaSession' in navigator){navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none'}
 writeStoredMusic(null,generation).catch(()=>toast('저장한 음원을 지우지 못했습니다. 브라우저의 사이트 데이터를 삭제해 주세요.'));if(bundledTrack?.audio)connectBundledMusic();else syncMusic();
}
function toggleMusic(){
 if(!audio.src){if($('#app').hidden||$('#app-title').textContent!=='음악')openApp('음악');$('#music-file')?.click();return}
 if(!audio.paused){audio.pause();return}
 requestMusicPlayback();
}
function seekMusic(offset){if(!audio.src||!Number.isFinite(audio.duration))return;audio.currentTime=Math.max(0,Math.min(audio.duration,audio.currentTime+offset));syncMusic()}
function syncMusic(){
 const playing=!audio.paused&&!audio.ended,ready=Boolean(audio.src),duration=Number.isFinite(audio.duration)?audio.duration:0;
 for(const id of ['music-play','media-play','lock-music-play']){const button=$('#'+id);if(!button)continue;button.innerHTML=symbols.symbol(playing?'pause':'play');button.setAttribute('aria-label',!ready?'음원 파일 연결 후 재생':playing?'일시 정지':'재생')}
 if($('#music-status'))$('#music-status').textContent=audio.error||musicPlaybackError?'파일을 재생할 수 없습니다. 다른 음원을 연결해 주세요.':musicRestoring?'저장한 음원을 확인하고 있어요…':!ready?'아래에서 MP3 · M4A 파일을 연결해 주세요.':playing?'재생 중':musicNeedsTap?'화면을 한 번 누르면 음악이 시작돼요.':musicStarting?'재생을 준비하고 있어요…':audio.ended?'재생 완료':'일시 정지됨';
 if($('#music-source-note')){$('#music-source-note').hidden=musicBundled;$('#music-source-note').textContent=!ready?'한 번 연결한 음원은 이 브라우저에 저장합니다.':musicStored?'이 브라우저에 저장되었습니다. 서버로 전송하지 않습니다.':'브라우저에 저장되지 않아 현재 화면에서만 재생됩니다.'}
 if($('.music-actions'))$('.music-actions').hidden=musicBundled;
 if($('#music-disconnect'))$('#music-disconnect').hidden=!ready||musicBundled;
 if($('#music-play'))$('#music-play').classList.toggle('needs-tap',musicNeedsTap);

 if($('#music-seek')){$('#music-seek').disabled=!duration;$('#music-seek').max=String(duration);$('#music-seek').value=String(audio.currentTime||0);$('#music-elapsed').textContent=formatMusicTime(audio.currentTime);$('#music-duration').textContent=duration?formatMusicTime(duration):'—:—';$('#music-repeat').setAttribute('aria-pressed',String(audio.loop))}
 for(const id of ['music-rewind','music-forward','lock-music-back','lock-music-next'])if($('#'+id))$('#'+id).disabled=!duration;
 $('#lock-music').hidden=!ready;
 $('#control-song-title').textContent=story.song.title;
 if('mediaSession' in navigator&&ready&&typeof MediaMetadata!=='undefined'){if(!navigator.mediaSession.metadata)navigator.mediaSession.metadata=new MediaMetadata({title:story.song.title,artist:story.song.artist,album:bundledTrack?.album||'',artwork:bundledTrack?.cover?[{src:bundledTrack.cover,sizes:'500x500',type:'image/jpeg'}]:[]});navigator.mediaSession.playbackState=playing?'playing':'paused'}
}
['play','pause','timeupdate','loadedmetadata','durationchange','ended','error','emptied'].forEach(event=>audio.addEventListener(event,syncMusic));
$('#media-open').onclick=()=>openApp('음악');$('#lock-music-open').onclick=()=>openApp('음악');$('#lock-music-play').onclick=toggleMusic;$('#lock-music-back').onclick=()=>seekMusic(-10);$('#lock-music-next').onclick=()=>seekMusic(10);

document.querySelectorAll('.toggle').forEach(b=>b.onclick=()=>toggleControl(b));$('#flashlight').onclick=flashlight;$('#control-torch').onclick=flashlight;$('#mirror').onclick=()=>toast('실제 화면 미러링은 연결되지 않은 데모입니다.');$('#media-play').onclick=toggleMusic;
$('#brightness').oninput=e=>{const value=Number(e.target.value);$('.phone').style.setProperty('--dim',String(1-value/100));e.target.parentElement.style.background=`linear-gradient(to top,#fffffff0 ${value}%,#ffffff15 ${value}%)`};$('#volume').oninput=e=>{e.target.parentElement.style.background=`linear-gradient(to top,#fffffff0 ${e.target.value}%,#ffffff15 ${e.target.value}%)`;audio.volume=Number(e.target.value)/100};
$('#search').onclick=()=>openApp('검색');$('#fullscreen').onclick=async()=>{try{if(!document.documentElement.requestFullscreen)throw Error();await document.documentElement.requestFullscreen();closeControl()}catch{toast('Safari에서는 공유 → 홈 화면에 추가 후 실행해 주세요.')}};
let touchStart=null;$('.phone').addEventListener('touchstart',e=>{const t=e.changedTouches[0],rect=$('.phone').getBoundingClientRect();touchStart={x:t.clientX,y:t.clientY,localY:t.clientY-rect.top,right:rect.right-t.clientX,height:rect.height}},{passive:true});$('.phone').addEventListener('touchend',e=>{if(!touchStart)return;const t=e.changedTouches[0],dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;if(touchStart.localY<90&&touchStart.right<100&&dy>55)openControl();else if(touchStart.localY>touchStart.height-50&&dy< -50)home();else if(!$('#lock').hidden&&dy< -50)home();else if(!$('#home').hidden&&$('#control').hidden&&Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)showPage(dx<0?1:0);touchStart=null},{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#customize').hidden)closeCustomize();else if(!$('#control').hidden)closeControl();else home(true)}if(!$('#home').hidden&&$('#control').hidden&&$('#customize').hidden&&['ArrowLeft','ArrowRight'].includes(e.key))showPage(e.key==='ArrowRight'?1:0)});

function openCustomize(){home();['home','app','lock'].forEach(id=>$('#'+id).inert=true);$('#customize').hidden=false;applyAppearance();$('#close-customize').focus()}
function closeCustomize(){$('#customize').hidden=true;['home','app','lock'].forEach(id=>$('#'+id).inert=false);$('#search').focus()}
$('#close-customize').onclick=closeCustomize;
document.querySelectorAll('[data-appearance]').forEach(button=>button.onclick=()=>{iconAppearance=button.dataset.appearance;applyAppearance();showPage(pageIndex);$('#dock').replaceChildren(...dock.map(makeIcon));saveAppearance()});
document.querySelectorAll('[data-icon-size]').forEach(button=>button.onclick=()=>{iconSize=button.dataset.iconSize;applyAppearance();saveAppearance()});
$('#customize').addEventListener('keydown',event=>{if(event.key==='Tab'){const buttons=[...$('#customize').querySelectorAll('button')];if(event.shiftKey&&document.activeElement===buttons[0]){event.preventDefault();buttons.at(-1).focus()}else if(!event.shiftKey&&document.activeElement===buttons.at(-1)){event.preventDefault();buttons[0].focus()}}});
let holdPoint=null;
$('#home').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;holdPoint={x:e.clientX,y:e.clientY};holdTimer=setTimeout(openCustomize,650)});
$('#home').addEventListener('pointermove',e=>{if(holdPoint&&Math.hypot(e.clientX-holdPoint.x,e.clientY-holdPoint.y)>10)clearTimeout(holdTimer)});
['pointerup','pointercancel','pointerleave'].forEach(type=>$('#home').addEventListener(type,()=>{clearTimeout(holdTimer);holdPoint=null}));
$('#home').addEventListener('contextmenu',e=>{if(!e.target.closest('button')){e.preventDefault();openCustomize()}});
applyAppearance();

document.addEventListener('pointerup',event=>{if(musicNeedsTap&&audio.src&&!event.target.closest('button,a,input,label'))requestMusicPlayback()},{passive:true});
showPage(0);setInterval(tick,1000);openApp('음악');paintMusicArtwork();syncMusic();restoreMusic();
