import {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
  Suite,
} from "@playwright/test/reporter";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

interface TestRunMetrics {
  id: string;
  timestamp: string;
  pr?: string;
  branch: string;
  commit: string;
  environment: string;
  totalDuration: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    timedOut: number;
  };
  tests: TestDetail[];
  metadata: {
    playwright_version: string;
    node_version: string;
    os: string;
    browser: string;
    workers: number;
    retries: number;
  };
}

interface TestDetail {
  id: string;
  title: string;
  fullTitle: string;
  file: string;
  line?: number;
  project: string;
  status: "passed" | "failed" | "skipped" | "timedOut" | "flaky";
  duration: number;
  retries: number;
  error?: {
    message: string;
    location?: {
      file: string;
      line: number;
      column: number;
    };
    stack?: string;
  };
  attachments?: Array<{
    name: string;
    path?: string;
    contentType: string;
  }>;
}

export class HistoricTestReporter implements Reporter {
  private startTime: number = 0;
  private tests: TestDetail[] = [];
  private outputDir: string;
  private runId: string;

  constructor(options: { outputDir?: string } = {}) {
    this.outputDir =
      options.outputDir ||
      join(process.cwd(), "test-results", "historic-reports");
    this.runId = this.generateRunId();

    // Ensure output directory exists
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  onBegin(config: any, suite: Suite): void {
    this.startTime = Date.now();
    console.log(`🚀 Starting test run: ${this.runId}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const testDetail: TestDetail = {
      id: this.generateTestId(test),
      title: test.title,
      fullTitle: test.titlePath().join(" > "),
      file: test.location?.file || "",
      line: test.location?.line,
      project: test.parent?.project()?.name || "default",
      status: this.determineTestStatus(result),
      duration: result.duration,
      retries: result.retry,
    };

    // Add error details if test failed
    if (result.status === "failed" || result.status === "timedOut") {
      testDetail.error = this.extractErrorDetails(result);
    }

    // Add attachments info
    if (result.attachments.length > 0) {
      testDetail.attachments = result.attachments.map((attachment) => ({
        name: attachment.name,
        path: attachment.path,
        contentType: attachment.contentType,
      }));
    }

    this.tests.push(testDetail);
  }

  onEnd(result: FullResult): void {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    const metrics: TestRunMetrics = {
      id: this.runId,
      timestamp: new Date().toISOString(),
      pr: this.getPRNumber(),
      branch: this.getCurrentBranch(),
      commit: this.getCurrentCommit(),
      environment: process.env.NODE_ENV || "development",
      totalDuration,
      summary: this.calculateSummary(),
      tests: this.tests,
      metadata: {
        playwright_version: this.getPlaywrightVersion(),
        node_version: process.version,
        os: process.platform,
        browser: this.getUsedBrowsers(),
        workers: result.status === "passed" ? 1 : 0, // This would need to be passed from config
        retries: 0, // This would need to be passed from config
      },
    };

    this.writeReport(metrics);
    this.updateHistoricData(metrics);

    console.log(`📊 Test run completed: ${this.runId}`);
    console.log(
      `📁 Report saved to: ${join(this.outputDir, `${this.runId}.json`)}`
    );
  }

  private determineTestStatus(result: TestResult): TestDetail["status"] {
    if (result.status === "passed" && result.retry > 0) {
      return "flaky";
    }
    return result.status as TestDetail["status"];
  }

  private extractErrorDetails(result: TestResult): TestDetail["error"] {
    const error = result.errors[0];
    if (!error) return undefined;

    const errorDetail: TestDetail["error"] = {
      message: this.cleanErrorMessage(error.message || "Unknown error"),
      stack: error.stack,
    };

    // Try to extract location from stack trace
    const locationMatch = error.stack?.match(/at.*\(([^)]+):(\d+):(\d+)\)/);
    if (locationMatch) {
      errorDetail.location = {
        file: locationMatch[1],
        line: parseInt(locationMatch[2]),
        column: parseInt(locationMatch[3]),
      };
    }

    return errorDetail;
  }

  private cleanErrorMessage(message: string): string {
    // Remove ANSI codes and clean up the error message
    return message
      .replace(/\u001b\[[0-9;]*m/g, "")
      .split("\n")[0]
      .trim()
      .substring(0, 500); // Limit length for conciseness
  }

  private calculateSummary() {
    const summary = {
      total: this.tests.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      timedOut: 0,
    };

    this.tests.forEach((test) => {
      summary[test.status]++;
    });

    return summary;
  }

  private generateRunId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const random = Math.random().toString(36).substring(2, 8);
    return `run-${timestamp}-${random}`;
  }

  private generateTestId(test: TestCase): string {
    const title = test.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const file =
      test.location?.file?.split("/").pop()?.replace(".spec.ts", "") ||
      "unknown";
    return `${file}-${title}`;
  }

  private getPRNumber(): string | undefined {
    // Check common CI environment variables for PR number
    return (
      process.env.GITHUB_PR_NUMBER ||
      process.env.CI_PULL_REQUEST ||
      process.env.CHANGE_ID ||
      process.env.PULL_REQUEST_NUMBER
    );
  }

  private getCurrentBranch(): string {
    try {
      return execSync("git rev-parse --abbrev-ref HEAD", {
        encoding: "utf8",
      }).trim();
    } catch {
      return process.env.GITHUB_REF_NAME || process.env.CI_BRANCH || "unknown";
    }
  }

  private getCurrentCommit(): string {
    try {
      return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    } catch {
      return process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || "unknown";
    }
  }

  private getPlaywrightVersion(): string {
    try {
      const packageJson = JSON.parse(
        readFileSync(join(process.cwd(), "package.json"), "utf8")
      );
      return packageJson.devDependencies["@playwright/test"] || "unknown";
    } catch {
      return "unknown";
    }
  }

  private getUsedBrowsers(): string {
    // This is a simplified version - in a real implementation,
    // you'd track which browsers were actually used
    return "chromium";
  }

  private writeReport(metrics: TestRunMetrics): void {
    const reportPath = join(this.outputDir, `${this.runId}.json`);
    writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
  }

  private updateHistoricData(metrics: TestRunMetrics): void {
    const historicDataPath = join(this.outputDir, "historic-data.json");
    let historicData: { runs: TestRunMetrics[] } = { runs: [] };

    if (existsSync(historicDataPath)) {
      try {
        historicData = JSON.parse(readFileSync(historicDataPath, "utf8"));
      } catch (error) {
        console.warn("Could not read historic data, starting fresh");
      }
    }

    // Add current run
    historicData.runs.unshift(metrics);

    // Keep only last 100 runs to prevent file from getting too large
    historicData.runs = historicData.runs.slice(0, 100);

    writeFileSync(historicDataPath, JSON.stringify(historicData, null, 2));
  }
}
