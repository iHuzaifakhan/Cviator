// frontend/components/ResumeForm.js
// ---------------------------------------------------------------
// Resume form. Flat white cards, one heading per section, consistent
// input styling. Groups inputs in this order:
//   1. Personal info    2. Social links    3. Summary
//   4. Experience       5. Education       6. Projects
//   7. Skills           8. Custom sections
//
// State flows up through `setResume` — the parent owns all data so
// the live preview stays in sync.
// ---------------------------------------------------------------

import { useState } from 'react';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

export default function ResumeForm({ resume, setResume }) {
  const [uploadError, setUploadError] = useState('');

  // ---- Generic updaters ----
  function updateField(key, value) {
    setResume((prev) => ({ ...prev, [key]: value }));
  }

  function updateArrayItem(key, index, field, value) {
    setResume((prev) => {
      const arr = [...(prev[key] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [key]: arr };
    });
  }

  function addArrayItem(key, blank) {
    setResume((prev) => ({ ...prev, [key]: [...(prev[key] || []), blank] }));
  }

  function removeArrayItem(key, index) {
    setResume((prev) => {
      const arr = [...(prev[key] || [])];
      arr.splice(index, 1);
      return { ...prev, [key]: arr };
    });
  }

  // Skills are stored as an array; the UI shows them as a CSV string.
  function updateSkills(csv) {
    const arr = csv.split(',').map((s) => s.trim()).filter(Boolean);
    updateField('skills', arr);
  }

  // ---- Photo upload ----
  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('Please upload a JPG or PNG image.');
      event.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image must be under 2 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField('photo', reader.result);
      setUploadError('');
    };
    reader.onerror = () =>
      setUploadError('Could not read that file. Try another image.');
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      {/* ---------------- 1. Personal info ---------------- */}
      <Section title="Personal information">
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Photo — compact widget: circular preview + upload/remove actions */}
          <div className="flex flex-shrink-0 items-start gap-4 sm:flex-col sm:items-center sm:gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
              {resume.photo ? (
                <img
                  src={resume.photo}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <PhotoPlaceholder />
              )}
            </div>

            <div className="flex flex-col items-start gap-1 sm:items-center">
              <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-700">
                {resume.photo ? 'Change' : 'Upload'}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
              {resume.photo && (
                <button
                  type="button"
                  onClick={() => updateField('photo', '')}
                  className="text-[11px] text-slate-400 hover:text-red-600"
                >
                  Remove
                </button>
              )}
              <p className="text-[11px] text-slate-400">JPG or PNG, ≤2 MB</p>
              {uploadError && (
                <p className="max-w-[10rem] text-[11px] text-red-600">{uploadError}</p>
              )}
            </div>
          </div>

          {/* Personal fields */}
          <div className="flex-1">
            <Grid>
              <Input label="Full name"  value={resume.name}     onChange={(v) => updateField('name', v)} />
              <Input label="Email"      value={resume.email}    onChange={(v) => updateField('email', v)} />
              <Input label="Phone"      value={resume.phone}    onChange={(v) => updateField('phone', v)} />
              <Input label="Location"   value={resume.location} onChange={(v) => updateField('location', v)} />
            </Grid>
          </div>
        </div>
      </Section>

      {/* ---------------- 2. Social links ---------------- */}
      <Section title="Social links">
        <Grid>
          <Input
            label="LinkedIn URL"
            value={resume.linkedin}
            placeholder="linkedin.com/in/your-name"
            onChange={(v) => updateField('linkedin', v)}
          />
          <Input
            label="GitHub URL"
            value={resume.github}
            placeholder="github.com/your-name"
            onChange={(v) => updateField('github', v)}
          />
        </Grid>
      </Section>

      {/* ---------------- 3. Summary ---------------- */}
      <Section title="Professional summary">
        <Textarea
          value={resume.summary}
          onChange={(v) => updateField('summary', v)}
          rows={4}
          placeholder="A short paragraph about who you are and what you do."
        />
      </Section>

      {/* ---------------- 4. Experience ---------------- */}
      <Section
        title="Experience"
        onAdd={() =>
          addArrayItem('experience', { company: '', role: '', duration: '', description: '' })
        }
      >
        {(resume.experience || []).map((ex, i) => (
          <RepeatItem key={`exp-${i}`} onRemove={() => removeArrayItem('experience', i)}>
            <Grid>
              <Input label="Company"  value={ex.company}  onChange={(v) => updateArrayItem('experience', i, 'company', v)} />
              <Input label="Role"     value={ex.role}     onChange={(v) => updateArrayItem('experience', i, 'role', v)} />
              <Input label="Duration" value={ex.duration} onChange={(v) => updateArrayItem('experience', i, 'duration', v)} />
            </Grid>
            <Textarea
              label="Description"
              value={ex.description}
              onChange={(v) => updateArrayItem('experience', i, 'description', v)}
              rows={3}
            />
          </RepeatItem>
        ))}
      </Section>

      {/* ---------------- 5. Education ---------------- */}
      <Section
        title="Education"
        onAdd={() => addArrayItem('education', { school: '', degree: '', year: '' })}
      >
        {(resume.education || []).map((ed, i) => (
          <RepeatItem key={`edu-${i}`} onRemove={() => removeArrayItem('education', i)}>
            <Grid>
              <Input label="School" value={ed.school} onChange={(v) => updateArrayItem('education', i, 'school', v)} />
              <Input label="Degree" value={ed.degree} onChange={(v) => updateArrayItem('education', i, 'degree', v)} />
              <Input label="Year"   value={ed.year}   onChange={(v) => updateArrayItem('education', i, 'year', v)} />
            </Grid>
          </RepeatItem>
        ))}
      </Section>

      {/* ---------------- 6. Projects ---------------- */}
      <Section
        title="Projects"
        onAdd={() => addArrayItem('projects', { title: '', description: '', link: '' })}
      >
        {(resume.projects || []).map((pr, i) => (
          <RepeatItem key={`proj-${i}`} onRemove={() => removeArrayItem('projects', i)}>
            <Grid>
              <Input label="Title" value={pr.title} onChange={(v) => updateArrayItem('projects', i, 'title', v)} />
              <Input label="Link"  value={pr.link}  onChange={(v) => updateArrayItem('projects', i, 'link', v)} />
            </Grid>
            <Textarea
              label="Description"
              value={pr.description}
              onChange={(v) => updateArrayItem('projects', i, 'description', v)}
              rows={3}
            />
          </RepeatItem>
        ))}
      </Section>

      {/* ---------------- 7. Skills ---------------- */}
      <Section title="Skills">
        <Input
          label="Comma-separated list"
          value={(resume.skills || []).join(', ')}
          placeholder="JavaScript, React, Node.js"
          onChange={updateSkills}
        />
      </Section>

      {/* ---------------- 8. Custom sections ---------------- */}
      <Section
        title="Custom sections"
        onAdd={() => addArrayItem('customSections', { title: '', content: '' })}
      >
        {(resume.customSections || []).map((section, i) => (
          <RepeatItem
            key={`custom-${i}`}
            onRemove={() => removeArrayItem('customSections', i)}
          >
            <Input
              label="Title"
              value={section.title}
              placeholder="Certifications, Awards, Volunteer work…"
              onChange={(v) => updateArrayItem('customSections', i, 'title', v)}
            />
            <Textarea
              label="Content"
              value={section.content}
              onChange={(v) => updateArrayItem('customSections', i, 'content', v)}
              rows={3}
            />
          </RepeatItem>
        ))}
      </Section>
    </div>
  );
}

/* ---------------------- Layout primitives ---------------------- */

/** Single form section — white card, subtle border, clear heading. */
function Section({ title, children, onAdd }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
          {title}
        </h3>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="text-xs font-medium text-brand-500 hover:text-brand-700"
          >
            + Add
          </button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Responsive 2-column grid for input pairs. */
function Grid({ children }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

/** Repeatable sub-card inside a section (one per experience/education/etc). */
function RepeatItem({ children, onRemove }) {
  return (
    <div className="relative rounded-md border border-slate-200 bg-slate-50 p-4">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 text-xs font-medium text-slate-400 hover:text-red-600"
        aria-label="Remove"
      >
        Remove
      </button>
      <div className="space-y-4 pr-16">{children}</div>
    </div>
  );
}

/** Plain text input — consistent size and focus ring. */
function Input({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <input
        type="text"
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

/** Neutral silhouette icon shown when no photo is uploaded. */
function PhotoPlaceholder() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-full w-full p-4 text-slate-400"
      aria-hidden="true"
    >
      <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.5 19.5c1.5-3.5 4.5-5 7.5-5s6 1.5 7.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Multi-line input — matches Input sizing. */
function Textarea({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      )}
      <textarea
        rows={rows}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
