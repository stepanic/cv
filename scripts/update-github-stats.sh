#!/usr/bin/env bash
# Refresh data/generated/github-stats.json from the GitHub API (gh CLI).
# Public, aggregate numbers only. Requires: gh (authenticated), jq.
set -euo pipefail
cd "$(dirname "$0")/.."

OUT="data/generated/github-stats.json"

profile=$(gh api user --jq '{login, name, public_repos, followers, created_at}')

contrib=$(gh api graphql -f query='query {
  viewer {
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
      commitContributionsByRepository(maxRepositories: 15) {
        repository { nameWithOwner isPrivate url }
        contributions { totalCount }
      }
    }
  }
}' --jq '.data.viewer.contributionsCollection')

# Top languages across owned, non-fork repos.
langs=$(gh api graphql -f query='query {
  viewer {
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
      nodes { languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
        edges { size node { name } } } }
    }
  }
}' --jq '[.data.viewer.repositories.nodes[].languages.edges[]]
  | group_by(.node.name)
  | map({name: .[0].node.name, size: (map(.size) | add)})
  | sort_by(-.size) | .[0:10]')

jq -n \
  --argjson profile "$profile" \
  --argjson contrib "$contrib" \
  --argjson languages "$langs" \
  --arg updated "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{
    updated: $updated,
    profile: $profile,
    lastYear: {
      totalContributions: $contrib.contributionCalendar.totalContributions,
      commits: $contrib.totalCommitContributions,
      pullRequests: $contrib.totalPullRequestContributions,
      issues: $contrib.totalIssueContributions,
      topRepositories: [
        $contrib.commitContributionsByRepository[]
        | select(.repository.isPrivate | not)
        | {repo: .repository.nameWithOwner, url: .repository.url, commits: .contributions.totalCount}
      ],
      # Weekly series for the activity chart (sum of daily counts per week).
      weekly: [
        $contrib.contributionCalendar.weeks[]
        | {weekStart: .contributionDays[0].date, count: ([.contributionDays[].contributionCount] | add)}
      ]
    },
    languages: $languages
  }' > "$OUT"

echo "Wrote $OUT:"
jq '{updated, totalContributions: .lastYear.totalContributions, repos: .profile.public_repos}' "$OUT"
