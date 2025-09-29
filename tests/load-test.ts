import { Options } from "k6/options";
import { TEST_CONFIG, TEST_DATA } from "./config/config";
import { FakeStoreAPI } from "../api/FakeStoreAPI";
import { delay, getRandomInt, weightedRandom } from "../utilities/utils";
import { LOAD_CONFIG } from "./config/loadConfig";
import { TeardownData, WeightedScenario } from "./config/types/commonTypesConfig";
export { handleSummary } from "../reporter/k6-summary";

type ValidScenarioName = keyof typeof LOAD_CONFIG.scenarios;

const scenarioFunctions: Record<ValidScenarioName, Function> = {
  browseCatalog: browseCatalog,
  searchAndFilter: searchAndFilter,
  viewProductDetails: viewProductDetails,
  userManagement: userManagement,
  categoryBrowsing: categoryBrowsing,
  authenticationFlow: authenticationFlow,
};

const weightedScenarios: WeightedScenario[] = (
  Object.keys(LOAD_CONFIG.scenarios) as ValidScenarioName[]
)
  .filter((name) => LOAD_CONFIG.scenarios[name].enabled)
  .map((scenarioName) => ({
    name: scenarioName as string,
    func: scenarioFunctions[scenarioName],
    weight: LOAD_CONFIG.scenarios[scenarioName].weight,
    dynamicWeight: (_runningTime: number) =>
      LOAD_CONFIG.scenarios[scenarioName].weight,
  }));

export const options: Options = {
  stages: TEST_CONFIG.LOAD_TEST.stages,
  thresholds: TEST_CONFIG.LOAD_TEST.thresholds,
  tags: {
    test_type: "load_test",
  },
};

// Global counters for load tracking
const api = new FakeStoreAPI();
let iterationCount = 0;
let sessionStartTime = Date.now();

export function setup(): TeardownData {
  console.log("🚀 Starting Load Test for Fake Store API");
  console.log("📊 Test Configuration:");
  console.log(
    `   - Virtual Users: ${LOAD_CONFIG.stages.map((s) => s.target).join(" → ")}`
  );
  console.log(
    `   - Duration: ${LOAD_CONFIG.stages.map((s) => s.duration).join(" → ")}`
  );
  console.log("   - Expected load patterns under normal conditions");

  return {
    startTime: new Date().toISOString(),
    expectedIterations: 0,
  };
}

function browseCatalog(_runningTime: number) {
  api.products.getAllProducts(0, 20);
  delay(0.5);

  api.products.getAllProducts(20, 20);
  delay(0.3);

  api.products.getAllProducts(40, 20);
  delay(0.2);
}

function searchAndFilter(_runningTime: number) {
  api.products.searchProducts("shirt");
  delay(0.4);

  const priceRangeIndex = getRandomInt(
    0,
    TEST_DATA.PRODUCTS.PRICE_RANGES.length - 1
  );
  const priceRange = TEST_DATA.PRODUCTS.PRICE_RANGES[priceRangeIndex];
  api.products.getProductsByPriceRange(priceRange.min, priceRange.max);
  delay(0.3);

  const categoryIndex = getRandomInt(
    0,
    TEST_DATA.PRODUCTS.CATEGORIES.length - 1
  );
  const categoryId = TEST_DATA.PRODUCTS.CATEGORIES[categoryIndex];
  api.products.getProductsByCategory(categoryId);
  delay(0.2);
}

function viewProductDetails(_runningTime: number) {
  api.products.getAllProducts(0, 10);
  delay(0.2);

  const productIds = TEST_DATA.PRODUCTS.SAMPLE_IDS.slice(0, 3);
  for (const productId of productIds) {
    api.products.getProductById(productId);
    delay(0.5);
  }
}

function userManagement(_runningTime: number) {
  api.users.getAllUsers(0, 10);
  delay(0.3);

  const userIdIndex = getRandomInt(0, TEST_DATA.USERS.SAMPLE_IDS.length - 1);
  const userId = TEST_DATA.USERS.SAMPLE_IDS[userIdIndex];
  api.users.getUserById(userId);
  delay(0.4);

  const testEmail = `test${getRandomInt(0, 999)}@example.com`;
  api.users.checkEmailAvailability(testEmail);
  delay(0.2);
}

function categoryBrowsing(_runningTime: number) {
  api.categories.getAllCategories();
  delay(0.3);

  const categoryIdIndex = getRandomInt(
    0,
    TEST_DATA.CATEGORIES.SAMPLE_IDS.length - 1
  );
  const categoryId = TEST_DATA.CATEGORIES.SAMPLE_IDS[categoryIdIndex];

  api.categories.getCategoryById(categoryId);
  delay(0.2);

  api.categories.getProductsByCategory(categoryId, 0, 15);
  delay(0.4);
}

function authenticationFlow(_runningTime: number) {
  try {
    api.auth.login(TEST_DATA.USERS.LOGIN_CREDENTIALS);
    delay(0.5);

    if (api.auth.isAuthenticated()) {
      api.auth.getProfile();
      delay(0.3);

      api.auth.logout();
    }
  } catch (error) {
    console.log(`Authentication flow error: ${error}`);
  }
  delay(0.2);
}

export default function () {
  iterationCount++;
  const currentTime = Date.now();
  const runningTime = Math.floor((currentTime - sessionStartTime) / 1000 / 60);

  if (iterationCount % LOAD_CONFIG.logging.iterationInterval === 0) {
    console.log(
      `📊 Load Test Progress: ${runningTime} minutes, ${iterationCount} iterations completed.`
    );
  }

  const scenario = weightedRandom(weightedScenarios);
  scenario.func(runningTime);

  delay(LOAD_CONFIG.thinkTime.min, LOAD_CONFIG.thinkTime.max);
}

export function teardown(data: TeardownData) {
  const endTime = new Date();
  const duration = Math.floor((Date.now() - sessionStartTime) / 1000 / 60);

  console.log("✅ Load Test completed");
  console.log(`   - Started: ${data.startTime}`);
  console.log(`   - Ended: ${endTime.toISOString()}`);
  console.log(`   - Total Duration: ${duration} minutes`);
  console.log(`   - Total Iterations: ${iterationCount}`);
  console.log("📈 Check the test results for performance metrics");
}
