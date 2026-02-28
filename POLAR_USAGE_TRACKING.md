# Polar Usage Tracking Setup

This document explains how to configure Polar's usage-based billing for your application.

## Overview

The application now sends usage events to Polar whenever users consume words through the humanization API. This allows Polar to:
- Track actual customer usage
- Bill customers based on metered consumption
- Provide usage analytics and reporting

## How It Works

1. **Event Ingestion**: Every time a user successfully humanizes text, the app sends a `word_usage` event to Polar with the word count.
2. **Customer Identification**: Events are tied to customers using their Clerk ID as the `external_customer_id`.
3. **Metadata**: Each event includes additional context (preset, plan, model used, etc.).

## Polar Dashboard Setup

### Step 1: Create a Meter

1. Go to your Polar dashboard
2. Navigate to **Products** → **Meters**
3. Click **Create Meter**
4. Configure the meter:
   - **Name**: `Word Usage` (or similar)
   - **Event Name**: `word_usage`
   - **Aggregation**: `sum`
   - **Field**: `metadata.word_count`

### Step 2: Create Metered Products

For each subscription tier (Basic, Pro, Ultra):

1. Navigate to **Products** → **Create Product**
2. Set up product details
3. Add a **Metered Price**:
   - Link it to your Word Usage meter
   - Set pricing per unit (e.g., $0.001 per word)
   - Configure any included units or tiers

### Step 3: Update Environment Variables

The app already has the required environment variable:
- `POLAR_ACCESS_TOKEN` - Your Organization Access Token (already configured)

This token is used to authenticate event ingestion requests.

## Event Structure

Each usage event sent to Polar looks like this:

```json
{
  "name": "word_usage",
  "external_customer_id": "clerk_user_id_here",
  "timestamp": "2025-11-09T12:00:00.000Z",
  "metadata": {
    "word_count": 150,
    "preset": "professional",
    "plan": "pro",
    "model": "gemini",
    "stream": true
  }
}
```

## Monitoring Usage

### In Polar Dashboard

1. Navigate to **Meters** → Select your Word Usage meter
2. Click **View Quantities** to see usage over time
3. Filter by customer or time period

### In Your Application

Usage tracking is logged to console with the tag `[STREAM API]` or `[HUMANIZER API]`:
- ✅ Success: `Successfully tracked X words in Polar for user Y`
- ❌ Failure: `Failed to track usage in Polar: error message`

Note: If Polar tracking fails, the request still succeeds. Users aren't blocked if Polar is temporarily unavailable.

## Testing

### 1. Test Event Ingestion

Make a humanization request and check:
1. Application logs for `Successfully tracked X words in Polar`
2. Polar dashboard → Meters → Recent events

### 2. Verify Customer Mapping

Ensure customers in Polar are linked correctly:
1. When users subscribe via Polar checkout, include `clerkId` in metadata
2. Polar will create the customer with this external ID
3. Events will automatically link to the correct customer

## Troubleshooting

### Events Not Appearing

1. **Check Token**: Verify `POLAR_ACCESS_TOKEN` is correct
2. **Check Meter Name**: Ensure meter event name matches `word_usage`
3. **Check Logs**: Look for error messages in application logs
4. **API Response**: Polar API will return specific error messages

### Customers Not Linked

1. **External ID**: Ensure `clerkId` is passed in checkout metadata
2. **Event Customer ID**: Verify `external_customer_id` in events matches customer's external ID in Polar

## Implementation Details

### Files Modified

- `src/server/utils/polar-client.ts` - New Polar events API client
- `src/app/api/humanizer/route.ts` - Added usage tracking (non-streaming)
- `src/app/api/humanizer/stream/route.ts` - Added usage tracking (streaming, 5 locations)

### Key Functions

- `trackWordUsage(clerkId, wordCount, metadata)` - Tracks word consumption
- `ingestPolarEvent(customerId, eventName, metadata)` - Generic event ingestion

## Resources

- [Polar Usage-Based Billing Docs](https://docs.polar.sh/features/usage-based-billing)
- [Polar Events API](https://docs.polar.sh/api-reference/events/ingest)
- [Polar Meters Guide](https://docs.polar.sh/features/usage-based-billing/meters)
