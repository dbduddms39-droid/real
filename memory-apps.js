(function(){
 'use strict';
 // Interactive fictional phone records. No calls, payments or health integrations.
 const E=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const photos=()=>window.PhonePhotoAssets?.photos||[];
 const photoSrc=id=>photos().find(p=>p.id===id)?.src||'';
 function setApp(container,cls,html){
  document.querySelector('#app').classList.add(cls);
  container.innerHTML=html;
  container.scrollTop=0;
 }
 function attachBack(container,fn){
  const b=container.querySelector('.story-internal-back');
  if(b)b.onclick=fn;
 }
 function viewTitle(label,back){
  return '<div class="story-header">'+(back?'<button type="button" class="story-internal-back" aria-label="이전 목록으로 돌아가기">‹ '+E(back)+'</button>':'<span></span>')+'<span>'+E(label)+'</span><span></span></div>';
 }
 const contacts=[
  {id:'jiwoo',name:'지우',initial:'지',subtitle:'즐겨찾기',birthday:'9월 7일',favorite:true},
  {id:'mom',name:'엄마',initial:'엄',subtitle:'가족',favorite:true},
  {id:'dad',name:'아빠',initial:'아',subtitle:'가족',favorite:true}
 ];
 function avatar(contact,cls='story-avatar'){
  const src=contact.id==='jiwoo'?photoSrc('photo-15'):'';
  return src?'<span class="'+cls+'"><img alt="" src="'+E(src)+'"></span>':'<span class="'+cls+'">'+E(contact.initial)+'</span>';
 }
 function renderContacts(container,opts={}){
  function list(){
   setApp(container,'story-contacts-app',viewTitle('연락처')+'<div class="story-screen story-contacts"><h1>연락처</h1><div class="story-contacts-search"><span>⌕</span><input type="search" aria-label="연락처 검색" placeholder="검색"></div><h2>즐겨찾기</h2><div class="story-list story-contacts-list"></div><p class="story-caption">이 휴대폰에 저장된 연락처</p></div>');
   const results=container.querySelector('.story-contacts-list');
   const input=container.querySelector('input');
   function filtered(){
    results.replaceChildren();
    contacts.filter(c=>c.name.includes(input.value.trim())).forEach(c=>{
     const b=document.createElement('button');b.type='button';b.className='story-contact-row';
     b.innerHTML=avatar(c)+'<span class="story-contact-name"><strong>'+E(c.name)+'</strong><small>'+E(c.subtitle)+'</small></span><span class="story-muted">›</span>';
     b.onclick=()=>detail(c.id);results.append(b);
    });
   }
   input.oninput=filtered;filtered();
  }
  function detail(id){
   const c=contacts.find(c=>c.id===id);
   if(!c){list();return}
   setApp(container,'story-contacts-app',viewTitle('연락처','목록')+'<div class="story-screen story-contact-detail"><div class="story-contact-profile">'+avatar(c,'story-profile-avatar')+'<h1>'+E(c.name)+'</h1><span>'+E(c.subtitle)+'</span></div><div class="story-contact-actions"><button class="story-contact-message" type="button"><span>✉</span>메시지</button><button class="story-contact-video" type="button"><span>▣</span>FaceTime</button></div><div class="story-list story-contact-fields">'+(c.birthday?'<div class="story-contact-field"><span>생일</span><strong>'+E(c.birthday)+'</strong></div>':'')+'<div class="story-contact-field"><span>그룹</span><strong>'+E(c.id==='jiwoo'?'즐겨찾기':'가족')+'</strong></div></div></div>');
   attachBack(container,list);
   container.querySelector('.story-contact-message').onclick=()=>{if(c.id==='jiwoo')opts.openApp('메시지');else opts.toast('문자 발신 기능은 연결되지 않았어요.')};
   container.querySelector('.story-contact-video').onclick=()=>opts.openApp('FaceTime');
  }
  if(opts.selected)detail(opts.selected);else list();
 }
 function renderNotes(container,opts={}){
  const notes=[
   {id:'birthday',title:'지우 생일',date:'9월 6일',preview:'내년에는 어디 데려가지',checks:['예약 확인하기','선물 포장','꽃 찾으러 가기','케이크 픽업']},
   {id:'pet',title:'마음이 필요한 것',date:'9월 2일',preview:'사료 · 간식 · 장난감',body:'사료\n간식\n새 장난감\n발 닦는 물티슈'},
   {id:'practice',title:'연습할 때 확인할 것',date:'8월 30일',preview:'음악 확인하고 스트레칭',body:'연습 전에 스트레칭\n음악 확인하기\n끝나고 정리'},
   {id:'own',title:'내 메모',date:'작성 중',preview:opts.getNote?.()||'새 메모'}
  ];
  function list(){
   setApp(container,'story-notes-app',viewTitle('메모')+'<section class="story-screen story-notes"><h1>메모</h1><p class="story-notes-count">'+notes.length+'개의 메모</p><div class="story-notes-group"><h2>메모</h2><div class="story-list story-note-list"></div></div></section>');
   const list=container.querySelector('.story-note-list');
   notes.forEach(n=>{
    const b=document.createElement('button');b.type='button';b.className='story-note-row';
    b.innerHTML='<strong>'+E(n.title)+'</strong><span><small>'+E(n.date)+'</small> '+E(n.id==='own'?(opts.getNote?.()||'새 메모').slice(0,60):n.preview)+'</span>';
    b.onclick=()=>detail(n.id);list.append(b);
   });
  }
  function detail(id){
   const n=notes.find(x=>x.id===id);
   if(!n)return;
   let inner='';
   if(id==='birthday')inner='<p class="story-note-date">마지막 편집 9월 6일</p><h1>지우 생일</h1><div class="story-note-checks">'+n.checks.map(t=>'<div><span>✓</span>'+E(t)+'</div>').join('')+'</div><p class="story-note-after">내년에는 어디 데려가지</p>';
   else if(id==='own')inner='<p class="story-note-date">자동 저장</p><h1>내 메모</h1><textarea class="story-editable-note" aria-label="내 메모 편집" placeholder="여기에 메모를 입력하세요"></textarea><p class="story-caption">작성한 메모는 이 브라우저에 저장됩니다.</p>';
   else inner='<p class="story-note-date">마지막 편집 '+E(n.date)+'</p><h1>'+E(n.title)+'</h1><p class="story-note-body">'+E(n.body||'')+'</p>';
   setApp(container,'story-notes-app',viewTitle('메모','메모')+'<section class="story-screen story-note-detail">'+inner+'</section>');
   attachBack(container,list);
   if(id==='own'){
    const input=container.querySelector('textarea');input.value=opts.getNote?.()||'';
    input.oninput=()=>{opts.setNote?.(input.value)};
   }
  }
  list();
 }
 const fileGroups=[
  {id:'photos',name:'사진 정리',count:'1개 항목',color:'#6c96c2',files:[{name:'사진 보관함',kind:'album',label:'사진 앱에서 보기',body:'사진 앱에 보관된 추억들'}]},
  {id:'500days',name:'500일',count:'2개 항목',color:'#c4a1bd',files:[{name:'남산타워_500일.txt',kind:'txt',label:'텍스트 문서',body:'남산타워\n500일 기념\n\n자물쇠 걸기\n밤에 서울 야경 보기'},{name:'입장권_메모.txt',kind:'txt',label:'텍스트 문서',body:'남산타워\n둘이 같이 올라가기\n기념 사진 찍기'}]},
  {id:'trip',name:'10월 강릉 여행',count:'2개 항목',color:'#8bb6c9',files:[{name:'강릉_여행계획.txt',kind:'txt',label:'계획 메모',body:'10월 강릉 여행\n\n첫째 날\n경포해변 걷기\n바다 보이는 카페 가기\n\n둘째 날\n안목해변 산책\n\n가을에 바다 보러 가기'},{name:'숙소_후보.txt',kind:'txt',label:'텍스트 문서',body:'강릉 숙소 후보\n\n경포해변 근처 숙소\n바다가 보이는 방\n주말 날짜 확인하기'}]}
 ];
 function renderFiles(container,opts={}){
  function list(){
   setApp(container,'story-files-app',viewTitle('나의 iPhone')+'<section class="story-screen story-files"><h1>파일</h1><div class="story-files-search">⌕　검색</div><h2>나의 iPhone</h2><div class="story-list story-file-list"></div><p class="story-caption">이 휴대폰에 남아 있는 폴더</p></section>');
   const wrap=container.querySelector('.story-file-list');
   fileGroups.forEach(g=>{
    const b=document.createElement('button');b.type='button';b.className='story-file-row';
    b.innerHTML='<span class="story-folder-icon" style="color:'+E(g.color)+'">▰</span><span><strong>'+E(g.name)+'</strong><small>'+E(g.count)+'</small></span><span class="story-muted">›</span>';b.onclick=()=>folder(g.id);wrap.append(b);
   });
  }
  function folder(id){
   const g=fileGroups.find(x=>x.id===id);if(!g){list();return}
   setApp(container,'story-files-app',viewTitle(g.name,'나의 iPhone')+'<section class="story-screen story-files"><h1>'+E(g.name)+'</h1><div class="story-list story-file-list"></div></section>');
   attachBack(container,list);
   const wrap=container.querySelector('.story-file-list');
   g.files.forEach((f,i)=>{
    const b=document.createElement('button');b.type='button';b.className='story-file-row';
    b.innerHTML='<span class="story-file-type">▤</span><span><strong>'+E(f.name)+'</strong><small>'+E(f.label)+'</small></span><span class="story-muted">›</span>';
    b.onclick=()=>file(id,i);wrap.append(b);
   });
  }
  function file(id,i){
   const g=fileGroups.find(x=>x.id===id),f=g?.files[i];if(!f)return;
   setApp(container,'story-files-app',viewTitle(f.name,g.name)+'<section class="story-screen story-file-preview"><h1>'+E(f.name)+'</h1><div class="story-file-paper">'+E(f.body)+'</div>'+(f.kind==='album'?'<button type="button" class="story-open-photos">사진 앱 열기 ›</button>':'')+'</section>');
   attachBack(container,()=>folder(id));
   container.querySelector('.story-open-photos')?.addEventListener('click',()=>opts.openApp('사진'));
  }
  list();
 }
 function renderFaceTime(container,opts={}){
  const log=[
   {name:'지우',when:'9월 25일',sub:'부재중 · FaceTime 영상',color:'missed'},
   {name:'지우',when:'9월 21일',sub:'영상 통화 · 1시간 12분'},
   {name:'엄마',when:'9월 20일',sub:'영상 통화 · 8분'},
   {name:'지우',when:'9월 18일',sub:'영상 통화 · 33분'},
   {name:'아빠',when:'9월 15일',sub:'영상 통화 · 6분'},
   {name:'지우',when:'9월 10일',sub:'영상 통화 · 48분'}
  ];
  setApp(container,'story-facetime-app',viewTitle('FaceTime')+'<section class="story-screen story-facetime"><h1>FaceTime</h1><div class="story-ft-segment">최근 통화</div><div class="story-list story-ft-list"></div><p class="story-caption">지난 통화 기록 · 실제 통화는 연결되지 않습니다.</p></section>');
  const wrap=container.querySelector('.story-ft-list');
  log.forEach(l=>{
   const b=document.createElement('button');b.type='button';b.className='story-ft-row '+(l.color||'');
   b.innerHTML='<span class="story-ft-icon">▣</span><span><strong>'+E(l.name)+'</strong><small>'+E(l.sub)+'</small></span><small>'+E(l.when)+'</small><span class="story-ft-info">ⓘ</span>';
   b.onclick=()=>opts.openContact(l.name==='지우'?'jiwoo':l.name==='엄마'?'mom':'dad');
   wrap.append(b);
  });
 }
 const passes=[
  {id:'exhibit',name:'전시 관람',title:'서울숲 근처 전시',when:'9월 18일',spot:'성수 · 서울숲 인근',tag:'사용함',color:'pink'},
  {id:'tower',name:'기념일 입장권',title:'N서울타워',when:'500일',spot:'서울 용산구 남산공원길 105',tag:'사용함',color:'blue'}
 ];
 function renderWallet(container){
  function list(){
   setApp(container,'story-wallet-app',viewTitle('지갑')+'<section class="story-screen story-wallet"><h1>지갑</h1><h2>이전 패스</h2><div class="story-wallet-list"></div><p class="story-caption">이야기를 위한 가상 티켓입니다. 실제 입장권이 아닙니다.</p></section>');
   const wrap=container.querySelector('.story-wallet-list');
   passes.forEach(p=>{
    const b=document.createElement('button');b.type='button';b.className='story-ticket '+p.color;
    b.innerHTML='<span>'+E(p.name)+'</span><strong>'+E(p.title)+'</strong><small>'+E(p.when)+' · '+E(p.tag)+'</small><span class="story-ticket-wave" aria-hidden="true"></span>';
    b.onclick=()=>detail(p);wrap.append(b);
   });
  }
  function detail(p){
   setApp(container,'story-wallet-app',viewTitle('지갑','이전 패스')+'<section class="story-screen story-ticket-detail"><div class="story-ticket '+p.color+'"><span>'+E(p.name)+'</span><strong>'+E(p.title)+'</strong><small>'+E(p.when)+'</small><div class="story-ticket-meta">'+E(p.spot)+'</div><div class="story-ticket-code" aria-hidden="true">▥ ▌▏▥▐▥▏▌▥</div><small>사용 완료 · 연출용 티켓</small></div></section>');
   attachBack(container,list);
  }
  list();
 }
 function renderHealth(container){
  const days=[{date:'9.24',sleep:7.2},{date:'9.25',sleep:6.6},{date:'9.26',sleep:6.1},{date:'9.27',sleep:7.0},{date:'9.28',sleep:5.2},{date:'9.29',sleep:4.1},{date:'9.30',sleep:3.8}];
  let chosen='sleep';
  setApp(container,'story-health-app',viewTitle('건강')+'<section class="story-screen story-health"><h1>건강</h1><p class="story-health-sub">요약</p><div class="story-health-nav"><button type="button" class="active" data-health="sleep">수면</button><button type="button" data-health="steps">걸음 수</button></div><div class="story-health-body"></div><p class="story-caption">이야기 연출을 위한 예시 기록이며 실제 측정 데이터가 아닙니다.</p></section>');
  const wrap=container.querySelector('.story-health-body');
  function paint(){
   container.querySelectorAll('[data-health]').forEach(btn=>{btn.classList.toggle('active',btn.dataset.health===chosen);btn.setAttribute('aria-pressed',String(btn.dataset.health===chosen))});
   if(chosen==='sleep'){
    wrap.innerHTML='<div class="story-health-card"><span class="story-health-type">수면 시간 · 최근 7일</span><strong>불규칙한 수면</strong><div class="story-health-chart">'+days.map(d=>'<div class="story-health-bar-wrap"><div class="story-health-bar" style="height:'+Math.round(d.sleep*13)+'px" title="'+d.date+' · '+d.sleep+'시간"></div><small>'+d.date+'</small></div>').join('')+'</div><p>날짜별 수면 시간</p></div>';
   }else{
    wrap.innerHTML='<div class="story-health-card"><span class="story-health-type">걸음 수 · 9월 7일</span><strong>17,892<span class="story-health-unit">걸음</span></strong><div class="story-health-daybars"><span style="height:39%"></span><span style="height:54%"></span><span style="height:77%"></span><span style="height:96%"></span><span style="height:67%"></span></div><p>많이 걸었던 날</p></div>';
   }
  }
  container.querySelectorAll('[data-health]').forEach(btn=>btn.onclick=()=>{chosen=btn.dataset.health;paint()});paint();
 }
 window.PhoneMemoryApps={renderNotes,renderContacts,renderFiles,renderFaceTime,renderWallet,renderHealth};
})();
