type StackItem = {
  card: HTMLElement;
  surface: HTMLElement | null;
  height: number;
  absoluteTop: number;
  darkness: number;
};

type StackGroup = {
  section: HTMLElement;
  grid: HTMLElement;
  items: StackItem[];
  active: boolean;
  cardSelector: string;
  surfaceSelector: string | null;
  darknessVar: string;
  textFade: boolean;
};

/*
 * V33 SMOOTH STACK
 * - Start almost immediately after real overlap begins.
 * - Do NOT reach black until the next card has covered ~82%.
 * - Scroll velocity changes response time:
 *   slow scroll  = soft / cinematic
 *   fast scroll  = catches up quickly
 */
const START_OVERLAP = 0.045;
const FULL_DARK_AT = 0.82;
const MAX_DARKNESS = 0.86;
const SLOW_RESPONSE_MS = 230;
const FAST_RESPONSE_MS = 58;
const FAST_SCROLL_PX_PER_MS = 1.85;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function documentTop(element: HTMLElement) {
  return element.getBoundingClientRect().top + window.scrollY;
}

function overlapProgress(nextTopInViewport: number, currentHeight: number) {
  return clamp01((currentHeight - nextTopInViewport) / currentHeight);
}

function targetDarkness(progress: number) {
  if (progress <= START_OVERLAP) return 0;

  const normalized =
    (progress - START_OVERLAP) /
    (FULL_DARK_AT - START_OVERLAP);

  return smoothstep(normalized) * MAX_DARKNESS;
}

function responseAlpha(deltaMs: number, velocityPxPerMs: number) {
  const speed = clamp01(velocityPxPerMs / FAST_SCROLL_PX_PER_MS);
  const responseMs =
    SLOW_RESPONSE_MS +
    (FAST_RESPONSE_MS - SLOW_RESPONSE_MS) * speed;

  return 1 - Math.exp(-Math.max(1, deltaMs) / responseMs);
}

