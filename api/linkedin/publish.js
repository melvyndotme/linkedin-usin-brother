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

// Buffer GraphQL API integration
async function handleBufferPublish({ apiKey, channelId, commentary, imageUrl, isTest }) {
  let targetChannelId = channelId;
  let targetChannelName = "LinkedIn Page";

  // If channelId is missing or if this is a test, discover the connected organization and channels
  if (!targetChannelId || isTest) {
    const orgsRes = await fetch("https://api.buffer.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: `query { account { organizations { id name } } }`
      })
    });
    const orgsJson = await orgsRes.json();
    if (orgsJson.errors?.length) {
      throw new Error(`Buffer API Error: ${orgsJson.errors.map(e => e.message).join(", ")}`);
    }

    const org = orgsJson?.data?.account?.organizations?.[0];
    if (!org?.id) {
      throw new Error("No organization found under the provided Buffer API Key.");
    }

    const channelsRes = await fetch("https://api.buffer.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: `query GetChannels($input: ChannelsInput!) { channels(input: $input) { id name service } }`,
        variables: { input: { organizationId: org.id } }
      })
    });
    const channelsJson = await channelsRes.json();
    const channels = channelsJson?.data?.channels || [];
    const liChannel = channels.find(c => c.service?.toLowerCase() === 'linkedin') || channels[0];

    if (!liChannel) {
      throw new Error("No connected social channels found in your Buffer organization.");
    }

    targetChannelId = targetChannelId || liChannel.id;
    targetChannelName = liChannel.name || "LinkedIn Page";
  }

  // If this is a connectivity test
  if (isTest) {
    return {
      success: true,
      message: `Successfully connected to Buffer: ${targetChannelName} (Channel ID: ${targetChannelId})`,
      channelId: targetChannelId,
      provider: "buffer"
    };
  }

  // Real post publishing
  if (!commentary || !commentary.trim()) {
    throw new Error("Post commentary text cannot be empty.");
  }

  const input = {
    text: commentary.trim(),
    channelId: targetChannelId,
    schedulingType: "automatic",
    mode: "shareNow"
  };

  if (imageUrl) {
    input.assets = [{ image: { url: imageUrl } }];
  }

  const postRes = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query: `
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            ... on PostActionSuccess {
              post {
                id
                status
              }
            }
            ... on MutationError {
              message
            }
          }
        }
      `,
      variables: { input }
    })
  });

  const postJson = await postRes.json();
  if (postJson.errors?.length) {
    throw new Error(postJson.errors.map(e => e.message).join(", "));
  }

  const result = postJson?.data?.createPost;
  if (result?.message) {
    throw new Error(result.message);
  }

  return {
    success: true,
    urn: result?.post?.id || `urn:buffer:post:${Date.now()}`,
    status: "Live on LinkedIn (via Buffer)",
    publishedAt: new Date().toLocaleTimeString(),
    channelId: targetChannelId,
    provider: "buffer"
  };
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

  // Quick configuration status check
  if (req.query?.check === "status" || req.query?.check === "buffer") {
    const configured = Boolean(process.env.BUFFER_API_KEY);
    return res.status(200).json({
      configured,
      provider: "buffer",
      hasChannelId: Boolean(process.env.BUFFER_CHANNEL_ID)
    });
  }

  const commentary = req.body?.commentary || req.body?.content;
  const imageUrl = req.body?.imageUrl || req.body?.mediaUrl || req.body?.image;
  const isTest = req.query?.test === "true" || req.body?.isTest === true;

  // 1. Buffer API Priority Flow (Bypasses LinkedIn Review)
  const bufferApiKey = req.body?.bufferApiKey || process.env.BUFFER_API_KEY;
  const bufferChannelId = req.body?.bufferChannelId || process.env.BUFFER_CHANNEL_ID;

  if (bufferApiKey) {
    try {
      const bufferResult = await handleBufferPublish({
        apiKey: bufferApiKey,
        channelId: bufferChannelId,
        commentary,
        imageUrl,
        isTest
      });
      return res.status(200).json(bufferResult);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: `Buffer publishing error: ${err.message}`,
        provider: "buffer"
      });
    }
  }

  // 2. Direct LinkedIn REST API Fallback
  let token = req.body?.token || req.headers?.authorization?.replace("Bearer ", "") || process.env.LINKEDIN_ACCESS_TOKEN || process.env.LINKEDIN_TOKEN;
  const refreshToken = req.body?.refreshToken || process.env.LINKEDIN_REFRESH_TOKEN;
  const clientId = req.body?.clientId || process.env.LINKEDIN_CLIENT_ID || '8660fx8uvz5z8a';
  const clientSecret = req.body?.clientSecret || process.env.LINKEDIN_CLIENT_SECRET;
  const orgId = req.body?.orgId || process.env.LINKEDIN_ORG_ID || "808877";

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
      error: "Missing LinkedIn Bearer Token or BUFFER_API_KEY. Configure BUFFER_API_KEY in Vercel or connect LinkedIn OAuth."
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
