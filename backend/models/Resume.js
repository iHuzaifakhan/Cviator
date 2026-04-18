const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema(
  {
    school: String,
    degree: String,
    year: String,
  },
  { _id: false }
);

const ExperienceSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    duration: String,
    description: String,
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    link: String,
  },
  { _id: false }
);

const CustomSectionSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
  },
  { _id: false }
);

const ResumeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    photo: String,
    summary: String,
    education: [EducationSchema],
    experience: [ExperienceSchema],
    projects: [ProjectSchema],
    customSections: [CustomSectionSchema],
    skills: [String],
    template: { type: String, default: 'classic' },
    theme: { type: String, default: 'aurora' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', ResumeSchema);
