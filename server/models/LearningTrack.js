import mongoose from 'mongoose';

const learningTrackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    enum: ['AI', 'Database', 'Software Engineering', 'Assembly Language'],
    required: true
  },
  hours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  lastStudied: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.LearningTrack || mongoose.model('LearningTrack', learningTrackSchema);
