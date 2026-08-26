import {test , expect} from '@playwright/test'
import LoginPage from '../pages/LoginPage.po';

test.describe("Login scenario", ()=> {

    let loginPage;

    test.beforeEach(async({page})=> {
        loginPage = new LoginPage(page);
        await page.goto('/login/');
    })

    test("Should not login with invalid credentials", async({page})=> {
        await loginPage.login("invalidUser", "invalidPassword")
        await expect(page).toHaveURL(/login/);
        await expect(loginPage.errorMessageInvalidLogin).toHaveText("Invalid username or password!");
    })



})