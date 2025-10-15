// src/worker.ts
// Cloudflare Worker script for caching JSON API responses with 5-minute TTL
// Handles cache hits, misses, and automatic cache invalidation

export interface Env {
  // Environment variables can be added here if needed
  // API_BASE_URL?: string;
  // CACHE_TTL?: string;
}

// Cloudflare Workers types
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Cache configuration
const CACHE_TTL = 5 * 60; // 5 minutes in seconds
const CACHE_VERSION = 'v1'; // For cache invalidation when needed

// Helper function to generate cache key
function generateCacheKey(request: Request): string {
  const url = new URL(request.url);
  
  // Include method, pathname, and query parameters in cache key
  const key = `${request.method}:${url.pathname}${url.search}`;
  
  // Add cache version for easy invalidation
  return `${CACHE_VERSION}:${key}`;
}

// Helper function to check if response should be cached
function shouldCacheResponse(response: Response): boolean {
  // Only cache successful JSON responses
  if (!response.ok || response.status !== 200) {
    return false;
  }
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return false;
  }
  
  // Don't cache responses with no-cache headers
  const cacheControl = response.headers.get('cache-control');
  if (cacheControl && cacheControl.includes('no-cache')) {
    return false;
  }
  
  return true;
}

// Helper function to create cacheable response
function createCacheableResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  
  // Set cache headers for the response
  headers.set('Cache-Control', `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`);
  headers.set('X-Cache-Status', 'MISS');
  headers.set('X-Cache-TTL', CACHE_TTL.toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

// Helper function to create cached response
function createCachedResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  
  // Update cache status to indicate this is a cache hit
  headers.set('X-Cache-Status', 'HIT');
  headers.set('X-Cache-TTL', CACHE_TTL.toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

// Main fetch handler
const workerHandler = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Only handle GET requests for caching
      if (request.method !== 'GET') {
        return fetch(request);
      }
      
      // Generate cache key
      const cacheKey = generateCacheKey(request);
      
      // Try to get from cache first
      const cache = await caches.open('api-cache');
      const cachedResponse = await cache.match(cacheKey);
      
      if (cachedResponse) {
        // Cache hit - return cached response
        console.log(`Cache HIT for: ${cacheKey}`);
        return createCachedResponse(cachedResponse);
      }
      
      // Cache miss - fetch from origin
      console.log(`Cache MISS for: ${cacheKey}`);
      const response = await fetch(request);
      
      // Check if response should be cached
      if (shouldCacheResponse(response)) {
        // Clone the response for caching (responses can only be read once)
        const responseToCache = response.clone();
        
        // Create cacheable response
        const cacheableResponse = createCacheableResponse(responseToCache);
        
        // Store in cache asynchronously (don't wait for it)
        ctx.waitUntil(
          cache.put(cacheKey, cacheableResponse.clone()).catch(error => {
            console.error('Failed to cache response:', error);
          })
        );
        
        return cacheableResponse;
      }
      
      // Response not cacheable, return as-is
      return response;
      
    } catch (error) {
      console.error('Worker error:', error);
      
      // Return error response
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'An error occurred while processing the request'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache-Status': 'ERROR'
        }
      });
    }
  }
};

export default workerHandler;
