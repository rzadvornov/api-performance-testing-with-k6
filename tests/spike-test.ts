import { Options } from "k6/options";
import { FakeStoreAPI } from "../api/FakeStoreAPI";
import { TEST_CONFIG, TEST_DATA } from "./config/config";
import { TeardownData } from "./config/types/tearDownData";
import {
  calculatePhaseSpecificWeight,
  delay,
  selectWeightedScenario,
} from "../utilities/utils";
import { WeightedScenario } from "./config/types/weightedScenario";
import { SPIKE_CONFIG } from "./config/spikeConfig";
import { PhaseWeightConfig } from "./config/types/phaseWeightConfig";

type ValidScenarioName = Extract<keyof typeof SPIKE_CONFIG.scenarios, string>;

const scenarioFunctions: Record<ValidScenarioName, Function> = {
    casualBrowsing: casualBrowsing,
    productSearch: productSearch,
    categoryExploration: categoryExploration,
    flashSaleTraffic: flashSaleTraffic,
    viralContentAccess: viralContentAccess,
    botLikeActivity: botLikeActivity,
    concurrentCheckout: concurrentCheckout,
    socialMediaRush: socialMediaRush,
    apiHammering: apiHammering,
};

export const options: Options = {
  stages: TEST_CONFIG.SPIKE_TEST.stages,
  thresholds: TEST_CONFIG.SPIKE_TEST.thresholds,
  tags: {
    test_type: "spike_test",
  },
};

const phaseConfig: PhaseWeightConfig<ValidScenarioName> = {
  phaseStartMinute: SPIKE_CONFIG.SPIKE_START_MINUTE,
  phaseEndMinute: SPIKE_CONFIG.SPIKE_END_MINUTE,
  scenarioConfigs: SPIKE_CONFIG.scenarios as Record<
    ValidScenarioName,
    { weight: number }
  >,
  totalHighLoadWeight: SPIKE_CONFIG.TOTAL_HIGH_LOAD_WEIGHT,
  highLoadScenarioCount: SPIKE_CONFIG.HIGH_LOAD_SCENARIO_COUNT,
};

const weightedScenarios: WeightedScenario[] = (Object.keys(SPIKE_CONFIG.scenarios) as ValidScenarioName[])
  .map(scenarioName => {
    const config = SPIKE_CONFIG.scenarios[scenarioName]; 
    
    return {
      name: scenarioName,
      func: scenarioFunctions[scenarioName],
      weight: config.weight,
      dynamicWeight: (runningTime: number) =>
        calculatePhaseSpecificWeight(runningTime, scenarioName, phaseConfig),
    };
  });

// Global variables for spike tracking
const api = new FakeStoreAPI();
let iterationCount = 0;
let sessionStartTime = Date.now();

function casualBrowsing(_runningTime: number) {
  api.products.getAllProducts(0, 10);
  delay(0.5);

  const productId =
    TEST_DATA.PRODUCTS.SAMPLE_IDS[
      Math.floor(Math.random() * TEST_DATA.PRODUCTS.SAMPLE_IDS.length)
    ];
  api.products.getProductById(productId);
  delay(0.8);
}

function productSearch(_runningTime: number) {
  api.products.searchProducts("phone");
  delay(0.4);

  api.categories.getAllCategories();
  delay(0.3);
}

function categoryExploration(_runningTime: number) {
  const categoryId =
    TEST_DATA.CATEGORIES.SAMPLE_IDS[
      Math.floor(Math.random() * TEST_DATA.CATEGORIES.SAMPLE_IDS.length)
    ];

  api.categories.getCategoryById(categoryId);
  delay(0.3);

  api.categories.getProductsByCategory(categoryId, 0, 15);
  delay(0.6);
}

function flashSaleTraffic(_runningTime: number) {
  const popularProducts = [1, 2, 3, 4, 5];

  for (const id of popularProducts) {
    api.products.getProductById(id);
  }

  delay(0.1);

  api.products.getAllProducts(0, 20);
  delay(0.1);

  api.categories.getAllCategories();
}

function viralContentAccess(_runningTime: number) {
  const viralProductId = 1;
  const viralCategoryId = 1;

  api.products.getProductById(viralProductId);
  api.products.getProductById(viralProductId);
  api.categories.getProductsByCategory(viralCategoryId, 0, 30);
  api.products.searchProducts("trending");

  delay(0.05);
}

