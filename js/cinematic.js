// One homepage-only motion controller. No learning, account, or storage rules live here.
(() => {
  const hero=document.querySelector('#discover');
  const slides=[...hero.querySelectorAll('.hero-slide')];
  const dots=[...hero.querySelectorAll('[data-slide]')];
  const playback=document.querySelector('#hero-playback');
  const controls=hero.querySelector('.hero-rotation');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let selected=0, paused=false, inView=true, hovering=false, focused=false;
  let timer, manualUntil=0, request=0;
  const loading=new Map();
  function labels() {
    playback.textContent=MoneyGuideI18n.t(reduced.matches?'heroMotionOff':paused?'heroPlay':'heroPause');
    playback.disabled=reduced.matches;
    playback.setAttribute('aria-pressed',String(paused || reduced.matches));
    dots.forEach((dot,index)=>dot.setAttribute('aria-label',MoneyGuideI18n.t('heroScene',{number:index+1})));
    document.querySelector('#hero-count').textContent=String(selected+1).padStart(2,'0')+' / 04';
  }
  // Load only a requested/next background; the initial photograph alone has high priority.
  function loadSlide(index) {
    const slide=slides[index];
    if(slide.dataset.ready)return Promise.resolve(true);
    if(loading.has(index))return loading.get(index);
    const pending=new Promise(resolve=>{
      const img=new Image();
      img.alt=''; img.decoding='async'; img.fetchPriority='low';
      img.onload=async()=>{
        try {await img.decode();} catch(error) { /* A loaded image remains usable. */ }
        slide.dataset.ready='true'; resolve(true);
      };
      img.onerror=()=>{img.remove();slide.dataset.failed='true';dots[index].disabled=true;resolve(false);};
      if(slide.dataset.srcset) {img.sizes='100vw';img.srcset=slide.dataset.srcset;}
      img.src=slide.dataset.src;
      slide.append(img);
    });
    loading.set(index,pending);return pending;
  }
  function nextIndex() {
    for(let step=1;step<slides.length;step++) {
      const index=(selected+step)%slides.length;
      if(!slides[index].dataset.failed)return index;
    }
    return selected;
  }
  function schedule() {
    clearTimeout(timer);
    if(paused || reduced.matches || !inView || hovering || focused || document.hidden)return;
    timer=setTimeout(async()=>{await show(nextIndex(),true);schedule();},Math.max(3000,manualUntil-performance.now()));
  }
  async function show(index,automatic=false) {
    const token=++request;
    if(!await loadSlide(index) || token!==request)return;
    if(automatic && (paused || reduced.matches || !inView || hovering || focused || document.hidden))return;
    selected=index;
    slides.forEach((slide,i)=>slide.classList.toggle('is-active',i===index));
    dots.forEach((dot,i)=>i===index?dot.setAttribute('aria-current','true'):dot.removeAttribute('aria-current'));
    labels();
    if(!reduced.matches && inView && !document.hidden) loadSlide(nextIndex());
  }
  dots.forEach((dot,index)=>dot.addEventListener('click',()=>{
    manualUntil=performance.now()+9000;
    clearTimeout(timer);show(index).then(schedule);
  }));
  playback.addEventListener('click',()=>{paused=!paused;labels();schedule();});
  controls.addEventListener('mouseenter',()=>{hovering=true;schedule();});
  controls.addEventListener('mouseleave',()=>{hovering=false;schedule();});
  hero.addEventListener('focusin',()=>{focused=true;schedule();});
  hero.addEventListener('focusout',()=>setTimeout(()=>{focused=hero.contains(document.activeElement);schedule();},0));
  document.addEventListener('visibilitychange',schedule);
  document.addEventListener('languagechange',labels);
  labels();schedule();
  if('IntersectionObserver' in window) {
    new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();},{threshold:.1}).observe(hero);
  }
  const firstImage=slides[0].querySelector('img');
  function warmNext() {if(!reduced.matches && inView && !document.hidden)loadSlide(1);}
  if(firstImage.complete) setTimeout(warmNext,1200);
  else firstImage.addEventListener('load',()=>setTimeout(warmNext,1200),{once:true});

  const scenes=[...document.querySelectorAll('.story-scene')];
  const watched=new WeakSet();
  // Elements are visible by default. Animation starts only when observed, so a
  // missing/failed observer cannot leave the page permanently hidden.
  function reveal(node) {
    if(node.classList.contains('has-revealed'))return;
    node.classList.add('has-revealed');
    node.closest('.story-scene')?.classList.add('has-entered');
    if(reduced.matches)return;
    node.classList.add('is-revealing');
    node.addEventListener('animationend',event=>{
      if(event.target===node)node.classList.remove('is-revealing');
    },{once:true});
  }
  let revealObserver;
  if('IntersectionObserver' in window) {
    revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const stage=entry.target;
        const scene=stage.closest('.story-scene');
        if(scene && !scene.classList.contains('scene-arrived')) {
          scene.classList.add('scene-arrived');
          if(!reduced.matches) {
            scene.classList.add('scene-arriving');
            scene.addEventListener('animationend',event=>{
              if(event.target===scene)scene.classList.remove('scene-arriving');
            });
          }
        }
        if(stage.classList.contains('scene-stage'))stage.querySelectorAll('[data-reveal]').forEach(reveal);
        else reveal(stage);
        revealObserver.unobserve(stage);
      });
    },{rootMargin:'0px 0px -45px 0px',threshold:0});
  }
  function observeContent(updated=false) {
    scenes.forEach(scene=>{
      scene.querySelectorAll('[data-reveal="card"]').forEach((card,index)=>card.style.setProperty('--reveal-delay',`${300+index*100}ms`));
      scene.querySelectorAll('.scene-stage, [data-reveal]').forEach(node=>{
        if(watched.has(node) || node.hasAttribute('data-reveal') && node.closest('.scene-stage'))return;
        watched.add(node);
        if(!revealObserver || reduced.matches || updated && scene.classList.contains('has-entered')) {
          if(node.classList.contains('scene-stage'))node.querySelectorAll('[data-reveal]').forEach(child=>child.classList.add('has-revealed'));
          else node.classList.add('has-revealed');
          return;
        }
        revealObserver.observe(node);
      });
    });
  }
  observeContent();
  document.addEventListener('homecontentchange',()=>observeContent(true));
  if('IntersectionObserver' in window) {
    const backgroundObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting) {entry.target.classList.add('scene-lit');backgroundObserver.unobserve(entry.target);}
      });
    },{rootMargin:'0px 0px 90px 0px'});
    scenes.forEach(scene=>backgroundObserver.observe(scene));
    // A narrow reading band updates navigation without a scroll handler.
    const reading=new Set();
    const navObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>entry.isIntersecting?reading.add(entry.target):reading.delete(entry.target));
      if(!reading.size)return;
      const active=[...reading].sort((a,b)=>Math.abs(a.getBoundingClientRect().top-100)-Math.abs(b.getBoundingClientRect().top-100))[0];
      document.querySelectorAll('.top-nav [data-nav]').forEach(link=>{
        if(link.dataset.nav===active.dataset.sceneNav)link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
      document.querySelector('#site-header').dataset.scene=active.dataset.sceneNav;
    },{rootMargin:'-15% 0px -60% 0px'});
    document.querySelectorAll('[data-scene-nav]').forEach(scene=>navObserver.observe(scene));
  }
  reduced.addEventListener('change',()=>{
    labels();schedule();
    if(reduced.matches)document.querySelectorAll('.is-revealing, .scene-arriving').forEach(node=>node.classList.remove('is-revealing','scene-arriving'));
  });
})();
