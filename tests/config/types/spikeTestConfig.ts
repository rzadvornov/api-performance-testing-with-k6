import { Logging } from "./logging";
import { ScenarioConfig } from "./scenarioConfig";
import { StageConfig } from "./stageConfig";
import { ThresholdConfig } from "./thresholdConfig";

export interface SpikeTestConfig {
  stages: StageConfig[];
  thresholds: ThresholdConfig;
  duration: {
    totalMinutes: number;
    spikeLoadMinutes: number;
  };
  thinkTime: {
    baselineMin: number;
    baselineMax: number;
    spikeMin: number;
    spikeMax: number;
  };
  BASELINE_SCENARIO_NAMES: string[];
  SPIKE_START_MINUTE: number;
  SPIKE_END_MINUTE: number;
  HIGH_LOAD_SCENARIO_COUNT: number;
  TOTAL_BASELINE_WEIGHT: number;
  TOTAL_HIGH_LOAD_WEIGHT: number;
  logging: Logging;
  scenarios: {
    [key: string]: ScenarioConfig;
  };
}
