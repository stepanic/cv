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
    "domovina", "domovina-rag", "pinka-finance", "flutter-certilia", "firepixy",
    "scanshop", "ff-blinkid", "microblink", "ff-toolkit", "pediludium",
    "modric-lottery-verify", "flutterflow-socket", "mobile-phone-proxy",
    "fire-flame-studio", "cravat-shopify-theme", "dotclaude-sync", "croatian-tools",
    // DOMOVINA ecosystem — standalone open-source projects
    "domovina-pipeline", "klubovi-domovina", "stranke-domovina", "zakoni-domovina",
    "izbori-domovina", "karta-hrvatske", "pay-domovina", "domovina-fiskal",
    "certilia-esign", "domovina-api", "sms-domovina", "producer-domovina",
    "company-details-api",
    // Personal devtools
    "launchd-menubar",
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
    contributionsNote: "excludes {archive} automated commits publishing the open transcript corpus to dataset.domovina.tv ({raw} total on GitHub's own counter)",
    publicRepos: "public repositories",
    aiNative: "tokens processed with Claude Code since 2025",
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
    contributionsNote: "bez {archive} automatskih commitova kojima pipeline objavljuje otvoreni korpus transkripata na dataset.domovina.tv (GitHub na svom brojaču pokazuje {raw})",
    publicRepos: "javnih repozitorija",
    aiNative: "tokena obrađeno s Claude Codeom od 2025.",
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

// Compact billions, e.g. 7751614716 → "7.75B".
#let fmt-billions(n) = str(calc.round(n / 1000000000, digits: 2)) + "B"

// Thousands separator for big numbers.
#let fmt-num(n) = {
  // Thousands separator follows the document language: "37,098" in English,
  // "37.098" in Croatian.
  let sep = if lang == "hr" { "." } else { "," }
  let s = str(n)
  let out = ""
  let i = 0
  for c in s.rev() {
    if i != 0 and calc.rem(i, 3) == 0 { out = sep + out }
    out = c + out
    i += 1
  }
  out
}
