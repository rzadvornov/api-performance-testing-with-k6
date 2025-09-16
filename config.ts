import { Options } from 'k6/options';

// Base API configuration
export const baseUrl = 'https://fakestoreapi.com';

// Test data constants
export const TEST_DATA = {
  PRODUCTS: {
    MIN_ID: 1,
    MAX_ID: 20,
    BATCH_SIZE: { MIN: 2, MAX: 4 },
    LIMIT: { MIN: 5, MAX: 10 },
  },
  USERS: {
    MIN_ID: 1,
    MAX_ID: 10,
    ADMIN_THRESHOLD: 0.9,
  },
  CARTS: {
    MIN_ID: 1,
    MAX_ID: 7,
    USER_MIN_ID: 1,
    USER_MAX_ID: 3,
  },
  CATEGORIES: ["electronics", "jewelery", "men's clothing", "women's clothing"],
  CREDENTIALS: {
    username: "mor_2314",
    password: "83r5^_",
  },
  THINK_TIME: {
    MIN: 0.5,
    MAX: 2.5,
  },
};

// ID ranges for different entities
export const ID_RANGES = {
  PRODUCT: { MIN: 1, MAX: 20 },
  USER: { MIN: 1, MAX: 10 },
  CART: { MIN: 1, MAX: 7 },
};

// Sleep configuration
export const SLEEP_RANGE = {
  MIN: 1,
  MAX: 3,
};

// Browse phases for endurance test
export const BROWSE_PHASES = {
  LIGHT: 0.6, // 60% of iterations
  MODERATE: 0.3, // 30% of iterations (0.6 to 0.9)
  HEAVY: 0.1, // 10% of iterations (0.9 to 1.0)
};

// Spike test behavior thresholds
export const SPIKE_BEHAVIOR_THRESHOLDS = {
  PRODUCT_BROWSING: 0.4,
  SEARCH: 0.7,
  AUTHENTICATION: 0.9,
  MIXED: 1.0
};

// Stress test scenario thresholds
export const STRESS_SCENARIO_THRESHOLDS = {
  INTENSIVE_PRODUCT: 0.3,
  HEAVY_USER: 0.5,
  AGGRESSIVE_CART: 0.7,
  MIXED_CRUD: 0.9,
  BATCH: 1.0
};

// Operation ranges for stress test
export const STRESS_OPERATION_RANGES = {
  PRODUCT: { MIN: 1, MAX: 20 },
  USER: { MIN: 1, MAX: 10 },
  CART: { MIN: 1, MAX: 7 },
  PRODUCT_BROWSING: { MIN: 3, MAX: 7 },
  USER_BATCH: { MIN: 5, MAX: 10 },
  MIXED_OPS: { MIN: 3, MAX: 6 }
};

export const SPIKE_PRODUCT_RANGES = {
  MIN_ID: 1,
  MAX_ID: 20,
  USER_MIN_ID: 1,
  USER_MAX_ID: 10,
  CART_MIN_ID: 1,
  CART_MAX_ID: 7
};

// User journey configuration for volume test
export const USER_JOURNEY_CONFIG = {
  THINK_TIME: { MIN: 1, MAX: 4 }, 
  PRODUCT: { MIN_ID: 1, MAX_ID: 20 },
  USER: { MIN_ID: 1, MAX_ID: 10 },
  CART: { MIN_ID: 1, MAX_ID: 7 },
  PROFILE_CHECK_PROBABILITY: 0.3, 
  CART_VIEW_PROBABILITY: 0.2,     
  USER_CART_PROBABILITY: 0.4,     
  LIMITED_PRODUCTS_PROBABILITY: 0.5 
};

// Test options configurations
export const loadTestOptions: Options = {
  stages: [
    { duration: '2m', target: 20 },   // Ramp up
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 20 },   // Ramp down
    { duration: '1m', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // Added p(99) for better tail latency monitoring
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>100'],
  },
};

export const stressTestOptions: Options = {
  stages: [
    { duration: '2m', target: 20 },   // Warm up
    { duration: '5m', target: 50 },   // Normal load
    { duration: '2m', target: 100 },  // Increase load
    { duration: '5m', target: 100 },  // Stay at stress level
    { duration: '2m', target: 150 },  // Push further
    { duration: '5m', target: 150 },  // Maximum stress
    { duration: '2m', target: 200 },  // Breaking point
    { duration: '5m', target: 200 },  // Hold at breaking point
    { duration: '5m', target: 0 },    // Recovery
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

export const spikeTestOptions: Options = {
  stages: [
    { duration: '1m', target: 20 },   // Normal load
    { duration: '30s', target: 200 }, // Sudden spike
    { duration: '1m', target: 20 },   // Back to normal
    { duration: '30s', target: 300 }, // Bigger spike
    { duration: '1m', target: 20 },   // Recovery
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
  },
};

export const volumeTestOptions: Options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up
    { duration: '30m', target: 50 },  // Extended duration
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export const enduranceTestOptions: Options = {
  stages: [
    { duration: '5m', target: 30 },   // Ramp up
    { duration: '60m', target: 30 },  // 1 hour sustained load
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};