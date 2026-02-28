#!/bin/bash

# Script to fix .env Polar product IDs

echo "🔧 Fixing Polar product IDs in .env..."

# Remove quotes from POLAR_PRODUCT variables
sed -i 's/POLAR_PRODUCT_SMALL="\(.*\)"/POLAR_PRODUCT_SMALL=\1/' .env
sed -i 's/POLAR_PRODUCT_MEDIUM="\(.*\)"/POLAR_PRODUCT_MEDIUM=\1/' .env
sed -i 's/POLAR_PRODUCT_LARGE="\(.*\)"/POLAR_PRODUCT_LARGE=\1/' .env

echo "✅ Fixed! Your .env now has:"
grep "POLAR_PRODUCT" .env

echo ""
echo "📋 Next steps:"
echo "1. Clear cache: rm -rf .next"
echo "2. Restart: npm run dev"
