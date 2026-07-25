#!/usr/bin/env node
// Refresh data/generated/repos.json — the auto-generated open-source index.
//
// Enumerates every PUBLIC repository Matija owns, across his personal account
// and the GitHub orgs he runs.
//
// This is an ALLOW-LIST, deliberately. Consulting-client work must never be
// published (see "What may be published" in CLAUDE.md), and since this repo is
// public, listing the clients in order to exclude them would leak the very
// names the rule protects. So nothing is enumerated unless its owner appears in
// ALLOW_OWNERS below — anything absent is excluded by default, silently and
// safely. Do not add an owner here without Matija's explicit say-so.
//
// Requires: gh CLI, authenticated. Run: npm run stats:repos

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data/generated/repos.json");

// Owners whose public repos are Matija's own work — safe to publish.
const ALLOW_OWNERS = [
  "stepanic",
  "domovinatv",
  "ffhr",
  "pinka-finance",
  "mariko-p",
  "italkco",
  "loopusdev",
];

// Repos that are scratch, coursework or duplicates — noise in a portfolio.
const DENY_REPOS = new Set([
  "stepanic/stepanic",
  "stepanic/docs",
  "stepanic/blog",
  "stepanic/utils",
  "stepanic/topcoder",
  "stepanic/gitignore",
  "stepanic/proba-123-novi-repo",
  "stepanic/stepanic.github.io",
  "stepanic/forestry-demo",
  "stepanic/travis-node-demo",
  "stepanic/one-click-hugo-cms",
  "stepanic/one-click-hugo-cms-2019",
  "stepanic/test-angular-scully-with-forestry",
  "stepanic/VjenanjeonlineJekyllweb",
]);

function gh(args) {
  return execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

const FIELDS = [
  "name",
  "nameWithOwner",
  "description",
  "url",
  "homepageUrl",
  "primaryLanguage",
  "stargazerCount",
  "forkCount",
  "createdAt",
  "pushedAt",
  "isFork",
  "isArchived",
  "licenseInfo",
  "repositoryTopics",
].join(",");

function listRepos(owner) {
  try {
    return JSON.parse(
      gh(["repo", "list", owner, "--limit", "300", "--visibility", "public", "--json", FIELDS]),
    );
  } catch {
    console.warn(`  ! could not list ${owner} (no access?) — skipped`);
    return [];
  }
}

const all = [];

for (const owner of ALLOW_OWNERS) {
  const repos = listRepos(owner);
  console.log(`  ${owner}: ${repos.length} public`);
  for (const r of repos) {
    if (r.isFork) continue; // forks are not portfolio work
    if (DENY_REPOS.has(r.nameWithOwner)) continue;
    all.push({
      owner,
      name: r.name,
      full_name: r.nameWithOwner,
      description: r.description || null,
      url: r.url,
      homepage: r.homepageUrl || null,
      language: r.primaryLanguage?.name || null,
      stars: r.stargazerCount,
      forks: r.forkCount,
      created: r.createdAt.slice(0, 10),
      pushed: r.pushedAt.slice(0, 10),
      archived: r.isArchived,
      license: r.licenseInfo?.spdxId || null,
      topics: (r.repositoryTopics || []).map((t) => t.name ?? t.topic?.name).filter(Boolean),
    });
  }
}

all.sort((a, b) => b.pushed.localeCompare(a.pushed));

const byOwner = {};
for (const r of all) byOwner[r.owner] = (byOwner[r.owner] || 0) + 1;

const byLanguage = {};
for (const r of all) if (r.language) byLanguage[r.language] = (byLanguage[r.language] || 0) + 1;

const out = {
  updated: new Date().toISOString(),
  policy: {
    note: "Public repos owned by Matija only. Consulting-client work is excluded by policy — see CLAUDE.md.",
    allowOwners: ALLOW_OWNERS,
    excludesForks: true,
  },
  totals: {
    repos: all.length,
    owners: Object.keys(byOwner).length,
    stars: all.reduce((n, r) => n + r.stars, 0),
    languages: Object.keys(byLanguage).length,
    activeLast90Days: all.filter(
      (r) => Date.now() - Date.parse(r.pushed) < 90 * 24 * 3600 * 1000,
    ).length,
  },
  byOwner,
  byLanguage: Object.fromEntries(
    Object.entries(byLanguage).sort((a, b) => b[1] - a[1]),
  ),
  repos: all,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(JSON.stringify(out.totals, null, 2));
