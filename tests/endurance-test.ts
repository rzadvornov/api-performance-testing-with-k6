import { Options } from "k6/options";
import { FakeStoreAPI } from "../api/FakeStoreAPI";
import { TEST_CONFIG, TEST_DATA } from "./config/config";
import {
  delay,
  getRandomInt,
  selectWeightedScenario,
} from "../utilities/utils";
import { ENDURANCE_CONFIG } from "./config/enduranceConfig";
import { TeardownData, WeightedScenario } from "./config/types/commonTypesConfig";
export { handleSummary } from "../reporter/k6-summary";

type ValidScenarioName = Extract<
  keyof typeof ENDURANCE_CONFIG.scenarios,
  string
>;

const scenarioFunctions: Record<ValidScenarioName, Function> = {
  regularUserActivity: regularUserActivity,
  periodicMaintenanceSimulation: periodicMaintenanceSimulation,
  longTermBrowsingSession: longTermBrowsingSession,
  authenticatedUserSession: authenticatedUserSession,
  backgroundDataProcessing: backgroundDataProcessing,
  cacheWarmupActivity: cacheWarmupActivity,
  memoryStressPatterns: memoryStressPatterns,
};

const dynamicWeights: Partial<
  Record<ValidScenarioName, (runningTime: number) => number>
> = {
  cacheWarmupActivity: (runningTime: number) => (runningTime > 10 ? 10 : 0),
  memoryStressPatterns: (runningTime: number) => (runningTime > 20 ? 10 : 0),
};

export const options: Options = {
  stages: TEST_CONFIG.ENDURANCE_TEST.stages,
  thresholds: TEST_CONFIG.ENDURANCE_TEST.thresholds,
  tags: {
    test_type: "endurance_test",
  },
};

const weightedScenarios: WeightedScenario[] = (
  Object.keys(ENDURANCE_CONFIG.scenarios) as ValidScenarioName[]
)
  .filter((scenarioName) => ENDURANCE_CONFIG.scenarios[scenarioName].enabled)
  .map((scenarioName) => {
    const config = ENDURANCE_CONFIG.scenarios[scenarioName];

    return {
      name: scenarioName,
      func: scenarioFunctions[scenarioName],
      weight: config.weight,
      dynamicWeight: dynamicWeights[scenarioName],
    };
  });

// Global counters for endurance tracking
const api = new FakeStoreAPI();
let iterationCount = 0;
let sessionStartTime = Date.now();

export function setup(): TeardownData {
  console.log("⏰ Starting Endurance Test for Fake Store API");
  console.log("📊 Test Configuration:");
  console.log(
    `   - Virtual Users: ${TEST_CONFIG.ENDURANCE_TEST.stages
      .map((s) => s.target)
      .join(" → ")}`
  );
  console.log(`   - Total Duration: 44 minutes`);
  console.log(`   - Sustained Load Duration: 40 minutes`);
  console.log("   - Focus: Long-term stability and performance consistency");

  return {
    startTime: new Date().toISOString(),
    expectedIterations: 0,
  };
}

export default function () {
  iterationCount++;
  const currentTime = Date.now();
  const runningTime = Math.floor((currentTime - sessionStartTime) / 1000 / 60);

  if (iterationCount % 50 === 0) {
    console.log(
      `⏰ Endurance Test Progress: ${runningTime} minutes, ${iterationCount} iterations completed`
    );
  }

  // Weighted scenario selection for realistic long-term patterns
  const scenario = selectWeightedScenario(weightedScenarios, runningTime);
  scenario(runningTime, iterationCount);

  delay(ENDURANCE_CONFIG.thinkTime.min, ENDURANCE_CONFIG.thinkTime.max);
}

function regularUserActivity(_runningTime: number, iteration: number) {
  api.products.getAllProducts(
    Math.floor(Math.random() * 50),
    getRandomInt(10, 20)
  );
  delay(0.3);

  // Product detail viewing
  const productId =
    TEST_DATA.PRODUCTS.SAMPLE_IDS[
      Math.floor(Math.random() * TEST_DATA.PRODUCTS.SAMPLE_IDS.length)
    ];
  api.products.getProductById(productId);
  delay(0.5);

  // Category browsing
  if (iteration % 3 === 0) {
    const categoryId =
      TEST_DATA.CATEGORIES.SAMPLE_IDS[
        Math.floor(Math.random() * TEST_DATA.CATEGORIES.SAMPLE_IDS.length)
      ];
    api.categories.getProductsByCategory(categoryId, 0, 15);
    delay(0.4);
  }
}

function periodicMaintenanceSimulation(
  _runningTime: number,
  iteration: number
) {
  api.products.getAllProducts(0, 1); // Quick health check
  api.users.getAllUsers(0, 1); // User system check
  api.categories.getAllCategories(0, 5); // Category system check
  delay(0.2);

  if (iteration % 100 === 0) {
    console.log(`🔧 Maintenance check at iteration ${iteration}`);

    api.products.getProductsBatch([1, 2, 3, 4, 5]);
    api.users.getUsersBatch([1, 2, 3]);
    api.categories.getCategoriesBatch([1, 2, 3]);
    delay(0.5);
  }
}