function botLikeActivity(_runningTime: number) {
  const productIds = [1, 2, 3, 4, 5, 6, 7, 8];

  for (const id of productIds) {
    api.products.getProductById(id);
  }

  for (let i = 0; i < 10; i++) {
    api.products.getAllProducts(i * 10, 10);
  }
}

function concurrentCheckout(_runningTime: number) {
  try {
    api.auth.login(TEST_DATA.USERS.LOGIN_CREDENTIALS);

    if (api.auth.isAuthenticated()) {
      for (let i = 0; i < 3; i++) {
        api.auth.getProfile();
      }

      const checkoutProducts = TEST_DATA.PRODUCTS.SAMPLE_IDS.slice(0, 3);
      for (const id of checkoutProducts) {
        api.products.getProductById(id);
      }

      api.auth.logout();
    }
  } catch (error) {
    console.log(`Checkout simulation error: ${error}`);
  }

  delay(0.05);
}

function socialMediaRush(_runningTime: number) {
  const socialMediaProducts = [1, 5, 10];

  for (const id of socialMediaProducts) {
    api.products.getProductById(id);
    api.categories.getCategoryById(1);
    api.products.getAllProducts(0, 5);
  }

  delay(0.08);

  // User registration spike
  try {
    const newUser = {
      ...TEST_DATA.NEW_USER,
      email: `social_${Date.now()}_${Math.random()}@example.com`,
      name: `Social User ${Date.now()}`,
    };
    api.users.createUser(newUser);
  } catch (error) {
    console.log(`Social registration error: ${error}`);
  }
}

function apiHammering(_runningTime: number) {
  try {
    for (let i = 0; i < 20; i++) {
      api.products.getAllProducts(0, 10);
    }
  } catch (error) {
    console.log(`API hammering result: ${error}`);
  }
}

export function setup(): TeardownData {
  console.log("⚡ Starting Spike Test for Fake Store API");
  console.log("📊 Test Configuration:");
  console.log(
    `   - Virtual Users: ${TEST_CONFIG.SPIKE_TEST.stages
      .map((s) => s.target)
      .join(" → ")}`
  );
  console.log(
    `   - Spike Duration: ${SPIKE_CONFIG.duration.spikeLoadMinutes} minutes`
  );
  console.log("   - Testing sudden traffic surge and recovery");

  return {
    startTime: new Date().toISOString(),
    expectedIterations: 0,
  };
}

export default function () {
  iterationCount++;
  const currentTime = Date.now();
  const runningTime = Math.floor((currentTime - sessionStartTime) / 1000 / 60);

  // Calculate if we're in the high load period (based on time)
  const isSpikePeriod = runningTime >= 1 && runningTime < 5;

  if (iterationCount % SPIKE_CONFIG.logging.iterationInterval === 0) {
    console.log(
      `⚡ Spike Test Progress: ${runningTime} minutes, ${iterationCount} iterations completed. Phase: ${
        isSpikePeriod ? "SPIKE" : "BASELINE/RECOVERY"
      }`
    );
  }

  // Weighted scenario selection for adaptive behavior
  const scenario = selectWeightedScenario(weightedScenarios, runningTime);
  scenario(runningTime, iterationCount);

  // Use adaptive think time based on the phase
  if (isSpikePeriod) {
    delay(SPIKE_CONFIG.thinkTime.spikeMin, SPIKE_CONFIG.thinkTime.spikeMax);
  } else {
    delay(
      SPIKE_CONFIG.thinkTime.baselineMin,
      SPIKE_CONFIG.thinkTime.baselineMax
    );
  }
}

export function teardown(data: TeardownData) {
  const endTime = new Date();
  const duration = Math.floor((Date.now() - sessionStartTime) / 1000 / 60);

  console.log("⚡ Spike Test completed");
  console.log(`   - Started: ${data.startTime}`);
  console.log(`   - Ended: ${endTime.toISOString()}`);
  console.log(`   - Total Duration: ${duration} minutes`);
  console.log(`   - Total Iterations: ${iterationCount}`);

  console.log("📈 Analyze results for spike handling and recovery");
  console.log("🔍 Key metrics to check:");
  console.log("   - Response time spikes during load surge");
  console.log("   - Error rates during peak traffic");
  console.log("   - System recovery time after spike");
  console.log("   - Resource utilization patterns");
}
