# Github Metrics

Generates only basic pull request metrics (so far). Provides
ability to generate weekly, monthly or yearly distributions for your repository.
You can also select to generate the output in csv.

## Usage

1. Run `npm install`
1. Run `npm run start -- --help`

```
Usage: github-metrics [options]

Options:
  --help          Show help                                            [boolean]
  --version       Show version number                                  [boolean]
  --distribution  allowed values [weekly | monthly | yearly]
  --csv           output csv to stdout
```

### Examples

1. Generate metrics for all of the merged pull requests,

```bash
GITHUB_TOKEN=<token> GITHUB_OWNER=<owner> REPO_NAME=<repo> npm run start

Example Response:
[{
    'Average Number of Comments': 5,
    'Average File Changes': 7,
    'Average Deletions': 150,
    'Average Additions': 600,
    'Mean Time For Review (hours)': 14,
    'Mean Merge Time (hours)': 20,
    Total: 1700,
    'Without Comments': 400

}]
```

1. Provide options to generate distributions and output csv.

```bash
GITHUB_TOKEN=<token> GITHUB_OWNER=<owner> REPO_NAME=<repo> npm run start -- --distribution="monthly" --csv

Example Response:
During,Average Number of Comments,Average File Changes,Average Deletions,Average Additions,Mean Time For Review (hours),Mean Merge Time (hours),Total,Without Comments
3/2022,0,6,5,23,1,6,5,0
4/2022,0,3,28,29,1,6,5,0
5/2022,1,3,21,42,4,5,15,1
6/2022,1,2,26,183,1,1,1,1
7/2022,1,4,76,139,3,6,10,19
```
