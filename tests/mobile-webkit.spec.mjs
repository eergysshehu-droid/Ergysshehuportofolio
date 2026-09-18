import {
  test,
  expect
} from '@playwright/test';


test.describe(
  'mobile WebKit production UI',

  ()=>{
    test.skip(
      ({
        browserName
      }) =>
        browserName !==
        'webkit'
    );


    test(
      'homepage stack keeps sticky geometry and no animated blur',

      async ({
        page
      })=>{
        await page.goto(
          '/',
          {
            waitUntil:
              'domcontentloaded'
          }
        );

        const card =
          page
            .locator(
              '.work-section .project-card'
            )
            .first();

        await expect(
          card
        ).toBeVisible();

        const geometry =
          await card
            .evaluate(
              element=>{
                const style =
                  getComputedStyle(
                    element
                  );

                const image =
                  element
                    .querySelector(
                      '.project-image img'
                    );

                const imageStyle =
                  image
                    ? getComputedStyle(
                        image
                      )
                    : null;

                return {
                  position:
                    style.position,

                  top:
                    style.top,

                  filter:
                    imageStyle
                      ?.filter ||
                    ''
                };
              }
            );

        expect(
          geometry.position
        ).toBe(
          'sticky'
        );

        expect(
          geometry.top
        ).toBe(
          '0px'
        );

        expect(
          geometry.filter ===
            'none' ||
          geometry.filter ===
            ''
        ).toBeTruthy();
      }
    );


    test(
      'filter rail and moving strip fit mobile width',

      async ({
        page
      })=>{
        await page.goto(
          '/',
          {
            waitUntil:
              'domcontentloaded'
          }
        );

        await expect(
          page.locator(
            '.home-marquee'
          )
        ).toBeVisible();

        await expect(
          page.locator(
            '[data-filter-rail]'
          )
        ).toBeVisible();

        const overflow =
          await page
            .evaluate(
              ()=>({
                documentScroll:
                  document
                    .documentElement
                    .scrollWidth,

                documentClient:
                  document
                    .documentElement
                    .clientWidth
              })
            );

        expect(
          overflow.documentScroll
        ).toBeLessThanOrEqual(
          overflow.documentClient +
          2
        );
      }
    );


    test(
      'light inner page header is light and menu remains usable',

      async ({
        page
      })=>{
        await page
          .emulateMedia({
            colorScheme:
              'light'
          });

        await page.goto(
          '/portraits/',
          {
            waitUntil:
              'domcontentloaded'
          }
        );

        const header =
          page.locator(
            '.site-header'
          );

        const wordmark =
          page.locator(
            '.site-header .ergys-wordmark'
          );

        await expect(
          header
        ).toBeVisible();

        await expect(
          wordmark
        ).toBeVisible();

        const colors =
          await header
            .evaluate(
              element=>{
                const style =
                  getComputedStyle(
                    element
                  );

                const mark =
                  element
                    .querySelector(
                      '.ergys-wordmark'
                    );

                return {
                  background:
                    style
                      .backgroundColor,

                  wordmark:
                    mark
                      ? getComputedStyle(
                          mark
                        ).color
                      : ''
                };
              }
            );

        expect(
          colors.wordmark
        ).toBe(
          'rgb(23, 25, 20)'
        );

        const trigger =
          page.locator(
            '[data-menu-open]'
          );

        await trigger.click();

        const menu =
          page.locator(
            '[data-mobile-menu]'
          );

        await expect(
          menu
        ).toHaveClass(
          /is-open/
        );

        const close =
          page.locator(
            '[data-menu-close]'
          );

        const footer =
          menu.locator(
            '.mobile-menu-footer'
          );

        await expect(
          close
        ).toBeVisible();

        await expect(
          footer
        ).toBeVisible();

        const footerRect =
          await footer
            .boundingBox();

        const viewport =
          page.viewportSize();

        expect(
          footerRect
        ).not.toBeNull();

        expect(
          viewport
        ).not.toBeNull();

        expect(
          (footerRect.y + footerRect.height)
        ).toBeLessThanOrEqual(
          viewport.height +
          2
        );
      }
    );
  }
);
