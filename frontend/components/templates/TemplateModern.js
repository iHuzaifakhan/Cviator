// frontend/components/templates/TemplateModern.js
// ---------------------------------------------------------------
// Modern template â€” two columns. Sidebar carries the photo, contact
// info and skills on a dark panel; main column carries experience,
// education, projects, and custom sections.
//
// One accent color per theme â€” no gradients.
// Mirrors backend/utils/generateHTML.js for PDF parity.
// ---------------------------------------------------------------

const themeStyles = {
  slate: {
    sidebarBg: '#1e293b',
    accent: '#94a3b8',
    heading: '#334155',
  },
  indigo: {
    sidebarBg: '#312e81',
    accent: '#a5b4fc',
    heading: '#4f46e5',
  },
  emerald: {
    sidebarBg: '#064e3b',
    accent: '#6ee7b7',
    heading: '#059669',
  },
};

export default function TemplateModern({ resume, theme = 'slate' }) {
  const r = resume || {};
  const s = themeStyles[theme] || themeStyles.slate;

  return (
    <article className="grid min-h-[1050px] grid-cols-1 bg-white text-[12px] text-slate-900 sm:grid-cols-[230px_1fr]">
      <aside className="p-6 text-slate-100" style={{ background: s.sidebarBg }}>
        {r.photo ? (
          <img
            src={r.photo}
            alt={r.name || 'Profile photo'}
            className="h-24 w-24 rounded-full border-2 border-white/20 object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-xl font-semibold">
            {getInitials(r.name)}
          </div>
        )}

        <h1 className="mt-4 text-xl font-bold leading-tight text-white">
          {r.name || 'Your Name'}
        </h1>

        <div className="mt-4 space-y-2 text-[11px]" style={{ color: s.accent }}>
          {r.email && <InfoRow label="Email" value={r.email} />}
          {r.phone && <InfoRow label="Phone" value={r.phone} />}
          {r.location && <InfoRow label="Location" value={r.location} />}
          {r.linkedin && (
            <InfoRow
              label="LinkedIn"
              value={stripProtocol(r.linkedin)}
              href={toExternalUrl(r.linkedin)}
            />
          )}
          {r.github && (
            <InfoRow
              label="GitHub"
              value={stripProtocol(r.github)}
              href={toExternalUrl(r.github)}
            />
          )}
        </div>

        {(r.skills || []).length > 0 && (
          <div className="mt-6">
            <SidebarHeading>{r.skillsTitle || 'Skills'}</SidebarHeading>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {r.skills.map((skill, i) => (
                <span
                  key={`skill-${i}`}
                  className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-white"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="p-8">
        {r.summary && (
          <Section title="About" accent={s.heading}>
            <MultilineText>{r.summary}</MultilineText>
          </Section>
        )}

        <Section title="Experience" accent={s.heading}>
          {(r.experience || []).map((ex, i) => (
            <div key={`exp-${i}`}>
              <EntryHeader
                left={ex.company}
                sub={ex.role}
                right={ex.duration}
                accent={s.heading}
              />
              {ex.description && (
                <MultilineText className="mt-1">{ex.description}</MultilineText>
              )}
            </div>
          ))}
        </Section>

        <Section title="Education" accent={s.heading}>
          {(r.education || []).map((ed, i) => (
            <EntryHeader
              key={`edu-${i}`}
              left={ed.school}
              sub={ed.degree}
              right={ed.year}
              accent={s.heading}
            />
          ))}
        </Section>

        <Section title="Projects" accent={s.heading}>
          {(r.projects || []).map((pr, i) => (
            <div key={`proj-${i}`}>
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
                <MultilineText className="mt-1">{pr.description}</MultilineText>
              )}
            </div>
          ))}
        </Section>

        {(r.customSections || []).map((sec, i) =>
          sec?.title || sec?.content ? (
            <Section
              key={`custom-${i}`}
              title={sec.title || 'Custom Section'}
              accent={s.heading}
            >
              <MultilineText>{sec.content}</MultilineText>
            </Section>
          ) : null
        )}
      </main>
    </article>
  );
}

function Section({ title, accent, children }) {
  return (
    <section className="mt-5 first:mt-0">
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

function SidebarHeading({ children }) {
  return (
    <h2 className="border-b border-white/10 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
      {children}
    </h2>
  );
}

function InfoRow({ label, value, href }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/60">
        {label}
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="block break-all text-white hover:underline"
        >
          {value}
        </a>
      ) : (
        <div className="text-white">{value}</div>
      )}
    </div>
  );
}

function MultilineText({ children, className = '' }) {
  return <p className={`whitespace-pre-line text-slate-700 ${className}`.trim()}>{children}</p>;
}

function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!words.length) return 'CP';
  return words.map((w) => w[0].toUpperCase()).join('');
}

function toExternalUrl(value = '') {
  if (!value) return '#';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function stripProtocol(value = '') {
  return (value || '').replace(/^https?:\/\//i, '');
}
