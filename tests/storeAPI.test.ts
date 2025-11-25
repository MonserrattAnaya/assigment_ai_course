import { test, expect } from '@playwright/test';
import { LoginPage } from "../pages/loginPage"; 
import { StorePage } from "../pages/storePage"; 

let password: string;

test('consumer can log in successfully', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    
    if (process.env.STORE_PASSWORD !== undefined) {
        password = process.env.STORE_PASSWORD;
    }

    await login.login('monse', password, 'consumer');

    await expect(page).toHaveURL(/\/store/i);
    await expect(new StorePage(page).firstProductBuyButton).toBeVisible();
});

test('shows an error with invalid credentials', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('monse', 'wrongpassword', 'consumer');

    await expect(login.errorAlert).toBeVisible();
    await expect(login.errorAlert).toContainText(/Incorrect/i);
});

test('Verify product price on receipt against API data @api', async ({ page, request }) => {
    const loginPage = new LoginPage(page);
    const storePage = new StorePage(page);
    const PRODUCT_ID = 1;
    const EXPECTED_PRODUCT_NAME = 'Apple'; 
    
    if (process.env.STORE_PASSWORD !== undefined) {
        password = process.env.STORE_PASSWORD;
    }

    const apiPrice = await storePage.getProductPriceFromApi(request, PRODUCT_ID);
    expect(apiPrice).not.toBeNull();
    test.info().annotations.push({ type: 'API Price', description: `Price for Product ${PRODUCT_ID} (${EXPECTED_PRODUCT_NAME}): ${apiPrice}` });
    
    await loginPage.goto();
    await loginPage.login('monse', password, 'consumer');
    
    await storePage.buyFirstProduct();
    await storePage.finalizePurchase();

    await expect(storePage.receiptMessage).toBeVisible();
    await expect(storePage.receiptMessage).toContainText(String(apiPrice));
    await expect(storePage.receiptMessage).toContainText(EXPECTED_PRODUCT_NAME);
});

test('Allows adding multiple items and verifies cart count', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const storePage = new StorePage(page);
    const QUANTITY = 3;

    if (process.env.STORE_PASSWORD !== undefined) {
        password = process.env.STORE_PASSWORD;
    }

    await loginPage.goto();
    await loginPage.login('monse', password, 'consumer');
    
    await storePage.goto(); 

    for (let i = 0; i < QUANTITY; i++) {
        await storePage.buyFirstProduct();
    }

    await expect(storePage.cartItemCount).toHaveText(String(QUANTITY));
});

test('User can logout and return to the login screen', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const storePage = new StorePage(page);
    
    if (process.env.STORE_PASSWORD !== undefined) {
        password = process.env.STORE_PASSWORD;
    }

    await loginPage.goto();
    await loginPage.login('monse', password, 'consumer');
    await expect(page).toHaveURL(/\/store/i);
    
    await page.getByRole('link', { name: 'Logout' }).click();
    
    await expect(page).toHaveURL(/\/login/i);
    await expect(loginPage.loginButton).toBeVisible();
});