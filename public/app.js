const API = '';
const ROLES = {
  owner:    { color:'#FFD700', icon:'👑', label:'Owner'    },
  admin:    { color:'#FF4444', icon:'⚡', label:'Admin'    },
  burmalda: { color:'#FF8C00', icon:'🔥', label:'Burmalda' },
  drun:     { color:'#A855F7', icon:'💜', label:'Друн'     },
  powerful: { color:'#3B82F6', icon:'💎', label:'Мощный'   },
  valodya:  { color:'#22C55E', icon:'✅', label:'Валодя'   },
  user:     { color:'#6B7280', icon:'⬜', label:'User'     },
};

let token = localStorage.getItem('ac_token');
let me = null;

async function api(method, url, body) {
  const res = await fetch(API + url, {
    method, headers: { 'Content-Type':'application/json', ...(token ? {'Authorization':'Bearer '+token} : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const newToken = res.headers.get('Authorization');
  if (newToken) { token = newToken.replace('Bearer ',''); localStorage.setItem('ac_token', token); }
  return res;
}

function roleTag(role) {
  const r = ROLES[role] || ROLES.user;
  return `<span style="color:${r.color};font-weight:700;font-size:13px">${r.icon} ${r.label}</span>`;
}

function subBadge(user) {
  if (!user.subscription) return `<span style="color:#ef4444;font-size:12px">❌ Нет подписки</span>`;
  if (!user.subExpiry) return `<span style="color:#22c55e;font-size:12px">✅ Навсегда</span>`;
  return `<span style="color:#22c55e;font-size:12px">✅ до ${new Date(user.subExpiry).toLocaleDateString()}</span>`;
}

const CSS = `
<style>
.page{max-width:1100px;margin:0 auto;padding:24px 16px}
.nav{background:#111118;border-bottom:1px solid rgba(255,255,255,0.06);padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:60px}
.nav-logo{font-size:20px;font-weight:700;background:linear-gradient(90deg,#7c3aed,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav-links{display:flex;gap:8px}
.nav-btn{background:transparent;border:none;color:#9ca3af;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:14px;transition:.2s}
.nav-btn:hover{background:rgba(255,255,255,0.05);color:#fff}
.nav-btn.active{color:#a855f7}
.nav-btn-primary{background:linear-gradient(90deg,#7c3aed,#a855f7);color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600}
.card{background:#111118;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:28px}
.input{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px 16px;color:#fff;font-size:14px;outline:none;transition:.2s}
.input:focus{border-color:#7c3aed;background:rgba(124,58,237,0.1)}
.btn{background:linear-gradient(90deg,#7c3aed,#a855f7);border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;padding:13px;cursor:pointer;width:100%;transition:.2s;letter-spacing:.5px}
.btn:hover{opacity:.9;transform:translateY(-1px)}
.btn-outline{background:transparent;border:1px solid rgba(255,255,255,0.1);color:#9ca3af}
.btn-outline:hover{border-color:#7c3aed;color:#fff}
.btn-sm{padding:7px 14px;font-size:12px;width:auto;border-radius:8px}
.btn-red{background:#ef4444}
.btn-green{background:#22c55e}
.error{color:#ef4444;font-size:12px;margin-top:6px}
.success{color:#22c55e;font-size:12px;margin-top:6px}
.table{width:100%;border-collapse:collapse}
.table th,.table td{padding:12px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px}
.table th{color:#6b7280;font-weight:600;font-size:12px;text-transform:uppercase}
.table tr:hover td{background:rgba(255,255,255,0.02)}
.badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
.stat{background:#1a1a24;border-radius:12px;padding:20px;text-align:center}
.stat-val{font-size:32px;font-weight:700;background:linear-gradient(90deg,#7c3aed,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat-lbl{color:#6b7280;font-size:13px;margin-top:4px}
.modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px)}
.modal-box{background:#111118;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:32px;width:440px;max-width:95vw}
.tag{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
label{font-size:13px;color:#9ca3af;margin-bottom:6px;display:block}
.flex{display:flex;align-items:center;gap:8px}
.mt{margin-top:16px}
.mb{margin-bottom:16px}
h2{font-size:22px;font-weight:700;margin-bottom:4px}
h3{font-size:16px;font-weight:700;margin-bottom:16px}
p.sub{color:#6b7280;font-size:14px;margin-bottom:24px}
.hero{text-align:center;padding:80px 16px}
.hero h1{font-size:56px;font-weight:800;line-height:1.1;margin-bottom:16px}
.hero h1 span{background:linear-gradient(90deg,#7c3aed,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{color:#9ca3af;font-size:18px;margin-bottom:40px}
.hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin:60px 0}
.feature{background:#111118;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:24px}
.feature-icon{font-size:32px;margin-bottom:12px}
.feature h3{font-size:16px;margin-bottom:8px}
.feature p{color:#6b7280;font-size:14px}
.tabs{display:flex;gap:4px;background:#0a0a0f;border-radius:10px;padding:4px;margin-bottom:24px}
.tab{flex:1;padding:10px;text-align:center;border-radius:8px;cursor:pointer;font-size:14px;color:#6b7280;transition:.2s}
.tab.active{background:#111118;color:#fff;font-weight:600}
.copy-btn{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#9ca3af;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px}
.copy-btn:hover{color:#fff}
</style>`;

function render(html) { document.getElementById('app').innerHTML = CSS + html; }

// ── NAVBAR ────────────────────────────────────────────────
function navbar(page) {
  const isAdmin = me && ['owner','admin','valodya'].includes(me.role);
  return `<nav class="nav">
    <div class="nav-logo">🍎 AppleClient</div>
    <div class="nav-links">
      <button class="nav-btn ${page==='home'?'active':''}" onclick="showHome()">Главная</button>
      <button class="nav-btn ${page==='plans'?'active':''}" onclick="showPlans()">Тарифы</button>
      <button class="nav-btn ${page==='irc'?'active':''}" onclick="showIRC()">💬 IRC</button>
      ${me ? `
        <button class="nav-btn ${page==='cabinet'?'active':''}" onclick="showCabinet()">Кабинет</button>
        ${isAdmin ? `<button class="nav-btn ${page==='admin'?'active':''}" onclick="showAdmin()">⚙ Панель</button>` : ''}
        <button class="nav-btn" onclick="logout()">Выйти</button>
      ` : `
        <button class="nav-btn-primary" onclick="showAuth()">Войти</button>
      `}
    </div>
  </nav>`;
}

// ── ГЛАВНАЯ ───────────────────────────────────────────────
function showHome() {
  render(`${navbar('home')}
  <div class="page">
    <div class="hero">
      <h1>Играй на<br><span>максимум</span></h1>
      <p>Платный клиент с мощным функционалом.<br>Контроль, скорость и точность — всё уже внутри.</p>
      <div class="hero-btns">
        <button class="btn" style="width:auto;padding:14px 32px" onclick="${me ? 'showCabinet()' : 'showAuth()'}">
          ${me ? '🎮 Личный кабинет' : '🚀 Начать'}
        </button>
        <button class="btn btn-outline" style="width:auto;padding:14px 32px" onclick="window.open('https://t.me/Burmalda_jmv')">
          💬 Telegram
        </button>
        <button class="btn btn-outline" style="width:auto;padding:14px 32px" onclick="showPlans()">
          💎 Тарифы
        </button>
      </div>
    </div>
    <div class="features">
      <div class="feature"><div class="feature-icon">⚡</div><h3>Высокая производительность</h3><p>Оптимизирован для максимального FPS и минимальных задержек</p></div>
      <div class="feature"><div class="feature-icon">🔒</div><h3>HWID защита</h3><p>Привязка к железу — защита от распространения</p></div>
      <div class="feature"><div class="feature-icon">🎨</div><h3>Кастомизация</h3><p>Гибкие настройки под любой стиль игры</p></div>
      <div class="feature"><div class="feature-icon">🛡</div><h3>Безопасность</h3><p>Регулярные обновления и защита аккаунта</p></div>
      <div class="feature"><div class="feature-icon">💎</div><h3>Поддержка</h3><p>Быстрая помощь через Telegram</p></div>
      <div class="feature"><div class="feature-icon">🔑</div><h3>Ключи активации</h3><p>Простая система активации подписки</p></div>
    </div>
  </div>`);
}

// ── ТАРИФЫ ────────────────────────────────────────────────
function showPlans() {
  const plans = [
    { label:'👑 Lifetime', days:0,   color:'#FFD700', price:'299₽ / 125₴',  desc:'Навсегда', popular:false },
    { label:'💎 180 дней', days:180, color:'#A855F7', price:'199₽ / 83₴',   desc:'6 месяцев', popular:true  },
    { label:'🔥 90 дней',  days:90,  color:'#FF8C00', price:'129₽ / 54₴',   desc:'3 месяца',  popular:false },
    { label:'⚡ 60 дней',  days:60,  color:'#FF4444', price:'89₽ / 37₴',    desc:'2 месяца',  popular:false },
    { label:'✅ 30 дней',  days:30,  color:'#22C55E', price:'59₽ / 25₴',    desc:'1 месяц',   popular:false },
    { label:'📅 14 дней',  days:14,  color:'#3B82F6', price:'39₽ / 16₴',    desc:'2 недели',  popular:false },
    { label:'🗓 7 дней',   days:7,   color:'#6B7280', price:'19₽ / 8₴',     desc:'1 неделя',  popular:false },
  ];

  render(`${navbar('plans')}
  <div class="page">
    <div style="text-align:center;padding:48px 0 32px">
      <h2 style="font-size:36px;font-weight:800">💎 Тарифы</h2>
      <p style="color:#6b7280;margin-top:8px;font-size:16px">Выберите подходящий план и напишите нам в Telegram</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;max-width:900px;margin:0 auto 60px">
      ${plans.map(p => `
      <div style="background:#111118;border:1px solid ${p.popular ? p.color : 'rgba(255,255,255,0.06)'};border-radius:14px;padding:20px;text-align:center;position:relative">
        ${p.popular ? `<div style="background:${p.color};color:#000;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;display:inline-block;margin-bottom:8px">🔥 ХИТ</div>` : '<div style="height:26px"></div>'}
        <div style="font-size:28px;margin-bottom:8px">${p.label.split(' ')[0]}</div>
        <div style="color:${p.color};font-weight:700;font-size:14px">${p.label.slice(2)}</div>
        <div style="color:#6b7280;font-size:12px;margin:4px 0 12px">${p.desc}</div>
        <div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:14px">${p.price}</div>
        <button class="btn btn-sm" style="background:${p.color};border:none;color:#000;font-weight:700;width:100%;padding:9px" onclick="window.open('https://t.me/Burmalda_jmv')">
          Купить
        </button>
      </div>`).join('')}
      <div style="background:#111118;border:1px solid #3B82F6;border-radius:14px;padding:20px;text-align:center">
        <div style="font-size:28px;margin-bottom:8px">🔄</div>
        <div style="color:#3B82F6;font-weight:700;font-size:14px">HWID Сброс</div>
        <div style="color:#6b7280;font-size:12px;margin:4px 0 12px">Смена устройства</div>
        <div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:14px">29₽ / 12₴</div>
        <button class="btn btn-sm" style="background:#3B82F6;border:none;color:#fff;font-weight:700;width:100%;padding:9px" onclick="window.open('https://t.me/Burmalda_jmv')">
          Купить
        </button>
      </div>
    </div>
    <div style="text-align:center;padding:24px;background:#111118;border-radius:16px;max-width:500px;margin:0 auto">
      <div style="font-size:24px;margin-bottom:8px">💬</div>
      <div style="font-weight:700;margin-bottom:6px">Покупка через Telegram</div>
      <div style="color:#6b7280;font-size:14px;margin-bottom:16px">После оплаты вы получите ключ активации</div>
      <button class="btn" style="width:auto;padding:12px 28px" onclick="window.open('https://t.me/Burmalda_jmv')">
        Написать @Burmalda_jmv
      </button>
    </div>
  </div>`);
}

// ── IRC ───────────────────────────────────────────────────
let ircWs = null;

function showIRC() {
  if (!me) { showAuth(); return; }
  render(`${navbar('irc')}
  <div class="page">
    <div style="max-width:800px;margin:24px auto">
      <h2 style="margin-bottom:4px">💬 IRC Чат</h2>
      <p style="color:#6b7280;font-size:14px;margin-bottom:16px">Общий чат для всех пользователей</p>
      <div class="card" style="padding:0;overflow:hidden">
        <div id="irc-msgs" style="height:420px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px"></div>
        <div style="border-top:1px solid rgba(255,255,255,0.06);padding:12px;display:flex;gap:8px">
          <input class="input" id="irc-input" placeholder="Сообщение..." style="flex:1" onkeydown="if(event.key==='Enter')sendIRC()">
          <button class="btn btn-sm" style="white-space:nowrap" onclick="sendIRC()">Отправить</button>
        </div>
      </div>
    </div>
  </div>`);
  connectIRC();
}

function connectIRC() {
  if (ircWs) ircWs.close();
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ircWs = new WebSocket(`${proto}://${location.host}`);

  ircWs.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'history') data.messages.forEach(addMsg);
    if (data.type === 'message') addMsg(data.message);
    if (data.type === 'clear') {
      const box = document.getElementById('irc-msgs');
      if (box) { box.innerHTML = ''; box.insertAdjacentHTML('beforeend', `<div style="color:#6b7280;font-size:12px;text-align:center">— Чат очищен —</div>`); }
    }
  };

  ircWs.onclose = () => {
    const box = document.getElementById('irc-msgs');
    if (box) box.insertAdjacentHTML('beforeend', `<div style="color:#6b7280;font-size:12px;text-align:center">Отключено</div>`);
  };
}

function addMsg(msg) {
  const box = document.getElementById('irc-msgs');
  if (!box) return;
  const r = ROLES[msg.role] || ROLES.user;
  const time = new Date(msg.time).toLocaleTimeString('ru', {hour:'2-digit',minute:'2-digit'});
  box.insertAdjacentHTML('beforeend', `
    <div style="display:flex;gap:8px;align-items:flex-start">
      <span style="color:#6b7280;font-size:11px;min-width:36px;margin-top:3px">${time}</span>
      <span style="color:${r.color};font-weight:700;font-size:13px;white-space:nowrap">${r.icon} ${msg.username}</span>
      <span style="font-size:14px;word-break:break-word">${escHtml(msg.text)}</span>
    </div>`);
  box.scrollTop = box.scrollHeight;
}

function sendIRC() {
  const input = document.getElementById('irc-input');
  const text = input?.value.trim();
  if (!text || !ircWs || ircWs.readyState !== 1) return;
  ircWs.send(JSON.stringify({ type: 'message', token, text }));
  input.value = '';
}

function escHtml(t) {
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── АВТОРИЗАЦИЯ ───────────────────────────────────────────
function showAuth(tab='login') {
  render(`${navbar('')}
  <div class="page" style="max-width:420px">
    <div class="card mt" style="margin-top:60px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:40px">🍎</div>
        <h2 style="margin-top:8px">AppleClient</h2>
      </div>
      <div class="tabs">
        <div class="tab ${tab==='login'?'active':''}" onclick="showAuth('login')">Войти</div>
        <div class="tab ${tab==='reg'?'active':''}" onclick="showAuth('reg')">Регистрация</div>
      </div>
      ${tab==='login' ? `
        <label>Логин или Email</label>
        <input class="input" id="login" placeholder="Введите логин...">
        <div style="height:12px"></div>
        <label>Пароль</label>
        <input class="input" id="password" type="password" placeholder="Введите пароль...">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <div id="captcha-q" style="background:#1a1a24;border-radius:8px;padding:10px 16px;font-size:15px;font-weight:700;white-space:nowrap"></div>
        <input class="input" id="captcha-a" placeholder="Ответ" style="width:90px">
      </div>
        <div id="auth-err" class="error"></div>
        <button class="btn mt" onclick="doLogin()">ВОЙТИ</button>
      ` : `
        <label>Никнейм</label>
        <input class="input" id="reg-username" placeholder="Ваш ник...">
        <div style="height:12px"></div>
        <label>Email</label>
        <input class="input" id="reg-email" placeholder="email@example.com">
        <div style="height:12px"></div>
        <label>Пароль</label>
        <input class="input" id="reg-password" type="password" placeholder="Минимум 6 символов...">
        <div style="height:12px"></div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
          <div id="captcha-q" style="background:#1a1a24;border-radius:8px;padding:10px 16px;font-size:15px;font-weight:700;white-space:nowrap"></div>
          <input class="input" id="captcha-a" placeholder="Ответ" style="width:90px">
        </div>
        <div id="auth-err" class="error"></div>
        <button class="btn mt" onclick="doRegister()">СОЗДАТЬ АККАУНТ</button>
      `}
    </div>
  </div>`);
  generateCaptcha();
}

let captchaAnswer = 0;

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * 2)]; // только + и -
  captchaAnswer = op === '+' ? a + b : a - b;
  const el = document.getElementById('captcha-q');
  if (el) el.textContent = `${a} ${op} ${b} = ?`;
}

