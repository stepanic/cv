import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogArticle } from "@/components/BlogArticle";
import { getPostsMeta, getRenderedPost } from "@/lib/blog";

const SITE_URL = "https://stepanic.domovina.ai";

export function generateStaticParams() {
  return getPostsMeta().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getRenderedPost(params.slug);
  if (!post) return {};
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${post.title.en} — Matija Stepanić`,
    description: post.lead.en,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title.en,
      description: post.lead.en,
      publishedTime: post.date,
    },
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getRenderedPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main id="content">
        <BlogArticle post={post} />
      </main>
      <Footer updated={post.date} />
    </>
  );
}
