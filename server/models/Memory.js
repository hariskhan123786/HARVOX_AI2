import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['identity', 'preferences', 'project', 'conversation', 'activity'],
    required: true
  },
  key: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Index for fast queries
memorySchema.index({ userId: 1, category: 1 });
memorySchema.index({ userId: 1, isPinned: -1 });

export default mongoose.models.Memory || mongoose.model('Memory', memorySchema);
