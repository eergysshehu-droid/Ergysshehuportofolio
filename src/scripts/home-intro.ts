export function initHomeIntro(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const introSeenKey = 'ergys-intro-v19-closing-seen';
  const introEl = document.querySelector<HTMLElement>('[data-intro]');
  const introTitle = document.querySelector<HTMLElement>('.title-mask [data-slide-title]');

  let introSeen = false;
  try{
    introSeen = sessionStorage.getItem(introSeenKey) === '1';
  }catch{}

  if(!introEl){
    return;
  }

  if(reducedMotion.matches || introSeen){
    introEl.remove();
    if(introTitle){
      introTitle.style.transform = 'none';
    }
    return;
  }

  document.documentElement.classList.add('intro-running');

  const isMobile = window.matchMedia('(max-width:700px)').matches;
  const t = (ms:number) => Math.round(ms * (isMobile ? .94 : 1));

  const leftCurtain = introEl.querySelector<HTMLElement>('.intro-curtain-left');
  const rightCurtain = introEl.querySelector<HTMLElement>('.intro-curtain-right');
  const sweep = document.querySelector<HTMLElement>('[data-hero-sweep]');

  requestAnimationFrame(() => {
    introEl.classList.add('is-brand-revealing');
  });

  /*
   * Final pacing: the monogram draws first, then SHEHU is visibly written
   * with a gold pen stroke from left to right. Only after the handwriting
   * finishes does the clean white wordmark settle in.
   */
  setTimeout(() => {
    leftCurtain?.animate(
      [{transform:'translateX(0)'},{transform:'translateX(-100%)'}],
      {duration:t(980),easing:'cubic-bezier(.77,0,.18,1)',fill:'forwards'}
    );

    rightCurtain?.animate(
      [{transform:'translateX(0)'},{transform:'translateX(100%)'}],
      {duration:t(980),easing:'cubic-bezier(.77,0,.18,1)',fill:'forwards'}
    );
  }, t(5050));

  setTimeout(() => {
    introEl.animate(
      [{opacity:1},{opacity:0}],
      {duration:t(560),easing:'ease',fill:'forwards'}
    );

    introTitle?.animate(
      [{transform:'translateY(115%)'},{transform:'translateY(0)'}],
      {duration:t(820),easing:'cubic-bezier(.2,.75,.2,1)',fill:'forwards'}
    );
  }, t(5700));

  setTimeout(() => {
    sweep?.animate(
      [
        {left:'-25%',opacity:0},
        {left:'25%',opacity:.52},
        {left:'115%',opacity:0}
      ],
      {duration:t(1450),easing:'ease-in-out'}
    );
  }, t(5860));

  setTimeout(() => {
    introEl.remove();
    document.documentElement.classList.remove('intro-running');

    if(introTitle){
      introTitle.style.transform = 'none';
    }

    try{
      sessionStorage.setItem(introSeenKey, '1');
    }catch{}
  }, t(6500));
}
