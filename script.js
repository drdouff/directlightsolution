(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header scroll state ---------- */
  var header = document.getElementById('siteHeader');
  function onScrollHeader(){
    if(window.scrollY > 18){ header.classList.add('is-scrolled'); }
    else{ header.classList.remove('is-scrolled'); }
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, {passive:true});

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', function(){
    var open = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mainNav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded','false');
    });
  });

  /* ---------- current rail: build nodes ---------- */
  var railSections = [
    {id:'accueil', label:'Accueil'},
    {id:'apropos', label:'À propos'},
    {id:'services', label:'Services'},
    {id:'chiffres', label:'Chiffres'},
    {id:'realisations', label:'Projets'},
    {id:'contact', label:'Contact'}
  ];
  var rail = document.getElementById('currentRail');
  var railFill = document.getElementById('railFill');
  var railSpark = document.getElementById('railSpark');
  var progressFill = document.getElementById('progressFill');
  var nodeEls = [];

  function buildNodes(){
    rail.querySelectorAll('.rail-node').forEach(function(n){ n.remove(); });
    nodeEls = [];
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if(docHeight <= 0) docHeight = 1;
    railSections.forEach(function(s){
      var el = document.getElementById(s.id);
      if(!el) return;
      var top = el.getBoundingClientRect().top + window.scrollY;
      var pct = Math.min(100, Math.max(0, (top / docHeight) * 100));
      var node = document.createElement('div');
      node.className = 'rail-node';
      node.style.top = pct + '%';
      node.dataset.threshold = top;
      node.innerHTML = '<a href="#'+s.id+'"><span class="dot"></span><span class="label">'+s.label+'</span></a>';
      rail.appendChild(node);
      nodeEls.push(node);
    });
  }

  function updateRail(){
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if(docHeight <= 0) docHeight = 1;
    var pct = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
    railFill.style.height = pct + '%';
    railSpark.style.top = pct + '%';
    progressFill.style.width = pct + '%';

    var scrollPos = window.scrollY + 4;
    nodeEls.forEach(function(node){
      if(scrollPos >= parseFloat(node.dataset.threshold)){
        node.classList.add('is-lit');
      } else {
        node.classList.remove('is-lit');
      }
    });

    /* toggle "on-light" rail style over light sections */
    var darkSections = ['accueil','pourquoi'];
    var overDark = darkSections.some(function(id){
      var el = document.getElementById(id);
      if(!el) return false;
      var r = el.getBoundingClientRect();
      return r.top < 120 && r.bottom > 120;
    });
    rail.classList.toggle('on-light', !overDark);
  }

  buildNodes();
  updateRail();
  window.addEventListener('scroll', updateRail, {passive:true});
  window.addEventListener('resize', function(){ buildNodes(); updateRail(); });

  /* ---------- nav active link (scrollspy on main nav) ---------- */
  var navLinks = mainNav.querySelectorAll('a');
  var navSections = ['apropos','services','realisations','temoignages','faq','contact'];
  function updateNavActive(){
    var current = null;
    navSections.forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      var r = el.getBoundingClientRect();
      if(r.top < 140){ current = id; }
    });
    navLinks.forEach(function(a){
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', updateNavActive, {passive:true});
  updateNavActive();

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.12});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------- animated counters ---------- */
  var counters = document.querySelectorAll('.count');
  function animateCounter(el){
    var target = parseInt(el.dataset.target, 10);
    if(reduceMotion){ el.textContent = target; return; }
    var duration = 1400;
    var start = null;
    function step(ts){
      if(!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if(progress < 1){ requestAnimationFrame(step); }
      else { el.textContent = target; }
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    var io2 = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateCounter(entry.target);
          io2.unobserve(entry.target);
        }
      });
    }, {threshold:0.5});
    counters.forEach(function(c){ io2.observe(c); });
  } else {
    counters.forEach(function(c){ c.textContent = c.dataset.target; });
  }

  /* ---------- gallery filter ---------- */
  var chips = document.querySelectorAll('.filter-chip');
  var items = document.querySelectorAll('.gallery-item');
  chips.forEach(function(chip){
    chip.addEventListener('click', function(){
      chips.forEach(function(c){ c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      var filter = chip.dataset.filter;
      items.forEach(function(item){
        var match = filter === 'all' || item.dataset.cat === filter;
        item.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------- lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbVisual = document.getElementById('lightboxVisual');
  var lbCat = document.getElementById('lightboxCat');
  var lbTitle = document.getElementById('lightboxTitle');
  var lbDesc = document.getElementById('lightboxDesc');
  var lbClose = document.getElementById('lightboxClose');
  var catNames = {electricite:'Électricité', solaire:'Solaire', reseaux:'Réseaux', securite:'Sécurité'};
  var catBg = {electricite:'bg-electricite', solaire:'bg-solaire', reseaux:'bg-reseaux', securite:'bg-securite'};

  items.forEach(function(item){
    item.addEventListener('click', function(){
      var cat = item.dataset.cat;
      var icon = item.querySelector('.tile-icon').outerHTML;
      lbVisual.className = 'lightbox-visual ' + catBg[cat];
      lbVisual.innerHTML = icon;
      lbCat.textContent = catNames[cat];
      lbTitle.textContent = item.dataset.title + ' — ' + item.dataset.place;
      lbDesc.textContent = item.dataset.desc;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden','false');
    });
  });
  function closeLightbox(){
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden','true');
  }
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function(e){ if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeLightbox(); });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function(item){
    var btn = item.querySelector('.faq-q');
    var answer = item.querySelector('.faq-a');
    function setState(open){
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      item.classList.toggle('is-open', open);
      answer.style.maxHeight = open ? answer.scrollHeight + 'px' : '0px';
    }
    setState(item.classList.contains('is-open'));
    btn.addEventListener('click', function(){
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach(function(other){
        if(other !== item){
          other.classList.remove('is-open');
          other.querySelector('.faq-q').setAttribute('aria-expanded','false');
          other.querySelector('.faq-a').style.maxHeight = '0px';
        }
      });
      setState(!isOpen);
    });
  });

  /* ---------- contact form (front-end only, no backend wired) ---------- */
  var form = document.getElementById('quoteForm');
  var success = document.getElementById('formSuccess');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!form.checkValidity()){ form.reportValidity(); return; }
    success.classList.add('is-shown');
    form.reset();
    success.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block:'nearest'});
  });

})();