function longTermBrowsingSession(_runningTime: number, _iteration: number) {
  const sessionActivities = [
    // Product exploration
    () => {
      api.products.getAllProducts(Math.floor(Math.random() * 100), 15);
      delay(0.4);
    },
    // Search activity
    () => {
      const searchTerms = ["phone", "computer", "clothes", "electronics"];
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      api.products.searchProducts(term);
      delay(0.3);
    },
    // Price comparison
    () => {
      const priceRange =
        TEST_DATA.PRODUCTS.PRICE_RANGES[
          Math.floor(Math.random() * TEST_DATA.PRODUCTS.PRICE_RANGES.length)
        ];
      api.products.getProductsByPriceRange(priceRange.min, priceRange.max);
      delay(0.4);
    },
  ];

  const activityCount = getRandomInt(2, 3);
  for (let i = 0; i < activityCount; i++) {
    const activity =
      sessionActivities[Math.floor(Math.random() * sessionActivities.length)];
    activity();
  }
}

function authenticatedUserSession(_runningTime: number, iteration: number) {
  try {
    if (iteration % 20 === 0 || !api.auth.isAuthenticated()) {
      api.auth.login(TEST_DATA.USERS.LOGIN_CREDENTIALS);
      delay(0.2);
    }

    if (api.auth.isAuthenticated()) {
      api.auth.getProfile();
      delay(0.3);

      // User-specific browsing
      api.products.getAllProducts(0, 12);
      delay(0.4);

      // Periodic logout and re-login to test session management
      if (iteration % 50 === 0) {
        api.auth.logout();
        delay(0.1);
      }
    }
  } catch (error) {
    console.log(`Auth session error at iteration ${iteration}: ${error}`);
  }
}

function backgroundDataProcessing(_runningTime: number, _iteration: number) {
  // Simulate background processes that might run continuously
  const backgroundTasks = [
    // Data synchronization simulation
    () => {
      for (let i = 0; i < 5; i++) {
        api.products.getProductById(i + 1);
      }
    },
    // Cache warming simulation
    () => {
      api.categories.getAllCategories();
      api.products.getAllProducts(0, 20);
    },
    // System monitoring simulation
    () => {
      api.users.getAllUsers(0, 5);
      api.products.getAllProducts(0, 5);
      api.categories.getAllCategories(0, 3);
    },
  ];

  const task =
    backgroundTasks[Math.floor(Math.random() * backgroundTasks.length)];
  task();
  delay(0.15);
}

function cacheWarmupActivity(_runningTime: number, iteration: number) {
  api.products.getAllProducts(0, 10);
  api.categories.getAllCategories(0, 5);
  api.products.getProductById(1);
  api.products.getProductById(2);
  delay(0.1);

  if (iteration % 30 === 0) {
    // Warm up popular products
    for (let i = 1; i <= 10; i++) {
      api.products.getProductById(i);
    }
    // Warm up category data
    for (const categoryId of TEST_DATA.CATEGORIES.SAMPLE_IDS) {
      api.categories.getCategoryById(categoryId);
    }
    delay(0.3);
  }
}

function memoryStressPatterns(_runningTime: number, _iteration: number) {
  // Large data requests
  api.products.getAllProducts(0, 50);
  delay(0.2);

  // Rapid object creation/destruction simulation
  for (let i = 0; i < 10; i++) {
    api.products.getProductById(
      TEST_DATA.PRODUCTS.SAMPLE_IDS[i % TEST_DATA.PRODUCTS.SAMPLE_IDS.length]
    );
  }
  delay(0.3);

  // Complex filtering operations
  for (const priceRange of TEST_DATA.PRODUCTS.PRICE_RANGES) {
    api.products.getProductsByPriceRange(priceRange.min, priceRange.max);
    delay(0.1);
  }
}

export function teardown(data: TeardownData) {
  const endTime = new Date();
  const duration = Math.floor((Date.now() - sessionStartTime) / 1000 / 60);

  console.log("⏰ Endurance Test completed");
  console.log(`   - Started: ${data.startTime}`);
  console.log(`   - Ended: ${endTime.toISOString()}`);
  console.log(`   - Total Duration: ${duration} minutes`);
  console.log(`   - Total Iterations: ${iterationCount}`);

  console.log("📈 Analyze results for long-term stability");
  console.log("🔍 Key endurance metrics to evaluate:");
  console.log("   - Response time consistency over duration");
  console.log("   - Memory usage growth patterns");
  console.log("   - Error rate stability");
  console.log("   - Resource cleanup effectiveness");
  console.log("   - Performance degradation trends");
  console.log("   - System recovery after extended load");
  console.log("   - Database connection pool behavior");
  console.log("   - Cache effectiveness over time");
}
