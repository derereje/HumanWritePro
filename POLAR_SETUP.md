# Polar Setup Guide for AcousticText

This guide explains how to set up and configure Polar for subscription management in AcousticText.

## Overview

Polar is used to handle subscription billing and payments for AcousticText. It provides:
- Multiple pricing tiers (Small, Medium, Large/Ultra)
- Monthly and yearly billing options
- Secure payment processing
- Webhook integration for subscription updates

## Prerequisites

1. A Polar account at [https://polar.sh](https://polar.sh)
2. API access token from Polar
3. Product IDs for each pricing tier

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Polar Configuration
POLAR_ACCESS_TOKEN=your_polar_access_token_here
POLAR_ENV=production  # or 'sandbox' for testing

# Polar Product IDs
# Small Plan (Starter)
POLAR_PRODUCT_SMALL=prod_xxxxx_monthly_small
POLAR_PRODUCT_YEARLY_SMALL=prod_xxxxx_yearly_small

# Medium Plan (Professional)
POLAR_PRODUCT_MEDIUM=prod_xxxxx_monthly_medium
POLAR_PRODUCT_YEARLY_MEDIUM=prod_xxxxx_yearly_medium

# Large Plan (Ultra)
POLAR_PRODUCT_LARGE=prod_xxxxx_monthly_large
POLAR_PRODUCT_YEARLY_LARGE=prod_xxxxx_yearly_large
```

## Creating Products in Polar

### 1. Log into Polar Dashboard

Navigate to [https://polar.sh/dashboard](https://polar.sh/dashboard) and log in.

### 2. Create Products

For each pricing tier (Small, Medium, Large), create two products:
- One for monthly billing
- One for yearly billing

#### Small Plan (Starter) Configuration:
- **Name:** AcousticText - Starter Plan
- **Credits:** 500 credits/month (5,000 words)
- **Features:**
  - Up to 1,000 words per request
  - Fast processing
  - Bypass all AI detectors
  - All core humanization presets
  - All languages supported
  - Customer support
- **Pricing:**
  - Monthly: $X.XX/month
  - Yearly: $XX.XX/year (save XX%)

#### Medium Plan (Professional) Configuration:
- **Name:** AcousticText - Professional Plan
- **Credits:** 2,000 credits/month (20,000 words)
- **Features:**
  - Up to 2,000 words per request
  - Faster processing
  - Bypass all AI detectors
  - All core humanization presets
  - All languages supported
  - Priority email support
- **Pricing:**
  - Monthly: $X.XX/month
  - Yearly: $XX.XX/year (save XX%)

#### Large Plan (Ultra) Configuration:
- **Name:** AcousticText - ULTRA Plan
- **Credits:** 4,500 credits/month (45,000 words)
- **Features:**
  - Up to 3,000 words per request
  - Priority processing
  - Bypass all AI detectors
  - All core humanization presets
  - All languages supported
  - API access for integrations
  - Team support
  - Dedicated support & onboarding
- **Pricing:**
  - Monthly: $X.XX/month
  - Yearly: $XX.XX/year (save XX%)

### 3. Get Product IDs

After creating each product, copy the Product ID from Polar and add it to your `.env` file.

## Webhook Configuration

### 1. Set Up Webhook Endpoint

The webhook endpoint is already configured at:
```
https://your-domain.com/api/webhooks/polar
```

### 2. Add Webhook in Polar Dashboard

1. Go to Polar Dashboard → Settings → Webhooks
2. Click "Add Webhook"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/polar`
4. Select the following events:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `order.created`
   - `checkout.completed`
5. Save the webhook configuration

### 3. Webhook Events Handled

The application handles the following Polar webhook events:

- **subscription.created**: Creates new subscription in database
- **subscription.updated**: Updates subscription details
- **subscription.canceled**: Marks subscription as canceled
- **order.created**: Processes one-time purchases
- **checkout.completed**: Confirms payment and activates subscription

## Database Schema

The User model includes subscription-related fields:

```prisma
model User {
  // ... other fields
  credits            Int       @default(50)  // Free users start with 50 credits
  subscriptionPlan   String?   // "small", "medium", "large"
  subscriptionType   String?   // "recurring", "one_time", "annual"
  productId          String?   // Polar product ID
  nextResetDate      DateTime? // When credits reset
  maxWordsPerRequest Int       @default(1000)
}
```

## Credit Management

### Free Plan
- **Initial Credits:** 50 credits
- **Words:** 500 words (50 credits × 10 words/credit)
- **Reset:** No automatic reset
- **Tone Options:** Default tone only

### Paid Plans
Credits are allocated based on subscription tier:

| Plan | Credits/Month | Words/Month | Max Words/Request |
|------|---------------|-------------|-------------------|
| Small | 500 | 5,000 | 1,000 |
| Medium | 2,000 | 20,000 | 2,000 |
| Large | 4,500 | 45,000 | 3,000 |

**Credit Reset:**
- Monthly subscriptions: Credits reset on the 1st of each month
- Yearly subscriptions: Credits reset monthly throughout the year
- Automatic reset handled by cron job at `/api/cron/reset-credits`

## Subscription Cancellation

Users can cancel their subscriptions from the Account page:

1. Navigate to Account → Subscription Management
2. Click "Cancel Subscription"
3. Confirm cancellation
4. User retains access until current billing period ends
5. After period ends, user is downgraded to free plan

### Cancellation API Endpoint

```typescript
POST /api/subscription/cancel
```

This endpoint:
- Verifies user authentication
- Checks for active subscription
- Updates database to mark subscription as canceled
- Returns success message

## Checkout Flow

### 1. User Selects Plan

From the pricing page, users can select:
- Billing frequency (Monthly or Yearly)
- Plan tier (Small, Medium, or Large)

### 2. Redirect to Polar Checkout

```typescript
// Example checkout URL generation
const checkoutUrl = await polarClient.checkouts.create({
  productId: selectedProductId,
  successUrl: `https://your-domain.com/account?success=true`,
  cancelUrl: `https://your-domain.com/pricing`,
  metadata: {
    userId: user.id,
    clerkId: user.clerkId,
  },
});
```

### 3. Polar Handles Payment

Polar securely processes the payment and returns to your success URL.

### 4. Webhook Updates Database

The webhook handler automatically:
- Updates user's subscription plan
- Allocates credits
- Sets next reset date
- Updates max words per request

## Testing

### Testing in Sandbox Mode

1. Set `POLAR_ENV=sandbox` in your `.env` file
2. Use Polar test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. Test webhook events using Polar's webhook testing tool

### Testing Webhooks Locally

Use ngrok or similar tool to expose your local server:

```bash
ngrok http 3000
```

Then add the ngrok URL to Polar webhooks:
```
https://your-ngrok-url.ngrok.io/api/webhooks/polar
```

## Monitoring

### Check Subscription Status

Monitor subscriptions in:
1. Polar Dashboard → Subscriptions
2. Your database User table
3. Application logs for webhook events

### Common Issues

**Webhook not firing:**
- Check webhook URL is publicly accessible
- Verify webhook events are selected in Polar
- Check application logs for errors

**Credits not updating:**
- Verify webhook handler is processing events correctly
- Check cron job is running for monthly resets
- Review database user record

**Subscription not activating:**
- Confirm webhook received and processed
- Check user metadata matches Clerk user ID
- Verify product IDs in environment variables

## API Reference

### Key Files

- `/src/lib/polar-products.ts` - Polar SDK initialization and product fetching
- `/src/app/api/webhooks/polar/route.ts` - Webhook handler
- `/src/app/api/subscription/cancel/route.ts` - Cancellation endpoint
- `/src/app/api/polar/checkout/route.ts` - Checkout creation
- `/src/components/pricing/PolarPricing.tsx` - Pricing UI component

## Security Best Practices

1. **Never expose your Polar access token** in client-side code
2. **Validate webhook signatures** to ensure requests are from Polar
3. **Use HTTPS** for all webhook endpoints
4. **Store sensitive data** in environment variables only
5. **Implement rate limiting** on API endpoints
6. **Log all subscription changes** for audit trail

## Support

For issues with Polar integration:
1. Check Polar documentation: [https://docs.polar.sh](https://docs.polar.sh)
2. Review application logs
3. Contact Polar support for payment/billing issues
4. Check webhook delivery logs in Polar dashboard

## Tone Features (Premium)

### Free Users
- **Available Tones:** Default only
- **Lock Icon:** Shows on premium tones
- **Behavior:** Clicking locked tones prompts upgrade

### Premium Users (All Plans)
- **Available Tones:**
  - Default
  - Friendly
  - Professional
  - Academic
  - Empathetic
  - Creative
  - Formal
  - Persuasive
- **No Restrictions:** All tones unlocked

The tone selection is sent to the backend with each humanization request:

```typescript
{
  text: "...",
  preset: "professional",
  tone: "professional"
}
```

## Migration Notes

If updating from a different payment system:

1. Export existing user subscriptions
2. Create matching products in Polar
3. Update environment variables
4. Run database migration if schema changed
5. Update existing user records with new product IDs
6. Test thoroughly in sandbox before production

---

**Last Updated:** 2025-11-05
