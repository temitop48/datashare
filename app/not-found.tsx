import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="ds-shell">
      <section className="ds-hero">
        <div className="ds-brand">
          <span className="ds-brand-dot" />
          Lost Signal
        </div>
        <h1 className="ds-title">Page not found</h1>
        <p className="ds-subtitle">
          The route you tried to open drifted out of this sector.
        </p>
      </section>

      <div className="ds-panel">
        <div className="ds-actions">
          <Link className="ds-link-button" href="/">Go home</Link>
          <Link className="ds-link-button" href="/datasets">Browse datasets</Link>
        </div>
      </div>
    </main>
  );
}