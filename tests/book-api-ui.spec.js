import {test, expect} from '@playwright/test'
import BookStorePage from '../pages/BookStorePage';
import BookDetailsPage from '../pages/BookDetailsPage'; 
import LoginPage from '../pages/LoginPage.po';
import ProfilePage from '../pages/ProfilePage';
import BookStoreApi from '../helpers/BookStoreApi';


test("book details should match API data", async({page, request})=> {
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


test("Create user via API", async({request})=> {
   const username = `user_${Date.now()}`;
   const password = "Test1234!a";

   //creaate user
    const response = await request.post("/Account/v1/User", {
        data: {
            userName: username,
            password: password
        }
    }  
    )
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    console.log(responseBody)

    expect(responseBody.userID).toBeTruthy()
    expect(responseBody.username).toBe(username)
    expect(responseBody.books).toHaveLength(0)
})

test("Create user - Generate token - Add book - Check user for current book", async({request, page})=> {

    const username = `user_${Date.now()}`;
    const password = "Test1234!a";
    const isbn = '9781449325862';
    const api = new BookStoreApi(request);
   
    //creaate user
    const response = await api.createUser(username, password)
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    //console.log(responseBody)
    expect(responseBody.userID).toBeTruthy()
    expect(responseBody.username).toBe(username)
    expect(responseBody.books).toHaveLength(0)

    //Generate token
    const tokenResponse = await api.generateToken(username, password);

    expect(tokenResponse.status()).toBe(200);
    const tokenBody = await tokenResponse.json();
    //console.log(tokenBody)
    expect(tokenBody.token).toBeTruthy();
    expect(tokenBody.expires).toBeTruthy();
    expect(tokenBody.status).toBe("Success")
    expect(tokenBody.result).toBe("User authorized successfully.")

    //Authorization Bearer token
    const userId = responseBody.userID;
    const token  = tokenBody.token;

    const userResponse = await api.getUser(userId, token);
    expect(userResponse.status()).toBe(200);
    const userBody = await userResponse.json();
   // console.log(userBody)
    expect(userBody.userId).toBeTruthy();
    expect(userBody.username).toBe(username);
    expect(userBody.books).toHaveLength(0);


    //Add boook
    const addBookResponse = await api.addBook(userId, token, isbn);
    //expect(addBookResponse.status()).toBe(201)
    const addBookBody = await addBookResponse.json();
    const book = addBookBody.books.find(book => book.isbn === isbn)
    //console.log(addBookBody)

    // Get user again and check he has 1 book 
    const updateUserResponse = await api.getUser(userId, token)
    expect(updateUserResponse.status()).toBe(200)
    const updateUserBody = await updateUserResponse.json();
    //console.log(updateUserBody)
    expect(updateUserBody.books).toHaveLength(1)
    expect(updateUserBody.books[0].isbn).toBe(isbn)

    // UI test
    const loginPage = new LoginPage(page)
    await page.goto('/login');
    await loginPage.login(username, password)
    await expect(page).toHaveURL(/profile/)
    
    const profilePage = new ProfilePage(page)
    const bookTitle = "Git Pocket Guide";
    await expect(profilePage.getBookRowByTitle(bookTitle)).toBeVisible();

    //Generate new token for delete process , because frontend has different auth flow
    const cleanupTokenResponse = await api.generateToken(username, password)
    expect(cleanupTokenResponse.status()).toBe(200);
    const cleanupTokenBody = await cleanupTokenResponse.json();
    const cleanupToken = cleanupTokenBody.token

    // Delete book
    const deleteBookResponse = await api.deleteBook(cleanupToken, isbn, userId)
    expect(deleteBookResponse.status()).toBe(200);

    // Check if the book has deleted
    const finalUserResponse = await api.getUser(userId, cleanupToken)
    expect(finalUserResponse.status()).toBe(200);
    const finalUserBody = await finalUserResponse.json();
    expect(finalUserBody.books).toHaveLength(0);

    //Delete user
    const deleteUserResponse = await api.deleteUser(userId, cleanupToken);
    expect(deleteUserResponse.status()).toBe(204);

    // Check if the user has deleted
    const deletedUserResponse = await api.deleteUser(userId, cleanupToken);
    expect(deletedUserResponse.status()).toBe(200);
    const checkDeleteUser = await api.getUser(userId, cleanupToken);
    expect(checkDeleteUser.status()).toBe(401);
})


