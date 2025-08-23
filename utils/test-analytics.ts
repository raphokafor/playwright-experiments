import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface HistoricData {
  runs: any[];
}

export class TestAnalytics {
  private historicDataPath: string;

  constructor(outputDir: string = "./test-results/historic-reports") {
    this.historicDataPath = join(outputDir, "historic-data.json");
  }

  getHistoricData(): HistoricData {
    if (!existsSync(this.historicDataPath)) {
      return { runs: [] };
    }

    try {
      return JSON.parse(readFileSync(this.historicDataPath, "utf8"));
    } catch (error) {
      console.error("Error reading historic data:", error);
      return { runs: [] };
    }
  }

  getFlakyTests(
    days: number = 7
  ): Array<{ testId: string; flakyRate: number; occurrences: number }> {
    const data = this.getHistoricData();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const testStats: Record<string, { flaky: number; total: number }> = {};

    data.runs
      .filter((run) => new Date(run.timestamp) > cutoffDate)
      .forEach((run) => {
        run.tests.forEach((test: any) => {
          if (!testStats[test.id]) {
            testStats[test.id] = { flaky: 0, total: 0 };
          }
          testStats[test.id].total++;
          if (test.status === "flaky") {
            testStats[test.id].flaky++;
          }
        });
      });

    return Object.entries(testStats)
      .map(([testId, stats]) => ({
        testId,
        flakyRate: stats.flaky / stats.total,
        occurrences: stats.flaky,
      }))
      .filter((test) => test.flakyRate > 0)
      .sort((a, b) => b.flakyRate - a.flakyRate);
  }

  getTestTrends(testId: string, days: number = 30) {
    const data = this.getHistoricData();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return data.runs
      .filter((run) => new Date(run.timestamp) > cutoffDate)
      .map((run) => {
        const test = run.tests.find((t: any) => t.id === testId);
        return {
          timestamp: run.timestamp,
          status: test?.status || "not-run",
          duration: test?.duration || 0,
          pr: run.pr,
        };
      })
      .reverse(); // Chronological order
  }

  getSummaryStats(days: number = 7) {
    const data = this.getHistoricData();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentRuns = data.runs.filter(
      (run) => new Date(run.timestamp) > cutoffDate
    );

    if (recentRuns.length === 0) {
      return null;
    }

    const totalRuns = recentRuns.length;
    const avgDuration =
      recentRuns.reduce((sum, run) => sum + run.totalDuration, 0) / totalRuns;
    const passRate =
      recentRuns.reduce((sum, run) => {
        const passed = run.summary.passed + run.summary.flaky;
        return sum + passed / run.summary.total;
      }, 0) / totalRuns;

    return {
      totalRuns,
      avgDuration: Math.round(avgDuration),
      passRate: Math.round(passRate * 100),
      flakyTests: this.getFlakyTests(days).length,
    };
  }
}
