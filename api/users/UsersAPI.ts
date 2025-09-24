import http, { RefinedResponse } from "k6/http";
import { BaseAPI } from "../BaseAPI";
import HTTPMethod from "http-method-enum";

/**
 * API client for Users endpoints
 * Handles all user-related operations including CRUD operations
 *
 * @class UsersAPI
 * @extends BaseAPI
 */
export class UsersAPI extends BaseAPI {
  private readonly endpoint = "/users";

  /**
   * Retrieves all users with optional pagination
   * @param offset - Number of items to skip (default: 0)
   * @param limit - Number of items to return (default: 10)
   * @returns HTTP response containing users list
   */
  getAllUsers<RT extends http.ResponseType | undefined>(
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
   * Retrieves a single user by ID
   * @param userId - The unique identifier of the user
   * @returns HTTP response containing user details
   */
  getUserById<RT extends http.ResponseType | undefined>(
    userId: number
  ): RefinedResponse<RT> {
    return this.get(`${this.endpoint}/${userId}`);
  }

  /**
   * Creates a new user
   * @param userData - The user data to create
   * @returns HTTP response containing created user
   */
  createUser<RT extends http.ResponseType | undefined>(
    userData: any
  ): RefinedResponse<RT> {
    return this.post(this.endpoint, userData);
  }

  /**
   * Updates an existing user using PUT method
   * @param userId - The unique identifier of the user to update
   * @param userData - The updated user data
   * @returns HTTP response containing updated user
   */
  updateUser<RT extends http.ResponseType | undefined>(
    userId: number,
    userData: object
  ): RefinedResponse<RT> {
    return this.put(`${this.endpoint}/${userId}`, userData);
  }

  /**
   * Partially updates an existing user using PATCH method
   * @param userId - The unique identifier of the user to update
   * @param userData - The partial user data to update
   * @returns HTTP response containing updated user
   */
  patchUser<RT extends http.ResponseType | undefined>(
    userId: number,
    userData: object
  ): RefinedResponse<RT> {
    return this.patch(`${this.endpoint}/${userId}`, userData);
  }

  /**
   * Deletes a user by ID
   * @param userId - The unique identifier of the user to delete
   * @returns HTTP response confirming deletion
   */
  deleteUser<RT extends http.ResponseType | undefined>(
    userId: number
  ): RefinedResponse<RT> {
    return this.delete(`${this.endpoint}/${userId}`);
  }

  /**
   * Checks if an email is available (not taken by another user)
   * @param email - The email address to check
   * @returns HTTP response indicating email availability
   */
  checkEmailAvailability<RT extends http.ResponseType | undefined>(
    email: string
  ): RefinedResponse<RT> {
    const params = new URLSearchParams({
      email: email,
    });
    return this.get(`${this.endpoint}/is-available?${params.toString()}`);
  }

  /**
   * Retrieves multiple users by batch processing
   * @param userIds - Array of user IDs to retrieve
   * @returns Promise resolving to array of HTTP responses
   */
  getUsersBatch<RT extends http.ResponseType | undefined>(
    userIds: number[]
  ): RefinedResponse<RT>[] {
    const requests = userIds.map((id) => ({
      method: HTTPMethod.GET,
      url: `${this.baseUrl}${this.endpoint}/${id}`,
    }));
    return this.batch(requests);
  }
}
