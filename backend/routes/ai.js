// backend/routes/ai.js
// ---------------------------------------------------------------
// POST /optimize-cv
// Optional AI-powered resume optimization. This route is designed to
// be safe by default:
//   - if no API key is configured, it returns the original resume
//   - if the provider call fails, it returns the original resume
//   - it never mutates persisted data on its own
// ---------------------------------------------------------------

require('dotenv').config();

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

router.post('/', async (req, res) => {
  console.log('AI route hit');
  console.log('REQ BODY:', req.body);

  const { resumeData, jobDescription } = req.body || {};

  console.log('API KEY EXISTS:', !!process.env.GEMINI_API_KEY);
  console.log('JOB DESCRIPTION:', jobDescription);

  if (!resumeData || typeof resumeData !== 'object' || Array.isArray(resumeData)) {
    return res.status(400).json({ error: 'Missing "resumeData" in body.' });
  }

  // Short-circuit at the route level if the JD is empty — nothing to optimize against.
  if (!jobDescription || jobDescription.trim() === '') {
    return res.json({ success: false, message: 'No job description' });
  }

  try {
    const result = await optimizeResume(resumeData, jobDescription);
    return res.json(result);
  } catch (err) {
    console.error('Gemini ERROR:', err.message);
    return res.json({ success: false, fallback: true });
  }
});

async function optimizeResume(resumeData, jobDescription) {
  const apiKey = process.env.GEMINI_API_KEY;
  // Add your Gemini API key in backend/.env
  if (!isGeminiConfigured(apiKey)) {
    return {
      resumeData,
      optimized: false,
      configured: false,
      fallback: true,
      message: 'Gemini is not configured, so the original resume is still being used.',
    };
  }

  if (!jobDescription || jobDescription.trim() === '') {
    console.log('No job description provided');
    return {
      success: false,
      resumeData,
      optimized: false,
      configured: true,
      fallback: true,
      message: 'No job description',
    };
  }

  const optimizedResume = await callGemini(resumeData, jobDescription, apiKey);
  const changed = JSON.stringify(optimizedResume) !== JSON.stringify(resumeData);

  if (!changed) {
    // Two distinct reasons this can happen:
    //   a) callGemini hit a parse/network error and fell back to the original
    //      (you'll see a warn/error a few lines above in the log)
    //   b) Gemini genuinely returned content equivalent to the input
    console.log('Optimizer produced no change vs. original resume');
  } else {
    console.log('Optimizer produced an updated resume');
  }

  return {
    resumeData: optimizedResume,
    optimized: changed,
    configured: true,
    fallback: !changed,
    message: changed
      ? 'Preview updated with optimized wording. Your original entries are still preserved.'
      : 'Gemini returned no usable changes, so the original resume is still being used.',
  };
}

