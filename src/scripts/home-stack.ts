type StackItem = {
  card: HTMLElement;
  image: HTMLElement | null;
  height: number;
  absoluteTop: number;
};

const DEAD_ZONE = 0.035;
const BLACKOUT_AT = 0.28;
const MAX_DARKNESS = 1;

function documentTop(
  element:
    HTMLElement
){
  let top =
    0;

  let node:
    HTMLElement |
    null =
    element;

  while(
    node
  ){
    top +=
      node.offsetTop;

    node =
      node
        .offsetParent as
          HTMLElement |
          null;
  }

  return top;
}

function easedProgress(
  nextTopInViewport:
    number,

  currentHeight:
    number
){
  const raw =
    (
      currentHeight -
      nextTopInViewport
    ) /
    currentHeight;

  const clamped =
    Math.max(
      0,
      Math.min(
        1,
        raw
      )
    );

  if(
    clamped <=
    DEAD_ZONE
  ){
    return 0;
  }

  const normalized =
    (
      clamped -
      DEAD_ZONE
    ) /
    (
      1 -
      DEAD_ZONE
    );

  return (
    normalized *
    normalized *
    (
      3 -
      2 *
      normalized
    )
  );
}

export function initHomeStack(){
  if(
    !document
      .body
      .classList
      .contains(
        'is-home'
      )
  ){
    return;
  }

  const media =
    window
      .matchMedia(
        '(max-width: 700px)'
      );

  const section =
    document
      .querySelector<HTMLElement>(
        '.work-section'
      );

  const grid =
    section
      ?.querySelector<HTMLElement>(
        '.project-grid'
      ) ??
    null;

  if(
    !section ||
    !grid
  ){
    return;
  }

  const sectionEl =
    section;

  const gridEl =
    grid;

  let items:
    StackItem[] =
    [];

  let active =
    false;

  let raf:
    number |
    null =
    null;

  let rebuildRaf:
    number |
    null =
    null;

  let lastWidth =
    window.innerWidth;

  let lastGridWidth =
    0;

  let lastGridHeight =
    0;

  function visibleCards(){
    return Array
      .from(
        gridEl
          .querySelectorAll<HTMLElement>(
            '.project-card'
          )
      )
      .filter(
        card =>
          !card.hidden &&
          getComputedStyle(
            card
          ).display !==
            'none'
      );
  }

  function clearCard(
    card:
      HTMLElement
  ){
    card
      .style
      .removeProperty(
        'z-index'
      );

    const image =
      card
        .querySelector<HTMLElement>(
          '.project-image'
        );

    if(
      !image
    ){
      return;
    }

    image
      .style
      .setProperty(
        '--stack-darkness',
        '0'
      );

    image
      .style
      .removeProperty(
        '--stack-blur'
      );

    image
      .style
      .removeProperty(
        'will-change'
      );

    card.style.setProperty('--stack-text-opacity', '1');
  }

  function resetAll(){
    gridEl
      .querySelectorAll<HTMLElement>(
        '.project-card'
      )
      .forEach(
        clearCard
      );

    items =
      [];

    document
      .body
      .classList
      .remove(
        'in-stack-grid'
      );
  }

  function rebuild(){
    rebuildRaf =
      null;

    if(
      !media.matches
    ){
      resetAll();
      return;
    }

    gridEl
      .querySelectorAll<HTMLElement>(
        '.project-card'
      )
      .forEach(
        clearCard
      );

    items =
      visibleCards()
        .map(
          (
            card,
            index
          )=>{
            card
              .style
              .setProperty(
                'z-index',
                String(
                  index +
                  1
                )
              );

            return {
              card,

              image:
                card
                  .querySelector<HTMLElement>(
                    '.project-image'
                  ),

              height:
                Math.max(
                  1,
                  card.offsetHeight
                ),

              absoluteTop:
                documentTop(
                  card
                )
            };
          }
        );

    schedule();
  }

  function scheduleRebuild(){
    if(
      rebuildRaf !==
      null
    ){
      return;
    }

    rebuildRaf =
      requestAnimationFrame(
        rebuild
      );
  }

  function update(){
    raf =
      null;

    if(
      !media.matches ||
      !active ||
      !items.length
    ){
      return;
    }

    const scrollY =
      window.scrollY;

    for(
      let index =
        0;

      index <
      items.length;

      index++
    ){
      const item =
        items[
          index
        ];

      const next =
        items[
          index +
          1
        ];

      if(
        !item.image
      ){
        continue;
      }

      const progress =
        next
          ? easedProgress(
              next.absoluteTop -
                scrollY,

              item.height
            )
          : 0;

      /*
       * V19: once the next sticky card is genuinely covering the current
       * one, the covered card must resolve all the way to black instead of
       * leaving a visible strip of the previous photograph underneath.
       * BLACKOUT_AT intentionally reaches full black before 100% overlap.
       */
      const darkness =
        progress <= 0
          ? 0
          : Math.min(
              MAX_DARKNESS,
              Math.pow(
                Math.min(1, progress / BLACKOUT_AT),
                1.08
              ) * MAX_DARKNESS
            );

      const nextDarkness =
        darkness
          .toFixed(
            3
          );

      if(
        item
          .image
          .style
          .getPropertyValue(
            '--stack-darkness'
          ) !==
        nextDarkness
      ){
        item
          .image
          .style
          .setProperty(
            '--stack-darkness',
            nextDarkness
          );
      }

      const textOpacity = Math.max(0, 1 - (progress / 0.24)).toFixed(3);
      item.card.style.setProperty('--stack-text-opacity', textOpacity);
    }
  }

  function schedule(){
    if(
      raf !==
      null
    ){
      return;
    }

    raf =
      requestAnimationFrame(
        update
      );
  }

  const observer =
    new IntersectionObserver(
      entries=>{
        active =
          media.matches &&
          entries.some(
            entry =>
              entry
                .isIntersecting
          );

        document
          .body
          .classList
          .toggle(
            'in-stack-grid',
            active
          );

        if(
          active
        ){
          schedule();
        }
      },
      {
        rootMargin:
          '15% 0px 15% 0px'
      }
    );

  observer
    .observe(
      sectionEl
    );

  window
    .addEventListener(
      'scroll',
      schedule,
      {
        passive:
          true
      }
    );

  document
    .addEventListener(
      'portfolio:filter-change',
      scheduleRebuild
    );

  window
    .addEventListener(
      'resize',
      ()=>{
        const width =
          window.innerWidth;

        /*
         * Mobile browser chrome changes viewport HEIGHT while the user
         * scrolls. Rebuilding the stack for those height-only changes adds
         * needless work and can feel like scroll jank.
         */
        if(
          width ===
          lastWidth
        ){
          return;
        }

        lastWidth =
          width;

        scheduleRebuild();
      },
      {
        passive:
          true
      }
    );

  window
    .addEventListener(
      'orientationchange',
      ()=>{
        window
          .setTimeout(
            ()=>{
              lastWidth =
                window.innerWidth;

              scheduleRebuild();
            },
            160
          );
      }
    );

  window
    .addEventListener(
      'pageshow',
      scheduleRebuild
    );

  media
    .addEventListener(
      'change',
      ()=>{
        active =
          false;

        scheduleRebuild();
      }
    );

  if(
    'ResizeObserver'
    in window
  ){
    const gridObserver =
      new ResizeObserver(
        entries=>{
          const entry =
            entries[
              0
            ];

          if(
            !entry
          ){
            return;
          }

          const width =
            Math.round(
              entry
                .contentRect
                .width
            );

          const height =
            Math.round(
              entry
                .contentRect
                .height
            );

          if(
            width ===
              lastGridWidth &&
            height ===
              lastGridHeight
          ){
            return;
          }

          lastGridWidth =
            width;

          lastGridHeight =
            height;

          scheduleRebuild();
        }
      );

    gridObserver
      .observe(
        gridEl
      );
  }

  gridEl
    .querySelectorAll<HTMLImageElement>(
      'img'
    )
    .forEach(
      image=>{
        if(
          !image.complete
        ){
          image
            .addEventListener(
              'load',
              scheduleRebuild,
              {
                once:
                  true
              }
            );
        }
      }
    );

  try{
    document
      .fonts
      ?.ready
      .then(
        scheduleRebuild
      );
  }catch{}

  rebuild();
}
