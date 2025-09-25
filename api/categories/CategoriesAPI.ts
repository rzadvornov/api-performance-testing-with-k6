import http, { RefinedResponse } from "k6/http";
import { BaseAPI } from "../BaseAPI";
import HTTPMethod from "http-method-enum";

/**
 * API client for Categories endpoints
 * Handles all category-related operations including CRUD operations
 *
 * @class CategoriesAPI
 * @extends BaseAPI
 */
export class CategoriesAPI extends BaseAPI {
  private readonly endpoint = "/categories";

  /**
   * Retrieves all categories with optional pagination
   * @param offset - Number of items to skip (default: 0)
   * @param limit - Number of items to return (default: 10)
   * @returns HTTP response containing categories list
   */
  getAllCategories<RT extends http.ResponseType | undefined>(
    offset: number = 0,
    limit: number = 10
  ): RefinedResponse<RT> {
    // Simple construction without encoding - numbers are safe
    const queryString = `offset=${offset}&limit=${limit}`;
    const endpointWithParams = `${this.endpoint}?${queryString}`;

    return this.get<RT>(endpointWithParams);
  }

  /**
   * Retrieves a single category by ID
   * @param categoryId - The unique identifier of the category
   * @returns HTTP response containing category details
   */
  getCategoryById<RT extends http.ResponseType | undefined>(
    categoryId: number
  ): RefinedResponse<RT> {
    return this.get(`${this.endpoint}/${categoryId}`);
  }

  /**
   * Retrieves all products within a specific category
   * @param categoryId - The unique identifier of the category
   * @param offset - Number of items to skip (default: 0)
   * @param limit - Number of items to return (default: 10)
   * @returns HTTP response containing products in the category
   */
  getProductsByCategory<RT extends http.ResponseType | undefined>(
    categoryId: number,
    offset: number = 0,
    limit: number = 10
  ): RefinedResponse<RT> {
    // Simple construction - categoryId, offset, and limit are all numbers (safe)
    const queryString = `offset=${offset}&limit=${limit}`;
    const endpointWithParams = `${this.endpoint}/${categoryId}/products?${queryString}`;

    return this.get<RT>(endpointWithParams);
  }

  /**
   * Creates a new category
   * @param categoryData - The category data to create
   * @returns HTTP response containing created category
   */
  createCategory<RT extends http.ResponseType | undefined>(
    categoryData: object
  ): RefinedResponse<RT> {
    return this.post(this.endpoint, categoryData);
  }

  /**
   * Updates an existing category using PUT method
   * @param categoryId - The unique identifier of the category to update
   * @param categoryData - The updated category data
   * @returns HTTP response containing updated category
   */
  updateCategory<RT extends http.ResponseType | undefined>(
    categoryId: number,
    categoryData: object
  ): RefinedResponse<RT> {
    return this.put(`${this.endpoint}/${categoryId}`, categoryData);
  }

  /**
   * Partially updates an existing category using PATCH method
   * @param categoryId - The unique identifier of the category to update
   * @param categoryData - The partial category data to update
   * @returns HTTP response containing updated category
   */
  patchCategory<RT extends http.ResponseType | undefined>(
    categoryId: number,
    categoryData: object
  ): RefinedResponse<RT> {
    return this.patch(`${this.endpoint}/${categoryId}`, categoryData);
  }

  /**
   * Deletes a category by ID
   * @param categoryId - The unique identifier of the category to delete
   * @returns HTTP response confirming deletion
   */
  deleteCategory<RT extends http.ResponseType | undefined>(
    categoryId: number
  ): RefinedResponse<RT> {
    return this.delete(`${this.endpoint}/${categoryId}`);
  }

  /**
   * Retrieves multiple categories by batch processing
   * @param categoryIds - Array of category IDs to retrieve
   * @returns Promise resolving to array of HTTP responses
   */
  getCategoriesBatch<RT extends http.ResponseType | undefined>(
    categoryIds: number[]
  ): RefinedResponse<RT>[] {
    const requests = categoryIds.map((id) => ({
      method: HTTPMethod.GET,
      url: `${this.baseUrl}${this.endpoint}/${id}`,
    }));
    return this.batch(requests);
  }
}
