import { gql, GraphQLClient } from "graphql-request";

import { getGhToken } from "./env";
import { Repository, PullRequest } from "./types";

export const fetchPullRequestsForRepo = async ({
  owner,
  name,
}: Repository): Promise<PullRequest[]> => {
  let cursor = "";
  let pullRequests: PullRequest[] = [];
  let hasNextPage = true;

  const fetch = async () => {
    const query = pullRequestsQuery(owner, name, 100, cursor);
    const { hasNextPage: nextPage, endCursor } = await gqlClient()
      .request(query)
      .then((data) => {
        pullRequests = pullRequests.concat(
          data.repository.pullRequests.edges.map((response: any) => ({
            ...response.node,
            commits: response.node.commits.totalCount,
            reviewThreads: response.node.reviewThreads.totalCount,
            reviews: response.node.reviews.edges.map((review: any) => ({
              ...review.node,
              comments: review.node.comments.totalCount,
            })),
            totalComments: response.node.reviews.edges.reduce(
              (totalComments: number, review: any) =>
                totalComments + review.node.comments.totalCount,
              0
            ),
            reviewedAt:
              response.node.reviews.edges[0]?.node.createdAt ??
              response.node.mergedAt,
          }))
        );
        return data.repository.pullRequests.pageInfo;
      });
    hasNextPage = nextPage;
    cursor = `, after: "${endCursor}"`;
  };

  while (hasNextPage) {
    await fetch();
  }

  return pullRequests;
};

export const gqlClient = (): GraphQLClient => {
  const token = getGhToken();
  const endpoint = "https://api.github.com/graphql";

  return new GraphQLClient(endpoint, {
    headers: {
      Authorization: token,
    },
  });
};

const pullRequestsQuery = (
  owner: string,
  repoName: string,
  pageSize: number,
  cursor: string
) => {
  return gql`
  {
    repository(owner:"${owner}", name:"${repoName}") {
    pullRequests(states:MERGED, first: ${pageSize}${cursor}) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges{
        node{
          title
          changedFiles
          additions
          deletions
          createdAt
          mergedAt
          commits {
            totalCount
          }
          reviewThreads {
            totalCount
          }
          reviews(last: ${pageSize}){
            edges {
              node {
                state
                createdAt
                comments {
                  totalCount
                }
              }
            }
          }
        }
      }
    }
  }
  }
`;
};
