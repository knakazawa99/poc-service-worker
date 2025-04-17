const express    = require("express");
const webpush    = require("web-push");
const bodyParser = require("body-parser");
const path       = require("path");
const app        = express();

/* ---------- VAPID 鍵 ---------- */
const vapid = {
  publicKey : "",
  privateKey: "",
};
webpush.setVapidDetails("mailto:you@example.com", vapid.publicKey, vapid.privateKey);

/* ---------- ミドルウェア ---------- */
app.use(bodyParser.json());
app.use(express.static(__dirname));                       // demo‑sw をルートに
app.get("/vapidPublicKey", (_, res) => res.type("text/plain").send(vapid.publicKey)); // ←★追加★

/* ---------- 購読管理 ---------- */
let latest = null;
app.post("/subscribe", (req, res) => {
  latest = req.body;
  res.sendStatus(201);
  setTimeout(() => {
    if (!latest) return;
    webpush.sendNotification(latest, JSON.stringify({
      title: "📣 10 秒経過", body: "タブを閉じても届きます！",
    }))
    .then(() => console.log("✅ Push sent at", new Date().toLocaleTimeString()))
    .catch(err => console.error("❌ Push error:", err));
  }, 10000);
});

/* ---------- favicon 無視 ---------- */
app.get("/favicon.ico", (_, res) => res.sendStatus(204));

app.listen(8081, () => console.log("http://localhost:8081"));
