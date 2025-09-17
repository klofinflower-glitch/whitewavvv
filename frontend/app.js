// Basic store with persistence
const store = {
  gender: 'men',
  categories: {
    men: [
      { id:'men-sneakers', title:'Кроссовки и кеды' },
      { id:'men-boots', title:'Ботинки' },
      { id:'men-sport', title:'Обувь для спорта' },
      { id:'men-slides', title:'Тапки' },
      { id:'men-coats', title:'Верхняя одежда' },
      { id:'men-tees', title:'Футболки' }
    ],
    women: [
      { id:'women-sneakers', title:'Кроссовки и кеды' },
      { id:'women-boots', title:'Ботинки' },
      { id:'women-sport', title:'Обувь для спорта' },
      { id:'women-slides', title:'Тапки' },
      { id:'women-coats', title:'Верхняя одежда' },
      { id:'women-tees', title:'Футболки' }
    ]
  },
  products: [
    { id: 'p1', title: 'Куртка SoftShell', brand: 'WHITEWAVE', price: 5061, gender: 'women', cat:'women-coats' },
    { id: 'p2', title: 'Жакет Oversize', brand: 'WHITEWAVE', price: 6699, gender: 'women', cat:'women-coats' },
    { id: 'p3', title: 'Бомбер Varsity', brand: 'WHITEWAVE', price: 6073, gender: 'men', cat:'men-coats' },
    { id: 'p4', title: 'Ветровка Logo', brand: 'WHITEWAVE', price: 12521, gender: 'men', cat:'men-coats' }
  ],
  fav: JSON.parse(localStorage.getItem('fav')||'[]'),
  cart: JSON.parse(localStorage.getItem('cart')||'[]'),
  referrals: { invites: 0, subs: 0, earned: 0 }
};

let tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
const inviteBtn = document.getElementById('inviteBtn');
if (inviteBtn){ inviteBtn.onclick = () => {
  const uid = tg && tg.initDataUnsafe && tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : 'guest';
  const link = `https://t.me/${BOT_USERNAME}?start=ref_${uid}`;
  navigator.clipboard && navigator.clipboard.writeText(link);
  toast('Ссылка скопирована'); haptic('medium');
}; }
if (tg) {
  tg.ready();
  document.documentElement.dataset.theme = tg.colorScheme || 'light';
  tg.onEvent('themeChanged', () => document.documentElement.dataset.theme = tg.colorScheme || 'light');
}

const fmt = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
const el = sel => document.querySelector(sel);
const tpl = id => document.getElementById(id).content.firstElementChild.cloneNode(true);
const showPage = id => { for (const s of document.querySelectorAll('main .page')) s.classList.remove('active'); el('#'+id).classList.add('active'); };
function save(){ localStorage.setItem('fav', JSON.stringify(store.fav)); localStorage.setItem('cart', JSON.stringify(store.cart)); }

// Routing via tabs
for (const t of document.querySelectorAll('.tabbar .tab')) {
  t.onclick = () => {
    for (const x of document.querySelectorAll('.tabbar .tab')) x.classList.remove('active');
    t.classList.add('active');
    const map = {home:'page-home', fav:'page-fav', cart:'page-cart', friends:'page-friends', settings:'page-settings'};
    showPage(map[t.dataset.target]);
  };
}
el('#btnBack').onclick = () => history.back();

// Gender chips
for (const c of document.querySelectorAll('.chips .chip')) {
  c.onclick = () => {
    for (const x of document.querySelectorAll('.chips .chip')) x.classList.remove('chip--active');
    c.classList.add('chip--active');
    store.gender = c.dataset.gender; renderCategories();
  };
}

