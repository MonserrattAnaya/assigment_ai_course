import { Locator, Page, APIRequestContext } from "@playwright/test";

interface ProductApiData {
    id: number;
    name: string;
    price: number;
}

export class StorePage {
    readonly page: Page;
    readonly baseUrl: string = '/store2/';
    

    readonly firstProductBuyButton: Locator;
    readonly cartItemCount: Locator;
    readonly receiptMessage: Locator;
    readonly purchaseButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstProductBuyButton = page.locator('button', { hasText: 'Buy' }).first();
        this.purchaseButton = page.getByRole('button', { name: 'Purchase' });
        this.cartItemCount = page.locator('#cart-badge');
        this.receiptMessage = page.locator('.alert-success'); 
    }

    async goto() {
        await this.page.goto(this.baseUrl);
    }

    async buyFirstProduct() {
        await this.firstProductBuyButton.click();
    }
 
    async finalizePurchase() {
        await this.purchaseButton.click();
    }

    
    async getProductPriceFromApi(request: APIRequestContext, productId: number): Promise<number | null> {
        const apiUrl = `https://hoff.is/store2/api/v1/price/${productId}`;
        const response = await request.get(apiUrl);
        
        if (response.ok()) {
            const data = await response.json();
            return data.price ? parseFloat(data.price) : null; 
        }
        return null;
    }
}