// Vercel Serverless Function: LinkedIn OAuth 2.0 Authorization Callback
// Exchanges the authorization code for a LinkedIn 60-day Bearer Access Token

export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  if (error) {
    const errorMsg = error_description || error;
    return res.redirect(`/?tab=settings&linkedin_error=${encodeURIComponent(errorMsg)}`);
  }

  if (!code) {
    return res.redirect('/?tab=settings&linkedin_error=' + encodeURIComponent('No authorization code provided by LinkedIn.'));
  }

  // Parse state to retrieve clientId and clientSecret if passed from client
  let clientState = {};
  try {
    if (state) {
      clientState = JSON.parse(decodeURIComponent(state));
    }
  } catch (e) {
    console.warn('Could not parse OAuth state:', e.message);
  }

  const clientId = clientState.clientId || process.env.LINKEDIN_CLIENT_ID || '8660fx8uvz5z8a';
  const clientSecret = clientState.clientSecret || process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = clientState.redirectUri || 'https://linkedin.bro-x.org/api/auth/linkedin/callback';

  if (!clientId || !clientSecret) {
    return res.redirect('/?tab=settings&linkedin_error=' + encodeURIComponent('Missing LinkedIn Client ID or Client Secret. Ensure they are configured in Settings.'));
  }

  try {
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    });

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    });

    const tokenData = await tokenRes.json();

    if (tokenRes.ok && tokenData.access_token) {
      // Redirect back to app Settings with access_token and refresh_token
      const targetOrg = clientState.orgId || '808877';
      const refreshToken = tokenData.refresh_token || '';
      const expiresIn = tokenData.expires_in || 5184000;
      return res.redirect(`/?tab=settings&linkedin_token=${encodeURIComponent(tokenData.access_token)}&linkedin_refresh=${encodeURIComponent(refreshToken)}&expires_in=${expiresIn}&org_id=${encodeURIComponent(targetOrg)}&linkedin_status=connected`);
    } else {
      const errMsg = tokenData.error_description || tokenData.error || 'Failed to exchange authorization code for access token.';
      return res.redirect(`/?tab=settings&linkedin_error=${encodeURIComponent(errMsg)}`);
    }
  } catch (err) {
    return res.redirect(`/?tab=settings&linkedin_error=${encodeURIComponent(err.message || 'Network error during LinkedIn token exchange.')}`);
  }
}
