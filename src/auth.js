import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const TOKEN_DIR  = join(homedir(), '.mdatlas');
const TOKEN_FILE = join(TOKEN_DIR, 'token');

function loadOrCreateToken() {
  mkdirSync(TOKEN_DIR, { recursive: true });
  try { return readFileSync(TOKEN_FILE, 'utf8').trim(); } catch {}
  const token = crypto.randomUUID();
  writeFileSync(TOKEN_FILE, token, 'utf8');
  return token;
}

export const SESSION_TOKEN = loadOrCreateToken();

export function isAuthorized(req) {
  const auth = (req.headers['authorization'] ?? '').trim();
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim() === SESSION_TOKEN;
  return new URL(req.url, 'http://x').searchParams.get('token') === SESSION_TOKEN;
}
