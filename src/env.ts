import dotenv from "dotenv";
dotenv.config();

export const getGhToken = (): string => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Github Toke not set. export GITHUB_TOKEN=<token>");
  }

  return `bearer ${token}`;
};

export const getRepoInfo = (): { owner: string; repo: string } => {
  const owner = process.env.GITHUB_OWNER;
  const repoName = process.env.REPO_NAME;

  if (!owner && !repoName) {
    throw new Error(
      "Github owner and repo not set. export GITHUB_OWNER=<owner> && export REPO_NAME=<repoName>"
    );
  }

  return {
    owner: owner!,
    repo: repoName!,
  };
};
