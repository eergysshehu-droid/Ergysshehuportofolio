export function initHomeIntro(){
const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );


    // Cinematic intro — plays once per browser tab session (sessionStorage-gated),
    // skipped entirely under reduced motion. The overlay covers the hero at
    // z-index:9999 while it plays, so the hero's own fade/scale entrance just
    // runs underneath, unseen, and is already finished by the time the curtain
    // opens. Every path below ends by removing 'intro-running' from <html> and/or
    // clearing the title's inline transform, so the headline can never be left
    // permanently hidden if a step above it fails.

    const introSeenKey =
      'ergys-intro-seen';

    const introEl =
      document.querySelector<HTMLElement>(
        '[data-intro]'
      );

    let introSeen =
      false;

    try {
      introSeen =
        sessionStorage.getItem(
          introSeenKey
        ) === '1';
    } catch {}


    const introTitle =
      document.querySelector<HTMLElement>(
        '.title-mask [data-slide-title]'
      );


    if (
      introEl
    ) {
      if (
        reducedMotion.matches ||
        introSeen
      ) {
        introEl.remove();

        if (
          introTitle
        ) {
          introTitle.style.transform =
            'none';
        }
      } else {
        document.documentElement
          .classList.add(
            'intro-running'
          );


        const isMobile =
          window.matchMedia(
            '(max-width:700px)'
          ).matches;


        const t = (
          ms: number
        ) =>
          Math.round(
            ms *
            (
              isMobile
                ? 0.75
                : 1
            )
          );


        const leftCurtain =
          introEl.querySelector<HTMLElement>(
            '.intro-curtain-left'
          );


        const rightCurtain =
          introEl.querySelector<HTMLElement>(
            '.intro-curtain-right'
          );


        const introLine =
          introEl.querySelector<HTMLElement>(
            '.intro-line'
          );


        const sweep =
          document.querySelector<HTMLElement>(
            '[data-hero-sweep]'
          );


        setTimeout(
          () =>
            introLine?.animate(
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
                  t(
                    550
                  ),

                easing:
                  'cubic-bezier(.2,.7,.2,1)',

                fill:
                  'forwards'
              }
            ),

          t(
            250
          )
        );


        setTimeout(
          () => {
            leftCurtain?.animate(
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
                    1100
                  ),

                easing:
                  'cubic-bezier(.77,0,.18,1)',

                fill:
                  'forwards'
              }
            );


            rightCurtain?.animate(
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
                    1100
                  ),

                easing:
                  'cubic-bezier(.77,0,.18,1)',

                fill:
                  'forwards'
              }
            );
          },

          t(
            850
          )
        );


        setTimeout(
          () => {
            introEl.animate(
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
                    450
                  ),

                easing:
                  'ease',

                fill:
                  'forwards'
              }
            );


            introTitle?.animate(
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
                    850
                  ),

                easing:
                  'cubic-bezier(.2,.75,.2,1)',

                fill:
                  'forwards'
              }
            );
          },

          t(
            1450
          )
        );


        setTimeout(
          () =>
            sweep?.animate(
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
                    1800
                  ),

                easing:
                  'ease-in-out'
              }
            ),

          t(
            1800
          )
        );


        setTimeout(
          () => {
            introEl.remove();

            document.documentElement
              .classList.remove(
                'intro-running'
              );

            if (
              introTitle
            ) {
              introTitle.style.transform =
                'none';
            }

            try {
              sessionStorage.setItem(
                introSeenKey,
                '1'
              );
            } catch {}
          },

          t(
            2300
          )
        );
      }
    }
}
