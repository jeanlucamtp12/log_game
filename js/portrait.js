// Celular: o site foi pensado para ficar em pé (portrait).
// 1) Tenta travar a orientação (só o Android em tela cheia/PWA aceita; o iPhone ignora).
// 2) Se o celular estiver deitado, cobre a tela com um aviso "gire o celular".
(function () {
  var celular = window.matchMedia("(pointer: coarse) and (max-height: 520px) and (orientation: landscape)");

  try {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("portrait").catch(function () {});
    }
  } catch (e) {}

  var css = document.createElement("style");
  css.textContent =
    ".gire-celular{display:none}" +
    "@media (pointer:coarse) and (max-height:520px) and (orientation:landscape){" +
    ".gire-celular{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;" +
    "background:#07121a;color:#8fd0d6;font:600 16px ui-monospace,Consolas,monospace;text-align:center;padding:20px}" +
    ".gire-celular svg{width:56px;height:56px;fill:none;stroke:#43dcff;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;animation:gire 2.4s ease-in-out infinite}" +
    "@keyframes gire{0%,30%{transform:rotate(90deg)}70%,100%{transform:rotate(0)}}}";
  document.head.appendChild(css);

  var aviso = document.createElement("div");
  aviso.className = "gire-celular";
  aviso.setAttribute("role", "alert");
  aviso.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/></svg>' +
    "<span>Gire o celular para ficar em pé</span>";
  document.body.appendChild(aviso);
})();