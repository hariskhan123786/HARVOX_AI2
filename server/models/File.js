import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String },
    mimeType: { type: String },
    analysis: { type: String, default: '' },
    extractedText: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('File', fileSchema);
