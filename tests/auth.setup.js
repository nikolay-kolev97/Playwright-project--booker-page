
import {test as setup , expect} from '@playwright/test'
import LoginPage from '../pages/LoginPage.po.js'

const authFile = 'playwright/.auth/user.json';

setup("authenticate user", async({page})=> {
    const loginPage = new LoginPage(page);
    await page.goto("/login")
    page.on('response', async response => {
        if (response.url().includes('/Account/v1/GenerateToken')) {
            console.log(
                'ACCOUNT RESPONSE:',
                response.status(),
                response.url()
            );

            console.log(
                'ACCOUNT BODY:',
                await response.text()
            );
        }
    });
    await loginPage.login(
        process.env.E2E_USERNAME,
        process.env.E2E_PASSWORD
    )
    await expect(page).toHaveURL(/profile/)

    await page.context().storageState({
        path: authFile
    })
})



