// Vercel Serverless Function: Refresh LinkedIn OAuth 2.0 Access Token
// Exchanges a 365-day refresh token for a brand new 60-day access token

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const refreshToken = req.body?.refreshToken || req.query?.refreshToken || process.env.LINKEDIN_REFRESH_TOKEN;
  const clientId = req.body?.clientId || process.env.LINKEDIN_CLIENT_ID || '8660fx8uvz5z8a';
  const clientSecret = req.body?.clientSecret || process.env.LINKEDIN_CLIENT_SECRET;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Missing LinkedIn Refresh Token. Please re-authorize via Settings.'
    });
  }

  if (!clientId || !clientSecret) {
    return res.status(400).json({
      success: false,
      error: 'Missing LinkedIn Client ID or Client Secret.'
    });
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    });

    const refreshRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await refreshRes.json();

    if (refreshRes.ok && data.access_token) {
      return res.status(200).json({
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: data.expires_in || 5184000,
        message: 'Token successfully refreshed with fresh 60-day validity.'
      });
    } else {
      return res.status(refreshRes.status).json({
        success: false,
        error: data.error_description || data.error || 'Failed to refresh LinkedIn token.'
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Network error refreshing LinkedIn token: ' + err.message
    });
  }
}
