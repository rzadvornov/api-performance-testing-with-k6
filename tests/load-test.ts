import { sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import { FakeStoreAPI } from "../api/FakeStoreAPI";
import { loadTestOptions, TEST_DATA } from "../config";
import {
  getRandomInt,
  getRandomElement,
  weightedRandom,
  executeWithProbability,
  handleError,
} from "../utilities/utils";

export { handleSummary } from '../reporter/k6-summary';
export let options = loadTestOptions;

export const scenarioCounter = new Counter("scenario_executions");
export const scenarioErrorRate = new Rate("scenario_errors");
export const scenarioDuration = new Trend("scenario_duration_ms");
export const successfulOperations = new Counter("successful_operations");
export const failedOperations = new Counter("failed_operations");

const api = new FakeStoreAPI();

const JOURNEY_STEPS = [
  {
    name: "Browse Product Catalog",
    weight: 30,
    function: browseCatalog,
  },
  {
    name: "View Product Details",
    weight: 25,
    function: viewProductDetails,
  },
  {
    name: "Category Based Search",
    weight: 20,
    function: searchByCategory,
  },
  {
    name: "User Profile Management",
    weight: 10,
    function: manageUserProfile,
  },
  {
    name: "Shopping Cart Interactions",
    weight: 10,
    function: handleShoppingCart,
  },
  {
    name: "User Authentication Flows",
    weight: 5,
    function: performAuthentication,
  },
];

export default function () {
  const startTime = Date.now();
  const scenarioName = executeRandomScenario();
  const duration = Date.now() - startTime;

  scenarioDuration.add(duration, { scenario: scenarioName });
  scenarioCounter.add(1, { scenario: scenarioName });

  sleep(
    Math.random() * (TEST_DATA.THINK_TIME.MAX - TEST_DATA.THINK_TIME.MIN) +
      TEST_DATA.THINK_TIME.MIN
  );
}

function executeRandomScenario(): string {
  const selectedScenario = weightedRandom(JOURNEY_STEPS);

  try {
    selectedScenario.function();
    scenarioErrorRate.add(0, { scenario: selectedScenario.name });
    return selectedScenario.name;
  } catch (error) {
    scenarioErrorRate.add(1, { scenario: selectedScenario.name });
    handleError(`Scenario ${selectedScenario.name} failed: `, error);
    return `${selectedScenario.name}_failed`;
  }
}

function browseCatalog() {
  api.products.getAllProducts();
  successfulOperations.add(1);

  executeWithProbability(0.3, () => {
    const limit = getRandomInt(
      TEST_DATA.PRODUCTS.LIMIT.MIN,
      TEST_DATA.PRODUCTS.LIMIT.MAX
    );
    api.products.getLimitedProducts(limit);
    successfulOperations.add(1);
  });

  executeWithProbability(0.2, () => {
    api.products.getProductCategories();
    successfulOperations.add(1);
  });
}

function viewProductDetails() {
  const productId = getRandomInt(
    TEST_DATA.PRODUCTS.MIN_ID,
    TEST_DATA.PRODUCTS.MAX_ID
  );
  api.products.getProduct(productId);
  successfulOperations.add(1);

  executeWithProbability(0.4, () => {
    const batchSize = getRandomInt(
      TEST_DATA.PRODUCTS.BATCH_SIZE.MIN,
      TEST_DATA.PRODUCTS.BATCH_SIZE.MAX
    );
    const additionalIds = Array.from({ length: batchSize }, () =>
      getRandomInt(TEST_DATA.PRODUCTS.MIN_ID, TEST_DATA.PRODUCTS.MAX_ID)
    );

    try {
      api.products.batchGetProducts(additionalIds);
      successfulOperations.add(batchSize);
    } catch (error) {
      failedOperations.add(batchSize);
      throw error;
    }
  });
}

function searchByCategory() {
  const category = getRandomElement(TEST_DATA.CATEGORIES);
  api.products.getProductsByCategory(category);
  successfulOperations.add(1);

  executeWithProbability(0.3, () => {
    const sortOrder = Math.random() > 0.5 ? "asc" : "desc";
    api.products.getSortedProducts(sortOrder);
    successfulOperations.add(1);
  });
}

function manageUserProfile() {
  const userId = getRandomInt(TEST_DATA.USERS.MIN_ID, TEST_DATA.USERS.MAX_ID);
  api.users.getUser(userId);
  successfulOperations.add(1);

  executeWithProbability(1 - TEST_DATA.USERS.ADMIN_THRESHOLD, () => {
    api.users.getAllUsers();
    successfulOperations.add(1);
  });
}

function handleShoppingCart() {
  const cartId = getRandomInt(TEST_DATA.CARTS.MIN_ID, TEST_DATA.CARTS.MAX_ID);
  api.carts.getCart(cartId);
  successfulOperations.add(1);

  executeWithProbability(0.5, () => {
    const userId = getRandomInt(
      TEST_DATA.CARTS.USER_MIN_ID,
      TEST_DATA.CARTS.USER_MAX_ID
    );
    api.carts.getUserCarts(userId);
    successfulOperations.add(1);
  });

  executeWithProbability(0.2, () => {
    api.carts.getAllCarts();
    successfulOperations.add(1);
  });
}

async function performAuthentication() {
  const credentials = {
    username: TEST_DATA.CREDENTIALS.username,
    password: TEST_DATA.CREDENTIALS.password,
  };

  try {
    const authResponse: any = await api.auth.login(credentials);
    successfulOperations.add(1);

    // Simulate subsequent authenticated request
    if (authResponse && authResponse.token) {
      api.auth.loginWithToken(authResponse.token);
      successfulOperations.add(1);
    }
  } catch (error) {
    failedOperations.add(1);
    throw error;
  }
}