// Categories
function renderCategories(){
  const grid = el('#categoryGrid'); grid.innerHTML='';
  for (const c of store.categories[store.gender]){
    const div = document.createElement('div'); div.className='category-card';
    div.innerHTML = `<div class="title">${c.title}</div><div class="thumb" style="height:64px;border-radius:12px;background:#f1f2f6"></div>`;
    div.onclick = () => openCategory(c);
    grid.appendChild(div);
  }
}
function openCategory(cat){ currentCat = cat; currentQuery=''; activeFilters.clear(); if (searchInput()) searchInput().value=''; if (sortSelect()) sortSelect().value='popular';
  el('#catTitle').textContent = cat.title;
  bindCategoryControls();
  renderCategoryGrid();
  return;
  // legacy below
  const grid = el('#catGrid'); grid.innerHTML='';
  for (const p of store.products.filter(p=>p.cat===cat.id || cat.id.includes(p.gender))){
    const card = tpl('tpl-product'); card.dataset.id = p.id;
    card.querySelector('.brand').textContent = p.brand;
    card.querySelector('.title').textContent = p.title;
    card.querySelector('.price').textContent = fmt(p.price);
    card.querySelector('.btn-add').onclick = () => addToCart(p.id);
    const favBtn = card.querySelector('.fav-btn');
    favBtn.onclick = () => toggleFav(p.id, favBtn);
    if (store.fav.includes(p.id)) favBtn.textContent = '❤';
    // open details
    card.querySelector('.img').onclick = () => openDetail(p);
    card.querySelector('.title').onclick = () => openDetail(p);
    grid.appendChild(card);
  }
  showPage('page-category');
}

// Favorites
function toggleFav(id, btn){
  const i = store.fav.indexOf(id);
  if (i>=0) store.fav.splice(i,1); else store.fav.push(id);
  save(); renderFav(); if(btn) btn.textContent = store.fav.includes(id) ? '❤' : '♡';
}
function renderFav(){
  const grid = el('#favGrid'); grid.innerHTML='';
  if (store.fav.length===0){ el('#page-fav .empty').style.display='block'; return; }
  el('#page-fav .empty').style.display='none';
  for (const id of store.fav){
    const p = store.products.find(x=>x.id===id); if(!p) continue;
    const card = tpl('tpl-product'); card.dataset.id=p.id;
    card.querySelector('.brand').textContent=p.brand;
    card.querySelector('.title').textContent=p.title;
    card.querySelector('.price').textContent=fmt(p.price);
    card.querySelector('.btn-add').onclick = () => addToCart(p.id);
    const favBtn = card.querySelector('.fav-btn'); favBtn.textContent='❤'; favBtn.onclick = () => toggleFav(p.id, favBtn);
    card.querySelector('.img').onclick = () => openDetail(p);
    card.querySelector('.title').onclick = () => openDetail(p);
    grid.appendChild(card);
  }
  el('#favCount').textContent = store.fav.length;
}

// Cart
function addToCart(id){ haptic('light');
  const it = store.cart.find(x=>x.id===id);
  if(it) it.qty+=1; else store.cart.push({id, qty:1});
  save(); renderCart(); updateCartBadge();
}
function renderCart(){
  const list = el('#cartList'); const empty = el('#cartEmpty'); const footer = el('#cartFooter');
  list.innerHTML='';
  if (store.cart.length===0){ empty.style.display='block'; footer.style.display='none'; }
  else { empty.style.display='none'; footer.style.display='grid'; }
  let total=0;
  for (const it of store.cart){
    const p = store.products.find(x=>x.id===it.id); if(!p) continue;
    total += p.price*it.qty;
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `
      <div class="cart-thumb"></div>
      <div class="cart-meta">
        <div class="name">${p.title}</div>
        <div class="brand">${p.brand}</div>
        <div class="price">${fmt(p.price)}</div>
      </div>
      <div class="qty">
        <button aria-label="-" data-id="${p.id}">−</button>
        <strong>${it.qty}</strong>
        <button aria-label="+" data-id="${p.id}">+</button>
      </div>`;
    const [minus, plus] = row.querySelectorAll('.qty button');
    minus.onclick = () => { it.qty = Math.max(0, it.qty-1); if(it.qty===0) store.cart = store.cart.filter(x=>x.qty>0); save(); renderCart(); updateCartBadge(); };
    plus.onclick = () => { it.qty += 1; save(); renderCart(); updateCartBadge(); };
    list.appendChild(row);
  }
  el('#cartTotal').textContent = fmt(total);
}
function updateCartBadge(){
  const count = store.cart.reduce((a,b)=>a+b.qty,0);
  const b = el('#cartBadge'); if (count>0){ b.classList.remove('hidden'); b.textContent = count; } else b.classList.add('hidden');
}
el('#checkoutBtn').onclick = () => { showPage('page-checkout'); for (const t of document.querySelectorAll('.tabbar .tab')) t.classList.remove('active'); };

