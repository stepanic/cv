// Shared data loading + helpers for all CV variants.
// Compile from the repo root, e.g.:
//   typst compile --root . --input lang=en typst/cv-full.typ dist/cv-matija-stepanic-en.pdf

#let lang = sys.inputs.at("lang", default: "en")

// Resolve a bilingual field ({en, hr} dict or plain string).
#let tr(v) = if type(v) == dictionary { v.at(lang, default: v.at("en", default: "")) } else { v }

#let profile = yaml("../data/profile.yaml")
#let experience = yaml("../data/experience.yaml").experience
#let skills = yaml("../data/skills.yaml").skills
#let edu = yaml("../data/education.yaml")
#let gh = json("../data/generated/github-stats.json")
#let cc = json("../data/generated/claude-code-stats.json")

// All projects, featured first then by `order`.
#let projects = {
  let files = (
    "domovina", "pinka-finance", "flutter-certilia", "firepixy", "scanshop",
    "ff-blinkid", "microblink", "ff-toolkit", "modric-lottery-verify",
    "flutterflow-socket", "mobile-phone-proxy", "fire-flame-studio",
    "cravat-shopify-theme", "dotclaude-sync", "croatian-tools",
  )
  files.map(f => yaml("../data/projects/" + f + ".yaml")).sorted(key: p => p.order)
}

// UI labels per language.
#let L = (
  en: (
    experience: "Experience",
    projects: "Selected Projects",
    skills: "Skills",
    education: "Education",
    certifications: "Certifications",
    languages: "Languages",
    summary: "Summary",
    present: "present",
    highlights: "Highlights",
    stats: "By the Numbers",
    contributions: "GitHub contributions (last 12 months)",
    publicRepos: "public repositories",
    aiNative: "AI-native development: Claude Code sessions (last 30 days)",
    years: "yrs",
  ),
  hr: (
    experience: "Iskustvo",
    projects: "Odabrani projekti",
    skills: "Vještine",
    education: "Obrazovanje",
    certifications: "Certifikati",
    languages: "Jezici",
    summary: "Sažetak",
    present: "danas",
    highlights: "Istaknuto",
    stats: "U brojkama",
    contributions: "GitHub contributiona (zadnjih 12 mjeseci)",
    publicRepos: "javnih repozitorija",
    aiNative: "AI-native razvoj: Claude Code sessioni (zadnjih 30 dana)",
    years: "god",
  ),
).at(lang)

// "2025-06" → "06/2025"; year-only stays as-is.
#let fmt-date(d) = {
  if d == none { L.present }
  else if d.len() == 7 { d.slice(5, 7) + "/" + d.slice(0, 4) }
  else { d }
}
#let fmt-period(start, end) = fmt-date(start) + " – " + fmt-date(end)

#let accent = rgb("#C1272D") // Croatian red, used sparingly

// Thousands separator for big numbers.
#let fmt-num(n) = {
  let s = str(n)
  let out = ""
  let i = 0
  for c in s.rev() {
    if i != 0 and calc.rem(i, 3) == 0 { out = "," + out }
    out = c + out
    i += 1
  }
  out
}
