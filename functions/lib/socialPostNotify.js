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

export async function sendTwilioSms(to, body) {
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
 * @param {{ date?: string, topic?: { title: string }, sourceArticle?: { title: string }, adminBaseUrl: string }} post
 * @param {string} phone
 */
export async function notifyPostReady(post, phone) {
  const topic = post.topic?.title || 'Social post';
  const date = post.date || new Date().toISOString().slice(0, 10);
  const adminUrl = `${post.adminBaseUrl || 'https://www.manydoorsai.com/developer-admin'}?tab=social`;

  const body = [
    `ManyDoors AI — ${date} posts ready`,
    topic,
    '',
    adminUrl,
    '',
    'FB · IG · X ready to review',
  ].join('\n');

  return sendTwilioSms(phone, body);
}

export async function sendTestSms(phone) {
  const body = [
    'ManyDoors AI social factory — test OK',
    'You will get a text like this every morning when posts are ready.',
    'https://www.manydoorsai.com/developer-admin?tab=social',
  ].join('\n');
  return sendTwilioSms(phone, body);
}
