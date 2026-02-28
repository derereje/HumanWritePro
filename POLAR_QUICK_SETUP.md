# Polar Quick Setup - Copy/Paste Values

## Step 1: Create Meter

Copy these exact values into the Polar form:

### Field: Name
```
Word Usage
```

### Field: Filters → Name
- Dropdown 1: `Name`
- Dropdown 2: `equals`
- Text input:
```
word_usage
```

### Field: Aggregation
- Dropdown: Select `Sum` (NOT Count!)
- Over property field:
```
metadata.word_count
```

**Click "Create Meter"**

---

## Step 2: Link Meter to Products

### For Each Product (Basic, Pro, Ultra):

1. Navigate to: **Products** → [Select Product] → **Prices**
2. Click **"Add Price"**
3. Select **"Metered Price"**
4. Choose your **"Word Usage"** meter
5. Set pricing based on your plan:

#### Suggested Pricing Examples:

**Basic Plan:**
- Base monthly: $9
- Included units: 5,000 words
- Overage rate: $0.01 per word

**Pro Plan:**
- Base monthly: $29
- Included units: 20,000 words
- Overage rate: $0.008 per word

**Ultra Plan:**
- Base monthly: $79
- Included units: 45,000 words
- Overage rate: $0.005 per word

---

## Step 3: Test It

1. **Make a test request**: Humanize some text in your app
2. **Check app logs**: Look for `Successfully tracked X words in Polar`
3. **Check Polar Dashboard**: 
   - Go to Meters → "Word Usage"
   - Click "View Quantities"
   - You should see the word count appear

---

## Common Mistakes to Avoid

❌ **DON'T**: Use "Count" aggregation (counts events, not words)
✅ **DO**: Use "Sum" aggregation on `metadata.word_count`

❌ **DON'T**: Add extra filters on metadata (not needed)
✅ **DO**: Just filter by Name equals "word_usage"

❌ **DON'T**: Type `metadata["word_count"]` or `metadata.wordCount`
✅ **DO**: Type exactly `metadata.word_count`

---

## What Happens After Setup

✅ Every humanization request sends usage to Polar
✅ Polar aggregates total words per customer
✅ You can see usage in real-time
✅ Polar generates invoices based on actual consumption
✅ Customers see their usage on their billing portal

---

## Environment Variables (Already Configured)

You already have these set up:
- ✅ `POLAR_ACCESS_TOKEN` - For sending events
- ✅ `POLAR_WEBHOOK_SECRET` - For receiving subscription updates

No additional environment variables needed!

---

## Support

If you encounter issues:
1. Check application logs for Polar tracking errors
2. Verify the meter event name is exactly `word_usage`
3. Ensure aggregation is "Sum" not "Count"
4. Check that `POLAR_ACCESS_TOKEN` has the correct permissions

The code is already deployed and working - just need to configure the meter in Polar! 🚀
