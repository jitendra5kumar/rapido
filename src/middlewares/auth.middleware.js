const { jwt } = require('../utils');
const sessionCache = require('../cache/session.cache');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verifyToken(token);
    
    // Check if session exists in Redis
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

module.exports = authMiddleware;