import {
  test,
  expect
} from '@playwright/test';

const visualEnabled =
  process.env.VISUAL_REGRESSION === '1';

async function waitForVisibleImages(page, selector = 'img') {
  await page.evaluate(async selector => {
    const margin = window.innerHeight;
    const images = Array.from(
      document.querySelectorAll(selector)
    ).filter(image => {
      const rect = image.getBoundingClientRect();

      return (
        rect.bottom >= -margin &&
        rect.top <= window.innerHeight + margin &&
        rect.right >= 0 &&
        rect.left <= window.innerWidth
      );
    });

    await Promise.all(
      images.map(async image => {
        if (!image.complete) {
          await new Promise(resolve => {
            let settled = false;

            const done = () => {
              if (settled) return;
              settled = true;
              window.clearTimeout(timer);
              resolve();
            };

            const timer = window.setTimeout(done, 4000);

            image.addEventListener('load', done, {once:true});
            image.addEventListener('error', done, {once:true});
          });
        }

        try {
          if (image.naturalWidth > 0) {
            await image.decode?.();
          }
        } catch {}
      })
    );
  }, selector);
}

async function gotoStable(page, path = '/') {
  await page.emulateMedia({
    reducedMotion: 'reduce'
  });

  await page.goto(path, {
    waitUntil: 'domcontentloaded'
  });

  await page.evaluate(async () => {
    try {
      await document.fonts?.ready;
    } catch {}
  });

  // Do not wait for every lazy image on the document. Images far below the
  // viewport may intentionally remain unloaded and would otherwise hang the
  // visual suite. Only settle images close to the current viewport.
  await waitForVisibleImages(page);
}

async function settleFrames(page) {
  await page.evaluate(() =>
    new Promise(resolve =>
      requestAnimationFrame(() =>
        requestAnimationFrame(resolve)
      )
    )
  );

  await waitForVisibleImages(page);

  await page.evaluate(() =>
    new Promise(resolve =>
      requestAnimationFrame(() =>
        requestAnimationFrame(resolve)
      )
    )
  );
}

async function scrollStackTo(page, gridSelector, cardSelector, progress) {
  const metrics = await page
    .locator(`${gridSelector} ${cardSelector}`)
    .evaluateAll(cards => {
      if (cards.length < 2) return null;

      const current = cards[0];
      const next = cards[1];

      return {
        currentHeight: Math.max(1, current.offsetHeight),
        nextAbsoluteTop:
          next.getBoundingClientRect().top + window.scrollY
      };
    });

  if (!metrics) {
    throw new Error(`Not enough cards for ${gridSelector}`);
  }

  const targetY =
    metrics.nextAbsoluteTop -
    metrics.currentHeight * (1 - progress);

  await page.evaluate(y => {
    window.scrollTo(0, Math.max(0, y));
  }, targetY);

  await settleFrames(page);
}

test.describe('Visual regression baseline', () => {
  test.skip(
    !visualEnabled,
    'Set VISUAL_REGRESSION=1 after baseline snapshots are generated and reviewed.'
  );

  test('home hero top', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium');

    await gotoStable(page, '/');
    await page.evaluate(() => window.scrollTo(0, 0));
    await settleFrames(page);

    await expect(page).toHaveScreenshot('home-hero-top.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.008
    });
  });

  test('mobile hero to filmstrip handoff', async ({page}, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile-'));

    await gotoStable(page, '/');

    const top = await page.locator('.filmstrip-section').evaluate(element =>
      element.getBoundingClientRect().top + window.scrollY
    );

    await page.evaluate(y => {
      window.scrollTo(0, Math.max(0, y - window.innerHeight * 0.72));
    }, top);

    await settleFrames(page);

    await expect(page).toHaveScreenshot('hero-filmstrip-handoff.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01
    });
  });

  for (const state of [
    ['25', 0.25],
    ['55', 0.55],
    ['85', 0.85]
  ]) {
    test(`mobile selected work ${state[0]} percent overlap`, async ({page}, testInfo) => {
      test.skip(!testInfo.project.name.startsWith('mobile-'));

      await gotoStable(page, '/');
      await scrollStackTo(
        page,
        '.work-section .project-grid',
        '.project-card',
        state[1]
      );

      await expect(page).toHaveScreenshot(`selected-work-${state[0]}.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.01
      });
    });
  }

  test('mobile Instagram stack geometry', async ({page}, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile-'));

    await gotoStable(page, '/');
    await scrollStackTo(
      page,
      '.instagram-gallery-section .instagram-editorial-grid',
      '.instagram-editorial-card',
      0.55
    );

    await expect(page).toHaveScreenshot('instagram-stack-55.png', {
      animations: 'disabled',
      mask: [
        page.locator('.instagram-editorial-card img')
      ],
      maxDiffPixelRatio: 0.01
    });
  });

  test('mobile menu open', async ({page}, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile-'));

    await gotoStable(page, '/');
    await page.locator('[data-menu-open]').click();
    await expect(page.locator('[data-mobile-menu]')).toHaveClass(/is-open/);
    await settleFrames(page);

    await expect(page).toHaveScreenshot('mobile-menu-open.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.008
    });
  });

  test('about intro', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium');

    await gotoStable(page, '/about/');

    await expect(page.locator('.about-intro')).toHaveScreenshot('about-intro.png', {
      animations: 'disabled',
      mask: [page.locator('.about-intro img')],
      maxDiffPixelRatio: 0.008
    });
  });

  test('book hero', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium');

    await gotoStable(page, '/book/');

    await expect(page.locator('.book-hero')).toHaveScreenshot('book-hero.png', {
      animations: 'disabled',
      mask: [page.locator('.book-hero-media img')],
      maxDiffPixelRatio: 0.008
    });
  });

  test('project intro', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium');

    await gotoStable(page, '/projects/');
    const href = await page.locator('.project-card a').first().getAttribute('href');

    if (!href) {
      throw new Error('No project href available for visual baseline.');
    }

    await gotoStable(page, href);

    await expect(page.locator('[data-project-intro]')).toHaveScreenshot('project-intro.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.008
    });
  });

  test('footer', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium');

    await gotoStable(page, '/');

    const footer = page.locator('#site-footer-final');
    await footer.scrollIntoViewIfNeeded();
    await settleFrames(page);

    await expect(footer).toHaveScreenshot('footer.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.008
    });
  });
});
