
export default class LoginPage {
    
    constructor(page){
        this.page = page;
    }

    get usernameField(){
        return this.page.locator("#userName")
    }

    get passwordField(){
        return this.page.locator("#password")
    }
    
    get loginButton(){
        return this. page.getByRole('button', {name: "Login"})
    }

    get invalidLoginError(){
        return this.page.locator('#output #name')
    }

    async login(username, password){
        await this.usernameField.fill(username);
        await this.passwordField.fill(password);
        await this.loginButton.click();
    }
}