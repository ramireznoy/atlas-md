import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';

// Import routes first so they register themselves on the shared router instance
import '../src/routes/auth.js';
import '../src/routes/tree.js';
import '../src/routes/files.js';
import { router } from '../src/router.js';
import { SESSION_TOKEN } from '../src/auth.js';

function mockReq({ method = 'GET', url = '/', headers = {}, body = null } = {}) {
  const req = new EventEmitter();
  req.method  = method;
  req.url     = url;
  req.headers = { ...headers };
  setImmediate(() => {
    if (body !== null) req.emit('data', Buffer.from(JSON.stringify(body)));
    req.emit('end');
  });
  return req;
}

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    writeHead(code, hdrs = {}) { this.statusCode = code; Object.assign(this.headers, hdrs); },
    end(data = '') { this.body = typeof data === 'string' ? data : data?.toString() ?? ''; },
  };
}

const auth = () => ({ authorization: `Bearer ${SESSION_TOKEN}` });

describe('Auth middleware', () => {
  it('returns 401 for unauthenticated API requests', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/api/tree' }), res);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(JSON.parse(res.body), { error: 'Unauthorized' });
  });

  it('accepts a valid Bearer token', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/api/auth', headers: auth() }), res);
    assert.equal(res.statusCode, 200);
  });

  it('accepts a valid token as a query param', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: `/api/auth?token=${SESSION_TOKEN}` }), res);
    assert.equal(res.statusCode, 200);
  });

  it('does not require auth for static files', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/css/app.css' }), res);
    assert.notEqual(res.statusCode, 401);
  });
});

describe('Routing', () => {
  it('returns 404 for an unknown API route', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/api/unknown', headers: auth() }), res);
    assert.equal(res.statusCode, 404);
  });

  it('GET /api/auth returns { ok: true }', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/api/auth', headers: auth() }), res);
    assert.deepEqual(JSON.parse(res.body), { ok: true });
  });

  it('GET /api/tree returns tree array and root string', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/api/tree', headers: auth() }), res);
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.ok(Array.isArray(data.tree));
    assert.equal(typeof data.root, 'string');
  });

  it('GET /api/file returns 400 when path param is missing', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/api/file', headers: auth() }), res);
    assert.equal(res.statusCode, 400);
  });

  it('GET /api/file returns 403 for a path traversal attempt', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/api/file?path=../../etc/passwd', headers: auth() }), res);
    assert.equal(res.statusCode, 403);
  });
});

describe('Static file serving', () => {
  it('serves / as index.html with text/html content-type', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/' }), res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['Content-Type']?.startsWith('text/html'));
  });

  it('serves /css/app.css with text/css content-type', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/css/app.css' }), res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['Content-Type']?.startsWith('text/css'));
  });

  it('serves /js/main.js with application/javascript content-type', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/js/main.js' }), res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['Content-Type']?.startsWith('application/javascript'));
  });

  it('returns 404 for a non-existent static file', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/nonexistent-file.js' }), res);
    assert.equal(res.statusCode, 404);
  });

  it('returns 404 (not 200) for a path traversal in static requests', async () => {
    const res = mockRes();
    await router.handle(mockReq({ url: '/../server.js' }), res);
    assert.equal(res.statusCode, 404);
  });
});
