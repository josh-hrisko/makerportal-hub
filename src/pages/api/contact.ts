import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  let name, email, message, botfield, topic, timezone, userAgent, screenSize, url;
  try {
    const data = await request.json();
    name = data.name;
    email = data.email;
    message = data.message;
    botfield = data.botfield;
    topic = data.topic || 'General Inquiry';
    timezone = data.timezone || 'Unknown';
    userAgent = data.userAgent || 'Unknown';
    screenSize = data.screenSize || 'Unknown';
    url = data.url || 'Unknown';
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

  try {
    const { error } = await resend.emails.send({
      from: 'MakerPortal Hub <notifications@makerportal.ai>', 
      to: ['engineer@makersportal.com'], 
      subject: `[${topic}] New inquiry from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 40px 20px; background-color: #F5F5F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E5EA; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            
            <div style="padding: 40px 40px 20px 40px;">
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #86868B; font-weight: 600;">Inquiry Topic: ${topic}</p>
              <h1 style="margin: 8px 0 24px 0; font-size: 24px; font-weight: 600; color: #1D1D1F; letter-spacing: -0.5px;">New Message Received</h1>
              
              <div style="margin-bottom: 24px;">
                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1D1D1F;">${name}</p>
                <a href="mailto:${email}" style="color: #0066CC; text-decoration: none; font-size: 14px;">${email}</a>
              </div>
              
              <div style="border-left: 3px solid #E5E5EA; padding-left: 16px; margin: 32px 0;">
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #1D1D1F;">
                  ${(message as string).replace(/\n/g, '<br>')}
                </p>
              </div>
            </div>
            
            <div style="background-color: #F5F5F7; border-top: 1px solid #E5E5EA; padding: 24px 40px;">
              <p style="margin: 0 0 12px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #86868B; font-weight: 600;">System Diagnostic</p>
              <table style="width: 100%; font-size: 12px; color: #86868B; line-height: 1.6; border-collapse: collapse;">
                <tr>
                  <td style="padding-bottom: 4px; width: 80px;"><strong>Timezone:</strong></td>
                  <td style="padding-bottom: 4px;">${timezone}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 4px;"><strong>Screen:</strong></td>
                  <td style="padding-bottom: 4px;">${screenSize}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 4px;"><strong>Source:</strong></td>
                  <td style="padding-bottom: 4px;">${url}</td>
                </tr>
                <tr>
                  <td valign="top"><strong>Device:</strong></td>
                  <td>${userAgent}</td>
                </tr>
              </table>
            </div>
            
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <p style="margin: 0; font-size: 12px; color: #86868B;">MakerPortal Hub Secure Dispatch</p>
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
