import { sleep } from "k6";
import { getRandomInt, executeWithProbability, handleError } from "../utilities/utils";
import { spikeTestOptions, SPIKE_PRODUCT_RANGES, SPIKE_BEHAVIOR_THRESHOLDS, TEST_DATA } from "../config";
import { FakeStoreAPI } from "../api/FakeStoreAPI";

export { handleSummary } from '../reporter/k6-summary';
export let options = spikeTestOptions;

const api = new FakeStoreAPI();

const spikeHandlers = [
  {
    threshold: SPIKE_BEHAVIOR_THRESHOLDS.PRODUCT_BROWSING,
    handler: rapidProductBrowsing
  },
  {
    threshold: SPIKE_BEHAVIOR_THRESHOLDS.SEARCH,
    handler: rapidSearches
  },
  {
    threshold: SPIKE_BEHAVIOR_THRESHOLDS.AUTHENTICATION,
    handler: rapidAuthentication
  },
  {
    threshold: SPIKE_BEHAVIOR_THRESHOLDS.MIXED,
    handler: rapidMixedOperations
  }
];

export default function () {
  const spikeBehavior = Math.random();
  
  const handler = spikeHandlers.find(({ threshold }) => spikeBehavior < threshold);
  if (handler) {
    handler.handler();
  }
  
  sleep(Math.random() * 0.5);
}

function rapidProductBrowsing() {
  try {
    api.products.getAllProducts();
    api.products.getProductCategories();
    
    const productsToView = getRandomInt(1, 3);
    for (let i = 0; i < productsToView; i++) {
      const productId = getRandomInt(SPIKE_PRODUCT_RANGES.MIN_ID, SPIKE_PRODUCT_RANGES.MAX_ID);
      api.products.getProduct(productId);
    }
  } catch (error) {
    handleError("Product browsing spike failed: ", error);
  }
}

function rapidSearches() {
  try {
    const searchCount = getRandomInt(1, 3);
    for (let i = 0; i < searchCount; i++) {
      const category = TEST_DATA.CATEGORIES[Math.floor(Math.random() * TEST_DATA.CATEGORIES.length)];
      api.products.getProductsByCategory(category);
    }
    
    executeWithProbability(0.7, () => {
      api.products.getLimitedProducts(getRandomInt(3, 8));
    });
  } catch (error) {
    handleError("Search spike failed: ", error);
  }
}

function rapidAuthentication() {
  try {
    const attempts = getRandomInt(1, 3);
    for (let i = 0; i < attempts; i++) {
      api.auth.login(TEST_DATA.CREDENTIALS);
      
      executeWithProbability(0.4, () => {
        const userId = getRandomInt(SPIKE_PRODUCT_RANGES.USER_MIN_ID, SPIKE_PRODUCT_RANGES.USER_MAX_ID);
        api.users.getUser(userId);
      });
    }
  } catch (error) {
    handleError("Authentication spike failed: ", error);
  }
}

function rapidMixedOperations() {
  try {
    const operations = [
      () => api.products.getProduct(getRandomInt(SPIKE_PRODUCT_RANGES.MIN_ID, SPIKE_PRODUCT_RANGES.MAX_ID)),
      () => api.users.getUser(getRandomInt(SPIKE_PRODUCT_RANGES.USER_MIN_ID, SPIKE_PRODUCT_RANGES.USER_MAX_ID)),
      () => api.carts.getCart(getRandomInt(SPIKE_PRODUCT_RANGES.CART_MIN_ID, SPIKE_PRODUCT_RANGES.CART_MAX_ID))
    ];
    
    operations.sort(() => Math.random() - 0.5);
    const operationsToExecute = operations.slice(0, getRandomInt(2, 4));
    
    operationsToExecute.forEach(operation => {
      try {
        operation();
      } catch (opError) {
        handleError("Mixed operation failed: ", opError);
      }
    });
    
    executeWithProbability(0.6, () => {
      api.products.getProductCategories();
    });
    
  } catch (error) {
    handleError("Mixed operations spike failed: ", error);
  }
}