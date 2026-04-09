# CLAUDE.md — Swoopt Admin Dashboard

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Swoopt Admin Dashboard — a Next.js web application for Swoopt's internal operations team. Provides platform oversight, provider management, support tools, and analytics for the Swoopt AI-driven last-minute service appointment marketplace.

- **Repo**: `https://github.com/crcnum4/swoopt_admin` (to be created)
- **Backend API**: Sibling directory `../swoopt-bun-api` — all endpoints documented below
- **Mobile App**: Sibling directory `../swoopt-expo` — React Native (Expo) customer/provider app
- **Parent CLAUDE.md**: `../CLAUDE.md` — full product context, business rules, and architecture

### What is Swoopt?

Swoopt is an AI-driven marketplace for last-minute service appointments. Customers describe what they need in natural language ("I need a deep tissue massage tonight within 5 miles"). The AI extracts structured intent, routes the request to matching providers in waves, and providers accept or deny. The customer picks from accepted offers, pays upfront ($7 platform fee + service price), attends the appointment, and both parties rate each other.

**Read `../CLAUDE.md` for full product context** — the business rules, industry-specific pricing (standard, medical hold, legal exempt), role-based access control, service matching algorithm, and the complete API architecture.

### Why This App Exists

The mobile app handles the customer and provider on-the-go experience. This admin dashboard handles operations that need desktop-friendly interfaces:
- Monitoring platform health and request metrics
- Managing exhausted/support-needed requests (manual provider outreach)
- Provider onboarding (creating orgs and services on behalf of providers)
- Verification review (approving provider credentials)
- User/org management (banning, status changes)
- Analytics and reporting

This app is also the foundation for a future **provider web portal** — providers managing their service menus, analytics, and scheduling from a desktop.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (mobile-friendly responsive design)
- **Auth**: Session-based (same Zercia auth as the API — `POST /api/v1/auth/signin`, Bearer token in cookies/headers)
- **Data Fetching**: Server Components for initial load, TanStack Query for client-side mutations and polling
- **Deployment**: Vercel (free tier, auto-deploys from GitHub)
- **Charts/Metrics**: Recharts or similar lightweight charting library

## Commands

```bash
npm run dev          # Start Next.js dev server (port 3001 to avoid API conflict)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1    # Backend API URL (local dev)
# Production: https://swoopt-api.onrender.com/api/v1

# Optional
NEXT_PUBLIC_APP_NAME=Swoopt Admin
```

## Architecture

### Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with auth provider + sidebar
│   ├── page.tsx                  # Dashboard home (metrics overview)
│   ├── login/                    # Login page
│   ├── requests/                 # Service request management
│   │   ├── page.tsx              # Request list with status filters
│   │   ├── [requestId]/          # Request detail view
│   │   └── support-queue/        # Exhausted/support-needed requests
│   ├── providers/                # Provider/org management
│   │   ├── page.tsx              # Org list with search/filter
│   │   ├── [orgId]/              # Org detail (services, members, ratings)
│   │   └── onboard/              # Create org on behalf of provider
│   ├── users/                    # User management
│   │   ├── page.tsx              # User list with search
│   │   └── [userId]/             # User detail (ban, view history)
│   ├── verification/             # Verification request review
│   │   └── page.tsx              # Pending verification queue
│   ├── transactions/             # Payment/payout oversight
│   │   └── page.tsx              # Transaction list with filters
│   └── analytics/                # Metrics and reporting
│       └── page.tsx              # Charts and KPIs
├── components/                   # Shared UI components
│   ├── ui/                       # Primitives (Button, Input, Table, Badge, Card)
│   ├── layout/                   # Sidebar, Header, MobileNav
│   └── data/                     # DataTable, StatusBadge, MetricCard
├── lib/                          # Utilities
│   ├── api.ts                    # API client (fetch wrapper with auth)
│   ├── auth.ts                   # Auth context, session management
│   └── utils.ts                  # Formatters, helpers
└── types/                        # TypeScript types matching API models
    ├── user.ts
    ├── organization.ts
    ├── serviceRequest.ts
    ├── offer.ts
    ├── transaction.ts
    └── rating.ts
```

### Auth Flow

1. Admin logs in via `/login` → `POST /api/v1/auth/signin` with email/password
2. Backend validates credentials, returns `{ session: { token, expiresAt } }`
3. Token stored in httpOnly cookie or secure storage
4. All API calls include `Authorization: Bearer <token>`
5. Only users with `platformAdmin: true` can access admin endpoints
6. Regular auth endpoints (`/auth/me`, `/auth/signout`) work the same

### API Client Pattern

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiClient(path: string, options?: RequestInit) {
  const token = getSessionToken(); // from cookie
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (res.status === 401) redirectToLogin();
  return res.json();
}
```

