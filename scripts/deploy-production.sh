#!/bin/bash
# deploy-production.sh
# Production deployment script for Vercel

echo "🚀 Starting production deployment..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Seed production database
echo "🌱 Seeding production database..."
npx tsx prisma/seed-production.ts

echo "✅ Production deployment completed!"
