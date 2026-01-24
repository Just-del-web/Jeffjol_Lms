import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import logger from '../logging/logger.js';

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { 
    token, 
    user: { id: user._id, name: user.name, role: user.role } 
  };
};

export const registerUser = async (userData) => {
  const existing = await User.findOne({ email: userData.email });
  if (existing) throw new Error('User already exists');
  return await User.create(userData);
};