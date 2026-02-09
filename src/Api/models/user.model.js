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
  
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

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

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; 
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);