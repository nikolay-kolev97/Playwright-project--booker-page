import {test, expect} from '@playwright/test'
import BookStorePage from '../pages/BookStorePage';
import BookDetailsPage from '../pages/BookDetailsPage'; 
import LoginPage from '../pages/LoginPage.po';
import ProfilePage from '../pages/ProfilePage';


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
    //console.log(responseBody)

    expect(responseBody.userID).toBeTruthy()
    expect(responseBody.username).toBe(username)
    expect(responseBody.books).toHaveLength(0)

    //Generate token
    const tokenResponse = await request.post("/Account/v1/GenerateToken", {
        data: {
            userName: username,
            password: password
        }
    })

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

    const userResponse = await request.get(`/Account/v1/User/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    expect(userResponse.status()).toBe(200);
    const userBody = await userResponse.json();
   // console.log(userBody)
    expect(userBody.userId).toBeTruthy();
    expect(userBody.username).toBe(username);
    expect(userBody.books).toHaveLength(0);


    //Add boook
    const addBookResponse = await request.post('/BookStore/v1/Books', {
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: {
            userId: userId,
            collectionOfIsbns: [
                {
                    isbn: isbn
                }
            ]
        }
    })
    //expect(addBookResponse.status()).toBe(201)
    const addBookBody = await addBookResponse.json();
    const book = addBookBody.books.find(book => book.isbn = isbn)
    //console.log(addBookBody)

    // Get user again and check he has 1 book 
    const updateUserResponse = await request.get(`/Account/v1/User/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
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
    const cleanupTokenResponse = await request.post("/Account/v1/GenerateToken", {
            data: {
                userName: username,
                password: password
            }
        })

        expect(cleanupTokenResponse.status()).toBe(200);
        const cleanupTokenBody = await cleanupTokenResponse.json();
        const cleanupToken = cleanupTokenBody.token

    // Cleanup test data
    const deleteBookResponse = await request.delete('/BookStore/v1/Book', {
        headers: {
            Authorization: `Bearer ${cleanupToken}`
        },
        data: {
            isbn: isbn,
            userId: userId
        }
    })

    // Check if the book has deleted
    const finalUserResponse = await request.get(`/Account/v1/User/${userId}`, {
        headers: {
            Authorization: `Bearer ${cleanupToken}`
        }
    })
    expect(finalUserResponse.status()).toBe(200);
    const finalUserBody = await finalUserResponse.json();
    expect(finalUserBody.books).toHaveLength(0);


    //Delete user
    const deleteUserResponse = await request.delete(`/Account/v1/User/${userId}`, {
        headers: {
            Authorization: `Bearer ${cleanupToken}`
        }
    })

    expect(deleteUserResponse.status()).toBe(204);

    // Check if the user has deleted
    const deletedUserResponse = await request.delete(`/Account/v1/User/${userId}`, {
        headers: {
            Authorization: `Bearer ${cleanupToken}`
        }
    })
})


