// Build-time data loader. Reads the single source of truth in ../../data
// (YAML + generated JSON) with fs — import ONLY from server components.
// The whole site is a static export, so everything resolves at `next build`.

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type {
  Certification,
  ClaudeCodeStats,
  CvData,
  EducationItem,
  ExperienceItem,
  GithubStats,
  Profile,
  Project,
  SkillGroup,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "..", "data");

function readYaml<T>(rel: string): T {
  return yaml.load(fs.readFileSync(path.join(DATA_DIR, rel), "utf8")) as T;
}

function readJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, rel), "utf8")) as T;
}

export function loadCvData(): CvData {
  const profile = readYaml<Profile>("profile.yaml");
  const { experience } = readYaml<{ experience: ExperienceItem[] }>("experience.yaml");
  const { skills } = readYaml<{ skills: SkillGroup[] }>("skills.yaml");
  const { education, certifications } = readYaml<{
    education: EducationItem[];
    certifications: Certification[];
  }>("education.yaml");

  const projectsDir = path.join(DATA_DIR, "projects");
  const projects = fs
    .readdirSync(projectsDir)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => yaml.load(fs.readFileSync(path.join(projectsDir, f), "utf8")) as Project)
    .sort((a, b) => a.order - b.order);

  const github = readJson<GithubStats>("generated/github-stats.json");
  const claude = readJson<ClaudeCodeStats>("generated/claude-code-stats.json");

  return { profile, experience, skills, education, certifications, projects, github, claude };
}
