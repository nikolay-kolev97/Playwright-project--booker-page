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

    test('Check basic element in the page @regression', async({page}) => {

        //await bookStorePage.open();
        await expect(page).toHaveURL('/books'); 
        await expect(bookStorePage.searchBox).toBeVisible();
        await expect(bookStorePage.loginButton).toBeVisible();
        await expect(bookStorePage.tableBook).toBeVisible();
        await expect(bookStorePage.rowsTable).toHaveCount(8);
       
    })


    test("Search existing book by title @regression", async() => {
       // await bookStoragePage.open();
        await bookStorePage.searchBook("Git Pocket Guide");
        await expect(bookStorePage.rowsTable).toHaveCount(1);
        await expect(bookStorePage.topicsBooks).toHaveText('Git Pocket Guide')
    })

    test("Search books by partial title @regression" , async() => {
        await bookStorePage.searchBook("JavaScript");
        await expect(bookStorePage.rowsTable).not.toHaveCount(0);
        
        const count = await bookStorePage.topicsBooks.count();
        for (let i = 0 ; i < count; i++){
            await expect(bookStorePage.topicsBooks.nth(i)).toContainText("JavaScript")
        }

     })
    

    test("Search unavailable book @regression", async()=> {
        await bookStorePage.searchBook("The book does not exist");
        await expect(bookStorePage.rowsTable).toHaveCount(0); 
    })

    //test("Search row by title", async() => {
    //     const bookRow = bookStorePage.rowByBookTitle('Got pocket guide');
    //     await expect(bookRow).toBeVisible();

    //     const authorName = bookRow.locator('td');
    //     await expect(authorName).toHaveText('Richard E. Silverman')

    // })

    // test("Open book details" , async() => {
    //   await bookStorePage.openBook('Git Pocket Guide');
    //   expect(page).toHaveURL(/book/);
    // })

    //mock new book
    test("should display mocked book from API @regression", async({page})=> {
        await page.route('**/BookStore/v1/Books', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    books: [
                        {
                            isbn: "123456",
                            title: "My Mocked Book",
                            subTitle: "Testing with Playwright",
                            author: "Test author",
                            publish_date: '',
                            publisher: "Test publisher",
                            pages: 100,
                            description: 'Mock book',
                            website: 'https://example.com'
                        }
                    ]
                })
            });
        });

        await page.goto('/books');
        await expect(page.getByText('My Mocked Book')).toBeVisible();


    })

// mock empty books
    test("should display no books when API returns empty collection @regression", async({page})=> {
        await page.route('**/BookStore/v1/Books', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body : JSON.stringify({
                    books: []
                })
            })
        })
        await page.goto('/books');
        await expect(page.getByText('Git Pocket Guide')).not.toBeVisible();
    })


//mock backend error
    test('should handle server error when book API fails @regression', async({page})=> {
        await page.route('**/BookStore/v1/Books', async route => {
            await route.fulfill({
                status: 500,
                body: JSON.stringify({
                    message: "Internal Server Error"
                })
            })
        })
        await page.goto('/books');
       
    })



})