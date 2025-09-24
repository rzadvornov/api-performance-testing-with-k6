import http, {
  RefinedParams,
  RefinedResponse,
} from "k6/http";
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
   * @returns HTTP response object
   * @protected
   */
  protected get<RT extends http.ResponseType | undefined>(
    endpoint: string,
    params?: RefinedParams<RT>
  ): RefinedResponse<RT> {
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
   * @returns HTTP response object
   * @protected
   */
  protected post<RT extends http.ResponseType | undefined>(
    endpoint: string,
    body: object,
    params?: RefinedParams<RT>
  ): RefinedResponse<RT> {
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
   * @returns HTTP response object
   * @protected
   */
  protected put<RT extends http.ResponseType | undefined>(
    endpoint: string,
    body: object,
    params?: RefinedParams<RT>
  ): RefinedResponse<RT> {
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
   * @returns HTTP response object
   * @protected
   */
  protected patch<RT extends http.ResponseType | undefined>(
    endpoint: string,
    body: object,
    params?: RefinedParams<RT>
  ): RefinedResponse<RT> {
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
   * @returns HTTP response object
   * @protected
   */
  protected delete<RT extends http.ResponseType | undefined>(
    endpoint: string,
    params?: RefinedParams<RT>
  ): RefinedResponse<RT> {
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
   * @returns Array of HTTP responses
   * @protected
   */
  protected batch<RT extends http.ResponseType | undefined>(
    requests: Array<{
      method: string;
      url: string;
      params?: RefinedParams<RT>;
    }>
  ): RefinedResponse<RT>[] {
    const requestsWithDefaults = requests.map((request) => ({
      ...request,
      params: request.params
        ? this.mergeParams(request.params)
        : ({ headers: this.defaultHeaders } as RefinedParams<RT>),
    }));

    const responses = http.batch(requestsWithDefaults);
    return responses;
  }

  /**
   * Validates an HTTP response against a set of common criteria.
   * @template RT The response type, typically http.ResponseType | undefined.
   * @param {RefinedResponse<RT>} response The HTTP response object from k6.
   * @param {number} [expectedStatus=StatusCode.SuccessOK] The expected HTTP status code.
   * @param {string} [endpoint=""] A descriptive name for the endpoint being tested.
   * @returns {boolean} True if all checks pass, false otherwise.
   */
  protected validateResponse<RT extends http.ResponseType | undefined>(
    response: RefinedResponse<RT>,
    expectedStatus: number = StatusCode.SuccessOK,
    endpoint: string = ""
  ): boolean {
    // Always add to the counter at the start of the validation process.
    apiCallsCounter.add(1, { endpoint });

    const checks = {
      // Check 1: Status Code
      [`${endpoint} - status is ${expectedStatus}`]: (r: RefinedResponse<RT>) =>
        r.status === expectedStatus,

      // Check 2: Response Time
      [`${endpoint} - response time < 500ms`]: (r: RefinedResponse<RT>) =>
        r.timings.duration < 500,
    };

    if (expectedStatus !== StatusCode.SuccessNoContent) {
      // Check 3: Response Body
      checks[`${endpoint} - response has a body`] = (r: RefinedResponse<RT>) =>
        r.body !== null &&
        r.body !== undefined &&
        ((typeof r.body === "string" && r.body.length > 0) ||
          (r.body instanceof ArrayBuffer && r.body.byteLength > 0));

      // Check 4: Valid JSON
      checks[`${endpoint} - response body is valid JSON`] = (
        r: RefinedResponse<RT>
      ) => {
        // JSON parsing should only be attempted on non-empty string bodies.
        if (typeof r.body !== "string" || r.body.length === 0) {
          return false;
        }
        try {
          JSON.parse(r.body);
          return true;
        } catch (e) {
          console.error(`Failed to parse JSON for endpoint ${endpoint}: ${e}`);
          return false;
        }
      };
    }

    const allChecksPassed = check(response, checks);

    const logMessage = allChecksPassed
      ? `✅ ${endpoint} - All checks passed in ${response.timings.duration}ms`
      : `❌ ${endpoint} - One or more checks failed! Status: ${
          response.status
        }, Duration: ${response.timings.duration}ms, Body length: ${
          response.body instanceof ArrayBuffer
            ? response.body.byteLength
            : typeof response.body === "string"
            ? response.body.length
            : 0
        }`;

    console.log(logMessage);

    // Update metrics based on the final result.
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
  protected mergeParams<RT extends http.ResponseType | undefined>(
    params?: RefinedParams<RT>
  ): RefinedParams<RT> {
    if (!params) {
      return { headers: this.defaultHeaders } as RefinedParams<RT>;
    }

    return {
      ...params,
      headers: {
        ...this.defaultHeaders,
        ...params.headers,
      },
    } as RefinedParams<RT>;
  }
}
