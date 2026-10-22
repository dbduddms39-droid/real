'use strict';
const $=s=>document.querySelector(s);
const symbols=window.PhoneIcons;
const story={owner:'양정원',initials:'정원',birthday:{title:'지우 생일',month:9,day:7},song:{title:'어떻게 지내',artist:'오반',searchUrl:'https://music.apple.com/kr/search?term='+encodeURIComponent('오반 어떻게 지내')}};
function paintSymbols(root=document){root.querySelectorAll('[data-symbol]').forEach(el=>el.innerHTML=symbols.symbol(el.dataset.symbol))}
paintSymbols();
const pages=[['FaceTime','캘린더','사진','카메라','메일','메모','미리 알림','시계','뉴스','TV','팟캐스트','App Store','지도','건강','지갑','설정'],['계산기','파일','단축어','연락처','음악','도서','날씨']];
const dock=['전화','Safari','메시지','음악'];const allApps=[...new Set([...pages.flat(),...dock])];let pageIndex=0;let interval;let toastTimer;let holdTimer;let note='';let lastAppButton=null;
let introFrame=null,introVisibleSince=null;
let appHistory=[],customizeReturnApp=null;
let iconAppearance='light',iconSize='small';
try{note=localStorage.getItem('my-phone-note')||'';const saved=JSON.parse(localStorage.getItem('my-phone-appearance')||'{}');if(['light','dark','clear'].includes(saved.appearance))iconAppearance=saved.appearance;if(['small','large'].includes(saved.size))iconSize=saved.size}catch{}
function applyAppearance(){const phone=$('.phone');phone.classList.remove('theme-dark','theme-clear','icons-large');if(iconAppearance!=='light')phone.classList.add('theme-'+iconAppearance);if(iconSize==='large')phone.classList.add('icons-large');document.querySelectorAll('[data-appearance]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.appearance===iconAppearance)));document.querySelectorAll('[data-icon-size]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.iconSize===iconSize)))}
function saveAppearance(){try{localStorage.setItem('my-phone-appearance',JSON.stringify({appearance:iconAppearance,size:iconSize}))}catch{toast('사용자화 설정을 저장할 수 없어 현재 화면에만 적용합니다.')}}

