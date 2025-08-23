#!/usr/bin/env node

import { TestAnalytics } from "./test-analytics";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const analytics = new TestAnalytics();

function viewLatestReport() {
  const reportsDir = "./test-results/historic-reports";
  const files = readdirSync(reportsDir)
    .filter((f) => f.startsWith("run-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log("No reports found");
    return;
  }

  const latestReport = JSON.parse(
    readFileSync(join(reportsDir, files[0]), "utf8")
  );

  console.log("\n🎯 Latest Test Run Report");
  console.log("========================");
  console.log(`Run ID: ${latestReport.id}`);
  console.log(
    `Timestamp: ${new Date(latestReport.timestamp).toLocaleString()}`
  );
  console.log(`Branch: ${latestReport.branch}`);
  console.log(`PR: ${latestReport.pr || "N/A"}`);
  console.log(`Duration: ${Math.round(latestReport.totalDuration / 1000)}s`);
  console.log(`Environment: ${latestReport.environment}`);

  console.log("\n📊 Summary:");
  const s = latestReport.summary;
  console.log(`  Total: ${s.total}`);
  console.log(
    `  Passed: ${s.passed} (${Math.round((s.passed / s.total) * 100)}%)`
  );
  console.log(
    `  Failed: ${s.failed} (${Math.round((s.failed / s.total) * 100)}%)`
  );
  console.log(
    `  Flaky: ${s.flaky} (${Math.round((s.flaky / s.total) * 100)}%)`
  );
  console.log(
    `  Timed Out: ${s.timedOut} (${Math.round((s.timedOut / s.total) * 100)}%)`
  );
  console.log(
    `  Skipped: ${s.skipped} (${Math.round((s.skipped / s.total) * 100)}%)`
  );

  if (s.failed > 0) {
    console.log("\n❌ Failed Tests:");
    latestReport.tests
      .filter((t: any) => t.status === "failed")
      .forEach((test: any) => {
        console.log(`  • ${test.fullTitle}`);
        if (test.error?.message) {
          console.log(`    Error: ${test.error.message}`);
        }
        if (test.error?.location) {
          console.log(
            `    Location: ${test.error.location.file}:${test.error.location.line}`
          );
        }
      });
  }

  if (s.flaky > 0) {
    console.log("\n⚠️  Flaky Tests:");
    latestReport.tests
      .filter((t: any) => t.status === "flaky")
      .forEach((test: any) => {
        console.log(`  • ${test.fullTitle} (${test.retries} retries)`);
      });
  }
}

function viewSummaryStats() {
  const stats = analytics.getSummaryStats(7);
  if (!stats) {
    console.log("No data available for the last 7 days");
    return;
  }

  console.log("\n📈 7-Day Summary");
  console.log("================");
  console.log(`Total Runs: ${stats.totalRuns}`);
  console.log(`Average Duration: ${Math.round(stats.avgDuration / 1000)}s`);
  console.log(`Pass Rate: ${stats.passRate}%`);
  console.log(`Flaky Tests: ${stats.flakyTests}`);
}

function viewFlakyTests() {
  const flakyTests = analytics.getFlakyTests(14);

  console.log("\n🔄 Most Flaky Tests (14 days)");
  console.log("==============================");

  if (flakyTests.length === 0) {
    console.log("No flaky tests found! 🎉");
    return;
  }

  flakyTests.slice(0, 10).forEach((test, index) => {
    console.log(`${index + 1}. ${test.testId}`);
    console.log(
      `   Flaky Rate: ${Math.round(test.flakyRate * 100)}% (${
        test.occurrences
      } times)`
    );
  });
}

// Main execution
const command = process.argv[2];

switch (command) {
  case "latest":
    viewLatestReport();
    break;
  case "summary":
    viewSummaryStats();
    break;
  case "flaky":
    viewFlakyTests();
    break;
  default:
    console.log("📊 Test Reports Viewer");
    console.log("======================");
    console.log("Usage: npx ts-node utils/view-reports.ts [command]");
    console.log("");
    console.log("Commands:");
    console.log("  latest  - View the latest test run report");
    console.log("  summary - View 7-day summary statistics");
    console.log("  flaky   - View most flaky tests");
    console.log("");
    console.log("Examples:");
    console.log("  npx ts-node utils/view-reports.ts latest");
    console.log("  npx ts-node utils/view-reports.ts summary");
    console.log("  npx ts-node utils/view-reports.ts flaky");
}
