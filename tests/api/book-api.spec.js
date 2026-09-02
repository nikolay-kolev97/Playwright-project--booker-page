    import {test, expect} from '@playwright/test'
    
    test('GET all books', async({request})=> {
        const response  = await request.get('/BookStore/v1/Books');
        expect(response.status()).toBe(200);

        const resposneBody = await response.json()
        expect(resposneBody.books.length).toBe(8);
        expect(resposneBody.books[0].title).toBe("Git Pocket Guide")
    })