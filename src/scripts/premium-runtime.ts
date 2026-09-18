export function initPremiumRuntime(){
  const root =
    document.documentElement;

  if(
    root.dataset
      .premiumRuntime ===
      'ready'
  ){
    return;
  }

  root.dataset
    .premiumRuntime =
      'ready';

  const reduceMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

  let viewportRaf:
    number |
    undefined;

  const syncViewport =
    ()=>{
      viewportRaf =
        undefined;

      const viewportHeight =
        window.visualViewport
          ?.height ||
        window.innerHeight;

      root.style
        .setProperty(
          '--app-vh',
          `${Math.round(
            viewportHeight
          )}px`
        );

      const header =
        document.querySelector<HTMLElement>(
          '.site-header'
        );

      if(
        header
      ){
        root.style
          .setProperty(
            '--live-header-h',
            `${Math.round(
              header
                .getBoundingClientRect()
                .height
            )}px`
          );
      }
    };

  const scheduleViewportSync =
    ()=>{
      if(
        viewportRaf !==
        undefined
      ){
        return;
      }

      viewportRaf =
        requestAnimationFrame(
          syncViewport
        );
    };

  syncViewport();

  window.addEventListener(
    'resize',
    scheduleViewportSync,
    {
      passive:
        true
    }
  );

  window.visualViewport
    ?.addEventListener(
      'resize',
      scheduleViewportSync,
      {
        passive:
          true
      }
    );

  const setInputMode =
    (
      mode:
        'keyboard' |
        'pointer'
    )=>{
      root.dataset
        .inputMode =
          mode;
    };

  document.addEventListener(
    'keydown',
    event=>{
      if(
        event.key ===
        'Tab'
      ){
        setInputMode(
          'keyboard'
        );
      }
    },
    {
      passive:
        true
    }
  );

  document.addEventListener(
    'pointerdown',
    ()=>{
      setInputMode(
        'pointer'
      );
    },
    {
      passive:
        true
    }
  );

  const markPageReady =
    ()=>{
      requestAnimationFrame(
        ()=>{
          root.classList
            .add(
              'page-ready'
            );
        }
      );
    };

  if(
    document.readyState ===
      'complete'
  ){
    markPageReady();
  }else{
    window.addEventListener(
      'load',
      markPageReady,
      {
        once:
          true
      }
    );
  }

  window.addEventListener(
    'pageshow',
    ()=>{
      root.classList
        .add(
          'page-ready'
        );

      scheduleViewportSync();
    }
  );

  if(
    reduceMotion.matches
  ){
    root.classList
      .add(
        'reduced-motion'
      );
  }
}
