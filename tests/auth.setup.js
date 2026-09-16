
import {test as setup , expect} from '@playwright/test'
import LoginPage from '../pages/LoginPage.po.js'

const authFile = 'playwright/.auth/user.json';

setup("authenticate user", async({page})=> {
    const loginPage = new LoginPage(page);
    await page.goto("/login")
     const loginResponsePromise = page.waitForResponse(
        response =>
            response.url().includes('/Account/v1/Login')
    );
    await loginPage.login(
        process.env.E2E_USERNAME,
        process.env.E2E_PASSWORD
    )
     const loginResponse = await loginResponsePromise;

    console.log('Login API status:', loginResponse.status());
    console.log('Login API response:', await loginResponse.text());

    await expect(page).toHaveURL(/profile/)

    await page.context().storageState({
        path: authFile
    })
})



