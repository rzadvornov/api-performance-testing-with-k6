import { sleep } from "k6";
import { getRandomInt, executeWithProbability } from "../utilities/utils";
import { spikeTestOptions, SPIKE_PRODUCT_RANGES, SPIKE_BEHAVIOR_THRESHOLDS, TEST_DATA } from "../config";
import { FakeStoreAPI } from "../api/FakeStoreAPI";

export let options = spikeTestOptions;

const api = new FakeStoreAPI();

// Spike behavior handlers
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
  
  // Find and execute the appropriate spike handler
  const handler = spikeHandlers.find(({ threshold }) => spikeBehavior < threshold);
  if (handler) {
    handler.handler();
  }
  
  sleep(Math.random() * 0.5);
}

function rapidProductBrowsing() {
  try {
    // Simulate homepage load spike
    api.products.getAllProducts();
    api.products.getProductCategories();
    
    // Quick product views with multiple products
    const productsToView = getRandomInt(1, 3);
    for (let i = 0; i < productsToView; i++) {
      const productId = getRandomInt(SPIKE_PRODUCT_RANGES.MIN_ID, SPIKE_PRODUCT_RANGES.MAX_ID);
      api.products.getProduct(productId);
    }
  } catch (error) {
    console.error('Product browsing spike failed:', error.message);
  }
}

function rapidSearches() {
  try {
    // Category search spike with multiple searches
    const searchCount = getRandomInt(1, 3);
    for (let i = 0; i < searchCount; i++) {
      const category = TEST_DATA.CATEGORIES[Math.floor(Math.random() * TEST_DATA.CATEGORIES.length)];
      api.products.getProductsByCategory(category);
    }
    
    // Limited products view
    executeWithProbability(0.7, () => {
      api.products.getLimitedProducts(getRandomInt(3, 8));
    });
  } catch (error) {
    console.error('Search spike failed:', error.message);
  }
}

function rapidAuthentication() {
  try {
    // Login attempt spike with potential retries
    const attempts = getRandomInt(1, 3);
    for (let i = 0; i < attempts; i++) {
      api.auth.login(TEST_DATA.CREDENTIALS);
      
      // Sometimes check user profile after login
      executeWithProbability(0.4, () => {
        const userId = getRandomInt(SPIKE_PRODUCT_RANGES.USER_MIN_ID, SPIKE_PRODUCT_RANGES.USER_MAX_ID);
        api.users.getUser(userId);
      });
    }
  } catch (error) {
    console.error('Authentication spike failed:', error.message);
  }
}

function rapidMixedOperations() {
  try {
    // Execute multiple operations in parallel-like fashion
    const operations = [
      () => api.products.getProduct(getRandomInt(SPIKE_PRODUCT_RANGES.MIN_ID, SPIKE_PRODUCT_RANGES.MAX_ID)),
      () => api.users.getUser(getRandomInt(SPIKE_PRODUCT_RANGES.USER_MIN_ID, SPIKE_PRODUCT_RANGES.USER_MAX_ID)),
      () => api.carts.getCart(getRandomInt(SPIKE_PRODUCT_RANGES.CART_MIN_ID, SPIKE_PRODUCT_RANGES.CART_MAX_ID))
    ];
    
    // Shuffle and execute 2-3 operations
    operations.sort(() => Math.random() - 0.5);
    const operationsToExecute = operations.slice(0, getRandomInt(2, 4));
    
    operationsToExecute.forEach(operation => {
      try {
        operation();
      } catch (opError) {
        console.error('Mixed operation failed:', opError.message);
      }
    });
    
    // Add some product browsing as well
    executeWithProbability(0.6, () => {
      api.products.getProductCategories();
    });
    
  } catch (error) {
    console.error('Mixed operations spike failed:', error.message);
  }
}