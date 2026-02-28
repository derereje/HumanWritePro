#!/bin/bash

echo "🛑 Stopping Next.js dev server..."
pkill -f "next dev"
sleep 2

echo "🧹 Cleaning cache..."
cd /home/basketo/Desktop/PurifyText
rm -rf .next

echo "🚀 Starting dev server..."
npm run dev
