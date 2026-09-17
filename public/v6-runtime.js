/*
 * ERGYS SHEHU — V6 RUNTIME
 * Lightweight interaction layer.
 *
 * IMPORTANT:
 * This script deliberately does NOT modify:
 * - mobile Selected Work stacking
 * - .project-card position
 * - .project-card top
 * - .work-section overflow
 * - .project-grid overflow
 * - --stack-blur
 * - --stack-darkness
 */


(() => {
  'use strict';


  /*
   * Prevent duplicate initialisation in case
   * the script is injected more than once.
   */
  if (
    window.__ERGYS_V6_RUNTIME__
  ) {
    return;
  }


  window.__ERGYS_V6_RUNTIME__ =
    true;


  const root =
    document.documentElement;


  const reduceMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );


  /*
   * ------------------------------------------------------------
   * HELPERS
   * ------------------------------------------------------------
   */


  const clamp = (
    value,
    min,
    max
  ) =>
    Math.min(
      max,
      Math.max(
        min,
        value
      )
    );


  const isMobile =
    () =>
      window.matchMedia(
        '(max-width: 700px)'
      ).matches;


  const menuIsOpen =
    () =>
      Boolean(
        document.querySelector(
          'details.mobile-menu[open]'
        )
      );


  const lightboxIsOpen =
    () =>
      root.classList.contains(
        'lightbox-open'
      );


  /*
   * ------------------------------------------------------------
   * MOBILE MENU STATE
   * ------------------------------------------------------------
   *
   * Keeps one global state on <html>.
   * Useful for scroll lock / header behaviour.
   */


  const mobileMenus =
    Array.from(
      document.querySelectorAll(
        'details.mobile-menu'
      )
    );


  const syncMenuState =
    () => {
      const open =
        mobileMenus.some(
          menu =>
            menu.open
        );


      root.classList.toggle(
        'mobile-menu-open',
        open
      );
    };


  mobileMenus.forEach(
    menu => {
      menu.addEventListener(
        'toggle',
        syncMenuState
      );
    }
  );


  syncMenuState();


  /*
   * ------------------------------------------------------------
   * PRESS FEEDBACK
   * ------------------------------------------------------------
   *
   * Adds subtle tactile feedback without vibration.
   */


  const pressableSelector = [
    'button',
    'summary',
    '.cta-row',
    '.gallery-cta',
    '.mobile-book',
    '.project-card a',
    '.latest-card a',
    '.journal-card',
    '.next-project > a'
  ].join(',');


  const pressables =
    Array.from(
      document.querySelectorAll(
        pressableSelector
      )
    );


  pressables.forEach(
    element => {

      element.classList.add(
        'v6-pressable'
      );


      const press =
        () => {
          if (
            reduceMotion.matches
          ) {
            return;
          }


          element.classList.add(
            'is-pressed'
          );
        };


      const release =
        () => {
          element.classList.remove(
            'is-pressed'
          );
        };


      element.addEventListener(
        'pointerdown',
        press,
        {
          passive:
            true
        }
      );


      element.addEventListener(
        'pointerup',
        release,
        {
          passive:
            true
        }
      );


      element.addEventListener(
        'pointercancel',
        release,
        {
          passive:
            true
        }
      );


      element.addEventListener(
        'pointerleave',
        release,
        {
          passive:
            true
        }
      );


      element.addEventListener(
        'blur',
        release
      );
    }
  );


  /*
   * ------------------------------------------------------------
   * PREMIUM HEADER
   * ------------------------------------------------------------
   *
   * Desktop:
   * - transparent / normal at top
   * - scrolled state after small threshold
   *
   * Mobile:
   * - hides only after intentional downward scroll
   * - returns when scrolling upward
   *
   * Hysteresis prevents shaking.
   */


  const header =
    document.querySelector(
      '.site-header'
    );


  if (
    header
  ) {
    let previousY =
      Math.max(
        0,
        window.scrollY
      );


    let ticking =
      false;


    let directionDistance =
      0;


    let previousDirection =
      0;


    const TOP_THRESHOLD =
      54;


    const MOBILE_HIDE_AFTER =
      110;


    const MOBILE_DIRECTION_DISTANCE =
      24;


    const updateHeader =
      () => {
        ticking =
          false;


        const y =
          Math.max(
            0,
            window.scrollY
          );


        header.classList.toggle(
          'is-scrolled',
          y >
            TOP_THRESHOLD
        );


        /*
         * Never hide while overlays are open.
         */
        if (
          menuIsOpen() ||
          lightboxIsOpen()
        ) {
          header.classList.remove(
            'is-hidden'
          );


          previousY =
            y;


          directionDistance =
            0;


          return;
        }


        /*
         * Desktop keeps the normal header behaviour.
         * Hide-on-scroll is reserved for phones.
         */
        if (
          !isMobile() ||
          reduceMotion.matches
        ) {
          header.classList.remove(
            'is-hidden'
          );


          previousY =
            y;


          directionDistance =
            0;


          return;
        }


        const delta =
          y -
          previousY;


        const direction =
          delta >
            0
            ? 1
            : delta <
                0
              ? -1
              : 0;


        if (
          direction !==
            0
        ) {
          if (
            direction !==
            previousDirection
          ) {
            directionDistance =
              0;


            previousDirection =
              direction;
          }


          directionDistance +=
            Math.abs(
              delta
            );
        }


        if (
          y <
          TOP_THRESHOLD
        ) {
          header.classList.remove(
            'is-hidden'
          );


          directionDistance =
            0;

        } else if (
          direction ===
            1 &&
          y >
            MOBILE_HIDE_AFTER &&
          directionDistance >
            MOBILE_DIRECTION_DISTANCE
        ) {
          header.classList.add(
            'is-hidden'
          );


          directionDistance =
            0;

        } else if (
          direction ===
            -1 &&
          directionDistance >
            MOBILE_DIRECTION_DISTANCE
        ) {
          header.classList.remove(
            'is-hidden'
          );


          directionDistance =
            0;
        }


        previousY =
          y;
      };


    const requestHeaderUpdate =
      () => {
        if (
          ticking
        ) {
          return;
        }


        ticking =
          true;


        requestAnimationFrame(
          updateHeader
        );
      };


    window.addEventListener(
      'scroll',
      requestHeaderUpdate,
      {
        passive:
          true
      }
    );


    window.addEventListener(
      'resize',
      requestHeaderUpdate,
      {
        passive:
          true
      }
    );


    window.addEventListener(
      'orientationchange',
      requestHeaderUpdate,
      {
        passive:
          true
      }
    );


    mobileMenus.forEach(
      menu => {
        menu.addEventListener(
          'toggle',
          requestHeaderUpdate
        );
      }
    );


    updateHeader();
  }


  /*
   * ------------------------------------------------------------
   * IMAGE DECODE SAFETY
   * ------------------------------------------------------------
   *
   * Images already loaded by the page remain untouched.
   * We simply mark successfully decoded images.
   *
   * Can be used by CSS later without creating loaders
   * or changing current image behaviour.
   */


  const images =
    Array.from(
      document.images
    );


  images.forEach(
    image => {

      const markReady =
        () => {
          image.classList.add(
            'is-decoded'
          );
        };


      const markError =
        () => {
          image.classList.add(
            'has-image-error'
          );
        };


      if (
        image.complete &&
        image.naturalWidth >
          0
      ) {
        if (
          typeof image.decode ===
          'function'
        ) {
          image
            .decode()
            .then(
              markReady
            )
            .catch(
              markReady
            );

        } else {
          markReady();
        }

      } else {
        image.addEventListener(
          'load',
          () => {
            if (
              typeof image.decode ===
              'function'
            ) {
              image
                .decode()
                .then(
                  markReady
                )
                .catch(
                  markReady
                );

            } else {
              markReady();
            }
          },
          {
            once:
              true
          }
        );


        image.addEventListener(
          'error',
          markError,
          {
            once:
              true
          }
        );
      }
    }
  );


  /*
   * ------------------------------------------------------------
   * SAFE EXTERNAL LINK HANDLING
   * ------------------------------------------------------------
   */


  const externalLinks =
    Array.from(
      document.querySelectorAll(
        'a[target="_blank"]'
      )
    );


  externalLinks.forEach(
    link => {
      const currentRel =
        (
          link.getAttribute(
            'rel'
          ) ||
          ''
        )
          .split(
            /\s+/
          )
          .filter(
            Boolean
          );


      const rel =
        new Set(
          currentRel
        );


      rel.add(
        'noopener'
      );


      rel.add(
        'noreferrer'
      );


      link.setAttribute(
        'rel',
        Array.from(
          rel
        ).join(
          ' '
        )
      );
    }
  );


  /*
   * ------------------------------------------------------------
   * VIEWPORT HEIGHT VARIABLE
   * ------------------------------------------------------------
   *
   * Useful for modern mobile browser chrome changes.
   * Does not replace 100dvh; it is only an additional
   * reliable measurement for future V6 components.
   */


  let viewportFrame =
    0;


  const updateViewport =
    () => {
      if (
        viewportFrame
      ) {
        cancelAnimationFrame(
          viewportFrame
        );
      }


      viewportFrame =
        requestAnimationFrame(
          () => {
            viewportFrame =
              0;


            const height =
              window
                .visualViewport
                ?.height ||
              window.innerHeight;


            root.style.setProperty(
              '--v6-viewport-height',
              `${Math.round(
                height
              )}px`
            );
          }
        );
    };


  window.addEventListener(
    'resize',
    updateViewport,
    {
      passive:
        true
    }
  );


  window.addEventListener(
    'orientationchange',
    updateViewport,
    {
      passive:
        true
    }
  );


  window
    .visualViewport
    ?.addEventListener(
      'resize',
      updateViewport,
      {
        passive:
          true
      }
    );


  updateViewport();


  /*
   * Runtime successfully initialised.
   */
  root.classList.add(
    'v6-runtime-ready'
  );
})();
