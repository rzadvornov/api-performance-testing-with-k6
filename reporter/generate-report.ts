const { generateSummaryReport } = require('k6-html-reporter');

const options = {
  jsonFile: 'summary.json',
  output: 'html-report',
};

generateSummaryReport(options);