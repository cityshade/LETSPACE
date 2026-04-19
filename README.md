# 🏠 LETSPACE — Kenya's #1 Claude-Powered Property Management SaaS

> **ISO-grade · AI-native · Built for the Kenyan real estate market**

LETSPACE is a cutting-edge, production-ready Property Management SaaS platform engineered specifically for Kenya's dynamic real estate market. Powered by Anthropic's Claude AI and deeply integrated with Safaricom M-Pesa.

---

## ✨ Key Features

### 🏢 Property Management
- Multi-property portfolio with unlimited units
- Property categories: Apartment, House, Villa, Bedsitter, Studio, Office, Retail, Warehouse
- Kenya-specific: LR Numbers, Title Deeds, Land Registry tracking
- AI-generated marketing descriptions (Claude-powered)
- Public listing portal with SEO optimization

### 💰 Financial Management
- **M-Pesa STK Push** rent collection (Safaricom Daraja API)
- Automated rent invoicing and payment reminders
- KRA-compliant VAT tracking for commercial properties
- Expense tracking and net income reporting
- Stripe for international card payments
- Real-time collection rate analytics

### 👥 Tenant Management
- Digital tenant onboarding and applications
- **AI-powered tenant screening** — Claude analyzes risk and credit worthiness
- Lease management with auto-renewal and escalation tracking
- Blacklist tracking and Kenya National ID verification
- Emergency contact and employer verification

### 🔧 Maintenance Management
- Work order ticketing system
- AI priority assessment (Claude determines urgency automatically)
- Vendor/contractor management with ratings
- Cost tracking and repair history

### 📊 Analytics & Reporting
- Real-time KPI dashboard
- Revenue vs expenses vs net income charts
- Occupancy rate trends across all properties
- KRA-ready financial reports
- Lease expiry forecasting

### 🤖 Claude AI Features
- **Property Description Generator** — marketing copy in seconds
- **Tenant Screening** — risk scoring and recommendation
- **Pricing Intelligence** — market rent analysis for Kenya locations
- **Maintenance Triage** — automatic priority assessment
- **Financial Insights** — AI executive summaries
- **Natural Language Search** — "2-bed in Westlands under 50k"
- **AI Chat Assistant** — conversational property management support

### 📣 Marketing & Leads
- Public property portal with SEO
- Lead tracking from multiple sources (Website, Referral, Social, Portal)
- AI lead scoring and qualification
- Viewing scheduler

---

## 🏗️ Architecture

```
letspace/
├── prisma/
│   ├── schema.prisma          # Complete multi-tenant data model
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, Register pages
│   │   ├── (dashboard)/       # Protected dashboard
│   │   │   └── dashboard/
│   │   │       ├── page.tsx           # Main KPI dashboard
│   │   │       ├── properties/        # Property management
│   │   │       ├── tenants/           # Tenant management
│   │   │       ├── leases/            # Lease management
│   │   │       ├── financials/        # Invoices, Payments, Expenses
│   │   │       ├── maintenance/       # Work orders
│   │   │       ├── marketing/         # Listings, Leads
│   │   │       ├── analytics/         # Charts & Reports
│   │   │       ├── ai/                # Claude AI Assistant
│   │   │       └── settings/          # Org settings, Integrations
│   │   ├── (public)/
│   │   │   └── listings/      # Public property portal
│   │   ├── api/
│   │   │   ├── ai/            # Claude AI endpoints
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── properties/    # Property CRUD
│   │   │   ├── tenants/       # Tenant CRUD
│   │   │   ├── invoices/      # Invoice CRUD
│   │   │   ├── payments/      # M-Pesa payment initiation
│   │   │   ├── webhooks/      # M-Pesa callbacks
│   │   │   └── health/        # Health check
│   │   ├── layout.tsx         # Root layout with metadata
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Design system (Button, Card, Badge, etc.)
│   │   ├── layout/            # Sidebar, Topbar
│   │   └── dashboard/         # Stat cards, charts
│   ├── lib/
│   │   ├── ai/claude.ts       # All Claude AI integrations
│   │   ├── auth.ts            # NextAuth config with RBAC
│   │   ├── db.ts              # Prisma singleton
│   │   ├── mpesa.ts           # M-Pesa Daraja API integration
│   │   ├── types.ts           # Shared TypeScript types
│   │   └── utils.ts           # Utilities, formatters, constants
│   └── middleware.ts          # Auth route protection
├── Dockerfile                 # Multi-stage production Dockerfile
├── docker-compose.yml         # Full stack local dev
├── next.config.mjs            # Next.js config with security headers
└── tailwind.config.ts         # Design system config
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Safaricom Daraja API credentials (sandbox available)
- Anthropic API key

### 1. Clone & Install
```bash
git clone https://github.com/cityshade/letspace.git
cd letspace
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
# Fill in your credentials
```

### 3. Database Setup
```bash
npm run db:push    # Push schema to database
npm run db:seed    # Seed demo data
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Demo Login
```
Email: john@kamauproperties.co.ke
Password: letspace2026!
```

