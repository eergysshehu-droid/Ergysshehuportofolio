type StackItem = {
  card: HTMLElement;
  image: HTMLElement | null;
  height: number;
  absoluteTop: number;
};

const DEAD_ZONE = 0.12;

function documentTop(element: HTMLElement){
  let top = 0;
  let node: HTMLElement | null = element;

  while(node){
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }

  return top;
}

function easedProgress(nextTopInViewport:number, currentHeight:number){
  const raw = (currentHeight - nextTopInViewport) / currentHeight;
  const clamped = Math.max(0, Math.min(1, raw));

  if(clamped <= DEAD_ZONE){
    return 0;
  }

  const normalized = (clamped - DEAD_ZONE) / (1 - DEAD_ZONE);
  return normalized * normalized * (3 - 2 * normalized);
}

export function initHomeStack(){
  if(!document.body.classList.contains('is-home')){
    return;
  }

  const media = window.matchMedia('(max-width: 700px)');
  const section = document.querySelector<HTMLElement>('.work-section');
  const grid = section?.querySelector<HTMLElement>('.project-grid') ?? null;

  if(!media.matches || !section || !grid){
    return;
  }

  // Stable non-null aliases for callbacks/closures.
  const sectionEl = section;
  const gridEl = grid;

  let items: StackItem[] = [];
  let active = false;
  let raf:number | null = null;
  let resizeRaf:number | null = null;
  let lastWidth = window.innerWidth;

  function visibleCards(){
    return Array.from(gridEl.querySelectorAll<HTMLElement>('.project-card'))
      .filter(card => !card.hidden && getComputedStyle(card).display !== 'none');
  }

  function clearCard(card:HTMLElement){
    card.style.removeProperty('z-index');

    const image = card.querySelector<HTMLElement>('.project-image');
    if(!image) return;

    image.style.setProperty('--stack-blur','0px');
    image.style.setProperty('--stack-darkness','0');
    image.style.removeProperty('will-change');
  }

  function rebuild(){
    gridEl.querySelectorAll<HTMLElement>('.project-card').forEach(clearCard);

    items = visibleCards().map((card,index) => {
      card.style.setProperty('z-index', String(index + 1));

      return {
        card,
        image: card.querySelector<HTMLElement>('.project-image'),
        height: Math.max(1, card.offsetHeight),
        absoluteTop: documentTop(card)
      };
    });

    schedule();
  }

  function update(){
    raf = null;

    if(!active || !items.length){
      return;
    }

    const scrollY = window.scrollY;

    for(let index=0; index<items.length; index++){
      const item = items[index];
      const next = items[index + 1];

      if(!item.image){
        continue;
      }

      const progress = next
        ? easedProgress(next.absoluteTop - scrollY, item.height)
        : 0;

      const darkness = progress <= 0
        ? 0
        : Math.min(.70, Math.pow(progress,1.08) * .70);

      const blur = progress <= 0
        ? 0
        : Math.min(1.8, Math.pow(progress,1.15) * 1.8);

      const nextDarkness = darkness.toFixed(3);
      const nextBlur = `${Math.round(blur * 10) / 10}px`;

      if(progress > 0 && progress < 1){
        item.image.style.setProperty('will-change','filter');
      }else{
        item.image.style.removeProperty('will-change');
      }

      if(item.image.style.getPropertyValue('--stack-darkness') !== nextDarkness){
        item.image.style.setProperty('--stack-darkness', nextDarkness);
      }

      if(item.image.style.getPropertyValue('--stack-blur') !== nextBlur){
        item.image.style.setProperty('--stack-blur', nextBlur);
      }
    }
  }

  function schedule(){
    if(raf !== null){
      return;
    }

    raf = requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(entries => {
    active = entries.some(entry => entry.isIntersecting);
    document.body.classList.toggle('in-stack-grid', active);

    if(active){
      schedule();
    }
  },{
    rootMargin: '20% 0px 20% 0px'
  });

  observer.observe(sectionEl);

  window.addEventListener('scroll', schedule, {passive:true});
  document.addEventListener('portfolio:filter-change', rebuild);

  window.addEventListener('resize', () => {
    const width = window.innerWidth;

    if(width === lastWidth){
      return;
    }

    lastWidth = width;

    if(resizeRaf !== null){
      cancelAnimationFrame(resizeRaf);
    }

    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null;
      rebuild();
    });
  },{passive:true});

  window.addEventListener('orientationchange', () => {
    window.setTimeout(() => {
      lastWidth = window.innerWidth;
      rebuild();
    },160);
  });

  gridEl.querySelectorAll<HTMLImageElement>('img').forEach(image => {
    if(!image.complete){
      image.addEventListener('load', rebuild, {once:true});
    }
  });

  rebuild();
}
