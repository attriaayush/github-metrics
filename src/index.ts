#!/usr/bin/env node

import { stringify } from "csv-stringify/sync";

import { createDistribution, Distribution } from "./chunks";
import { getRepoInfo } from "./env";
import { measure } from "./metrics";
import { fetchPullRequestsForRepo } from "./queries";

interface Arguments {
  distribution?: Distribution;
  csv: boolean;
}

const parseArgs = (): Arguments => {
  const argv = require("yargs/yargs")(process.argv.slice(2))
    .usage("Usage: github-metrics [options]")
    .describe("distribution", "allowed values [weekly | monthly | yearly]")
    .describe("csv", "output csv to stdout").argv;

  return {
    distribution: argv.distribution,
    csv: argv.csv,
  };
};

(async () => {
  const { distribution, csv } = parseArgs();
  const { owner, repo } = getRepoInfo();

  const pullRequests = await fetchPullRequestsForRepo({
    owner,
    name: repo,
  });

  const metrics = [];

  if (distribution) {
    const chunks = createDistribution(pullRequests, distribution);
    for (const key in chunks) {
      metrics.push({ During: key, ...measure(chunks[key]) });
    }
  } else {
    metrics.push(measure(pullRequests));
  }

  if (csv) {
    const csv = stringify(metrics, {
      header: true,
    });
    console.log(csv);
  } else {
    console.log(metrics);
  }
})();
