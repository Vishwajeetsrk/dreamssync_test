import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAILS = [
  'viswajeetsrk@gmail.com',
  'vishwajeetaman15@gmail.com'
];

const CRISIS_RESOURCES = {
  critical: {
    US: '🚨 NATIONAL SUICIDE PREVENTION LIFELINE: 988 | Crisis Text Line: Text HOME to 741741',
    INDIA: '🚨 AASRA: 9820466726 | iCall: 9152987821 | Vandrevala Foundation: 9999 666 555',
    GLOBAL: '🌍 International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/'
  },
  high: {
    US: '📞 National Suicide Prevention Lifeline: 988 (available 24/7)',
    INDIA: '📞 Mental Health Support: iCall 9152987821 | AASRA 9820466726',
    GLOBAL: '🌍 Find support: https://www.befrienders.org/'
  },
  medium: {
    US: '💬 Crisis Text Line: Text HOME to 741741 | SAMHSA: 1-800-662-4357',
    INDIA: '💬 Vandrevala Foundation: 9999 666 555 | iCall: 9152987821',
    GLOBAL: '🌍 Mental Health Resources: https://findahelpline.com/'
  }
};

export async function POST(req: NextRequest) {
  try {
    const { severity, userId, userName, userEmail, message, timestamp, id } = await req.json();

    if (!severity || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const severityColor = {
      critical: '#DC2626',
      high: '#EA580C',
      medium: '#F59E0B',
      low: '#3B82F6'
    }[severity] || '#6B7280';

    const resources = CRISIS_RESOURCES[severity as keyof typeof CRISIS_RESOURCES] || CRISIS_RESOURCES.medium;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 0; }
            .header {
              background: ${severityColor};
              padding: 24px;
              color: white;
              border-bottom: 4px solid #000;
            }
            .content { padding: 24px; }
            .alert-box {
              background: #fef2f2;
              border-left: 6px solid ${severityColor};
              padding: 16px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .severity-badge {
              display: inline-block;
              background: ${severityColor};
              color: white;
              padding: 6px 12px;
              border-radius: 4px;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 12px;
              margin: 10px 0;
            }
            .resources {
              background: #dbeafe;
              border: 2px solid #3b82f6;
              padding: 16px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .resources h3 { margin: 0 0 12px 0; color: #1e40af; }
            .resources p { margin: 8px 0; color: #1e3a8a; line-height: 1.6; }
            .action-button {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
              margin: 10px 5px 10px 0;
            }
            .footer { background: #f9fafb; padding: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🚨 DreamSync Crisis Alert</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Mental Health Emergency Notification</p>
            </div>

            <div class="content">
              <p><strong>User:</strong> ${userName} (${userEmail})</p>
              <p><strong>User ID:</strong> <code>${userId}</code></p>
              <p><strong>Detected:</strong> ${new Date(timestamp).toLocaleString()}</p>
              <p><strong>Alert ID:</strong> <code>${id}</code></p>

              <div class="severity-badge">${severity.toUpperCase()} SEVERITY</div>

              <div class="alert-box">
                <strong>Flagged Message:</strong>
                <p style="margin: 10px 0 0 0; font-style: italic; color: #7f1d1d;">"${message}"</p>
              </div>

              <div class="resources">
                <h3>📞 Crisis Resources to Share:</h3>
                <p>${resources[Object.keys(resources)[0] as any]}</p>
                ${resources[Object.keys(resources)[1] as any] ? `<p>${resources[Object.keys(resources)[1] as any]}</p>` : ''}
                ${resources[Object.keys(resources)[2] as any] ? `<p>${resources[Object.keys(resources)[2] as any]}</p>` : ''}
              </div>

              <div style="margin: 20px 0;">
                <a href="https://dreamsync.vercel.app/admin/crisis" class="action-button">View Crisis Center</a>
                <a href="https://dreamsync.vercel.app/admin/crisis?alertId=${id}" class="action-button" style="background: #10b981;">Respond to Alert</a>
              </div>

              <p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; font-size: 13px;">
                <strong>⚠️ IMPORTANT:</strong> This is an automated alert. Always treat mental health crises with appropriate sensitivity and follow your organization's crisis protocols.
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0;">DreamSync Career OS | Mental Health Support System</p>
              <p style="margin: 4px 0 0 0;">This email contains sensitive mental health information. Keep confidential.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send to all admins
    const emailPromises = ADMIN_EMAILS.map(email =>
      resend.emails.send({
        from: 'alerts@dreamsync.vercel.app',
        to: email,
        subject: `🚨 [${severity.toUpperCase()}] DreamSync Crisis Alert - Immediate Attention Required`,
        html: emailHtml,
        replyTo: 'support@dreamsync.vercel.app'
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    console.log(`[Crisis Email] Sent to ${successful}/${ADMIN_EMAILS.length} admins`);

    return NextResponse.json({
      success: true,
      emailsSent: successful,
      message: `Crisis alert email sent to ${successful} admin(s)`
    });
  } catch (err) {
    console.error('[Crisis Email] Error:', err);
    return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 });
  }
}
