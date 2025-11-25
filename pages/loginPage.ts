import { Page, Locator } from "@playwright/test";

export class LoginPage {
    readonly page: Page;
    readonly url: string = '/login/';

    readonly usernameField: Locator;
    readonly passwordField: Locator;
    readonly roleDropdown: Locator;
    readonly loginButton: Locator;
    readonly errorAlert: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.usernameField = page.getByRole('textbox', { name: 'Username' });
        this.passwordField = page.getByRole('textbox', { name: 'Password' });
        this.roleDropdown = page.getByRole('combobox', { name: 'Select Role' });
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.errorAlert = page.locator('.alert-danger'); 
    }
    
    async goto() {
        await this.page.goto(this.url);
    }

    async login(username: string, password: string, role: 'consumer' | 'business') {
        await this.usernameField.fill(username);
        await this.passwordField.fill(password);
        await this.roleDropdown.selectOption(role);
        await this.loginButton.click();
    }
}