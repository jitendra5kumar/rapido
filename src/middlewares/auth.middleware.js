import { jwt } from '../utils/index.js';
import sessionCache from '../cache/session.cache.js';

const authMiddleware = async (req, res, next) => {
  // const authHeader = req.header('Authorization');
  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   return res.status(401).json({ message: 'Access denied. No token provided.' });
  // }

  // const token = authHeader.substring(7);
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Zjk4ZDU3OGRhYmM2NWZhMGY0YzQ4NSIsInBob25lIjoiMTIzNDU2Nzg5MCIsInJvbGUiOiJzdWJfYWRtaW4iLCJpYXQiOjE3Nzc5ODAwNzcsImV4cCI6MTc3Nzk4MzY3N30.Lk3RpmrbA19f5X4wB5BceCUvLFpIzGKcOHKlu1Ay_4M"

  try {
    const decoded = jwt.verifyToken(token);

    const sessionToken = await sessionCache.getSession(decoded.id);
    if (!sessionToken || sessionToken !== token) {
      return res.status(401).json({ message: 'Invalid or expired session.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

export const requireRoles = (...allowedRoles) => (req, res, next) => {
  const role = req.user?.role;
  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({ message: 'Access denied. Invalid permissions.' });
  }
  next();
};

export default authMiddleware;
