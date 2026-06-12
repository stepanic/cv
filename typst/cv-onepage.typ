// One-page CV — priority-1 bullets, core skills, top featured projects only.
#import "lib.typ": *

#set page(margin: (x: 1.4cm, y: 1.2cm))
#set text(font: "Libertinus Serif", size: 9.2pt, lang: lang)
#set par(justify: true)

#show heading.where(level: 1): it => block(above: 8pt, below: 5pt)[
  #text(size: 11pt, weight: "bold", fill: accent, upper(it.body))
  #v(-5pt)
  #line(length: 100%, stroke: 0.6pt + accent.lighten(50%))
]

#grid(
  columns: (1fr, auto),
  align: (left, right),
  [
    #text(size: 18pt, weight: "bold", profile.name)\
    #text(size: 10pt, fill: luma(70), tr(profile.title))
  ],
  [
    #set text(size: 8.2pt)
    #tr(profile.location) · #link("mailto:" + profile.email, profile.email)\
    #link(profile.website, profile.website.replace("https://", "")) ·
    #profile.links.slice(0, 3).map(l => link(l.url, l.label)).join(" · ")
  ],
)
#v(2pt)
#text(size: 8.8pt, tr(profile.summary))

= #L.experience
#for job in experience [
  #block(above: 7pt, below: 2pt, breakable: false)[
    #grid(
      columns: (1fr, auto),
      [*#tr(job.role)* — #text(fill: accent, weight: "semibold", tr(job.company))],
      text(size: 8.2pt, fill: luma(90), fmt-period(job.start, job.at("end", default: none))),
    )
  ]
  #for b in job.bullets.filter(b => b.at("priority", default: 2) == 1) [
    - #tr(b.text)
  ]
]

= #L.projects
#for p in projects.filter(p => p.featured).slice(0, 4) [
  - *#p.name* — #tr(p.summary) #text(size: 8pt, fill: luma(70), "(" + p.tech.slice(0, 4).join(", ") + ")")
]

= #L.skills
#for g in skills [
  #let core = g.items.filter(s => s.at("core", default: false))
  #if core.len() > 0 [
    *#tr(g.group):* #core.map(s => s.name + if "years" in s { " (" + str(s.years) + ")" } else { "" }).join(" · ")\
  ]
]

= #L.education
#edu.education.map(e => [*#tr(e.degree)*, #tr(e.school) (#e.start–#e.end)]).join[ · ]
#linebreak()
*#L.certifications:* #edu.certifications.map(c => tr(c.name) + " (" + c.date.slice(0, 4) + ")").join(" · ")
