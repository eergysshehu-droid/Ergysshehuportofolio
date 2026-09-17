import {
  test,
  expect
} from '@playwright/test';


const criticalRoutes = [
  '/',
  '/fashion/',
  '/portraits/',
  '/weddings/',
  '/films/',
  '/projects/',
  '/about/',
  '/journal/',
  '/book/',

  '/sq/',
  '/sq/fashion/',
  '/sq/portraits/',
  '/sq/weddings/',
  '/sq/films/',
  '/sq/projects/',
  '/sq/about/',
  '/sq/journal/',
  '/sq/book/'
];


test.describe(
  'Critical public routes',

  () => {
    for (
      const route
      of criticalRoutes
    ) {
      test(
        `${route} loads without browser errors`,

        async (
          {
            page
          },

          testInfo
        ) => {
          test.skip(
            testInfo
              .project
              .name !==
              'desktop-chromium'
          );

          const pageErrors =
            [];

          page.on(
            'pageerror',

            error => {
              pageErrors.push(
                error.message
              );
            }
          );

          const response =
            await page.goto(
              route,
              {
                waitUntil:
                  'domcontentloaded'
              }
            );

          expect(
            response
          ).not.toBeNull();

          expect(
            response.status()
          ).toBeLessThan(
            400
          );

          await expect(
            page.locator(
              'body'
            )
          ).toBeVisible();

          expect(
            pageErrors
          ).toEqual(
            []
          );
        }
      );
    }
  }
);


test(
  'EN / SQ language switch works',

  async (
    {
      page
    },

    testInfo
  ) => {
    test.skip(
      testInfo
        .project
        .name !==
        'desktop-chromium'
    );

    await page.goto(
      '/'
    );

    await page
      .locator(
        '.desktop-nav .language-switch button[data-lang="sq"]'
      )
      .click();

    await expect(
      page
    ).toHaveURL(
      /\/sq\/$/
    );

    await expect(
      page.locator(
        'html'
      )
    ).toHaveAttribute(
      'lang',
      'sq'
    );

    await page
      .locator(
        '.desktop-nav .language-switch button[data-lang="en"]'
      )
      .click();

    await expect(
      page
    ).toHaveURL(
      /\/$/
    );

    await expect(
      page.locator(
        'html'
      )
    ).toHaveAttribute(
      'lang',
      'en'
    );
  }
);


test(
  'mobile navigation opens and closes',

  async (
    {
      page
    },

    testInfo
  ) => {
    test.skip(
      testInfo
        .project
        .name !==
        'mobile-chromium'
    );

    await page.goto(
      '/'
    );

    const menu =
      page.locator(
        'details.mobile-menu'
      );

    await menu
      .locator(
        'summary'
      )
      .click();

    expect(
      await menu.evaluate(
        element =>
          element.open
      )
    ).toBe(
      true
    );

    await expect(
      menu.locator(
        '.mobile-menu-screen'
      )
    ).toBeVisible();

    await menu
      .locator(
        '[data-menu-close]'
      )
      .click();

    expect(
      await menu.evaluate(
        element =>
          element.open
      )
    ).toBe(
      false
    );
  }
);


test(
  'homepage mobile photo stacking stays enabled',

  async (
    {
      page
    },

    testInfo
  ) => {
    test.skip(
      testInfo
        .project
        .name !==
        'mobile-chromium'
    );

    await page.goto(
      '/'
    );

    const card =
      page.locator(
        'body.is-home .work-section .project-card'
      )
        .first();

    await expect(
      card
    ).toBeAttached();

    const state =
      await card.evaluate(
        element => {
          const section =
            element.closest(
              '.work-section'
            );

          const grid =
            element.closest(
              '.project-grid'
            );

          return {
            cardPosition:
              getComputedStyle(
                element
              ).position,

            cardTop:
              getComputedStyle(
                element
              ).top,

            sectionOverflow:
              section
                ? getComputedStyle(
                    section
                  ).overflow
                : null,

            gridOverflow:
              grid
                ? getComputedStyle(
                    grid
                  ).overflow
                : null
          };
        }
      );

    expect(
      state.cardPosition
    ).toBe(
      'sticky'
    );

    expect(
      state.cardTop
    ).toBe(
      '0px'
    );

    expect(
      state.sectionOverflow
    ).not.toBe(
      'hidden'
    );

    expect(
      state.gridOverflow
    ).not.toBe(
      'hidden'
    );
  }
);


