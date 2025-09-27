import { calculateTotalMinutes, calculateMaximum } from "../../utilities/utils";
import { TEST_CONFIG } from "./config";
import { StressTestConfig } from "./types/stressTestConfig";

type ScenarioKey = keyof typeof SCENARIO_DEFINITIONS;

// Define scenarios and their constant weights for sustained stress.
const SCENARIO_DEFINITIONS = {
  rapidFireRequests: {
    weight: 20,
    enabled: true,
    description: "Rapid, sequential requests for popular products.",
  },
  heavyDataRetrieval: {
    weight: 25,
    enabled: true,
    description: "Requests for large datasets and batch lookups.",
  },
  concurrentCrudOperations: {
    weight: 20,
    enabled: true,
    description: "Simultaneous creation, update, and deletion of resources.",
  },
  authenticatedHeavyLoad: {
    weight: 15,
    enabled: true,
    description: "Login and subsequent heavy profile/user data retrieval.",
  },
  mixedWorkload: {
    weight: 10,
    enabled: true,
    description: "Mix of read and write operations.",
  },
  resourceExhaustion: {
    weight: 10,
    enabled: true,
    description: "Testing system limits with extremely large/complex queries.",
  },
};

// Assuming TEST_CONFIG.STRESS_TEST exists in a file like ./config.ts
// We'll calculate total minutes based on the stages defined there.
const STRESS_TEST_STAGES = TEST_CONFIG.STRESS_TEST.stages;

export const STRESS_CONFIG: StressTestConfig = {
  stages: STRESS_TEST_STAGES,
  thresholds: TEST_CONFIG.STRESS_TEST.thresholds,
  duration: {
    totalMinutes: calculateTotalMinutes(STRESS_TEST_STAGES),
    // Maximum VUs duration is the focus of a stress test's "constant load" phase
    constantLoadMinutes: calculateMaximum(STRESS_TEST_STAGES),
  },
  // Aggressive, minimal think time to maximize concurrent requests
  thinkTime: {
    min: 0.1,
    max: 0.6,
  },
  logging: {
    iterationInterval: 50,
  },
  scenarios: SCENARIO_DEFINITIONS,
};
