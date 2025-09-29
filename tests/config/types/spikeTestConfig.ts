import { BaseTestConfig } from "./baseTestConfig";

export interface SpikeTestConfig extends BaseTestConfig {
  BASELINE_SCENARIO_NAMES: string[];
  SPIKE_START_MINUTE: number;
  SPIKE_END_MINUTE: number;
  HIGH_LOAD_SCENARIO_COUNT: number;
  TOTAL_BASELINE_WEIGHT: number;
  TOTAL_HIGH_LOAD_WEIGHT: number;
}
