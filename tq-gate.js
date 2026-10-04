/* Taoquen passcode screen.
   Shown before any page on the site until the visitor enters the passcode.
   Once entered, this browser remembers it (localStorage) and won't ask again.
   To change the passcode, change CODE below (it is the passcode written in base64:
   btoa("9999") === "OTk5OQ=="). Note: this is a privacy screen, not real security —
   the site is static, so the passcode can be found in this file by anyone who looks. */
(function () {
  var CODE = 'OTk5OQ==';
  var KEY = 'tq-pass';
  var ok = false;
  try { ok = localStorage.getItem(KEY) === CODE; } catch (e) {}
  if (ok) return;

  var zh = (document.documentElement.lang || '').indexOf('zh') === 0;
  var T = zh
    ? { title: '請輸入通行碼', sub: '此網站目前僅供受邀訪客瀏覽。', btn: '進入', bad: '通行碼不正確，請再試一次。' }
    : { title: 'Enter passcode', sub: 'This site is currently open to invited visitors only.', btn: 'Enter', bad: 'That passcode isn’t right. Please try again.' };

  var root = document.documentElement;
  root.classList.add('tq-locked');
  var css = document.createElement('style');
  css.textContent =
    'html.tq-locked{overflow:hidden!important}' +
    'html.tq-locked body>*:not(#tq-gate){visibility:hidden!important}' +
    '#tq-gate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;' +
      'background:radial-gradient(circle at 50% 35%,#2a2620 0,#14130f 70%);color:#f3ead6;' +
      'font-family:Inter,"Noto Sans TC",system-ui,-apple-system,"Segoe UI",sans-serif}' +
    '#tq-gate .b{width:100%;max-width:360px;text-align:center}' +
    '#tq-gate .s{width:84px;height:84px;margin:0 auto 22px;border-radius:50%;border:2px solid #c8a96e;display:grid;place-items:center;' +
      'font-family:"Noto Serif TC",serif;font-size:2.4rem;color:#c8a96e}' +
    '#tq-gate .n{font-family:Cinzel,Georgia,serif;letter-spacing:.32em;font-size:.8rem;color:#c8a96e;margin-bottom:6px}' +
    '#tq-gate h1{font-family:"Playfair Display","Noto Serif TC",Georgia,serif;font-weight:600;font-size:1.7rem;margin:0 0 6px;color:#f3ead6}' +
    '#tq-gate p{margin:0 0 22px;font-size:.92rem;color:#b8ad95}' +
    '#tq-gate input{width:100%;box-sizing:border-box;font-size:1.6rem;letter-spacing:.6em;text-align:center;padding:12px 0 12px .6em;' +
      'border-radius:12px;border:1.5px solid #5a4f3a;background:#1d1b16;color:#f3ead6;outline:none}' +
    '#tq-gate input:focus{border-color:#c8a96e;box-shadow:0 0 0 4px rgba(200,169,110,.18)}' +
    '#tq-gate button{margin-top:14px;width:100%;border:0;border-radius:999px;padding:12px;font-size:.95rem;font-weight:600;' +
      'background:#c8901a;color:#fff;cursor:pointer}' +
    '#tq-gate button:hover{background:#a87814}' +
    '#tq-gate .e{min-height:1.4em;margin-top:12px;font-size:.85rem;color:#e58f7a}' +
    '#tq-gate.shake .b{animation:tqshake .4s}' +
    '@keyframes tqshake{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}';
  (document.head || root).appendChild(css);

  function mount() {
    if (document.getElementById('tq-gate')) return;
    var g = document.createElement('div');
    g.id = 'tq-gate';
    g.setAttribute('role', 'dialog');
    g.setAttribute('aria-modal', 'true');
    g.innerHTML =
      '<form class="b" autocomplete="off"><div class="s">道</div><div class="n">TAOQUEN</div>' +
      '<h1>' + T.title + '</h1><p>' + T.sub + '</p>' +
      '<input type="password" inputmode="numeric" maxlength="12" aria-label="' + T.title + '">' +
      '<button type="submit">' + T.btn + '</button><div class="e" aria-live="polite"></div></form>';
    document.body.appendChild(g);
    var f = g.querySelector('form'), inp = g.querySelector('input'), err = g.querySelector('.e');
    setTimeout(function () { inp.focus(); }, 50);
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = (inp.value || '').trim();
      if (v && btoa(v) === CODE) {
        try { localStorage.setItem(KEY, CODE); } catch (e) {}
        root.classList.remove('tq-locked');
        g.remove();
        css.remove();
      } else {
        err.textContent = T.bad;
        inp.value = '';
        g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake');
        inp.focus();
      }
    });
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
