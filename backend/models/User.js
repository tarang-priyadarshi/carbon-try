// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'business'], default: 'user' },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  notificationSettings: { type: Object, default: {} },
  carbonEntries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CarbonEntry' }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model('User', userSchema);
