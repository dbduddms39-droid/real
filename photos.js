'use strict';

function renderPhotos(container) {
 const assets = window.PhonePhotoAssets || {photos: [], memoryPhotoId: null};
 const photos = assets.photos;
 const app = document.querySelector('#app');
 let galleryScroll = 0;
 let lastPhotoId = null;
 const today = new Date();
 const year = today.getFullYear() - 1;
 const day = Math.min(today.getDate(), new Date(year, today.getMonth() + 1, 0).getDate());
 const memoryDate = new Date(year, today.getMonth(), day).toLocaleDateString('ko-KR', {
  year: 'numeric', month: 'long', day: 'numeric',
 });

 function image(photo, eager = false) {
  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = photo.alt;
  img.loading = eager ? 'eager' : 'lazy';
  img.decoding = 'async';
  img.draggable = false;
  return img;
 }

 function openPhoto(index) {
  galleryScroll = container.scrollTop;
  lastPhotoId = photos[index].id;
  showPhoto(index);
 }

 function showGallery() {
  app.classList.remove('dark-app', 'photo-viewer-mode');
  app.classList.add('photos-app');
  container.innerHTML = '<div class="photos-heading"><h1>보관함</h1><span class="photos-count"></span></div>';
  container.querySelector('.photos-count').textContent = `${photos.length}장의 사진`;
  if (!photos.length) {
   const empty = document.createElement('p');
   empty.className = 'photos-empty';
   empty.textContent = '아직 사진이 없어요.';
   container.append(empty);
   return;
  }
  const memoryIndex = photos.findIndex(photo => photo.id === assets.memoryPhotoId);
  if (memoryIndex !== -1) {
   const section = document.createElement('section');
   section.className = 'photos-memories';
   section.setAttribute('aria-label', '추억');
   section.innerHTML = '<h2>추억</h2><button class="photo-memory"><span class="photo-memory-caption"><strong>1년 전 오늘</strong><span></span></span></button>';
   const card = section.querySelector('button');
   card.setAttribute('aria-label', '1년 전 오늘 사진 보기');
   card.prepend(image(photos[memoryIndex], true));
   card.querySelector('.photo-memory-caption>span').textContent = memoryDate;
   card.onclick = () => openPhoto(memoryIndex);
   container.append(section);
  }
  const heading = document.createElement('h2');
  heading.className = 'photos-grid-heading';
  heading.textContent = '모든 사진';
  const grid = document.createElement('div');
  grid.className = 'photos-grid';
  grid.setAttribute('aria-label', '모든 사진');
  photos.forEach((photo, index) => {
   const button = document.createElement('button');
   button.className = 'photo-tile';
   button.dataset.photoId = photo.id;
   button.setAttribute('aria-label', `${photo.alt} 열기`);
   button.append(image(photo, index < 3));
   button.onclick = () => openPhoto(index);
   grid.append(button);
  });
  container.append(heading, grid);
  container.scrollTop = galleryScroll;
  if (lastPhotoId) [...grid.children].find(button => button.dataset.photoId === lastPhotoId)?.focus({preventScroll: true});
 }

 function showPhoto(index) {
  const photo = photos[index];
  lastPhotoId = photo.id;
  app.classList.add('dark-app', 'photo-viewer-mode');
  container.innerHTML = '<div class="photo-viewer"><div class="photo-viewer-toolbar"><button class="photos-back">‹ 보관함</button><span class="photo-counter" aria-live="polite"></span></div><div class="photo-viewer-stage"></div><div class="photo-viewer-controls"><button class="photo-previous" aria-label="이전 사진">‹</button><button class="photo-next" aria-label="다음 사진">›</button></div></div>';
  const viewer = container.querySelector('.photo-viewer');
  viewer.querySelector('.photo-counter').textContent = `${index + 1} / ${photos.length}`;
  viewer.querySelector('.photo-viewer-stage').append(image(photo, true));
  const back = viewer.querySelector('.photos-back');
  back.onclick = showGallery;
  const previous = viewer.querySelector('.photo-previous');
  const next = viewer.querySelector('.photo-next');
  previous.disabled = index === 0;
  next.disabled = index === photos.length - 1;
  previous.onclick = () => showPhoto(index - 1);
  next.onclick = () => showPhoto(index + 1);
  viewer.onkeydown = event => {
   if (event.key === 'Escape') {event.stopPropagation(); showGallery();}
   else if (event.key === 'ArrowLeft' && index > 0) {event.preventDefault(); showPhoto(index - 1);}
   else if (event.key === 'ArrowRight' && index < photos.length - 1) {event.preventDefault(); showPhoto(index + 1);}
  };
  let swipe = null;
  viewer.querySelector('.photo-viewer-stage').onpointerdown = event => {swipe = {x: event.clientX, y: event.clientY};};
  viewer.querySelector('.photo-viewer-stage').onpointerup = event => {
   if (!swipe) return;
   const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y;
   swipe = null;
   if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
   if (dx < 0 && index < photos.length - 1) showPhoto(index + 1);
   else if (dx > 0 && index > 0) showPhoto(index - 1);
  };
  viewer.querySelector('.photo-viewer-stage').onpointercancel = () => {swipe = null;};
  container.scrollTop = 0;
  back.focus({preventScroll: true});
 }

 showGallery();
}
