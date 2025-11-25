import { test, expect, APIRequestContext } from '@playwright/test';
import { LoginPage } from "../pages/LoginPage"; 
import { StorePage } from "../pages/StorePage"; 

let password: string;

test('consumer can log in successfully', async ({ page }) => {
    const login = new LoginPage(page);
    const storePage = new StorePage(page);
    
    if (process.env.STORE_PASSWORD !== undefined) {
        password = process.env.STORE_PASSWORD;
    }

    await login.goto();
    await login.login('monse', 'sup3rs3cr3t', 'consumer');

    await expect(page).toHaveURL(/\/store/i);
    await expect(storePage.firstProductBuyButton).toBeVisible();
});

test('shows an error with invalid credentials', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('monse', 'wrongpassword', 'consumer');

    const errorLocator = page.getByText('Incorrect password');
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toContainText(/Incorrect/i);
});

test('Verify product price on receipt against API data @api', async ({ page, request }) => {
    const loginPage = new LoginPage(page);
    const storePage = new StorePage(page);
    const PRODUCT_ID = 2; 
    const EXPECTED_PRODUCT_NAME = 'Chair'; 

    if (process.env.STORE_PASSWORD !== undefined) {
        password = process.env.STORE_PASSWORD;
    }

    const apiPrice = await storePage.getProductPriceFromApi(request, PRODUCT_ID);
    expect(apiPrice).not.toBeNull();
    test.info().annotations.push({ type: 'API Price', description: `Price for Product ${PRODUCT_ID} (${EXPECTED_PRODUCT_NAME}): ${apiPrice}` });
    
    await loginPage.goto();
    await loginPage.login('monse', 'sup3rs3cr3t', 'consumer');
    
    await page.getByTestId('select-product').selectOption(String(PRODUCT_ID));
    await page.getByRole('textbox', { name: 'Amount' }).fill('1');
    await page.getByTestId('add-to-cart-button').click();
    
    await page.getByRole('button', { name: 'Buy' }).click(); 

    await page.getByRole('textbox', { name: 'Name:' }).fill('monse');
    await page.getByRole('textbox', { name: 'Address:' }).fill('home');
    await page.getByRole('button', { name: 'Confirm Purchase' }).click();
    const finalizePurchaseDialog = page.getByRole('dialog', { name: 'Finalize Purchase' });
    await expect(finalizePurchaseDialog).toBeVisible();
    await expect(finalizePurchaseDialog).toContainText(String(apiPrice));
});

test('Allows adding multiple items and verifies cart count', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const storePage = new StorePage(page);
    const QUANTITY = 3; 

    if (process.env.STORE_PASSWORD !== undefined) {
        password = process.env.STORE_PASSWORD;
    }

    await loginPage.goto();
    await loginPage.login('monse', 'sup3rs3cr3t', 'consumer');
    
    await storePage.goto(); 

    await page.getByTestId('select-product').selectOption('2'); 
    await page.getByRole('textbox', { name: 'Amount' }).fill('7');
    await page.getByTestId('add-to-cart-button').click();

    await page.getByTestId('select-product').selectOption('7'); 
    await page.getByRole('textbox', { name: 'Amount' }).fill('1');
    await page.getByTestId('add-to-cart-button').click();

    await page.getByTestId('select-product').selectOption('8'); 
    await page.getByRole('textbox', { name: 'Amount' }).fill('100');
    await page.getByTestId('add-to-cart-button').click();

    const cartItemRows = page.getByRole('table').getByRole('rowgroup').nth(1).getByRole('row');
    await expect(cartItemRows).toHaveCount(QUANTITY);
});

test('User can logout and return to the login screen', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    if (process.env.STORE_PASSWORD !== undefined) {
        password = process.env.STORE_PASSWORD;
    }

    await loginPage.goto();
    await loginPage.login('monse', 'sup3rs3cr3t', 'consumer');
    await expect(page).toHaveURL(/\/store/i);

    await page.getByRole('button', { name: 'Log Out' }).click();
    
    await expect(page).toHaveURL(/\/login/i);
    await expect(loginPage.loginButton).toBeVisible();
});