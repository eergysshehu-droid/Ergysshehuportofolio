import {
  test,
  expect
} from '@playwright/test';

const visualEnabled = process.env.VISUAL_REGRESSION === '1';

const routes = [
  {name:'home', path:'/'},
  {name:'home-sq', path:'/sq/'},
  {name:'about', path:'/about/'},
  {name:'book', path:'/book/'},
  {name:'journal', path:'/journal/'}
];

const viewports = [
  {name:'mobile-390', width:390, height:844},
  {name:'mobile-430', width:430, height:932},
  {name:'desktop-1440', width:1440, height:1000},
  {name:'desktop-4k', width:3840, height:2160}
];

test.describe('visual regression', () => {
  test.skip(!visualEnabled, 'Set VISUAL_REGRESSION=1 to run screenshot comparisons.');

  for(const route of routes){
    for(const viewport of viewports){
      test(`${route.name} ${viewport.name}`, async ({page}) => {
        await page.setViewportSize({width:viewport.width,height:viewport.height});
        await page.goto(route.path,{waitUntil:'networkidle'});
        await page.emulateMedia({reducedMotion:'reduce'});

        await expect(page).toHaveScreenshot(
          `${route.name}-${viewport.name}.png`,
          {fullPage:true,animations:'disabled'}
        );
      });
    }
  }

  test('mobile menu open', async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/',{waitUntil:'networkidle'});

    const menu = page.locator('[data-mobile-menu]');
    await page.locator('[data-menu-open]').click();

    await expect(menu).toHaveAttribute('aria-hidden','false');
    await expect(menu).toHaveClass(/is-open/);
    await expect(menu).toBeVisible();

    await expect(page).toHaveScreenshot('mobile-menu-open.png',{animations:'disabled'});
  });

  test('selected work stack', async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/',{waitUntil:'networkidle'});
    await page.locator('#selected').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);

    await expect(page).toHaveScreenshot('selected-work-stack.png',{animations:'disabled'});
  });
});