function makeIcon(name){const b=document.createElement('button');b.className='app-icon';b.dataset.app=name;b.setAttribute('aria-label',name);b.innerHTML=`<span class="icon">${symbols.app(name,iconAppearance)}</span><span class="app-label">${name}</span>`;return b}
function showPage(index){pageIndex=index;$('#apps').replaceChildren(...pages[index].map(makeIcon));document.querySelectorAll('[data-page]').forEach(b=>{const selected=Number(b.dataset.page)===index;b.classList.toggle('selected',selected);b.setAttribute('aria-current',selected?'page':'false')});tick()}
dock.forEach(name=>$('#dock').append(makeIcon(name)));
function toast(text){$('#toast').textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').textContent='',4500)}
function cancelMusicIntro(){cancelAnimationFrame(introFrame);introFrame=null;introVisibleSince=null;$('#dock [data-app="음악"] .icon')?.classList.remove('intro-tap')}
function home(restore=false,keepHistory=false){phoneCallCleanup();phoneCallCleanup=()=>{};if(!keepHistory)appHistory=[];cancelMusicIntro();clearTimeout(holdTimer);$('#customize').hidden=true;clearInterval(interval);$('#app').hidden=true;$('#control').hidden=true;$('#lock').hidden=true;$('#home').hidden=false;['home','app','lock'].forEach(id=>$('#'+id).inert=false);if(restore&&lastAppButton?.isConnected)lastAppButton.focus()}
function openControl(){cancelMusicIntro();$('#customize').hidden=true;['home','app','lock'].forEach(id=>$('#'+id).inert=true);$('#control').hidden=false;$('#close-control').focus()}
function closeControl(){['home','app','lock'].forEach(id=>$('#'+id).inert=false);$('#control').hidden=true;$('#control-button').focus()}
function goBack(){
 cancelMusicIntro();
 if(!$('#customize').hidden){closeCustomize();return}
 if(!$('#control').hidden){closeControl();return}
 if(!$('#lock').hidden){return}
 if(!$('#app').hidden){
  const nestedBack=$('#app-content .photos-back, #app-content .messages-back, #app-content .phone-call-end, #app-content .safari-internal-back:not(:disabled)');
  if(nestedBack){nestedBack.click();return}
  if(appHistory.length){openApp(appHistory.pop(),true);return}
  home(true);return;
 }
 if(pageIndex>0)showPage(0);
}

// Mobile browser Back (including Android system Back and iOS browser history gestures)
// should navigate within the phone before leaving the website.
// Keep one guard entry, rather than adding an entry for every app tap.
let nativeBackGuardArmed=false;
const nativeBackGuardKey='stillSeptemberBackGuard';
function armNativeBackGuard(){
 if(nativeBackGuardArmed)return;
 try{
  const currentState=history.state&&typeof history.state==='object'?history.state:{};
  history.pushState({...currentState,[nativeBackGuardKey]:true},'',location.href);
  nativeBackGuardArmed=true;
 }catch{
  // Some embedded browsers disable the History API. In-page Home remains usable.
 }
}
function hasInternalBackTarget(){
 return !$('#customize').hidden||!$('#control').hidden||!$('#app').hidden||pageIndex>0;
}
window.addEventListener('popstate',()=>{
 if(!nativeBackGuardArmed)return;
 nativeBackGuardArmed=false;
 if(hasInternalBackTarget()){
  goBack();
  armNativeBackGuard();
 }else{
  // At the home screen, follow the browser's real history instead of trapping Back.
  history.back();
 }
});
armNativeBackGuard();
function tick(){const now=new Date();const time=`${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;$('#status-time').textContent=time;$('#lock-time').textContent=time;$('#lock-date').textContent=now.toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'long'});$('#widget-date').textContent=now.getDate();$('#widget-day').textContent=now.toLocaleDateString('ko-KR',{weekday:'long'});const transforms={hour:(now.getHours()%12)*30+now.getMinutes()/2,minute:now.getMinutes()*6,second:now.getSeconds()*6};for(const [hand,angle]of Object.entries(transforms))document.querySelectorAll(`[data-clock-hand="${hand}"]`).forEach(el=>el.setAttribute('transform',`rotate(${angle} 50 50)`));document.querySelectorAll('[data-calendar-date]').forEach(el=>el.textContent=now.getDate());document.querySelectorAll('[data-calendar-weekday]').forEach(el=>el.textContent=now.toLocaleDateString('ko-KR',{weekday:'long'}))}

function placeholder(name){const content=document.createElement('div');content.className='app-placeholder';content.innerHTML=`<span class="icon">${symbols.app(name)}</span><h2></h2><p class="muted"></p>`;content.querySelector('h2').textContent=name;const descriptions={'카메라':'카메라 화면은 준비 중입니다. 이 데모는 카메라 권한을 요청하지 않습니다.','Safari':'브라우저 화면 미리보기입니다. 실제 웹 탐색 기능은 아직 연결되지 않았습니다.','메일':'메일 계정이 연결되지 않았습니다.','메시지':'아직 대화가 없습니다. 실제 문자 발송 기능은 연결되지 않았습니다.','FaceTime':'FaceTime 스타일 미리보기입니다. 실제 영상 통화는 지원하지 않습니다.','음악':'라이브러리가 비어 있습니다. 재생할 음악이 연결되지 않았습니다.','App Store':'App Store 화면 미리보기입니다. 앱 설치는 지원하지 않습니다.'};content.querySelector('p').textContent=descriptions[name]||'기본 앱 화면입니다. 실제 서비스와 연결되는 기능은 아직 준비 중입니다.';return content}

// The first visit plays a tiny story in Reminders. Saved items survive reopening.
const reminderStorageKey='stillSeptemberRemindersV1';
let reminderIntroPlayed=false;

// Fictional text history kept inside the phone; no SMS is sent or received.
function renderMessages(container){
 $('#app').classList.add('messages-app');
 // Jiwoo is two years younger; she calls Jeongwon '오빠' in their private messages.
 const conversations=[
  {date:'8월 24일',messages:[
   ['received','오빠 마음이 밥 줬어?'],
   ['sent','응 물도 새로 갈아줬어'],
   ['received','오 다행이다'],
   ['sent','뭘 다행이야 나도 잘 챙겨'],
   ['received','알아 ㅎㅎ 그냥 물어본 거지'],
   ['sent','근데 아까 밥 주니까 엄청 좋아하더라'],
   ['received','그치? 밥 먹을 때 제일 신나 보여'],
   ['sent','누구 닮아서 그런가'],
   ['received','나? ㅎㅎ'],
   ['sent','응'],
   ['received','그럴 수도 있겠다 ㅎㅎ']
  ]},
  {date:'8월 27일',messages:[
   ['received','오빠 뭐해?'],
   ['sent','이제 집 가는 중'],
   ['received','오늘도 늦었네. 저녁은 먹었어?'],
   ['sent','아직. 라면 먹을까 해'],
   ['received','또 라면이야?'],
   ['sent','간단하잖아'],
   ['received','그건 그렇지만 밥도 좀 챙겨 먹어'],
   ['sent','너는 먹었어?'],
   ['received','응 아까 떡볶이 먹었어'],
   ['sent','내 거는'],
   ['received','다 먹었는데'],
   ['sent','너무하네'],
   ['received','다음엔 같이 먹자. 내가 사줄게 ㅎㅎ']
  ]},
  {date:'8월 31일',messages:[
   ['received','오빠 내일 몇 시쯤 끝나?'],
   ['sent','아마 8시쯤'],
   ['received','그럼 끝나고 통화할 수 있어?'],
   ['sent','응 끝나면 연락할게'],
   ['received','좋아 ㅎㅎ'],
   ['received','너무 늦으면 미리 말해줘'],
   ['sent','알겠어'],
   ['received','조심히 들어가고!']
  ]},
  {date:'9월 1일',messages:[
   ['received','오빠 아직 안 끝났어?'],
   ['received','나 연락 기다리고 있었는데'],
   ['sent','미안 이제 봤어'],
   ['received','끝나면 연락 준다고 했잖아'],
   ['sent','연습이 늦게 끝났어'],
   ['received','늦어지는 건 괜찮아'],
   ['received','근데 기다리는 사람한테 한마디는 해줄 수 있잖아'],
   ['sent','맞아 미안'],
   ['sent','끝나고 정신이 없어서'],
   ['received','그럴 수 있는 거 알아'],
   ['received','근데 오늘은 좀 서운했어'],
   ['sent','지우야'],
   ['sent','내가 방금 정신없었다고 한 것도 핑계처럼 들렸겠다'],
   ['sent','기다리게 해놓고 그 말부터 해서 미안해'],
   ['received','나도 오빠 바쁜 거 알아서 이해하려고 하는데'],
   ['received','기다리다가 연락이 없으니까 괜히 속상했어'],
   ['sent','다음에는 늦어지면 꼭 먼저 말할게'],
   ['received','응 그럼 됐어'],
   ['sent','아직 화났어?'],
   ['received','조금?'],
   ['sent','얼마나'],
   ['received',{type:'photo',photoId:'photo-15',alt:'지우가 보낸 셀카'}],
   ['received','지금 이 표정이야'],
   ['sent','ㅋㅋㅋㅋ'],
   ['sent','그 와중에 귀엽네'],
   ['received','나 진지한데'],
   ['sent','알아. 내가 잘못한 것도 알고'],
   ['sent','근데 사진 보고 웃은 건 어쩔 수 없었어'],
   ['received','나도 오빠 답장 보고 웃었네'],
   ['sent','내일 맛있는 거 먹으러 가자. 내가 살게'],
   ['received','좋아. 대신 다음에는 기다리게 하지 마'],
   ['sent','응 약속'],
   ['sent','아 사진 저장했어'],
   ['received','그걸 또 저장했어? ㅋㅋ'],
   ['sent','응 귀여워서'],
   ['received','참나 ㅎㅎ']
  ]},
  {date:'9월 3일',messages:[
   ['sent','집 가는 길에 한정선 지나갔어'],
   ['received','한정선?'],
   ['received','나 거기 좋아하는 거 기억했네 ㅎㅎ'],
   ['sent','당연하지'],
   ['received','그냥 그게 좀 좋다'],
   ['sent','뭐가'],
   ['received','오빠가 내가 좋아하는 거 기억하고 있는 거'],
   ['sent','그건 기억하지'],
   ['received','고마워 ㅎㅎ'],
   ['sent','아 그리고 사왔어'],
   ['received','진짜?'],
   ['received','오빠 고마워! 지금 바로 먹고 싶다'],
   ['sent','그렇게 좋아?'],
   ['received','응. 한정선도 좋은데 오빠가 사온 거라 더 좋아'],
   ['sent','귀엽네'],
   ['received','뭐야 ㅎㅎ 그냥 좋다고 말한 건데'],
   ['sent','그게 귀엽다고'],
   ['received','알았어 ㅎㅎ 빨리 와']
  ]},
  {date:'9월 6일',messages:[
   ['sent','내일 오후에 시간 비워'],
   ['received','왜? 뭐 하게?'],
   ['sent','그냥 비워둬'],
   ['received','오빠 내일 무슨 날인지 알지?'],
   ['sent','알지'],
   ['received','모르는 척하길래 조금 걱정했어'],
   ['sent','내가 그걸 어떻게 잊어'],
   ['received','ㅎㅎ 알겠어'],
   ['received','사실 며칠 전부터 좀 기대하고 있었어'],
   ['sent','너무 기대하면 부담되는데'],
   ['received','괜찮아. 오빠랑 같이 있는 것만으로도 좋아'],
   ['sent','그런 말을 그렇게 아무렇지 않게 하네'],
   ['received','진짜니까 ㅎㅎ']
  ]},
  {date:'9월 7일',messages:[
   ['received','오빠 나 집 잘 들어왔어'],
   ['sent','오늘 많이 걸었지'],
   ['received','응 발은 좀 아픈데'],
   ['received','오늘 진짜 좋았어'],
   ['sent','다행이다'],
   ['received','아까는 정신없어서 제대로 말 못 했는데'],
   ['received','하루 종일 신경 써준 거 다 느껴졌어'],
   ['received','고마워 오빠'],
   ['sent','네 생일이니까'],
   ['received','그래도 고마운 건 고마운 거지 ㅎㅎ'],
   ['sent','생일 축하해 지우야'],
   ['received','고마워 🤍'],
   ['received','오늘 오래 기억할 것 같아'],
   ['sent','나도'],
   ['received','집에 와서 사진 다시 보는데 계속 웃게 돼'],
   ['sent','귀엽네'],
   ['received','왜 또 귀엽대'],
   ['sent','그렇게 좋았다고 하니까'],
   ['received','응 정말 좋았어']
  ]},
  {date:'9월 8일',messages:[
   ['received','오빠 어제 사진 보내줄 수 있어?'],
   ['sent','뭐부터'],
   ['received','같이 찍은 것부터 ㅎㅎ'],
   ['sent','알겠어'],
   ['received','아까 사진 보다가 어제 생각났어'],
   ['sent','벌써?'],
   ['received','응, 어제 너무 즐거웠잖아'],
   ['received','사진도 많이 남아서 다행인 것 같아'],
   ['sent','그렇게 좋아해주니까 나도 좋다'],
   ['received','고마워. 오래오래 간직할게']
  ]},
  {date:'9월 10일',messages:[
   ['received','오빠 지금 뭐 해?'],
   ['sent','씻으려고'],
   ['received','아 그럼 씻고 연락해 ㅎㅎ'],
   ['sent','왜 무슨 일 있어?'],
   ['received','아니 그냥 목소리 듣고 싶어서'],
   ['sent','나도 보고 싶네'],
   ['received','나도 ㅎㅎ'],
   ['sent','지난번에 봤는데 벌써?'],
   ['received','그러게 ㅎㅎ'],
   ['received','요즘 같이 있으면 시간이 너무 빨리 가'],
   ['sent','내가 그렇게 좋아?'],
   ['received','응 많이'],
   ['sent','그런 대답은 반칙인데'],
   ['received','오빠가 먼저 물어봤잖아'],
   ['sent','귀여워'],
   ['received','ㅎㅎ 얼른 씻고 전화해']
  ]},
  {date:'9월 13일',messages:[
   ['received','오빠 지난번에 말한 전시 있잖아'],
   ['sent','성수에서 하는 거?'],
   ['received','응 그거 아직 하더라 ㅎㅎ'],
   ['sent','가고 싶어?'],
   ['received','응. 오빠랑 같이 보면 좋을 것 같아서'],
   ['sent','그럼 쉬는 날 맞춰보자'],
   ['received','좋아. 끝나고 서울숲도 걷자'],
   ['sent','이번에도 많이 걷겠네'],
   ['received','이번엔 편한 신발 신을 거야'],
   ['sent','지난번엔 안 그랬나'],
   ['received','그때는 예쁜 신발 신고 싶었지'],
   ['sent','너는 뭘 신어도 예뻐'],
   ['received','뭐야 갑자기 ㅎㅎ'],
   ['sent','그냥'],
   ['received','고마워. 나중에 일정 알려줘'],
   ['sent','응 내일 확인해볼게'],
   ['received','잘 자 오빠'],
   ['sent','너도 잘 자']
  ]},
  {date:'9월 16일',messages:[
   ['received','오빠 이번 주 토요일은 시간 괜찮아?'],
   ['sent','응 오후에는 괜찮아'],
   ['received','그럼 지난번에 말한 전시 보러 갈까?'],
   ['sent','좋아. 내가 예약할게'],
   ['received','사실 방금 예매했어 ㅎㅎ'],
   ['sent','벌써?'],
   ['received','응. 시간 맞는 거 있길래'],
   ['sent','잘했네'],
   ['received','끝나고 서울숲도 가자'],
   ['sent','이번엔 편한 신발 신는다며'],
   ['received','기억하고 있었네 ㅎㅎ'],
   ['sent','그럼. 토요일에 보자'],
   ['received','응 기대된다 ㅎㅎ']
  ]},
  {date:'9월 19일',messages:[
   ['sent','어제 찍은 사진 봤어?'],
   ['received','응! 같이 나온 사진 생각보다 잘 나왔더라'],
   ['sent','너는 다 잘 나왔어'],
   ['received','오빠도 잘 나왔어 ㅋㅋ'],
   ['sent','네가 그렇게 말하니까 믿어볼게'],
   ['received','진짜인데 ㅎㅎ'],
   ['received','어제 같이 전시 보면서 얘기한 것도 좋았어'],
   ['sent','나도'],
   ['received','다음에 또 가자'],
   ['sent','그래 그러자']
  ]},
  {date:'9월 22일',messages:[
   ['received','오빠 이번 주에는 언제 볼 수 있어?'],
   ['sent','이번 주는 좀 애매할 것 같아'],
   ['received','아 그렇구나'],
   ['sent','일정 좀 보고 말해줄게'],
   ['received','응 알겠어'],
   ['sent','미안'],
   ['received','미안해할 건 아니야 ㅎㅎ'],
   ['received','그냥 얼굴 보고 싶어서 물어봤어'],
   ['sent','나도 보고 싶어'],
   ['received','응. 시간 맞으면 보자']
  ]},
  {date:'9월 25일',messages:[
   ['sent','아까 전화 못 받았네'],
   ['received','응 잠깐 얘기하고 싶었어'],
   ['sent','지금은 돼?'],
   ['received','나 지금 밖이라서'],
   ['sent','그럼 들어가서 전화할까?'],
   ['received','응 그런데 요즘 자꾸 시간이 안 맞네'],
   ['sent','그러게'],
   ['received','오빠 우리 만나서 얘기 좀 할 수 있을까?'],
   ['sent','응 나도 하고 싶은 얘기 있어'],
   ['received','그럼 일요일에 보자'],
   ['sent','응 시간 비워둘게']
  ]},
  {date:'9월 28일',messages:[
   ['received','오빠 집에 잘 들어갔어?'],
   ['sent','응. 너도?'],
   ['received','응 나도 방금 들어왔어'],
   ['sent','아까는 아무 말도 못 했는데'],
   ['sent','집에 오니까 자꾸 네 생각만 나'],
   ['received','나도 아직 실감이 안 나'],
   ['sent','지우야'],
   ['sent','나 아직 너 많이 좋아해'],
   ['sent','우리 정말 이렇게 끝내야 해?'],
   ['received','오빠'],
   ['received','나도 아무렇지 않아서 그런 말 한 거 아니야'],
   ['sent','알아'],
   ['sent','그래도 한 번만 더 해보면 안 될까'],
   ['sent','내가 놓치고 있었던 것들 이제라도 고칠게'],
   ['received','오빠가 노력 안 한 게 아니잖아'],
   ['received','우리 둘 다 계속 노력했는데도 힘들었던 거고'],
   ['sent','나는 아직 정리를 못 하겠어'],
   ['sent','너한테 연락 안 하고 지내는 게 잘 상상이 안 돼'],
   ['received','나도 그럴 것 같아'],
   ['received','그렇지만 다시 돌아가면 같은 이유로 서로 힘들어질 것 같아'],
   ['sent','오늘 그냥 보내지 말았어야 했는데'],
   ['received','오빠'],
   ['received','나도 오래 고민했어'],
   ['sent','알아. 자꾸 붙잡아서 미안해'],
   ['received','미안해하지 않았으면 좋겠어'],
   ['received','오빠랑 함께한 시간들은 나한테 정말 소중했어'],
   ['sent','나한테도'],
   ['sent','정말 많이 좋아했어'],
   ['received','나도 많이 좋아했어'],
   ['received','잘 지내 오빠'],
   ['sent','너도 잘 지내']
  ]}
 ];
 function showInbox(){
  $('#app-title').textContent='메시지';
  container.innerHTML='<div class="messages-inbox"><div class="messages-inbox-nav"><button type="button" class="messages-home">‹ 홈</button><span>편집</span></div><h1>메시지</h1><div class="messages-search-line" aria-hidden="true">⌕　검색</div><button class="messages-conversation" type="button" aria-label="지우와의 대화 열기"><span class="messages-avatar">지</span><span class="messages-summary"><strong>지우</strong><span class="messages-preview"></span></span><span class="messages-conversation-meta"><small></small><span aria-hidden="true">›</span></span></button><p class="messages-demo-caption">이 휴대폰 속 대화는 이야기의 일부입니다.</p></div>';
  const latest=conversations[conversations.length-1];
  const lastItem=latest.messages[latest.messages.length-1][1];
  container.querySelector('.messages-preview').textContent=typeof lastItem==='string'?lastItem:'사진';
  container.querySelector('.messages-conversation-meta small').textContent=latest.date;
  container.querySelector('.messages-home').onclick=()=>home(true);
  container.querySelector('.messages-conversation').onclick=showThread;
  container.scrollTop=0;
 }
 function showThread(){
  $('#app-title').textContent='지우';
  container.innerHTML='<div class="messages-thread"><header class="messages-thread-header"><button type="button" class="messages-back">‹ 메시지</button><div class="messages-thread-person"><span class="messages-avatar">지</span><strong>지우</strong></div><span class="messages-thread-spacer" aria-hidden="true"></span></header><div class="messages-chat" role="log" aria-label="지우와의 지난 메시지" aria-live="off"></div><div class="messages-compose" aria-label="메시지 입력 시뮬레이션"><span class="messages-compose-plus" aria-hidden="true">＋</span><span class="messages-compose-placeholder">문자 메시지</span><span class="messages-compose-send" aria-hidden="true">↑</span></div></div>';
  const chat=container.querySelector('.messages-chat');
  for(const group of conversations){
   const divider=document.createElement('div');
   divider.className='messages-date';
   if(group.date==='9월 1일')divider.id='messages-make-up-day';
   divider.textContent=group.date;
   chat.append(divider);
   for(const [direction,message] of group.messages){
    if(typeof message==='object'&&message.type==='photo'){
     // The selfie reuses an existing gallery image instead of embedding a duplicate.
     const photo=window.PhonePhotoAssets?.photos?.find(item=>item.id===message.photoId);
     const wrap=document.createElement('div');
     wrap.className='messages-photo-bubble '+(direction==='sent'?'is-sent':'is-received');
     if(photo?.src){
      const button=document.createElement('button');
      button.type='button';
      button.className='messages-photo-button';
      button.setAttribute('aria-label','지우가 보낸 셀카 크게 보기');
      const img=document.createElement('img');
      img.src=photo.src;img.alt=message.alt;img.loading='lazy';img.decoding='async';
      button.append(img);wrap.append(button);
      const saved=document.createElement('span');
      saved.className='messages-photo-saved';
      saved.textContent='사진 앱에 저장됨';
      wrap.append(saved);
      button.onclick=()=>{
       const viewer=document.createElement('div');
       viewer.className='messages-photo-viewer';
       viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');
       viewer.setAttribute('aria-label','받은 사진 크게 보기');
       const close=document.createElement('button');
       close.type='button';close.className='messages-photo-close';
       close.textContent='✕ 닫기';close.setAttribute('aria-label','사진 닫기');
       const full=document.createElement('img');
       full.src=photo.src;full.alt=message.alt;
       viewer.append(close,full);
       const dismiss=()=>{viewer.remove();button.focus({preventScroll:true})};
       close.onclick=dismiss;
       viewer.onclick=event=>{if(event.target===viewer)dismiss()};
       viewer.onkeydown=event=>{if(event.key==='Escape'){event.preventDefault();dismiss()}};
       container.querySelector('.messages-thread')?.append(viewer);
       close.focus({preventScroll:true});
      };
     }else{
      const fallback=document.createElement('span');
      fallback.className='messages-photo-fallback';
      fallback.textContent='사진을 불러올 수 없어요';
      wrap.append(fallback);
     }
     chat.append(wrap);
     continue;
    }
    const bubble=document.createElement('div');
    bubble.className='messages-bubble '+(direction==='sent'?'is-sent':'is-received');
    bubble.textContent=message;
    chat.append(bubble);
   }
  }
  const marker=document.createElement('div');
  marker.className='messages-last-status';
  marker.textContent='읽음';
  chat.append(marker);
  container.querySelector('.messages-back').onclick=showInbox;
  chat.scrollTop=chat.scrollHeight;
  container.scrollTop=0;
 }
 showInbox();
}

function renderReminders(container){
 const defaults=[{text:'마음이 밥 주기',checked:false},{text:'불면약 먹기',checked:false}];
 let reminders=null;
 try{
  const stored=JSON.parse(localStorage.getItem(reminderStorageKey)||'null');
  if(Array.isArray(stored)&&stored.length&&stored.length<=100&&stored.every(item=>item&&typeof item.text==='string'&&typeof item.checked==='boolean')){
   reminders=stored.map(item=>({text:item.text.slice(0,120),checked:item.checked}));
  }
 }catch{}
 if(!reminders)reminders=defaults.map(item=>({...item}));
 const save=()=>{try{localStorage.setItem(reminderStorageKey,JSON.stringify(reminders))}catch{}};
 save();
 container.innerHTML='<h1 style="color:#007aff">미리 알림</h1><div class="card reminders-list" id="reminder-list" aria-label="저장된 미리 알림"></div><form id="reminder-form"><label class="muted" for="reminder-input">새로운 미리 알림</label><div class="row"><input class="app-search" id="reminder-input" placeholder="할 일 입력" autocomplete="off" required maxlength="120"><button type="submit">추가</button></div></form><p class="muted">이 브라우저에 자동 저장됩니다.</p>';
 const list=container.querySelector('#reminder-list');
 const form=container.querySelector('#reminder-form');
 const input=container.querySelector('#reminder-input');
 const add=form.querySelector('button');
 const appendReminder=(item,animate=false)=>{
  const row=document.createElement('label');row.className='row reminder-item';
  if(animate)row.classList.add('reminder-appear');
  const check=document.createElement('input');check.type='checkbox';check.checked=item.checked;
  const title=document.createElement('span');title.textContent=item.text;
  row.classList.toggle('checked',item.checked);
  check.onchange=()=>{item.checked=check.checked;row.classList.toggle('checked',check.checked);save()};
  row.append(check,title);list.append(row);
 };
 form.onsubmit=event=>{
  event.preventDefault();
  if(input.readOnly)return;
  const value=input.value.trim();if(!value)return;
  const item={text:value,checked:false};reminders.push(item);appendReminder(item,true);save();input.value='';
 };
 const isFirstStory=!reminderIntroPlayed&&reminders.length===2&&reminders.every((item,index)=>item.text===defaults[index].text);
 if(!isFirstStory){reminders.forEach(item=>appendReminder(item));return}
 reminderIntroPlayed=true;
 input.readOnly=true;add.disabled=true;form.classList.add('reminder-script-active');
 list.setAttribute('aria-busy','true');
 const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const active=()=>document.querySelector('#reminder-form')===form;
 const type=async(text,speed)=>{
  for(const letter of text){
   if(!active())return false;
   input.value+=letter;
   await delay(speed);
  }
  return active();
 };
 async function playStory(){
  await delay(350);
  for(let index=0;index<2;index++){
   if(!active())return;
   if(!await type(reminders[index].text,135))return;
   await delay(390);
   if(!active())return;
   appendReminder(reminders[index],true);
   input.value='';
   await delay(420);
  }
  if(!await type('지우',240))return;
  await delay(900);
  while(input.value){
   if(!active())return;
   input.value=input.value.slice(0,-1);
   await delay(280);
  }
  if(!active())return;
  input.readOnly=false;add.disabled=false;
  form.classList.remove('reminder-script-active');
  list.removeAttribute('aria-busy');
  save();
 }
 playStory();
}


// Fictional speed dial: holding the 1 key opens an in-page call to Jiwoo.
// No telephone number, permission request, or real-world phone call is used.
let phoneCallCleanup=()=>{};
function renderPhone(container){
 const app=document.querySelector('#app');
 const phoneSvg='<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M7.3 2.4c-.6-.6-1.5-.6-2.1-.1L3.5 3.9c-1 1-1.2 2.4-.7 4 2 6 7.1 11.1 13.1 13.1 1.6.5 3 .3 4-.7l1.6-1.7c.5-.6.5-1.5-.1-2.1L18.5 14c-.6-.6-1.5-.7-2.2-.2l-1.6 1.2a17 17 0 0 1-5.7-5.7l1.2-1.6c.5-.7.4-1.6-.2-2.2L7.3 2.4Z"/></svg>';
 const delay=650;
 function showDial(){
  phoneCallCleanup();phoneCallCleanup=()=>{};
  app.classList.remove('call-active');
  container.innerHTML='<div class="dial-display" aria-live="polite"></div><div class="dial" aria-label="전화 키패드"></div><p class="phone-speed-hint">1번을 길게 눌러 보세요 ♡</p><p class="muted" style="text-align:center">전화 화면 체험 · 실제 통화는 연결되지 않습니다.</p>';
  const display=container.querySelector('.dial-display');
  const grid=container.querySelector('.dial');
  const keys=['1','2','3','4','5','6','7','8','9','*','0','#','⌫','통화'];
  const letters=['','ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ','','+',''];
  keys.forEach((key,i)=>{
   const b=document.createElement('button');
   b.type='button';
   b.textContent=key;
   b.setAttribute('aria-label',key==='1'?'1번, 길게 누르면 단축 다이얼':key);
   if(key==='1')b.classList.add('phone-speed-key');
   if(letters[i]){
    const tag=document.createElement('small');tag.textContent=letters[i];b.append(tag);
   }
   if(key==='통화'){b.className='call';b.innerHTML=symbols.app('전화')}
   if(key==='1'){
    let hold=null,activated=false,origin=null;
    const stop=()=>{clearTimeout(hold);hold=null;origin=null};
    const begin=()=>{
     stop();activated=false;
     hold=setTimeout(()=>{hold=null;activated=true;showCall()},delay);
    };
    b.addEventListener('pointerdown',event=>{
     if(event.pointerType==='mouse'&&event.button!==0)return;
     origin={x:event.clientX,y:event.clientY};
     begin();
     origin={x:event.clientX,y:event.clientY};
    });
    b.addEventListener('pointermove',event=>{
     if(origin&&Math.hypot(event.clientX-origin.x,event.clientY-origin.y)>18)stop();
    });
    ['pointerup','pointercancel','pointerleave','lostpointercapture'].forEach(name=>b.addEventListener(name,stop));
    b.addEventListener('keydown',event=>{
     if((event.key==='Enter'||event.key===' ')&&!event.repeat&&!hold)begin();
    });
    b.addEventListener('keyup',event=>{
     if(event.key==='Enter'||event.key===' ')stop();
    });
    b.addEventListener('contextmenu',event=>event.preventDefault());
    b.addEventListener('click',event=>{
     if(activated){event.preventDefault();activated=false;return}
     if(display.textContent.length<18)display.textContent+='1';
    });
    const previousCleanup=phoneCallCleanup;
    phoneCallCleanup=()=>{stop();previousCleanup()};
   }else{
    b.onclick=()=>{
     if(key==='⌫')display.textContent=display.textContent.slice(0,-1);
     else if(key==='통화')toast('실제 통화가 아닌 전화 화면 체험이에요. 1번을 길게 눌러 보세요.');
     else if(display.textContent.length<18)display.textContent+=key;
    };
   }
   grid.append(b);
  });
 }
 function showCall(){
  phoneCallCleanup();phoneCallCleanup=()=>{};
  app.classList.add('call-active');
  container.innerHTML='<section class="phone-call-screen" aria-label="지우에게 전화"><div class="phone-call-top"><span class="phone-call-number">단축 다이얼 1</span><h1>지우</h1><p class="phone-call-status" role="status" aria-live="polite">전화 거는 중...</p></div><div class="phone-call-avatar" aria-hidden="true">지</div><div class="phone-call-bottom"><button class="phone-call-end" type="button" aria-label="통화 종료">'+phoneSvg+'</button><span>통화 종료</span><p>이 화면은 연출입니다. 실제로 전화가 걸리지는 않아요.</p></div></section>';
  const screen=container.querySelector('.phone-call-screen');
  const status=screen.querySelector('.phone-call-status');
  const end=screen.querySelector('.phone-call-end');
  let durationTimer=null,elapsed=0;
  const connect=setTimeout(()=>{
   if(!screen.isConnected||app.hidden)return;
   status.textContent='통화 중 · 00:00';
   durationTimer=setInterval(()=>{
    if(!screen.isConnected||app.hidden)return;
    elapsed++;
    status.textContent='통화 중 · '+String(Math.floor(elapsed/60)).padStart(2,'0')+':'+String(elapsed%60).padStart(2,'0');
   },1000);
  },2200);
  phoneCallCleanup=()=>{clearTimeout(connect);clearInterval(durationTimer)};
  end.onclick=showDial;
  end.focus({preventScroll:true});
 }
 showDial();
}


// A fictional, offline Safari history for the phone's story. It never opens
// invented web destinations or sends a search term to an external service.
// Safari keeps three real-place photo tabs in a quiet, familiar browser UI.
function renderSafari(container){
 $('#app').classList.add('safari-app');
 const places=[
  {id:'hans',title:'한정선 성수점',subtitle:'성수 · 디저트',image:'https://d12zq4w4guyljn.cloudfront.net/750_750_20260203144428_photo1_bec06ee6c4b3.webp',alt:'성수 한정선 가게 외관',note:'지우가 좋아하는 곳',details:'서울 성동구 연무장길 43-1',source:'https://www.diningcode.com/profile.php?rid=sF3RPtaiGrlQ',credit:'사진: 다이닝코드',license:''},
  {id:'forest',title:'서울숲',subtitle:'서울 · 산책',image:'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/Seoul_Forest_%EC%84%9C%EC%9A%B8%EC%88%B2.jpg/960px-Seoul_Forest_%EC%84%9C%EC%9A%B8%EC%88%B2.jpg',alt:'서울숲에 설치된 서울숲 표지 조형물',note:'전시 보고 같이 걷기로 한 곳',details:'서울 성동구 뚝섬로 273',source:'https://commons.wikimedia.org/wiki/File:Seoul_Forest_%EC%84%9C%EC%9A%B8%EC%88%B2.jpg',credit:'사진: Christian Bolz · CC BY-SA 4.0',license:'https://creativecommons.org/licenses/by-sa/4.0/'},
  {id:'gangneung',title:'강릉 경포해변',subtitle:'10월 여행 · 강릉',image:'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Gyeongpo_Beach_1.jpg/960px-Gyeongpo_Beach_1.jpg',alt:'강릉 경포해변의 모래사장과 파도',note:'10월에 가보려고 찾아본 바다',details:'강원특별자치도 강릉시 안현동',source:'https://commons.wikimedia.org/wiki/File:Gyeongpo_Beach_1.jpg',credit:'사진: Christophe95 · CC BY-SA 4.0',license:'https://creativecommons.org/licenses/by-sa/4.0/'},
  {id:'autumn',title:'가을 데이트 코스',subtitle:'서촌 · 청운 · 부암동',image:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Cheongun_Literature_Library_04_(15816765715).jpg?width=960',alt:'가을 단풍에 둘러싸인 청운문학도서관 한옥',note:'서촌 골목 → 청운문학도서관 → 부암동 카페',details:'서울 종로구 청운동·부암동',source:'https://commons.wikimedia.org/wiki/File:Cheongun_Literature_Library_04_(15816765715).jpg',credit:'사진: Korea.net / 전한 · CC BY-SA 2.0',steps:['서촌 골목에서 점심 먹기','청운문학도서관에서 단풍 구경하기','부암동 카페에서 쉬었다 오기']}
 ];
 let tabs=places.map(item=>item.id);
 let history=[{mode:'start'}],position=0;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const place=id=>places.find(p=>p.id===id);
 const image=(p,cls)=>'<img class="'+cls+'" src="'+esc(p.image)+'" alt="'+esc(p.alt)+'" loading="lazy" decoding="async" referrerpolicy="no-referrer">';
 container.innerHTML='<div class="safari-root"><main class="safari-main" aria-label="Safari 페이지"></main><div class="safari-bottom"><div class="safari-address"><span aria-hidden="true">⌕</span><span class="safari-address-label">검색 또는 웹 사이트 이름 입력</span><span aria-hidden="true">↻</span></div><div class="safari-actions"><button type="button" class="safari-go-back safari-internal-back" aria-label="Safari 뒤로 가기">‹</button><button type="button" class="safari-go-forward" aria-label="Safari 앞으로 가기">›</button><button type="button" class="safari-bookmark-action" aria-label="즐겨찾기">☆</button><button type="button" class="safari-tabs-action" aria-label="열린 탭"><span aria-hidden="true">▢</span><span class="safari-tab-count"></span></button></div></div></div>';
 const root=container.querySelector('.safari-root'),main=root.querySelector('.safari-main');
 const address=root.querySelector('.safari-address-label'),count=root.querySelector('.safari-tab-count');
 const back=root.querySelector('.safari-go-back'),forward=root.querySelector('.safari-go-forward');
 function goto(mode,id){
  history=history.slice(0,position+1);
  history.push({mode,id});position++;draw();
 }
 function card(p){
  return '<button type="button" class="safari-photo-row" data-open="'+p.id+'">'+image(p,'safari-photo-thumb')+'<span class="safari-photo-text"><strong>'+esc(p.title)+'</strong><small>'+esc(p.subtitle)+'</small></span><span class="safari-row-arrow" aria-hidden="true">›</span></button>';
 }
 function bindRows(){
  main.querySelectorAll('[data-open]').forEach(button=>button.onclick=()=>goto('page',button.dataset.open));
 }
 function draw(){
  const state=history[position];
  back.disabled=position===0;
  forward.disabled=position===history.length-1;
  count.textContent=String(tabs.length);
  address.textContent=state.mode==='page'?(place(state.id)?.title||'Safari'):'검색 또는 웹 사이트 이름 입력';
  root.classList.toggle('safari-tab-mode',state.mode==='tabs');
  if(state.mode==='start'){
   main.innerHTML='<section class="safari-clean-start"><div class="safari-clean-title">Safari</div><h1>시작 페이지</h1><form class="safari-clean-search"><span>⌕</span><input aria-label="저장된 페이지 검색" placeholder="검색 또는 웹 사이트 이름" autocomplete="off" maxlength="80"></form><h2>즐겨찾기</h2><button type="button" class="safari-clean-folder"><span class="safari-clean-folder-icon">♡</span><span>지우랑 ♡</span><span aria-hidden="true">›</span></button><div class="safari-clean-heading"><h2>최근에 본 페이지</h2></div><div class="safari-clean-rows"></div></section>';
   main.querySelector('.safari-clean-folder').onclick=()=>goto('folder');
   main.querySelector('.safari-clean-rows').innerHTML=places.slice(0,2).map(card).join('');
   bindRows();
   const search=main.querySelector('.safari-clean-search');
   search.onsubmit=e=>{
    e.preventDefault();
    const input=search.querySelector('input'),q=input.value.toLowerCase().trim();
    if(!q)return;
    const match=places.find(p=>(p.title+' '+p.subtitle).toLowerCase().includes(q));
    if(match)goto('page',match.id);
    else{input.setCustomValidity('저장된 페이지에서 찾을 수 없어요.');input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true})}
   };
  }else if(state.mode==='folder'){
   main.innerHTML='<section class="safari-clean-start"><button type="button" class="safari-clean-return">‹ 시작 페이지</button><h1>지우랑 ♡</h1><div class="safari-clean-rows"></div></section>';
   main.querySelector('.safari-clean-return').onclick=()=>goto('start');
   main.querySelector('.safari-clean-rows').innerHTML=places.map(card).join('');
   bindRows();
  }else if(state.mode==='tabs'){
   main.innerHTML='<section class="safari-clean-tabs"><div class="safari-clean-tabs-heading"><button type="button" class="safari-clean-return">‹ 시작 페이지</button><strong>지우랑 ♡</strong><span>'+tabs.length+'개 탭</span></div><div class="safari-clean-tab-grid"></div><div class="safari-clean-tabs-footer"><button type="button" class="safari-new-tab">＋</button><button type="button" class="safari-clean-done">완료</button></div></section>';
   const grid=main.querySelector('.safari-clean-tab-grid');
   grid.innerHTML=tabs.map(id=>{
    const p=place(id);
    if(!p)return '<button class="safari-clean-tab safari-clean-blank" data-open="start">새로운 탭</button>';
    return '<div class="safari-clean-tab"><div class="safari-clean-tab-head"><span>'+esc(p.title)+'</span><button type="button" data-close="'+id+'" aria-label="'+esc(p.title)+' 탭 닫기">×</button></div><button type="button" class="safari-clean-tab-preview" data-open="'+id+'">'+image(p,'safari-clean-tab-image')+'<span>'+esc(p.title)+'</span></button></div>';
   }).join('');
   bindRows();
   grid.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{tabs=tabs.filter(id=>id!==b.dataset.close);draw()});
   main.querySelector('.safari-clean-return').onclick=()=>goto('start');
   main.querySelector('.safari-clean-done').onclick=()=>goto('start');
   main.querySelector('.safari-new-tab').onclick=()=>goto('start');
  }else if(state.mode==='page'){
   const p=place(state.id);
   if(!p){goto('start');return}
   main.innerHTML='<article class="safari-clean-page"><button type="button" class="safari-clean-return">‹ 뒤로</button>'+image(p,'safari-clean-hero')+'<div class="safari-clean-page-body"><span>'+esc(p.subtitle)+'</span><h1>'+esc(p.title)+'</h1><p class="safari-clean-location">'+esc(p.details)+'</p><div class="safari-clean-note">'+esc(p.note)+'</div><a class="safari-clean-credit" target="_blank" rel="noopener noreferrer" href="'+esc(p.source)+'">'+esc(p.credit)+' ↗</a></div></article>';
   if(p.steps){
    const itinerary=document.createElement('ol');itinerary.className='safari-itinerary';
    p.steps.forEach(step=>{const li=document.createElement('li');li.textContent=step;itinerary.append(li)});
    main.querySelector('.safari-clean-page-body').append(itinerary);
   }
   main.querySelector('.safari-clean-return').onclick=()=>{if(position>0){position--;draw()}else goto('start')};
  }
  main.scrollTop=0;
 }
 back.onclick=()=>{if(position>0){position--;draw()}};
 forward.onclick=()=>{if(position<history.length-1){position++;draw()}};
 root.querySelector('.safari-bookmark-action').onclick=()=>goto('folder');
 root.querySelector('.safari-tabs-action').onclick=()=>goto('tabs');
 draw();
}


/* Bundled story apps; local, simulated content only. */
(function(){
 'use strict';
 const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const photos=()=>window.PhonePhotoAssets?.photos||[];
 const photo=id=>photos().find(p=>p.id===id)?.src||'';
 const goHome=()=>document.querySelector('#home-button')?.click();
 function setView(root,name,html){
  document.querySelector('#app').classList.add(name);
  root.innerHTML=html;root.scrollTop=0;
  root.querySelectorAll('.story-home').forEach(b=>b.onclick=goHome);
 }
 function header(title,back){
  const button=back?'<button type="button" class="story-internal-back">‹ '+E(back)+'</button>':'<button type="button" class="story-internal-back story-home">‹ 홈</button>';
  return '<header class="story-bar">'+button+'<span>'+E(title)+'</span><span class="story-bar-end"></span></header>';
 }
 function listenBack(root,fn){const b=root.querySelector('.story-internal-back:not(.story-home)');if(b)b.onclick=fn}
 function aimg(src,cls,alt=''){return src?'<img src="'+E(src)+'" class="'+cls+'" alt="'+E(alt)+'" loading="lazy" decoding="async">':''}
 const contacts=[
  {id:'mom',name:'엄마',initial:'엄',group:'가족',favorite:true},
  {id:'dad',name:'아빠',initial:'아',group:'가족',favorite:true},
  {id:'jiwoo',name:'지우',initial:'지',group:'',favorite:true,birthday:'9월 7일'},
  {id:'minseo',name:'민서',initial:'민',group:'체육교육과',favorite:false},
  {id:'junseo',name:'준서',initial:'준',group:'조별과제',favorite:false},
  {id:'subin',name:'수빈',initial:'수',group:'친구',favorite:false},
  {id:'trainer',name:'태권도 관장님',initial:'태',group:'태권도',favorite:false}
 ];
 function avatar(c,large=false){
  const cls=large?'story-profile-avatar':'story-avatar',src=c.id==='jiwoo'?photo('photo-15'):'';
  return '<span class="'+cls+'">'+(src?aimg(src,'story-avatar-photo'):'<span>'+E(c.initial)+'</span>')+'</span>';
 }
 function renderContacts(root,opts={}){
  const contact=id=>contacts.find(c=>c.id===id);
  function showList(){
   setView(root,'story-contacts-app',header('연락처')+'<section class="story-panel story-contacts"><h1>연락처</h1><label class="story-filter"><span aria-hidden="true">⌕</span><input type="search" placeholder="검색" aria-label="연락처 검색"></label><div class="story-contacts-results"></div></section>');
   const input=root.querySelector('input'),wrap=root.querySelector('.story-contacts-results');
   function paint(){
    const q=input.value.trim().toLocaleLowerCase('ko-KR'),found=contacts.filter(c=>c.name.toLocaleLowerCase('ko-KR').includes(q));
    wrap.replaceChildren();
    if(!q){
     const h=document.createElement('h2');h.className='story-section-heading';h.textContent='즐겨찾기';wrap.append(h);
     const favorites=document.createElement('div');favorites.className='story-group';wrap.append(favorites);
     found.filter(c=>c.favorite).forEach(c=>favorites.append(row(c)));
     const a=document.createElement('h2');a.className='story-section-heading';a.textContent='모든 연락처';wrap.append(a);
    }
    const list=document.createElement('div');list.className='story-group';wrap.append(list);
    found.forEach(c=>list.append(row(c)));
   }
   function row(c){
    const b=document.createElement('button');b.type='button';b.className='story-person-row';
    b.innerHTML=avatar(c)+'<span><strong>'+E(c.name)+'</strong><small>'+E(c.group||'휴대전화')+'</small></span><span class="story-chevron">›</span>';
    b.onclick=()=>showContact(c.id);return b;
   }
   input.oninput=paint;paint();
  }
  function showContact(id){
   const c=contact(id);if(!c){showList();return}
   setView(root,'story-contacts-app',header('연락처','연락처')+'<section class="story-panel story-contact-detail"><div class="story-contact-identity">'+avatar(c,true)+'<h1>'+E(c.name)+'</h1><span>'+E(c.group||'')+'</span></div><div class="story-contact-action-row"><button type="button" data-action="message"><span class="story-action-glyph">▤</span>메시지</button><button type="button" data-action="video"><span class="story-action-glyph">▣</span>FaceTime</button></div><div class="story-group"><div class="story-detail-field"><span>휴대전화</span><strong>010-••••-••••</strong></div>'+(c.birthday?'<div class="story-detail-field"><span>생일</span><strong>'+E(c.birthday)+'</strong></div>':'')+'<div class="story-detail-field"><span>그룹</span><strong>'+E(c.group||'즐겨찾기')+'</strong></div></div><div class="story-contact-favorite">★　즐겨찾기'+(c.favorite?'에 추가됨':'에 추가')+'</div></section>');
   listenBack(root,showList);
   root.querySelector('[data-action="message"]').onclick=()=>c.id==='jiwoo'?opts.openApp('메시지'):opts.toast('실제 문자는 발송되지 않아요.');
   root.querySelector('[data-action="video"]').onclick=()=>opts.openApp('FaceTime');
  }
  if(opts.selected)showContact(opts.selected);else showList();
 }
 const memoRecords=[
  {id:'groceries',title:'사야 할 것',date:'10월 20일',lines:['세제','충전 케이블','건전지']},
  {id:'course',title:'체육수업 지도안',date:'10월 18일',lines:['준비운동 5분','패스 연습','모둠 활동','마무리 스트레칭']},
  {id:'pet',title:'마음이',date:'10월 8일',lines:['사료 주문','간식','장난감 새로 사기','병원 예약 확인']},
  {id:'trip',title:'강릉 가면',date:'9월 20일',lines:['바다 보기','사진 찍기','조개구이 먹기','카페 찾아보기']},
  {id:'birthday',title:'지우 생일',date:'9월 6일',lines:['예약 확인하기','선물 포장','꽃 찾으러 가기','케이크 픽업'],footer:'내년에는 어디 데려가지'},
  {id:'mine',title:'내 메모',date:'',lines:[]}
 ];
 function renderNotes(root,opts={}){
  let filter='';
  const checkedKey='stillSeptemberBirthdayChecked';
  let completed=[true,true,true,true];
  try{const saved=JSON.parse(localStorage.getItem(checkedKey)||'null');if(Array.isArray(saved)&&saved.length===4)completed=saved.map(Boolean)}catch{}
  function list(){
   setView(root,'story-notes-app',header('메모')+'<section class="story-panel story-notes"><h1>메모</h1><label class="story-filter"><span aria-hidden="true">⌕</span><input type="search" placeholder="검색" aria-label="메모 검색" value="'+E(filter)+'"></label><div class="story-notes-count">'+memoRecords.length+'개의 메모</div><h2 class="story-section-heading">메모</h2><div class="story-group story-notes-list"></div><div class="story-notes-footer"><span>메모</span><button type="button" class="story-add-memo" aria-label="내 메모 편집">✎</button></div></section>');
   const wrap=root.querySelector('.story-notes-list'),input=root.querySelector('input');
   const display=()=>{filter=input.value;wrap.replaceChildren();memoRecords.filter(n=>n.title.includes(filter)||(n.lines.join(' ').includes(filter))).forEach(n=>{
    const body=n.id==='mine'?(opts.getNote?.()||'새 메모'):n.lines.join(', ');
    const b=document.createElement('button');b.type='button';b.className='story-note-row';
    b.innerHTML='<strong>'+E(n.title)+'</strong><span><small>'+E(n.date||'')+'</small>'+E(body.slice(0,46))+'</span>';
    b.onclick=()=>detail(n.id);wrap.append(b);
   });};
   input.oninput=display;display();
   root.querySelector('.story-add-memo').onclick=()=>detail('mine');
  }
  function detail(id){
   const n=memoRecords.find(x=>x.id===id);if(!n){list();return}
   let body='<div class="story-note-modified">'+E(n.date?n.date+' 수정됨':'자동 저장')+'</div><h1>'+E(n.title)+'</h1>';
   if(id==='birthday'){
    body+='<div class="story-note-checks">'+n.lines.map((t,i)=>'<label><input type="checkbox" data-check="'+i+'" '+(completed[i]?'checked':'')+'><span>'+E(t)+'</span></label>').join('')+'</div><p class="story-note-after">'+E(n.footer)+'</p>';
   }else if(id==='mine'){
    body+='<textarea class="story-editable-note" aria-label="내 메모 입력" placeholder="메모를 입력하세요"></textarea>';
   }else body+='<div class="story-note-lines">'+n.lines.map(t=>'<p>'+E(t)+'</p>').join('')+'</div>';
   setView(root,'story-notes-app',header('메모','메모')+'<article class="story-panel story-note-detail">'+body+'</article>');
   listenBack(root,list);
   if(id==='birthday')root.querySelectorAll('[data-check]').forEach(cb=>cb.onchange=()=>{
    completed[Number(cb.dataset.check)]=cb.checked;
    try{localStorage.setItem(checkedKey,JSON.stringify(completed))}catch{}
   });
   if(id==='mine'){
    const box=root.querySelector('textarea');box.value=opts.getNote?.()||'';
    box.oninput=()=>opts.setNote?.(box.value);
   }
  }
  list();
 }
 const gangneungImage='https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Gyeongpo_Beach_1.jpg/960px-Gyeongpo_Beach_1.jpg';
 const files=[
  {id:'course',name:'학교',modified:'10월 21일',items:[
   {name:'체육수업_지도안.txt',type:'text',contents:'체육수업 지도안\n\n도입: 준비운동\n전개: 기본 동작 시범, 조별 활동\n정리: 스트레칭과 피드백'},
   {name:'실기평가_준비.txt',type:'text',contents:'실기평가\n\n준비물 점검\n기록 확인\n연습 일정'},
   {name:'중간고사_범위.txt',type:'text',contents:'체육교육론\n\n강의 1~6주차\n평가 방식 정리\n수업지도 원리 복습'}
  ]},
  {id:'500',name:'500일',modified:'지난 기록',items:[
   {name:'남산타워_메모.txt',type:'text',contents:'500일\n\n남산타워\n저녁에 야경 보기\n자물쇠 걸기'},
   {name:'예약확인.txt',type:'text',contents:'남산타워 입장권\n\n방문 전에 시간 확인\n저녁에 올라가기'}
  ]},
  {id:'trip',name:'10월 강릉 여행',modified:'9월 20일',items:[
   {name:'여행계획.txt',type:'text',contents:'10월 강릉\n\n첫째 날\n경포해변 산책\n근처 카페\n\n둘째 날\n안목해변\n점심 먹고 돌아오기'},
   {name:'숙소후보.txt',type:'text',contents:'경포대 근처 숙소\n바다 보이는 방\n\n주말 날짜 확인하기'},
   {name:'경포해변.jpg',type:'image',src:gangneungImage},
   {name:'기차시간표.txt',type:'text',contents:'서울 → 강릉\n\n출발 시간 비교해보기\n토요일 오전 / 일요일 저녁'}
  ]}
 ];
 function renderFiles(root,opts={}){
  function list(){
   setView(root,'story-files-app',header('파일')+'<section class="story-panel story-files"><h1>파일</h1><p class="story-files-location">위치　›　나의 iPhone</p><h2 class="story-section-heading">나의 iPhone</h2><div class="story-group story-file-list"></div></section>');
   files.forEach(g=>{
    const b=document.createElement('button');b.type='button';b.className='story-file-row';
    b.innerHTML='<span class="story-folder">📁</span><span><strong>'+E(g.name)+'</strong><small>'+E(g.items.length)+'개 항목 · '+E(g.modified)+'</small></span><span class="story-chevron">›</span>';
    b.onclick=()=>folder(g.id);root.querySelector('.story-file-list').append(b);
   });
  }
  function folder(id){
   const group=files.find(f=>f.id===id);if(!group){list();return}
   setView(root,'story-files-app',header(group.name,'나의 iPhone')+'<section class="story-panel story-files"><h1>'+E(group.name)+'</h1><p class="story-files-location">'+group.items.length+'개 항목</p><div class="story-group story-file-list"></div></section>');
   listenBack(root,list);
   group.items.forEach((item,i)=>{
    const b=document.createElement('button');b.type='button';b.className='story-file-row';
    b.innerHTML='<span class="story-file-type">'+(item.type==='image'?'▧':'▤')+'</span><span><strong>'+E(item.name)+'</strong><small>'+E(item.type==='image'?'이미지':'텍스트 문서')+'</small></span><span class="story-chevron">›</span>';
    b.onclick=()=>preview(id,i);root.querySelector('.story-file-list').append(b);
   });
  }
  function preview(id,i){
   const g=files.find(x=>x.id===id),file=g?.items[i];if(!file)return;
   let inner='';
   if(file.type==='image')inner='<div class="story-image-preview">'+aimg(file.src,'story-file-image','강릉 경포해변')+'</div><span class="story-image-label">강릉 · 경포해변</span>';
   else inner='<div class="story-file-paper">'+E(file.contents)+'</div>';
   setView(root,'story-files-app',header(file.name,g.name)+'<section class="story-panel story-file-preview">'+inner+'</section>');
   listenBack(root,()=>folder(id));
  }
  list();
 }
 const calls=[
  {id:'mom',when:'10월 21일',time:'오후 9:12',kind:'FaceTime 영상 · 12분'},
  {id:'junseo',when:'10월 19일',time:'오후 8:33',kind:'FaceTime 영상 · 18분'},
  {id:'minseo',when:'10월 17일',time:'오후 4:25',kind:'FaceTime 영상 · 6분'},
  {id:'dad',when:'10월 12일',time:'오후 7:45',kind:'FaceTime 영상 · 9분'},
  {id:'subin',when:'10월 6일',time:'오후 11:02',kind:'FaceTime 영상 · 24분'},
  {id:'jiwoo',when:'9월 25일',time:'오후 8:42',kind:'부재중 FaceTime',missed:true},
  {id:'jiwoo',when:'9월 21일',time:'오후 10:06',kind:'FaceTime 영상 · 1시간 12분'},
  {id:'jiwoo',when:'9월 18일',time:'오후 9:17',kind:'FaceTime 영상 · 33분'}
 ];
 function renderFaceTime(root,opts={}){
  let filter='all';
  setView(root,'story-facetime-app',header('FaceTime')+'<section class="story-panel story-facetime"><h1>FaceTime</h1><div class="story-ft-filters" role="group" aria-label="통화 기록 필터"><button type="button" data-filter="all" class="active">모두</button><button type="button" data-filter="missed">부재중</button></div><h2 class="story-section-heading">최근 통화</h2><div class="story-group story-ft-list"></div></section>');
  const list=root.querySelector('.story-ft-list');
  function paint(){
   root.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===filter);b.setAttribute('aria-pressed',String(b.dataset.filter===filter))});
   list.replaceChildren();
   calls.filter(c=>filter==='all'||c.missed).forEach(entry=>{
    const contact=contacts.find(c=>c.id===entry.id);
    const row=document.createElement('div');row.className='story-ft-row'+(entry.missed?' missed':'');
    row.innerHTML='<span class="story-ft-glyph">▣</span><span class="story-ft-person"><strong>'+E(contact?.name||'알 수 없음')+'</strong><small>'+E(entry.kind)+'</small></span><span class="story-ft-date">'+E(entry.when)+'</span><button type="button" class="story-ft-info" aria-label="'+E(contact?.name||'연락처')+' 연락처 상세 보기">ⓘ</button>';
    row.querySelector('button').onclick=()=>opts.openContact?.(entry.id);
    list.append(row);
   });
  }
  root.querySelectorAll('[data-filter]').forEach(btn=>btn.onclick=()=>{filter=btn.dataset.filter;paint()});paint();
 }
 const passes=[
  {id:'art',category:'전시 티켓',title:'성수 전시',place:'서울숲 인근',date:'9월 18일',time:'14:00',color:'rose'},
  {id:'tower',category:'입장권',title:'N서울타워',place:'서울 용산구 남산공원길 105',date:'500일 기념',time:'19:00',color:'indigo'}
 ];
 function renderWallet(root){
  function list(){
   setView(root,'story-wallet-app',header('지갑')+'<section class="story-panel story-wallet"><h1>지갑</h1><h2 class="story-section-heading">이전 패스</h2><div class="story-wallet-list"></div><p class="story-wallet-legend">보관용 이미지 · 실제 입장에는 사용할 수 없습니다.</p></section>');
   passes.forEach(pass=>{
    const b=document.createElement('button');b.type='button';b.className='story-pass '+pass.color;
    b.innerHTML='<span class="story-pass-top">'+E(pass.category)+'<span>⌁</span></span><strong>'+E(pass.title)+'</strong><small>'+E(pass.date)+'　'+E(pass.time)+'</small><span class="story-pass-footer">사용 완료 <span>›</span></span>';
    b.onclick=()=>detail(pass);root.querySelector('.story-wallet-list').append(b);
   });
  }
  function detail(p){
   setView(root,'story-wallet-app',header('지갑','이전 패스')+'<section class="story-panel story-pass-detail"><div class="story-pass '+p.color+'"><span class="story-pass-top">'+E(p.category)+'<span>⌁</span></span><strong>'+E(p.title)+'</strong><small>'+E(p.date)+'　'+E(p.time)+'</small><div class="story-pass-info"><span>장소</span><strong>'+E(p.place)+'</strong><span>상태</span><strong>사용 완료</strong></div><div class="story-pass-nonscan" aria-label="실제 사용 불가한 티켓 장식">▥ ▌▍ ▐ ▥ ▌▏ ▐</div><p>기념 보관용 · 스캔 불가</p></div></section>');
   listenBack(root,list);
  }
  list();
 }
 const sleepWeek=[{day:'16',value:5.9},{day:'17',value:4.8},{day:'18',value:6.1},{day:'19',value:5.1},{day:'20',value:4.3},{day:'21',value:4.0},{day:'22',value:4.4}];
 const sleepMonth=[{day:'1주',value:6.1},{day:'2주',value:5.7},{day:'3주',value:5.0},{day:'4주',value:4.2}];
 const stepsWeek=[{day:'16',value:6230},{day:'17',value:4380},{day:'18',value:8920},{day:'19',value:5370},{day:'20',value:7510},{day:'21',value:4890},{day:'22',value:5820}];
 const stepsMonth=[{day:'1주',value:8130},{day:'2주',value:7640},{day:'3주',value:6680},{day:'4주',value:5510}];
 function renderHealth(root){
  let category='sleep',range='week';
  setView(root,'story-health-app',header('건강')+'<section class="story-panel story-health"><h1>건강</h1><div class="story-health-cat"><button type="button" data-category="sleep">수면</button><button type="button" data-category="steps">걸음 수</button></div><div class="story-health-range"><button type="button" data-range="week">주</button><button type="button" data-range="month">월</button></div><div class="story-health-content"></div><p class="story-health-disclaimer">화면에 표시된 기록은 이야기 속 가상 데이터입니다.</p></section>');
  const panel=root.querySelector('.story-health-content');
  function paint(){
   root.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===category);b.setAttribute('aria-pressed',String(b.dataset.category===category))});
   root.querySelectorAll('[data-range]').forEach(b=>{b.classList.toggle('active',b.dataset.range===range);b.setAttribute('aria-pressed',String(b.dataset.range===range))});
   const sleep=category==='sleep',data=sleep?(range==='week'?sleepWeek:sleepMonth):(range==='week'?stepsWeek:stepsMonth);
   const title=sleep?'수면 시간':'걸음 수';
   const avg=data.reduce((sum,x)=>sum+x.value,0)/data.length;const score=sleep?Math.floor(avg)+'시간 '+String(Math.round((avg%1)*60)).padStart(2,'0')+'분':Math.round(avg).toLocaleString('ko-KR');
   const unit=sleep?'평균 수면':'평균 걸음';
   const max=sleep?8:12000;
   const bars=data.map(x=>'<div class="story-health-point"><div class="story-health-column"><span style="height:'+Math.round(x.value/max*100)+'%" title="'+E(x.day)+(sleep?'일 ':'일 ')+E(x.value)+(sleep?'시간':'걸음')+'"></span></div><small>'+E(x.day)+'</small></div>').join('');
   panel.innerHTML='<div class="story-health-stat"><span>'+title+' · '+(range==='week'?'10월 16~22일':'10월 1~22일')+'</span><strong>'+score+'</strong><small>'+unit+'</small><div class="story-health-plots">'+bars+'</div><div class="story-health-axis"><span>0</span><span>'+E(sleep?'8시간':'12,000')+'</span></div></div>';
  }
  root.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{category=b.dataset.category;paint()});
  root.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>{range=b.dataset.range;paint()});
  paint();
 }
 window.PhoneMemoryApps={renderContacts,renderNotes,renderFiles,renderFaceTime,renderWallet,renderHealth};
})();

function openApp(name,fromBack=false){const previous=!$('#app').hidden?$('#app-title').textContent:null;if(previous&&previous!==name&&!fromBack)appHistory.push(previous);home(false,true);$('#home').hidden=true;$('#app').hidden=false;$('#app').className='app';$('#app-title').textContent=name;const c=$('#app-content');c.replaceChildren();c.scrollTop=0;
if(name==='메모'){window.PhoneMemoryApps.renderNotes(c,{getNote:()=>note,setNote:value=>{note=value;try{localStorage.setItem('my-phone-note',note)}catch{toast('저장할 수 없어요')}}})}
else if(name==='설정'){c.innerHTML=`<h1>설정</h1><div class="card profile"><span class="avatar">${story.initials}</span><div><strong>${story.owner}</strong><p class="muted">${story.owner}의 iPhone</p></div></div><div class="card"><div class="row"><span class="row-label"><span class="settings-icon" style="background:#ff9500" data-symbol="airplane"></span>비행기 모드</span><input id="settings-airplane" class="setting-switch" type="checkbox" aria-label="비행기 모드 시뮬레이션"></div><div class="row"><span class="row-label"><span class="settings-icon" data-symbol="wifi"></span>Wi-Fi</span><span id="settings-wifi"></span></div><div class="row"><span class="row-label"><span class="settings-icon" data-symbol="bluetooth"></span>Bluetooth</span><span id="settings-bluetooth"></span></div></div><div class="card"><label class="row"><span class="row-label"><span class="settings-icon" style="background:#5856d6" data-symbol="moon"></span>다크 배경</span><input class="setting-switch" type="checkbox" id="dark"></label><div class="row"><span class="row-label"><span class="settings-icon" style="background:#5856d6" data-symbol="sun"></span>홈 화면 사용자화</span><button id="settings-customize">열기</button></div><div class="row"><span class="row-label"><span class="settings-icon" style="background:#888" data-symbol="mirror"></span>제어 센터</span><button id="settings-control">열기</button></div><div class="row"><span class="row-label"><span class="settings-icon" style="background:#888" data-symbol="lock"></span>화면 잠금</span><button id="settings-lock">잠그기</button></div></div><p class="muted">이 화면의 설정은 웹 데모에만 적용됩니다.</p>`;paintSymbols(c);$('#dark').checked=document.body.classList.contains('dark');$('#dark').onchange=e=>document.body.classList.toggle('dark',e.target.checked);$('#settings-control').onclick=openControl;$('#settings-customize').onclick=openCustomize;$('#settings-lock').onclick=lock;syncSettings();$('#settings-airplane').onchange=()=>toggleControl($('.airplane'))}
else if(name==='시계'){c.innerHTML='<h1>세계 시계</h1><div class="card padded"><div class="big-clock" id="live-clock"></div><p class="clock-city"></p></div><p class="muted">기기에 설정된 시간대를 표시합니다.</p>';c.querySelector('.clock-city').textContent=Intl.DateTimeFormat().resolvedOptions().timeZone;const update=()=>$('#live-clock').textContent=new Date().toLocaleTimeString('ko-KR',{hour12:false});update();interval=setInterval(update,1000)}
else if(name==='캘린더'){renderCalendar(c)}
else if(name==='사진'){renderPhotos(c)}
else if(name==='날씨'){c.innerHTML='<div style="text-align:center;padding-top:22px"><h1 style="font-size:30px;font-weight:400;margin-bottom:0">서울</h1><div style="font-size:88px;font-weight:200;letter-spacing:-6px">21°</div><p style="font-size:19px;margin:0">맑음</p><p>최고:24° · 최저:16°</p><div class="card padded muted" style="margin-top:35px">디자인을 위한 예시 날씨입니다.<br>실시간 기상 정보와 연결되지 않았습니다.</div></div>'}
else if(name==='연락처'){window.PhoneMemoryApps.renderContacts(c,{openApp,toast})}
else if(name==='파일'){window.PhoneMemoryApps.renderFiles(c,{openApp})}
else if(name==='FaceTime'){window.PhoneMemoryApps.renderFaceTime(c,{openContact:id=>{openApp('연락처');window.PhoneMemoryApps.renderContacts(c,{openApp,toast,selected:id})}})}
else if(name==='지갑'){window.PhoneMemoryApps.renderWallet(c)}
else if(name==='건강'){window.PhoneMemoryApps.renderHealth(c)}
else if(name==='Safari'){renderSafari(c)}
else if(name==='전화'){$('#app').classList.add('phone-app');renderPhone(c)}
else if(name==='계산기'){calculator(c)}
else if(name==='메시지'){renderMessages(c)}
else if(name==='미리 알림'){renderReminders(c)}
else if(name==='음악'){renderMusic(c);startInitialMusicIfOpen()}
else if(name==='검색'){renderSearch(c)}
else if(name==='지도'){renderMap(c)}
else c.append(placeholder(name));
$('#back').focus({preventScroll:true});
}

const seongsuPlaces=[
 {
  "name": "한정선 성수점",
  "kind": "디저트·카페",
  "subkind": "디저트",
  "desc": "지우가 좋아하는 과일찹쌀떡",
  "addr": "서울 성동구 연무장길 43-1"
 },
 {
  "name": "서울앵무새 성수",
  "kind": "디저트·카페",
  "subkind": "디저트",
  "desc": "알록달록한 퀸아망을 같이 고르기",
  "addr": "서울 성동구 서울숲9길 3"
 },
 {
  "name": "자연도소금빵 성수",
  "kind": "디저트·카페",
  "subkind": "디저트",
  "desc": "따끈한 소금빵 포장해 가기",
  "addr": "서울 성동구 연무장길 56-1"
 },
 {
  "name": "도토리오븐 성수",
  "kind": "디저트·카페",
  "subkind": "카페",
  "desc": "디저트 고르면서 잠깐 쉬어가기",
  "addr": "서울 성동구 연무장길 37-25"
 },
 {
  "name": "어니언 성수",
  "kind": "디저트·카페",
  "subkind": "카페",
  "desc": "오래된 공장 분위기에서 빵과 음료",
  "addr": "서울 성동구 아차산로9길 8"
 },
 {
  "name": "대림창고",
  "kind": "디저트·카페",
  "subkind": "카페",
  "desc": "넓은 창고 공간에서 작품도 구경하기",
  "addr": "서울 성동구 성수이로 78"
 },
 {
  "name": "서울숲",
  "kind": "산책",
  "desc": "나란히 걷다가 벤치에서 쉬기",
  "addr": "서울 성동구 뚝섬로 273"
 },
 {
  "name": "뚝섬한강공원",
  "kind": "산책",
  "desc": "한강을 보며 저녁 산책하기",
  "addr": "서울 광진구 강변북로 139"
 },
 {
  "name": "응봉근린공원",
  "kind": "산책",
  "desc": "바람 쐬며 공원길 걷기",
  "addr": "서울 성동구 응봉동 269-4"
 },
 {
  "name": "성수연방",
  "kind": "구경",
  "desc": "작은 브랜드 숍과 공간 구경",
  "addr": "서울 성동구 성수이로14길 14"
 },
 {
  "name": "LCDC 서울",
  "kind": "구경",
  "desc": "편집숍과 팝업을 천천히 둘러보기",
  "addr": "서울 성동구 연무장17길 10"
 },
 {
  "name": "언더스탠드에비뉴",
  "kind": "구경",
  "desc": "서울숲 가는 길에 가게 구경하기",
  "addr": "서울 성동구 왕십리로 63"
 },
 {
  "name": "디올 성수",
  "kind": "구경",
  "desc": "특별한 외관 앞에서 사진 남기기",
  "addr": "서울 성동구 연무장5길 7"
 },
 {
  "name": "봉은사",
  "kind": "추억",
  "desc": "우리 오래가자고 소원 빈 곳",
  "addr": "서울 강남구 봉은사로 531"
 },
 {
  "name": "남산타워",
  "kind": "추억",
  "desc": "500일 기념 자물쇠 건 곳",
  "addr": "서울 용산구 남산공원길 105"
 }
];


// The map queries are address-based: the embedded map handles geocoding,
// and the visible external link remains usable when iframe embedding is blocked.
function renderMap(container){
 $('#app').classList.add('map-app');
 container.innerHTML=`<div class="map-intro"><h1>우리의 데이트 지도</h1><p>함께 걷고 오래 기억할 장소들 ♡</p></div>
 <label class="map-search-wrap"><span aria-hidden="true">⌕</span><input id="map-query" type="search" placeholder="카페나 장소 검색" aria-label="지도 장소 검색" autocomplete="off"></label>
 <div id="map-filters" class="map-filters" role="group" aria-label="장소 유형 필터"></div>
 <div class="map-frame"><iframe id="map-iframe" title="선택한 장소 지도" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><span class="map-frame-note">지도가 보이지 않으면 아래의 지도 열기를 눌러 주세요</span></div>
 <section id="map-selected" class="map-selected" aria-live="polite"></section>
 <div class="map-list-header"><strong>데이트 장소 모음</strong><span id="map-count"></span></div>
 <div id="map-results" class="map-results"></div>`;
 let category='전체', selectedId=0;
 const query=container.querySelector('#map-query');
 const filterRoot=container.querySelector('#map-filters');
 const results=container.querySelector('#map-results');
 const iframe=container.querySelector('#map-iframe');
 const selected=container.querySelector('#map-selected');
 const count=container.querySelector('#map-count');
 const categories=['전체','디저트·카페','산책','구경','추억'];
 const locationQuery=place=>place.name+' '+place.addr;
 const externalUrl=place=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(locationQuery(place));
 function showSelected(){
  const place=seongsuPlaces[selectedId];
  if(!place){iframe.removeAttribute('src');selected.replaceChildren();return}
  const nextMap='https://maps.google.com/maps?hl=ko&q='+encodeURIComponent(locationQuery(place))+'&z=16&output=embed';
  if(iframe.getAttribute('src')!==nextMap)iframe.src=nextMap;
  selected.replaceChildren();
  const tag=document.createElement('span');tag.className='map-kind';tag.textContent=place.subkind||place.kind;
  const title=document.createElement('h2');title.textContent=place.name;
  const desc=document.createElement('p');desc.textContent=place.desc;
  const address=document.createElement('p');address.className='map-address';address.textContent=place.addr;
  const link=document.createElement('a');link.className='map-external';link.href=externalUrl(place);link.target='_blank';link.rel='noopener noreferrer';link.textContent='지도에서 길찾기 ↗';
  selected.append(tag,title,desc,address,link);
 }
 function render(){
  const term=query.value.trim().toLocaleLowerCase('ko-KR');
  const matches=seongsuPlaces.map((place,i)=>({...place,i})).filter(place=>(category==='전체'||place.kind===category)&&(!term||(place.name+' '+place.addr+' '+place.desc).toLocaleLowerCase('ko-KR').includes(term)));
  count.textContent=matches.length+'곳';
  if(matches.length&&!matches.some(p=>p.i===selectedId))selectedId=matches[0].i;
  filterRoot.replaceChildren();
  for(const name of categories){
   const button=document.createElement('button');button.type='button';button.className='map-filter'+(name===category?' active':'');button.textContent=name;button.setAttribute('aria-pressed',String(name===category));
   button.onclick=()=>{category=name;render()};filterRoot.append(button);
  }
  results.replaceChildren();
  if(!matches.length){
   iframe.hidden=true;selected.hidden=true;
   const empty=document.createElement('p');empty.className='map-empty';empty.textContent='검색 결과가 없어요. 다른 장소를 검색해 보세요.';results.append(empty);return;
  }
  iframe.hidden=false;selected.hidden=false;
  for(const place of matches){
   const button=document.createElement('button');button.type='button';button.className='map-place'+(place.i===selectedId?' selected':'');button.setAttribute('aria-pressed',String(place.i===selectedId));
   const pin=document.createElement('span');pin.className='map-place-pin';pin.textContent=place.kind==='추억'?'💗':place.kind==='산책'?'🌿':place.kind==='구경'?'🛍️':place.subkind==='디저트'?'🍰':'☕';
   const text=document.createElement('span');text.className='map-place-text';
   const name=document.createElement('strong');name.textContent=place.name;
   const sub=document.createElement('small');sub.textContent=(place.subkind||place.kind)+' · '+place.desc;
   text.append(name,sub);
   const arrow=document.createElement('span');arrow.className='map-place-chevron';arrow.textContent='›';
   button.append(pin,text,arrow);
   button.onclick=()=>{selectedId=place.i;render();container.querySelector('.map-frame').scrollIntoView({block:'nearest',behavior:'smooth'})};
   results.append(button);
  }
  showSelected();
 }
 query.addEventListener('input',render);
 render();
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
   const videoLink=document.createElement('button');videoLink.className='birthday-video-link';videoLink.textContent='🎂 그날의 생일 영상 보기 ›';videoLink.onclick=()=>{openApp('사진');window.openBirthdayPhotoMemory?.()};events.append(videoLink);
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
function unlockPhone(){home();scheduleMusicIntro()}
function flashlight(){const active=$('#flashlight').getAttribute('aria-pressed')!=='true';['flashlight','control-torch'].forEach(id=>$('#'+id).setAttribute('aria-pressed',String(active)));toast(active?'손전등 아이콘을 켰습니다. 실제 기기 플래시는 제어하지 않습니다.':'손전등 시뮬레이션을 껐습니다.')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-app]');if(b){lastAppButton=b;openApp(b.dataset.app)}});
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>showPage(Number(b.dataset.page)));
$('#back').onclick=()=>home(true);$('#done').onclick=()=>home(true);$('#home-button').onclick=()=>{if($('#lock').hidden)home(true)};$('#unlock').onclick=unlockPhone;$('#control-button').onclick=openControl;$('#close-control').onclick=closeControl;$('#lock-button').onclick=lock;
const audio=$('#music-audio');audio.loop=true;let audioUrl=null;const bundledTrack=window.PhoneBundledTrack;let musicBundled=false;let musicGeneration=0,musicStored=false,musicRestoring=true,musicStarting=false,musicNeedsTap=false,musicPlaybackError=false,musicInitialPlaybackPending=true;audio.volume=Number($('#volume').value)/100;
function paintMusicArtwork(root=document){
 if(!bundledTrack?.cover)return;
 root.querySelectorAll('.track-art,.track-art-small').forEach(element=>{
  const image=document.createElement('img');image.src=bundledTrack.cover;image.alt='오반 — 어떻게 지내 앨범 커버';image.draggable=false;element.replaceChildren(image);element.classList.add('has-cover');
  if(element.classList.contains('track-art'))element.setAttribute('aria-label','어떻게 지내 앨범 커버');
 });
}
function connectBundledMusic(playNow=true){
 ++musicGeneration;musicBundled=true;musicRestoring=false;musicStored=false;musicNeedsTap=false;musicPlaybackError=false;
 audio.pause();if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=null;audio.src=bundledTrack.audio;audio.load();syncMusic();if(playNow)requestMusicPlayback();else startInitialMusicIfOpen();
}
function formatMusicTime(seconds){if(!Number.isFinite(seconds))return '0:00';return `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`}
function renderMusic(container){
 $('#app').classList.add('music-app');
 container.innerHTML=`<div class="music-library-heading"><span>보관함</span><small>${story.owner}의 음악</small></div><button id="music-track" class="music-track-row" aria-label="어떻게 지내 곡 정보"><span class="track-art-small" aria-hidden="true">OVAN</span><span><strong>${story.song.title}</strong><small>${story.song.artist}</small></span><span class="music-track-selected">♪</span></button><section class="music-player" aria-label="지금 재생 중"><div class="track-art" role="img" aria-label="곡 제목으로 구성한 임시 아트워크"><span>OVAN</span><strong>어떻게<br>지내</strong><small>양정원의 보관함</small></div><div class="music-track-title"><div><h1>${story.song.title}</h1><p>${story.song.artist}</p></div><span class="music-heart" aria-label="보관함에 추가됨">♥</span></div><input id="music-seek" class="music-seek" type="range" min="0" max="0" value="0" step="0.1" aria-label="재생 위치" disabled><div class="music-times"><span id="music-elapsed">0:00</span><span id="music-duration">—:—</span></div><div class="music-controls"><button id="music-rewind" aria-label="10초 뒤로">${symbols.symbol('previous')}</button><button id="music-play" aria-label="음원 파일 연결 후 재생">${symbols.symbol('play')}</button><button id="music-forward" aria-label="10초 앞으로">${symbols.symbol('next')}</button><button id="music-repeat" aria-label="한 곡 반복" aria-pressed="true">${symbols.symbol('repeat')}</button></div><p id="music-status" class="music-status" role="status"></p><div class="music-actions"><label class="audio-file-button" for="music-file">음원 파일 연결<input id="music-file" type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac"></label><a id="music-service" target="_blank" rel="noopener noreferrer">Apple Music에서 찾기 ↗</a></div><button id="music-disconnect" class="music-disconnect" hidden>연결한 음원 지우기</button><p id="music-source-note" class="music-source-note">처음 한 번 음원 파일을 연결해 주세요.</p></section>`;
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
function connectMusic(file,remember,playNow=true){
 const generation=++musicGeneration;musicBundled=false;musicRestoring=false;musicNeedsTap=false;musicPlaybackError=false;musicStored=!remember;
 audio.pause();if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(file);audio.src=audioUrl;audio.load();syncMusic();
 if(playNow)requestMusicPlayback();else startInitialMusicIfOpen();
 if(remember)writeStoredMusic(file,generation).then(saved=>{if(generation===musicGeneration){musicStored=saved;syncMusic()}}).catch(()=>{if(generation===musicGeneration){musicStored=false;syncMusic()}});
}
function startInitialMusicIfOpen(){
 if(musicInitialPlaybackPending&&audio.src&&!$('#app').hidden&&$('#app-title').textContent==='음악')requestMusicPlayback();
}
async function requestMusicPlayback(){
 musicInitialPlaybackPending=false;
 const generation=musicGeneration;musicStarting=true;musicNeedsTap=false;musicPlaybackError=false;syncMusic();
 try{await audio.play()}
 catch(error){if(generation!==musicGeneration)return;if(error.name==='NotAllowedError')musicNeedsTap=true;else if(error.name!=='AbortError')musicPlaybackError=true}
 finally{if(generation===musicGeneration){musicStarting=false;syncMusic()}}
}
async function restoreMusic(){
 if(bundledTrack?.audio){connectBundledMusic(false);return}
 const generation=musicGeneration;
 try{const file=await readStoredMusic();if(generation===musicGeneration&&file instanceof Blob&&file.size>0)connectMusic(file,false,false)}
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
 for(const id of ['music-play','media-play']){const button=$('#'+id);if(!button)continue;button.innerHTML=symbols.symbol(playing?'pause':'play');button.setAttribute('aria-label',!ready?'음원 파일 연결 후 재생':playing?'일시 정지':'재생')}
 $('#sound-start').hidden=!musicNeedsTap||playing;
 if($('#music-status'))$('#music-status').textContent=audio.error||musicPlaybackError?'파일을 재생할 수 없습니다. 다른 음원을 연결해 주세요.':musicRestoring?'저장한 음원을 확인하고 있어요…':!ready?'아래에서 MP3 · M4A 파일을 연결해 주세요.':playing?'재생 중':musicNeedsTap?'화면을 한 번 누르면 음악이 시작돼요.':musicStarting?'재생을 준비하고 있어요…':audio.ended?'재생 완료':'일시 정지됨';
 if($('#music-source-note')){$('#music-source-note').hidden=musicBundled;$('#music-source-note').textContent=!ready?'한 번 연결한 음원은 이 브라우저에 저장합니다.':musicStored?'이 브라우저에 저장되었습니다. 서버로 전송하지 않습니다.':'브라우저에 저장되지 않아 현재 화면에서만 재생됩니다.'}
 if($('.music-actions'))$('.music-actions').hidden=musicBundled;
 if($('#music-disconnect'))$('#music-disconnect').hidden=!ready||musicBundled;
 if($('#music-play'))$('#music-play').classList.toggle('needs-tap',musicNeedsTap);

 if($('#music-seek')){$('#music-seek').disabled=!duration;$('#music-seek').max=String(duration);$('#music-seek').value=String(audio.currentTime||0);$('#music-elapsed').textContent=formatMusicTime(audio.currentTime);$('#music-duration').textContent=duration?formatMusicTime(duration):'—:—';$('#music-repeat').setAttribute('aria-pressed',String(audio.loop))}
 for(const id of ['music-rewind','music-forward'])if($('#'+id))$('#'+id).disabled=!duration;
 $('#control-song-title').textContent=story.song.title;
 if('mediaSession' in navigator&&ready&&typeof MediaMetadata!=='undefined'){if(!navigator.mediaSession.metadata)navigator.mediaSession.metadata=new MediaMetadata({title:story.song.title,artist:story.song.artist,album:bundledTrack?.album||'',artwork:bundledTrack?.cover?[{src:bundledTrack.cover,sizes:'500x500',type:'image/jpeg'}]:[]});navigator.mediaSession.playbackState=playing?'playing':'paused'}
}
['play','pause','timeupdate','loadedmetadata','durationchange','ended','error','emptied'].forEach(event=>audio.addEventListener(event,syncMusic));
$('#media-open').onclick=()=>openApp('음악');

document.querySelectorAll('.toggle').forEach(b=>b.onclick=()=>toggleControl(b));$('#flashlight').onclick=flashlight;$('#control-torch').onclick=flashlight;$('#mirror').onclick=()=>toast('실제 화면 미러링은 연결되지 않은 데모입니다.');$('#media-play').onclick=toggleMusic;
$('#brightness').oninput=e=>{const value=Number(e.target.value);$('.phone').style.setProperty('--dim',String(1-value/100));e.target.parentElement.style.background=`linear-gradient(to top,#fffffff0 ${value}%,#ffffff15 ${value}%)`};$('#volume').oninput=e=>{e.target.parentElement.style.background=`linear-gradient(to top,#fffffff0 ${e.target.value}%,#ffffff15 ${e.target.value}%)`;audio.volume=Number(e.target.value)/100};
$('#search').onclick=()=>openApp('검색');$('#fullscreen').onclick=async()=>{try{if(!document.documentElement.requestFullscreen)throw Error();await document.documentElement.requestFullscreen();closeControl()}catch{toast('Safari에서는 공유 → 홈 화면에 추가 후 실행해 주세요.')}};

/* Desktop mouse drag and trackpad-enabled pointer swipe to unlock. The button
   remains clickable and keyboard-accessible for all non-touch devices. */
let lockPointerStart=null;
$('#lock').addEventListener('pointerdown',event=>{
 if($('#lock').hidden||event.pointerType!=='mouse'||event.button!==0)return;
 lockPointerStart={id:event.pointerId,x:event.clientX,y:event.clientY};
 if(!event.target.closest('button'))$('#lock').setPointerCapture(event.pointerId);
});
$('#lock').addEventListener('pointerup',event=>{
 if(!lockPointerStart||lockPointerStart.id!==event.pointerId)return;
 const dx=event.clientX-lockPointerStart.x,dy=event.clientY-lockPointerStart.y;
 lockPointerStart=null;
 if(!$('#lock').hidden&&dy< -60&&Math.abs(dy)>Math.abs(dx)*1.25)unlockPhone();
});
$('#lock').addEventListener('pointercancel',()=>{lockPointerStart=null});

let touchStart=null;$('.phone').addEventListener('touchstart',e=>{const t=e.changedTouches[0],rect=$('.phone').getBoundingClientRect();touchStart={x:t.clientX,y:t.clientY,localY:t.clientY-rect.top,right:rect.right-t.clientX,height:rect.height}},{passive:true});$('.phone').addEventListener('touchend',e=>{if(!touchStart)return;const t=e.changedTouches[0],dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;if(touchStart.localY<90&&touchStart.right<100&&dy>55)openControl();else if(!$('#lock').hidden&&dy< -50)unlockPhone();else if(touchStart.localY>touchStart.height-50&&dy< -50)home();else if(!$('#home').hidden&&$('#control').hidden&&Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)showPage(dx<0?1:0);touchStart=null},{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')goBack();if(!$('#home').hidden&&$('#control').hidden&&$('#customize').hidden&&['ArrowLeft','ArrowRight'].includes(e.key))showPage(e.key==='ArrowRight'?1:0)});

function openCustomize(){customizeReturnApp=!$('#app').hidden?$('#app-title').textContent:null;home();['home','app','lock'].forEach(id=>$('#'+id).inert=true);$('#customize').hidden=false;applyAppearance();$('#close-customize').focus()}
function closeCustomize(){$('#customize').hidden=true;['home','app','lock'].forEach(id=>$('#'+id).inert=false);const previous=customizeReturnApp;customizeReturnApp=null;if(previous)openApp(previous);else $('#search').focus()}
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

// Retry a blocked start inside a real user gesture, including Safari's touchend.
// Playback controls keep their own handlers so the first play tap cannot toggle twice.
function startMusicOnInteraction(event){
 if(!musicNeedsTap||musicStarting||!audio.src||!event.isTrusted)return;
 if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
 if(event.target.closest('a,#sound-start,#music-play,#media-play,#music-file,label[for=music-file],#music-disconnect'))return;
 requestMusicPlayback();
}
for(const type of ['touchend','click','keydown'])document.addEventListener(type,startMusicOnInteraction,{capture:true,passive:true});
$('#sound-start').onclick=requestMusicPlayback;
function openIntroMusic(){
 const source=$('#dock [data-app="음악"] .icon').getBoundingClientRect();
 openApp('음악');
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const app=$('#app'),bounds=app.getBoundingClientRect();
 $('#home').hidden=false;$('#home').inert=true;
 const animation=app.animate([
  {transform:`translate(${source.x+source.width/2-bounds.x-bounds.width/2}px,${source.y+source.height/2-bounds.y-bounds.height/2}px) scale(${source.width/bounds.width},${source.height/bounds.height})`,opacity:.35,borderRadius:'50px'},
  {transform:'translate(0,0) scale(1)',opacity:1,borderRadius:'0px'}
 ],{duration:520,easing:'cubic-bezier(.22,.8,.24,1)'});
 const finish=()=>{if(!app.hidden)$('#home').hidden=true;$('#home').inert=false};
 animation.finished.then(finish,finish);
}
function scheduleMusicIntro(){
 cancelMusicIntro();
 const icon=$('#dock [data-app="음악"] .icon');
 function frame(now){
  if(document.hidden)introVisibleSince=null;
  else{
   if(introVisibleSince===null)introVisibleSince=now;
   const elapsed=now-introVisibleSince;
   if(elapsed>=1820)icon.classList.add('intro-tap');
   if(elapsed>=2000){openIntroMusic();return}
  }
  introFrame=requestAnimationFrame(frame);
 }
 introFrame=requestAnimationFrame(frame);
}
// Background tabs and preloaded links must not consume the visible home delay.
document.addEventListener('visibilitychange',()=>{if(document.hidden){introVisibleSince=null;$('#dock [data-app="음악"] .icon').classList.remove('intro-tap')}});
window.addEventListener('pageshow',event=>{if(event.persisted)lock()});
showPage(0);setInterval(tick,1000);lock();paintMusicArtwork();syncMusic();restoreMusic();
