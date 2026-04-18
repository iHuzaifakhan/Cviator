// frontend/components/LivePreview.js
// ---------------------------------------------------------------
// Thin wrapper that picks a template by name and renders it on a
// clean A4-looking "paper" sheet. No extra chrome — the toolbar
// and headings live in the parent page.
// ---------------------------------------------------------------

import TemplateClassic from './templates/TemplateClassic';
import TemplateModern from './templates/TemplateModern';

const templates = {
  classic: TemplateClassic,
  modern:  TemplateModern,
};

export default function LivePreview({ resume, template, theme }) {
  const Template = templates[template] || TemplateClassic;

  return (
    <div className="mx-auto max-w-[820px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <Template resume={resume} theme={theme} />
    </div>
  );
}
