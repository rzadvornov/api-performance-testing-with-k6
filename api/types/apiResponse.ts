export interface APIResponse {
  status: number;
  body: string;
  timings: {
    duration: number;
  };
}
