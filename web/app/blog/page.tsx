import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogIndex } from "@/components/BlogIndex";
import { getPostsMeta, latestPostDate } from "@/lib/blog";

const SITE_URL = "https://stepanic.domovina.ai";

export const metadata: Metadata = {
  title: "Blog — Matija Stepanić",
  description: "Occasional notes on AI-native engineering, Claude Code and the DOMOVINA platform.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default function BlogPage() {
  return (
    <>
      <Header />
      <main id="content">
        <BlogIndex posts={getPostsMeta()} />
      </main>
      <Footer updated={latestPostDate()} />
    </>
  );
}
