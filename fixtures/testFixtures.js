import {test as base, expect} from '@playwright/test'
import BookStoreApi from '../helpers/BookStoreApi'

export const test = base.extend({

    
    testUser : async ({request}, use)=> {
        const api = new BookStoreApi(request)

        const username = `user_${Date.now()}`;
        const password = 'Test1234!a'

        const createUserResponse = await api.createUser(username, password)
        expect(createUserResponse.status()).toBe(201);

        const createUserBody = await createUserResponse.json();

        const tokenResponse = await api.generateToken(username, password)
        expect(tokenResponse.status()).toBe(200);

        const tokenBody = await tokenResponse.json();

        await use({
            username,
            password,
            userId: createUserBody.userID,
            token: tokenBody.token   
        })

        //teardown
        const cleanupTokenResponse = await api.generateToken(username, password);
        expect(cleanupTokenResponse.status()).toBe(200);
        const cleanupTokenBody = await cleanupTokenResponse.json();
        
        const deleteUserResponse = await api.deleteUser(createUserBody.userID, cleanupTokenBody.token)
        expect(deleteUserResponse.status()).toBe(204)   

    }

})

export {expect}