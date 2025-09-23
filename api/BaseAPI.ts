import http, { ResponseType, RefinedParams } from "k6/http";
import { baseUrl } from "../config";
import { StatusCode } from "status-code-enum";
import { check } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import { HTTPMethod } from "http-method-enum";

/**
 * Total count of API calls made, categorized by endpoint
 */
export const apiCallsCounter = new Counter("api_calls_total");

/**
 * Error rate metric for tracking API call failures
 */
export const errorRate = new Rate("errors");

/**
 * Response time trend metric for performance monitoring
 */
export const customResponseTime = new Trend("custom_response_time");

/**
 * Base class for API clients providing common HTTP methods with built-in validation and metrics
 *
 * @class BaseAPI
 * @abstract
 * @protected
 */
export abstract class BaseAPI {
  /** Base URL for all API requests */
  protected baseUrl: string;
  /** Default Headers for all API requests */
  protected defaultHeaders: Record<string, string>;

  /**
   * Creates a new BaseAPI instance
   * @constructor
   */
  constructor() {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Content-Type": "application/json",
    };
  }

  /**
   * Performs an HTTP GET request
   * @param endpoint - API endpoint path (relative to base URL)
   * @param params - Optional HTTP request parameters
   * @returns Promise resolving to the HTTP response
   * @throws Will throw error if response validation fails
   * @protected
   */
  protected async get(
    endpoint: string,
    params?: RefinedParams<ResponseType>
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const mergedParams = this.mergeParams(params);

    const response = http.get(url, mergedParams);
    this.validateResponse(
      response,
      StatusCode.SuccessOK,
      `${HTTPMethod.GET} ${endpoint}`
    );
    return response;
  }

  /**
   * Performs an HTTP POST request with JSON body
   * @param endpoint - API endpoint path (relative to base URL)
   * @param body - Request body to be serialized as JSON
   * @param params - Optional HTTP request parameters
   * @returns Promise resolving to the HTTP response
   * @throws Will throw error if response validation fails
   * @protected
   */
  protected async post(
    endpoint: string,
    body: any,
    params?: RefinedParams<ResponseType>
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const mergedParams = this.mergeParams(params);

    const response = http.post(url, JSON.stringify(body), {
      headers: {
        ...mergedParams.headers,
        "Content-Type": "application/json",
      },
      ...mergedParams,
    });
    this.validateResponse(
      response,
      StatusCode.SuccessOK,
      `${HTTPMethod.POST} ${endpoint}`
    );
    return response;
  }

  /**
   * Performs an HTTP PUT request with JSON body
   * @param endpoint - API endpoint path (relative to base URL)
   * @param body - Request body to be serialized as JSON
   * @param params - Optional HTTP request parameters
   * @returns Promise resolving to the HTTP response
   * @throws Will throw error if response validation fails
   * @protected
   */
  protected async put(
    endpoint: string,
    body: any,
    params?: RefinedParams<ResponseType>
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const mergedParams = this.mergeParams(params);

    const response = http.put(url, JSON.stringify(body), {
      headers: {
        ...mergedParams.headers,
        "Content-Type": "application/json",
      },
      ...mergedParams,
    });
    this.validateResponse(
      response,
      StatusCode.SuccessOK,
      `${HTTPMethod.PUT} ${endpoint}`
    );
    return response;
  }

  /**
   * Performs an HTTP PATCH request with JSON body
   * @param endpoint - API endpoint path (relative to base URL)
   * @param body - Request body to be serialized as JSON
   * @param params - Optional HTTP request parameters
   * @returns Promise resolving to the HTTP response
   * @throws Will throw error if response validation fails
   * @protected
   */
  protected async patch(
    endpoint: string,
    body: any,
    params?: RefinedParams<ResponseType>
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const mergedParams = this.mergeParams(params);

    const response = http.patch(url, JSON.stringify(body), {
      headers: {
        ...mergedParams.headers,
        "Content-Type": "application/json",
      },
      ...mergedParams,
    });
    this.validateResponse(
      response,
      StatusCode.SuccessOK,
      `${HTTPMethod.PATCH} ${endpoint}`
    );
    return response;
  }

  /**
   * Performs an HTTP DELETE request
   * @param endpoint - API endpoint path (relative to base URL)
   * @param params - Optional HTTP request parameters
   * @returns Promise resolving to the HTTP response
   * @throws Will throw error if response validation fails
   * @protected
   */
  protected async delete(
    endpoint: string,
    params?: RefinedParams<ResponseType>
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const mergedParams = this.mergeParams(params);

    const response = http.del(url, null, mergedParams);
    this.validateResponse(
      response,
      StatusCode.SuccessOK,
      `${HTTPMethod.DELETE} ${endpoint}`
    );
    return response;
  }

  /**
   * Performs multiple HTTP requests in parallel (batch processing)
   * @param requests - Array of request objects to execute
   * @returns Promise resolving to array of HTTP responses
   * @protected
   */
  protected async batch(requests: any[]): Promise<any[]> {
    // For batch requests, you might want to ensure each request has default headers
    const requestsWithDefaults = requests.map((request) => ({
      ...request,
      params: request.params
        ? this.mergeParams(request.params)
        : { headers: this.defaultHeaders },
    }));

    const responses = http.batch(requestsWithDefaults);
    return responses;
  }

  /**
   * Validates HTTP response against expected criteria and updates metrics
   * @param response - HTTP response object to validate
   * @param expectedStatus - Expected HTTP status code (default: 200)
   * @param endpoint - Endpoint identifier for metrics tagging
   * @returns Boolean indicating whether all validation checks passed
   * @protected
   */
  protected validateResponse(
    response: any,
    expectedStatus: number = StatusCode.SuccessOK,
    endpoint: string = ""
  ): boolean {
    apiCallsCounter.add(1, { endpoint });

    const allChecksPassed = check(response, {
      [`${endpoint} - status is ${expectedStatus}`]: (r) =>
        r.status === expectedStatus,
      [`${endpoint} - response time < 500ms`]: (r) => r.timings.duration < 500,
      [`${endpoint} - response has body`]: (r) => r.body && r.body.length > 0,
      "response body is valid JSON": (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch (e) {
          return false;
        }
      },
    });

    console.log(
      allChecksPassed
        ? `${endpoint} - All checks passed in ${response.timings.duration}ms`
        : `${endpoint} - One or more checks failed. Status: ${response.status}, Body: ${response.body}`
    );

    errorRate.add(allChecksPassed ? 0 : 1, { endpoint });

    customResponseTime.add(response.timings.duration, { endpoint });

    return allChecksPassed;
  }

  /**
   * Merges default headers with provided parameters
   * @param params - Optional HTTP request parameters
   * @returns Merged parameters with default headers included
   * @protected
   */
  protected mergeParams(
    params?: RefinedParams<ResponseType>
  ): RefinedParams<ResponseType> {
    if (!params) {
      return { headers: this.defaultHeaders };
    }

    return {
      ...params,
      headers: {
        ...this.defaultHeaders,
        ...params.headers,
      },
    };
  }
}
