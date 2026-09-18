import {
  test,
  expect
} from '@playwright/test';


const seoRoutes = [
  '/',
  '/sq/',
  '/about/',
  '/sq/about/',
  '/journal/',
  '/sq/journal/'
];


for (
  const route
  of seoRoutes
) {
  test(
    `SEO metadata ${route}`,

    async ({
      page
    }, testInfo) => {

      test.skip(
        testInfo.project.name !==
          'desktop-chromium'
      );


      await page.goto(
        route,
        {
          waitUntil:
            'domcontentloaded'
        }
      );


      await expect(
        page.locator(
          'link[rel="canonical"]'
        )
      ).toHaveCount(
        1
      );


      await expect(
        page.locator(
          'link[rel="alternate"][hreflang="en"]'
        )
      ).toHaveCount(
        1
      );


      await expect(
        page.locator(
          'link[rel="alternate"][hreflang="sq"]'
        )
      ).toHaveCount(
        1
      );


      await expect(
        page.locator(
          'link[rel="alternate"][hreflang="x-default"]'
        )
      ).toHaveCount(
        1
      );


      await expect(
        page.locator(
          'meta[name="description"]'
        )
      ).toHaveAttribute(
        'content',
        /\S+/
      );


      await expect(
        page.locator(
          'meta[property="og:title"]'
        )
      ).toHaveCount(
        1
      );


      await expect(
        page.locator(
          'meta[name="twitter:card"]'
        )
      ).toHaveAttribute(
        'content',
        'summary_large_image'
      );
    }
  );
}


test(
  'journal article exposes article metadata',

  async ({
    page
  }, testInfo) => {

    test.skip(
      testInfo.project.name !==
        'desktop-chromium'
    );


    await page.goto(
      '/journal/',
      {
        waitUntil:
          'domcontentloaded'
      }
    );


    const href =
      await page
        .locator(
          'a.journal-card'
        )
        .first()
        .getAttribute(
          'href'
        );


    expect(
      href
    ).toBeTruthy();


    await page.goto(
      href
    );


    await expect(
      page.locator(
        'meta[property="og:type"]'
      )
    ).toHaveAttribute(
      'content',
      'article'
    );


    await expect(
      page.locator(
        'meta[property="article:published_time"]'
      )
    ).toHaveCount(
      1
    );
  }
);


const responsiveViewports = [
  {
    name:
      'mobile-390',

    width:
      390,

    height:
      844
  },

  {
    name:
      'mobile-430',

    width:
      430,

    height:
      932
  },

  {
    name:
      'desktop-1440',

    width:
      1440,

    height:
      900
  },

  {
    name:
      'desktop-1920',

    width:
      1920,

    height:
      1080
  },

  {
    name:
      'desktop-2560',

    width:
      2560,

    height:
      1440
  },

  {
    name:
      'desktop-4k',

    width:
      3840,

    height:
      2160
  }
];


for(
  const viewport
  of responsiveViewports
){
  test(
    `no horizontal overflow ${viewport.name}`,

    async ({
      page
    }) => {

      await page
        .setViewportSize({
          width:
            viewport.width,

          height:
            viewport.height
        });


      await page.goto(
        '/',
        {
          waitUntil:
            'domcontentloaded'
        }
      );


      const widths =
        await page.evaluate(
          ()=>({
            scroll:
              document
                .documentElement
                .scrollWidth,

            client:
              document
                .documentElement
                .clientWidth
          })
        );


      expect(
        widths.scroll
      ).toBeLessThanOrEqual(
        widths.client +
          2
      );
    }
  );
}


test(
  'mobile menu dialog keeps its accessibility contract',

  async ({
    page
  }, testInfo) => {

    test.skip(
      testInfo.project.name !==
        'mobile-chromium'
    );


    await page.goto(
      '/'
    );


    const trigger =
      page.locator(
        '[data-menu-open]'
      );


    const menu =
      page.locator(
        '[data-mobile-menu]'
      );


    await expect(
      trigger
    ).toHaveAttribute(
      'aria-controls',
      'mobile-menu-overlay'
    );


    await expect(
      menu
    ).toHaveAttribute(
      'role',
      'dialog'
    );


    await expect(
      menu
    ).toHaveAttribute(
      'aria-modal',
      'true'
    );
  }
);
