export const SESSION_TOKEN = crypto.randomUUID();

export function isAuthorized(req) {
  const auth = (req.headers['authorization'] ?? '').trim();
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim() === SESSION_TOKEN;
  return new URL(req.url, 'http://x').searchParams.get('token') === SESSION_TOKEN;
}
