import jwt from 'jsonwebtoken';
import {JWT_SECRET } from '../config/env.js';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export default {
  generateToken,
  verifyToken,
};
