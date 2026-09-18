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


    const openButton =
      page.locator(
        '[data-menu-open]'
      );


    const menu =
      page.locator(
        '[data-mobile-menu]'
      );


    const closeButton =
      menu.locator(
        '[data-menu-close]'
      );


    await expect(
      openButton
    ).toBeVisible();


    await openButton.click();


    await expect(
      openButton
    ).toHaveAttribute(
      'aria-expanded',
      'true'
    );


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


    await closeButton.click();


    await expect(
      openButton
    ).toHaveAttribute(
      'aria-expanded',
      'false'
    );


    await expect(
      menu
    ).toHaveAttribute(
      'aria-hidden',
      'true'
    );


    await expect(
      menu
    ).not.toHaveClass(
      /is-open/
    );

  }
);
