import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = "appleclient_secret_2025";

// Иерархия ролей
const ROLES = {
  owner:    { color: "#FFD700", icon: "👑", label: "Owner",    level: 100 },
  admin:    { color: "#FF4444", icon: "⚡", label: "Admin",    level: 80  },
  burmalda: { color: "#FF8C00", icon: "🔥", label: "Burmalda", level: 60  },
  drun:     { color: "#A855F7", icon: "💜", label: "Друн",     level: 50  },
  powerful: { color: "#3B82F6", icon: "💎", label: "Мощный",   level: 40  },
  valodya:  { color: "#22C55E", icon: "✅", label: "Валодя",   level: 30  },
  user:     { color: "#6B7280", icon: "⬜", label: "User",     level: 1   },
};

// DB
const adapter = new JSONFile(path.join(__dirname, "db.json"));
const db = new Low(adapter, { users: [], keys: [] });
await db.read();
if (!db.data.users) db.data.users = [];
if (!db.data.keys)  db.data.keys  = [];

// Дефолтный owner
if (!db.data.users.find(u => u.role === "owner")) {
  db.data.users.push({
    id: 1, uid: "1",
    username: "Burmalda",
    email: "owner@appleclient.ru",
    password: await bcrypt.hash("admin123", 10),
    role: "owner",
    subscription: true, subExpiry: null,
    hwid: null, hwidBanned: false,
    createdAt: new Date().toISOString()
  });
  await db.write();
}

app.use(cors({ origin: "*", exposedHeaders: ["Authorization"] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── AUTH MIDDLEWARE ───────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Нет токена" });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ message: "Неверный токен" }); }
}

function canAdmin(role) { return ["owner","admin"].includes(role); }
function canGiveSub(role) { return ["owner","admin","valodya"].includes(role); }

// ── РЕГИСТРАЦИЯ ───────────────────────────────────────────
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username?.trim() || !email?.trim() || !password?.trim())
      return res.status(400).json({ message: "Заполните все поля" });
    if (username.trim().length < 3)
      return res.status(400).json({ message: "Ник минимум 3 символа" });
    if (password.trim().length < 6)
      return res.status(400).json({ message: "Пароль минимум 6 символов" });
    if (db.data.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase()))
      return res.status(409).json({ message: "Ник уже занят" });
    if (db.data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()))
      return res.status(409).json({ message: "Email уже используется" });

    const uid = String(db.data.users.length + 1);
    const user = {
      id: Date.now(), uid,
      username: username.trim(), email: email.trim(),
      password: await bcrypt.hash(password.trim(), 10),
      role: "user", subscription: false, subExpiry: null,
      hwid: null, hwidBanned: false,
      createdAt: new Date().toISOString()
    };
    db.data.users.push(user);
    await db.write();

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
    res.setHeader("Authorization", `Bearer ${token}`);
    res.json({ success: true, user: publicUser(user) });
  } catch(e) { res.status(500).json({ message: "Ошибка сервера" }); }
});

// ── ВХОД ──────────────────────────────────────────────────
app.post("/api/login", async (req, res) => {
  try {
    const { login, password, hwid } = req.body;
    if (!login?.trim() || !password?.trim())
      return res.status(400).json({ message: "Заполните все поля" });

    const user = db.data.users.find(u =>
      u.username.toLowerCase() === login.trim().toLowerCase() ||
      u.email.toLowerCase() === login.trim().toLowerCase()
    );
    if (!user) return res.status(401).json({ message: "Неверный логин или пароль" });
    if (!await bcrypt.compare(password.trim(), user.password))
      return res.status(401).json({ message: "Неверный логин или пароль" });
    if (user.banned) return res.status(403).json({ message: "Аккаунт заблокирован. Обратитесь в поддержку." });

    // HWID проверка
    if (hwid && user.subscription) {
      if (!user.hwid) {
        user.hwid = hwid;
        await db.write();
      } else if (user.hwid !== hwid) {
        if (user.hwidBanned) return res.status(403).json({ message: "HWID заблокирован. Обратитесь в поддержку." });
        return res.status(403).json({ message: "Смена устройства! Обратитесь к администратору для сброса HWID." });
      }
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
    res.setHeader("Authorization", `Bearer ${token}`);
    res.json({ success: true, user: publicUser(user) });
  } catch(e) { res.status(500).json({ message: "Ошибка сервера" }); }
});

// ── ПРОФИЛЬ ───────────────────────────────────────────────
app.get("/api/me", auth, (req, res) => {
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "Не найден" });
  res.json(publicUser(user));
});

