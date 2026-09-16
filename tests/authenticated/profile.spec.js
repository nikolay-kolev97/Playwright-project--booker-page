import {test, expect} from '@playwright/test'

test("authenticated user can open profile", async({page})=> {
    await page.goto('/profile');
    await expect(page).toHaveURL(/profile/)
})