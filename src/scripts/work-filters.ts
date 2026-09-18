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


            if(
              visible
            ){
              visibleCount++;

            }else{
              /*
               * Hidden cards must never retain stale
               * mobile stacking visual variables.
               */
              const image =
                card
                  .querySelector<HTMLElement>(
                    '.project-image'
                  );


              image
                ?.style
                .setProperty(
                  '--stack-blur',
                  '0px'
                );


              image
                ?.style
                .setProperty(
                  '--stack-darkness',
                  '0'
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


      /*
       * Tell the mobile stacking controller that
       * the visible project set has changed.
       */
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


    /*
     * Synchronise the initial filter state on page load.
     */
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
      filterButtons[0];


    if(
      initiallyActive
    ){
      applyProjectFilter(
        initiallyActive
      );
    }
}
