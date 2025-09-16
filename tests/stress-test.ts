import { sleep } from "k6";
import { FakeStoreAPI } from "../api/FakeStoreAPI";
import {
  STRESS_OPERATION_RANGES,
  STRESS_SCENARIO_THRESHOLDS,
  stressTestOptions,
  TEST_DATA,
} from "../config";
import {
  getRandomInt,
  getRandomUser,
  getRandomCart,
  getRandomProduct,
  executeWithProbability,
  handleError,
} from "../utilities/utils";

export let options = stressTestOptions;

const api = new FakeStoreAPI();

const scenarioHandlers = [
  {
    threshold: STRESS_SCENARIO_THRESHOLDS.INTENSIVE_PRODUCT,
    handler: intensiveProductOperations,
  },
  {
    threshold: STRESS_SCENARIO_THRESHOLDS.HEAVY_USER,
    handler: heavyUserOperations,
  },
  {
    threshold: STRESS_SCENARIO_THRESHOLDS.AGGRESSIVE_CART,
    handler: aggressiveCartOperations,
  },
  {
    threshold: STRESS_SCENARIO_THRESHOLDS.MIXED_CRUD,
    handler: mixedCRUDOperations,
  },
  { threshold: STRESS_SCENARIO_THRESHOLDS.BATCH, handler: batchOperations },
];

export default function () {
  const scenario = Math.random();

  const handler = scenarioHandlers.find(
    ({ threshold }) => scenario < threshold
  );
  if (handler) {
    try {
      handler.handler();
    } catch (error) {
      handleError(`Scenario ${handler.handler.name} failed: `, error);
    }
  }

  sleep(Math.random() * 1 + 0.1);
}

function intensiveProductOperations() {
  api.products.getAllProducts();

  const productViews = getRandomInt(
    STRESS_OPERATION_RANGES.PRODUCT_BROWSING.MIN,
    STRESS_OPERATION_RANGES.PRODUCT_BROWSING.MAX
  );
  for (let i = 0; i < productViews; i++) {
    api.products.getProduct(
      getRandomInt(
        STRESS_OPERATION_RANGES.PRODUCT.MIN,
        STRESS_OPERATION_RANGES.PRODUCT.MAX
      )
    );
  }

  TEST_DATA.CATEGORIES.forEach((category) => {
    executeWithProbability(0.5, () => {
      api.products.getProductsByCategory(category);
    });
  });
}

function heavyUserOperations() {
  api.users.getAllUsers();

  const userCount = getRandomInt(
    STRESS_OPERATION_RANGES.USER_BATCH.MIN,
    STRESS_OPERATION_RANGES.USER_BATCH.MAX
  );
  const userIds = Array.from({ length: userCount }, () =>
    getRandomInt(
      STRESS_OPERATION_RANGES.USER.MIN,
      STRESS_OPERATION_RANGES.USER.MAX
    )
  );
  api.users.batchGetUsers(userIds);

  executeWithProbability(0.3, () => {
    const testUser = getRandomUser();
    api.users.createUser(testUser);
  });
}

function aggressiveCartOperations() {
  api.carts.getAllCarts();

  for (let userId = 1; userId <= 5; userId++) {
    try {
      api.carts.getUserCarts(userId);
    } catch (error) {
      handleError(`Cart operation failed for user ${userId}: `, error);
    }
  }

  executeWithProbability(0.4, () => {
    const testCart = getRandomCart();
    api.carts.createCart(testCart);
  });
}

function mixedCRUDOperations() {
  const operations = [
    () => api.products.createProduct(getRandomProduct()),
    () => api.users.createUser(getRandomUser()),
    () => api.carts.createCart(getRandomCart()),
    () =>
      api.products.getProduct(
        getRandomInt(
          STRESS_OPERATION_RANGES.PRODUCT.MIN,
          STRESS_OPERATION_RANGES.PRODUCT.MAX
        )
      ),
    () =>
      api.users.getUser(
        getRandomInt(
          STRESS_OPERATION_RANGES.USER.MIN,
          STRESS_OPERATION_RANGES.USER.MAX
        )
      ),
    () =>
      api.carts.getCart(
        getRandomInt(
          STRESS_OPERATION_RANGES.CART.MIN,
          STRESS_OPERATION_RANGES.CART.MAX
        )
      ),
  ];

  const operationCount = getRandomInt(
    STRESS_OPERATION_RANGES.MIXED_OPS.MIN,
    STRESS_OPERATION_RANGES.MIXED_OPS.MAX
  );
  for (let i = 0; i < operationCount; i++) {
    const operation = operations[Math.floor(Math.random() * operations.length)];
    try {
      operation();
    } catch (error) {
      handleError("Mixed CRUD operation failed: ", error);
    }
  }
}

function batchOperations() {
  try {
    const productIds = Array.from({ length: 10 }, () =>
      getRandomInt(
        STRESS_OPERATION_RANGES.PRODUCT.MIN,
        STRESS_OPERATION_RANGES.PRODUCT.MAX
      )
    );
    api.products.batchGetProducts(productIds);

    const userIds = Array.from({ length: 5 }, () =>
      getRandomInt(
        STRESS_OPERATION_RANGES.USER.MIN,
        STRESS_OPERATION_RANGES.USER.MAX
      )
    );
    api.users.batchGetUsers(userIds);

    const cartIds = Array.from({ length: 3 }, () =>
      getRandomInt(
        STRESS_OPERATION_RANGES.CART.MIN,
        STRESS_OPERATION_RANGES.CART.MAX
      )
    );
    api.carts.batchGetCarts(cartIds);
  } catch (error) {
    handleError("Batch operations failed: ", error);
  }
}