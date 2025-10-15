# JSON API Cache Worker

A Cloudflare Worker script that caches JSON API responses for 5 minutes, improving performance and reducing origin server load.

## Features

- ✅ **5-minute TTL**: Automatic cache expiration after 5 minutes
- ✅ **JSON-only caching**: Only caches successful JSON responses
- ✅ **Smart cache keys**: Includes method, path, and query parameters
- ✅ **Cache headers**: Proper Cache-Control and custom headers
- ✅ **Error handling**: Graceful fallbacks and error responses
- ✅ **Cache invalidation**: Version-based cache keys for easy invalidation
- ✅ **Development ready**: Local development with wrangler dev

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Routes

Edit `wrangler.toml` and update the routes to match your API endpoints:

```toml
routes = [
  "api.yourdomain.com/api/*",
  "yourdomain.com/api/v1/*"
]
```

### 3. Deploy

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## Configuration

### Environment Variables

Set in `wrangler.toml` or as secrets:

```toml
[vars]
CACHE_TTL = "300"  # 5 minutes in seconds
CACHE_VERSION = "v1"
```

### Cache Behavior

The worker will cache responses that meet these criteria:

- ✅ HTTP method is GET
- ✅ Response status is 200 (successful)
- ✅ Content-Type includes `application/json`
- ✅ No `no-cache` header present

### Cache Headers

The worker adds these headers to responses:

- `Cache-Control: public, max-age=300, s-maxage=300`
- `X-Cache-Status: HIT` or `MISS`
- `X-Cache-TTL: 300`

## Usage Examples

### Basic API Caching

```javascript
// Your API endpoint
fetch('https://api.yourdomain.com/users')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Cache Invalidation

To invalidate cache, update the `CACHE_VERSION` in `wrangler.toml`:

```toml
[vars]
CACHE_VERSION = "v2"  # This will invalidate all cached responses
```

### Custom Cache TTL

Override the default 5-minute TTL by setting environment variables:

```bash
wrangler secret put CACHE_TTL
# Enter: 600 (for 10 minutes)
```

## Development

### Local Development

```bash
npm run dev
```

This starts a local development server at `http://localhost:8787`

### Testing

```bash
npm run test
```

### Type Checking

```bash
npm run type-check
```

## API Reference

### Cache Key Generation

Cache keys are generated using this pattern:
```
{CACHE_VERSION}:{METHOD}:{PATHNAME}{SEARCH}
```

Example: `v1:GET:/api/users?page=1&limit=10`

### Response Headers

| Header | Description | Values |
|--------|-------------|---------|
| `X-Cache-Status` | Cache hit/miss status | `HIT`, `MISS`, `ERROR` |
| `X-Cache-TTL` | Cache TTL in seconds | `300` (default) |
| `Cache-Control` | Browser cache control | `public, max-age=300, s-maxage=300` |

## Deployment

### Staging Environment

```bash
wrangler deploy --env staging
```

### Production Environment

```bash
wrangler deploy --env production
```

### Custom Domains

Add custom domains in `wrangler.toml`:

```toml
[[env.production.routes]]
pattern = "api.yourdomain.com/*"
custom_domain = true
```

## Monitoring

### Analytics

Enable analytics in `wrangler.toml`:

```toml
[analytics]
enabled = true
```

### Logs

View logs in the Cloudflare dashboard or via CLI:

```bash
wrangler tail
```

## Troubleshooting

### Common Issues

1. **Cache not working**: Check that routes are properly configured
2. **Wrong TTL**: Verify `CACHE_TTL` environment variable
3. **JSON not cached**: Ensure response has `application/json` content-type

### Debug Mode

Enable debug logging by setting log level:

```toml
[log]
level = "debug"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.