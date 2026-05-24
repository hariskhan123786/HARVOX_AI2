import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    status: { type: String, enum: ['active', 'pending', 'expired', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    paymentHistory: [
      {
        amount: Number,
        method: String,
        transactionId: String,
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        screenshotUrl: String,
        rejectionReason: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Subscription', subscriptionSchema);
