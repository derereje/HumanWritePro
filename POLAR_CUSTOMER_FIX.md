# Polar Customer Usage Tracking - Fix Applied

## Problem Identified

Usage events were showing as "Anonymous" in Polar because:
- We were using `external_customer_id` (Clerk ID) 
- But customers weren't created in Polar with that external ID
- Polar couldn't link the usage to any customer

## Solution Implemented

### 1. Database Schema Update ✅
Added `polarCustomerId` field to User model to store Polar's internal customer ID.

```prisma
model User {
  // ... existing fields
  polarCustomerId    String?  // New field
  // ... rest of fields
}
```

Migration applied: `20251109162231_add_polar_customer_id`

### 2. Webhook Update ✅
Updated Polar webhook to capture and store the customer ID when users subscribe:

```typescript
// In webhooks/polar/route.ts
data: {
  polarCustomerId: data.customer.id, // Now stores Polar's customer ID
  // ... other fields
}
```

### 3. Enhanced Polar Client ✅
Updated `polar-client.ts` with smart customer handling:

**Automatic Customer Creation:**
- When tracking usage, checks if user has a Polar customer ID
- If not, automatically creates the customer in Polar
- Uses user's email and name from database
- Sets Clerk ID as `external_id` in Polar
- Stores Polar customer ID back in database

**Event Tracking:**
- Now uses `customer_id` instead of `external_customer_id`
- Ensures events are properly attributed to customers
- Handles customer creation failures gracefully

## How It Works Now

### For New Subscriptions:
1. User subscribes via Polar checkout
2. Webhook fires with customer data
3. We store `polarCustomerId` in database
4. Usage events use this ID → properly tracked! ✅

### For Existing Users (Without Polar Customer ID):
1. User humanizes text
2. Code checks for `polarCustomerId` in database
3. Not found? → Creates customer in Polar automatically
4. Stores the new customer ID
5. Sends usage event → properly tracked! ✅

## Testing Instructions

### Test 1: New User with Subscription
1. Create a new test subscription in Polar
2. Make sure to include `clerkId` in checkout metadata
3. After subscription, check database for `polarCustomerId`
4. Humanize text
5. Check Polar dashboard → usage should be attributed to customer ✅

### Test 2: Existing User Without Polar Customer
1. Find user without `polarCustomerId` in database
2. Have them humanize text
3. Check logs for "Creating new customer in Polar"
4. Verify customer created in Polar dashboard
5. Check usage is attributed correctly ✅

### Test 3: Existing User With Polar Customer
1. User who already has `polarCustomerId`
2. Humanize text
3. Usage should immediately appear under their account ✅

## Expected Behavior

### In Application Logs:
```
[Polar Client] Ingesting event: {
  eventName: "word_usage",
  customerId: "polar_customer_123...",  ← Real customer ID, not "Anonymous"
  metadata: { word_count: 150, ... }
}
[Polar Client] Event ingested successfully: { inserted: 1 }
```

### In Polar Dashboard:
- Meter events show customer name/email (not "Anonymous")
- Usage meter displays correct quantities per customer
- Customer billing reflects actual usage
- Invoices show accurate word consumption

## Files Changed

1. **prisma/schema.prisma** - Added `polarCustomerId` field
2. **prisma/migrations/** - Database migration
3. **src/app/api/webhooks/polar/route.ts** - Store customer ID from webhook
4. **src/server/utils/polar-client.ts** - Auto-create customers, use customer_id

## Migration Notes

- Migration already applied to database
- Existing users will get `polarCustomerId = null`
- They'll be auto-created in Polar on first usage
- No manual intervention needed!

## Rollback Plan (if needed)

If issues occur:
1. Prisma schema: Remove `polarCustomerId` field
2. Run: `npx prisma migrate dev --name remove_polar_customer_id`
3. Revert webhook and polar-client changes
4. Fall back to external_customer_id (but will show as Anonymous)

## Next Steps

1. **Test the fix**: Try humanizing text now
2. **Check Polar dashboard**: Verify usage shows under your customer
3. **Monitor logs**: Ensure no errors in customer creation
4. **Verify billing**: Confirm usage meters are working correctly

The fix is complete and ready to test! 🚀
