export interface PhaseWeightConfig<T extends string> {
  /** The minute (in minutes) the high-load phase begins. */
  phaseStartMinute: number;
  /** The minute (in minutes) the high-load phase ends. */
  phaseEndMinute: number;
  /** All scenario configurations, mapping name to base weight object. */
  scenarioConfigs: Record<T, { weight: number }>;
  /** The total weight allocated to be distributed among high-load scenarios. */
  totalHighLoadWeight: number;
  /** The count of scenarios that belong to the high-load group (baseWeight === 0). */
  highLoadScenarioCount: number;
}