import HTTPMethod from "http-method-enum";
import { BaseAPI } from "../BaseAPI";
import { User } from "../types/user";

export class UsersAPI extends BaseAPI {
  /**
   * Retrieves all users from the API
   * @returns Promise resolving to the list of users
   * @async
   */
  async getAllUsers(): Promise<any> {
    return this.get("/users");
  }

  /**
   * Retrieves a specific user by their ID
   * @param id - The unique identifier of the user
   * @returns Promise resolving to the user data
   * @async
   */
  async getUser(id: number): Promise<any> {
    return this.get(`/users/${id}`);
  }

  /**
   * Creates a new user
   * @param user - The user data to create
   * @returns Promise resolving to the created user with generated ID
   * @async
   */
  async createUser(user: User): Promise<any> {
    return this.post("/users", user);
  }

  /**
   * Fully updates an existing user
   * @param id - The ID of the user to update
   * @param user - The complete user data for replacement
   * @returns Promise resolving to the updated user
   * @async
   */
  async updateUser(id: number, user: User): Promise<any> {
    return this.put(`/users/${id}`, { ...user, id });
  }

  /**
   * Partially updates an existing user with specific fields
   * @param id - The ID of the user to update
   * @param updates - Partial user data containing only fields to update
   * @returns Promise resolving to the partially updated user
   * @async
   */
  async partialUpdateUser(id: number, updates: Partial<User>): Promise<any> {
    return this.patch(`/users/${id}`, { ...updates, id });
  }

  /**
   * Deletes a user by their ID
   * @param id - The ID of the user to delete
   * @returns Promise resolving to the deletion result
   * @async
   */
  async deleteUser(id: number): Promise<any> {
    return this.delete(`/users/${id}`);
  }

  /**
   * Retrieves a limited number of users
   * @param limit - Maximum number of users to return
   * @returns Promise resolving to limited user list
   * @async
   */
  async getLimitedUsers(limit: number): Promise<any> {
    return this.get(`/users?limit=${limit}`);
  }

  /**
   * Retrieves users sorted by specified criteria
   * @param sort - Sort direction: 'asc' for ascending, 'desc' for descending
   * @returns Promise resolving to sorted user list
   * @async
   */
  async getSortedUsers(sort: "asc" | "desc" = "asc"): Promise<any> {
    return this.get(`/users?sort=${sort}`);
  }

  /**
   * Performs batch retrieval of multiple users for performance testing
   * @param ids - Array of user IDs to retrieve in batch
   * @returns Promise resolving to array of user responses
   * @async
   */
  async batchGetUsers(ids: number[]): Promise<any[]> {
    const requests = ids.map((id) => ({
      method: `${HTTPMethod.GET}`,
      url: `${this.baseUrl}/users/${id}`,
      tags: { name: `batch_get_user_${id}` },
    }));
    return this.batch(requests);
  }
}
