import {test , expect} from '@playwright/test'
import LoginPage from '../pages/LoginPage.po';

test.describe("Login scenario", ()=> {

    let loginPage;

    test.beforeEach(async({page})=> {
        loginPage = new LoginPage(page);
        await page.goto('/login/');
    })

    test("Should not login with invalid credentials @regression", async({page})=> {
        await loginPage.login("invalidUser", "invalidPassword")
        await expect(page).toHaveURL(/login/);
        await expect(loginPage.InvalidLoginError).toHaveText("Invalid username or password!");
    })

//Create new local user from API only for automation tests
    test("Correct login in profile @smoke @local-auth", async({page})=> {
        await loginPage.login(process.env.E2E_USERNAME, process.env.E2E_PASSWORD)
        await expect(page).toHaveURL(/profile/)
    })



})