import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxLength: 500 },
    location: { type: String, default: '' },
    developerRole: { type: String, default: 'Full Stack Developer' },
    experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
    skills: [{ type: String }],
    socialLinks: {
      github: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' }
    },
    role: { type: String, enum: ['admin', 'pro', 'free'], default: 'free' },
    subscription: { type: String, enum: ['free', 'pro'], default: 'free' },
    isBanned: { type: Boolean, default: false },
    usage: {
      chats: { type: Number, default: 0 },
      codeGen: { type: Number, default: 0 },
      files: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
    },
    dailyUsage: { type: Number, default: 0 },
    lastUsageDate: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    // Fallback for manually inserted plaintext passwords in the database
    return enteredPassword === this.password;
  }
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.resetDailyUsageIfNeeded = function () {
  const today = new Date().toDateString();
  const last = new Date(this.lastUsageDate).toDateString();
  if (today !== last) {
    this.dailyUsage = 0;
    this.lastUsageDate = new Date();
  }
};

export default mongoose.model('User', userSchema);
