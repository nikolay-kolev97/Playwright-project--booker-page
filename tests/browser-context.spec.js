import {test, expect} from '@playwright/test'

test('Browser context practice', async({browser}) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://demoqa.com/books');
    await expect(page).toHaveURL('https://demoqa.com/books');
    await context.close();
})

test('Browser contexts are isolated', async({browser})=> {
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('https://demoqa.com/books');
    await expect(page1).toHaveURL('https://demoqa.com/books')
    await context1.addCookies([
    {
        name: 'testCookie',
        value: 'context1',
        domain: 'demoqa.com',
        path: '/'
    }
    ]);
    const cookies1 = await context1.cookies();
    console.log(cookies1)

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('https://demoqa.com/books');
    await expect(page2).toHaveURL('https://demoqa.com/books')
    //console.log(cookies2)

    await context1.close();
    await context2.close();
})