import { calculateTotalMinutes } from "../../utilities/utils";
import { TEST_CONFIG } from "./config";

const SCENARIO_DEFINITIONS = {
  bulkDataRetrieval: {
    weight: 15, 
    description: "High volume data retrieval (large pages/batches)",
  },
  largePaginationCycles: {
    weight: 15, 
    description: "Deep, continuous paging and offsetting requests",
  },
  comprehensiveDataSweep: {
    weight: 15, 
    description: "Retrieving data by multiple criteria (batches, categories, ranges)",
  },
  bulkCreationOperations: {
    weight: 10, 
    description: "Heavy write operations (bulk product/user creation and cleanup)",
  },
  dataMiningSimulation: {
    weight: 10, 
    description: "Complex search/filter queries across price and categories",
  },
  archivalDataAccess: {
    weight: 10, 
    description: "Accessing older/less-cached data (high ID access and deep pagination)",
  },
  massDataExportSimulation: {
    weight: 15, 
    description: "Sequentially accessing all data in chunks to simulate an export",
  },
  continuousDataStreaming: {
    weight: 10, 
    description: "High-frequency, low-latency small requests mimicking a continuous feed",
  },
};

export const VOLUME_CONFIG = {
  stages: TEST_CONFIG.VOLUME_TEST.stages,
  thresholds: TEST_CONFIG.VOLUME_TEST.thresholds,
  duration: {
    totalMinutes: calculateTotalMinutes(TEST_CONFIG.VOLUME_TEST.stages),
  },
  thinkTime: {
    min: 0.1,
    max: 0.4,
  },
  logging: {
    iterationInterval: 50, 
  },
  scenarios: SCENARIO_DEFINITIONS,
};