
export default class BookStorePage {

    constructor(page) {
        this.page = page;
    }

    get searchBox(){
        return this.page.getByPlaceholder('Type to search');
    }

    get loginButton(){
        return this.page.getByRole('button', {name: "Login"})
    }

    get tableBook(){
        return this.page.locator('table');
    }

    get headerRowOfTable(){
        return this.tableBook.locator('th');
    }

    get rowsTable(){
        return this.tableBook.locator('tbody tr');
    }

    get topicsBooks(){
        return this.rowsTable.locator('a');
    }
    
    async open(){
        await this.page.goto('/books');
    }

    async searchBook(bookName){
        await this.searchBox.fill(bookName)
    }

    rowByBookTitle(title){
        return this.topicsBooks.filter({ has : this.page.getByRole('link', {name: title , exact: true})})
    }

    async openBook(bookTitle){
        await this.page.getByRole('link', {name: bookTitle , exact: true}).click()
    }
   

}