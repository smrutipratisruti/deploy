import mongoose, { Schema, model, models } from 'mongoose';

const ResumeSchema = new Schema({
  userId: { type: String, required: true }, // We'll link this to Auth later
  fileName: { type: String, required: true },
  content: { type: String, required: true }, // The raw text from the PDF
  analysis: {
    skills: [String],
    atsScore: Number,
    improvements: [String],
  },
  createdAt: { type: Date, default: Date.now },
});

// This "models.Resume || model..." bit is crucial for Next.js 
// because it prevents re-defining the model on every hot reload.
const Resume = models.Resume || model('Resume', ResumeSchema);
export default Resume;