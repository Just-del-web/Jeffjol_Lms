import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    unique: true, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['admin', 'teacher', 'student', 'parent'], 
    default: 'student' 
  },
  
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tokenVersion: { type: Number, default: 0 },
  
  lastActiveIp: String,
  lastLogin: Date,
  activeSessions: [{
    device: String,
    browser: String,
    os: String,
    ip: String,
    location: String,
    lastActive: { type: Date, default: Date.now }
  }],

  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' },

}, { timestamps: true });

userSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);