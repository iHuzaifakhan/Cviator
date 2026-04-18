// backend/routes/ai.js
// ---------------------------------------------------------------
// POST /improve-text
// Placeholder endpoint for AI-powered text rewriting. Right now it
// returns a simple mock transformation so the frontend UX works
// end-to-end without any API keys.
//
// When you're ready to plug in a real LLM (Anthropic, OpenAI, etc.),
// replace the block marked `// TODO: integrate real AI API` below.
// ---------------------------------------------------------------

const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { text = '', tone = 'professional' } = req.body || {};

  if (!text.trim()) {
    return res.status(400).json({ error: 'Missing "text" in body.' });
  }

  try {
    // ----------------------------------------------------------
    // TODO: integrate real AI API here.
    // Example using Anthropic (pseudo-code):
    //
    //   const Anthropic = require('@anthropic-ai/sdk');
    //   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    //   const msg = await client.messages.create({
    //     model: 'claude-sonnet-4-6',
    //     max_tokens: 512,
    //     messages: [{
    //       role: 'user',
    //       content: `Rewrite this resume bullet in a ${tone} tone:\n\n${text}`,
    //     }],
    //   });
    //   const improved = msg.content[0].text;
    //
    // For now we return a lightweight deterministic mock so the
    // frontend works out-of-the-box.
    // ----------------------------------------------------------
    const improved = mockImprove(text, tone);

    res.json({ improved, tone, mocked: true });
  } catch (err) {
    console.error('improve-text failed:', err);
    res.status(500).json({ error: 'Failed to improve text', details: err.message });
  }
});

// Cheap placeholder transform — capitalizes, trims, and injects a
// resume-style action verb prefix. Replace once real AI is wired up.
function mockImprove(text, tone) {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  const prefix = tone === 'casual' ? 'Worked on' : 'Delivered';
  const withPrefix = /^[A-Z]/.test(trimmed) ? trimmed : `${prefix} ${trimmed}`;
  return withPrefix.replace(/\.*$/, '.');
}

module.exports = router;
