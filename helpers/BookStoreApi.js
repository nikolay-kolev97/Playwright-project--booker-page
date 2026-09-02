export default class BookStoreApi {

    constructor(request){
        this.request = request;
    }

    async createUser(username, password){
        const response = await this.request.post("/Account/v1/User", {
            data: {
                userName: username,
                password: password
            }}  
        )
        return response;
    }

    async generateToken(username, password){
            const tokenResponse = await this.request.post("/Account/v1/GenerateToken", {
            data: {
                userName: username,
                password: password
            }
        })
        return tokenResponse
    }

    async getUser(userId, token){
        const userResponse = await this.request.get(`/Account/v1/User/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
        })
        return userResponse
    }

    async addBook(userId, token, isbn){
        const addBookResponse = await this.request.post('/BookStore/v1/Books', {
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
        return addBookResponse;
    }

    async deleteBook(token, isbn, userId){
        const deleteBookResponse = await this.request.delete('/BookStore/v1/Book', {
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: {
            isbn: isbn,
            userId: userId
        }
        })
        return deleteBookResponse;
    }

    async deleteUser(userId, token){
        const deleteUserResponse = await this.request.delete(`/Account/v1/User/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
        })

        return deleteUserResponse;
    }

}