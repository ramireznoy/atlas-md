import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SESSION_TOKEN, isAuthorized } from '../src/auth.js';

const req = (url, headers = {}) => ({ url, headers });

describe('isAuthorized', () => {
  it('accepts a valid Bearer token', () => {
    assert.ok(isAuthorized(req('/api/auth', { authorization: `Bearer ${SESSION_TOKEN}` })));
  });

  it('rejects an invalid Bearer token', () => {
    assert.ok(!isAuthorized(req('/api/auth', { authorization: 'Bearer wrong-token' })));
  });

  it('rejects an empty Bearer token', () => {
    assert.ok(!isAuthorized(req('/api/auth', { authorization: 'Bearer ' })));
  });

  it('accepts a valid token as a query param', () => {
    assert.ok(isAuthorized(req(`/api/auth?token=${SESSION_TOKEN}`)));
  });

  it('rejects an invalid token query param', () => {
    assert.ok(!isAuthorized(req('/api/auth?token=wrong')));
  });

  it('rejects a missing authorization header', () => {
    assert.ok(!isAuthorized(req('/api/auth')));
  });

  it('does not accept a token that is a prefix of the real one', () => {
    const partial = SESSION_TOKEN.slice(0, 8);
    assert.ok(!isAuthorized(req('/api/auth', { authorization: `Bearer ${partial}` })));
  });
});
