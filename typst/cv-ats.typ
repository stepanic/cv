// ATS-friendly variant — strictly single column, standard section names,
// no graphics, no color, machine-parseable layout.
#import "lib.typ": *

#set page(margin: 2cm)
#set text(font: "Libertinus Serif", size: 10.5pt, lang: lang)
#set par(justify: false)

#show heading.where(level: 1): it => block(above: 12pt, below: 6pt)[
  #text(size: 12pt, weight: "bold", upper(it.body))
]

#text(size: 16pt, weight: "bold", profile.name_ascii)\
#tr(profile.title)\
#tr(profile.location)\
Email: #profile.email\
Web: #profile.website\
#for l in profile.links [#l.label: #l.url \ ]

= #L.summary
#tr(profile.summary)

= #L.experience
#for job in experience [
  #block(above: 8pt, breakable: false)[
    *#tr(job.role)*\
    #tr(job.company) | #fmt-period(job.start, job.at("end", default: none)) | #tr(job.at("location", default: ""))
  ]
  #for b in job.bullets [
    - #tr(b.text)
  ]
]

= #L.projects
#for p in projects.filter(p => p.featured) [
  #block(above: 6pt, breakable: false)[*#p.name* (#p.tech.join(", "))]
  #tr(p.summary)
]

= #L.skills
#for g in skills [
  #tr(g.group): #g.items.map(s => s.name).join(", ")\
]

= #L.education
#for e in edu.education [
  *#tr(e.degree)*\
  #tr(e.school), #e.start – #e.end\
]

= #L.certifications
#for c in edu.certifications [
  - #tr(c.name), #c.issuer, #c.date
]

= #L.languages
#profile.languages.map(l => tr(l.name) + ": " + tr(l.level)).join("; ")
