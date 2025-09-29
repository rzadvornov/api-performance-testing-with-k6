import { Logging } from "./logging";
import { StageConfig } from "./stageConfig";
import { ThresholdConfig } from "./thresholdConfig";

export interface LoadTestConfig {
  stages: StageConfig[];
  thresholds: ThresholdConfig;
  duration: {
    totalMinutes: number;
  };
  thinkTime: {
    min: number;
    max: number;
  };
  logging: Logging;
  scenarios: {
    [key: string]: {
      weight: number;
      enabled: boolean;
      description: string;
    };
  };
}