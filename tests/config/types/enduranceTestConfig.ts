import { ScenarioConfig } from "./scenarioConfig";
import { StageConfig } from "./stageConfig";
import { ThresholdConfig } from "./thresholdConfig";

export interface EnduranceTestConfig {
  stages: StageConfig[];
  thresholds: ThresholdConfig;
  duration: {
    totalMinutes: number;
    sustainedLoadMinutes: number;
  };
  scenarios: {
    [key: string]: ScenarioConfig;
  };
  thinkTime: {
    min: number;
    max: number;
  };
  logging: {
    iterationInterval: number;
  };
}