---

## 🐳 Docker Deployment

```bash
# Start full stack (PostgreSQL + Redis + App)
docker-compose up -d

# Or build and run manually
docker build -t letspace .
docker run -p 3000:3000 --env-file .env.local letspace
```

---

## 💳 M-Pesa Integration

LETSPACE uses Safaricom's Daraja API for:
- **STK Push** — Send payment requests to tenant phones
- **C2B** — Register paybill/till numbers
- **Callback Webhooks** — Real-time payment confirmations

```bash
# Register webhook URL with Safaricom
MPESA_CALLBACK_URL=https://yourdomain.co.ke/api/webhooks/mpesa
```

---

## 🤖 Claude AI Integration

```typescript
// Generate property description
const description = await generatePropertyDescription(property, opts);

// Screen a tenant application
const screening = await analyzeTenantApplication(application, unit, opts);

// Get market pricing intelligence
const pricing = await analyzePricingIntelligence(property, currentRent, opts);

// Triage maintenance priority
const triage = await assessMaintenancePriority(request, opts);
```

---

## 💰 Monetization Model

| Plan | Price | Properties | Units | AI Queries |
|------|-------|-----------|-------|-----------|
| FREE | KES 0/mo | 1 | 5 | 10/mo |
| STARTER | KES 2,999/mo | 5 | 50 | 100/mo |
| PROFESSIONAL | KES 9,999/mo | 25 | 500 | 1,000/mo |
| ENTERPRISE | KES 29,999/mo | Unlimited | Unlimited | Unlimited |

Annual plans save **20%**.

---

## 🔒 Security & Compliance

- **NextAuth v5** — JWT sessions with PKCE
- **Role-Based Access Control** — OWNER → ADMIN → MANAGER → AGENT → ACCOUNTANT → VIEWER
- **Security Headers** — XSS, clickjacking, MIME sniffing protection
- **Audit Logs** — Every action logged with user and timestamp
- **Kenya Landlord & Tenant Act** compliance
- **KRA** tax compliance for rental income
- **EARB** (Estate Agents Registration Board) standards
- ISO 27001-ready data handling

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] WhatsApp rent reminders (Twilio/AfricasTalking)
- [ ] Property inspection checklists
- [ ] Digital lease signing (DocuSign)
- [ ] KRA iTax direct integration
- [ ] Bank statement OCR for tenant screening
- [ ] Drone/360° property tours
- [ ] SACCO/bulk property management module
- [ ] Kenya Land Registry API integration
- [ ] Automated lease renewal workflows

---

## 📞 Support

- 📧 support@letspace.co.ke
- 🌐 https://letspace.co.ke
- 📱 +254 720 000 000

---

*Built with ❤️ for Kenya · Powered by Claude AI · ISO-grade security*

**LETSPACE Technologies Ltd** · Nairobi, Kenya · 2026
