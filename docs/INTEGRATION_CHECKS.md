# Integration Verification Checklist

This document provides a step-by-step checklist for verifying that all integrations are properly configured and working in the DMOC Web PWA.

## Pre-Deployment Checklist

### ✅ Build Verification

- [ ] `npm run build` completes successfully without errors
- [ ] No missing environment variable errors during build
- [ ] All TypeScript compilation passes

### ✅ Integration Status Check

- [ ] Visit `/api/integrations/status` - should return all `false` initially
- [ ] All integrations show `status: "pending"` before credentials are added
- [ ] No errors in the status endpoint response

## Post-Deployment Checklist

### 🔐 Environment Variables Setup

- [ ] Added UltraMsg instance ID to Vercel environment variables
- [ ] Added UltraMsg token to Vercel environment variables
- [ ] Added UltraMsg sender phone to Vercel environment variables
- [ ] Added Traccar base URL to Vercel environment variables
- [ ] Added Traccar token to Vercel environment variables
- [ ] Added Tive API key to Vercel environment variables
- [ ] Added DATABASE_URL to Vercel environment variables

### 🔄 Redeploy After Adding Credentials

- [ ] Triggered redeploy after adding environment variables
- [ ] Verified new deployment is successful
- [ ] Confirmed environment variables are available in production

### ✅ Integration Verification Tests

#### Database Integration

- [ ] `/api/integrations/status` shows `database.configured: true`
- [ ] Database connection is working (check health endpoint)
- [ ] Prisma client can connect to production database

#### UltraMsg WhatsApp Integration

- [ ] `/api/integrations/status` shows `ultraMsg.configured: true`
- [ ] `/api/whatsapp/send` endpoint is accessible
- [ ] Successfully sent a test WhatsApp message
- [ ] WhatsApp webhook endpoint is receiving messages

#### Traccar GPS Tracking Integration

- [ ] `/api/integrations/status` shows `traccar.configured: true`
- [ ] `/api/traccar/devices` returns device list
- [ ] `/api/traccar/positions` returns position data
- [ ] `/api/traccar/webhook` receives POST from Traccar server
- [ ] GPS tracking data is being processed correctly

#### Tive Logistics Tracking Integration

- [ ] `/api/integrations/status` shows `tive.configured: true`
- [ ] Tive API calls are working (if applicable)
- [ ] Shipment tracking data is accessible

### 🧪 End-to-End Testing

#### WhatsApp Messaging Flow

- [ ] Send test message via `/api/whatsapp/send`
- [ ] Verify message delivery
- [ ] Test webhook reception at `/api/webhook/whatsapp`

#### GPS Tracking Flow

- [ ] Device positions are being received
- [ ] Location data is being stored in database
- [ ] Real-time updates are working via Socket.IO

#### Database Operations

- [ ] CRUD operations work for all entities
- [ ] Tenant isolation is enforced
- [ ] Data persistence is working correctly

## Troubleshooting

### Common Issues

#### Build Failures

- **Issue**: Missing environment variables during build
- **Solution**: Ensure all optional environment variables have defaults in `src/lib/env.ts`

#### Integration Status Shows False

- **Issue**: Environment variables not properly set in Vercel
- **Solution**: Double-check variable names and values in Vercel dashboard

#### API Calls Failing

- **Issue**: Credentials are incorrect or expired
- **Solution**: Verify credentials with service providers and update in Vercel

#### Webhook Not Receiving Data

- **Issue**: Webhook URL not properly configured in external services
- **Solution**: Update webhook URLs in Traccar/UltraMsg dashboards

### Verification Commands

```bash
# Check integration status
curl https://your-app.vercel.app/api/integrations/status

# Test WhatsApp send (replace with actual values)
curl -X POST https://your-app.vercel.app/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "body": "Test message"}'

# Test Traccar devices
curl https://your-app.vercel.app/api/traccar/devices
```

## Security Notes

- ✅ Never commit real credentials to version control
- ✅ Use Vercel's environment variables for production secrets
- ✅ Rotate API keys regularly
- ✅ Monitor webhook endpoints for unauthorized access
- ✅ Use HTTPS for all webhook URLs

## Support Contacts

- **UltraMsg**: Check UltraMsg dashboard for API status
- **Traccar**: Verify Traccar server is running and accessible
- **Tive**: Contact Tive support for API issues
- **Database**: Check MySQL connection and permissions

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: DMOC Development Team
