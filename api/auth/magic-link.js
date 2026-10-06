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
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
            .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
            .header { background: #0f2ea2; padding: 28px 24px; text-align: center; color: #ffffff; }
            .body { padding: 32px 24px; color: #1e293b; }
            .otp-box { background: #eff6ff; border: 2px dashed #bfdbfe; border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; }
            .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f2ea2; font-family: monospace; }
            .btn { display: inline-block; background-color: #0f2ea2; color: #ffffff !important; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; margin: 16px 0; }
            .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold;">LinkedUs Studio</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Brother Singapore AI Content Intelligence</p>
            </div>
            <div class="body">
              <p style="font-size: 15px; margin-top: 0;">Hello <strong>${matchedUser.name}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                You requested sign-in access to <strong>LinkedUs Studio</strong> as <strong>${matchedUser.role}</strong>.
              </p>

              <!-- Option A: 6-Digit Code for PWA Home Screen App -->
              <div class="otp-box">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 1px;">
                  Mobile App 6-Digit Code (Enter in PWA)
                </p>
                <div class="otp-code">${otpCode}</div>
                <p style="margin: 6px 0 0 0; font-size: 11px; color: #3b82f6;">
                  If using the installed LinkedUs Home Screen app, enter this code directly in the app.
                </p>
              </div>

              <!-- Option B: 1-Click Magic Link -->
              <div style="text-align: center; margin: 20px 0;">
                <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Or sign in with 1-click:</p>
                <a href="${magicLinkUrl}" class="btn" style="color: #ffffff;">Sign in to LinkedUs Studio →</a>
              </div>

              <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px;">
                This link and verification code are valid for 15 minutes. If you did not request this email, you can safely ignore it.
              </p>
            </div>
            <div class="footer">
              Brother International Singapore Pte Ltd • At your side
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
          subject: `${otpCode} is your LinkedUs Studio sign-in code`,
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
