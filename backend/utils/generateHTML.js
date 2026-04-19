// backend/utils/generateHTML.js
// ---------------------------------------------------------------
// Converts a resume data object + chosen template + theme into a
// full HTML document string that Puppeteer renders to PDF.
//
// The visual style here intentionally mirrors the React templates
// in frontend/components/templates/* so the PDF matches the live
// preview closely.
// ---------------------------------------------------------------

const themes = {
  slate: {
    accent: '#334155',
    sidebarBg: '#1e293b',
    sidebarAcc: '#94a3b8',
  },
  indigo: {
    accent: '#4f46e5',
    sidebarBg: '#312e81',
    sidebarAcc: '#a5b4fc',
  },
  emerald: {
    accent: '#059669',
    sidebarBg: '#064e3b',
    sidebarAcc: '#6ee7b7',
  },
};

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toExternalUrl(value = '') {
  if (!value) return '#';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function stripProtocol(value = '') {
  return String(value || '').replace(/^https?:\/\//i, '');
}

function getInitials(name = '') {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!words.length) return 'CP';
  return words.map((w) => w[0].toUpperCase()).join('');
}

function sectionTag(title, accent) {
  return `<h2 style="color:${accent};border-bottom:1px solid ${accent}33">${esc(title)}</h2>`;
}

function multilineBody(text = '') {
  if (!text) return '';
  return `<p class="body">${esc(text).replace(/\r?\n/g, '<br />')}</p>`;
}

function classicTemplate(d, t) {
  const contact = [d.email, d.phone, d.location].filter(Boolean).map(esc).join(' • ');
  const social = [stripProtocol(d.linkedin), stripProtocol(d.github)].filter(Boolean).map(esc).join(' • ');
  const photo = d.photo
    ? `<img class="photo" src="${esc(d.photo)}" alt="${esc(d.name || 'Profile')}" />`
    : '';

  const renderEntryHeader = (left, sub, right) => `
    <div class="entry-header">
      <div>
        <div class="entry-left">${esc(left || '')}</div>
        ${sub ? `<div class="entry-sub" style="color:${t.accent}">${esc(sub)}</div>` : ''}
      </div>
      ${right ? `<div class="entry-right">${esc(right)}</div>` : ''}
    </div>`;

  const experience = (d.experience || []).map((ex) => `
    <div>
      ${renderEntryHeader(ex.company, ex.role, ex.duration)}
      ${multilineBody(ex.description)}
    </div>`).join('');

  const education = (d.education || []).map((ed) =>
    renderEntryHeader(ed.school, ed.degree, ed.year)
  ).join('');

  const projects = (d.projects || []).map((pr) => `
    <div>
      <div class="entry-header">
        <div class="entry-left">${esc(pr.title || '')}</div>
        ${pr.link ? `<a class="link-muted" href="${esc(toExternalUrl(pr.link))}">${esc(stripProtocol(pr.link))}</a>` : ''}
      </div>
      ${multilineBody(pr.description)}
    </div>`).join('');

  const skills = (d.skills || []).filter(Boolean).map(esc).join(' • ');
  const customs = (d.customSections || [])
    .filter((s) => s?.title || s?.content)
    .map((s) => `
      <section>
        ${sectionTag(s.title || 'Custom Section', t.accent)}
        ${multilineBody(s.content)}
      </section>`).join('');

  return `
    <article class="classic">
      <header class="classic-header">
        ${photo}
        <div class="header-main">
          <h1>${esc(d.name || 'Your Name')}</h1>
          ${contact ? `<div class="contact">${contact}</div>` : ''}
          ${social ? `<div class="contact muted">${social}</div>` : ''}
        </div>
      </header>

      ${d.summary ? `
        <section>
          ${sectionTag('Summary', t.accent)}
          ${multilineBody(d.summary)}
        </section>` : ''}

      <section>
        ${sectionTag('Experience', t.accent)}
        <div class="stack">${experience}</div>
      </section>

      <section>
        ${sectionTag('Education', t.accent)}
        <div class="stack">${education}</div>
      </section>

      <section>
        ${sectionTag('Projects', t.accent)}
        <div class="stack">${projects}</div>
      </section>

      ${skills ? `
      <section>
        ${sectionTag(d.skillsTitle || 'Skills', t.accent)}
        <p class="body">${skills}</p>
      </section>` : ''}

      ${customs}
    </article>`;
}

function modernTemplate(d, t) {
  const photo = d.photo
    ? `<img class="photo photo-dark" src="${esc(d.photo)}" alt="${esc(d.name || 'Profile')}" />`
    : `<div class="photo photo-dark photo-initials">${esc(getInitials(d.name))}</div>`;

  const info = (label, value, href) => {
    if (!value) return '';
    const body = href
      ? `<a class="info-link" href="${esc(href)}">${esc(value)}</a>`
      : `<div>${esc(value)}</div>`;
    return `
      <div class="info-row">
        <div class="info-label">${esc(label)}</div>
        ${body}
      </div>`;
  };

  const skills = (d.skills || []).filter(Boolean)
    .map((s) => `<span class="chip">${esc(s)}</span>`).join('');

  const sidebar = `
    <aside style="background:${t.sidebarBg}">
      ${photo}
      <h1 class="sidebar-name">${esc(d.name || 'Your Name')}</h1>

      <div class="info-stack" style="color:${t.sidebarAcc}">
        ${info('Email', d.email)}
        ${info('Phone', d.phone)}
        ${info('Location', d.location)}
        ${info('LinkedIn', stripProtocol(d.linkedin), d.linkedin && toExternalUrl(d.linkedin))}
        ${info('GitHub', stripProtocol(d.github), d.github && toExternalUrl(d.github))}
      </div>

      ${skills ? `
        <div class="sidebar-section">
          <h2 class="sidebar-heading">${esc(d.skillsTitle || 'Skills')}</h2>
          <div class="chips">${skills}</div>
        </div>` : ''}
    </aside>`;

  const renderEntryHeader = (left, sub, right) => `
    <div class="entry-header">
      <div>
        <div class="entry-left">${esc(left || '')}</div>
        ${sub ? `<div class="entry-sub" style="color:${t.accent}">${esc(sub)}</div>` : ''}
      </div>
      ${right ? `<div class="entry-right">${esc(right)}</div>` : ''}
    </div>`;

  const experience = (d.experience || []).map((ex) => `
    <div>
      ${renderEntryHeader(ex.company, ex.role, ex.duration)}
      ${multilineBody(ex.description)}
    </div>`).join('');

  const education = (d.education || []).map((ed) =>
    renderEntryHeader(ed.school, ed.degree, ed.year)
  ).join('');

  const projects = (d.projects || []).map((pr) => `
    <div>
      <div class="entry-header">
        <div class="entry-left">${esc(pr.title || '')}</div>
        ${pr.link ? `<a class="link-muted" href="${esc(toExternalUrl(pr.link))}">${esc(stripProtocol(pr.link))}</a>` : ''}
      </div>
      ${multilineBody(pr.description)}
    </div>`).join('');

  const customs = (d.customSections || [])
    .filter((s) => s?.title || s?.content)
    .map((s) => `
      <section>
        ${sectionTag(s.title || 'Custom Section', t.accent)}
        ${multilineBody(s.content)}
      </section>`).join('');

  return `
    <article class="modern">
      ${sidebar}
      <main>
        ${d.summary ? `
          <section>
            ${sectionTag('About', t.accent)}
            ${multilineBody(d.summary)}
          </section>` : ''}

        <section>
          ${sectionTag('Experience', t.accent)}
          <div class="stack">${experience}</div>
        </section>

        <section>
          ${sectionTag('Education', t.accent)}
          <div class="stack">${education}</div>
        </section>

        <section>
          ${sectionTag('Projects', t.accent)}
          <div class="stack">${projects}</div>
        </section>

        ${customs}
      </main>
    </article>`;
}

function generateHTML(resumeData = {}, templateName = 'classic', themeName = 'slate') {
  const t = themes[themeName] || themes.slate;
  const body = templateName === 'modern'
    ? modernTemplate(resumeData, t)
    : classicTemplate(resumeData, t);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(resumeData.name || 'Resume')}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: 'Inter', Arial, Helvetica, sans-serif;
      color: #0f172a;
      font-size: 12px;
      line-height: 1.55;
      background: #ffffff;
    }
    a { color: inherit; text-decoration: none; }
    h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.01em; }
    h2 {
      margin: 0 0 8px 0;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      padding-bottom: 4px;
    }
    section { margin-top: 20px; }
    .stack { display: flex; flex-direction: column; gap: 12px; }
    .body { margin: 4px 0 0 0; color: #334155; }
    .muted { color: #64748b; }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
    }
    .entry-left { font-weight: 600; color: #0f172a; }
    .entry-sub { font-size: 12px; margin-top: 2px; }
    .entry-right { font-size: 11px; color: #64748b; white-space: nowrap; }
    .link-muted { font-size: 11px; color: #64748b; }
    .classic { padding: 40px; }
    .classic-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 4px;
    }
    .header-main { flex: 1; }
    .contact { margin-top: 4px; font-size: 12px; color: #475569; }
    .contact.muted { color: #64748b; }
    .photo {
      width: 80px;
      height: 80px;
      border-radius: 999px;
      object-fit: cover;
      border: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .modern {
      display: grid;
      grid-template-columns: 230px 1fr;
      min-height: 100vh;
    }
    .modern aside {
      padding: 28px 22px;
      color: #f1f5f9;
    }
    .photo-dark {
      border: 2px solid rgba(255,255,255,0.2);
    }
    .photo-initials {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.1);
      color: #ffffff;
      font-size: 22px;
      font-weight: 600;
    }
    .sidebar-name {
      margin-top: 16px;
      color: #ffffff;
      font-size: 20px;
      line-height: 1.2;
      font-weight: 700;
    }
    .info-stack {
      margin-top: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 11px;
    }
    .info-row { line-height: 1.4; }
    .info-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.6);
      margin-bottom: 2px;
    }
    .info-row div:not(.info-label),
    .info-link {
      color: #ffffff;
      word-break: break-word;
    }
    .sidebar-section { margin-top: 24px; }
    .sidebar-heading {
      color: rgba(255,255,255,0.9);
      border-bottom: 1px solid rgba(255,255,255,0.15);
    }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(255,255,255,0.1);
      color: #ffffff;
      font-size: 11px;
    }
    .modern main { padding: 32px 36px; background: #ffffff; }
    .modern main section:first-child { margin-top: 0; }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
}

module.exports = { generateHTML };
