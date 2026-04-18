// frontend/pages/index.js
// ---------------------------------------------------------------
// Home / builder page. Clean two-column SaaS layout:
//   - Top: slim toolbar (logo, theme + template switchers, download)
//   - Left: form (scrollable)
//   - Right: live preview (sticky on large screens)
//
// Owns the single source of truth for resume data, theme, and
// template, and coordinates the PDF download.
// ---------------------------------------------------------------

import { useState } from 'react';
import Head from 'next/head';
import ResumeForm from '../components/ResumeForm';
import LivePreview from '../components/LivePreview';

// Sample data so new users land on a populated preview.
const DEFAULT_RESUME = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+1 555-0100',
  location: 'London, UK',
  linkedin: 'linkedin.com/in/ada-lovelace',
  github: 'github.com/ada-lovelace',
  photo: '',
  summary:
    'Mathematician and writer, known for work on the Analytical Engine. Passionate about the intersection of art and science.',
  education: [
    { school: 'Self-taught', degree: 'Mathematics & Logic', year: '1835' },
  ],
  experience: [
    {
      company: 'Analytical Engine Project',
      role: 'Collaborator',
      duration: '1842 – 1843',
      description:
        'Wrote the first published algorithm intended to be processed by a machine.',
    },
  ],
  projects: [
    {
      title: 'Notes on the Analytical Engine',
      description:
        'Extensive notes including what many consider the first computer program.',
      link: 'https://en.wikipedia.org/wiki/Analytical_Engine',
    },
  ],
  customSections: [
    {
      title: 'Achievements',
      content:
        'Published pioneering technical notes that helped shape the future of computing.',
    },
  ],
  skills: ['Mathematics', 'Algorithms', 'Technical Writing'],
};

// Theme = a single accent color. Kept intentionally simple — no gradients.
// Each entry only needs a human label; the actual colors are resolved
// inside the template components and the backend HTML generator.
const THEMES = [
  { key: 'slate',   label: 'Slate'   },
  { key: 'indigo',  label: 'Indigo'  },
  { key: 'emerald', label: 'Emerald' },
];

export default function Home() {
  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [template, setTemplate] = useState('classic');
  const [theme, setTheme] = useState('slate');
  const [downloading, setDownloading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  /**
   * POST the current resume data to the backend and trigger a file download.
   */
  async function handleDownload() {
    try {
      setDownloading(true);
      const res = await fetch(`${apiUrl}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: resume, template, theme }),
      });
      if (!res.ok) throw new Error(`PDF request failed (${res.status})`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(resume.name || 'resume').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Could not generate PDF. Please confirm the backend is running on port 5000.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Cviator Pro — Smart Resume Builder</title>
        <meta name="description" content="Build and download beautiful resumes in seconds." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      {/* ===================== Top bar ===================== */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
              C
            </div>
            <span className="text-base font-semibold text-slate-900">
              Cviator <span className="font-normal text-slate-500">Pro</span>
            </span>
          </div>

          {/* Switchers — pushed to the right */}
          <div className="ml-auto flex flex-wrap items-center gap-4">
            <SegmentedControl
              label="Template"
              value={template}
              onChange={setTemplate}
              options={[
                { value: 'classic', label: 'Classic' },
                { value: 'modern',  label: 'Modern'  },
              ]}
            />
            <SegmentedControl
              label="Accent"
              value={theme}
              onChange={setTheme}
              options={THEMES.map((t) => ({ value: t.key, label: t.label }))}
            />
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>
      </header>

      {/* ===================== Body ===================== */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* -------- Form column -------- */}
          <section>
            <div className="mb-5">
              <h1 className="text-xl font-semibold text-slate-900">
                Build your resume
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Fill in each section. The preview updates instantly.
              </p>
            </div>
            <ResumeForm resume={resume} setResume={setResume} />
          </section>

          {/* -------- Preview column -------- */}
          <section className="lg:sticky lg:top-20 lg:self-start">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Preview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  What you see is what the PDF will look like.
                </p>
              </div>
              <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 capitalize">
                {template}
              </span>
            </div>

            <div className="max-h-[calc(100vh-11rem)] overflow-y-auto scroll-thin rounded-lg border border-slate-200 bg-slate-100 p-4">
              <LivePreview resume={resume} template={template} theme={theme} />
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          Built with Next.js, Tailwind, Express, and Puppeteer.
        </div>
      </footer>
    </>
  );
}

/**
 * Segmented control — a tight pill group used for template + accent switchers.
 */
function SegmentedControl({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-medium uppercase tracking-wider text-slate-500 sm:inline">
        {label}
      </span>
      <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
