/**
 * Daily SMS notification when a new social post bundle is ready for review.
 */

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (String(phone || '').startsWith('+')) return phone;
  return `+${digits}`;
}

async function sendTwilioSms(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    console.warn('[socialPostNotify] Twilio not configured — skipping SMS');
    return { sent: false, reason: 'twilio_not_configured' };
  }

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: normalizePhone(to), From: from, Body: body }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Twilio SMS failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return { sent: true, sid: data.sid };
}

/**
 * @param {{ topic: { title: string }, sourceArticle?: { title: string }, adminBaseUrl: string }} post
 * @param {string} phone
 */
export async function notifyPostReady(post, phone) {
  const topic = post.topic?.title || 'Social post';
  const headline = post.sourceArticle?.title
    ? post.sourceArticle.title.slice(0, 60)
    : topic;
  const adminUrl = post.adminBaseUrl || 'https://www.manydoorsai.com/developer-admin';

  const body = [
    `ManyDoors AI — today's social posts are ready 📱`,
    ``,
    `Topic: ${topic}`,
    `Angle: ${headline}${headline.length >= 60 ? '…' : ''}`,
    ``,
    `Review & approve:`,
    `${adminUrl}?tab=social`,
    ``,
    `FB · IG · X captions + images bundled.`,
  ].join('\n');

  return sendTwilioSms(phone, body);
}
