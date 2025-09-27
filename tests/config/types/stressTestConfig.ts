import { Logging } from "./logging";
import { ScenarioConfig } from "./scenarioConfig";
import { StageConfig } from "./stageConfig";
import { ThresholdConfig } from "./thresholdConfig";

export interface StressTestConfig {
  stages: StageConfig[];
  thresholds: ThresholdConfig;
  duration: {
    totalMinutes: number;
    constantLoadMinutes: number; // Renamed from spikeLoadMinutes
  };
  thinkTime: {
    min: number; // Single definition for all phases
    max: number;
  };
  logging: Logging;
  scenarios: {
    [key: string]: ScenarioConfig;
  };
}