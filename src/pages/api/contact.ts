import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  let name, email, message, botfield;
  try {
    const data = await request.json();
    name = data.name;
    email = data.email;
    message = data.message;
    botfield = data.botfield;
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
      to: ['hello@makerportal.ai'], 
      subject: `New MakerPortal inquiry from ${name}`,
      html: `
        <h3>New Contact Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${(message as string).replace(/\n/g, '<br>')}</p>
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