export function initHomeStack() {
  if (!document.body.classList.contains('is-home')) return;

  const media = window.matchMedia('(max-width: 700px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const groups: StackGroup[] = [];

  const addGroup = (
    sectionSelector: string,
    gridSelector: string,
    cardSelector: string,
    surfaceSelector: string | null,
    darknessVar: string,
    textFade: boolean
  ) => {
    const section = document.querySelector<HTMLElement>(sectionSelector);
    const grid = section?.querySelector<HTMLElement>(gridSelector) ?? null;

    if (!section || !grid) return;

    groups.push({
      section,
      grid,
      items: [],
      active: false,
      cardSelector,
      surfaceSelector,
      darknessVar,
      textFade
    });
  };

  addGroup(
    '.work-section',
    '.project-grid',
    '.project-card',
    '.project-image',
    '--stack-darkness',
    true
  );

  addGroup(
    '.instagram-gallery-section',
    '.instagram-editorial-grid',
    '.instagram-editorial-card',
    null,
    '--ig-stack-darkness',
    false
  );

  if (!groups.length) return;

  let raf: number | null = null;
  let rebuildRaf: number | null = null;
  let lastWidth = window.innerWidth;
  let lastScrollY = window.scrollY;
  let lastFrameTime = performance.now();

  function visibleCards(group: StackGroup) {
    return Array.from(
      group.grid.querySelectorAll<HTMLElement>(group.cardSelector)
    ).filter(card => !card.hidden && getComputedStyle(card).display !== 'none');
  }

  function clearItem(group: StackGroup, card: HTMLElement) {
    card.style.removeProperty('z-index');
    card.style.removeProperty('--stack-text-opacity');

    const surface = group.surfaceSelector
      ? card.querySelector<HTMLElement>(group.surfaceSelector)
      : card;

    surface?.style.setProperty(group.darknessVar, '0');
    surface?.style.removeProperty('will-change');
  }

  function resetGroup(group: StackGroup) {
    group.grid
      .querySelectorAll<HTMLElement>(group.cardSelector)
      .forEach(card => clearItem(group, card));

    group.items = [];
    group.active = false;
  }

  function rebuildGroup(group: StackGroup) {
    if (!media.matches) {
      resetGroup(group);
      return;
    }

    group.grid
      .querySelectorAll<HTMLElement>(group.cardSelector)
      .forEach(card => clearItem(group, card));

    group.items = visibleCards(group).map((card, index) => {
      card.style.setProperty('z-index', String(index + 1));

      const surface = group.surfaceSelector
        ? card.querySelector<HTMLElement>(group.surfaceSelector)
        : card;

      surface?.style.setProperty(group.darknessVar, '0');

      return {
        card,
        surface,
        height: Math.max(1, card.offsetHeight),
        absoluteTop: documentTop(card),
        darkness: 0
      };
    });
  }

  function rebuild() {
    rebuildRaf = null;
    groups.forEach(rebuildGroup);
    schedule();
  }

  function scheduleRebuild() {
    if (rebuildRaf !== null) return;
    rebuildRaf = requestAnimationFrame(rebuild);
  }

  function update() {
    raf = null;

    if (!media.matches) return;

    const now = performance.now();
    const scrollY = window.scrollY;
    const deltaMs = Math.min(64, Math.max(1, now - lastFrameTime));
    const velocity = Math.abs(scrollY - lastScrollY) / deltaMs;
    const alpha = reducedMotion.matches
      ? 1
      : responseAlpha(deltaMs, velocity);

    lastFrameTime = now;
    lastScrollY = scrollY;

    let needsAnotherFrame = false;

    for (const group of groups) {
      if (!group.active || !group.items.length) continue;

      for (let index = 0; index < group.items.length; index++) {
        const item = group.items[index];
        const next = group.items[index + 1];

        if (!item.surface) continue;

        const progress = next
          ? overlapProgress(next.absoluteTop - scrollY, item.height)
          : 0;

        const target = targetDarkness(progress);
        const current = item.darkness;
        const nextValue = current + (target - current) * alpha;

        item.darkness = Math.abs(target - nextValue) < 0.0015
          ? target
          : nextValue;

        item.surface.style.setProperty(
          group.darknessVar,
          item.darkness.toFixed(3)
        );

        if (group.textFade) {
          const textTarget = 1 - smoothstep(
            clamp01((progress - 0.08) / 0.70)
          );
          item.card.style.setProperty(
            '--stack-text-opacity',
            textTarget.toFixed(3)
          );
        }

        if (!reducedMotion.matches && Math.abs(target - item.darkness) > 0.0025) {
          needsAnotherFrame = true;
        }
      }
    }

    if (needsAnotherFrame) schedule();
  }

  function schedule() {
    if (raf !== null) return;
    raf = requestAnimationFrame(update);
  }

  const observers: IntersectionObserver[] = [];

  groups.forEach(group => {
    const observer = new IntersectionObserver(
      entries => {
        group.active = media.matches && entries.some(entry => entry.isIntersecting);

        if (group === groups[0]) {
          document.body.classList.toggle('in-stack-grid', group.active);
        }

        if (group.active) schedule();
      },
      { rootMargin: '18% 0px 18% 0px' }
    );

    observer.observe(group.section);
    observers.push(observer);
  });

  window.addEventListener('scroll', schedule, { passive: true });

  document.addEventListener('portfolio:filter-change', scheduleRebuild);

  window.addEventListener(
    'resize',
    () => {
      const width = window.innerWidth;
      if (width === lastWidth) return;
      lastWidth = width;
      scheduleRebuild();
    },
    { passive: true }
  );

  window.addEventListener('orientationchange', () => {
    window.setTimeout(() => {
      lastWidth = window.innerWidth;
      scheduleRebuild();
    }, 160);
  });

  window.addEventListener('pageshow', scheduleRebuild);

  media.addEventListener('change', scheduleRebuild);
  reducedMotion.addEventListener('change', schedule);

  if ('ResizeObserver' in window) {
    groups.forEach(group => {
      let lastW = 0;
      let lastH = 0;

      const ro = new ResizeObserver(entries => {
        const entry = entries[0];
        if (!entry) return;

        const width = Math.round(entry.contentRect.width);
        const height = Math.round(entry.contentRect.height);

        if (width === lastW && height === lastH) return;
        lastW = width;
        lastH = height;
        scheduleRebuild();
      });

      ro.observe(group.grid);
    });
  }

  groups.forEach(group => {
    group.grid.querySelectorAll<HTMLImageElement>('img').forEach(image => {
      if (!image.complete) {
        image.addEventListener('load', scheduleRebuild, { once: true });
      }
    });
  });

  try {
    document.fonts?.ready.then(scheduleRebuild);
  } catch {}

  rebuild();
}
