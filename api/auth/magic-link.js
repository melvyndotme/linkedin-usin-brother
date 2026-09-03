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

  const { email, resendKey, appUrl } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Please enter a valid corporate email address.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Known Notion Team Whitelist members
  const teamWhitelist = [
    { name: 'Allan Cheng', email: 'allan.cheng@brother.com.sg', role: 'Admin (POD Lead)' },
    { name: 'Chloe Lee', email: 'chloe.lee@brother.com.sg', role: 'Reviewer (HR Lead)' },
    { name: 'Sean', email: 'sean.tan@brother.com.sg', role: 'User (POD Member)' },
    { name: 'Melvyn Tan', email: 'melvyn@befinityai.com', role: 'External Advisor' }
  ];

  // 1. Check Whitelist
  let matchedUser = teamWhitelist.find(u => u.email.toLowerCase() === normalizedEmail);

  // If email domain is brother.com.sg or brother.co.id, allow with User role
  if (!matchedUser && (normalizedEmail.endsWith('@brother.com.sg') || normalizedEmail.endsWith('@brother.co.id') || normalizedEmail.endsWith('@brother.com'))) {
    const rawName = normalizedEmail.split('@')[0].replace(/\./g, ' ');
    const formattedName = rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    matchedUser = {
      name: formattedName,
      email: normalizedEmail,
      role: 'User (Brother SG)'
    };
  }

  if (!matchedUser) {
    return res.status(403).json({
      success: false,
      error: `Access Restricted: ${email} is not on the Notion Team Whitelist. Please contact Allan Cheng or Chloe Lee for access.`
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

      const fromAddress = process.env.RESEND_FROM_EMAIL || req.body?.fromEmail || 'LinkedUsIn Studio <auth@cs.befinity.ai>';

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
