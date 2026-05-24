import mongoose from 'mongoose';

const commandHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  command: {
    type: String,
    required: true,
  },
  output: String,
  exitCode: Number,
  success: Boolean,
  aiExplanation: String,
}, { timestamps: true });

export default mongoose.models.CommandHistory || mongoose.model('CommandHistory', commandHistorySchema);
