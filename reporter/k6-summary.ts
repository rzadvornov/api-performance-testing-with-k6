export function handleSummary(data: any) {
  console.log("Preparing the end-of-test summary...");
  const jsonReportPath = "summary.json";

  return {
    [jsonReportPath]: JSON.stringify(data),
  };
}
