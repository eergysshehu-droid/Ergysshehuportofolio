export function initFilmstrip(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Featured-works filmstrip: native horizontal scroll (touch/trackpad swipe
    // already works for free) plus a "next" button that pages forward one
    // viewport-ish at a time and loops back to the start at the end.

    const filmstrip =
      document.querySelector<HTMLElement>(
        '[data-filmstrip]'
      );


    const filmstripNext =
      document.querySelector<HTMLButtonElement>(
        '[data-filmstrip-next]'
      );


    filmstripNext?.addEventListener(
      'click',

      () => {
        if (
          !filmstrip
        ) {
          return;
        }


        const atEnd =
          filmstrip.scrollLeft +
          filmstrip.clientWidth >=
          filmstrip.scrollWidth -
          8;


        filmstrip.scrollTo({
          left:
            atEnd
              ? 0
              : filmstrip.scrollLeft +
                filmstrip.clientWidth *
                .72,

          behavior:
            reducedMotion.matches
              ? 'auto'
              : 'smooth'
        });
      }
    );
}
