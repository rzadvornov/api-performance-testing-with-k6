import http, { RefinedResponse } from "k6/http";
import { BaseAPI } from "../BaseAPI";
import { LoginCredentials } from "../types/loginCredentials";
import StatusCode from "status-code-enum";

/**
 * API client for Authentication endpoints
 * Handles all authentication-related operations including login, token refresh, and profile access
 *
 * @class AuthAPI
 * @extends BaseAPI
 */
export class AuthAPI extends BaseAPI {
  private readonly authEndpoint = "/auth";
  private currentToken: string | null = null;

  /**
   * Authenticates a user and retrieves JWT tokens
   * @param credentials - User login credentials (email and password)
   * @returns The HTTP response containing JWT tokens
   */
  public login<RT extends http.ResponseType | undefined>(
    credentials: LoginCredentials
  ): RefinedResponse<RT> {
    const response = this.post<RT>(`${this.authEndpoint}/login`, credentials);

    this.setAccessToken(response);
    return response;
  }

  /**
   * Refreshes the access token using a refresh token
   * @param refreshToken - The refresh token received during login
   * @returns Promise resolving to the HTTP response containing new JWT tokens
   */
  refreshToken<RT extends http.ResponseType | undefined>(
    refreshToken: string
  ): RefinedResponse<RT> {
    const response = this.post(`${this.authEndpoint}/refresh-token`, {
      refreshToken: refreshToken,
    });

    this.setAccessToken(response);
    return response;
  }

  /**
   * Retrieves the current user's profile information
   * Requires authentication token to be set
   * @returns The HTTP response containing user profile
   */
  getProfile<RT extends http.ResponseType | undefined>(): RefinedResponse<RT> {
    if (!this.currentToken) {
      throw new Error("Authentication token is required. Please login first.");
    }
    return this.get(`${this.authEndpoint}/profile`);
  }

  /**
   * Checks if the user is currently authenticated
   * @returns Boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    return this.currentToken !== null;
  }

  /**
   * Gets the current access token
   * @returns The current JWT access token or null if not authenticated
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Clears the current authentication token and authorization header
   */
  logout(): void {
    this.currentToken = null;
    delete this.defaultHeaders["Authorization"];
  }

  /**
   * Validates the current access token by making a request to the user profile endpoint.
   * @returns {boolean} True if the token is valid, false otherwise.
   */
  public validateToken(): boolean {
    if (!this.currentToken) {
      console.warn("Validation skipped: No authentication token found.");
      return false;
    }

    let isTokenValid = false;

    try {
      const response: http.RefinedResponse<http.ResponseType | undefined> =
        this.getProfile();

      if (response.status === StatusCode.SuccessOK) {
        isTokenValid = true;
        console.log("✅ Token validation successful: Received 200 OK.");
      } else {
        isTokenValid = false;
        console.warn(
          `❌ Token validation failed: Received status code ${response.status}.`
        );
      }

      if (response.error) {
        console.error(
          `🔴 Network error during token validation: ${response.error}`
        );
        isTokenValid = false;
      }
    } catch (error) {
      console.error(`💥 Unexpected error during token validation: ${error}`);
      isTokenValid = false;
    }

    return isTokenValid;
  }

  /**
   * Extracts and sets the access token from a successful authentication response.
   * @private
   * @param {http.RefinedResponse<http.ResponseType | undefined>} response The HTTP response object from a login request.
   */
  private setAccessToken(
    response: http.RefinedResponse<http.ResponseType | undefined>
  ) {
    if (response.status === StatusCode.SuccessOK && response.body) {
      try {
        const body = response.json() as {
          access_token: string;
          refresh_token?: string;
        };

        if (body && typeof body.access_token === "string") {
          this.currentToken = body.access_token;
          this.setAuthorizationHeader(this.currentToken);
        }
      } catch (e) {
        console.error(`Failed to parse JSON body for login response: ${e}`);
      }
    }
  }

  /**
   * Sets the authorization header for authenticated requests
   * @param token - The JWT access token
   * @private
   */
  private setAuthorizationHeader(token: string): void {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }
}
