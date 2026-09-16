
import {test as setup , expect} from '@playwright/test'
import LoginPage from '../pages/LoginPage.po.js'

const authFile = 'playwright/.auth/user.json';

setup("authenticate user", async({page})=> {
    const loginPage = new LoginPage(page);
    await page.goto("/login")
    await loginPage.login(
        process.env.E2E_USERNAME,
        process.env.E2E_PASSWORD
    )

    const errorMessage = await loginPage.errorMessageInvalidLogin
    .textContent({ timeout: 2000 })
    .catch(() => null);

    console.log('Login error:', errorMessage);
    await expect(page).toHaveURL(/profile/)

    await page.context().storageState({
        path: authFile
    })
})



