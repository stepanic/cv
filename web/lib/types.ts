// Shared types for the CV data loaded from ../data/*.yaml and
// ../data/generated/*.json. Safe to import from client components — types only.

/** Bilingual fields in the YAML are either plain strings or { en, hr }. */
export type Bilingual = string | { en: string; hr: string };

export interface ProfileLink {
  label: string;
  url: string;
}

export interface Profile {
  name: string;
  name_ascii: string;
  title: Bilingual;
  location: Bilingual;
  email: string;
  website: string;
  company: string;
  summary: Bilingual;
  links: ProfileLink[];
  languages: { name: Bilingual; level: Bilingual }[];
}

export interface ExperienceBullet {
  text: Bilingual;
  tags?: string[];
  priority?: number;
}

export interface ExperienceItem {
  id: string;
  company: Bilingual;
  url?: string;
  role: Bilingual;
  start: string; // "YYYY-MM" or "YYYY"
  end: string | null;
  location?: Bilingual;
  summary: Bilingual;
  bullets: ExperienceBullet[];
}

export interface SkillItem {
  name: string;
  years: number;
  core?: boolean;
}

export interface SkillGroup {
  group: Bilingual;
  items: SkillItem[];
}

export interface EducationItem {
  degree: Bilingual;
  school: Bilingual;
  start: string;
  end: string;
  location?: Bilingual;
}

export interface Certification {
  name: Bilingual;
  issuer: string;
  date: string;
  url?: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  featured: boolean;
  order: number;
  period: { start: string; end: string | null };
  role: Bilingual;
  links: ProjectLink[];
  tech: string[];
  summary: Bilingual;
  highlights?: Bilingual[];
  tags?: string[];
}

export interface GithubStats {
  updated: string;
  profile: {
    created_at: string;
    followers: number;
    login: string;
    name: string;
    public_repos: number;
  };
  lastYear: {
    totalContributions: number;
    commits: number;
    pullRequests: number;
    issues: number;
    topRepositories: { repo: string; url: string; commits: number }[];
    weekly: { weekStart: string; count: number }[];
  };
  languages: { name: string; size: number }[];
}

export interface ClaudeModelUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
  apiEquivalentUSD: number;
}

export interface ClaudeMonthly {
  month: string; // "YYYY-MM"
  sessions: number;
  messages: number;
  toolCalls: number;
  tokens: number;
  apiEquivalentUSD: number;
  source?: string;
}

export interface ClaudeCodeStats {
  updated: string;
  note: string;
  usingSince: string;
  numStartups: number;
  knownGap: { from: string; to: string; reason: string };
  totals: {
    sessions: number;
    projects: number;
    messages: number;
    toolCalls: number;
    transcriptEvents: number;
    tokens: number;
    outputTokens: number;
    apiEquivalentUSD: number;
  };
  byModel: ClaudeModelUsage[];
  monthly: ClaudeMonthly[];
  /** 24 ints: message events per local hour of day. */
  hourHistogram: number[];
  longestSession: { messages: number; toolCalls: number; hours: number };
  statsCache: {
    trackedSince: string;
    computedAt: string;
    totalMessages: number;
    totalSessions: number;
    models: string[];
  };
  recursion: string;
}

export interface CvData {
  profile: Profile;
  experience: ExperienceItem[];
  skills: SkillGroup[];
  education: EducationItem[];
  certifications: Certification[];
  projects: Project[];
  github: GithubStats;
  claude: ClaudeCodeStats;
}
