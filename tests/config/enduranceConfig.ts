import { calculateTotalMinutes, calculateMaximum } from "../../utilities/utils";
import { TEST_CONFIG } from "./config";
import { EnduranceTestConfig } from "./types/enduranceTestConfig";

export const ENDURANCE_CONFIG: EnduranceTestConfig = {
  stages: TEST_CONFIG.ENDURANCE_TEST.stages,
  thresholds: TEST_CONFIG.ENDURANCE_TEST.thresholds,
  duration: {
    totalMinutes: calculateTotalMinutes(TEST_CONFIG.ENDURANCE_TEST.stages),
    sustainedLoadMinutes: calculateMaximum(TEST_CONFIG.ENDURANCE_TEST.stages),
  },
  thinkTime: {
    min: 0.5,
    max: 2.0,
  },
  logging: {
    iterationInterval: 50,
  },
  scenarios: {
    regularUserActivity: {
      weight: 70,
      enabled: true,
      description: "Typical browsing patterns",
    },
    periodicMaintenanceSimulation: {
      weight: 5,
      enabled: true,
      description: "System maintenance activities",
    },
    longTermBrowsingSession: {
      weight: 15,
      enabled: true,
      description: "Extended user interaction",
    },
    authenticatedUserSession: {
      weight: 8,
      enabled: true,
      description: "Logged-in user activities",
    },
    backgroundDataProcessing: {
      weight: 2,
      enabled: true,
      description: "Automated system operations",
    },
    cacheWarmupActivity: {
      weight: 10,
      enabled: true,
      description: "Keep frequently accessed data warm",
    },
    memoryStressPatterns: {
      weight: 0, // Disabled by default, can be enabled for specific tests
      enabled: false,
      description: "Operations that might cause memory issues",
    },
  },
};
