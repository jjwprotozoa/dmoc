#!/bin/bash
# deploy.sh
# Deployment script for JSON API Cache Worker
# Usage: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}

echo "🚀 Deploying JSON API Cache Worker to $ENVIRONMENT..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run:"
    echo "wrangler login"
    exit 1
fi

# Run type checking
echo "🔍 Running type check..."
npm run type-check

# Run tests
echo "🧪 Running tests..."
npm run test

# Deploy based on environment
case $ENVIRONMENT in
    staging)
        echo "📦 Deploying to staging..."
        wrangler deploy --env staging
        ;;
    production)
        echo "📦 Deploying to production..."
        wrangler deploy --env production
        ;;
    *)
        echo "❌ Invalid environment. Use 'staging' or 'production'"
        exit 1
        ;;
esac

echo "✅ Deployment complete!"
echo "🌐 Check your Cloudflare dashboard for the deployed worker"
