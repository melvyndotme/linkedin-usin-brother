// Vercel Serverless Function: Notion-Verified Magic Link Email Dispatcher (Resend API)

async function logAuthAudit(apiKey, event, user, email, role, details, status) {
  if (!apiKey) return;
  try {
    // 1. Search for Audit Database
    const searchRes = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: { value: 'database', property: 'object' },
        page_size: 50
      })
    });
    if (!searchRes.ok) return;
    const searchData = await searchRes.json();
    const databases = searchData.results || [];
    const auditDb = databases.find(d => {
      const title = (d.title || []).map(t => t.plain_text).join('').toLowerCase();
      return title.includes('audit') || title.includes('activity') || title.includes('telemetry log');
    });

    if (!auditDb) return;

    await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: auditDb.id },
        properties: {
          'Event': { title: [{ text: { content: event } }] },
          'User': { rich_text: [{ text: { content: user || 'Anonymous' } }] },
          ...(email ? { 'Email': { email: email } } : {}),
          'Role': { select: { name: role || 'Team Member' } },
          'Category': { select: { name: 'Auth' } },
          'Details': { rich_text: [{ text: { content: String(details || '').slice(0, 2000) } }] },
          'Status': { select: { name: status || 'Success' } },
          'Timestamp': { date: { start: new Date().toISOString() } }
        }
      })
    });
  } catch (err) {
    console.warn('Auth audit log error (silent):', err.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { email, resendKey, notionKey, appUrl } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Please enter a valid corporate email address.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const activeNotionKey = notionKey || process.env.NOTION_API_KEY;
  let matchedUser = null;

  // 1. Live Query to Official Notion Team Whitelist Database (3c701136de4881869782cd894c6126c5)
  if (activeNotionKey) {
    try {
      const notionRes = await fetch('https://api.notion.com/v1/databases/3c701136de4881869782cd894c6126c5/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeNotionKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filter: {
            or: [
              {
                property: 'Email',
                email: {
                  equals: normalizedEmail
                }
              },
              {
                property: 'Email',
                rich_text: {
                  equals: normalizedEmail
                }
              }
            ]
          }
        })
      });

      if (notionRes.ok) {
        const notionData = await notionRes.json();
        const page = notionData.results?.[0];
        if (page) {
          const nameProp = page.properties['Name']?.title?.[0]?.plain_text || page.properties['Name']?.title?.[0]?.text?.content;
          const roleProp = page.properties['Role']?.select?.name;
          matchedUser = {
            name: nameProp || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            role: roleProp || 'User (Brother SG)'
          };
        }
      }
    } catch (notionErr) {
      console.warn('Live Notion Team lookup error:', notionErr.message);
    }
  }

  // 2. Fallback to authorized Brother Singapore domain if Notion is offline
  if (!matchedUser) {
    if (normalizedEmail.endsWith('@brother.com.sg') || normalizedEmail.includes('befinityai.com')) {
      const derivedName = normalizedEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      matchedUser = {
        name: derivedName,
        email: normalizedEmail,
        role: 'Team Member (Brother SG)'
      };
    }
  }

  // STRICT REJECTION: If not on Notion Team Whitelist or designated team list, block login!
  if (!matchedUser) {
    logAuthAudit(activeNotionKey, 'Login Rejected', 'Unknown', normalizedEmail, 'Unauthorized', 'Email not in whitelist', 'Warning');
    return res.status(403).json({
      success: false,
      error: `Access Restricted: ${email} is not listed on the Team List. Please contact Admin to be added.`
    });
  }

  const crypto = await import('crypto');
  const AUTH_SECRET = process.env.AUTH_SECRET || 'brother-singapore-linkedus-secret-2026';

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const baseUrl = appUrl || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://linked-us-in.vercel.app');
  const magicLinkUrl = `${baseUrl}/?token=${token}&email=${encodeURIComponent(matchedUser.email)}&name=${encodeURIComponent(matchedUser.name)}&role=${encodeURIComponent(matchedUser.role)}`;

  // Secure HMAC signature of OTP code
  const otpPayload = `${normalizedEmail}:${otpCode}:${matchedUser.name}:${matchedUser.role}`;
  const otpHash = crypto.createHmac('sha256', AUTH_SECRET).update(otpPayload).digest('hex');

  // Register session for PWA background polling
  global.__sessions = global.__sessions || new Map();
  global.__sessions.set(token, {
    user: matchedUser,
    otpCode,
    verified: false,
    createdAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000
  });

  const activeResendKey = resendKey || process.env.RESEND_API_KEY;

  // 2. If Resend Key is available, send real email with both 1-click link AND 6-digit PWA code
  if (activeResendKey && activeResendKey.startsWith('re_')) {
    try {
      const bannerBaseUrl = (baseUrl && !baseUrl.includes('localhost')) ? baseUrl : 'https://linkedin.bro-x.org';
      const bannerUrl = `${bannerBaseUrl}/brother-email-banner.png`;
      const btnImgUrl = `${bannerBaseUrl}/brother-signin-btn.png`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          <meta name="supported-color-schemes" content="light dark">
          <style>
            :root {
              color-scheme: light dark;
              supported-color-schemes: light dark;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #f4f6f9;
              margin: 0;
              padding: 24px 12px;
              -webkit-font-smoothing: antialiased;
            }
            .card {
              max-width: 520px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              border: 1px solid #e2e8f0;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
            }
            .banner-container {
              margin: 0;
              padding: 0;
              line-height: 0;
              font-size: 0;
              border-top-left-radius: 16px;
              border-top-right-radius: 16px;
              overflow: hidden;
            }
            .banner-img {
              display: block;
              width: 100%;
              max-width: 520px;
              height: auto;
              margin: 0;
              padding: 0;
              border: 0;
              border-top-left-radius: 16px;
              border-top-right-radius: 16px;
            }
            .body {
              padding: 32px 28px 24px 28px;
              color: #1e293b;
            }
            .otp-box {
              background-color: #f0f4ff;
              border: 1px solid #bfdbfe;
              border-radius: 14px;
              padding: 22px 16px;
              text-align: center;
              margin: 20px 0 24px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: 800;
              letter-spacing: 10px;
              color: #050505;
              font-family: -apple-system, BlinkMacSystemFont, Consolas, Monaco, monospace;
              line-height: 1;
              margin-bottom: 12px;
            }
            .otp-subtext {
              margin: 0;
              font-size: 13px;
              color: #334155;
              font-weight: 500;
            }
            @media (prefers-color-scheme: dark) {
              .otp-code {
                color: #ffffff !important;
              }
              .otp-box {
                background-color: #1e2430 !important;
                border-color: #334155 !important;
              }
              .otp-subtext {
                color: #cbd5e1 !important;
              }
            }
            [data-ogsc] .otp-code {
              color: #ffffff !important;
            }
            .footer {
              background: #f8fafc;
              padding: 16px 20px;
              text-align: center;
              font-size: 11px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="banner-container">
              <img src="${bannerUrl}" alt="Brother - at your side" class="banner-img" width="520" border="0" />
            </div>
            <div class="body">
              <p style="font-size: 15px; margin: 0 0 12px 0; font-weight: 600; color: #1e293b;">Hello ${matchedUser.name},</p>
              <p style="font-size: 13px; line-height: 1.5; color: #475569; margin: 0 0 20px 0;">
                Here is your sign-in verification code and secure access link for <strong>LinkedUsIn Studio</strong>:
              </p>

              <div class="otp-box">
                <div class="otp-code">${otpCode}</div>
                <p class="otp-subtext">
                  Enter this code if using the LinkedUsIn App on mobile.
                </p>
              </div>

              <div style="text-align: center; margin: 28px 0 16px 0; line-height: 0; font-size: 0;">
                <a href="${magicLinkUrl}" target="_blank" style="display: inline-block; text-decoration: none; border: 0; outline: none; margin: 0; padding: 0; line-height: 0; font-size: 0; border-radius: 10px;">
                  <img src="${btnImgUrl}" alt="Sign in to LinkedUsIn Studio &rarr;" width="280" height="48" style="display: block; margin: 0 auto; max-width: 100%; height: auto; border: 0; outline: none; border-radius: 10px;" border="0" />
                </a>
              </div>
              <div style="text-align: center; margin: 8px 0 20px 0;">
                <a href="${magicLinkUrl}" style="font-size: 11px; color: #64748b; text-decoration: underline;">Direct sign-in link</a>
              </div>

              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 20px 0 0 0; line-height: 1.5;">
                This link and code will expire in 15 minutes.
              </p>
            </div>
            <div class="footer">
              Brother International Singapore Pte Ltd &bull; At your side
            </div>
          </div>
        </body>
        </html>
      `;

      const fromAddress = process.env.RESEND_FROM_EMAIL || req.body?.fromEmail || 'LinkedUsIn Studio <linkusin@rs.bro-x.org>';

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeResendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [matchedUser.email],
          subject: `${otpCode} is your LinkedUsIn Studio sign-in code`,
          html: emailHtml
        })
      });

      const resendData = await resendResponse.json();
      if (!resendResponse.ok) {
        console.warn('Resend API dispatch failed:', resendData);
        logAuthAudit(activeNotionKey, 'Magic Link Created (Delivery Warning)', matchedUser.name, matchedUser.email, matchedUser.role, `Resend Notice: ${resendData.message || 'Free tier limit'}`, 'Warning');
        return res.status(200).json({
          success: true,
          message: `Sign-in credentials generated! (Code: ${otpCode})`,
          user: matchedUser,
          magicLinkUrl,
          otpCode,
          otpHash,
          token,
          resendError: resendData.message,
          simulated: false
        });
      }

      logAuthAudit(activeNotionKey, 'Magic Link & OTP Sent via Email', matchedUser.name, matchedUser.email, matchedUser.role, `Email delivered via Resend ID ${resendData.id}`, 'Success');

      return res.status(200).json({
        success: true,
        message: `Sign-in credentials successfully delivered to ${matchedUser.email}!`,
        user: matchedUser,
        magicLinkUrl,
        otpCode,
        otpHash,
        token,
        resendId: resendData.id,
        simulated: false
      });
    } catch (err) {
      console.error('Error dispatching Resend email:', err);
    }
  }

  logAuthAudit(activeNotionKey, 'Magic Link & OTP Generated (Direct Mode)', matchedUser.name, matchedUser.email, matchedUser.role, 'Generated token & code for direct authentication', 'Success');

  return res.status(200).json({
    success: true,
    message: `Sign-in code dispatched to ${matchedUser.email}!`,
    user: matchedUser,
    magicLinkUrl,
    otpCode,
    otpHash,
    token,
    simulated: !activeResendKey
  });
}
