import { sleep } from "k6";
import { Counter, Rate } from "k6/metrics";
import { FakeStoreAPI } from "../api/FakeStoreAPI";
import { enduranceTestOptions, BROWSE_PHASES, ID_RANGES, SLEEP_RANGE } from "../config";
import {
  getRandomInt,
  getRandomElement,
  exponentialBackoff,
  handleError,
} from "../utilities/utils";

export let options = enduranceTestOptions;

export const successfulOperations = new Counter("successful_operations");
export const failedOperations = new Counter("failed_operations");
export const operationErrorRate = new Rate("operation_error_rate");

const api = new FakeStoreAPI();

const browsingConfig = [
  { threshold: BROWSE_PHASES.LIGHT, handler: lightBrowsing },
  {
    threshold: BROWSE_PHASES.LIGHT + BROWSE_PHASES.MODERATE,
    handler: moderateBrowsing,
  },
];

interface ExecuteRandomOperationsParams {
  min?: number;
  max?: number;
  operations: (() => Promise<any>)[];
  maxRetries?: number;
  baseDelay?: number;
}

export default function () {
  const iteration = __ITER;
  const testPhase = (iteration % 1000) / 1000;

  try {
    const config = browsingConfig.find(
      (config) => testPhase < config.threshold
    );
    const handler = config ? config.handler : heavyBrowsing;
    handler(iteration);

    successfulOperations.add(1);
    operationErrorRate.add(0);
  } catch (error) {
    failedOperations.add(1);
    operationErrorRate.add(1);
    handleError(`Iteration ${iteration} failed: `, error);
  }

  sleep(Math.random() * (SLEEP_RANGE.MAX - SLEEP_RANGE.MIN) + SLEEP_RANGE.MIN);
}

async function lightBrowsing(_iteration: number) {
  const operations = [
    () =>
      api.products.getProduct(
        getRandomInt(ID_RANGES.PRODUCT.MIN, ID_RANGES.PRODUCT.MAX)
      ),
    () => api.products.getProductCategories(),
    () =>
      api.users.getUser(getRandomInt(ID_RANGES.USER.MIN, ID_RANGES.USER.MAX)),
  ];

  await executeRandomOperations({
    min: 1,
    max: 3,
    operations: operations,
  });
}

async function heavyBrowsing(_iteration: number) {
  const operations = [
    () => api.products.getAllProducts(),
    () => api.products.getProductCategories(),
    () => api.users.getAllUsers(),
    () => api.carts.getAllCarts(),
    () => api.products.getSortedProducts(getRandomElement(["asc", "desc"])),
    () =>
      api.carts.getUserCarts(
        getRandomInt(ID_RANGES.USER.MIN, ID_RANGES.USER.MAX)
      ),
  ];

  await executeRandomOperations({
    min: 2,
    max: 5,
    operations: operations,
    maxRetries: 5,
  });
}

async function moderateBrowsing(_iteration: number) {
  const operations = [
    () => api.products.getAllProducts(),
    () =>
      api.users.getUser(getRandomInt(ID_RANGES.USER.MIN, ID_RANGES.USER.MAX)),
    () =>
      api.carts.getCart(getRandomInt(ID_RANGES.CART.MIN, ID_RANGES.CART.MAX)),
    () => api.products.getLimitedProducts(getRandomInt(5, 15)),
  ];

  await executeRandomOperations({
    min: 1,
    max: 3,
    operations: operations,
  });
}

const executeRandomOperations = async ({
  min = 1,
  max = 3,
  operations,
  maxRetries = 3,
  baseDelay = 1000,
}: ExecuteRandomOperationsParams) => {
  const count = getRandomInt(min, max);
  const results: Array<{ success: boolean; error?: Error; retries?: number }> =
    [];

  for (let i = 0; i < count; i++) {
    try {
      const operation = getRandomElement(operations);

      let retryCount = 0;
      await exponentialBackoff(
        async () => {
          try {
            await operation();
            return { success: true };
          } catch (error) {
            retryCount++;
            throw error;
          }
        },
        maxRetries,
        baseDelay
      );

      results.push({ success: true, retries: retryCount });
    } catch (error) {
      handleError("Operation failed after all retries: ", error);
      results.push({
        success: false,
        error: error as Error,
        retries: maxRetries,
      });
    }
  }

  return results;
};