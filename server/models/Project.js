import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  framework: String,
  path: String, // Server-side path if running locally
  fileTree: {
    type: Object, // Virtual tree if cloud
    default: {}
  },
  settings: {
    theme: { type: String, default: 'cyberpunk' },
    layout: { type: Array, default: [] },
  },
  memory: {
    contextSummary: String,
    recentErrors: [String],
    dependencies: [String],
  }
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
