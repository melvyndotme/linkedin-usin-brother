// Vercel Serverless Function: Publish Post to LinkedIn Organization Page via LinkedIn REST API
// LinkedIn Documentation: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api

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

  const token = req.body?.token || req.headers?.authorization?.replace("Bearer ", "");
  const orgId = req.body?.orgId;
  const commentary = req.body?.commentary || req.body?.content;
  const isTest = req.query?.test === "true" || req.body?.isTest === true;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: "Missing LinkedIn Bearer Token. Please configure in Settings."
    });
  }

  if (!orgId) {
    return res.status(400).json({
      success: false,
      error: "Missing LinkedIn Organization ID. Please provide your company page ID (e.g. 96363282)."
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
      const testRes = await fetch("https://api.linkedin.com/rest/organizations/" + cleanId, {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + token,
          "LinkedIn-Version": "202401",
          "X-Restli-Protocol-Version": "2.0.0"
        }
      });

      if (testRes.ok) {
        const orgData = await testRes.json();
        return res.status(200).json({
          success: true,
          message: "Successfully connected to LinkedIn Organization: " + (orgData.localizedName || cleanId),
          orgId: cleanId,
          urn: authorUrn
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

    const response = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "LinkedIn-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postPayload)
    });

    const restliId = response.headers.get("x-restli-id");

    if (response.status === 201 || response.ok) {
      return res.status(200).json({
        success: true,
        urn: restliId || ("urn:li:share:" + Date.now()),
        status: "Live on LinkedIn",
        publishedAt: new Date().toLocaleTimeString(),
        author: authorUrn
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
