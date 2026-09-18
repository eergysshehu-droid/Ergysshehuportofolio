export function initMobileMenu(){
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  const openButton = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const closeButton = document.querySelector<HTMLButtonElement>('[data-menu-close]');

  if(!menu || !openButton || !closeButton){
    return;
  }

  // Stable non-null aliases for callbacks/closures.
  const menuEl = menu;
  const openButtonEl = openButton;
  const closeButtonEl = closeButton;

  let lockedScrollY = 0;
  let isOpen = false;

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function getFocusable(){
    return Array.from(
      menuEl.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter(el => !el.hidden && el.getClientRects().length > 0);
  }

  function lockScroll(){
    lockedScrollY = window.scrollY;

    document.documentElement.classList.add('mobile-menu-open');

    Object.assign(document.body.style, {
      position: 'fixed',
      top: `-${lockedScrollY}px`,
      left: '0',
      right: '0',
      width: '100%'
    });
  }

  function unlockScroll(){
    document.documentElement.classList.remove('mobile-menu-open');

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    window.scrollTo({
      top: lockedScrollY,
      left: 0,
      behavior: 'auto'
    });
  }

  function setOpen(open:boolean, returnFocus=false){
    if(isOpen === open){
      return;
    }

    isOpen = open;

    menuEl.classList.toggle('is-open', open);
    menuEl.setAttribute('aria-hidden', String(!open));
    openButtonEl.setAttribute('aria-expanded', String(open));

    if(open){
      lockScroll();
      requestAnimationFrame(() => closeButtonEl.focus());
      return;
    }

    unlockScroll();

    if(returnFocus){
      requestAnimationFrame(() => openButtonEl.focus());
    }
  }

  openButtonEl.addEventListener('click', () => setOpen(true));
  closeButtonEl.addEventListener('click', () => setOpen(false, true));

  menuEl.addEventListener('click', event => {
    if(event.target === menuEl){
      setOpen(false, true);
    }
  });

  menuEl.querySelectorAll<HTMLAnchorElement>('a').forEach(link => {
    link.addEventListener('click', () => {
      setOpen(false, false);
    });
  });

  document.addEventListener('keydown', event => {
    if(!isOpen){
      return;
    }

    if(event.key === 'Escape'){
      event.preventDefault();
      setOpen(false, true);
      return;
    }

    if(event.key !== 'Tab'){
      return;
    }

    const focusable = getFocusable();

    if(!focusable.length){
      event.preventDefault();
      closeButtonEl.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if(event.shiftKey && active === first){
      event.preventDefault();
      last.focus();
    }else if(!event.shiftKey && active === last){
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('pageshow', () => {
    if(isOpen){
      setOpen(false, false);
    }
  });
}
