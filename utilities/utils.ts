import { sleep } from "k6";
import { WeightedScenario } from "../tests/config/types/weightedScenario";
import { PhaseWeightConfig } from "../tests/config/types/phaseWeightConfig";

const conversionFactors: { [key: string]: number } = {
  s: 1 / 60,
  m: 1,
  h: 60,
};

export function delay(minSeconds: number, maxSeconds?: number): void {
  const effectiveMax = maxSeconds ?? minSeconds;

  const min = Math.min(minSeconds, effectiveMax);
  const max = Math.max(minSeconds, effectiveMax);

  const range = max - min;

  sleep(Math.random() * range + min);
}

/**
 * Select scenario based on weighted probability and test duration
 * @param scenarios An array of WeightedScenario objects.
 * @param runningTime The current duration of the test in minutes.
 * @returns The selected scenario function.
 */
export function selectWeightedScenario(
  scenarios: WeightedScenario[],
  runningTime: number
): Function {
  const effectiveWeights = scenarios.map((s) => {
    let weight = s.weight;
    if (s.dynamicWeight) {
      weight += s.dynamicWeight(runningTime);
    }
    return weight;
  });

  const totalWeight = effectiveWeights.reduce((sum, weight) => sum + weight, 0);

  if (totalWeight === 0) {
    return scenarios[0].func;
  }

  const random = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (let i = 0; i < effectiveWeights.length; i++) {
    cumulativeWeight += effectiveWeights[i];
    if (random <= cumulativeWeight) {
      return scenarios[i].func;
    }
  }

  return scenarios[0].func;
}

/**
 * Calculates the dynamic weight for a scenario based on the test's time-based phase
 * (High Load vs. Baseline/Recovery).
 * * @param runningTime The current duration of the test in minutes.
 * @param scenarioName The name of the scenario to calculate the weight for.
 * @param config The PhaseWeightConfig object containing all phase parameters.
 * @returns The effective dynamic weight for the scenario (added to baseWeight).
 */
export function calculatePhaseSpecificWeight<T extends string>(
  runningTime: number,
  scenarioName: T,
  config: PhaseWeightConfig<T> // New single config argument
): number {
  const {
    phaseStartMinute,
    phaseEndMinute,
    scenarioConfigs,
    totalHighLoadWeight,
    highLoadScenarioCount,
  } = config;

  const isHighLoadPhase =
    runningTime >= phaseStartMinute && runningTime < phaseEndMinute;
  const scenarioConfig = scenarioConfigs[scenarioName];

  if (!scenarioConfig) return 0;
  const isBaselineScenario = scenarioConfig.weight > 0;

  // High-Load scenarios are those with weight === 0
  const isHighLoadScenario = scenarioConfig.weight === 0;

  if (isHighLoadPhase) {
    if (isBaselineScenario) {
      return -scenarioConfig.weight;
    }

    if (isHighLoadScenario) {
      if (highLoadScenarioCount === 0) return 0;
      return Math.floor(totalHighLoadWeight / highLoadScenarioCount);
    }
  } else {
    if (isHighLoadScenario) {
      return 0;
    }

    if (isBaselineScenario) {
      return 0;
    }
  }

  return 0;
}

export function calculateTotalMinutes(
  stages: { duration: string; target: number }[]
): number {
  let totalMinutes = 0;

  for (const stage of stages) {
    const { factor, value } = convertValue(stage, conversionFactors);

    if (factor !== undefined) {
      totalMinutes += value * factor;
    } else {
      console.warn(
        `Unsupported or invalid time unit in duration: ${stage.duration}. Skipping stage.`
      );
    }
  }

  return totalMinutes;
}

export function calculateMaximum(
  stages: { duration: string; target: number }[]
): number {
  let durations = [];

  for (const stage of stages) {
    const { factor, value } = convertValue(stage, conversionFactors);

    if (factor !== undefined) {
      durations.push(value * factor);
    } else {
      console.warn(
        `Unsupported or invalid time unit in duration: ${stage.duration}. Skipping stage.`
      );
    }
  }

  return Math.max(...durations);
}

function convertValue(
  stage: { duration: string; target: number },
  conversionFactors: { [key: string]: number }
) {
  const durationStr = stage.duration.toLowerCase();
  const unit = durationStr.slice(-1);
  const value = parseFloat(durationStr);

  const factor = conversionFactors[unit];
  return { factor, value };
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export async function exponentialBackoff<T>(
  operation: () => T,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      return operation();
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }
      await sleep(delay / 1000);
      delay *= 2;
    }
  }
  throw new Error("Max retries exceeded");
}

export function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const random = Math.random() * totalWeight;

  let weightSum = 0;
  for (const item of items) {
    weightSum += item.weight;
    if (random <= weightSum) {
      return item;
    }
  }

  return items[items.length - 1]; // Fallback
}

export function executeWithProbability(
  probability: number,
  callback: () => void
): boolean {
  if (Math.random() < probability) {
    callback();
    return true;
  }
  return false;
}

export function handleError(context: string, error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`${context} failed:`, errorMessage);
}
