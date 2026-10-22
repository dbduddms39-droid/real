/* App artwork: original Apple PNGs. Small interface symbols are locally drawn. */
window.PhoneIcons = (() => {
const paths={
 airdrop:'<circle cx="12" cy="10" r="2"/><path d="M7.5 14.5a6 6 0 1 1 9 0M5 17a9 9 0 1 1 14 0M12 15l-4 7h8Z"/>',
 link:'<path d="m9 8-2 2a4 4 0 0 0 6 6l2-2M15 16l2-2a4 4 0 0 0-6-6l-2 2M8 16l8-8"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
 search:'<circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.5 4.5"/>',
 back:'<path d="m15 4-8 8 8 8"/>',chevron:'<path d="m9 5 7 7-7 7"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 wifi:'<path d="M2 8a16 16 0 0 1 20 0M5.5 11.5a10.5 10.5 0 0 1 13 0M9 15a5 5 0 0 1 6 0"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>',
 signal:'<path d="M3 18v2M8 14v6M13 9v11M18 4v16" stroke-width="3.2"/>',
 sun:'<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/><path d="M12 1v2M12 21v2M1 12h2M21 12h2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
 location:'<path d="m20 3-6.2 17-3.1-7-7-3.1Z" fill="currentColor" stroke="none"/>',
 lock:'<rect x="5" y="10" width="14" height="12" rx="3" fill="currentColor" stroke="none"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke-width="2.5"/>',
 flashlight:'<path d="M6 3h12v4l-4 5v9h-4v-9L6 7Z" fill="currentColor" stroke="none"/><path d="M6 6h12" stroke="#777" stroke-width="1"/>',
 camera:'<path d="M3 7h4l2-3h6l2 3h4v13H3Z" fill="currentColor" stroke="none"/><circle cx="12" cy="13" r="4" stroke="#777" stroke-width="2"/>',
 airplane:'<path d="m22 10-8-3V2l-2-1-2 1v5l-8 3v3l8-1v6l-3 2v2l5-1 5 1v-2l-3-2v-6l8 1Z" fill="currentColor" stroke="none"/>',
 cellular:'<path d="M12 9v13M9 22h6M8 6a6 6 0 0 0 0 8M16 6a6 6 0 0 1 0 8M5 3a10 10 0 0 0 0 14M19 3a10 10 0 0 1 0 14"/><circle cx="12" cy="8" r="2" fill="currentColor" stroke="none"/>',
 bluetooth:'<path d="M7 6 17 16 12 21V3l5 5L7 18"/>',
 moon:'<path d="M19 16A9 9 0 0 1 8 4a9 9 0 1 0 11 12Z" fill="currentColor" stroke="none"/>',
 rotation:'<path d="M6 7a8 8 0 1 1-2 9M2 6h5v5"/><rect x="9" y="11" width="6" height="6" rx="1"/><path d="M10 11V9a2 2 0 0 1 4 0v2"/>',
 mirror:'<rect x="2" y="3" width="15" height="12" rx="2"/><rect x="7" y="9" width="15" height="12" rx="2"/>',
 volume:'<path d="M3 9h4l5-5v16l-5-5H3Z" fill="currentColor" stroke="none"/><path d="M16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/>',
 music:'<path d="M9 18V5l11-2v13M9 9l11-2" stroke-width="2.5"/><ellipse cx="6" cy="18" rx="3" ry="2.5" fill="currentColor"/><ellipse cx="17" cy="16" rx="3" ry="2.5" fill="currentColor"/>',
 pause:'<path d="M7 4v16M17 4v16" stroke-width="5"/>',
 repeat:'<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/>',
 play:'<path d="m7 3 14 9-14 9Z" fill="currentColor" stroke="none"/>',
 previous:'<path d="m12 5-10 7 10 7Zm10 0-10 7 10 7Z" fill="currentColor" stroke="none"/>',
 next:'<path d="m2 5 10 7-10 7Zm10 0 10 7-10 7Z" fill="currentColor" stroke="none"/>',
 expand:'<path d="M9 3H3v6M15 3h6v6M3 15v6h6M15 21h6v-6"/>',
 power:'<path d="M12 2v10M6 5a9 9 0 1 0 12 0"/>',
 timer:'<circle cx="12" cy="14" r="8"/><path d="M9 2h6M12 2v4M18 5l2 2M12 9v5l3 2"/>',
 calculator:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/>',
};
function symbol(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.sun}</svg>`}
let nextId=0;
const accents={
 'FaceTime':{channel:0,base:.18,color:[.22,.85,.36]},'전화':{channel:0,base:.18,color:[.22,.85,.36]},'메시지':{channel:0,base:.18,color:[.22,.85,.36]},
 '메일':{channel:0,base:.12,color:[.20,.63,1]},'App Store':{channel:0,base:.12,color:[.20,.63,1]},
 '음악':{channel:1,base:.18,color:[1,.27,.39]},'팟캐스트':{channel:1,base:.28,color:[.73,.40,1]},
};
function materialFilter(name,mode,id){
 const accent=accents[name];
 if(mode==='dark'&&accent){
  const rows=accent.color.map(color=>{const scale=(color-.075)/(1-accent.base);const row=[0,0,0,.075-scale*accent.base,0];row[accent.channel]=scale;return row.join(' ')});
  return `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix values="${rows.join(' ')} 0 0 0 1 0"/></filter>`;
 }
 if(mode==='dark'&&name==='설정')return `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix values="-.9 0 0 .8 0 0 -.9 0 .8 0 0 0 -.9 .8 0 0 0 0 1 0"/></filter>`;
 if(mode==='dark'&&['사진','건강','뉴스','파일','도서','미리 알림','메모','캘린더','시계'].includes(name)){
  return `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 16 16 16 0 -45" result="white"/><feFlood flood-color="#18191d"/><feComposite in2="white" operator="in" result="dark"/><feComposite in="dark" in2="SourceGraphic" operator="over"/></filter>`;
 }
 if(mode==='clear'){
  const row=[0,0,0,0,0];
  if(accent){const scale=.72/(1-accent.base);row[accent.channel]=scale;row[3]=.12-scale*accent.base}
  else{row[0]=row[1]=row[2]=-.24;row[3]=.88}
  return `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix values="0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 ${row.join(' ')}"/></filter>`;
 }
 return '';
}
function calendarOverlay(mode){
 const clear=mode==='clear',dark=mode==='dark';const background=clear?'rgba(230,242,255,.12)':dark?'#19191d':'#fff';
 const now=new Date(),day=now.getDate(),weekday=now.toLocaleDateString('ko-KR',{weekday:'long'});
 return `<rect x="6" y="7" width="88" height="85" rx="5" fill="${background}"/><text data-calendar-weekday x="50" y="24" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif" font-size="15" font-weight="400" fill="${clear?'#ffffffdc':'#f53a43'}">${weekday}</text><text data-calendar-date x="50" y="82" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif" font-size="57" font-weight="300" letter-spacing="-2" fill="${clear||dark?'#fff':'#141416'}">${day}</text>`;
}
function clockOverlay(mode){
 const dark=mode==='dark',clear=mode==='clear',ink=dark||clear?'#f7f7fa':'#18181b',face=clear?'rgba(255,255,255,.12)':dark?'#1b1b1f':'#fff';
 const numbers=Array.from({length:12},(_,i)=>{const hour=i+1,angle=hour*Math.PI/6;return `<text x="${50+Math.sin(angle)*33}" y="${50-Math.cos(angle)*33+4}" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif" font-size="12" font-weight="450" fill="${ink}">${hour}</text>`}).join('');
 const ticks=Array.from({length:60},(_,i)=>`<path d="M50 6v${i%5?2.5:4}" transform="rotate(${i*6} 50 50)" stroke="${ink}" stroke-width="${i%5?.65:1.1}" opacity="${i%5?.55:1}"/>`).join('');
 return `<rect x="4" y="4" width="92" height="92" rx="20" fill="${face}"/>${ticks}${numbers}<path data-clock-hand="hour" d="M50 53V29" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><path data-clock-hand="minute" d="M50 54V18" stroke="${ink}" stroke-width="2" stroke-linecap="round"/><path data-clock-hand="second" d="M50 58V14" stroke="#ff9b22" stroke-width="1"/><circle cx="50" cy="50" r="2.3" fill="#ff9b22"/>`;
}
function app(name,mode='light'){
 const asset=window.PhoneIconAssets[name];
 if(!asset)return symbol('expand');
 const [x,y,width,height]=asset.viewBox;const id='native-material-'+(++nextId);const filter=materialFilter(name,mode,id);const live=['캘린더','시계'].includes(name);
 const background=mode==='clear'?'<rect width="100" height="100" rx="22" fill="rgba(235,245,255,.13)" stroke="rgba(255,255,255,.55)" stroke-width="1.2"/>':'';
 const image=mode==='clear'&&live?'':`<image href="${asset.data}" x="${-x/width*100}" y="${-y/height*100}" width="${asset.width/width*100}" height="${asset.height/height*100}" preserveAspectRatio="none"${filter?` filter="url(#${id})"`:''}/>`;
 const overlay=name==='캘린더'?calendarOverlay(mode):name==='시계'?clockOverlay(mode):'';
 return `<svg class="native-icon" data-native-icon="${name}" viewBox="0 0 100 100" aria-hidden="true"><defs>${filter}</defs>${background}${image}${overlay}</svg>`;
}
return {symbol,app};
})();
