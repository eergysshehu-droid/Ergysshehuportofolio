import {
  test,
  expect
} from '@playwright/test';


test(
  'mobile header stays visible after menu navigation and scroll',

  async ({
    page
  }, testInfo) => {

    test.skip(
      testInfo.project.name !==
        'mobile-chromium'
    );


    await page.goto(
      '/',
      {
        waitUntil:
          'domcontentloaded'
      }
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
    ).toBeVisible();


    await trigger.click();


    await expect(
      menu
    ).toHaveClass(
      /is-open/
    );


    const fashionLink =
      menu.locator(
        'a[href="/fashion/"]'
      );


    await expect(
      fashionLink
    ).toBeVisible();


    await Promise.all([
      page.waitForURL(
        /\/fashion\/$/
      ),

      fashionLink.click()
    ]);


    const header =
      page.locator(
        '.site-header'
      );


    const wordmark =
      page.locator(
        '.site-header .ergys-wordmark'
      );


    const hamburger =
      page.locator(
        '.site-header [data-menu-open]'
      );


    await expect(
      header
    ).toBeVisible();


    await expect(
      wordmark
    ).toBeVisible();


    await expect(
      hamburger
    ).toBeVisible();


    await page.evaluate(
      ()=>{
        window.scrollTo(
          0,
          Math.min(
            document.documentElement.scrollHeight -
              window.innerHeight,
            900
          )
        );
      }
    );


    await page.waitForTimeout(
      400
    );


    const state =
      await header.evaluate(
        element => {

          const rect =
            element
              .getBoundingClientRect();


          return {
            top:
              rect.top,

            bottom:
              rect.bottom,

            transform:
              getComputedStyle(
                element
              ).transform,

            hiddenClass:
              element
                .classList
                .contains(
                  'is-hidden'
                )
          };
        }
      );


    expect(
      state.top
    ).toBeGreaterThanOrEqual(
      -1
    );


    expect(
      state.bottom
    ).toBeGreaterThan(
      0
    );


    expect(
      state.hiddenClass
    ).toBe(
      false
    );


    await expect(
      wordmark
    ).toBeVisible();


    await expect(
      hamburger
    ).toBeVisible();
  }
);
