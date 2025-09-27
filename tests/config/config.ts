import { Options } from 'k6/options';

// Base API configuration
export const baseUrl = "https://api.escuelajs.co/api/v1";

// Test configuration constants
export const TEST_CONFIG = {
  // Load test - normal expected load
  LOAD_TEST: {
    stages: [
      { duration: '2m', target: 10 }, // Ramp up to 10 users over 2 minutes
      { duration: '5m', target: 10 }, // Stay at 10 users for 5 minutes
      { duration: '2m', target: 0 },  // Ramp down to 0 users over 2 minutes
    ],
    thresholds: {
      http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
      http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
      api_calls_total: ['count>100'],   // Must make at least 100 API calls
    },
  },

  // Stress test - find breaking point
  STRESS_TEST: {
    stages: [
      { duration: '2m', target: 10 },  // Ramp up to 10 users
      { duration: '5m', target: 10 },  // Stay at 10 users
      { duration: '2m', target: 20 },  // Ramp up to 20 users
      { duration: '5m', target: 20 },  // Stay at 20 users
      { duration: '2m', target: 50 },  // Ramp up to 50 users
      { duration: '5m', target: 50 },  // Stay at 50 users
      { duration: '2m', target: 0 },   // Ramp down to 0 users
    ],
    thresholds: {
      http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
      http_req_failed: ['rate<0.2'],     // Error rate must be below 20%
    },
  },

  // Spike test - sudden increase in load
  SPIKE_TEST: {
    stages: [
      { duration: '10s', target: 2 },   // Baseline load
      { duration: '1m', target: 50 },   // Sudden spike to 50 users
      { duration: '3m', target: 50 },   // Maintain spike
      { duration: '10s', target: 2 },   // Return to baseline
      { duration: '3m', target: 2 },    // Maintain baseline
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000'], // Allow higher response times during spike
      http_req_failed: ['rate<0.3'],     // Higher error tolerance during spike
    },
  },

  // Volume test - large amounts of data
  VOLUME_TEST: {
    stages: [
      { duration: '2m', target: 5 },    // Ramp up slowly
      { duration: '10m', target: 5 },   // Long duration with consistent load
      { duration: '2m', target: 0 },    // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<800'],
      http_req_failed: ['rate<0.1'],
      data_received: ['count>1000000'], // Must receive at least 1MB of data
    },
  },

  // Endurance test - prolonged load
  ENDURANCE_TEST: {
    stages: [
      { duration: '2m', target: 8 },    // Ramp up
      { duration: '40m', target: 8 },   // Long sustained load
      { duration: '2m', target: 0 },    // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<600'],
      http_req_failed: ['rate<0.1'],
    },
  },
};

// Test data for API calls
export const TEST_DATA = {
  PRODUCTS: {
    SAMPLE_IDS: [1, 2, 3, 4, 5, 10, 15, 20, 25, 30],
    CATEGORIES: [1, 2, 3, 4, 5],
    PRICE_RANGES: [
      { min: 0, max: 50 },
      { min: 50, max: 100 },
      { min: 100, max: 500 },
    ],
  },
  
  USERS: {
    SAMPLE_IDS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    LOGIN_CREDENTIALS: {
      email: "john@mail.com",
      password: "changeme"
    },
  },
  
  CATEGORIES: {
    SAMPLE_IDS: [1, 2, 3, 4, 5],
  },
  
  NEW_PRODUCT: {
    title: "Performance Test Product",
    description: "A product created during performance testing",
    price: 99.99,
    categoryId: 1,
    images: ["https://via.placeholder.com/640x480?text=Test+Product"]
  },
  
  NEW_USER: {
    name: "Test User",
    email: "testuser@mail.com",
    password: "testpassword123",
    avatar: "https://via.placeholder.com/150x150?text=Test+User"
  },
  
  NEW_CATEGORY: {
    name: "Test Category",
    image: "https://via.placeholder.com/640x480?text=Test+Category"
  }
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