// Checkout submit (mock)
el('#checkoutForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const form = new FormData(e.target);
  let promo = form.get('promo') || '';
  let totalNumber = store.cart.reduce((sum,it)=>{ const p=store.products.find(x=>x.id===it.id); return sum + (p?p.price*it.qty:0); },0);
  if (promo.trim().toUpperCase()==='WELCOME10') totalNumber = Math.round(totalNumber*0.9);
  el('#cartTotal').textContent = fmt(totalNumber);
  const payload = {
    name: form.get('name'), phone: form.get('phone'), address: form.get('address'),
    pay: form.get('pay'), cart: store.cart, total: el('#cartTotal').textContent
  };
  try {
    // Optional: verify initData on your backend (see backend/server.mjs)
    // const r = await fetch(BACKEND_URL + '/cart/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    // const j = await r.json();
    alert('Заказ отправлен! Мы свяжемся с вами.');
    store.cart = []; save(); renderCart(); updateCartBadge();
    showPage('page-home');
  } catch(e){ alert('Ошибка оформления'); }
});

// Detail sheet
const detailEl = document.getElementById('productDetail');
detailEl.querySelector('.detail-backdrop').onclick = () => detailEl.classList.remove('show');
// Detail sheet enhanced (gallery, colors, related)
const galleryEl = document.getElementById('detailGallery');
const colorRow = document.getElementById('colorRow');
const relatedRow = document.getElementById('relatedRow');

function renderRelated(p){
  relatedRow.innerHTML='';
  const siblings = store.products.filter(x => x.id!==p.id && (x.cat===p.cat || x.brand===p.brand)).slice(0,4);
  for (const r of siblings){
    const div = document.createElement('div');
    div.className = 'product-card'; div.style.width='44%'; div.style.padding='8px';
    div.innerHTML = `<div class="img skeleton"></div><div class="info"><div class="brand">${r.brand}</div><div class="title">${r.title}</div><div class="price">${fmt(r.price)}</div></div>`;
    div.onclick = () => openDetail(r);
    relatedRow.appendChild(div);
  }
}

function openDetail(p){
  detailEl.querySelector('.detail-brand').textContent = p.brand;
  detailEl.querySelector('.detail-title').textContent = p.title;
  detailEl.querySelector('.detail-price').textContent = fmt(p.price);
  // gallery
  galleryEl.innerHTML='';
  const imgs = p.images && p.images.length ? p.images : ['placeholder'];
  imgs.forEach((_,i)=>{
    const g = document.createElement('div'); g.className='img skeleton'; g.style.height='80px'; g.style.borderRadius='10px'; g.style.margin='6px';
    galleryEl.appendChild(g);
  });
  // colors
  colorRow.innerHTML='';
  const colors = p.colors && p.colors.length ? p.colors : ['Черный','Белый','Синий'];
  colors.forEach(c=>{
    const b = document.createElement('button'); b.className='chip'; b.textContent=c;
    b.onclick = ()=>{ for(const x of colorRow.children) x.classList.remove('chip--active'); b.classList.add('chip--active'); };
    colorRow.appendChild(b);
  });
  // sizes
  const row = detailEl.querySelector('.size-row'); row.innerHTML='';
  (p.sizes && p.sizes.length ? p.sizes : ['XS','S','M','L','XL']).forEach(s=>{
    const b = document.createElement('button'); b.className='chip'; b.textContent = s;
    b.onclick = ()=>{ for (const x of row.children) x.classList.remove('chip--active'); b.classList.add('chip--active'); };
    row.appendChild(b);
  });
  detailEl.querySelector('.detail-add').onclick = () => { addToCart(p.id); toast('Добавлено в корзину'); haptic('light'); track('add_to_cart', {id:p.id}); };
  renderRelated(p);
  detailEl.classList.add('show');
}


