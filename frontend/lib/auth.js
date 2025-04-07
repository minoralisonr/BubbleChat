//lib/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-strong-secret-here';

export function createToken(payload) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '24h', // 24-hour expiry
    algorithm: 'HS256'
  });
}

// Add these new functions
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

export function checkTokenExpiry(token) {
  const decoded = jwt.decode(token);
  if (!decoded?.exp) return false;
  return decoded.exp * 1000 > Date.now(); // Convert to milliseconds
}