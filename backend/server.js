// backend/server.js
// ---------------------------------------------------------------
// Main entry point for the Cviator Pro backend.
// Sets up Express, CORS, JSON parsing, optional MongoDB connection,
// and mounts all route modules.
// ---------------------------------------------------------------

require('dotenv').config();           // load .env into process.env

// Debug: confirm the Gemini key is actually loaded (don't print the value).
console.log('ENV KEY EXISTS:', !!process.env.GEMINI_API_KEY);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Route modules (each file registers one concern: pdf, resume CRUD, AI)
const pdfRoutes = require('./routes/pdf');
const resumeRoutes = require('./routes/resume');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------- Middleware ----------------
// Allow the frontend (running on a different origin) to call the API.
app.use(cors());
// Parse JSON bodies up to 2MB (resumes are small but leave headroom).
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple request logger — helps debugging while running locally.
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ---------------- Routes ----------------
app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'Cviator Pro API', version: '1.0.0' });
});

app.use('/generate-pdf', pdfRoutes);   // POST /generate-pdf
app.use('/', resumeRoutes);            // POST /save-resume, GET /resume/:id
app.use('/optimize-cv', aiRoutes);     // POST /optimize-cv

// ---------------- Optional DB connection ----------------
// We only connect to MongoDB if USE_DB=true in the environment.
// This keeps the project runnable out-of-the-box with zero infra.
if (process.env.USE_DB === 'true') {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      console.error('   The server will continue running without DB support.');
    });
} else {
  console.log('ℹ️  USE_DB=false — running without MongoDB persistence.');
}

// ---------------- Start server ----------------
app.listen(PORT, () => {
  console.log(`🚀 Cviator backend listening on http://localhost:${PORT}`);
});
