/* ---------- ギャラリー ---------- */
const IMAGES = ["images/gallery-1.jpg", "images/gallery-2.jpg", "images/gallery-3.jpg"];
document.getElementById("gallery").innerHTML =
  IMAGES.map(s => `<img src="${s}" loading="lazy">`).join("");

/* ---------- SW & Push ---------- */
(async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  /* 1. SW を登録（ルート基準） */
  await navigator.serviceWorker.register("/sw.js", { scope: "/" });

  /* 2. activate 完了を待機 */
  const reg = await navigator.serviceWorker.ready;
  console.log("SW is ready:", reg.active?.state);  // "activated"

  /* 3. 通知許可 */
  if (await Notification.requestPermission() !== "granted") return;

  /* 4. 公開鍵 (ハードコード or fetch) */
  const key = "";

  /* 5. Push 購読 */
  const sub = (await reg.pushManager.getSubscription()) ??
              (await reg.pushManager.subscribe({
                userVisibleOnly      : true,
                applicationServerKey : base64urlToUint8(key),
              }));

  /* 6. サーバへ送信 */
  await fetch("/subscribe", {
    method  : "POST",
    headers : { "Content-Type": "application/json" },
    body    : JSON.stringify(sub),
  });
})();

/* util */
function base64urlToUint8(b64) {
  const pad = "=".repeat((4 - b64.length % 4) % 4);
  const data = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(data), c => c.charCodeAt(0));
}