function checkCaptcha() {
  const val = parseInt(document.getElementById('captcha-a')?.value);
  return val === captchaAnswer;
}

async function doLogin() {
  const login = document.getElementById('login').value.trim();
  const password = document.getElementById('password').value.trim();
  const err = document.getElementById('auth-err');
  if (!login || !password) { err.textContent = 'Заполните все поля'; return; }
  if (!checkCaptcha()) { err.textContent = 'Неверная капча'; generateCaptcha(); document.getElementById('captcha-a').value=''; return; }
  const res = await api('POST', '/api/login', { login, password });
  const data = await res.json();
  if (!res.ok) { err.textContent = data.message; return; }
  me = data.user;
  showCabinet();
}

async function doRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const err = document.getElementById('auth-err');
  if (!username || !email || !password) { err.textContent = 'Заполните все поля'; return; }
  if (!checkCaptcha()) { err.textContent = 'Неверная капча'; generateCaptcha(); document.getElementById('captcha-a').value=''; return; }
  const res = await api('POST', '/api/register', { username, email, password });
  const data = await res.json();
  if (!res.ok) { err.textContent = data.message; return; }
  me = data.user;
  showCabinet();
}

function logout() { token = null; me = null; localStorage.removeItem('ac_token'); showHome(); }

// ── КАБИНЕТ ───────────────────────────────────────────────
async function showCabinet() {
  if (!me) { showAuth(); return; }
  const res = await api('GET', '/api/me');
  if (!res.ok) { logout(); return; }
  me = await res.json();
  const r = ROLES[me.role] || ROLES.user;

  render(`${navbar('cabinet')}
  <div class="page">
    <div style="display:grid;grid-template-columns:280px 1fr;gap:20px;margin-top:24px">
      <div>
        <div class="card" style="text-align:center">
          <div style="width:80px;height:80px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:32px">${r.icon}</div>
          <div style="font-size:20px;font-weight:700">${me.username}</div>
          <div style="margin:8px 0">${roleTag(me.role)}</div>
          <div style="color:#6b7280;font-size:13px">UID: ${me.uid}</div>
          <div style="margin-top:12px">${subBadge(me)}</div>
        </div>
        <div class="card mt" style="margin-top:12px">
          <div style="font-size:13px;color:#6b7280;margin-bottom:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">Информация</div>
          <div style="font-size:13px;margin-bottom:8px;display:flex;justify-content:space-between"><span style="color:#6b7280">Email</span><span>${me.email}</span></div>
          <div style="font-size:13px;margin-bottom:8px;display:flex;justify-content:space-between"><span style="color:#6b7280">HWID</span><span>${me.hwid || '❌ Не привязан'}</span></div>
          <div style="font-size:13px;display:flex;justify-content:space-between"><span style="color:#6b7280">Регистрация</span><span>${new Date(me.createdAt).toLocaleDateString()}</span></div>
        </div>
      </div>
      <div>
        <div class="card">
          <h3>🎮 Скачать клиент</h3>
          ${me.subscription ? `
            <p style="color:#6b7280;font-size:14px;margin-bottom:16px">У вас активная подписка. Можете скачать последнюю версию.</p>
            <button class="btn" style="width:auto;padding:13px 28px" onclick="downloadClient()">⬇ Скачать AppleClient</button>
          ` : `
            <p style="color:#6b7280;font-size:14px;margin-bottom:16px">Для скачивания требуется подписка.</p>
            <button class="btn btn-outline" style="width:auto;padding:13px 28px" onclick="window.open('https://t.me/Burmalda_jmv')">💬 Купить подписку в TG</button>
          `}
        </div>
        <div class="card mt" style="margin-top:12px">
          <h3>🔑 Активация ключа</h3>
          <div style="display:flex;gap:8px">
            <input class="input" id="key-input" placeholder="AC-XXXX-XXXX-XXXX" style="flex:1">
            <button class="btn btn-sm" style="white-space:nowrap" onclick="activateKey()">Активировать</button>
          </div>
          <div id="key-msg" style="margin-top:8px;font-size:13px"></div>
        </div>
        ${me.role !== 'user' ? `
        <div class="card mt" style="margin-top:12px">
          <h3 style="color:${r.color}">${r.icon} Статус персонала</h3>
          <p style="color:#6b7280;font-size:14px">Вы являетесь членом команды AppleClient.</p>
        </div>` : ''}
      </div>
    </div>
    <div class="card" style="margin-top:20px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <h3 style="margin:0">💬 IRC Чат</h3>
        <span style="color:#6b7280;font-size:12px">— очищается каждые 30 мин</span>
      </div>
      <div id="irc-msgs" style="height:280px;overflow-y:auto;margin-bottom:12px;display:flex;flex-direction:column;gap:6px;background:#0a0a0f;border-radius:10px;padding:12px"></div>
      <div style="display:flex;gap:8px">
        <input class="input" id="irc-input" placeholder="Сообщение..." style="flex:1" onkeydown="if(event.key==='Enter')sendIRC()">
        <button class="btn btn-sm" style="white-space:nowrap" onclick="sendIRC()">Отправить</button>
      </div>
    </div>
  </div>`);
  connectIRC();

async function downloadClient() {
  const res = await api('GET', '/api/download');
  const data = await res.json();
  if (!res.ok) { alert(data.message); return; }
  window.location.href = data.url;
}

async function activateKey() {
  const key = document.getElementById('key-input').value.trim();
  const msg = document.getElementById('key-msg');
  if (!key) { msg.style.color='#ef4444'; msg.textContent='Введите ключ'; return; }
  const res = await api('POST', '/api/activate', { key });
  const data = await res.json();
  if (!res.ok) { msg.style.color='#ef4444'; msg.textContent=data.message; return; }
  msg.style.color='#22c55e'; msg.textContent=data.message;
  setTimeout(() => showCabinet(), 1500);
}

// ── АДМИН ПАНЕЛЬ ──────────────────────────────────────────
let adminTab = 'users';
let allUsers = [];
let allKeys = [];

async function showAdmin() {
  if (!me || !['owner','admin','valodya'].includes(me.role)) { showHome(); return; }
  const [usersRes, keysRes] = await Promise.all([
    api('GET', '/api/admin/users'),
    canAdmin() ? api('GET', '/api/admin/keys') : Promise.resolve(null)
  ]);
  if (usersRes.ok) allUsers = (await usersRes.json()).users;
  if (keysRes && keysRes.ok) allKeys = (await keysRes.json()).keys;
  renderAdmin();
}

function canAdmin() { return me && ['owner','admin'].includes(me.role); }

function renderAdmin() {
  const tabs = [
    {id:'users', label:'👥 Пользователи'},
    ...(canAdmin() ? [{id:'keys', label:'🔑 Ключи'}] : []),
    {id:'plans', label:'💎 Тарифы'},
  ];

  let content = '';
  if (adminTab === 'users') {
    content = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div style="font-weight:700">Всего: ${allUsers.length}</div>
      <input class="input" id="user-search" placeholder="Поиск по нику..." style="width:220px" oninput="filterUsers()">
    </div>
    <div style="overflow-x:auto">
    <table class="table" id="users-table">
      <thead><tr>
        <th>UID</th><th>Ник</th><th>Роль</th><th>Подписка</th><th>HWID</th><th>Действия</th>
      </tr></thead>
      <tbody id="users-tbody">
        ${renderUsersRows(allUsers)}
      </tbody>
    </table>
    </div>`;
  } else if (adminTab === 'plans') {
    const plans = [
      { label:'👑 Lifetime', days:0,   color:'#FFD700', desc:'Навсегда' },
      { label:'💎 180 дней', days:180, color:'#A855F7', desc:'6 месяцев' },
      { label:'🔥 90 дней',  days:90,  color:'#FF8C00', desc:'3 месяца'  },
      { label:'⚡ 60 дней',  days:60,  color:'#FF4444', desc:'2 месяца'  },
      { label:'✅ 30 дней',  days:30,  color:'#22C55E', desc:'1 месяц'   },
      { label:'📅 14 дней',  days:14,  color:'#3B82F6', desc:'2 недели'  },
      { label:'🗓 7 дней',   days:7,   color:'#6B7280', desc:'1 неделя'  },
    ];
    content = `
    <h3>Тарифы подписки</h3>
    <p style="color:#6b7280;font-size:14px;margin-bottom:20px">Выберите пользователя и выдайте нужный тариф прямо из таблицы юзеров.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
      ${plans.map(p => `
      <div style="background:#1a1a24;border:1px solid ${p.color}33;border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:24px;margin-bottom:8px">${p.label.split(' ')[0]}</div>
        <div style="font-weight:700;color:${p.color};font-size:15px">${p.label.slice(2)}</div>
        <div style="color:#6b7280;font-size:13px;margin-top:4px">${p.desc}</div>
        <button class="btn btn-sm mt" style="background:${p.color};border:none;color:#000;font-weight:700" onclick="showGenKeys(${p.days})">
          Создать ключ
        </button>
      </div>`).join('')}
      <div style="background:#1a1a24;border:1px solid #3B82F633;border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:24px;margin-bottom:8px">🔄</div>
        <div style="font-weight:700;color:#3B82F6;font-size:15px">HWID Сброс</div>
        <div style="color:#6b7280;font-size:13px;margin-top:4px">Смена устройства</div>
        <button class="btn btn-sm mt" style="background:#3B82F6;border:none;color:#fff;font-weight:700" onclick="showGenKeys(0,'hwid')">
          Создать ключ
        </button>
      </div>
    </div>`;
  } else {
    content = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div style="font-weight:700">Ключей: ${allKeys.length}</div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm" onclick="showGenKeys(30,'sub')">+ Ключ подписки</button>
        <button class="btn btn-sm" style="background:#3B82F6" onclick="showGenKeys(0,'hwid')">🔄 HWID ключ</button>
      </div>
    </div>
    <div style="overflow-x:auto">
    <table class="table">
      <thead><tr><th>Ключ</th><th>Тип</th><th>Дней</th><th>Создан</th><th>Использован</th><th></th></tr></thead>
      <tbody>
        ${allKeys.map(k => `<tr>
          <td style="font-family:monospace;font-size:12px">${k.key} <button class="copy-btn" onclick="copy('${k.key}')">copy</button></td>
          <td><span style="color:${k.type==='hwid'?'#3B82F6':'#22c55e'};font-size:12px;font-weight:700">${k.type==='hwid'?'🔄 HWID':'🔑 Саб'}</span></td>
          <td>${k.days === 0 ? '∞' : k.days}</td>
          <td style="color:#6b7280">${k.createdBy}</td>
          <td style="color:${k.usedBy?'#22c55e':'#6b7280'}">${k.usedBy || '—'}</td>
          <td>${!k.usedBy ? `<button class="btn btn-sm btn-red" onclick="deleteKey('${k.key}')">✕</button>` : ''}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>`;
  }

  render(`${navbar('admin')}
  <div class="page">
    <div class="flex" style="margin-bottom:20px;margin-top:20px">
      <h2>⚙ Панель управления</h2>
      <div style="margin-left:8px">${roleTag(me.role)}</div>
    </div>
    <div class="tabs" style="max-width:400px">
      ${tabs.map(t => `<div class="tab ${adminTab===t.id?'active':''}" onclick="switchAdminTab('${t.id}')">${t.label}</div>`).join('')}
    </div>
    <div class="card">${content}</div>
  </div>`);
}

function renderUsersRows(users) {
  return users.map(u => `<tr>
    <td style="color:#6b7280">${u.uid}</td>
    <td><strong>${u.username}</strong></td>
    <td>${roleTag(u.role)}</td>
    <td>${subBadge(u)}</td>
    <td style="color:#6b7280;font-size:12px">${u.hwid || '—'}</td>
    <td>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        <button class="btn btn-sm" onclick="showEditUser(${u.id})">✏</button>
        ${canAdmin() ? `
          <button class="btn btn-sm ${u.banned?'btn-green':'btn-red'}" onclick="banUser(${u.id})">${u.banned?'🔓':'🔒'}</button>
          <button class="btn btn-sm btn-red" onclick="deleteUser(${u.id})">🗑</button>
        ` : ''}
      </div>
    </td>
  </tr>`).join('');
}

function filterUsers() {
  const q = document.getElementById('user-search').value.toLowerCase();
  const filtered = allUsers.filter(u => u.username.toLowerCase().includes(q) || u.uid.includes(q));
  document.getElementById('users-tbody').innerHTML = renderUsersRows(filtered);
}

function switchAdminTab(tab) { adminTab = tab; renderAdmin(); }

// ── РЕДАКТИРОВАНИЕ ЮЗЕРА ─────────────────────────────────
function showEditUser(id) {
  const u = allUsers.find(x => x.id === id);
  if (!u) return;
  const roleOptions = Object.entries(ROLES).map(([k,v]) =>
    `<option value="${k}" ${u.role===k?'selected':''}>${v.icon} ${v.label}</option>`
  ).join('');

  document.getElementById('app').insertAdjacentHTML('beforeend', `
  ${CSS}
  <div class="modal" id="edit-modal">
    <div class="modal-box">
      <h3>✏ Изменить: ${u.username}</h3>
      ${canAdmin() ? `
      <label>Никнейм</label>
      <input class="input mb" id="e-username" value="${u.username}">
      <label>UID</label>
      <input class="input mb" id="e-uid" value="${u.uid}">
      <label>Роль</label>
      <select class="input mb" id="e-role" style="cursor:pointer">${roleOptions}</select>
      ` : ''}
      <label>Подписка (дней, 0 = навсегда)</label>
      <input class="input mb" id="e-subdays" type="number" value="30" min="0">
      <div style="display:flex;gap:8px;margin-bottom:8px">
        <button class="btn btn-sm btn-green" onclick="giveSubUser(${u.id})">✅ Выдать подписку</button>
        <button class="btn btn-sm btn-red" onclick="revokeSubUser(${u.id})">❌ Забрать подписку</button>
      </div>
      ${canAdmin() && u.hwid ? `<button class="btn btn-sm btn-outline mt mb" onclick="resetHwidUser(${u.id})">🔄 Сбросить HWID</button>` : ''}
      <div style="display:flex;gap:8px;margin-top:12px">
        ${canAdmin() ? `<button class="btn" onclick="saveUser(${u.id})">Сохранить</button>` : ''}
        <button class="btn btn-outline" onclick="closeModal()">Отмена</button>
      </div>
    </div>
  </div>`);
}

async function saveUser(id) {
  const body = {
    username: document.getElementById('e-username')?.value.trim(),
    uid: document.getElementById('e-uid')?.value.trim(),
    role: document.getElementById('e-role')?.value,
  };
  const res = await api('PUT', `/api/admin/users/${id}`, body);
  if (!res.ok) { alert((await res.json()).message); return; }
  closeModal(); await showAdmin();
}

async function giveSubUser(id) {
  const days = parseInt(document.getElementById('e-subdays')?.value || '30');
  const res = await api('PUT', `/api/admin/users/${id}`, { subDays: days });
  if (!res.ok) { alert((await res.json()).message); return; }
  closeModal(); await showAdmin();
}

async function revokeSubUser(id) {
  const res = await api('PUT', `/api/admin/users/${id}`, { subscription: false });
  if (!res.ok) { alert((await res.json()).message); return; }
  closeModal(); await showAdmin();
}

async function resetHwidUser(id) {
  const res = await api('PUT', `/api/admin/users/${id}`, { resetHwid: true });
  if (!res.ok) { alert((await res.json()).message); return; }
  closeModal(); await showAdmin();
}

function closeModal() {
  document.getElementById('edit-modal')?.remove();
}

async function banUser(id) {
  const u = allUsers.find(x => x.id === id);
  if (!confirm(`${u.banned ? 'Разбанить' : 'Забанить'} ${u.username}?`)) return;
  const res = await api('PUT', `/api/admin/users/${id}/ban`);
  if (!res.ok) { alert((await res.json()).message); return; }
  await showAdmin();
}

async function deleteUser(id) {
  const u = allUsers.find(x => x.id === id);
  if (!confirm(`Удалить ${u.username}? Это действие нельзя отменить!`)) return;
  const res = await api('DELETE', `/api/admin/users/${id}`);
  if (!res.ok) { alert((await res.json()).message); return; }
  await showAdmin();
}


function showGenKeys(defaultDays, defaultType) {
  const isHwid = defaultType === 'hwid';
  document.getElementById('app').insertAdjacentHTML('beforeend', `
  ${CSS}
  <div class="modal" id="gen-modal">
    <div class="modal-box">
      <h3>${isHwid ? '🔄 HWID ключ сброса' : '🔑 Создать ключи подписки'}</h3>
      <label>Количество (макс 50)</label>
      <input class="input mb" id="g-count" type="number" value="1" min="1" max="50">
      ${!isHwid ? `<label>Дней подписки (0 = навсегда)</label>
      <input class="input mb" id="g-days" type="number" value="${defaultDays !== undefined ? defaultDays : 30}" min="0">` : ''}
      <input type="hidden" id="g-type" value="${defaultType || 'sub'}">
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn" onclick="genKeys()">Создать</button>
        <button class="btn btn-outline" onclick="document.getElementById('gen-modal').remove()">Отмена</button>
      </div>
      <div id="gen-result" style="margin-top:16px;font-family:monospace;font-size:12px;color:#22c55e;max-height:200px;overflow-y:auto"></div>
    </div>
  </div>`);
}

async function genKeys() {
  const count = parseInt(document.getElementById('g-count').value);
  const days = parseInt(document.getElementById('g-days')?.value || '0');
  const type = document.getElementById('g-type').value;
  const res = await api('POST', '/api/admin/keys', { count, days, type });
  const data = await res.json();
  if (!res.ok) { alert(data.message); return; }
  document.getElementById('gen-result').innerHTML = data.keys.map(k =>
    `<div style="margin-bottom:4px">${k} <button class="copy-btn" onclick="copy('${k}')">copy</button></div>`
  ).join('');
  await showAdmin();
}

async function deleteKey(key) {
  if (!confirm('Удалить ключ?')) return;
  await api('DELETE', `/api/admin/keys/${encodeURIComponent(key)}`);
  await showAdmin();
}

function copy(text) {
  navigator.clipboard.writeText(text);
}

// ── INIT ──────────────────────────────────────────────────
async function init() {
  if (token) {
    const res = await api('GET', '/api/me');
    if (res.ok) me = await res.json();
    else { token = null; localStorage.removeItem('ac_token'); }
  }
  showHome();
}

init();
