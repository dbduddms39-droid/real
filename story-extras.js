'use strict';
(function(){
 const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const read=(key,fallback)=>{try{const data=JSON.parse(localStorage.getItem(key));return data??fallback}catch{return fallback}};
 const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
 const articles=[
  {id:'campus',category:'캠퍼스',publisher:'캠퍼스 레터',date:'9월 28일',tone:'mint',icon:'✳',title:'가을 학기 첫 달, 다시 분주해진 체육관',summary:'수업과 동아리 활동이 시작되면서 학교 체육관에도 활기가 돌아왔다.',body:['9월의 마지막 주, 캠퍼스 체육관에는 새 학기 수업을 준비하는 학생들의 발걸음이 이어지고 있다. 매트와 운동 기구를 정리하고 조별 실습 순서를 확인하는 풍경도 익숙해졌다.','체육교육을 공부하는 학생들에게 실습은 단순히 동작을 잘 보여 주는 시간이 아니다. 상대가 따라올 수 있도록 설명을 바꾸고, 작은 변화도 알아차리는 연습이 필요하다.','한 학생은 “잘하는 것과 잘 가르치는 것은 다르다는 걸 매번 느낀다”고 말했다. 가을 학기의 남은 시간은 그런 차이를 하나씩 배우는 과정이 될 것이다.']},
  {id:'namsan',category:'서울',publisher:'서울 산책',date:'9월 27일',tone:'peach',icon:'☼',title:'해가 짧아지는 계절, 남산을 걷는 사람들',summary:'낮의 열기가 사라진 저녁, 천천히 걷기 좋은 길이 다시 인기다.',body:['한여름에는 늦은 밤까지 밝던 하늘이 이제는 조금 더 일찍 어두워진다. 남산 산책길에도 가벼운 겉옷을 걸친 사람들이 늘었다.','전망대까지 올라가는 길에서는 사진을 찍거나 잠시 멈춰 서울의 불빛을 바라보는 사람들을 만날 수 있다. 누군가는 처음 찾은 장소이고, 누군가에게는 여러 번 돌아온 익숙한 길이다.','계절이 바뀌어도 같은 자리에 남는 풍경이 있다. 그래서 어떤 장소는 지나간 날을 떠올리게 한다.']},
  {id:'sports',category:'스포츠',publisher:'스포츠 노트',date:'9월 26일',tone:'blue',icon:'◈',title:'생활체육에서 오래 남는 건 기록보다 함께한 시간',summary:'승패만큼 중요한 연습 과정과 팀워크에 대한 이야기.',body:['운동을 오래 이어 가는 사람들은 종종 경기 결과보다 연습하던 시간을 더 생생하게 기억한다. 익숙하지 않은 동작을 반복하고, 실수한 친구를 기다려 주던 순간들이다.','태권도와 구기 종목처럼 서로의 움직임을 살펴야 하는 활동에서는 상대의 속도에 맞추는 감각도 중요하다. 혼자 잘하는 것만으로 완성되지 않는 장면이 많기 때문이다.','서로 다른 실력을 가진 사람들이 함께 움직일 수 있도록 돕는 일은 생활체육의 중요한 가치다.']},
  {id:'seongsu',category:'라이프',publisher:'동네의 온도',date:'9월 25일',tone:'lilac',icon:'✿',title:'성수의 작은 골목에서 보내는 느린 오후',summary:'새로운 가게와 오래된 풍경이 나란히 있는 동네의 매력.',body:['성수동의 큰길에서 한 블록만 벗어나도 거리의 속도가 달라진다. 사람들이 줄을 서는 가게 옆에는 조용히 문을 연 작은 카페가 있다.','특별한 목적지 없이 걷다가 마음에 드는 간판을 발견하고, 메뉴를 고르는 데 한참 시간을 쓰는 오후도 있다. 사진 한 장을 남기고 돌아오는 길에는 아까와 다른 풍경이 눈에 들어온다.','좋아하는 사람과 함께 걸었던 동네는 시간이 지나도 조금 다르게 기억된다.']},
  {id:'photos',category:'디지털 라이프',publisher:'일상의 기록',date:'9월 23일',tone:'cream',icon:'▧',title:'사진첩을 정리하다 발견하는 평범한 하루',summary:'잘 찍은 사진보다 지우지 못하는 사진이 있는 이유.',body:['휴대폰 사진첩에는 여행지의 풍경만 남지 않는다. 흔들린 셀카, 다 먹어 버린 디저트, 의미 없이 찍은 하늘처럼 당시에는 별생각 없던 사진도 많다.','그런 사진은 시간이 지난 뒤 오히려 정확한 기억을 불러온다. 그날 무슨 이야기를 했는지, 돌아오는 길에 어떤 노래를 들었는지까지 따라오기도 한다.','사진을 정리한다는 것은 단순히 저장 공간을 비우는 일과는 조금 다를지 모른다.']},
  {id:'autumn',category:'생활',publisher:'월말 메모',date:'9월 21일',tone:'gray',icon:'⌁',title:'9월이 끝나기 전에 해두면 좋은 작은 정리',summary:'일정, 메모, 사진을 돌아보며 다음 달을 준비하는 방법.',body:['새로운 달을 맞이할 때 거창한 계획이 꼭 필요한 것은 아니다. 밀린 일정을 확인하고, 끝낸 할 일을 지우고, 오래 열어 두었던 메모를 다시 읽는 것만으로도 충분하다.','잊지 않으려고 적어 둔 문장 가운데는 이제 필요 없어진 것도 있다. 반대로 그때는 대수롭지 않았는데 지금은 남겨 두고 싶은 말도 있다.','정리의 기준은 무엇을 버릴지가 아니라 무엇을 계속 가지고 갈지일 수도 있다.']}
 ];
 const shortcuts=[
  {id:'between',title:'우리의 사진',desc:'비트윈에 남은 사진 보기',tint:'coral',icon:'heart'},
  {id:'music',title:'음악 듣기',desc:'음악 앱 열기',tint:'pink',icon:'music'},
  {id:'photos',title:'사진첩',desc:'저장된 사진 살펴보기',tint:'violet',icon:'photo'},
  {id:'calendar',title:'일정 확인',desc:'캘린더 열기',tint:'blue',icon:'calendar'},
  {id:'reminders',title:'할 일 확인',desc:'미리 알림 열기',tint:'orange',icon:'check'},
  {id:'notes',title:'메모 열기',desc:'적어 둔 메모 이어 보기',tint:'yellow',icon:'notes'}
 ];
 const paths={
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  photo:'<rect x="2" y="3" width="20" height="18" rx="3"/><circle cx="8" cy="9" r="2"/><path d="m3 17 6-5 4 4 3-3 5 4"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 14h3v3H8z"/>',
  check:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 11 2 2 4-4M15 10h3M15 15h3"/>',
  notes:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'
 };
 const glyph=name=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';
 function replaceHandler(root,handler){
  if(root.__ssExtraHandler)root.removeEventListener('click',root.__ssExtraHandler);
  root.__ssExtraHandler=handler;
  root.addEventListener('click',handler);
 }
 function topbar(label,back){return '<header class="ss-topbar"><button type="button" class="ss-topback '+(back?'story-internal-back':'story-home')+'" data-ss-back="'+(back?'inside':'home')+'">‹ '+(back?'뉴스':'홈')+'</button><strong>'+esc(label)+'</strong><span aria-hidden="true"></span></header>'}
 function renderNews(root,ctx){
  document.querySelector('#app').classList.add('ss-news-app');
  const saved=new Set(read('ss-news-saved-v1',[]));
  const readIds=new Set(read('ss-news-read-v1',[]));
  let tab='today',current=null;
  const bookmark=(id)=>'<button class="ss-news-save'+(saved.has(id)?' is-saved':'')+'" type="button" data-news-save="'+id+'" aria-label="'+(saved.has(id)?'저장 취소':'기사 저장')+'" aria-pressed="'+saved.has(id)+'">'+(saved.has(id)?'♥':'♡')+'</button>';
  function list(){
   const items=tab==='saved'?articles.filter(a=>saved.has(a.id)):articles;
   let html=topbar('News',false)+'<main class="ss-news-page"><div class="ss-news-date">2026년 9월 28일 월요일</div><h1>오늘의 뉴스</h1><p class="ss-news-note">정원의 휴대폰에 남은 9월의 읽을거리</p><div class="ss-news-tabs" role="tablist" aria-label="뉴스 보기"><button role="tab" aria-selected="'+(tab==='today')+'" data-news-tab="today" class="'+(tab==='today'?'selected':'')+'">오늘</button><button role="tab" aria-selected="'+(tab==='saved')+'" data-news-tab="saved" class="'+(tab==='saved'?'selected':'')+'">저장한 기사 '+saved.size+'</button></div>';
   if(tab==='today'){
    const a=articles[0];
    html+='<div class="ss-news-section-title">TOP STORIES <span>9월의 기록</span></div><div class="ss-news-hero ss-news-tone-'+a.tone+'"><button type="button" data-news-open="'+a.id+'"><span class="ss-news-hero-mark">'+a.icon+'</span><span class="ss-news-category">'+esc(a.category)+' · '+esc(a.publisher)+'</span><strong>'+esc(a.title)+'</strong><span>'+esc(a.summary)+'</span></button>'+bookmark(a.id)+'</div>';
   }
   html+='<div class="ss-news-section-title">'+(tab==='saved'?'BOOKMARKS':'FOR YOU')+' <span>'+items.length+'개 기사</span></div>';
   if(!items.length)html+='<div class="ss-news-empty"><span>♡</span><strong>저장한 기사가 없어요</strong><p>마음에 드는 기사에서 ♡를 눌러 보세요.</p></div>';
   for(const a of items){
    html+='<article class="ss-news-card"><button type="button" class="ss-news-card-main" data-news-open="'+a.id+'"><span class="ss-news-card-art ss-news-tone-'+a.tone+'">'+a.icon+'</span><span class="ss-news-card-copy"><small>'+esc(a.publisher)+' · '+esc(a.date)+(readIds.has(a.id)?' · 읽음':'')+'</small><strong>'+esc(a.title)+'</strong><span>'+esc(a.summary)+'</span></span></button>'+bookmark(a.id)+'</article>';
   }
   html+='<p class="ss-news-disclaimer">이야기 속 인물을 위해 작성한 가상 기사입니다. 실제 보도가 아닙니다.</p></main>';
   root.innerHTML=html;root.scrollTop=0;
  }
  function article(a){
   root.innerHTML=topbar('News',true)+'<main class="ss-news-article"><span class="ss-news-category">'+esc(a.category)+' · '+esc(a.publisher)+'</span><h1>'+esc(a.title)+'</h1><p class="ss-news-lede">'+esc(a.summary)+'</p><div class="ss-news-article-meta">'+esc(a.date)+' · 읽는 데 약 1분 '+bookmark(a.id)+'</div><div class="ss-news-article-art ss-news-tone-'+a.tone+'">'+a.icon+'</div><div class="ss-news-article-body">'+a.body.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div><p class="ss-news-disclaimer">이 글은 이야기 속 가상 기사입니다.</p><button type="button" class="ss-news-end" data-news-back>‹ 다른 기사 보기</button></main>';
   root.scrollTop=0;
  }
  function paint(){if(current){const a=articles.find(x=>x.id===current);if(a)article(a);else{current=null;list()}}else list()}
  replaceHandler(root,event=>{
   const button=event.target.closest('button');if(!button||!root.contains(button))return;
   if(button.hasAttribute('data-news-open')){current=button.dataset.newsOpen;readIds.add(current);save('ss-news-read-v1',[...readIds]);paint();return}
   if(button.hasAttribute('data-news-save')){const id=button.dataset.newsSave;saved.has(id)?saved.delete(id):saved.add(id);save('ss-news-saved-v1',[...saved]);paint();return}
   if(button.hasAttribute('data-news-tab')){tab=button.dataset.newsTab;current=null;paint();return}
   if(button.hasAttribute('data-news-back')||button.dataset.ssBack==='inside'){current=null;paint();return}
   if(button.dataset.ssBack==='home'){ctx.home(true);return}
  });
  paint();
 }
 function renderShortcuts(root,ctx){
  document.querySelector('#app').classList.add('ss-shortcuts-app');
  const favs=new Set(read('ss-shortcut-favs-v1',['between','music','photos']));
  let recent=read('ss-shortcut-recent-v1',[]);
  let filter='all';
  function card(item){
   const isFav=favs.has(item.id);
   return '<div class="ss-shortcut-card"><button type="button" class="ss-shortcut-run" data-shortcut-run="'+item.id+'"><span class="ss-shortcut-icon ss-shortcut-'+item.tint+'">'+glyph(item.icon)+'</span><strong>'+esc(item.title)+'</strong><small>'+esc(item.desc)+'</small><span class="ss-shortcut-play">▶ 실행</span></button><button type="button" class="ss-shortcut-fav '+(isFav?'active':'')+'" data-shortcut-fav="'+item.id+'" aria-pressed="'+isFav+'" aria-label="'+esc(item.title)+' 즐겨찾기 '+(isFav?'해제':'추가')+'">'+(isFav?'★':'☆')+'</button></div>';
  }
  function paint(){
   const items=filter==='favorites'?shortcuts.filter(s=>favs.has(s.id)):shortcuts;
   let html='<header class="ss-topbar"><button type="button" class="ss-topback story-home" data-shortcut-home>‹ 홈</button><strong>단축어</strong><span aria-hidden="true"></span></header><main class="ss-shortcut-page"><div class="ss-shortcut-heading"><div><small>SHORTCUTS</small><h1>모든 단축어</h1></div><span class="ss-shortcut-heading-mark">↗</span></div><p class="ss-shortcut-intro">자주 열어보는 앱을 한 번에 실행해요.</p><div class="ss-shortcut-tabs" role="tablist" aria-label="단축어 필터"><button role="tab" data-shortcut-filter="all" aria-selected="'+(filter==='all')+'" class="'+(filter==='all'?'active':'')+'">전체</button><button role="tab" data-shortcut-filter="favorites" aria-selected="'+(filter==='favorites')+'" class="'+(filter==='favorites'?'active':'')+'">★ 즐겨찾기</button></div>';
   if(items.length)html+='<div class="ss-shortcut-grid">'+items.map(card).join('')+'</div>';
   else html+='<div class="ss-shortcut-empty">☆<p>즐겨찾기한 단축어가 없어요.</p></div>';
   const recentItems=recent.map(id=>shortcuts.find(s=>s.id===id)).filter(Boolean).slice(0,3);
   if(recentItems.length)html+='<div class="ss-shortcut-recent"><h2>최근 실행</h2>'+recentItems.map(item=>'<button type="button" data-shortcut-run="'+item.id+'"><span class="ss-shortcut-icon ss-shortcut-'+item.tint+'">'+glyph(item.icon)+'</span><span>'+esc(item.title)+'</span><span class="ss-shortcut-arrow">›</span></button>').join('')+'</div>';
   html+='<p class="ss-shortcut-foot">단축어는 이 이야기 속 iPhone 화면에서만 작동합니다.</p></main>';
   root.innerHTML=html;root.scrollTop=0;
  }
  function run(id){
   recent=[id,...recent.filter(x=>x!==id)].slice(0,6);
   save('ss-shortcut-recent-v1',recent);
   const app={music:'음악',photos:'사진',calendar:'캘린더',reminders:'미리 알림',notes:'메모',between:'App Store'}[id];
   if(!app)return;
   ctx.openApp(app);
   if(id==='between'){
    const item=document.querySelector('#app-content .store-product-info[data-open="between"]');
    if(item){item.click();document.querySelector('#app-content .store-screenshot')?.click()}
    else ctx.toast('비트윈을 App Store에서 찾아보세요.');
   }
  }
  replaceHandler(root,event=>{
   const button=event.target.closest('button');if(!button||!root.contains(button))return;
   if(button.hasAttribute('data-shortcut-run')){run(button.dataset.shortcutRun);return}
   if(button.hasAttribute('data-shortcut-fav')){const id=button.dataset.shortcutFav;favs.has(id)?favs.delete(id):favs.add(id);save('ss-shortcut-favs-v1',[...favs]);paint();return}
   if(button.hasAttribute('data-shortcut-filter')){filter=button.dataset.shortcutFilter;paint();return}
   if(button.hasAttribute('data-shortcut-home'))ctx.home(true);
  });
  paint();
 }
 function enhanceBetween(root){
  if(root.__ssBetweenEnhanced)return;
  root.__ssBetweenEnhanced=true;
  let active=null;
  function close(){
   if(!active)return;
   document.removeEventListener('keydown',active.keyHandler);
   active.node.remove();active=null;
  }
  function open(srcList,index){
   close();
   if(!srcList.length)return;
   const overlay=document.createElement('div');
   overlay.className='ss-between-lightbox';
   overlay.setAttribute('role','dialog');
   overlay.setAttribute('aria-modal','true');
   overlay.setAttribute('aria-label','비트윈 사진 크게 보기');
   overlay.innerHTML='<div class="ss-between-lightbox-top"><button type="button" data-photo-close>‹ 돌아가기</button><strong>우리의 사진</strong><span data-photo-count></span></div><div class="ss-between-lightbox-stage"><button type="button" data-photo-prev aria-label="이전 사진">‹</button><img alt="비트윈에 저장된 지우 사진"><button type="button" data-photo-next aria-label="다음 사진">›</button></div><div class="ss-between-lightbox-bottom">BETWEEN · 정원 ♡ 지우</div>';
   let current=index,startX=null;
   function update(){
    overlay.querySelector('img').src=srcList[current];
    overlay.querySelector('[data-photo-count]').textContent=(current+1)+' / '+srcList.length;
   }
   overlay.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-photo-close'))close();
    if(b.hasAttribute('data-photo-prev')){current=(current-1+srcList.length)%srcList.length;update()}
    if(b.hasAttribute('data-photo-next')){current=(current+1)%srcList.length;update()}
   });
   overlay.addEventListener('touchstart',e=>{startX=e.changedTouches[0]?.clientX??null},{passive:true});
   overlay.addEventListener('touchend',e=>{if(startX===null)return;const diff=(e.changedTouches[0]?.clientX??startX)-startX;if(Math.abs(diff)>45){current=(current+(diff<0?1:-1)+srcList.length)%srcList.length;update()}startX=null},{passive:true});
   const keyHandler=e=>{if(e.key==='Escape')close();else if(e.key==='ArrowRight'){current=(current+1)%srcList.length;update()}else if(e.key==='ArrowLeft'){current=(current-1+srcList.length)%srcList.length;update()}};
   document.addEventListener('keydown',keyHandler);
   document.querySelector('#app').append(overlay);
   active={node:overlay,keyHandler};
   update();overlay.querySelector('[data-photo-close]').focus();
  }
  root.addEventListener('click',event=>{
   const img=event.target.closest('.store-live-preview .between-gallery img');
   if(!img)return;
   const all=[...root.querySelectorAll('.store-live-preview .between-gallery img')];
   open(all.map(el=>el.src),all.indexOf(img));
  });
  root.addEventListener('keydown',event=>{
   const img=event.target.closest('.store-live-preview .between-gallery img');
   if(img&&(event.key==='Enter'||event.key===' ')){event.preventDefault();img.click()}
  });
  const observer=new MutationObserver(()=>{
   root.querySelectorAll('.store-live-preview .between-gallery img').forEach((img,i)=>{
    img.setAttribute('tabindex','0');img.setAttribute('role','button');img.setAttribute('aria-label','비트윈 사진 '+(i+1)+' 크게 보기');
   });
   if(active&&!root.querySelector('.store-live-preview .between-gallery'))close();
  });
  observer.observe(root,{childList:true,subtree:false});
 }
 window.StillSeptemberExtras={renderNews,renderShortcuts,enhanceBetween};
})();