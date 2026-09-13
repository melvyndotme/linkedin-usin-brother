// Vercel Serverless Function: Publish Post to LinkedIn Organization Page via LinkedIn REST API
// LinkedIn Documentation: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api

async function tryRefreshToken({ refreshToken, clientId, clientSecret }) {
  if (!refreshToken || !clientId || !clientSecret) return null;
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    });
    const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await res.json();
    if (res.ok && data.access_token) {
      return data;
    }
  } catch (e) {
    console.error('LinkedIn auto-refresh error:', e.message);
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let token = req.body?.token || req.headers?.authorization?.replace("Bearer ", "") || process.env.LINKEDIN_ACCESS_TOKEN || process.env.LINKEDIN_TOKEN;
  const refreshToken = req.body?.refreshToken || process.env.LINKEDIN_REFRESH_TOKEN;
  const clientId = req.body?.clientId || process.env.LINKEDIN_CLIENT_ID || '8660fx8uvz5z8a';
  const clientSecret = req.body?.clientSecret || process.env.LINKEDIN_CLIENT_SECRET;
  const orgId = req.body?.orgId || process.env.LINKEDIN_ORG_ID || "808877";
  const commentary = req.body?.commentary || req.body?.content;
  const isTest = req.query?.test === "true" || req.body?.isTest === true;

  let refreshedTokenData = null;

  // If no token is provided but refresh token is available, attempt silent auto-refresh
  if (!token && refreshToken) {
    refreshedTokenData = await tryRefreshToken({ refreshToken, clientId, clientSecret });
    if (refreshedTokenData?.access_token) {
      token = refreshedTokenData.access_token;
    }
  }

  if (!token) {
    return res.status(400).json({
      success: false,
      error: "Missing LinkedIn Bearer Token. Please click 'Authorize & Connect Brother Account' in Settings or configure your OAuth 2.0 token."
    });
  }

  if (!orgId) {
    return res.status(400).json({
      success: false,
      error: "Missing LinkedIn Organization ID. Please provide your company page ID (e.g. 808877)."
    });
  }

  // Clean numeric ID from input
  const cleanId = String(orgId).replace(/[^0-9]/g, "");
  if (!cleanId) {
    return res.status(400).json({
      success: false,
      error: "Invalid Organization ID " + orgId + ". Must contain a numeric LinkedIn company ID."
    });
  }

  const authorUrn = "urn:li:organization:" + cleanId;

  // If this is a connectivity test
  if (isTest) {
    try {
      let testRes = await fetch("https://api.linkedin.com/rest/organizations/" + cleanId, {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + token,
          "LinkedIn-Version": "202401",
          "X-Restli-Protocol-Version": "2.0.0"
        }
      });

      // If token expired (401) and refresh token available, auto-refresh and retry
      if (testRes.status === 401 && refreshToken) {
        refreshedTokenData = await tryRefreshToken({ refreshToken, clientId, clientSecret });
        if (refreshedTokenData?.access_token) {
          token = refreshedTokenData.access_token;
          testRes = await fetch("https://api.linkedin.com/rest/organizations/" + cleanId, {
            method: "GET",
            headers: {
              "Authorization": "Bearer " + token,
              "LinkedIn-Version": "202401",
              "X-Restli-Protocol-Version": "2.0.0"
            }
          });
        }
      }

      if (testRes.ok) {
        const orgData = await testRes.json();
        return res.status(200).json({
          success: true,
          message: "Successfully connected to LinkedIn Organization: " + (orgData.localizedName || cleanId),
          orgId: cleanId,
          urn: authorUrn,
          refreshedToken: refreshedTokenData?.access_token || null
        });
      } else {
        const errText = await testRes.text();
        return res.status(testRes.status).json({
          success: false,
          error: "LinkedIn API error (" + testRes.status + "): " + errText,
          urn: authorUrn
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "Network error connecting to LinkedIn API: " + err.message
      });
    }
  }

  // Real Post Publishing
  if (!commentary || !commentary.trim()) {
    return res.status(400).json({
      success: false,
      error: "Post commentary text cannot be empty."
    });
  }

  try {
    const postPayload = {
      author: authorUrn,
      commentary: commentary.trim(),
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false
    };

    let response = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "LinkedIn-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postPayload)
    });

    // Auto-refresh token if 401 Unauthorized
    if (response.status === 401 && refreshToken) {
      refreshedTokenData = await tryRefreshToken({ refreshToken, clientId, clientSecret });
      if (refreshedTokenData?.access_token) {
        token = refreshedTokenData.access_token;
        response = await fetch("https://api.linkedin.com/rest/posts", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + token,
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(postPayload)
        });
      }
    }

    const restliId = response.headers.get("x-restli-id");

    if (response.status === 201 || response.ok) {
      return res.status(200).json({
        success: true,
        urn: restliId || ("urn:li:share:" + Date.now()),
        status: "Live on LinkedIn",
        publishedAt: new Date().toLocaleTimeString(),
        author: authorUrn,
        refreshedToken: refreshedTokenData?.access_token || null
      });
    } else {
      const errBody = await response.text();
      let parsedMsg = errBody;
      try {
        const jsonErr = JSON.parse(errBody);
        parsedMsg = jsonErr.message || errBody;
      } catch (e) {}

      return res.status(response.status).json({
        success: false,
        error: "LinkedIn API returned status " + response.status + ": " + parsedMsg,
        author: authorUrn
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to publish to LinkedIn: " + err.message
    });
  }
}
