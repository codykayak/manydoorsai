const ALLOWED_ORIGINS = [
  'https://www.macrorei.com',
  'https://macrorei.com',
  /^https:\/\/.*\.macrorei\.com$/,
  'https://www.manydoorsai.com',
  'https://manydoorsai.com',
  /^https:\/\/.*\.manydoorsai\.com$/,
  /^https:\/\/manydoorsai[\w-]*\.us-west1\.run\.app$/,
  'https://realestate-map-23692.web.app',
  'https://realestate-map-23692.firebaseapp.com',
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

function corsOrigin(req) {
  const origin = req.get('origin') || req.get('Origin') || '';
  if (!origin) return ALLOWED_ORIGINS[0];
  const ok = ALLOWED_ORIGINS.some((o) => (o instanceof RegExp ? o.test(origin) : o === origin));
  return ok ? origin : ALLOWED_ORIGINS[0];
}

export function setCors(req, res, { methods = 'POST, OPTIONS', headers = 'Content-Type' } = {}) {
  res.set('Access-Control-Allow-Origin', corsOrigin(req));
  res.set('Access-Control-Allow-Methods', methods);
  res.set('Access-Control-Allow-Headers', headers);
  res.set('Access-Control-Max-Age', '3600');
}
