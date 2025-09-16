import HTTPMethod from "http-method-enum";
import { BaseAPI } from "../BaseAPI";
import { Product } from "../types/product";

export class ProductsAPI extends BaseAPI {
  /**
   * Retrieves all products from the API
   * @returns Promise resolving to the list of products
   * @async
   */
  async getAllProducts(): Promise<any> {
    return this.get("/products");
  }

  /**
   * Retrieves a specific product by its ID
   * @param id - The unique identifier of the product
   * @returns Promise resolving to the product data
   * @async
   */
  async getProduct(id: number): Promise<any> {
    return this.get(`/products/${id}`);
  }

  /**
   * Retrieves all available product categories
   * @returns Promise resolving to the list of categories
   * @async
   */
  async getProductCategories(): Promise<any> {
    return this.get("/products/categories");
  }

  /**
   * Retrieves products belonging to a specific category
   * @param category - The category name to filter products by
   * @returns Promise resolving to products in the specified category
   * @async
   */
  async getProductsByCategory(category: string): Promise<any> {
    return this.get(`/products/category/${encodeURIComponent(category)}`);
  }

  /**
   * Creates a new product
   * @param product - The product data to create
   * @returns Promise resolving to the created product with generated ID
   * @async
   */
  async createProduct(product: Product): Promise<any> {
    return this.post("/products", product);
  }

  /**
   * Fully updates an existing product
   * @param id - The ID of the product to update
   * @param product - The complete product data for replacement
   * @returns Promise resolving to the updated product
   * @async
   */
  async updateProduct(id: number, product: Product): Promise<any> {
    return this.put(`/products/${id}`, { ...product, id });
  }

  /**
   * Partially updates an existing product with specific fields
   * @param id - The ID of the product to update
   * @param updates - Partial product data containing only fields to update
   * @returns Promise resolving to the partially updated product
   * @async
   */
  async partialUpdateProduct(
    id: number,
    updates: Partial<Product>
  ): Promise<any> {
    return this.patch(`/products/${id}`, { ...updates, id });
  }

  /**
   * Deletes a product by its ID
   * @param id - The ID of the product to delete
   * @returns Promise resolving to the deletion result
   * @async
   */
  async deleteProduct(id: number): Promise<any> {
    return this.delete(`/products/${id}`);
  }

  /**
   * Retrieves a limited number of products
   * @param limit - Maximum number of products to return
   * @returns Promise resolving to limited product list
   * @async
   */
  async getLimitedProducts(limit: number): Promise<any> {
    return this.get(`/products?limit=${limit}`);
  }

  /**
   * Retrieves products sorted by price
   * @param sort - Sort direction: 'asc' for ascending, 'desc' for descending
   * @returns Promise resolving to sorted product list
   * @async
   */
  async getSortedProducts(sort: "asc" | "desc" = "asc"): Promise<any> {
    return this.get(`/products?sort=${sort}`);
  }

  /**
   * Performs batch retrieval of multiple products for performance testing
   * @param ids - Array of product IDs to retrieve in batch
   * @returns Promise resolving to array of product responses
   * @async
   */
  async batchGetProducts(ids: number[]): Promise<any[]> {
    const requests = ids.map((id) => ({
      method: `${HTTPMethod.GET}`,
      url: `${this.baseUrl}/products/${id}`,
      tags: { name: `batch_get_product_${id}` },
    }));
    return this.batch(requests);
  }
}
