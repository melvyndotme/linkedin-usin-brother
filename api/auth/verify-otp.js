// Vercel Serverless Function: Verify 6-digit OTP code for in-PWA authentication
import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'brother-singapore-linkedus-secret-2026';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { email, otpCode, otpHash, name, role } = req.body || {};

  if (!email || !otpCode) {
    return res.status(400).json({ success: false, error: 'Email and 6-digit code are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanCode = String(otpCode).trim().replace(/\s+/g, '');

  if (cleanCode.length !== 6) {
    return res.status(400).json({ success: false, error: 'Please enter a valid 6-digit verification code.' });
  }

  // 1. Verify against cryptographic HMAC hash
  if (otpHash && name) {
    const expectedPayload = `${cleanEmail}:${cleanCode}:${name}:${role || 'User'}`;
    const expectedHash = crypto.createHmac('sha256', AUTH_SECRET).update(expectedPayload).digest('hex');
    
    if (expectedHash === otpHash) {
      const user = {
        name,
        email: cleanEmail,
        role: role || 'User (Brother SG)'
      };
      return res.status(200).json({
        success: true,
        message: '6-digit code verified successfully.',
        user
      });
    }
  }

  // 2. Verify against in-memory session store (if available)
  global.__sessions = global.__sessions || new Map();
  for (const [token, session] of global.__sessions.entries()) {
    if (
      session.user?.email === cleanEmail &&
      session.otpCode === cleanCode &&
      Date.now() < session.expiresAt
    ) {
      session.verified = true;
      return res.status(200).json({
        success: true,
        message: '6-digit code verified successfully.',
        user: session.user,
        token
      });
    }
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid or expired 6-digit verification code. Please check your email or request a new code.'
  });
}
