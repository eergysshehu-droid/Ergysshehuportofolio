import {
  test,
  expect
} from '@playwright/test';


const viewports = [
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


for (
  const viewport
  of viewports
) {

  test(
    `journal responsive ${viewport.name}`,

    async ({
      page
    }) => {

      await page.setViewportSize({
        width:
          viewport.width,

        height:
          viewport.height
      });


      await page.goto(
        '/journal/',
        {
          waitUntil:
            'networkidle'
        }
      );


      const metrics =
        await page.evaluate(
          () => {

            const title =
              document.querySelector(
                '.journal-index-intro h1'
              );


            const cardTitle =
              document.querySelector(
                '.journal-card-copy h2'
              );


            return {
              scrollWidth:
                document
                  .documentElement
                  .scrollWidth,

              clientWidth:
                document
                  .documentElement
                  .clientWidth,

              introSize:
                title
                  ? parseFloat(
                      getComputedStyle(
                        title
                      ).fontSize
                    )
                  : 0,

              cardSize:
                cardTitle
                  ? parseFloat(
                      getComputedStyle(
                        cardTitle
                      ).fontSize
                    )
                  : 0
            };
          }
        );


      expect(
        metrics.scrollWidth
      ).toBeLessThanOrEqual(
        metrics.clientWidth +
        2
      );


      expect(
        metrics.introSize
      ).toBeLessThanOrEqual(
        100
      );


      expect(
        metrics.cardSize
      ).toBeLessThanOrEqual(
        32
      );
    }
  );

}


test(
  'managed images become ready',

  async ({
    page
  }) => {

    await page.goto(
      '/journal/',
      {
        waitUntil:
          'networkidle'
      }
    );


    const brokenImages =
      await page.evaluate(
        () =>
          Array
            .from(
              document.images
            )
            .filter(
              image =>
                image.complete &&
                image.naturalWidth ===
                  0
            )
            .length
      );


    expect(
      brokenImages
    ).toBe(
      0
    );
  }
);
