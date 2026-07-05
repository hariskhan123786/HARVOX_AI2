import mongoose from 'mongoose';

const aiCallLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      index: true,
    },
    provider: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0.0,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
    isFailover: {
      type: Boolean,
      default: false,
    },
    failoverFromProvider: {
      type: String,
    },
    failoverFromModel: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const AICallLog = mongoose.model('AICallLog', aiCallLogSchema);
export default AICallLog;
