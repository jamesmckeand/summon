# Summon — Financial Model

*Last updated: March 2026*

---

## Monthly Overhead (Fixed Costs)

| Service | Plan | Cost (CAD/mo) |
|---------|------|--------------|
| Vercel | Hobby (free) | $0 |
| Supabase | Free tier | $0 |
| Resend | Free (3k emails/mo) | $0 |
| Google Workspace | Business Starter | ~$8 |
| Apple Developer | $99/yr | ~$9 |
| **Total at launch** | | **~$17/mo** |

### Upgrade triggers (when to pay more)
| Trigger | Upgrade | New cost |
|---------|---------|----------|
| ~10k users or DB > 400MB | Supabase Pro | +$25/mo |
| Function invocations spike | Vercel Pro | +$20/mo |
| >3k emails/mo | Resend Starter | +$20/mo |
| >50k emails/mo | Resend Scale | +$90/mo |

**Estimated overhead at 30k users:** ~$90/mo CAD

---

## Revenue Streams

### 1. Affiliate Commissions (Ticket Sales)

| Metric | Conservative | Mid | Optimistic |
|--------|-------------|-----|------------|
| Monthly visitors | 5,000 | 20,000 | 100,000 |
| Click-through to tickets | 2% | 3% | 5% |
| Ticket purchase conversion | 10% | 15% | 20% |
| Avg ticket (CAD) | $100 | $120 | $140 |
| Affiliate commission rate | 4% | 4% | 5% |
| **Monthly affiliate revenue** | **~$40** | **~$432** | **~$7,000** |

*Ticketmaster / StubHub via Impact, SeatGeek direct.*

### 2. Superfan Subscriptions ($4 CAD/mo)

| Users | Conversion | Subscribers | Monthly Revenue |
|-------|-----------|-------------|----------------|
| 1,000 | 2% | 20 | $80 |
| 5,000 | 2% | 100 | $400 |
| 10,000 | 3% | 300 | $1,200 |
| 30,000 | 3% | 900 | $3,600 |
| 100,000 | 3% | 3,000 | $12,000 |

### 3. B2B Data Access (Tour Managers / Promoters)

One deal = $5,000–$15,000 CAD. Not passive — requires outbound sales.

| Scenario | Deals/yr | Annual Revenue |
|----------|---------|---------------|
| Conservative | 0 | $0 |
| Realistic (yr 2) | 2 | $15,000 |
| Optimistic | 5 | $50,000 |

---

## Projections by User Milestone

| Users (MAU) | Affiliates/mo | Superfan/mo | Overhead/mo | **Net/mo** |
|-------------|--------------|------------|------------|------------|
| 1,000 | $40 | $80 | $17 | **+$103** |
| 5,000 | $200 | $400 | $42 | **+$558** |
| 10,000 | $432 | $1,200 | $67 | **+$1,565** |
| 30,000 | $1,200 | $3,600 | $90 | **+$4,710** |
| 100,000 | $4,000 | $12,000 | $155 | **+$15,845** |

*These are conservative-to-mid estimates. B2B deals not included — they would roughly double the numbers at 10k+ users.*

---

## Path to $30k CAD / Year

| Path | What's needed | Realistic? |
|------|--------------|-----------|
| Pure subscriptions | ~625 active Superfans | Requires ~20k users |
| Affiliates only | ~500k ticket sales through links | Requires massive traffic |
| Mixed (10k users) | $1,565/mo × 12 = ~$18,800/yr | Close but not quite |
| Mixed (30k users) | $4,710/mo × 12 = ~$56,500/yr | Yes |
| 1 B2B deal + 10k users | $18,800 + $10,000 = $28,800 | Very close |
| 2 B2B deals + 5k users | $6,700 + $20,000 = $26,700 | Yes |

**Conclusion:** $30k CAD in year 1 requires either 30k users OR 1-2 B2B data deals. The B2B path is faster but requires active outreach.

---

## Year 1 Realistic Forecast

| Quarter | MAU target | Monthly revenue | Notes |
|---------|-----------|----------------|-------|
| Q2 2026 | 500 | $50 | Launch, early adopters |
| Q3 2026 | 2,000 | $250 | SEO kicks in, Reddit |
| Q4 2026 | 6,000 | $800 | Viral moment or press hit |
| Q1 2027 | 12,000 | $1,800 | Compounding SEO + referrals |

**Year 1 total revenue estimate:** ~$8,000–$15,000 CAD
**Year 1 total costs:** ~$800 CAD
**Year 1 net:** ~$7,200–$14,200 CAD

---

## Stripe Setup Checklist

- [ ] Create Stripe account at stripe.com
- [ ] Create product "Summon Superfan" → recurring price $4 CAD/mo
- [ ] Add `STRIPE_SECRET_KEY` to Vercel
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Vercel (Stripe → Developers → Webhooks → add endpoint `https://wesummon.com/api/stripe/webhook`)
- [ ] Add `STRIPE_PRICE_ID` to Vercel (the `price_xxx` ID from the product you created)
- [ ] Run `supabase-subscriptions-migration.sql` in Supabase SQL editor
- [ ] Run `npm install stripe` locally
- [ ] Test checkout flow end to end
