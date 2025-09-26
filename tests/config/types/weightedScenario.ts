export type WeightedScenario = {
  name: string;
  func: Function;
  weight: number;
  dynamicWeight?: (runningTime: number) => number;
};