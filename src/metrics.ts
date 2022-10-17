import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { PullRequest } from "./types";

dayjs.extend(duration);

const roundUp = Math.ceil;

const asHours = (seconds: number) => {
  return dayjs.duration(seconds, "seconds").asHours();
};

const asMinutes = (seconds: number) => {
  return dayjs.duration(seconds, "seconds").asMinutes();
};

const humanizedKeys = {
  meanMergeTime: "Mean Merge Time (hours)",
  meanTimeToReview: "Mean Time For Review (hours)",
  withComments: "With Comments",
  withoutComments: "Without Comments",
  averageAdditions: "Average Additions",
  averageDeletions: "Average Deletions",
  averageFilesChanged: "Average File Changes",
  averageComments: "Average Number of Comments",
  missedFlow: "Missed Same Day Merge",
};

export const measure = (pullRequests: PullRequest[]) => {
  const collector = {
    meanBucket: {
      [humanizedKeys.meanMergeTime]: 0,
      [humanizedKeys.meanTimeToReview]: 0,
      [humanizedKeys.averageComments]: 0,
      [humanizedKeys.averageFilesChanged]: 0,
      [humanizedKeys.averageAdditions]: 0,
      [humanizedKeys.averageDeletions]: 0,
    },
    countBucket: {
      [humanizedKeys.withComments]: 0,
      [humanizedKeys.missedFlow]: 0,
    },
  };

  const timeToReviewMinutes = pullRequests.map((pullRequest) => {
    return asMinutes(
      (new Date(pullRequest.reviewedAt).getTime() -
        new Date(pullRequest.createdAt).getTime()) /
        1000
    );
  });

  const timeToMergeMinutes = pullRequests.map((pullRequest) => {
    return asMinutes(
      (new Date(pullRequest.mergedAt).getTime() -
        new Date(pullRequest.createdAt).getTime()) /
        1000
    );
  });

  const { meanBucket, countBucket } = pullRequests.reduce(
    (metrics, pullRequest) => ({
      meanBucket: {
        [humanizedKeys.meanMergeTime]:
          (new Date(pullRequest.mergedAt).getTime() -
            new Date(pullRequest.createdAt).getTime()) /
            1000 +
          metrics.meanBucket[humanizedKeys.meanMergeTime],

        [humanizedKeys.meanTimeToReview]:
          (new Date(pullRequest.reviewedAt).getTime() -
            new Date(pullRequest.createdAt).getTime()) /
            1000 +
          metrics.meanBucket[humanizedKeys.meanTimeToReview],

        [humanizedKeys.averageAdditions]:
          pullRequest.additions +
          metrics.meanBucket[humanizedKeys.averageAdditions],

        [humanizedKeys.averageDeletions]:
          pullRequest.deletions +
          metrics.meanBucket[humanizedKeys.averageDeletions],

        [humanizedKeys.averageFilesChanged]:
          pullRequest.changedFiles +
          metrics.meanBucket[humanizedKeys.averageFilesChanged],

        [humanizedKeys.averageComments]:
          pullRequest.totalComments +
          metrics.meanBucket[humanizedKeys.averageComments],
      },
      countBucket: {
        [humanizedKeys.withComments]:
          pullRequest.totalComments === 0
            ? metrics.countBucket[humanizedKeys.withComments] + 1
            : metrics.countBucket[humanizedKeys.withComments],

        [humanizedKeys.missedFlow]:
          new Date(pullRequest.mergedAt).getDate() !==
          new Date(pullRequest.createdAt).getDate()
            ? metrics.countBucket[humanizedKeys.missedFlow] + 1
            : metrics.countBucket[humanizedKeys.missedFlow],
      },
    }),
    collector
  );

  let mean = {};
  for (const value in meanBucket) {
    if (
      value === humanizedKeys.meanMergeTime ||
      value === humanizedKeys.meanTimeToReview
    ) {
      mean = {
        [value]: roundUp(asHours(meanBucket[value] / pullRequests.length)),
        ...mean,
      };
    } else {
      mean = {
        [value]: roundUp(meanBucket[value] / pullRequests.length),
        ...mean,
      };
    }
  }

  const withoutComments =
    pullRequests.length - countBucket[humanizedKeys.withComments];

  return {
    ...mean,
    Total: pullRequests.length,
    "Median Time To Review": median(timeToReviewMinutes),
    "Median Time To Merge": median(timeToMergeMinutes),
    [humanizedKeys.withoutComments]: withoutComments,
  };
};

const median = (numbers: number[]) => {
  const mid = Math.floor(numbers.length / 2),
    nums = [...numbers].sort((a, b) => a - b);
  return numbers.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};
