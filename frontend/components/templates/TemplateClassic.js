// frontend/components/templates/TemplateClassic.js
// ---------------------------------------------------------------
// Classic template — strictly minimal, black & white, print-ready.
// The accent `theme` only subtly colors section headings.
//
// Mirrors backend/utils/generateHTML.js so the PDF looks identical.
// ---------------------------------------------------------------

// Accent color per theme. Kept intentionally muted — this template
// is meant to look professional on any printer.
const accentFor = {
  slate:   '#334155',
  indigo:  '#4f46e5',
  emerald: '#059669',
};

export default function TemplateClassic({ resume, theme = 'slate' }) {
  const r = resume || {};
  const accent = accentFor[theme] || accentFor.slate;

  return (
    <article className="bg-white p-10 text-[12px] leading-relaxed text-slate-900">
      {/* Header */}
      <header className="mb-6 flex items-center gap-5 border-b border-slate-200 pb-5">
        {r.photo && (
          <img
            src={r.photo}
            alt={r.name || 'Profile photo'}
            className="h-20 w-20 rounded-full border border-slate-200 object-cover"
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {r.name || 'Your Name'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {[r.email, r.phone, r.location].filter(Boolean).join(' · ')}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {[stripProtocol(r.linkedin), stripProtocol(r.github)]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </header>

      {r.summary && (
        <Section title="Summary" accent={accent}>
          <p className="text-slate-700">{r.summary}</p>
        </Section>
      )}

      <Section title="Experience" accent={accent}>
        {(r.experience || []).map((ex, i) => (
          <Entry key={`exp-${i}`}>
            <EntryHeader
              left={ex.company}
              sub={ex.role}
              right={ex.duration}
              accent={accent}
            />
            {ex.description && (
              <p className="mt-1 text-slate-700">{ex.description}</p>
            )}
          </Entry>
        ))}
      </Section>

      <Section title="Education" accent={accent}>
        {(r.education || []).map((ed, i) => (
          <Entry key={`edu-${i}`}>
            <EntryHeader
              left={ed.school}
              sub={ed.degree}
              right={ed.year}
              accent={accent}
            />
          </Entry>
        ))}
      </Section>

      <Section title="Projects" accent={accent}>
        {(r.projects || []).map((pr, i) => (
          <Entry key={`proj-${i}`}>
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-semibold text-slate-900">{pr.title}</div>
              {pr.link && (
                <a
                  href={toExternalUrl(pr.link)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  {stripProtocol(pr.link)}
                </a>
              )}
            </div>
            {pr.description && (
              <p className="mt-1 text-slate-700">{pr.description}</p>
            )}
          </Entry>
        ))}
      </Section>

      <Section title="Skills" accent={accent}>
        <p className="text-slate-700">
          {(r.skills || []).join(' · ')}
        </p>
      </Section>

      {(r.customSections || []).map((sec, i) =>
        sec?.title || sec?.content ? (
          <Section
            key={`custom-${i}`}
            title={sec.title || 'Custom Section'}
            accent={accent}
          >
            <p className="text-slate-700">{sec.content}</p>
          </Section>
        ) : null
      )}
    </article>
  );
}

/* ---------- Small building blocks ---------- */

function Section({ title, accent, children }) {
  return (
    <section className="mt-5">
      <h2
        className="mb-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: accent, borderBottom: `1px solid ${accent}33` }}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Entry({ children }) {
  return <div>{children}</div>;
}

function EntryHeader({ left, sub, right, accent }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div>
        <div className="font-semibold text-slate-900">{left}</div>
        {sub && (
          <div className="text-[12px]" style={{ color: accent }}>
            {sub}
          </div>
        )}
      </div>
      {right && <div className="text-xs text-slate-500">{right}</div>}
    </div>
  );
}

/* ---------- URL helpers ---------- */

function toExternalUrl(value = '') {
  if (!value) return '#';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function stripProtocol(value = '') {
  return (value || '').replace(/^https?:\/\//i, '');
}
