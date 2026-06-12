"use client";

import type { ReactNode } from "react";

export function Section({
  id,
  heading,
  subheading,
  children,
}: {
  id: string;
  heading: string;
  subheading?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-b border-line py-16 sm:py-20">
      <div className="container">
        <h2 className="text-display-md font-bold text-ink">
          <span className="mr-3 text-accent-bright" aria-hidden>
            #
          </span>
          {heading}
        </h2>
        {subheading ? (
          <p className="mt-2 max-w-2xl text-sm text-inkMuted">{subheading}</p>
        ) : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
