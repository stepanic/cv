import type { Metadata } from "next";
import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { loadCvData } from "@/lib/data";
import "./globals.css";

const SITE_URL = "https://stepanic.domovina.ai";
const TITLE = "Matija Stepanić — Senior Software Engineer";

function bilingualEn(v: string | { en: string; hr: string }): string {
  return typeof v === "string" ? v : v.en;
}

export function generateMetadata(): Metadata {
  const { profile } = loadCvData();
  const description = bilingualEn(profile.summary).trim();
  return {
    metadataBase: new URL(SITE_URL),
    title: TITLE,
    description,
    alternates: {
      canonical: SITE_URL,
      languages: {
        en: `${SITE_URL}/?lang=en`,
        hr: `${SITE_URL}/?lang=hr`,
      },
    },
    openGraph: {
      type: "profile",
      url: SITE_URL,
      title: TITLE,
      description,
      siteName: "Matija Stepanić",
      locale: "en_US",
      alternateLocale: "hr_HR",
    },
    twitter: {
      card: "summary",
      title: TITLE,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const { profile } = loadCvData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: SITE_URL,
    email: `mailto:${profile.email}`,
    jobTitle: "Senior Software Engineer",
    worksFor: {
      "@type": "Organization",
      name: profile.company,
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Zagreb, Faculty of Electrical Engineering and Computing (FER)",
    },
    sameAs: profile.links.map((l) => l.url),
  };

  return (
    // The i18n provider keeps html[lang] in sync with the chosen locale.
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          // JSON-LD Person schema for rich search results.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