// ── АКТИВАЦИЯ КЛЮЧА ───────────────────────────────────────
app.post("/api/activate", auth, async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ message: "Введите ключ" });
  const keyData = db.data.keys.find(k => k.key === key.trim() && !k.usedBy);
  if (!keyData) return res.status(404).json({ message: "Ключ не найден или использован" });

  const user = db.data.users.find(u => u.id === req.user.id);

  // HWID reset ключ
  if (keyData.type === "hwid") {
    user.hwid = null;
    user.hwidBanned = false;
    keyData.usedBy = user.username;
    keyData.usedAt = new Date().toISOString();
    await db.write();
    return res.json({ success: true, message: "HWID успешно сброшен!" });
  }

  // Обычный ключ подписки
  user.subscription = true;
  user.subExpiry = keyData.days === 0 ? null : new Date(Date.now() + keyData.days * 86400000).toISOString();
  keyData.usedBy = user.username;
  keyData.usedAt = new Date().toISOString();
  await db.write();
  res.json({ success: true, message: `Подписка активирована на ${keyData.days === 0 ? "навсегда" : keyData.days + " дней"}!`, subExpiry: user.subExpiry });
});

// ── СКАЧАТЬ ЛАУНЧЕР ───────────────────────────────────────
app.get("/api/download", auth, (req, res) => {
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user?.subscription) return res.status(403).json({ message: "Нет подписки", tg: "https://t.me/Burmalda_jmv" });
  res.json({ success: true, url: "/files/AppleLauncher.exe" });
});

// ══ ADMIN ═════════════════════════════════════════════════

// Бан юзера
app.put("/api/admin/users/:id/ban", auth, async (req, res) => {
  if (!canAdmin(req.user.role)) return res.status(403).json({ message: "Нет доступа" });
  const user = db.data.users.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ message: "Не найден" });
  if (user.role === "owner") return res.status(403).json({ message: "Нельзя забанить владельца" });
  user.banned = !user.banned;
  await db.write();
  res.json({ success: true, banned: user.banned });
});

// Удалить юзера
app.delete("/api/admin/users/:id", auth, async (req, res) => {
  if (!canAdmin(req.user.role)) return res.status(403).json({ message: "Нет доступа" });
  const user = db.data.users.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ message: "Не найден" });
  if (user.role === "owner") return res.status(403).json({ message: "Нельзя удалить владельца" });
  db.data.users = db.data.users.filter(u => u.id !== Number(req.params.id));
  await db.write();
  res.json({ success: true });
});

// Список юзеров
app.get("/api/admin/users", auth, (req, res) => {
  if (!canAdmin(req.user.role) && !canGiveSub(req.user.role))
    return res.status(403).json({ message: "Нет доступа" });
  res.json({ users: db.data.users.map(publicUser) });
});

