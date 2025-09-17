import { HTTPMethod } from "http-method-enum";
import { BaseAPI } from "../BaseAPI";
import { Cart } from "../types/cart";

export class CartsAPI extends BaseAPI {
  /**
   * Retrieves all carts from the API
   * @returns {Promise<any>} Promise resolving to the list of carts
   * @async
   */
  async getAllCarts(): Promise<any> {
    return this.get("/carts");
  }

  /**
   * Retrieves a specific cart by its ID
   * @param {number} id - The unique identifier of the cart
   * @returns {Promise<any>} Promise resolving to the cart data
   * @async
   */
  async getCart(id: number): Promise<any> {
    return this.get(`/carts/${id}`);
  }

  /**
   * Retrieves all carts belonging to a specific user
   * @param {number} userId - The ID of the user whose carts to retrieve
   * @returns {Promise<any>} Promise resolving to the user's carts
   * @async
   */
  async getUserCarts(userId: number): Promise<any> {
    return this.get(`/carts/user/${userId}`);
  }

  /**
   * Creates a new cart
   * @param {Cart} cart - The cart data to create
   * @returns {Promise<any>} Promise resolving to the created cart with generated ID
   * @async
   */
  async createCart(cart: Cart): Promise<any> {
    return this.post("/carts", cart);
  }

  /**
   * Fully updates an existing cart
   * @param {number} id - The ID of the cart to update
   * @param {Cart} cart - The complete cart data for replacement
   * @returns {Promise<any>} Promise resolving to the updated cart
   * @async
   */
  async updateCart(id: number, cart: Cart): Promise<any> {
    return this.put(`/carts/${id}`, { ...cart, id });
  }

  /**
   * Partially updates an existing cart with specific fields
   * @param {number} id - The ID of the cart to update
   * @param {Partial<Cart>} updates - Partial cart data containing only fields to update
   * @returns {Promise<any>} Promise resolving to the partially updated cart
   * @async
   */
  async partialUpdateCart(id: number, updates: Partial<Cart>): Promise<any> {
    return this.patch(`/carts/${id}`, { ...updates, id });
  }

  /**
   * Deletes a cart by its ID
   * @param {number} id - The ID of the cart to delete
   * @returns {Promise<any>} Promise resolving to the deletion result
   * @async
   */
  async deleteCart(id: number): Promise<any> {
    return this.delete(`/carts/${id}`);
  }

  /**
   * Retrieves a limited number of carts
   * @param {number} limit - Maximum number of carts to return
   * @returns {Promise<any>} Promise resolving to limited cart list
   * @async
   */
  async getLimitedCarts(limit: number): Promise<any> {
    return this.get(`/carts?limit=${limit}`);
  }

  /**
   * Retrieves carts sorted by specified criteria
   * @param {'asc' | 'desc'} sort - Sort direction: 'asc' for ascending, 'desc' for descending
   * @param {string} [sort='asc'] - Default sort direction is ascending
   * @returns {Promise<any>} Promise resolving to sorted cart list
   * @async
   */
  async getSortedCarts(sort: "asc" | "desc" = "asc"): Promise<any> {
    return this.get(`/carts?sort=${sort}`);
  }

  /**
   * Retrieves carts created within a specific date range
   * @param {string} startDate - Start date of the range (format depends on API)
   * @param {string} endDate - End date of the range (format depends on API)
   * @returns {Promise<any>} Promise resolving to carts within the specified date range
   * @async
   */
  async getCartsInDateRange(startDate: string, endDate: string): Promise<any> {
    return this.get(`/carts?startdate=${startDate}&enddate=${endDate}`);
  }

  /**
   * Performs batch retrieval of multiple carts for performance testing
   * @param {number[]} ids - Array of cart IDs to retrieve in batch
   * @returns {Promise<any[]>} Promise resolving to array of cart responses
   * @async
   */
  async batchGetCarts(ids: number[]): Promise<any[]> {
    const requests = ids.map((id) => ({
      method: `${HTTPMethod.GET}`,
      url: `${this.baseUrl}/carts/${id}`,
      tags: { name: `batch_get_cart_${id}` },
    }));
    return this.batch(requests);
  }
}
