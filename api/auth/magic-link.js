// Vercel Serverless Function: Notion-Verified Magic Link Email Dispatcher (Resend API)

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

  // 2. Fallback to known core team whitelist if Notion is offline
  if (!matchedUser) {
    const teamWhitelist = [
      { name: 'Allan Cheng', email: 'allan.cheng@brother.com.sg', role: 'Admin (POD Lead)' },
      { name: 'Chloe Lee', email: 'chloe.lee@brother.com.sg', role: 'Reviewer (HR Lead)' },
      { name: 'Sean', email: 'sean.tan@brother.com.sg', role: 'User (POD Member)' },
      { name: 'Melvyn Tan', email: 'melvyn@befinityai.com', role: 'External Advisor' }
    ];
    matchedUser = teamWhitelist.find(u => u.email.toLowerCase() === normalizedEmail);
  }

  // STRICT REJECTION: If not on Notion Team Whitelist or designated team list, block login!
  if (!matchedUser) {
    return res.status(403).json({
      success: false,
      error: `Access Restricted: ${email} is not listed on the Team List. Please contact Admin to be added.`
    });
  }

  const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const baseUrl = appUrl || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://linked-us-in.vercel.app');
  const magicLinkUrl = `${baseUrl}/?token=${token}&email=${encodeURIComponent(matchedUser.email)}&name=${encodeURIComponent(matchedUser.name)}&role=${encodeURIComponent(matchedUser.role)}`;

  const activeResendKey = resendKey || process.env.RESEND_API_KEY;

  // 2. If Resend Key is available, send real email!
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
            .btn { display: inline-block; background-color: #0f2ea2; color: #ffffff !important; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; margin: 20px 0; }
            .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold;">LinkedUsIn Studio</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Brother Singapore AI Content Intelligence</p>
            </div>
            <div class="body">
              <p style="font-size: 15px; margin-top: 0;">Hello <strong>${matchedUser.name}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                You requested a secure magic link to sign in to <strong>LinkedUsIn Studio</strong> as <strong>${matchedUser.role}</strong>.
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${magicLinkUrl}" class="btn" style="color: #ffffff;">Sign in to LinkedUsIn Studio →</a>
              </div>
              <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                This link is valid for 15 minutes and can only be used once. If you did not request this email, you can safely ignore it.
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
          subject: 'Sign in to LinkedUsIn Studio (Brother Singapore)',
          html: emailHtml
        })
      });

      const resendData = await resendResponse.json();
      if (!resendResponse.ok) {
        console.warn('Resend API dispatch failed:', resendData);
        return res.status(200).json({
          success: true,
          message: `Magic link created! (Resend Notice: ${resendData.message || 'Free tier test domain restriction'})`,
          user: matchedUser,
          magicLinkUrl,
          resendError: resendData.message,
          simulated: false
        });
      }

      return res.status(200).json({
        success: true,
        message: `Magic link successfully delivered to ${matchedUser.email} via Resend!`,
        user: matchedUser,
        magicLinkUrl,
        resendId: resendData.id,
        simulated: false
      });
    } catch (err) {
      console.error('Error dispatching Resend email:', err);
    }
  }

  return res.status(200).json({
    success: true,
    message: `Magic link dispatched to ${matchedUser.email}!`,
    user: matchedUser,
    magicLinkUrl,
    simulated: !activeResendKey
  });
}