## Backend API Reference

The admin dashboard consumes the Swoopt backend API. All admin endpoints require `Authorization: Bearer <token>` from a user with `platformAdmin: true`.

### Admin Endpoints (existing, ready to use)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List/search users (paginated, `?search=`, `?limit=`, `?cursor=`) |
| GET | `/admin/users/:userId` | Get user details |
| PUT | `/admin/users/:userId/ban` | Ban/unban user (`{ banned, reason }`) |
| GET | `/admin/organizations` | List/search orgs (`?search=`, `?status=`, `?limit=`, `?cursor=`) |
| PUT | `/admin/organizations/:orgId/verify` | Set verification badges (`{ verified, insured, licensed }`) |
| GET | `/admin/service-requests` | List all requests (`?status=`, `?userId=`, `?limit=`, `?cursor=`) |
| GET | `/admin/verification-requests` | List verification requests (`?status=`) |
| PUT | `/admin/verification-requests/:requestId/review` | Approve/reject verification |

### Non-Admin Endpoints (used for provider onboarding, support actions)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create user account |
| POST | `/organizations` | Create org (as authenticated user) |
| POST | `/organizations/:orgId/services` | Add service to org |
| POST | `/organizations/:orgId/service-scan` | Scan provider website for services |
| GET | `/organizations/:orgId/service-scan/:jobId` | Check scan status |
| POST | `/organizations/:orgId/service-scan/:jobId/confirm` | Import scanned services |
| GET | `/service-requests` | List requests (`?group=active|drafts|history|pending`) |
| GET | `/service-requests/:requestId` | Get request detail |
| GET | `/service-requests/:requestId/available-offers` | Get offers for request |
| GET | `/offers/:offerId` | Get offer detail |
| GET | `/ratings/organization/:orgId` | Get org's ratings |

### Key Data Models

See `../swoopt-bun-api/src/models/` for full schemas. Key models:
- **User** — email, platformAdmin flag, banned status, rating stats
- **Organization** — name, industry, location (GeoJSON), verification, ratings, isAvailable
- **ServiceRequest** — rawText, parsedIntent, status, appointmentDetails, rankedProviders
- **Offer** — serviceRequestId, orgId, status, recommendedService, matchScore, wave
- **Transaction** — type (standard/medical_hold/legal_exempt), amounts, payoutStatus
- **Rating** — two-way blind (userToOrg, orgToUser, bothSubmitted)
- **DenialEvent** — tracks why providers/users deny offers (for analytics)

### Service Request Status Flow

```
draft → routing → offering → user_accepted → in_progress → completed → rated
                                    ↓
                              (no_show → completed with noShow flag)
```

Status groups for filtering:
- `active`: routing, offering, user_accepted, in_progress
- `history`: completed, rated, cancelled, expired, user_denied, exhausted
- `drafts`: draft
- `pending`: parsing, followup_needed

### Transaction Types

### Fee Structure

**Free tier:**
- $5 booking fee + 3% service fee per appointment
- Example: $120 massage → $5 + $3.60 = $8.60 total fees

**Swoopt+ (price TBD/mo):**
- $0 booking fee + 2% service fee
- Priority routing (placed first in wave)
- Example: $120 massage → $0 + $2.40 = $2.40 total fees

**Design principle:** There is never a way to pay nothing to Swoopt. Fee tiers are config-driven (adjustable without code changes). Launch promo: first X weeks of Swoopt+ free for new signups.

### Transaction Types

| Type | Customer Pays | Provider Gets | No-Show |
|------|--------------|---------------|---------|
| Standard | Booking fee + service % + service price | Service price (after completion) | Service price to provider, fees to Swoopt |
| Medical Hold | Booking fee + service % + $25 hold | Bills via insurance | $25 to provider, fees to Swoopt |
| Legal Exempt | Booking fee + service % only | Bills client directly | Fees to Swoopt |

Payout flow: `held → claimable → processing → completed`

### Credits & Waivers (Admin Tools)
- **User credits**: Admin can issue `creditBalanceCents` to a user's account. Credits auto-apply to the next booking fee.
- **Service fee waiver**: Admin can flag a specific transaction as fee-waived (customer pays service price only, no Swoopt fees).
- **Promo codes**: Future — generate codes that grant X weeks of Swoopt+ or Y dollars in credits.

