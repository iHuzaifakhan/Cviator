// backend/routes/resume.js
// ---------------------------------------------------------------
// Optional database-backed endpoints for saving/loading resumes.
//
//   POST /save-resume   — stores a resume in MongoDB, returns its _id
//   GET  /resume/:id    — fetches a previously saved resume
//
// Both endpoints gracefully return 503 if USE_DB is not enabled.
// ---------------------------------------------------------------

const express = require('express');
const mongoose = require('mongoose');
const Resume = require('../models/Resume');

const router = express.Router();

// Guard helper: reject requests if the DB isn't connected.
function dbReady(res) {
  if (process.env.USE_DB !== 'true') {
    res.status(503).json({
      error: 'Database persistence is disabled. Set USE_DB=true to enable.',
    });
    return false;
  }
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: 'Database not connected.' });
    return false;
  }
  return true;
}

// ---- POST /save-resume ----
router.post('/save-resume', async (req, res) => {
  if (!dbReady(res)) return;

  try {
    const doc = await Resume.create(req.body);
    res.status(201).json({ id: doc._id, message: 'Resume saved.' });
  } catch (err) {
    console.error('save-resume failed:', err);
    res.status(500).json({ error: 'Failed to save resume', details: err.message });
  }
});

// ---- GET /resume/:id ----
router.get('/resume/:id', async (req, res) => {
  if (!dbReady(res)) return;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid resume id' });
    }
    const doc = await Resume.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Resume not found' });
    res.json(doc);
  } catch (err) {
    console.error('get-resume failed:', err);
    res.status(500).json({ error: 'Failed to fetch resume', details: err.message });
  }
});

module.exports = router;
