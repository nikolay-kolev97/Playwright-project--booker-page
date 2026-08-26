import {test, expect} from '@playwright/test'
import BookStorePage from '../pages/BookStorePage';
import BookDetailsPage from '../pages/BookDetailsPage'; 


test("book details should match API data", async({page, request})=> {
    const response = await request.get('/BookStore/v1/Books')
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const book = responseBody.books.find(book => book.title === "Git Pocket Guide")
    expect(book).toBeDefined();

    const bookStorePage = new BookStorePage(page);
    const bookDetailPage = new BookDetailsPage(page);

    bookStorePage.open()
    bookStorePage.openBook(book.title)

    await expect(bookDetailPage.bookTitle).toContainText(book.title)
    await expect(bookDetailPage.bookAuthor).toContainText(book.author)
})