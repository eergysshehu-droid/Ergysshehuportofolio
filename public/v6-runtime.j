/*
 * ERGYS SHEHU — V6 RUNTIME
 *
 * Adds:
 * - threshold-based header show/hide
 * - mobile menu scroll lock + exact scroll restore
 * - safe orientation refresh
 * - micro press feedback
 * - page visibility cleanup
 *
 * It deliberately does NOT rewrite the homepage stack geometry.
 */

(() => {
  'use strict';

  const reducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

  const header =
    document.querySelector(
      '.site-header'
    );

  const mobileMenu =
    document.querySelector(
      '.mobile-menu'
    );

  let menuScrollY =
    0;

  let bodyWasFixed =
    false;

  /* --------------------------------------------------------------- */
  /* HEADER INTENT CONTROLLER                                        */
  /* --------------------------------------------------------------- */

  if (
    header instanceof HTMLElement
  ) {
    let lastY =
      Math.max(
        0,
        window.scrollY
      );

    let accumulated =
      0;

    let direction =
      0;

    let raf =
      0;

    const DELTA_THRESHOLD =
      10;

    const TOP_GUARD =
      Math.max(
        80,
        header.offsetHeight || 80
      );

    const updateHeader =
      () => {
        raf =
          0;

        const y =
          Math.max(
            0,
            window.scrollY
          );

        const delta =
          y -
          lastY;

        const nextDirection =
          delta > 0
            ? 1
            : delta < 0
              ? -1
              : 0;

        header.classList.toggle(
          'is-scrolled',
          y > TOP_GUARD
        );

        if (
          reducedMotion.matches ||
          document.documentElement.classList.contains(
            'mobile-menu-open'
          )
        ) {
          header.classList.remove(
            'is-hidden'
          );

          lastY =
            y;

          accumulated =
            0;

          return;
        }

        if (
          y <= TOP_GUARD
        ) {
          header.classList.remove(
            'is-hidden'
          );

          lastY =
            y;

          accumulated =
            0;

          direction =
            0;

          return;
        }

        if (
          nextDirection === 0
        ) {
          return;
        }

        if (
          nextDirection !== direction
        ) {
          accumulated =
            0;

          direction =
            nextDirection;
        }

        accumulated +=
          Math.abs(
            delta
          );

        if (
          accumulated >=
          DELTA_THRESHOLD
        ) {
          header.classList.toggle(
            'is-hidden',
            direction > 0
          );

          accumulated =
            0;
        }

        lastY =
          y;
      };

    const requestHeader =
      () => {
        if (
          raf
        ) {
          return;
        }

        raf =
          requestAnimationFrame(
            updateHeader
          );
      };

    document.addEventListener(
      'scroll',
      requestHeader,
      {
        passive:
          true
      }
    );

    window.addEventListener(
      'resize',
      requestHeader,
      {
        passive:
          true
      }
    );

    updateHeader();
  }

  /* --------------------------------------------------------------- */
  /* MOBILE MENU SCROLL LOCK                                         */
  /* --------------------------------------------------------------- */

  const lockPage =
    () => {
      if (
        bodyWasFixed
      ) {
        return;
      }

      menuScrollY =
        window.scrollY;

      document.documentElement
        .classList
        .add(
          'mobile-menu-open'
        );

      document.body.style.position =
        'fixed';

      document.body.style.top =
        `-${menuScrollY}px`;

      document.body.style.left =
        '0';

      document.body.style.right =
        '0';

      document.body.style.width =
        '100%';

      bodyWasFixed =
        true;
    };

  const unlockPage =
    () => {
      if (
        !bodyWasFixed
      ) {
        document.documentElement
          .classList
          .remove(
            'mobile-menu-open'
          );

        return;
      }

      document.body.style.position =
        '';

      document.body.style.top =
        '';

      document.body.style.left =
        '';

      document.body.style.right =
        '';

      document.body.style.width =
        '';

      document.documentElement
        .classList
        .remove(
          'mobile-menu-open'
        );

      window.scrollTo(
        0,
        menuScrollY
      );

      bodyWasFixed =
        false;
    };

  if (
    mobileMenu instanceof HTMLDetailsElement
  ) {
    mobileMenu.addEventListener(
      'toggle',
      () => {
        if (
          mobileMenu.open
        ) {
          lockPage();
        } else {
          unlockPage();
        }
      }
    );

    mobileMenu
      .querySelectorAll(
        'a'
      )
      .forEach(
        link => {
          link.addEventListener(
            'click',
            () => {
              unlockPage();
            }
          );
        }
      );
  }

  /* --------------------------------------------------------------- */
  /* PRESS FEEDBACK                                                   */
  /* --------------------------------------------------------------- */

  const pressTargets =
    document.querySelectorAll(
      [
        '.site-header a',
        '.site-header button',
        '.mobile-menu summary',
        '.mobile-menu a',
        '.mobile-menu button',
        '[data-filter]',
        '.hero-nav-arrows button',
        '.hero-explore',
        '.gallery-cta',
        '.lightbox button',
        '.lightbox-book',
        '.next-project > a'
      ].join(',')
    );

  pressTargets.forEach(
    element => {
      if (
        !(element instanceof HTMLElement)
      ) {
        return;
      }

      element.classList.add(
        'v6-pressable'
      );

      const down =
        () => {
          element.classList.add(
            'is-pressed'
          );
        };

      const up =
        () => {
          element.classList.remove(
            'is-pressed'
          );
        };

      element.addEventListener(
        'pointerdown',
        down,
        {
          passive:
            true
        }
      );

      element.addEventListener(
        'pointerup',
        up,
        {
          passive:
            true
        }
      );

      element.addEventListener(
        'pointercancel',
        up,
        {
          passive:
            true
        }
      );

      element.addEventListener(
        'pointerleave',
        up,
        {
          passive:
            true
        }
      );
    }
  );

  /* --------------------------------------------------------------- */
  /* ORIENTATION / VIEWPORT REFRESH                                  */
  /* --------------------------------------------------------------- */

  const refreshViewport =
    () => {
      document.documentElement.style.setProperty(
        '--v6-vh',
        `${window.innerHeight * .01}px`
      );

      if (
        header instanceof HTMLElement
      ) {
        header.classList.remove(
          'is-hidden'
        );
      }

      /*
       * Re-use the existing event already understood
       * by the homepage stack controller.
       */
      document.dispatchEvent(
        new CustomEvent(
          'portfolio:filter-change',
          {
            detail: {
              reason:
                'viewport-refresh'
            }
          }
        )
      );
    };

  refreshViewport();

  window.addEventListener(
    'orientationchange',
    () => {
      window.setTimeout(
        refreshViewport,
        120
      );
    }
  );

  window.addEventListener(
    'resize',
    () => {
      requestAnimationFrame(
        refreshViewport
      );
    },
    {
      passive:
        true
    }
  );

  /* --------------------------------------------------------------- */
  /* TAB VISIBILITY CLEANUP                                          */
  /* --------------------------------------------------------------- */

  document.addEventListener(
    'visibilitychange',
    () => {
      if (
        !document.hidden &&
        header instanceof HTMLElement
      ) {
        header.classList.remove(
          'is-hidden'
        );
      }
    }
  );

  /* --------------------------------------------------------------- */
  /* REDUCED MOTION LIVE CHANGE                                      */
  /* --------------------------------------------------------------- */

  reducedMotion.addEventListener?.(
    'change',
    () => {
      if (
        reducedMotion.matches &&
        header instanceof HTMLElement
      ) {
        header.classList.remove(
          'is-hidden'
        );
      }
    }
  );
})();
