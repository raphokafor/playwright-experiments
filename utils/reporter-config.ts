import { HistoricTestReporter } from "./historic-test-reporter";

export function createHistoricReporter(
  options: {
    outputDir?: string;
    enabled?: boolean;
  } = {}
) {
  if (options.enabled === false) {
    return [];
  }

  return [
    ["html"], // Keep the existing HTML reporter
    [
      HistoricTestReporter,
      {
        outputDir: options.outputDir || "./test-results/historic-reports",
      },
    ],
  ];
}

// Helper function to get reporter configuration based on environment
export function getReporterConfig() {
  const isCI = !!process.env.CI;
  const enableHistoric = process.env.ENABLE_HISTORIC_REPORTER !== "false";

  if (isCI && enableHistoric) {
    return createHistoricReporter({
      outputDir: "./test-results/historic-reports",
    });
  } else if (enableHistoric) {
    return createHistoricReporter({
      outputDir: "./test-results/historic-reports",
    });
  }

  return [["html"]]; // Default to just HTML reporter
}
