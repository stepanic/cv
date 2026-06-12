// Full CV — 2–3 pages, all experience bullets and featured projects.
#import "lib.typ": *

#set page(margin: (x: 1.6cm, y: 1.5cm))
#set text(font: "Libertinus Serif", size: 10pt, lang: lang)
#set par(justify: true)

#show heading.where(level: 1): it => block(above: 14pt, below: 8pt)[
  #text(size: 13pt, weight: "bold", fill: accent, upper(it.body))
  #v(-6pt)
  #line(length: 100%, stroke: 0.7pt + accent.lighten(50%))
]

// ── Header ──────────────────────────────────────────────────────────────────
#grid(
  columns: (1fr, auto),
  align: (left, right),
  [
    #text(size: 22pt, weight: "bold", profile.name)\
    #text(size: 11pt, fill: luma(70), tr(profile.title))
  ],
  [
    #set text(size: 9pt)
    #tr(profile.location)\
    #link("mailto:" + profile.email, profile.email)\
    #link(profile.website, profile.website.replace("https://", ""))\
    #profile.links.map(l => link(l.url, l.label)).join("  ·  ")
  ],
)
#v(4pt)

// ── Summary ─────────────────────────────────────────────────────────────────
#tr(profile.summary)

// ── Stats band ───────────────────────────────────────────────────────────────
#v(6pt)
#block(fill: luma(245), inset: 8pt, radius: 4pt, width: 100%)[
  #set text(size: 9pt)
  #grid(
    columns: (1fr, 1fr, 1fr),
    align: center,
    [#text(weight: "bold", size: 12pt, fill: accent, fmt-num(gh.lastYear.totalContributions)) \ #L.contributions],
    [#text(weight: "bold", size: 12pt, fill: accent, str(gh.profile.public_repos)) \ #L.publicRepos],
    [#text(weight: "bold", size: 12pt, fill: accent, str(cc.sessionFiles)) \ #L.aiNative],
  )
]

// ── Experience ───────────────────────────────────────────────────────────────
= #L.experience

#for job in experience [
  #block(above: 10pt, below: 4pt, breakable: false)[
    #grid(
      columns: (1fr, auto),
      [*#tr(job.role)* — #text(fill: accent, weight: "semibold", tr(job.company))],
      text(size: 9pt, fill: luma(90), fmt-period(job.start, job.at("end", default: none))),
    )
    #text(size: 9pt, style: "italic", fill: luma(70), tr(job.summary))
  ]
  #for b in job.bullets [
    - #tr(b.text)
  ]
]

// ── Projects ─────────────────────────────────────────────────────────────────
= #L.projects

#for p in projects.filter(p => p.featured) [
  #block(above: 9pt, below: 3pt, breakable: false)[
    #grid(
      columns: (1fr, auto),
      [*#p.name* — #text(size: 9pt, tr(p.role))],
      text(size: 9pt, fill: luma(90), {
        let e = p.period.at("end", default: none)
        if e == p.period.start { p.period.start } else { p.period.start + " – " + (if e == none { L.present } else { e }) }
      }),
    )
  ]
  #tr(p.summary)
  #if p.at("links", default: ()).len() > 0 [
    #text(size: 8.5pt, p.links.map(l => link(l.url, l.url.replace("https://", ""))).join(" · "))\
  ]
  #text(size: 8.5pt, fill: luma(70), p.tech.join(" · "))
]

// ── Skills ───────────────────────────────────────────────────────────────────
= #L.skills

#for g in skills [
  #block(above: 6pt, breakable: false)[
    *#tr(g.group):* #g.items.map(s => {
      s.name + if "years" in s { " (" + str(s.years) + " " + L.years + ")" } else { "" }
    }).join(" · ")
  ]
]

// ── Education & certifications ───────────────────────────────────────────────
= #L.education

#for e in edu.education [
  #grid(
    columns: (1fr, auto),
    column-gutter: 16pt,
    [*#tr(e.degree)* — #tr(e.school)],
    text(size: 9pt, fill: luma(90), e.start + " – " + e.end),
  )
  #v(2pt)
]

*#L.certifications:* #edu.certifications.map(c => tr(c.name) + " (" + c.issuer + ", " + c.date.slice(0, 4) + ")").join(" · ")

*#L.languages:* #profile.languages.map(l => tr(l.name) + " — " + tr(l.level)).join(" · ")

#v(1fr)
#align(center, text(size: 8pt, fill: luma(130))[
  #link("https://github.com/stepanic/cv")[github.com/stepanic/cv] — single source of truth · #gh.updated.slice(0, 10)
])