// Изменить юзера
app.put("/api/admin/users/:id", auth, async (req, res) => {
  const isAdmin = canAdmin(req.user.role);
  const isValodya = req.user.role === "valodya";
  if (!isAdmin && !isValodya) return res.status(403).json({ message: "Нет доступа" });

  const user = db.data.users.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ message: "Не найден" });
  if (user.role === "owner" && req.user.role !== "owner")
    return res.status(403).json({ message: "Нельзя изменить владельца" });

  const { username, uid, role, subscription, subDays, resetHwid } = req.body;

  if (isAdmin) {
    if (username) user.username = username;
    if (uid) user.uid = uid;
    if (role && ROLES[role]) user.role = role;
    if (resetHwid) { user.hwid = null; user.hwidBanned = false; }
  }

  // Валодя может только выдавать подписку
  if (typeof subscription === "boolean") user.subscription = subscription;
  if (subDays !== undefined) {
    user.subscription = true;
    user.subExpiry = subDays === 0 ? null : new Date(Date.now() + subDays * 86400000).toISOString();
  }

  await db.write();
  res.json({ success: true, user: publicUser(user) });
});

// Создать ключи
app.post("/api/admin/keys", auth, async (req, res) => {
  if (!canAdmin(req.user.role)) return res.status(403).json({ message: "Нет доступа" });
  const { days = 30, count = 1, type = "sub" } = req.body;
  const keys = [];
  for (let i = 0; i < Math.min(count, 50); i++) {
    const key = `${type === "hwid" ? "HW" : "AC"}-${uuidv4().toUpperCase().slice(0,4)}-${uuidv4().toUpperCase().slice(0,4)}-${uuidv4().toUpperCase().slice(0,4)}`;
    db.data.keys.push({ key, days, type, createdBy: req.user.username, createdAt: new Date().toISOString(), usedBy: null });
    keys.push(key);
  }
  await db.write();
  res.json({ success: true, keys });
});

// Список ключей
app.get("/api/admin/keys", auth, (req, res) => {
  if (!canAdmin(req.user.role)) return res.status(403).json({ message: "Нет доступа" });
  res.json({ keys: db.data.keys });
});

// Удалить ключ
app.delete("/api/admin/keys/:key", auth, async (req, res) => {
  if (!canAdmin(req.user.role)) return res.status(403).json({ message: "Нет доступа" });
  db.data.keys = db.data.keys.filter(k => k.key !== req.params.key);
  await db.write();
  res.json({ success: true });
});

// Роли
app.get("/api/roles", (req, res) => res.json({ roles: ROLES }));

function publicUser(u) {
  return { id: u.id, uid: u.uid, username: u.username, email: u.email, role: u.role, subscription: u.subscription, subExpiry: u.subExpiry, hwid: u.hwid ? "***" : null, hwidBanned: u.hwidBanned, banned: u.banned || false, createdAt: u.createdAt };
}

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// ── WEBSOCKET IRC ─────────────────────────────────────────
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });
const chatHistory = [];
const MAX_HISTORY = 100;

// Очистка чата каждые 30 минут
setInterval(() => {
  chatHistory.length = 0;
  const payload = JSON.stringify({ type: 'clear' });
  wss.clients.forEach(c => { if(c.readyState===1) c.send(payload); });
  console.log('IRC chat cleared');
}, 30 * 60 * 1000);

wss.on("connection", (ws, req) => {
  // Отправляем историю новому юзеру
  ws.send(JSON.stringify({ type: "history", messages: chatHistory }));

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw);
      if (data.type === "message") {
        // Проверяем токен
        let user = null;
        try {
          user = jwt.verify(data.token, JWT_SECRET);
        } catch { return; }

        const dbUser = db.data.users.find(u => u.id === user.id);
        if (!dbUser || dbUser.banned) return;

        const msg = {
          id: Date.now(),
          username: dbUser.username,
          role: dbUser.role,
          text: String(data.text).slice(0, 300),
          time: new Date().toISOString()
        };

        chatHistory.push(msg);
        if (chatHistory.length > MAX_HISTORY) chatHistory.shift();

        // Рассылаем всем
        const payload = JSON.stringify({ type: "message", message: msg });
        wss.clients.forEach(client => {
          if (client.readyState === 1) client.send(payload);
        });
      }
    } catch {}
  });
});

httpServer.listen(PORT, () => console.log(`\n  AppleClient: http://localhost:${PORT}\n`));
