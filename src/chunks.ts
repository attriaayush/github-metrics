import { PullRequest } from "./types";

export type Distribution = "weekly" | "monthly" | "yearly";

export const createDistribution = (
  pullRequests: PullRequest[],
  distribution: Distribution
) => {
  return pullRequests.reduce(
    (
      chunkedPullRequests: Record<string, PullRequest[]>,
      pullRequest: PullRequest
    ) => {
      const key = createIndexKey(distribution, pullRequest.createdAt);

      if (!chunkedPullRequests[key]) {
        chunkedPullRequests[key] = [];
      }

      chunkedPullRequests[key].push(pullRequest);
      return chunkedPullRequests;
    },
    {}
  );
};

const createIndexKey = (distributeBy: Distribution, timestamp: string) => {
  switch (distributeBy) {
    case "weekly":
      return weeklyDistributionKey(timestamp);
    case "monthly":
      return monthlyDistributionKey(timestamp);
    case "yearly":
      return yearlyDistributionKey(timestamp);

    default:
      throw new Error(
        "Unknown distribution type. Please enter one of [weekly | monthly | yearly]"
      );
  }
};

const monthlyDistributionKey = (timestamp: string): string => {
  const createdAt = new Date(timestamp);
  const key = `${createdAt.getMonth()}/${createdAt.getFullYear()}`;

  return key;
};

const weeklyDistributionKey = (timestamp: string): string => {
  const createdAt = new Date(timestamp);
  const key = `${createdAt.getDate()}/${createdAt.getMonth()}/${createdAt.getFullYear()}`;

  return key;
};

const yearlyDistributionKey = (timestamp: string): string => {
  const createdAt = new Date(timestamp);
  const key = `${createdAt.getFullYear()}`;

  return key;
};
