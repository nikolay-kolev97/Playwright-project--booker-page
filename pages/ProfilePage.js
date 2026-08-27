
export default class ProfilePage{

    constructor(page){
        this.page = page;
    }


    getBookRowByTitle(title){
        return this.page.getByRole('link',{name: title, exact: true})
    }
}