import {test, expect} from '../fixtures/testFixtures';
import BookStorePage from '../pages/BookStorePage';
import BookDetailsPage from '../pages/BookDetailsPage'; 
import LoginPage from '../pages/LoginPage.po';
import ProfilePage from '../pages/ProfilePage';
import BookStoreApi from '../helpers/BookStoreApi';


test("book details should match API data @regression", async({page, request})=> {
    const response = await request.get('/BookStore/v1/Books')
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    const book = responseBody.books.find(book => book.title === "Git Pocket Guide")
    expect(book).toBeDefined();

    const bookStorePage = new BookStorePage(page);
    const bookDetailPage = new BookDetailsPage(page);

    await bookStorePage.open()
    await bookStorePage.openBook(book.title)

    await expect(bookDetailPage.bookTitle).toContainText(book.title)
    await expect(bookDetailPage.bookAuthor).toContainText(book.author)
})

test("Create user - Generate token - Add book - Check user for current book @smoke", 
    async({request, page, testUser})=> {

   
    const isbn = '9781449325862';
    const api = new BookStoreApi(request);
   
    //Add boook
    const addBookResponse = await api.addBook(testUser.userId, testUser.token, isbn);
    expect(addBookResponse.status()).toBe(201);

    // Get user again and check he has 1 book 
    const updateUserResponse = await api.getUser(testUser.userId, testUser.token)
    expect(updateUserResponse.status()).toBe(200)
    const updateUserBody = await updateUserResponse.json();
    expect(updateUserBody.books).toHaveLength(1)
    expect(updateUserBody.books[0].isbn).toBe(isbn)

    // UI test
    const loginPage = new LoginPage(page)
    await page.goto('/login');
    await loginPage.login(testUser.username, testUser.password)
    await expect(page).toHaveURL(/profile/)
    
    const profilePage = new ProfilePage(page)
    const bookTitle = "Git Pocket Guide";
    await expect(profilePage.getBookRowByTitle(bookTitle)).toBeVisible();

    //Generate new token for delete process , because frontend has different auth flow
    const cleanupTokenResponse = await api.generateToken(testUser.username, testUser.password)
    expect(cleanupTokenResponse.status()).toBe(200);
    const cleanupTokenBody = await cleanupTokenResponse.json();
    const cleanupToken = cleanupTokenBody.token

    // Delete book
    const deleteBookResponse = await api.deleteBook(cleanupToken, isbn, testUser.userId)
    expect(deleteBookResponse.status()).toBe(204);

    // Check if the book has deleted
    const finalUserResponse = await api.getUser(testUser.userId, cleanupToken)
    expect(finalUserResponse.status()).toBe(200);
    const finalUserBody = await finalUserResponse.json();
    expect(finalUserBody.books).toHaveLength(0);

})


