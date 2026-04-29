let _token = '';

export async function initAuth() {
  const params   = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');

  if (urlToken && await _ping(urlToken)) {
    _token = urlToken;
    sessionStorage.setItem('md-token', urlToken);
    params.delete('token');
    const clean = window.location.pathname +
      (params.toString() ? '?' + params : '') +
      window.location.hash;
    window.history.replaceState({}, '', clean);
    return { ready: true, error: false };
  }

  const stored = sessionStorage.getItem('md-token');
  if (stored && await _ping(stored)) {
    _token = stored;
    return { ready: true, error: false };
  }

  sessionStorage.removeItem('md-token');
  return { ready: false, error: true };
}

async function _ping(token) {
  try {
    const res = await fetch('/api/auth', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch { return false; }
}

export function apiFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${_token}` },
  });
}