// Comma-separated list of models to try in order. Defaults cover the
// current v1beta-supported fast models so a 503 on one rolls over to
// the next. Override via GEMINI_MODEL in .env, e.g.
//   GEMINI_MODEL=gemini-2.0-flash,gemini-2.5-flash,gemini-2.0-flash-lite
function getModelCandidates() {
  const raw = process.env.GEMINI_MODEL
    || 'gemini-2.0-flash,gemini-2.5-flash,gemini-2.0-flash-lite,gemini-2.5-pro';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

// True for errors Google tells us are transient — worth retrying.
function isTransientError(err) {
  const msg = String(err?.message || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('overload') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('fetch failed') ||
    msg.includes('timeout') ||
    msg.includes('econnreset')
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini(resumeData, jobDescription, apiKey) {
  console.log('Initializing Gemini...');
  const client = new GoogleGenerativeAI(apiKey);
  const prompt = buildPrompt(resumeData, jobDescription);
  const models = getModelCandidates();
  console.log('Gemini model candidates:', models.join(' -> '));

  const maxAttemptsPerModel = 3;
  let lastError = null;

  for (const modelName of models) {
    const model = client.getGenerativeModel({
      model: modelName,
      // Force JSON output at the model level — eliminates parse failures
      // caused by the model wrapping JSON in prose or markdown fences.
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt++) {
      try {
        if (attempt > 1) {
          const waitMs = 500 * 2 ** (attempt - 1); // 1s, 2s, 4s
          console.log(`  retry ${attempt}/${maxAttemptsPerModel} on ${modelName} after ${waitMs}ms...`);
          await sleep(waitMs);
        } else {
          console.log(`Sending request to Gemini (model=${modelName}, attempt ${attempt})...`);
        }

        const result = await model.generateContent(prompt);
        console.log('Received response from Gemini');

        const text = result?.response?.text?.();
        console.log('AI response length:', text?.length || 0);
        console.log('AI response preview:', (text || '').slice(0, 300));

        if (!text) {
          console.warn('Gemini returned empty text — falling back to original resume');
          return resumeData;
        }

        const parsed = safeParseResumeJSON(text);
        if (!parsed) {
          console.warn('Gemini response could not be parsed as JSON — falling back');
          return resumeData;
        }
        console.log('Parsed Gemini JSON — top-level keys:', Object.keys(parsed));

        return sanitizeOptimizedResume(resumeData, parsed);
      } catch (err) {
        lastError = err;
        const transient = isTransientError(err);
        console.warn(
          `Gemini attempt failed (model=${modelName}, attempt=${attempt}, transient=${transient}): ${err.message?.slice(0, 200)}`
        );
        if (!transient) break; // non-transient → don't waste retries on same model, try next one
      }
    }
    console.warn(`Model ${modelName} exhausted — trying next candidate.`);
  }

  console.error('Gemini ERROR:', lastError?.message || 'all models failed');
  return resumeData;
}

function buildPrompt(resumeData, jobDescription) {
  return [
    'You are a professional resume optimizer.',
    '',
    'TASK',
    'Rewrite the text values inside the provided resume JSON so the resume',
    'better matches the given job description. Use stronger action verbs,',
    'clearer phrasing, and emphasise skills and experience relevant to the',
    'role. Reorder or rephrase skills to align with the job description.',
    '',
    'STRICT RULES',
    '- Do NOT invent new employers, dates, degrees, or qualifications.',
    '- Do NOT change or add JSON keys. Keep the exact same structure.',
    '- Do NOT remove any sections or array entries.',
    '- Preserve array lengths — rewrite content inside each existing entry.',
    '- Keep placeholders (empty strings, nulls) that already exist.',
    '',
    'OUTPUT FORMAT — THIS IS CRITICAL',
    'Return ONLY a valid JSON object with the same top-level keys as the',
    'input. Do NOT wrap it in markdown, do NOT add commentary, do NOT',
    'prefix or suffix it with any prose. The first character of your',
    'response must be "{" and the last character must be "}".',
    '',
    'JOB DESCRIPTION',
    jobDescription,
    '',
    'RESUME JSON',
    JSON.stringify(resumeData, null, 2),
  ].join('\n');
}

// Multi-strategy JSON extractor: tries direct parse first (the happy path
// when responseMimeType=application/json), then strips ```json fences,
// and finally falls back to slicing from the first "{" to the last "}".
// This handles every shape Gemini has historically produced.
function safeParseResumeJSON(rawText = '') {
  const trimmed = String(rawText).trim();
  if (!trimmed) return null;

  // 1. Direct parse — expected when the model returned pure JSON.
  try {
    return JSON.parse(trimmed);
  } catch (_) { /* fall through */ }

  // 2. Strip a markdown fence like ```json ... ```
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch (_) { /* fall through */ }
  }

  // 3. Last resort: carve out the first complete JSON object in the text.
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch (_) { /* fall through */ }
  }

  return null;
}

function sanitizeOptimizedResume(original, optimized) {
  if (!optimized || typeof optimized !== 'object' || Array.isArray(optimized)) {
    return original;
  }

  return {
    ...original,
    ...optimized,
    education: sanitizeArray(original.education, optimized.education),
    experience: sanitizeArray(original.experience, optimized.experience),
    projects: sanitizeArray(original.projects, optimized.projects),
    customSections: sanitizeArray(original.customSections, optimized.customSections),
    skills: Array.isArray(optimized.skills) ? optimized.skills.filter(Boolean) : (original.skills || []),
    skillsTitle:
      typeof optimized.skillsTitle === 'string'
        ? optimized.skillsTitle
        : (original.skillsTitle || 'Skills'),
  };
}

function sanitizeArray(originalValue, optimizedValue) {
  return Array.isArray(optimizedValue) ? optimizedValue : (originalValue || []);
}

function isGeminiConfigured(apiKey = '') {
  const value = String(apiKey || '').trim();
  return Boolean(value) && value !== 'your_api_key_here';
}

module.exports = router;