These tools appear in the admin dashboard under user detail and transaction management.

## Implementation Phases

### Phase 1: Foundation (MVP)
**Goal**: Login, dashboard metrics, request oversight

1. **Project setup** — Next.js 15, Tailwind, TypeScript, API client
2. **Auth** — Login page, session management, admin-only middleware
3. **Dashboard home** — KPI cards: total requests (by status), total users, total orgs, active offers
4. **Request list** — Filterable by status/group, paginated, click-through to detail
5. **Request detail** — Full request info, offers, matched providers, transaction status

### Phase 2: Support Tools
**Goal**: Handle exhausted requests, manual provider outreach, customer goodwill

6. **Support queue** — Filtered view of `exhausted` and `support_needed` requests
7. **Request detail actions** — Re-route request, manually create offer for a specific provider
8. **Provider search** — Find providers by industry/location to manually match
9. **Credits & waivers** — Issue credits to user accounts, waive fees on specific transactions, manage promo eligibility

### Phase 3: Provider Management
**Goal**: Onboard providers, manage orgs

9. **Provider onboarding flow** — Create user account → create org → scan website for services → review and import
10. **Org detail page** — Edit org info, manage services (add/edit/deactivate), view members
11. **Verification queue** — Review pending verification requests, approve/reject

### Phase 4: User Management & Analytics
**Goal**: User oversight, platform health metrics

12. **User list & detail** — Search, view history, ban/unban
13. **Analytics dashboard** — Request volume over time, offer acceptance rates, average match score, denial reason breakdown, revenue tracking (transactions)
14. **Provider analytics** — Per-org metrics: response time, acceptance rate, rating trends

### Phase 5: Provider Web Portal (Future)
**Goal**: Let providers manage their business from desktop

15. **Provider login** — Non-admin auth, org-scoped views
16. **Service menu management** — Add/edit/delete services, scan website
17. **Incoming offers** — View and respond to offers
18. **Analytics** — Earnings, ratings, request history

## Cross-Repo Workflow

### When the admin dashboard needs a new API endpoint:
Create a GitHub issue on `crcnum4/swoopt_bun_api` with:
- Label: `enhancement`
- Title describing the endpoint needed
- Body with method, path, request/response shape, and why

### When the API adds/changes endpoints the dashboard consumes:
A GitHub issue should be created on `crcnum4/swoopt_admin` (this repo) with the updated contract.

### Reading sibling projects:
- Backend API code: `../swoopt-bun-api/src/` — models, routes, services
- Mobile app: `../swoopt-expo/src/` — for UI pattern reference
- Parent CLAUDE.md: `../CLAUDE.md` — complete business context

## Design Guidelines

- **Swoopt brand** — Use the Swoopt color palette and logo from the mobile app (`../swoopt-expo/src/constants/theme.ts`). The Peach Mist (`#FDE8DA`) background is used on auth screens. Logo: `TransMain.png` + styled "Swoopt" text.
- **Mobile-first responsive** — Business partner primarily uses phone. Dashboard must work well on mobile browsers.
- **Minimal UI** — Use Tailwind utility classes. No heavy component libraries. shadcn/ui components are acceptable if needed.
- **Data tables** — Primary interaction pattern. Sortable, filterable, paginated. Click row to drill down.
- **Status badges** — Color-coded by status group (active=blue, history=gray, exhausted=red, draft=yellow)
- **Real-time optional** — SSE connection for live request counts is nice-to-have but not required. Polling every 30s is fine for admin.
- **Dark mode** — Not required for MVP. Can add later.

## Key Technical Decisions

1. **Next.js App Router** — Server Components for data-heavy pages, reduces client JS bundle
2. **Vercel deployment** — Free tier, auto-deploys, edge network
3. **Same auth system** — No separate admin auth. Uses existing Zercia sessions with `platformAdmin` check
4. **API-first** — No direct database access. All data flows through the backend API
5. **Separate repo** — Different release cycle from mobile app. Admin fixes ship without app store review.

## Repositories

- **Admin Dashboard**: `https://github.com/crcnum4/swoopt_admin` (`swoopt-admin/`)
- **Backend API**: `https://github.com/crcnum4/swoopt_bun_api` (`swoopt-bun-api/`)
- **Mobile App**: `https://github.com/crcnum4/swoopt_expo` (`swoopt-expo/`)
