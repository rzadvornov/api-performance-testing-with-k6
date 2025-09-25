export type WeightedScenario = {
  name: string;
  func: Function;
  baseWeight: number;
  dynamicWeight?: (runningTime: number) => number;
};