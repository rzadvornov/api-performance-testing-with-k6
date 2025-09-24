import HTTPMethod from "http-method-enum";
import { BaseAPI } from "../BaseAPI";
import http, { RefinedResponse } from "k6/http";

/**
 * API client for Products endpoints
 * Handles all product-related operations including CRUD operations
 *
 * @class ProductsAPI
 * @extends BaseAPI
 */
export class ProductsAPI extends BaseAPI {
  private readonly endpoint = "/products";

  /**
   * Retrieves all products with optional pagination
   * @param offset - Number of items to skip (default: 0)
   * @param limit - Number of items to return (default: 10)
   * @returns HTTP response containing products list
   */
  getAllProducts<RT extends http.ResponseType | undefined>(
    offset: number = 0,
    limit: number = 10
  ): RefinedResponse<RT> {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });
    return this.get(`${this.endpoint}?${params.toString()}`);
  }

  /**
   * Retrieves a single product by ID
   * @param productId - The unique identifier of the product
   * @returns HTTP response containing product details
   */
  getProductById<RT extends http.ResponseType | undefined>(
    productId: number
  ): RefinedResponse<RT> {
    return this.get(`${this.endpoint}/${productId}`);
  }

  /**
   * Retrieves products filtered by category
   * @param categoryId - The category ID to filter by
   * @param offset - Number of items to skip (default: 0)
   * @param limit - Number of items to return (default: 10)
   * @returns HTTP response containing filtered products
   */
  getProductsByCategory<RT extends http.ResponseType | undefined>(
    categoryId: number,
    offset: number = 0,
    limit: number = 10
  ): RefinedResponse<RT> {
    const params = new URLSearchParams({
      categoryId: categoryId.toString(),
      offset: offset.toString(),
      limit: limit.toString(),
    });
    return this.get(`${this.endpoint}?${params.toString()}`);
  }

  /**
   * Retrieves products filtered by price range
   * @param minPrice - Minimum price filter
   * @param maxPrice - Maximum price filter
   * @returns HTTP response containing filtered products
   */
  getProductsByPriceRange<RT extends http.ResponseType | undefined>(
    minPrice: number,
    maxPrice: number
  ): RefinedResponse<RT> {
    const params = new URLSearchParams({
      price_min: minPrice.toString(),
      price_max: maxPrice.toString(),
    });
    return this.get(`${this.endpoint}?${params.toString()}`);
  }

  /**
   * Creates a new product
   * @param productData - The product data to create
   * @returns HTTP response containing created product
   */
  createProduct<RT extends http.ResponseType | undefined>(
    productData: object
  ): RefinedResponse<RT> {
    return this.post(this.endpoint, productData);
  }

  /**
   * Updates an existing product using PUT method
   * @param productId - The unique identifier of the product to update
   * @param productData - The updated product data
   * @returns HTTP response containing updated product
   */
  updateProduct<RT extends http.ResponseType | undefined>(
    productId: number,
    productData: object
  ): RefinedResponse<RT> {
    return this.put(`${this.endpoint}/${productId}`, productData);
  }

  /**
   * Partially updates an existing product using PATCH method
   * @param productId - The unique identifier of the product to update
   * @param productData - The partial product data to update
   * @returns HTTP response containing updated product
   */
  patchProduct<RT extends http.ResponseType | undefined>(
    productId: number,
    productData: object
  ): RefinedResponse<RT> {
    return this.patch(`${this.endpoint}/${productId}`, productData);
  }

  /**
   * Deletes a product by ID
   * @param productId - The unique identifier of the product to delete
   * @returns HTTP response confirming deletion
   */
  deleteProduct<RT extends http.ResponseType | undefined>(
    productId: number
  ): RefinedResponse<RT> {
    return this.delete(`${this.endpoint}/${productId}`);
  }

  /**
   * Searches products by title
   * @param title - The title to search for
   * @returns HTTP response containing matching products
   */
  searchProducts<RT extends http.ResponseType | undefined>(
    title: string
  ): RefinedResponse<RT> {
    const params = new URLSearchParams({
      title: title,
    });
    return this.get(`${this.endpoint}?${params.toString()}`);
  }

  /**
   * Retrieves multiple products by batch processing
   * @param productIds - Array of product IDs to retrieve
   * @returns Array of HTTP responses
   */
  getProductsBatch<RT extends http.ResponseType | undefined>(
    productIds: number[]
  ): RefinedResponse<RT>[] {
    const requests = productIds.map((id) => ({
      method: HTTPMethod.GET,
      url: `${this.baseUrl}${this.endpoint}/${id}`,
    }));
    return this.batch(requests);
  }
}
