import {test, expect} from '@playwright/test'
import BookStorePage from '../pages/BookStorePage'
import BookDetailsPage from '../pages/BookDetailsPage';

test.describe('Book store automatisation project', () => {
    let bookStorePage;
    let bookDetailsPage;
    
    
    test.beforeEach(async ({page}) => {
         bookStorePage = new BookStorePage(page);
         bookDetailsPage = new BookDetailsPage(page);
         await bookStorePage.open();
    })

    test('Check basic element in the page', async({page}) => {

        //await bookStorePage.open();
        await expect(page).toHaveURL('/books'); 
        await expect(bookStorePage.searchBox).toBeVisible();
        await expect(bookStorePage.loginButton).toBeVisible();
        await expect(bookStorePage.tableBook).toBeVisible();
        await expect(bookStorePage.rowsTable).toHaveCount(8);
       
    })


    test("Search existing book by title", async() => {
       // await bookStoragePage.open();
        await bookStorePage.searchBook("Git Pocket Guide");
        await expect(bookStorePage.rowsTable).toHaveCount(1);
        await expect(bookStorePage.bookTitles).toHaveText('Git Pocket Guide')
    })

    test("Search books by partial title" , async() => {
        await bookStorePage.searchBook("JavaScript");
        await expect(bookStorePage.rowsTable).not.toHaveCount(0);
        
        const count = await bookStorePage.topicsBooks.count();
        for (let i = 0 ; i < count; i++){
            await expect(bookStorePage.topicsBooks.nth(i)).toContainText("JavaScript")
        }

     })
    

    test("Search unavailable book", async()=> {
        await bookStorePage.searchBook("The book does not exist");
        await expect(bookStorePage.rowsTable).toHaveCount(0); 
    })

    test("Search row by title", async() => {
        const bookRow = bookStorePage.getRowByTitle('Got pocket guide');
        await expect(bookRow).toBeVisible();

        const authorName = bookRow.locator('td');
        await expect(authorName).toHaveText('Richard E. Silverman')

    })

    test("Open book details" , async() => {
      await bookStorePage.openBook('Git Pocket Guide');
      expect(page).toHaveURL(/book=/);
    })

})