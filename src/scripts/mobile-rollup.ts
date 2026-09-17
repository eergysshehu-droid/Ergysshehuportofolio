const mobileQuery =
  window.matchMedia(
    '(max-width: 700px)'
  );


const initMobileRollup =
  () => {

    if (
      !mobileQuery.matches
    ) {
      return;
    }


    const intro =
      document.querySelector<HTMLElement>(
        '.collection-intro'
      );


    const title =
      intro?.querySelector<HTMLElement>(
        'h1'
      );


    if (
      !intro ||
      !title ||
      document.querySelector(
        '.mobile-title-rollup'
      )
    ) {
      return;
    }


    const header =
      document.querySelector<HTMLElement>(
        '.site-header'
      );


    const rollup =
      document.createElement(
        'div'
      );


    rollup.className =
      'mobile-title-rollup';


    rollup.setAttribute(
      'aria-hidden',
      'true'
    );


    const text =
      document.createElement(
        'span'
      );


    text.textContent =
      title.textContent
        ?.trim() ||
      '';


    rollup.appendChild(
      text
    );


    document.body.appendChild(
      rollup
    );


    const syncTop =
      () => {

        const headerHidden =
          header
            ?.classList
            .contains(
              'is-hidden'
            );


        const headerHeight =
          header
            ?.getBoundingClientRect()
            .height ||
          72;


        const top =
          headerHidden
            ? 8
            : headerHeight + 8;


        rollup.style.setProperty(
          '--rollup-top',
          `${Math.round(top)}px`
        );
      };


    syncTop();


    const titleObserver =
      new IntersectionObserver(
        entries => {

          const entry =
            entries[0];


          if (
            !entry
          ) {
            return;
          }


          const headerHeight =
            header
              ?.getBoundingClientRect()
              .height ||
            72;


          const passedTitle =
            !entry.isIntersecting &&
            entry.boundingClientRect.bottom <
              headerHeight;


          rollup
            .classList
            .toggle(
              'is-visible',
              passedTitle
            );
        },

        {
          threshold: [
            0,
            1
          ]
        }
      );


    titleObserver.observe(
      title
    );


    if (
      header
    ) {
      const headerObserver =
        new MutationObserver(
          syncTop
        );


      headerObserver.observe(
        header,
        {
          attributes: true,
          attributeFilter: [
            'class'
          ]
        }
      );
    }


    window.addEventListener(
      'resize',
      syncTop,
      {
        passive: true
      }
    );
  };


if (
  document.readyState ===
  'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    initMobileRollup,
    {
      once: true
    }
  );

} else {
  initMobileRollup();
}
