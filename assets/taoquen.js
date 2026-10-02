/* ============================================================
   TAOQUEN — shared behavior for inner pages (vanilla, no deps)
   nav state · drawer · reveals · magnetic buttons
   ============================================================ */
(function(){
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js');
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(pointer: fine)').matches;

  /* ---------- nav scrolled state (skipped for nav-static) ---------- */
  var nav = doc.querySelector('.nav');
  if (nav && !nav.classList.contains('nav-static')){
    var navState = function(){ nav.classList.toggle('scrolled', window.scrollY > 44); };
    window.addEventListener('scroll', navState, {passive:true});
    navState();
  }

  /* ---------- drawer ---------- */
  var burger = doc.getElementById('burger'), drawer = doc.getElementById('drawer');
  var closeBtn = doc.getElementById('drawerClose');
  if (burger && drawer && closeBtn){
    var setDrawer = function(open){
      drawer.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      doc.body.style.overflow = open ? 'hidden' : '';
      if (open) closeBtn.focus(); else burger.focus();
    };
    burger.addEventListener('click', function(){ setDrawer(true); });
    closeBtn.addEventListener('click', function(){ setDrawer(false); });
    drawer.addEventListener('click', function(e){ if (e.target.tagName === 'A') setDrawer(false); });
    doc.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && drawer.classList.contains('open')) setDrawer(false);
    });
  }

  /* ---------- reveals ---------- */
  var revs = doc.querySelectorAll('.tq-reveal');
  if (revs.length && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, {threshold:.14, rootMargin:'0px 0px -6% 0px'});
    revs.forEach(function(el){ io.observe(el); });
  } else {
    revs.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- magnetic buttons (vanilla lerp) ---------- */
  if (!RM && FINE){
    doc.querySelectorAll('.tq-btn').forEach(function(btn){
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      function tick(){
        cx += (tx - cx) * .18; cy += (ty - cy) * .18;
        btn.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
        if (Math.abs(tx - cx) > .1 || Math.abs(ty - cy) > .1) raf = requestAnimationFrame(tick);
        else { raf = null; if (tx === 0 && ty === 0) btn.style.transform = ''; }
      }
      function go(){ if (raf === null) raf = requestAnimationFrame(tick); }
      btn.addEventListener('pointermove', function(e){
        var r = btn.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - .5) * 12;
        ty = ((e.clientY - r.top) / r.height - .5) * 8;
        go();
      });
      btn.addEventListener('pointerleave', function(){ tx = 0; ty = 0; go(); });
    });
  }
})();
