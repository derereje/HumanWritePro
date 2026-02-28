# Polar Meter Configuration Guide

## Exact Configuration for Word Usage Meter

Based on your Polar dashboard interface, here's the exact configuration:

### Basic Information
- **Name**: `Word Usage`
  - This will be shown on customer invoices and usage reports

### Filters Section

**Condition Group:**

1. **First Condition (Event Name)**:
   - Field: `Name`
   - Operator: `equals`
   - Value: `word_usage`

That's it! You don't need to add metadata filters because we're sending the word count directly in the event.

### Aggregation Section

⚠️ **IMPORTANT**: Choose **Sum**, not Count!

- **Aggregation Type**: `Sum`
- **Over property**: `metadata.word_count`

**Why Sum?**
- We want to add up the total words used (e.g., 100 + 200 + 150 = 450 words)
- "Count" would only count the number of requests (3 requests), not the actual usage

### Final Configuration Summary

```
Name: Word Usage

Filters:
├─ Name equals "word_usage"

Aggregation:
└─ Sum of metadata.word_count
```

## How the Events Work

When a user humanizes 150 words, we send:
```json
{
  "name": "word_usage",
  "external_customer_id": "clerk_user_123",
  "metadata": {
    "word_count": 150,  ← This is what gets summed
    "preset": "professional",
    "plan": "pro"
  }
}
```

Multiple events from the same customer:
- Event 1: `word_count: 100`
- Event 2: `word_count: 200`
- Event 3: `word_count: 150`
- **Total Metered**: 450 words (perfect for billing!)

## Testing After Creation

1. Click "Create Meter" or "Save"
2. Make a humanization request in your app
3. Go to Polar Dashboard → Meters → "Word Usage"
4. Click "View Quantities"
5. You should see the word counts being aggregated

## Linking to Products

After creating the meter:

1. Go to **Products** → Select your product (Basic/Pro/Ultra)
2. Click **Add Price** → Choose **Metered Price**
3. Select your "Word Usage" meter
4. Configure pricing:
   - **Per-unit pricing**: e.g., $0.001 per word (adjust as needed)
   - **Included units**: e.g., first 5,000 words free for Basic plan
   - **Tiers**: Optional - different rates for different usage levels

Example pricing structure:
- **Basic Plan**: 
  - Included: 5,000 words/month
  - Overage: $0.01 per word beyond limit
  
- **Pro Plan**: 
  - Included: 20,000 words/month
  - Overage: $0.008 per word beyond limit
  
- **Ultra Plan**: 
  - Included: 45,000 words/month
  - Overage: $0.005 per word beyond limit

## Important Notes

1. **Don't use "Count" aggregation** - that would count requests, not words
2. **Property path is exact**: `metadata.word_count` (no brackets, lowercase)
3. **Event name must match exactly**: `word_usage` (case-sensitive)
4. You can add more filters later if you want to track different types of usage separately

## Verification Checklist

- [ ] Meter created with name "Word Usage"
- [ ] Filter set to Name equals "word_usage"
- [ ] Aggregation set to "Sum"
- [ ] Property set to "metadata.word_count"
- [ ] Test request shows up in meter quantities
- [ ] Meter linked to your products with pricing
