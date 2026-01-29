import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // The big three required for signup
  name: { type: String, required: [true, "Name is required"], trim: true },
  email: { 
    type: String, 
    unique: true, 
    required: [true, "Email is required"], 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, "Password is required"], 
    select: false 
  },
  
  role: { 
    type: String, 
    enum: ['admin', 'teacher', 'student', 'parent'], 
    default: 'student' 
  },
  isActive: { type: Boolean, default: true },
  
  // This links the Login to the Academic Profile
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' }
}, { timestamps: true });

// Password hashing logic
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model('User', userSchema);