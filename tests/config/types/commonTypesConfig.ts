export interface DurationConfig {
  totalMinutes: number;
  sustainedLoadMinutes?: number;
  spikeLoadMinutes?: number;
  constantLoadMinutes?: number;
}

export interface LoggingConfig {
    iterationInterval: number;
}

export interface PhaseWeightConfig<T extends string> {
  phaseStartMinute: number;
  phaseEndMinute: number;
  scenarioConfigs: Record<T, { weight: number }>;
  totalHighLoadWeight: number;
  highLoadScenarioCount: number;
}

export interface ScenarioConfig {
  weight: number;
  enabled: boolean;
  description: string;
}

export interface StageConfig {
  duration: string;
  target: number;
}

export interface TeardownData {
  startTime: string;
  expectedIterations: number;
}

export interface ThinkTimeConfig {
  min: number;
  max: number;
  spikeMin?: number;
  spikeMax?: number;
}

export interface ThresholdConfig {
  http_req_duration: string[];
  http_req_failed: string[];
}

export type WeightedScenario = {
  name: string;
  func: Function;
  weight: number;
  dynamicWeight?: (runningTime: number) => number;
};