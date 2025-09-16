import { BaseAPI } from "../BaseAPI";
import { LoginRequest } from "../types/loginRequest";

export class AuthAPI extends BaseAPI {
  /**
   * Authenticates a user with provided credentials
   * @param {LoginRequest} credentials - The login credentials containing username and password
   * @returns {Promise<any>} Promise resolving to authentication response including access token
   * @async
   * @throws {Error} If authentication fails due to invalid credentials
   */
  async login(credentials: LoginRequest): Promise<any> {
    return this.post("/auth/login", credentials);
  }

  /**
   * Performs an authenticated request using a bearer token
   * @param {string} token - The JWT or access token for authentication
   * @returns {Promise<any>} Promise resolving to user data or protected resource
   * @async
   * @throws {Error} If the token is invalid or expired
   * @example
   * // Usage example:
   * const token = 'your-jwt-token';
   * const userData = await api.loginWithToken(token);
   */
  async loginWithToken(token: string): Promise<any> {
    return this.get("/users/1", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
