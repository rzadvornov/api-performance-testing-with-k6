import { Options } from "k6/options";
import { FakeStoreAPI } from "../api/FakeStoreAPI";
import { getRandomInt, delay, selectWeightedScenario } from "../utilities/utils";
import { TEST_CONFIG, TEST_DATA } from "./config/config";
import { STRESS_CONFIG } from "./config/stressConfig";
import { TeardownData } from "./config/types/tearDownData";
import { WeightedScenario } from "./config/types/weightedScenario";
import http, { RefinedResponse } from "k6/http";

type ValidScenarioName = Extract<keyof typeof STRESS_CONFIG.scenarios, string>;

const scenarioFunctions: Record<ValidScenarioName, Function> = {
    rapidFireRequests: rapidFireRequests,
    heavyDataRetrieval: heavyDataRetrieval,
    concurrentCrudOperations: concurrentCrudOperations,
    authenticatedHeavyLoad: authenticatedHeavyLoad,
    mixedWorkload: mixedWorkload,
    resourceExhaustion: resourceExhaustion,
};

const weightedScenarios: WeightedScenario[] = (Object.keys(STRESS_CONFIG.scenarios) as ValidScenarioName[])
  .map(scenarioName => {
    const config = STRESS_CONFIG.scenarios[scenarioName]; 
    
    return {
      name: scenarioName,
      func: scenarioFunctions[scenarioName],
      weight: config.weight,
    };
  });

export const options: Options = {
  stages: TEST_CONFIG.STRESS_TEST.stages,
  thresholds: TEST_CONFIG.STRESS_TEST.thresholds,
  tags: {
    test_type: "stress_test",
  },
};

// Global variables for stress tracking
const api = new FakeStoreAPI();
let iterationCount = 0;
let sessionStartTime = Date.now();


function rapidFireRequests() {
  for (let i = 0; i < 5; i++) {
    const productId =
      TEST_DATA.PRODUCTS.SAMPLE_IDS[
        getRandomInt(0, TEST_DATA.PRODUCTS.SAMPLE_IDS.length - 1)
      ];
    api.products.getProductById(productId);
  }

  delay(0.1);

  api.products.getAllProducts(0, 50);
  api.products.getAllProducts(50, 50);
  api.products.getAllProducts(100, 50);
}

function heavyDataRetrieval() {
  // Request large datasets
  api.products.getAllProducts(0, 100); 
  delay(0.2); 

  const batchIds = TEST_DATA.PRODUCTS.SAMPLE_IDS;
  // Assuming a batch method exists to hit multiple endpoints quickly
  api.products.getProductsBatch(batchIds); 
  delay(0.2);

  for (const id of TEST_DATA.CATEGORIES.SAMPLE_IDS) {
    api.categories.getProductsByCategory(id, 0, 50);
  }
}

function concurrentCrudOperations() {
  try {
    const createdProducts: RefinedResponse<http.ResponseType | undefined>[] = [];

    // Create operations
    for (let i = 0; i < 3; i++) {
      const productData = {
        ...TEST_DATA.NEW_PRODUCT,
        title: `${TEST_DATA.NEW_PRODUCT.title} ${Date.now()}_${i}`,
        price: getRandomInt(10, 210), 
      };
      
      const response = api.products.createProduct(productData);
      createdProducts.push(response);
    }

    delay(0.1);

    // Update operations on created products
    for (const response of createdProducts) {
      const productJson = response && response.json ? (response.json() as { id?: number }) : null;

      if (productJson && typeof productJson.id === 'number') {
        api.products.patchProduct(productJson.id, {
          price: getRandomInt(20, 320),
        });
      }
    }

    delay(0.1);

    // Cleanup - delete created products
    for (const response of createdProducts) {
      const productJson = response && response.json ? (response.json() as { id?: number }) : null;

      if (productJson && typeof productJson.id === 'number') {
        api.products.deleteProduct(productJson.id);
      }
    }
  } catch (error) {
    console.log(`CRUD operations error: ${error}`);
  }
}

