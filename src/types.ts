export interface Repository {
  owner: string;
  name: string;
}

export interface Review {
  state: string;
  createdAt: string;
  comment: number;
}

export interface PullRequest {
  title: string;
  changedFiles: number;
  additions: number;
  deletions: number;
  commits: number;
  reviewThreads: number;
  totalComments: number;
  createdAt: string;
  mergedAt: string;
  reviewedAt: string;
  reviews: Review[];
}
