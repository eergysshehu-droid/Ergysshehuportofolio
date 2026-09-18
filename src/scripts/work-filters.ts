export function initWorkFilters(){
  const filterButtons =
    Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '[data-filter]'
      )
    );

  const projectCards =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        '.work-section .project-card[data-kind]'
      )
    );

  const workEmpty =
    document.querySelector<HTMLElement>(
      '.work-empty'
    );

  const rail =
    document.querySelector<HTMLElement>(
      '[data-filter-rail]'
    );

  const previous =
    document.querySelector<HTMLButtonElement>(
      '[data-filter-prev]'
    );

  const next =
    document.querySelector<HTMLButtonElement>(
      '[data-filter-next]'
    );

  const reducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

  function centerButton(
    button:
      HTMLButtonElement
  ){
    if(
      !rail
    ){
      return;
    }

    const target =
      button.offsetLeft -
      (
        rail.clientWidth -
        button.offsetWidth
      ) /
      2;

    rail.scrollTo({
      left:
        Math.max(
          0,
          target
        ),

      behavior:
        reducedMotion.matches
          ? 'auto'
          : 'smooth'
    });
  }

  function scrollRail(
    direction:
      -1 |
      1
  ){
    if(
      !rail
    ){
      return;
    }

    rail.scrollBy({
      left:
        direction *
        Math.max(
          180,
          rail.clientWidth *
            .72
        ),

      behavior:
        reducedMotion.matches
          ? 'auto'
          : 'smooth'
    });
  }

  function applyProjectFilter(
    selectedButton:
      HTMLButtonElement
  ){
    const selectedFilter =
      selectedButton
        .dataset
        .filter ||
      'all';

    filterButtons
      .forEach(
        button=>{
          const active =
            button ===
              selectedButton;

          button
            .setAttribute(
              'aria-pressed',
              String(
                active
              )
            );

          button
            .classList
            .toggle(
              'is-active',
              active
            );
        }
      );

    let visibleCount =
      0;

    projectCards
      .forEach(
        card=>{
          const visible =
            selectedFilter ===
              'all' ||
            card.dataset.kind ===
              selectedFilter;

          card.hidden =
            !visible;

          card
            .setAttribute(
              'aria-hidden',
              String(
                !visible
              )
            );

          const image =
            card
              .querySelector<HTMLElement>(
                '.project-image'
              );

          if(
            visible
          ){
            visibleCount++;

          }else{
            image
              ?.style
              .setProperty(
                '--stack-darkness',
                '0'
              );

            image
              ?.style
              .removeProperty(
                '--stack-blur'
              );

            image
              ?.style
              .removeProperty(
                'will-change'
              );
          }
        }
      );

    if(
      workEmpty
    ){
      workEmpty.hidden =
        visibleCount >
          0;
    }

    centerButton(
      selectedButton
    );

    document
      .dispatchEvent(
        new CustomEvent(
          'portfolio:filter-change',
          {
            detail: {
              filter:
                selectedFilter,

              visibleCount
            }
          }
        )
      );
  }

  filterButtons
    .forEach(
      button=>{
        button
          .addEventListener(
            'click',
            ()=>{
              applyProjectFilter(
                button
              );
            }
          );
      }
    );

  previous
    ?.addEventListener(
      'click',
      ()=>scrollRail(
        -1
      )
    );

  next
    ?.addEventListener(
      'click',
      ()=>scrollRail(
        1
      )
    );

  const initiallyActive =
    filterButtons
      .find(
        button=>
          button
            .getAttribute(
              'aria-pressed'
            ) ===
          'true'
      ) ||
    filterButtons[
      0
    ];

  if(
    initiallyActive
  ){
    applyProjectFilter(
      initiallyActive
    );
  }
}
