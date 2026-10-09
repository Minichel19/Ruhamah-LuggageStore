import { Resend } from 'resend';

const FROM_EMAIL = 'Ruhamah LuggageStore <hello@updates.lugagestore.com>';
const OWNER_EMAIL = 'minichelgera@gmail.com';

export async function sendBookingConfirmation(booking: any) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('RESEND_API_KEY not set, skipping email');
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.customer_email,
      subject: 'Your luggage storage booking is confirmed',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a8a;">Booking Confirmed</h1>
          <p>Hi ${booking.customer_name},</p>
          <p>Thank you for choosing Ruhamah LuggageStore! Your booking is confirmed.</p>

          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Booking ID:</strong> ${booking.id}</p>
            <p><strong>Drop-off:</strong> ${booking.dropoff_date}</p>
            <p><strong>Pick-up:</strong> ${booking.pickup_date}</p>
            <p><strong>Number of bags:</strong> ${booking.bag_count}</p>
            <p><strong>Total paid:</strong> $${booking.total_price}</p>
          </div>

          <p><strong>Location:</strong> 2801 1st Ave Ste A, Seattle, WA 98121</p>
          <p>Show your QR code when you drop off your bags.</p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Questions? Reply to this email or chat with us on WhatsApp.
          </p>
        </div>
      `,
    });
    console.log('Confirmation email sent to', booking.customer_email);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}

export async function sendOwnerNotification(booking: any) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('RESEND_API_KEY not set, skipping owner notification');
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `New booking: ${booking.customer_name} (${booking.bag_count} bags)`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a8a;">New Booking Received</h1>

          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Customer:</strong> ${booking.customer_name}</p>
            <p><strong>Email:</strong> ${booking.customer_email}</p>
            <p><strong>Phone:</strong> ${booking.customer_phone || 'Not provided'}</p>
            <p><strong>Drop-off:</strong> ${booking.dropoff_date}</p>
            <p><strong>Pick-up:</strong> ${booking.pickup_date}</p>
            <p><strong>Bags:</strong> ${booking.bag_count}</p>
            <p><strong>Total:</strong> $${booking.total_price}</p>
            ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
          </div>

          <a href="https://lugagestore.com/admin" style="background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Dashboard
          </a>
        </div>
      `,
    });
    console.log('Owner notification sent');
  } catch (error) {
    console.error('Failed to send owner email:', error);
  }
}

export async function sendReviewRequest(booking: any) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('RESEND_API_KEY not set, skipping review request');
    return;
  }

  const reviewUrl = `https://lugagestore.com/review?booking=${booking.id}`;
  const photoUrl = booking.photo_url
    ? `https://lugagestore.com/success?session_id=${booking.stripe_session_id}`
    : null;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.customer_email,
      subject: `How was your experience, ${booking.customer_name}?`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a8a;">Thanks for choosing us!</h1>
          <p>Hi ${booking.customer_name},</p>
          <p>We hope you had a great experience storing your bags with Ruhamah LuggageStore.</p>
          <p>Would you take a moment to leave us a review? It really helps us serve you better.</p>

          <a href="${reviewUrl}" style="background: #eab308; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 20px 0;">
            Leave a Review
          </a>

          ${photoUrl ? `
          <p style="margin-top: 20px;">You can also view the photo of your stored bags:</p>
          <a href="${photoUrl}" style="color: #1e3a8a;">View Bag Photo</a>
          ` : ''}

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Thank you for your business!<br>
            Ruhamah LuggageStore<br>
            2801 1st Ave Ste A, Seattle, WA 98121
          </p>
        </div>
      `,
    });
    console.log('Review request sent to', booking.customer_email);
  } catch (error) {
    console.error('Failed to send review request:', error);
  }
}

export async function sendTwoFactorCode(to: string, name: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('RESEND_API_KEY not set, skipping 2FA email');
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your login code — Ruhamah LuggageStore',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e3a8a; text-align: center;">Login Code</h1>
          <p>Hi ${name},</p>
          <p>Here is your 6-digit code to finish logging in:</p>

          <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a;">
              ${code}
            </div>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            This code expires in 10 minutes. If you didn't try to log in, ignore this email and change your password immediately.
          </p>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
            Ruhamah LuggageStore<br>
            2801 1st Ave Ste A, Seattle, WA 98121
          </p>
        </div>
      `,
    });
    console.log('2FA code sent to', to);
  } catch (error) {
    console.error('Failed to send 2FA code:', error);
  }
}

export async function sendExtraBagsLink(
  booking: { customer_name: string; customer_email: string; id: string },
  addedBags: number,
  amount: number,
  paymentUrl: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[email] No RESEND_API_KEY — skipping extra bags email');
    return;
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Extra bags for your booking</h2>
      <p>Hi ${booking.customer_name},</p>
      <p>We noticed you brought <strong>${addedBags} extra bag${addedBags > 1 ? 's' : ''}</strong> for your storage booking.</p>
      <p>Please complete the payment of <strong>$${amount.toFixed(2)}</strong> using the link below:</p>
      <p style="margin: 24px 0;">
        <a href="${paymentUrl}" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">
          Pay $${amount.toFixed(2)}
        </a>
      </p>
      <p style="color:#666;font-size:13px;">Booking reference: ${booking.id.slice(0, 8)}</p>
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.customer_email,
      subject: `Extra bags — pay $${amount.toFixed(2)}`,
      html,
    });
    console.log('Extra bags link sent to', booking.customer_email);
  } catch (error) {
    console.error('Failed to send extra bags email:', error);
  }
}