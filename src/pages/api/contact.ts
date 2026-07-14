import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidEmail(e: string): boolean {
  // Simple RFC 5322-ish check, no regex DoS
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 254;
}

export const POST: APIRoute = async ({ request }) => {
  let name, email, message, botfield, topic, timezone, userAgent, screenSize, url;
  try {
    const data = await request.json();
    name = typeof data.name === 'string' ? data.name.trim().slice(0, 100) : '';
    email = typeof data.email === 'string' ? data.email.trim().slice(0, 254) : '';
    message = typeof data.message === 'string' ? data.message.trim().slice(0, 2000) : '';
    botfield = data.botfield;
    topic = typeof data.topic === 'string' ? data.topic.slice(0, 50) : 'General Inquiry';
    timezone = typeof data.timezone === 'string' ? data.timezone.slice(0, 80) : 'Unknown';
    userAgent = typeof data.userAgent === 'string' ? data.userAgent.slice(0, 200) : 'Unknown';
    screenSize = typeof data.screenSize === 'string' ? data.screenSize.slice(0, 30) : 'Unknown';
    url = typeof data.url === 'string' ? data.url.slice(0, 200) : 'Unknown';
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  // Basic honeypot to catch bots
  if (botfield) {
    return new Response(JSON.stringify({ error: 'Spam detected' }), { status: 400 });
  }

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400 });
  }

  if (name.length < 2 || message.length < 10) {
    return new Response(JSON.stringify({ error: 'Message too short' }), { status: 400 });
  }

  // Privacy-first: minimize fingerprinting data, escape all user content for email HTML
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const safeTopic = escapeHtml(topic);
  const safeTimezone = escapeHtml(timezone);
  const safeScreen = escapeHtml(screenSize);
  const safeUrl = escapeHtml(url);
  const safeUserAgent = escapeHtml(userAgent);

  try {
    const { error } = await resend.emails.send({
      from: 'MakerPortal Hub <notifications@makerportal.ai>', 
      to: ['engineer@makersportal.com'], 
      subject: `[${safeTopic}] New inquiry from ${safeName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Inquiry</title>
        </head>
        <body style="margin: 0; padding: 40px 20px; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #0E1116; border-radius: 24px; overflow: hidden; border: 1px solid #2A2F3A; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            
            <!-- Hero Banner -->
            <div style="width: 100%; height: 200px; background-color: #1A1F2B; background-image: url('https://makerportal.ai/social-card.png'); background-size: cover; background-position: center; border-bottom: 1px solid #2A2F3A;">
            </div>
            
            <div style="padding: 40px;">
              <!-- Badge -->
              <div style="display: inline-block; padding: 6px 12px; background-color: rgba(206, 68, 93, 0.15); border: 1px solid rgba(206, 68, 93, 0.3); border-radius: 100px; color: #CE445D; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px;">
                ${safeTopic}
              </div>
              
              <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;">New Inquiry Received</h1>
              <p style="margin: 0 0 32px 0; font-size: 16px; color: #8A92A6; line-height: 1.5;">You have a new message from MakerPortal.ai. Please review the details below.</p>
              
              <!-- User Profile Box -->
              <div style="background-color: #151A23; border: 1px solid #2A2F3A; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748B; font-weight: 600;">Sender</p>
                <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #FFFFFF;">${safeName}</p>
                <a href="mailto:${safeEmail}" style="color: #60A5FA; text-decoration: none; font-size: 15px; font-weight: 500;">${safeEmail}</a>
              </div>
              
              <!-- Message Content -->
              <div style="margin-bottom: 40px;">
                <p style="margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748B; font-weight: 600;">Message</p>
                <div style="font-size: 16px; line-height: 1.7; color: #E2E8F0;">
                  ${safeMessage}
                </div>
              </div>
              
              <!-- Reply Button -->
              <a href="mailto:${safeEmail}" style="display: inline-block; width: 100%; text-align: center; background: linear-gradient(135deg, #CE445D, #A33246); color: #FFFFFF; text-decoration: none; padding: 16px 0; border-radius: 12px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">Reply to ${safeName}</a>
            </div>
            
            <!-- System Diagnostic — minimized for privacy (timezone + source only, UA/screen truncated) -->
            <div style="background-color: #151A23; border-top: 1px solid #2A2F3A; padding: 32px 40px;">
              <p style="margin: 0 0 16px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748B; font-weight: 600;">Diagnostic Metadata (privacy-minimized)</p>
              <table style="width: 100%; font-size: 13px; color: #94A3B8; line-height: 1.6; border-collapse: collapse;">
                <tr>
                  <td style="padding-bottom: 8px; width: 90px; color: #64748B;">Timezone:</td>
                  <td style="padding-bottom: 8px; color: #F8FAFC;">${safeTimezone}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px; color: #64748B;">Screen:</td>
                  <td style="padding-bottom: 8px; color: #F8FAFC;">${safeScreen}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px; color: #64748B;">Source URL:</td>
                  <td style="padding-bottom: 8px; color: #F8FAFC;">
                    <a href="${safeUrl}" style="color: #60A5FA; text-decoration: none;">${safeUrl}</a>
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="color: #64748B;">Device:</td>
                  <td style="color: #F8FAFC;">${safeUserAgent}</td>
                </tr>
              </table>
            </div>
            
          </div>
          
          <!-- Footer Links & Socials -->
          <div style="max-width: 600px; margin: 32px auto 0 auto; text-align: center;">
            <img src="https://makerportal.ai/favicon.svg" alt="MakerPortal Logo" width="32" height="32" style="margin-bottom: 16px; opacity: 0.5;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748B;">
              This transmission was securely dispatched from <a href="https://makerportal.ai" style="color: #94A3B8; text-decoration: underline;">MakerPortal.ai</a>
            </p>
            <div style="margin-top: 16px;">
              <a href="https://makersportal.com" style="color: #60A5FA; text-decoration: none; font-size: 13px; margin: 0 8px;">Studio Journal</a>
              <span style="color: #334155;">&bull;</span>
              <a href="https://makerportal.ai" style="color: #60A5FA; text-decoration: none; font-size: 13px; margin: 0 8px;">Visit Hub</a>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
  }
};