function authenticatedHeavyLoad() {
  try {
    api.auth.login(TEST_DATA.USERS.LOGIN_CREDENTIALS);

    if (api.auth.isAuthenticated()) {
      for (let i = 0; i < 10; i++) {
        api.auth.getProfile();
      }

      delay(0.1);

      api.users.getAllUsers(0, 100);

      for (const id of TEST_DATA.USERS.SAMPLE_IDS) {
        api.users.getUserById(id);
      }

      api.auth.logout();
    }
  } catch (error) {
    console.log(`Authenticated heavy load error: ${error}`);
  }
}

function mixedWorkload() {
  const operations = [
    // Read operations
    () => api.products.getAllProducts(getRandomInt(0, 99), 25),
    () =>
      api.products.getProductById(
        TEST_DATA.PRODUCTS.SAMPLE_IDS[
          getRandomInt(0, TEST_DATA.PRODUCTS.SAMPLE_IDS.length - 1)
        ]
      ),
    () => api.categories.getAllCategories(),
    () => api.users.getAllUsers(getRandomInt(0, 49), 20),

    // Write operations
    () =>
      api.products.createProduct({
        ...TEST_DATA.NEW_PRODUCT,
        title: `Stress Test Product ${Date.now()}`,
        price: getRandomInt(0, 1000),
      }),
    () =>
      api.users.createUser({
        ...TEST_DATA.NEW_USER,
        email: `stress_${Date.now()}@test.com`,
        name: `Stress User ${Date.now()}`,
      }),
  ];

  const operationCount = getRandomInt(3, 5);
  for (let i = 0; i < operationCount; i++) {
    const op = operations[getRandomInt(0, operations.length - 1)];
    op();
  }
}

function resourceExhaustion() {
  try {
    // Large pagination requests
    for (let i = 0; i < 5; i++) {
      api.products.getAllProducts(i * 200, 200);
    }

    // Complex filtering requests (assuming the API supports filtering by price range)
    for (const range of TEST_DATA.PRODUCTS.PRICE_RANGES) {
      api.products.getProductsByPriceRange(range.min, range.max);
    }
  } catch (error) {
    console.log(`Resource exhaustion scenario error: ${error}`);
  }
}

export function setup(): TeardownData {
  const constantLoadDuration = STRESS_CONFIG.duration.constantLoadMinutes;
  
  console.log("🔥 Starting Stress Test for Fake Store API");
  console.log("📊 Test Configuration:");
  console.log(
    `   - Virtual Users: ${STRESS_CONFIG.stages
      .map((s) => s.target)
      .join(" → ")}`
  );
  console.log(
    `   - Target Load Duration: ${constantLoadDuration} minutes (Max VUs)`
  );
  console.log("   - Testing system limits and potential breaking points");

  return {
    startTime: new Date().toISOString(),
    expectedIterations: 0,
  };
}

export default function () {
  iterationCount++;
  const currentTime = Date.now();
  const runningTime = Math.floor((currentTime - sessionStartTime) / 1000 / 60);

  if (iterationCount % STRESS_CONFIG.logging.iterationInterval === 0) {
    console.log(
      `🔥 Stress Test Progress: ${runningTime} minutes, ${iterationCount} iterations completed.`
    );
  }

  const scenario = selectWeightedScenario(weightedScenarios, runningTime);
  (scenario as Function)(); // Execute the selected aggressive scenario

  delay(STRESS_CONFIG.thinkTime.min, STRESS_CONFIG.thinkTime.max);
}

export function teardown(data: TeardownData) {
  const endTime = new Date();
  const duration = Math.floor((Date.now() - sessionStartTime) / 1000 / 60);

  console.log("🔥 Stress Test completed");
  console.log(`   - Started: ${data.startTime}`);
  console.log(`   - Ended: ${endTime.toISOString()}`);
  console.log(`   - Total Duration: ${duration} minutes`);
  console.log(`   - Total Iterations: ${iterationCount}`);

  console.log("📈 Analyze results for system breaking points and recovery behavior");
  console.log("🔍 Key metrics to check:");
  console.log("   - Max error rate before failure");
  console.log("   - Max concurrent users/requests handled");
  console.log("   - Resource utilization (CPU, memory) at peak load");
}