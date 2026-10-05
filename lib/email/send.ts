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