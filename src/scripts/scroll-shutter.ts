import '../styles/components/scroll-shutter.css';


const initScrollShutter =
  () => {

    const root =
      document.documentElement;


    /*
     * Prevent duplicate initialization.
     */
    if(
      root.dataset
        .scrollShutterReady ===
      'true'
    ){
      return;
    }


    root.dataset
      .scrollShutterReady =
        'true';


    const reduceMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );


    if(
      reduceMotion.matches
    ){
      return;
    }


    const mobile =
      window.matchMedia(
        '(max-width: 700px)'
      );


    /*
     * 180-degree shutter-inspired strength.
     *
     * This is intentionally subtle.
     * We want perceived motion,
     * not visibly soft photographs.
     */
    const MOBILE_MAX_BLUR =
      1.05;

    const DESKTOP_MAX_BLUR =
      1.4;

    const MAX_VELOCITY =
      2.4;


    /*
     * Media that may receive scroll blur.
     *
     * IMPORTANT:
     * .project-card images are intentionally absent.
     * Mobile sticky stacking keeps its own system.
     * The sticky hero image is also excluded on mobile so the
     * hero -> filmstrip -> Selected Work handoff does not combine
     * velocity blur with sticky/compositing changes.
     */
    const mediaSelector =
      [
        '.opening-image img',
        '.filmstrip-image img',
        '.latest-card img',
        '.journal-card-image img',
        '.journal-post-cover img',
        '.gallery.collection-body img',
        '.next-project-media img',
        '.about-portrait img'
      ]
        .join(
          ','
        );


    const media =
      Array
        .from(
          document
            .querySelectorAll<HTMLImageElement>(
              mediaSelector
            )
        )
        .filter(
          image =>
            !image.closest(
              '.project-card'
            ) &&
            !image.closest(
              '.lightbox'
            ) &&
            !(
              mobile.matches &&
              image.closest(
                '.opening-image'
              )
            )
        );


    if(
      !media.length
    ){
      return;
    }


    /*
     * Only visible media receives filter updates.
     * This keeps the effect lightweight.
     */
    const visibleMedia =
      new Set<HTMLImageElement>();


    const observer =
      new IntersectionObserver(
        entries => {

          entries
            .forEach(
              entry => {

                const image =
                  entry.target as
                    HTMLImageElement;


                if(
                  entry.isIntersecting
                ){
                  visibleMedia
                    .add(
                      image
                    );


                  image
                    .classList
                    .add(
                      'is-scroll-shutter-visible'
                    );
                }else{
                  visibleMedia
                    .delete(
                      image
                    );


                  image
                    .classList
                    .remove(
                      'is-scroll-shutter-visible'
                    );
                }

              }
            );

        },
        {
          rootMargin:
            '12% 0px',

          threshold:
            0
        }
      );


    media
      .forEach(
        image => {

          image
            .classList
            .add(
              'scroll-shutter-media'
            );


          observer
            .observe(
              image
            );

        }
      );


    root.style
      .setProperty(
        '--scroll-shutter-blur',
        '0px'
      );


    let lastY =
      window.scrollY;


    let lastTime =
      performance.now();


    let currentBlur =
      0;


    let targetBlur =
      0;


    let raf:
      number |
      undefined;


    const maxBlur =
      () =>
        mobile.matches
          ? MOBILE_MAX_BLUR
          : DESKTOP_MAX_BLUR;


    const smoothStep =
      (
        value:
          number
      ) =>
        value *
        value *
        (
          3 -
          2 *
          value
        );


    const render =
      () => {

        /*
         * Quickly follow new movement.
         */
        currentBlur +=
          (
            targetBlur -
            currentBlur
          ) *
          .46;


        /*
         * Short decay after scroll movement.
         *
         * This makes the image snap back toward
         * a crisp photographic frame instead of
         * leaving a soft trail.
         */
        targetBlur *=
          .62;


        if(
          currentBlur <
            .012 &&
          targetBlur <
            .012
        ){

          currentBlur =
            0;

          targetBlur =
            0;


          root.style
            .setProperty(
              '--scroll-shutter-blur',
              '0px'
            );


          root.classList
            .remove(
              'scroll-shutter-active'
            );


          raf =
            undefined;


          return;
        }


        root.style
          .setProperty(
            '--scroll-shutter-blur',
            `${currentBlur.toFixed(
              2
            )}px`
          );


        root.classList
          .add(
            'scroll-shutter-active'
          );


        raf =
          requestAnimationFrame(
            render
          );
      };


    const scheduleRender =
      () => {

        if(
          raf !==
          undefined
        ){
          return;
        }


        raf =
          requestAnimationFrame(
            render
          );
      };


    const handleScroll =
      () => {

        const now =
          performance.now();


        const currentY =
          window.scrollY;


        const deltaY =
          currentY -
          lastY;


        const deltaTime =
          Math.max(
            8,
            Math.min(
              64,
              now -
              lastTime
            )
          );


        lastY =
          currentY;


        lastTime =
          now;


        /*
         * No visible photographic media:
         * no reason to run the effect.
         */
        if(
          !visibleMedia.size
        ){
          return;
        }


        /*
         * Ignore huge programmatic jumps
         * such as anchor navigation.
         */
        if(
          Math.abs(
            deltaY
          ) >
          window.innerHeight *
            1.5
        ){
          return;
        }


        /*
         * px / ms
         */
        const velocity =
          Math.abs(
            deltaY
          ) /
          deltaTime;


        /*
         * Tiny finger movements remain perfectly sharp.
         */
        const threshold =
          .08;


        if(
          velocity <=
          threshold
        ){
          return;
        }


        const normalized =
          Math.max(
            0,
            Math.min(
              1,
              (
                velocity -
                threshold
              ) /
              MAX_VELOCITY
            )
          );


        const cinematicAmount =
          smoothStep(
            normalized
          );


        /*
         * Never reduce an already stronger impulse
         * while a fast swipe is still happening.
         */
        targetBlur =
          Math.max(
            targetBlur,
            cinematicAmount *
              maxBlur()
          );


        scheduleRender();
      };


    window
      .addEventListener(
        'scroll',
        handleScroll,
        {
          passive:
            true
        }
      );

  };


initScrollShutter();
