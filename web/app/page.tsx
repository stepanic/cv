import { loadCvData } from "@/lib/data";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { ClaudeCode } from "@/components/ClaudeCode";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { Education } from "@/components/Education";
import { Footer } from "@/components/Footer";

// Server component: loads all YAML/JSON at build time and passes BOTH language
// variants down — the client components pick en/hr via the i18n context.
export default function Page() {
  const data = loadCvData();

  return (
    <>
      <Header />
      <main id="content">
        <Hero profile={data.profile} />
        <Stats github={data.github} />
        <ClaudeCode claude={data.claude} />
        <Experience items={data.experience} />
        <Projects projects={data.projects} />
        <Skills groups={data.skills} />
        <Education education={data.education} certifications={data.certifications} />
      </main>
      <Footer updated={data.github.updated} />
    </>
  );
}
