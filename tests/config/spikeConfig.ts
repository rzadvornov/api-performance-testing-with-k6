import { calculateTotalMinutes, calculateMaximum } from "../../utilities/utils";
import { TEST_CONFIG } from "./config";
import { SpikeTestConfig } from "./types/spikeTestConfig";
type ScenarioKey = keyof typeof SCENARIO_DEFINITIONS;

const SCENARIO_DEFINITIONS = {
  casualBrowsing: {
    weight: 30, 
    enabled: true,
    description: "Normal, slow user browsing",
  },
  productSearch: {
    weight: 40, 
    enabled: true,
    description: "Normal search and category checks",
  },
  categoryExploration: {
    weight: 30, 
    enabled: true,
    description: "Normal category deep dive",
  },
  flashSaleTraffic: {
    weight: 0, 
    enabled: true,
    description: "Users rushing popular products",
  },
  viralContentAccess: {
    weight: 0, 
    enabled: true,
    description: "Sudden surge to specific viral content",
  },
  botLikeActivity: {
    weight: 0, 
    enabled: true,
    description: "Rapid, automated-looking sequential requests",
  },
  concurrentCheckout: {
    weight: 0, 
    enabled: true,
    description: "Users attempting simultaneous checkouts (auth stress)",
  },
  socialMediaRush: {
    weight: 0, 
    enabled: true,
    description: "Traffic from social media links (mixed endpoints)",
  },
  apiHammering: {
    weight: 0, 
    enabled: true,
    description: "Aggressive sequential requests to test rate limiting",
  },
};

const BASELINE_NAMES = [
  "casualBrowsing",
  "productSearch",
  "categoryExploration",
];

const HIGH_LOAD_SCENARIO_COUNT =
  Object.keys(SCENARIO_DEFINITIONS).length - BASELINE_NAMES.length;

const TOTAL_BASELINE_WEIGHT = BASELINE_NAMES.reduce(
  (sum, name) => sum + SCENARIO_DEFINITIONS[name as ScenarioKey].weight,
  0
);

const TOTAL_HIGH_LOAD_WEIGHT = 100 - TOTAL_BASELINE_WEIGHT;

export const SPIKE_CONFIG: SpikeTestConfig = {
  stages: TEST_CONFIG.SPIKE_TEST.stages,
  thresholds: TEST_CONFIG.SPIKE_TEST.thresholds,
  duration: {
    totalMinutes: calculateTotalMinutes(TEST_CONFIG.SPIKE_TEST.stages),
    spikeLoadMinutes: calculateMaximum(TEST_CONFIG.SPIKE_TEST.stages),
  },
  thinkTime: {
    min: 1.0,
    max: 3.0,
    spikeMin: 0.1,
    spikeMax: 0.4,
  },
  logging: {
    iterationInterval: 25,
  },
  SPIKE_START_MINUTE: 1,
  SPIKE_END_MINUTE: 5,
  BASELINE_SCENARIO_NAMES: BASELINE_NAMES,
  HIGH_LOAD_SCENARIO_COUNT: HIGH_LOAD_SCENARIO_COUNT,
  TOTAL_BASELINE_WEIGHT: TOTAL_BASELINE_WEIGHT,
  TOTAL_HIGH_LOAD_WEIGHT: TOTAL_HIGH_LOAD_WEIGHT,
  scenarios: SCENARIO_DEFINITIONS,
};