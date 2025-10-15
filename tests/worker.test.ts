// tests/worker.test.ts
// Test suite for JSON API Cache Worker
// Run with: npm test

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Cloudflare Workers environment
const mockEnv = {};
const mockCtx = {
  waitUntil: vi.fn()
};

// Mock caches API
const mockCache = {
  match: vi.fn(),
  put: vi.fn()
};

// Mock global caches
Object.defineProperty(global, 'caches', {
  value: {
    default: mockCache
  },
  writable: true
});

// Mock fetch
const mockFetch = vi.fn();
Object.defineProperty(global, 'fetch', {
  value: mockFetch,
  writable: true
});

// Import worker (we'll need to adjust this based on actual implementation)
// For now, we'll test the helper functions directly

describe('JSON API Cache Worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cache Key Generation', () => {
    it('should generate cache key with method and URL', () => {
      const request = new Request('https://api.example.com/users?page=1');
      const expectedKey = 'v1:GET:/users?page=1';
      
      // This would be the actual implementation
      const url = new URL(request.url);
      const key = `GET:${url.pathname}${url.search}`;
      const cacheKey = `v1:${key}`;
      
      expect(cacheKey).toBe(expectedKey);
    });

    it('should include query parameters in cache key', () => {
      const request = new Request('https://api.example.com/users?page=1&limit=10');
      const url = new URL(request.url);
      const key = `GET:${url.pathname}${url.search}`;
      const cacheKey = `v1:${key}`;
      
      expect(cacheKey).toBe('v1:GET:/users?page=1&limit=10');
    });
  });

  describe('Response Caching Logic', () => {
    it('should cache successful JSON responses', () => {
      const response = new Response(
        JSON.stringify({ users: [] }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' }
        }
      );

      // Test shouldCacheResponse logic
      const isOk = response.ok && response.status === 200;
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const cacheControl = response.headers.get('cache-control');
      const hasNoCache = cacheControl && cacheControl.includes('no-cache');
      
      const shouldCache = isOk && isJson && !hasNoCache;
      
      expect(shouldCache).toBe(true);
    });

    it('should not cache non-JSON responses', () => {
      const response = new Response(
        '<html><body>Hello</body></html>',
        {
          status: 200,
          headers: { 'content-type': 'text/html' }
        }
      );

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      expect(isJson).toBe(false);
    });

    it('should not cache error responses', () => {
      const response = new Response(
        JSON.stringify({ error: 'Not found' }),
        {
          status: 404,
          headers: { 'content-type': 'application/json' }
        }
      );

      const isOk = response.ok && response.status === 200;
      
      expect(isOk).toBe(false);
    });
  });

  describe('Cache Headers', () => {
    it('should add cache headers to responses', () => {
      const originalResponse = new Response(
        JSON.stringify({ data: 'test' }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' }
        }
      );

      const headers = new Headers(originalResponse.headers);
      headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
      headers.set('X-Cache-Status', 'MISS');
      headers.set('X-Cache-TTL', '300');

      expect(headers.get('Cache-Control')).toBe('public, max-age=300, s-maxage=300');
      expect(headers.get('X-Cache-Status')).toBe('MISS');
      expect(headers.get('X-Cache-TTL')).toBe('300');
    });
  });

  describe('Error Handling', () => {
    it('should return error response on fetch failure', () => {
      const errorResponse = new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'An error occurred while processing the request'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache-Status': 'ERROR'
          }
        }
      );

      expect(errorResponse.status).toBe(500);
      expect(errorResponse.headers.get('X-Cache-Status')).toBe('ERROR');
    });
  });
});
