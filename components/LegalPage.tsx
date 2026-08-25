import Breadcrumbs from "@/components/Layout";
import type { ReactNode } from "react";

export default function LegalPage({
  title,
  updated = "August 2026",
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <article className="prose" style={{ maxWidth: 760 }}>
      <Breadcrumbs trail={[]} />
      <h1>{title}</h1>
      <p className="muted">Last updated: {updated}</p>
      {children}
    </article>
  );
}
