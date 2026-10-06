// Vercel Serverless Function: Polling & Approval for PWA Magic Link Sessions

global.__sessions = global.__sessions || new Map();

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

  const token = req.query?.token || req.body?.token;
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token is required.' });
  }

  global.__sessions = global.__sessions || new Map();
  const session = global.__sessions.get(token);

  // POST: Mark token session as verified (called when magic link is opened)
  if (req.method === 'POST') {
    const { user } = req.body || {};
    if (session) {
      session.verified = true;
      if (user) session.user = user;
      return res.status(200).json({ success: true, verified: true, user: session.user });
    } else if (user) {
      global.__sessions.set(token, {
        user,
        verified: true,
        expiresAt: Date.now() + 15 * 60 * 1000
      });
      return res.status(200).json({ success: true, verified: true, user });
    }
    return res.status(200).json({ success: true, verified: true });
  }

  // GET: Poll session status (called by PWA waiting on login screen)
  if (session) {
    if (Date.now() > session.expiresAt) {
      global.__sessions.delete(token);
      return res.status(410).json({ success: false, expired: true });
    }
    return res.status(200).json({
      success: true,
      verified: Boolean(session.verified),
      user: session.verified ? session.user : null
    });
  }

  return res.status(200).json({ success: true, verified: false });
}