test(
  'Book form submits through API enhancement',

  async ({
    page
  }) => {
    await page.route(
      '**/api/contact',

      async route => {
        await route.fulfill({
          status:
            200,

          contentType:
            'application/json',

          body:
            JSON.stringify({
              ok:
                true
            })
        });
      }
    );

    await page.goto(
      '/book/'
    );

    /*
     * Production Cloudflare Worker injects this file.
     * Astro preview is static, so E2E injects the same production script.
     * The script itself has duplicate-load protection.
     */
    await page.addScriptTag({
      url:
        'http://127.0.0.1:4321/contact-form.js'
    });

    const form =
      page.locator(
        '#inquiry'
      );

    await form
      .locator(
        'input[name="name"]'
      )
      .fill(
        'E2E Test'
      );

    await form
      .locator(
        'input[name="email"]'
      )
      .fill(
        'test@example.com'
      );

    await form
      .locator(
        'input[name="phone"]'
      )
      .fill(
        '+355 69 000 0000'
      );

    await form
      .locator(
        'select[name="project"]'
      )
      .selectOption(
        'fashion'
      );

    await form
      .locator(
        'textarea[name="message"]'
      )
      .fill(
        'Automated Playwright test for the booking form.'
      );

    const requestPromise =
      page.waitForRequest(
        request =>
          request
            .url()
            .endsWith(
              '/api/contact'
            ) &&
          request.method() ===
            'POST'
      );

    await form
      .locator(
        'button[type="submit"]'
      )
      .click();

    const request =
      await requestPromise;

    const payload =
      request.postDataJSON();

    expect(
      payload.name
    ).toBe(
      'E2E Test'
    );

    expect(
      payload.email
    ).toBe(
      'test@example.com'
    );

    expect(
      payload.project
    ).toBe(
      'fashion'
    );

    await expect(
      form.locator(
        '[data-form-status]'
      )
    ).toHaveAttribute(
      'data-state',
      'success'
    );

    await expect(
      form.locator(
        '[data-form-status]'
      )
    ).toContainText(
      'Message sent'
    );
  }
);


test(
  'journal opens a real article',

  async (
    {
      page
    },

    testInfo
  ) => {
    test.skip(
      testInfo
        .project
        .name !==
        'desktop-chromium'
    );

    await page.goto(
      '/journal/'
    );

    const article =
      page.locator(
        'a.journal-card'
      )
        .first();

    await expect(
      article
    ).toBeVisible();

    await article.click();

    await expect(
      page
    ).toHaveURL(
      /\/journal\/[^/]+\/$/
    );

    await expect(
      page.locator(
        'main h1'
      )
    ).toBeVisible();
  }
);


test(
  'portfolio opens a project detail',

  async (
    {
      page
    },

    testInfo
  ) => {
    test.skip(
      testInfo
        .project
        .name !==
        'desktop-chromium'
    );

    await page.goto(
      '/projects/'
    );

    const project =
      page.locator(
        '.project-card a'
      )
        .first();

    await expect(
      project
    ).toBeVisible();

    await project.click();

    await expect(
      page
    ).toHaveURL(
      /\/portfolio\/[^/]+\/$/
    );

    await expect(
      page.locator(
        'main h1'
      )
    ).toBeVisible();
  }
);


test(
  'custom 404 responds correctly',

  async (
    {
      page
    },

    testInfo
  ) => {
    test.skip(
      testInfo
        .project
        .name !==
        'desktop-chromium'
    );

    const response =
      await page.goto(
        '/__e2e-page-that-does-not-exist__/',
        {
          waitUntil:
            'domcontentloaded'
        }
      );

    expect(
      response
    ).not.toBeNull();

    expect(
      response.status()
    ).toBe(
      404
    );

    await expect(
      page.locator(
        'body'
      )
    ).toBeVisible();
  }
);


test(
  'dark mode follows system preference',

  async ({
    page
  }) => {
    await page.emulateMedia({
      colorScheme:
        'dark'
    });

    await page.goto(
      '/'
    );

    const theme =
      await page
        .locator(
          'html'
        )
        .evaluate(
          element =>
            getComputedStyle(
              element
            ).colorScheme
        );

    expect(
      theme
    ).toContain(
      'dark'
    );

    const bodyBackground =
      await page
        .locator(
          'body'
        )
        .evaluate(
          element =>
            getComputedStyle(
              element
            ).backgroundColor
        );

    expect(
      bodyBackground
    ).not.toBe(
      'rgb(244, 242, 237)'
    );
  }
);
