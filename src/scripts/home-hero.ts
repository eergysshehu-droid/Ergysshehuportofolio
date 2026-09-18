export function initHomeHero(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const heroRoot =
      document.querySelector<HTMLElement>(
        '[data-hero-rotator]'
      );


    const heroFrameEls =
      heroRoot
        ? Array.from(
            heroRoot.querySelectorAll<HTMLElement>(
              '.opening-frame'
            )
          )
        : [];


    const slideLinks =
      Array.from(
        document.querySelectorAll<HTMLAnchorElement>(
          '[data-slide-link]'
        )
      );


    const slideTitle =
      document.querySelector<HTMLElement>(
        '[data-slide-title]'
      );


    const slideCount =
      document.querySelector<HTMLElement>(
        '[data-slide-count]'
      );


    const heroProgress =
      document.querySelector<HTMLElement>(
        '[data-hero-progress]'
      );


    const previousSlideButton =
      document.querySelector<HTMLButtonElement>(
        '[data-slide-prev]'
      );


    const nextSlideButton =
      document.querySelector<HTMLButtonElement>(
        '[data-slide-next]'
      );


    let heroProgressAnim:
      Animation |
      undefined;


    let heroActive =
      0;


    let heroTimer:
      number |
      undefined;


    let heroRenderToken =
      0;


    const preparedHeroFrames =
      new Map<
        number,
        Promise<void>
      >();


    /*
     * Bring the old 1.8 second fade down to a much
     * tighter editorial transition.
     *
     * Existing CSS structure remains untouched.
     */
    heroFrameEls
      .forEach(
        frame=>{
          frame.style.transitionDuration =
            reducedMotion.matches
              ? '1ms'
              : '820ms';


          frame.style.willChange =
            'opacity';


          const image =
            frame.querySelector<HTMLImageElement>(
              'img'
            );


          if(
            image
          ){
            image.decoding =
              'async';
          }
        }
      );


    function normalizeHeroIndex(
      index:
        number
    ){
      if(
        !heroFrameEls.length
      ){
        return 0;
      }


      return (
        (
          index %
          heroFrameEls.length
        ) +
        heroFrameEls.length
      ) %
      heroFrameEls.length;
    }


    function prepareHeroFrame(
      index:
        number
    ): Promise<void> {

      if(
        !heroFrameEls.length
      ){
        return Promise.resolve();
      }


      const normalized =
        normalizeHeroIndex(
          index
        );


      const existing =
        preparedHeroFrames.get(
          normalized
        );


      if(
        existing
      ){
        return existing;
      }


      const frame =
        heroFrameEls[
          normalized
        ];


      const image =
        frame
          ?.querySelector<HTMLImageElement>(
            'img'
          );


      if(
        !image
      ){
        return Promise.resolve();
      }


      /*
       * We only promote images that are about
       * to be used. No need to eagerly load
       * the whole hero carousel.
       */
      image.loading =
        'eager';


      if(
        normalized ===
        heroActive
      ){
        image.setAttribute(
          'fetchpriority',
          'high'
        );
      }


      const promise =
        (
          async()=>{
            /*
             * A cached/loaded image can go
             * directly through decode().
             */
            if(
              image.complete
            ){
              try{
                if(
                  image.naturalWidth >
                  0
                ){
                  await image.decode();
                }
              }catch{}

              return;
            }


            await new Promise<void>(
              resolve=>{
                const done =
                  ()=>{
                    resolve();
                  };


                image.addEventListener(
                  'load',
                  done,
                  {
                    once:
                      true
                  }
                );


                /*
                 * A failed neighbour must never
                 * freeze the carousel.
                 */
                image.addEventListener(
                  'error',
                  done,
                  {
                    once:
                      true
                  }
                );
              }
            );


            try{
              if(
                image.naturalWidth >
                0
              ){
                await image.decode();
              }
            }catch{}
          }
        )();


      preparedHeroFrames.set(
        normalized,
        promise
      );


      return promise;
    }


    function preloadNextHero(){
      if(
        heroFrameEls.length <
        2
      ){
        return;
      }


      void prepareHeroFrame(
        heroActive +
        1
      );
    }


function playHeroProgress(){

  if(
    !heroProgress ||
    heroFrameEls.length < 2
  ){
    return;
  }


  heroProgressAnim
    ?.cancel();


  heroProgress.style.transformOrigin =
    'left center';


  /*
   * Reduced motion:
   * keep the progress line visible,
   * but do not animate it.
   */
  if(
    reducedMotion.matches
  ){
    heroProgress.style.transform =
      'scaleX(1)';

    return;
  }


  /*
   * Always reset before starting
   * a fresh 7 second progress cycle.
   */
  heroProgress.style.transform =
    'scaleX(0)';


  heroProgressAnim =
    heroProgress.animate(
      [
        {
          transform:
            'scaleX(0)'
        },

        {
          transform:
            'scaleX(1)'
        }
      ],
      {
        duration:
          7000,

        easing:
          'linear',

        fill:
          'forwards'
      }
    );
}


    function stopHeroTimer(){
      if(
        heroTimer !==
        undefined
      ){
        window.clearTimeout(
          heroTimer
        );


        heroTimer =
          undefined;
      }
    }


    function scheduleHero(){
      stopHeroTimer();


      if(
        reducedMotion.matches ||
        heroFrameEls.length <
          2 ||
        document.hidden
      ){
        return;
      }


      heroTimer =
        window.setTimeout(
          ()=>{
            void showSlide(
              heroActive +
              1,
              true
            );
          },
          7000
        );
    }


    function animateHeroTitle(
      title:
        string
    ){
      if(
        !slideTitle
      ){
        return;
      }


      if(
        reducedMotion.matches
      ){
        slideTitle.textContent =
          title;

        return;
      }


      const previousAnimation =
        slideTitle
          .getAnimations();


      previousAnimation
        .forEach(
          animation=>{
            animation.cancel();
          }
        );


      const out =
        slideTitle.animate(
          [
            {
              opacity:
                1,
              transform:
                'translate3d(0,0,0)'
            },

            {
              opacity:
                0,
              transform:
                'translate3d(0,-7px,0)'
            }
          ],
          {
            duration:
              135,

            easing:
              'cubic-bezier(.4,0,1,1)',

            fill:
              'forwards'
          }
        );


      out.finished
        .catch(
          ()=>{}
        )
        .finally(
          ()=>{
            slideTitle.textContent =
              title;


            slideTitle
              .animate(
                [
                  {
                    opacity:
                      0,
                    transform:
                      'translate3d(0,8px,0)'
                  },

                  {
                    opacity:
                      1,
                    transform:
                      'translate3d(0,0,0)'
                  }
                ],
                {
                  duration:
                    280,

                  easing:
                    'cubic-bezier(.22,1,.36,1)',

                  fill:
                    'forwards'
                }
              );
          }
        );
    }


    function updateHeroMetadata(
      frame:
        HTMLElement
    ){
      const href =
        frame.dataset.href ||
        '';


      const title =
        frame.dataset.title ||
        '';


      if(
        href
      ){
        slideLinks
          .forEach(
            link=>{
              link.href =
                href;


              if(
                link.classList.contains(
                  'hero-project'
                )
              ){
                link.setAttribute(
                  'aria-label',
                  'Selected work: ' +
                  title
                );
              }
            }
          );
      }


      if(
        title
      ){
        animateHeroTitle(
          title
        );
      }


      if(
        slideCount
      ){
        slideCount.textContent =
          String(
            heroActive +
            1
          ).padStart(
            2,
            '0'
          );
      }
    }


    async function showSlide(
      index:
        number,

      automatic =
        false
    ){
      if(
        !heroFrameEls.length
      ){
        return;
      }


      const nextIndex =
        normalizeHeroIndex(
          index
        );


      if(
        nextIndex ===
        heroActive
      ){
        playHeroProgress();
        scheduleHero();

        return;
      }


      const token =
        ++heroRenderToken;


      /*
       * Critical improvement:
       * keep the current photograph visible
       * until the next one is really loaded
       * and decoded.
       */
      await prepareHeroFrame(
        nextIndex
      );


      if(
        token !==
        heroRenderToken
      ){
        return;
      }


      const previousFrame =
        heroFrameEls[
          heroActive
        ];


      const nextFrame =
        heroFrameEls[
          nextIndex
        ];


      if(
        !nextFrame
      ){
        return;
      }


      /*
       * Activate the decoded image first.
       * Because both frames are absolute,
       * this creates a clean crossfade with
       * no empty frame between them.
       */
      nextFrame
        .classList
        .add(
          'is-active'
        );


      previousFrame
        ?.classList
        .remove(
          'is-active'
        );


      heroActive =
        nextIndex;


      updateHeroMetadata(
        nextFrame
      );


      playHeroProgress();


      preloadNextHero();


      /*
       * Every completed transition gets
       * a fresh seven-second viewing window.
       */
      if(
        automatic ||
        !automatic
      ){
        scheduleHero();
      }
    }


    /*
     * First frame is already rendered by Astro.
     * Decode it and only preload the immediate next slide.
     */
    void prepareHeroFrame(
      0
    )
      .then(
        ()=>{
          preloadNextHero();
        }
      );


    playHeroProgress();


    scheduleHero();


    previousSlideButton
      ?.addEventListener(
        'click',
        ()=>{
          stopHeroTimer();


          void showSlide(
            heroActive -
              1
          );
        }
      );


    nextSlideButton
      ?.addEventListener(
        'click',
        ()=>{
          stopHeroTimer();


          void showSlide(
            heroActive +
              1
          );
        }
      );


    /*
     * Do not let the slideshow advance in a
     * background tab. Resume with a fresh timer.
     */
    document
      .addEventListener(
        'visibilitychange',
        ()=>{
          if(
            document.hidden
          ){
            stopHeroTimer();

            heroProgressAnim
              ?.pause();

          }else{
            heroProgressAnim
              ?.cancel();


            playHeroProgress();

            scheduleHero();

            preloadNextHero();
          }
        }
      );


    /*
     * Respect reduced-motion changes even if
     * the OS preference changes while the page
     * is already open.
     */
    reducedMotion
      .addEventListener?.(
        'change',
        ()=>{
          heroFrameEls
            .forEach(
              frame=>{
                frame.style.transitionDuration =
                  reducedMotion.matches
                    ? '1ms'
                    : '820ms';
              }
            );


          if(
            reducedMotion.matches
          ){
            stopHeroTimer();

            heroProgressAnim
              ?.cancel();

          }else{
            playHeroProgress();

            scheduleHero();

            preloadNextHero();
          }
        }
      );


    // Subtle hero parallax, driven by scroll progress through the sticky scene.

    const heroScene =
      document.querySelector<HTMLElement>(
        '.hero-scroll-scene'
      );


    const heroSection =
      document.querySelector<HTMLElement>(
        '.opening'
      );


    if (
      heroScene &&
      heroSection &&
      !reducedMotion.matches
    ) {
      let ticking =
        false;


      const update =
        () => {
          const rect =
            heroScene.getBoundingClientRect();


          const span =
            Math.max(
              heroScene.offsetHeight -
              window.innerHeight,

              1
            );


          const progress =
            Math.min(
              Math.max(
                -rect.top /
                span,

                0
              ),

              1
            );


          heroSection.style.setProperty(
            '--hero-image-shift',

            (
              progress *
              40
            ) +
            'px'
          );


          heroSection.style.setProperty(
            '--hero-content-shift',

            (
              progress *
              -18
            ) +
            'px'
          );


          heroSection.style.setProperty(
            '--hero-content-opacity',

            String(
              Math.max(
                1 -
                progress *
                .65,

                .3
              )
            )
          );


          ticking =
            false;
        };


      update();


      document.addEventListener(
        'scroll',

        () => {
          if (
            !ticking
          ) {
            requestAnimationFrame(
              update
            );

            ticking =
              true;
          }
        },

        {
          passive:
            true
        }
      );
    }
}
