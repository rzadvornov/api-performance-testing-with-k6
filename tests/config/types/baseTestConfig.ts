import { DurationConfig, LoggingConfig, ScenarioConfig, StageConfig, ThinkTimeConfig, ThresholdConfig } from "./commonTypesConfig";

export interface BaseTestConfig {
  stages: StageConfig[];
  thresholds: ThresholdConfig;
  duration: DurationConfig;
  thinkTime: ThinkTimeConfig;
  logging: LoggingConfig;
  scenarios: {
    [key: string]: ScenarioConfig;
  };
}