test(
  'mobile menu open',

  async ({
    page
  }) => {

    await page.setViewportSize({
      width:
        390,

      height:
        844
    });


    await page.goto(
      '/',
      {
        waitUntil:
          'networkidle'
      }
    );


    const menu =
      page.locator(
        '[data-mobile-menu]'
      );


    await page
      .locator(
        '[data-menu-open]'
      )
      .click();


    await expect(
      menu
    ).toHaveAttribute(
      'aria-hidden',
      'false'
    );


    await expect(
      menu
    ).toHaveClass(
      /is-open/
    );


    await expect(
      menu
    ).toBeVisible();


    await expect(
      page
    ).toHaveScreenshot(
      'mobile-menu-open.png',
      {
        animations:
          'disabled'
      }
    );

  }
);
