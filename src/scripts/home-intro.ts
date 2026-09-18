export function initHomeIntro(){
  const reducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

  const introSeenKey =
    'ergys-intro-seen';

  const introEl =
    document.querySelector<HTMLElement>(
      '[data-intro]'
    );

  const introTitle =
    document.querySelector<HTMLElement>(
      '.title-mask [data-slide-title]'
    );

  let introSeen =
    false;

  try{
    introSeen =
      sessionStorage.getItem(
        introSeenKey
      ) === '1';
  }catch{}

  if(!introEl){
    return;
  }

  if(
    reducedMotion.matches ||
    introSeen
  ){
    introEl.remove();

    if(introTitle){
      introTitle.style.transform =
        'none';
    }

    return;
  }

  document.documentElement
    .classList
    .add(
      'intro-running'
    );

  const isMobile =
    window.matchMedia(
      '(max-width:700px)'
    ).matches;

  const scale =
    isMobile
      ? .82
      : 1;

  const t = (
    ms: number
  ) =>
    Math.round(
      ms *
      scale
    );

  const leftCurtain =
    introEl.querySelector<HTMLElement>(
      '.intro-curtain-left'
    );

  const rightCurtain =
    introEl.querySelector<HTMLElement>(
      '.intro-curtain-right'
    );

  const sweep =
    document.querySelector<HTMLElement>(
      '[data-hero-sweep]'
    );

  /*
   * CSS owns the gold-line drawing and the SHEHU reveal.
   * JS only starts the timeline and handles the transition back to the hero.
   */
  requestAnimationFrame(
    ()=>{
      introEl
        .classList
        .add(
          'is-brand-revealing'
        );
    }
  );

  setTimeout(
    ()=>{
      leftCurtain
        ?.animate(
          [
            {
              transform:
                'translateX(0)'
            },
            {
              transform:
                'translateX(-100%)'
            }
          ],
          {
            duration:
              t(
                920
              ),
            easing:
              'cubic-bezier(.77,0,.18,1)',
            fill:
              'forwards'
          }
        );

      rightCurtain
        ?.animate(
          [
            {
              transform:
                'translateX(0)'
            },
            {
              transform:
                'translateX(100%)'
            }
          ],
          {
            duration:
              t(
                920
              ),
            easing:
              'cubic-bezier(.77,0,.18,1)',
            fill:
              'forwards'
          }
        );
    },
    t(
      1320
    )
  );

  setTimeout(
    ()=>{
      introEl
        .animate(
          [
            {
              opacity:
                1
            },
            {
              opacity:
                0
            }
          ],
          {
            duration:
              t(
                420
              ),
            easing:
              'ease',
            fill:
              'forwards'
          }
        );

      introTitle
        ?.animate(
          [
            {
              transform:
                'translateY(115%)'
            },
            {
              transform:
                'translateY(0)'
            }
          ],
          {
            duration:
              t(
                760
              ),
            easing:
              'cubic-bezier(.2,.75,.2,1)',
            fill:
              'forwards'
          }
        );
    },
    t(
      1720
    )
  );

  setTimeout(
    ()=>{
      sweep
        ?.animate(
          [
            {
              left:
                '-25%',
              opacity:
                0
            },
            {
              left:
                '25%',
              opacity:
                .7
            },
            {
              left:
                '115%',
              opacity:
                0
            }
          ],
          {
            duration:
              t(
                1500
              ),
            easing:
              'ease-in-out'
          }
        );
    },
    t(
      1950
    )
  );

  setTimeout(
    ()=>{
      introEl.remove();

      document.documentElement
        .classList
        .remove(
          'intro-running'
        );

      if(introTitle){
        introTitle.style.transform =
          'none';
      }

      try{
        sessionStorage.setItem(
          introSeenKey,
          '1'
        );
      }catch{}
    },
    t(
      2350
    )
  );
}
