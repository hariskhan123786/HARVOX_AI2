import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema(
  {
    jazzCashNumber: { type: String, default: '' },
    jazzCashName: { type: String, default: '' },
    easyPaisaNumber: { type: String, default: '' },
    easyPaisaName: { type: String, default: '' },
    announcement: { type: String, default: '' },
    groqKey: { type: String, default: '' },
    maintenanceMode: { type: Boolean, default: false },
    proPriceMonthly: { type: Number, default: 500 },
    proPriceYearly: { type: Number, default: 5000 },
  },
  { timestamps: true }
);

export default mongoose.model('SystemSettings', systemSettingsSchema);