// ===== Helpers: toast, haptics =====
const BOT_USERNAME = 'your_bot'; // TODO: поменяй на имя твоего бота
function toast(msg){ const t = el('#toast'); t.textContent = msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 1800); }
function haptic(type='impact'){ if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred(type); }

// ===== Search + Filter + Sort =====
let currentCat = null;
let currentSort = 'popular';
let currentQuery = '';
let activeFilters = new Set();

const searchInput = () => el('#catSearch');
const sortSelect = () => el('#sortSelect');

function applyFilters(items){
  let arr = items.slice();
  if (currentQuery.trim()){
    const q = currentQuery.trim().toLowerCase();
    arr = arr.filter(p => (p.title + ' ' + (p.brand||'')).toLowerCase().includes(q));
  }
  // Example filters (stub): 'fast' returns every second product as "fast" just for demo
  if (activeFilters.has('fast')){
    arr = arr.filter((_,i)=> i%2===0);
  }
  if (currentSort==='price_up') arr.sort((a,b)=>a.price-b.price);
  else if (currentSort==='price_down') arr.sort((a,b)=>b.price-a.price);
  return arr;
}

function bindCategoryControls(){
  const s = searchInput();
  if (s && !s._bound){
    s._bound = true;
    s.addEventListener('input', (e)=>{ currentQuery = e.target.value; renderCategoryGrid(); });
  }
  const sel = sortSelect();
  if (sel && !sel._bound){
    sel._bound = true;
    sel.addEventListener('change', (e)=>{ currentSort = e.target.value; renderCategoryGrid(); });
  }
  for (const f of document.querySelectorAll('#filterRow .chip')){
    if (!f._bound){
      f._bound = true;
      f.addEventListener('click', ()=>{
        const key = f.dataset.filter || f.textContent;
        if (activeFilters.has(key)) { activeFilters.delete(key); f.classList.remove('chip--active'); }
        else { activeFilters.add(key); f.classList.add('chip--active'); }
        renderCategoryGrid();
      });
    }
  }
}

function renderCategoryGrid(){
  const grid = el('#catGrid'); grid.innerHTML='';
  const items = store.products.filter(p => !currentCat || p.cat===currentCat.id || currentCat.id.includes(p.gender));
  for (const p of applyFilters(items)){
    const card = tpl('tpl-product'); card.dataset.id = p.id;
    card.querySelector('.brand').textContent = p.brand;
    card.querySelector('.title').textContent = p.title;
    card.querySelector('.price').textContent = fmt(p.price);
    card.querySelector('.btn-add').onclick = () => { addToCart(p.id); toast('Добавлено в корзину'); haptic('light'); };
    const favBtn = card.querySelector('.fav-btn');
    favBtn.onclick = () => { toggleFav(p.id, favBtn); toast(store.fav.includes(p.id) ? 'В избранном' : 'Убрано из избранного'); haptic('light'); };
    if (store.fav.includes(p.id)) favBtn.textContent = '❤';
    card.querySelector('.img').onclick = () => openDetail(p);
    card.querySelector('.title').onclick = () => openDetail(p);
    grid.appendChild(card);
  }
}

// Initial
renderCategories(); renderFav(); renderCart(); updateCartBadge();

// Telegram MainButton on Checkout
function setupMainButton(){
  if (!tg || !tg.MainButton) return;
  tg.MainButton.setText('Подтвердить заказ');
  tg.MainButton.onClick(()=>{ const form = document.getElementById('checkoutForm'); form && form.requestSubmit(); });
}
const checkoutPage = document.getElementById('page-checkout');
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn){ checkoutBtn.addEventListener('click', ()=>{ setupMainButton(); }); }
