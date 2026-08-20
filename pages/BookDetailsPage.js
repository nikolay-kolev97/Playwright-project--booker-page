export default class BookDetailsPage {

    constructor(page){
        this.page = page;
    }

    get bookTitle(){
        return this.page.locator('#title-wrapper')
    }

    get bookAuthor(){
        return this.page.locator('#author-wrapper')
    }

    get bookPublisher(){
        return this.page.locator('#publisher-wrapper')
    }

    get bookIsbn(){
        return this.page.locator('#ISBN-wrapper')
    }

    

}