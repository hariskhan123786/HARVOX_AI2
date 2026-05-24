import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, default: 'Untitled Note' },
    content: { type: String, default: '' },
    source: { type: String, enum: ['manual', 'code', 'chat', 'file'], default: 'manual' },
    tags: [{ type: String }],
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, title: 'text', content: 'text' });

export default mongoose.model('Note', noteSchema);
