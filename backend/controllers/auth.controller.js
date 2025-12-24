// server/controllers/auth.controller.js
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env.js';
import { sendEmail } from '../utils/sendEmail.js';

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
};

// REGISTER
export const register = async (req, res) => {
  const { name, email, password, role, businessId } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email already in use' });

  const user = await User.create({ name, email, password, role, businessId });
  const token = generateToken(user);
  res.status(StatusCodes.CREATED).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });

  const token = generateToken(user);
  res.status(StatusCodes.OK).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  const resetUrl = `${env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `Click this link to reset your password:\n\n${resetUrl}`;

  try {
    await sendEmail({ to: user.email, subject: "Password Reset", text: message });
    res.json({ message: "Password reset email sent" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return res.status(500).json({ message: "Email could not be sent" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid or expired token" });

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};
