# Swoopt Admin Dashboard — MVP Implementation Plan

**Version:** 1.1
**Date:** 2026-04-08
**Status:** Approved — Issues filed on GitHub

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture & Technical Decisions](#architecture--technical-decisions)
3. [Backend Dependencies (GitHub Issues)](#backend-dependencies)
4. [Phase 1: Foundation & Project Setup](#phase-1-foundation--project-setup)
5. [Phase 2: Request Management & Support Queue](#phase-2-request-management--support-queue)
6. [Phase 3: Provider Onboarding & Management](#phase-3-provider-onboarding--management)
7. [Phase 4: User Management & Analytics](#phase-4-user-management--analytics)
8. [Testing Strategy](#testing-strategy)
9. [Dependency Graph](#dependency-graph)
10. [Appendix: API Contract Reference](#appendix-api-contract-reference)

---

## Executive Summary

The Swoopt Admin Dashboard is a Next.js web application for Swoopt's internal operations team. It provides platform oversight, provider management, support tools, and analytics for the Swoopt marketplace.

### The #1 Priority: Manual Provider Outreach

Swoopt is a startup. The automated matching engine will fail when provider supply is thin. When a service request exhausts all matched providers, the Swoopt team manually finds and registers providers — **"do things that don't scale."** The support queue and provider onboarding wizard are the most critical features for launch.

**The support queue is also a growth engine.** An exhausted request isn't just a support ticket — it's an acquisition opportunity. When no Swoopt provider matches, the operator searches Google for local providers offering that service, cold-calls them, and pitches: "We have a customer who needs [service] today. Can you take the appointment? We'll set you up on Swoopt for free and send it over." This converts a failed match into:
- A retained customer who gets their appointment
- A new provider who joins the platform with an immediate first booking
- A potential new Swoopt customer (offer the provider credits to try the app themselves)

The support queue, external provider search, and onboarding wizard are tightly coupled — the operator needs to flow seamlessly from "request needs help" → "find a provider (Swoopt or Google)" → "onboard if new" → "send the offer."

### Plan Scope

This plan covers **Phases 1–4** (Foundation through Analytics). Phase 5 (Provider Web Portal) is deferred until post-launch user feedback informs the design.

### Phase Summary

| Phase | Name | Goal | Issues |
|-------|------|------|--------|
| 1 | Foundation | Auth, layout, API client, types, dashboard home | 1.1–1.6 |
| 2 | Request Management & Support Queue | View requests, handle exhausted requests, manual provider matching | 2.1–2.5 |
| 3 | Provider Onboarding & Management | Onboard providers via admin, manage orgs, verification queue | 3.1–3.4 |
| 4 | User Management & Analytics | User oversight, transactions, charts, credits/waivers | 4.1–4.5 |

### Backend Dependencies

**9 GitHub issues** must be filed on `crcnum4/swoopt_bun_api` for new admin endpoints. Phases 1 and parts of Phase 3 (org list, verification queue) can proceed without backend changes. The support queue UI (Phase 2) can be built in parallel with backend work, with "Send Offer" and "Re-Route" wired up once endpoints ship.

---

## Architecture & Technical Decisions

### Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 15 (App Router) | Server Components for data-heavy pages, reduces client JS |
| Language | TypeScript | Type safety matching backend models |
| Styling | Tailwind CSS | Lightweight, mobile-first responsive, matches Swoopt brand |
| Auth | Session-based (Zercia) | Same auth as API — `POST /auth/signin`, Bearer token |
| Data Fetching | TanStack Query v5 | Client-side caching, polling, mutation management |
| Charts | Recharts | Lightweight, React-native, composable |
| Testing | Vitest | Unit/integration tests, mirrors backend approach |
| Deployment | Vercel or Render | Auto-deploy from GitHub |
| Dev Port | 3001 | Avoids conflict with backend API on 3000 |

### Design System (Matching Mobile App)

| Token | Value | Usage |
|-------|-------|-------|
| Midnight Indigo | `#4B3F72` | Primary text, sidebar, headers |
| Peach Mist | `#FEF0E8` | Auth screen backgrounds |
| Sky Mint | `#6FFFE9` | Success states, CTAs, active indicators |
| Vibrant Coral | `#FF6B6B` | Errors, exhausted badges, destructive actions |
| Vibrant Coral Accessible | `#C44949` | WCAG AA compliant variant (4.78:1 on white) |
| Deep Coral Accessible | `#C04040` | Destructive buttons (5.19:1 on white) |
| Warm Gray | `#E0E0E0` | Borders, disabled states |
| Warning Amber | `#FFB347` | Warning states, pending badges |

**Typography:** System font stack (no custom fonts for admin — SpaceMono from mobile app is optional).

**Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px (matching mobile app).

**Border radii:** 4 / 8 / 12 / 16 / 9999 px.

### Key Architectural Decisions

1. **Admin-privileged endpoints for provider onboarding** — Admin acts under their own session. No temp passwords, no logging in as providers. Every admin action is audit-logged. Requires new backend endpoints (Issue #6).

2. **API-first, no direct DB access** — All data flows through the backend API. Admin dashboard is a pure consumer.

3. **Cross-repo workflow via GitHub issues** — When the admin dashboard needs a new endpoint, we file an issue on `crcnum4/swoopt_bun_api` with the full contract. Backend team comments with implementation details. Dashboard references the issue number for blocking.

4. **Mobile-first responsive** — The business partner primarily uses their phone. Dashboard must wor as best as possible on mobile browsers within reasonable expectations for graphs and etc.

5. **Fallback-first development** — When a backend endpoint is blocked, we build the UI with a degraded state (disabled buttons, "Coming Soon" sections, less-efficient data fetching) and wire up the full experience when the endpoint ships.

### API Client Pattern

```typescript
// lib/api.ts — fetch wrapper with auth
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiClient<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = getSessionToken(); // from httpOnly cookie
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

### API Response Envelope

All backend responses follow this shape:

```typescript
// Success
{ success: true, data: T, meta?: { cursor: string, hasMore: boolean } }

// Error
{ success: false, error: { code: string, message: string, details?: object }, requestId?: string }
```

---

## Backend Dependencies

The following GitHub issues must be filed on `crcnum4/swoopt_bun_api`. Each issue includes the full endpoint contract. The backend team should comment on issues with implementation details so the admin team can wire up correctly.

### Issue Summary

| # | Title | Blocks Phase | Priority |
|---|-------|-------------|----------|
| crcnum4/swoopt_bun_api#115 | `GET /admin/dashboard/stats` — aggregate platform metrics | Phase 1 (1.6) | High |
| crcnum4/swoopt_bun_api#116 | `GET /admin/service-requests/:requestId` — full detail with rankedProviders | Phase 2 (2.2) | High |
| crcnum4/swoopt_bun_api#117 | `GET /admin/providers/search` — geo + industry provider lookup | Phase 2 (2.4) | **Critical** |
| crcnum4/swoopt_bun_api#118 | `POST /admin/service-requests/:requestId/manual-offer` | Phase 2 (2.4) | **Critical** |
| crcnum4/swoopt_bun_api#119 | `POST /admin/service-requests/:requestId/re-route` | Phase 2 (2.5) | High |
| crcnum4/swoopt_bun_api#120 | Admin provider onboarding endpoints (create user, force-verify, create org, force-password-reset) | Phase 3 (3.1) | High |
| crcnum4/swoopt_bun_api#121 | `POST /admin/users/:userId/credits` + `PUT /admin/transactions/:txId/waive-fees` | Phase 2/4 (4.5) | Medium |
| crcnum4/swoopt_bun_api#122 | `GET /admin/transactions` — transaction list with filters | Phase 4 (4.3) | Medium |
| crcnum4/swoopt_bun_api#123 | Admin audit log model and `GET /admin/audit-log` | Cross-cutting | Medium |

### crcnum4/swoopt_bun_api#115: Dashboard Aggregate Stats Endpoint

**Endpoint:** `GET /admin/dashboard/stats`
**Auth:** Bearer token, `platformAdmin: true`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": { "total": 1420, "banned": 3, "platformAdmins": 5 },
    "organizations": { "total": 87, "verified": 42, "available": 31 },
    "serviceRequests": {
      "total": 3200,
      "byStatus": {
        "draft": 12, "routing": 5, "offering": 8, "user_accepted": 3,
        "in_progress": 2, "completed": 2800, "rated": 200, "cancelled": 50,
        "expired": 30, "user_denied": 15, "exhausted": 12,
        "parsing": 1, "followup_needed": 2
      }
    },
    "offers": { "active": 16, "totalToday": 45 },
    "transactions": { "totalRevenueCents": 482000, "pendingPayoutCents": 12500 }
  }
}
```

**Why:** Dashboard home needs KPI cards. Without this, we make 5+ paginated list calls to derive counts — inefficient and can't provide metrics like "completed today" or revenue.

**Fallback:** Ship dashboard with parallel list-endpoint approach. Swap to stats endpoint when delivered.

---

### crcnum4/swoopt_bun_api#116: Admin Service Request Detail with Ranked Providers

**Endpoint:** `GET /admin/service-requests/:requestId`
**Auth:** Bearer token, `platformAdmin: true`

Returns the full service request including:
- `rankedProviders[]` with org names, match scores, distance, wave number, offer status, denial reasons
- All associated `offers[]` with full provider info (not anonymized)
- Linked `transaction` with payout status
- Basic `user` info (email, rating stats)

**Why:** Admin needs to see which providers were matched, who denied and why, and the full routing history. This data is intentionally anonymized for regular users but critical for admin support workflows.

---

### crcnum4/swoopt_bun_api#117: Provider Search by Industry + Location (CRITICAL)

**Endpoint:** `GET /admin/providers/search`
**Auth:** Bearer token, `platformAdmin: true`

**Query Params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `industryId` | string | Yes | Industry to match |
| `lat` | number | Yes | Latitude of search center |
| `lng` | number | Yes | Longitude of search center |
| `radiusMiles` | number | No | Search radius (default: 15) |
| `minRating` | number | No | Minimum average rating (0-5) |
| `isAvailable` | boolean | No | Filter by current availability |
| `isVerified` | boolean | No | Filter by verified status |
| `excludeOrgIds` | string | No | Comma-separated org IDs to exclude |
| `limit` | number | No | Default: 20 |
| `cursor` | string | No | Pagination cursor |

**Response:** List of orgs with: name, distance, rating, verification flags, isAvailable, serviceCount.

**Why:** When a request exhausts, admin needs to find alternative providers nearby. The internal matching service has geo-near capability but no admin API exposes it. This is the **most critical backend dependency** for the support workflow.

---

### crcnum4/swoopt_bun_api#118: Manual Offer Creation (CRITICAL)

**Endpoint:** `POST /admin/service-requests/:requestId/manual-offer`
**Auth:** Bearer token, `platformAdmin: true`

**Request Body:**
```json
{
  "orgId": "ObjectId — target organization",
  "serviceItemId": "ObjectId (optional) — specific service",
  "priceCents": 12000,
  "startTime": "2026-04-08T14:00:00Z",
  "note": "Admin-created offer — provider contacted by phone"
}
```

**Model changes:** Add `isManualOffer: Boolean` and `createdByAdmin: String (ref: User)` to Offer model.

**Behavior:**
- Creates an Offer document and notifies the provider
- Works even if the org wasn't in the original `rankedProviders`
- Updates request status from `exhausted` to `offering`
- Logs admin action for audit trail

---

### crcnum4/swoopt_bun_api#119: Re-Route Exhausted Service Request

**Endpoint:** `POST /admin/service-requests/:requestId/re-route`
**Auth:** Bearer token, `platformAdmin: true`

**Request Body:**
```json
{
  "clearExclusions": false,
  "expandRadiusMiles": null,
  "note": "Re-routing after provider confirmed availability"
}
```

**Behavior:**
- Resets status to `routing`
- If `clearExclusions: true`, clears `excludeOrgIds`
- If `expandRadiusMiles` provided, overrides distance preference
- Calls `routeServiceRequest()` to trigger matching engine
- Logs admin action

---

### crcnum4/swoopt_bun_api#120: Admin Provider Onboarding Endpoints

Four endpoints for phone-based provider onboarding:

**1. `POST /admin/users`** — Create user on behalf of provider
```json
{
  "email": "provider@example.com",
  "phone": "+15551234567",
  "temporaryPassword": "Swoopt2026!",
  "forceVerifyEmail": true,
  "note": "Onboarded via phone call"
}
```
- Auto-sets `requirePasswordReset: true`
- If `forceVerifyEmail: true`, sets `emailVerifiedAt` immediately
- Logs `createdByAdmin`

**2. `PUT /admin/users/:userId/force-verify-email`** — Force email verification
```json
{ "reason": "Verified identity over phone during onboarding" }
```

**3. `PUT /admin/users/:userId/force-password-reset`** — Flag for password change on next login
```json
{ "reason": "Account created by admin during onboarding" }
```

**4. `POST /admin/organizations`** — Create org on behalf of user
```json
{
  "userId": "ObjectId — the provider user to assign as OWNER",
  "name": "Downtown Wellness Spa",
  "industryId": "ObjectId",
  "phone": "+15559876543",
  "address": { "street": "...", "city": "...", "state": "...", "zip": "..." },
  "location": { "type": "Point", "coordinates": [-73.98, 40.69] },
  "note": "Created during phone onboarding"
}
```
- Creates org AND OrgMembership with OWNER role for specified user
- Admin is NOT added as a member

**Model changes:**
- User: add `requirePasswordReset: Boolean`, `createdByAdmin: String`
- Organization: add `createdByAdmin: String`

---

### crcnum4/swoopt_bun_api#121: Credits and Fee Waiver Endpoints

**1. `POST /admin/users/:userId/credits`**
```json
{ "amountCents": 500, "reason": "Compensation for delayed match" }
```
Increments `User.creditBalanceCents`. Returns new balance.

**2. `PUT /admin/transactions/:transactionId/waive-fees`**
```json
{ "reason": "Service quality issue" }
```
Sets `feeWaived: true` on transaction. Records original fee amounts waived.

---

### crcnum4/swoopt_bun_api#122: Admin Transaction List

**Endpoint:** `GET /admin/transactions`
**Query Params:** userId, orgId, status, payoutStatus, type, dateFrom, dateTo, limit, cursor

Returns transactions with populated user email and org name. Includes `summary` object with aggregate totals for the current filter set.

---

### crcnum4/swoopt_bun_api#123: Admin Audit Log

**New model:** `AdminAuditLog` — { adminId, action, targetType, targetId, metadata, note, createdAt }

**Endpoint:** `GET /admin/audit-log`
**Query Params:** adminId, action, targetType, targetId, dateFrom, dateTo, limit, cursor

All admin mutation endpoints (existing and new) should call a shared `logAdminAction()` utility.

---

## Phase 1: Foundation & Project Setup

**Goal:** Auth, layout shell, API client, type system, dashboard home.
**Backend dependencies:** crcnum4/swoopt_bun_api#115 (dashboard stats — has fallback)
**Testable milestone:** Admin can log in, see the dashboard with metrics, and navigate to all sections.

---

### 1.1 Project Configuration & Tooling

**Delivers:** Fully configured Next.js project with Swoopt brand theming, test infrastructure, and developer tooling.

**Details:**
- Extend Tailwind config with Swoopt brand color tokens
- Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1`
- Create `.env.example` committed to repo
- Install and configure Vitest with React plugin
- Verify path aliases resolve correctly

**Acceptance Criteria:**
- `npm run dev` starts on port 3001 without errors
- `npm run lint` passes with zero warnings
- `npm run test` runs Vitest and exits cleanly
- `bg-midnight-indigo` and `text-vibrant-coral` produce correct colors

**Complexity:** S

---

### 1.2 TypeScript Type Definitions

**Delivers:** Shared type system mirroring backend models, giving every page type-safe API data from day one.

**Details:**
- `types/user.ts` — User, with platformAdmin, banned, creditBalanceCents, ratingStats
- `types/organization.ts` — Organization, with GeoJSON location, verification flags, payout config
- `types/service-request.ts` — ServiceRequest with status enum (13 values), parsedIntent, rankedProviders, appointmentDetails
- `types/offer.ts` — Offer with status enum (10 values), recommendedService, matchScore, denial info
- `types/transaction.ts` — Transaction with type enum (3 values), amounts, payoutStatus enum
- `types/rating.ts` — Rating with two-way blind structure
- `types/service-item.ts` — ServiceItem with pricing in cents
- `types/verification-request.ts` — VerificationRequest with review status
- `types/denial-event.ts` — DenialEvent with reason categorization
- `types/industry.ts` — Industry with specialRules
- `types/api.ts` — `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`

**Acceptance Criteria:**
- All type files compile with `tsc --noEmit` zero errors
- Enums cover every status value from backend models
- No `any` types

**Complexity:** M

---

### 1.3 API Client & Auth System

**Delivers:** Single API client with auth, error handling, 401 redirects. Login and logout work end-to-end. All routes except `/login` are protected.

**API Endpoints:**
- `POST /auth/signin` — login
- `GET /auth/me` — validate session
- `POST /auth/signout` — logout

**Details:**
- `lib/api.ts` — fetch wrapper with Bearer token injection, typed responses, 401 redirect
- `lib/auth.ts` — AuthProvider context (user, isLoading, login, logout)
- `middleware.ts` — Next.js edge middleware protecting all routes except `/login`
- `app/api/auth/set-session/route.ts` — API route to set httpOnly cookie
- TanStack Query setup with `QueryClientProvider` in root layout

**Acceptance Criteria:**
- Unauthenticated visit to `/` redirects to `/login`
- Successful login stores httpOnly cookie and redirects to `/`
- `api.get('/admin/users')` includes Bearer token
- 401 from any endpoint clears session and redirects without infinite loop

**Complexity:** L

---

### 1.4 Layout Shell

**Delivers:** Persistent sidebar, header, and mobile navigation. Users can navigate between all sections.

**Details:**
- `components/layout/sidebar.tsx` — Fixed left sidebar (256px desktop, collapsible to 64px tablet, hidden mobile)
  - Swoopt logo, nav links with icons, active route highlighting (Sky Mint border)
  - Support Queue link with count badge (wired in Phase 2)
- `components/layout/header.tsx` — Top bar with page title, user email, logout
- `components/layout/mobile-nav.tsx` — Bottom tab bar on mobile (<768px)
- `app/(dashboard)/layout.tsx` — Route group wrapping authenticated pages with sidebar + header

**Navigation Items:** Dashboard, Requests, Support Queue, Providers, Users, Verification, Transactions, Analytics

**Acceptance Criteria:**
- Desktop (1024px+): sidebar visible, content fills remaining width
- Tablet (768-1023px): sidebar collapsible to icons
- Mobile (<768px): bottom nav visible, hamburger opens drawer
- Active nav item visually distinct

**Complexity:** M

---

### 1.5 Login Page

**Delivers:** Branded login screen with Peach Mist background, Swoopt logo, email/password form.

**Details:**
- Full-screen centered card on `#FEF0E8` background
- Error states: invalid credentials, network error, non-admin user ("Access restricted to platform administrators")
- Non-admin check: after successful auth, verify `user.platformAdmin === true`; if false, sign out and show error

**Acceptance Criteria:**
- Valid admin credentials → logged in within 2 seconds
- Invalid credentials → inline error, form remains filled
- Non-platformAdmin user → "Access restricted" message, session cleared
- Responsive, matches Swoopt auth screen style

**Complexity:** M

---

### 1.6 Dashboard Home

**Delivers:** Metrics overview page with KPI cards showing platform health. Exhausted requests highlighted prominently.

**API Endpoints:** `GET /admin/dashboard/stats` (crcnum4/swoopt_bun_api#115), with fallback to parallel list-endpoint calls.

**KPI Cards:**
- Total Users — neutral
- Total Organizations — neutral
- Active Requests — Sky Mint accent
- **Exhausted Requests — Vibrant Coral accent, bold, links to Support Queue**
- Pending Verifications — Amber accent, links to Verification page

**Details:**
- Responsive grid: 2 cols mobile, 3 cols tablet, 5 cols desktop
- Auto-refresh every 30s via TanStack Query `refetchInterval`
- Loading: skeleton cards. Error: retry button per card.

**Acceptance Criteria:**
- All 5 metric cards load within 3 seconds
- Exhausted Requests card is visually prominent and links to Support Queue
- Metrics auto-refresh every 30 seconds
- Loading and error states render correctly

**Complexity:** M

---

### Phase 1 Testable Milestone

> Admin can open the app, see a login screen, sign in with valid admin credentials, land on a dashboard showing 5 KPI cards, and navigate to any section via sidebar (desktop) or bottom nav (mobile). Non-admin users are rejected. Session persists across page refreshes.

---

## Phase 2: Request Management & Support Queue

**Goal:** View and manage service requests. Handle exhausted requests with manual provider matching. **This is the most critical phase for launch operations.**

**Backend dependencies:** crcnum4/swoopt_bun_api#116, crcnum4/swoopt_bun_api#117 (critical), crcnum4/swoopt_bun_api#118 (critical), crcnum4/swoopt_bun_api#119
**Testable milestone:** Operator can find an exhausted request, search for nearby providers, and send a manual offer.

---

### 2.1 Request List Page

**Delivers:** Paginated, filterable table of all service requests. Operators can find any request by status or user.

**API:** `GET /admin/service-requests?status=&limit=&cursor=`

**Columns:** ID (truncated), User (email), Service (parsed intent), Status (color-coded badge), Created (relative time), Distance

**Filters:**
- Status group dropdown: All, Active, History, Drafts, Pending, Exhausted
- Text search (debounced 300ms)
- Cursor-based "Load More" pagination

**Acceptance Criteria:**
- Table renders 20 requests with correct status badge colors
- Changing filter reloads data and resets cursor
- "Load More" appends next page
- Row click navigates to `/requests/[requestId]`

**Complexity:** M

---

### 2.2 Request Detail Page

**Delivers:** Comprehensive view of a single request — parsed intent, matched providers, offers, transaction — giving operators full context for support decisions.

**API:** `GET /admin/service-requests/:id` (crcnum4/swoopt_bun_api#116 for full detail), offer and transaction endpoints

**Sections:**
- **Header:** Status badge, request ID, created date, user email
- **Request Info:** Raw text, parsed intent, time window, location, distance
- **Offers:** Table of all offers with provider name, match score, wave, status, denial reason
- **Transaction:** Type, amount breakdown, payout status
- **Actions:** "Re-Route" and "Find Provider" buttons (wired in 2.4/2.5)

**Blocking:** crcnum4/swoopt_bun_api#116 for full `rankedProviders` data. Fallback: display available data from existing endpoint.

**Acceptance Criteria:**
- Page renders all available fields within 2 seconds
- Offers table shows all offers with status badges
- Action button area visually prominent on `exhausted` requests
- Graceful handling of missing data

**Complexity:** L

---

### 2.3 Support Queue

**Delivers:** Dedicated view of exhausted requests needing manual intervention. **The most important page for launch.**

**API:** `GET /admin/service-requests?status=exhausted&limit=20&cursor=`

**Columns:** ID, User, Service, Location, Age (color-escalating: green <1h, yellow 1-4h, red >4h), Attempts (wave count)

**Details:**
- Sorted oldest first (most urgent at top)
- Quick actions per row: "Find Provider", "View"
- Sidebar badge: Vibrant Coral count of exhausted requests, polls every 30s
- Auto-refresh every 15 seconds
- Empty state: "No exhausted requests — all caught up!" with green checkmark

**Acceptance Criteria:**
- Shows only exhausted requests, sorted oldest first
- Age column escalates urgency with color
- Sidebar badge shows count and updates without page reload
- "Find Provider" passes request context to manual match flow

**Complexity:** M

---

### 2.4 Manual Provider Matching Flow

**Delivers:** A unified workflow for finding providers — both within Swoopt and externally via Google — and converting exhausted requests into appointments. **This is both the core support tool and the primary provider acquisition channel at launch.**

**API:** `GET /admin/providers/search` (crcnum4/swoopt_bun_api#117), `POST /admin/service-requests/:id/manual-offer` (crcnum4/swoopt_bun_api#118)

**The Two-Track Search:**

The operator works an exhausted request through two parallel tracks:

**Track A — Swoopt Provider Search (internal)**
Search Swoopt's existing provider database by industry + location. If a match is found, send a manual offer directly.

**Track B — External Provider Search (Google)**
When no Swoopt provider fits (or to supplement), the operator searches Google for local businesses offering the service. This is the growth engine: call the business, pitch the appointment, and onboard them into Swoopt on the spot.

**Combined Flow:**
1. Operator clicks "Find Provider" on an exhausted request
2. Provider search page shows **request context** at top (service type, location, time window, customer distance preference)
3. **Tab 1 — Swoopt Providers:**
   - Search controls: industry dropdown (pre-selected), radius slider, text search
   - Results table: org name, distance, rating, verification badges, available status, services
   - "Send Offer" button per result → confirmation dialog → creates manual offer
4. **Tab 2 — External Search (Google):**
   - Pre-populated Google search link/embed: `[service type] near [request location]`
   - Operator finds businesses, calls them, pitches the appointment
   - "Onboard & Send Offer" button → launches the **onboarding wizard (3.1)** pre-filled with the request context
   - After onboarding completes, wizard flows directly into creating the manual offer for the original request
   - Optional: "Issue Welcome Credit" checkbox to give the new provider credits to try Swoopt as a customer themselves
5. **Request tracking:** The request detail page shows which track resolved it (internal match vs. new provider acquisition) for analytics

**The pitch script (reference for operators, not in-app):**
> "Hi, I'm [name] from Swoopt. We have a customer looking for [service] today near your location. Do you have availability? We'd love to set you up on our platform — it's free, takes about 5 minutes, and we'll send this appointment right over. We'll also give you some credits to try Swoopt yourself."

**Blocking:** crcnum4/swoopt_bun_api#117 and crcnum4/swoopt_bun_api#118 (critical for Track A). Track B's Google search is unblocked — it's a link/iframe. The "Onboard & Send Offer" flow depends on crcnum4/swoopt_bun_api#120 (onboarding endpoints) and crcnum4/swoopt_bun_api#118 (manual offer). **Fallback:** Build both tabs. Track A shows existing org search before crcnum4/swoopt_bun_api#117 ships. Track B's Google search works immediately; the "Onboard & Send Offer" button links to the onboarding wizard (3.1) with a note to manually send the offer after.

**Acceptance Criteria:**
- Two-tab interface: Swoopt Providers + External Search
- Swoopt tab searches by industry and radius from request location
- External tab pre-populates a Google search for the service + location
- "Send Offer" (Track A) creates offer and transitions request out of `exhausted`
- "Onboard & Send Offer" (Track B) launches onboarding wizard with request context pre-filled, then creates the offer for the newly onboarded provider
- Request tracks which resolution path was used (internal vs. acquisition)
- Fallback mode works before all backend endpoints ship

**Complexity:** L

---

### 2.5 Re-Route Action

**Delivers:** One-click action to re-enter an exhausted request into automated matching.

**API:** `POST /admin/service-requests/:id/re-route` (crcnum4/swoopt_bun_api#119)

**Details:**
- Button on request detail page and support queue quick actions
- Confirmation dialog with two options:
  - "Re-route (skip previous providers)" — keeps exclusion list
  - "Re-route (fresh start)" — clears exclusions
- Success: toast, request transitions to `routing`

**Blocking:** crcnum4/swoopt_bun_api#119.

**Acceptance Criteria:**
- Button visible only on `exhausted` requests
- Dialog clearly explains the two options
- Successful re-route transitions to `routing` and UI reflects immediately
- Button disabled during API call

**Complexity:** S

---

### Phase 2 Testable Milestone

> **Scenario A (existing provider):** Operator opens the Support Queue, sees exhausted requests sorted by urgency. They click "Find Provider," switch to the Swoopt Providers tab, search for massage therapists within 10 miles, find one with good ratings, and click "Send Offer." The request transitions to `offering` and disappears from the support queue.
>
> **Scenario B (new provider — the growth play):** No Swoopt providers match. Operator switches to the External Search tab, sees Google results for "massage therapist near [location]." They call a business, pitch the appointment, and click "Onboard & Send Offer." The onboarding wizard opens pre-filled with the request context. After creating the provider's account, org, and services, the wizard flows into sending the manual offer. The request is fulfilled, Swoopt gains a new provider, and the operator optionally issues welcome credits so the provider can try Swoopt as a customer too.

---

## Phase 3: Provider Onboarding & Management

**Goal:** Onboard providers from the admin panel over the phone. Manage organizations and verification.

**Backend dependencies:** crcnum4/swoopt_bun_api#120 (onboarding endpoints)
**Testable milestone:** Admin can onboard a provider end-to-end — creating their account, org, and services — in a single wizard flow.

---

### 3.1 Provider Onboarding Wizard

**Delivers:** Multi-step form wizard for onboarding providers over the phone. Creates account, org, location, services, and activates — all from the admin panel.

**API Endpoints:**
- `POST /admin/users` (crcnum4/swoopt_bun_api#120) — create user
- `PUT /admin/users/:userId/force-verify-email` (crcnum4/swoopt_bun_api#120) — bypass email verification
- `POST /admin/organizations` (crcnum4/swoopt_bun_api#120) — create org for user
- `PUT /organizations/:orgId/location` — set address + coordinates
- `POST /organizations/:orgId/service-scan` — AI website scan
- `GET /organizations/:orgId/service-scan/:jobId` — poll scan status
- `POST /organizations/:orgId/service-scan/:jobId/confirm` — import services
- `POST /organizations/:orgId/services` — manually add services
- `PUT /organizations/:orgId/availability` — toggle available
- `PUT /admin/users/:userId/force-password-reset` (crcnum4/swoopt_bun_api#120) — flag for password change

**Steps:**

| Step | Title | Description |
|------|-------|-------------|
| 1 | Create User Account | Email, phone. Option to force-verify email. |
| 2 | Create Organization | Name, description, phone, industry dropdown. |
| 3 | Set Location | Address form. Geocode to lat/lng before submit. |
| 4 | Add Services | **Option A:** Scan website URL (AI extraction) → review → import selected. **Option B:** Manually add services (name, price, duration). Both available. |
| 5 | Review & Activate | Summary of everything created. Toggle org to available. Set force-password-reset. |

**Key requirements:**
- Wizard state persisted to `localStorage` — admin can resume if call drops
- Each step independently submits to API (not all-or-nothing)
- Back navigation without losing data
- **Support Queue integration:** When launched from the "Onboard & Send Offer" button in the manual matching flow (2.4), the wizard receives the `serviceRequestId` as context. After Step 5 (Review & Activate), the wizard adds a **Step 6: Send Offer** that pre-fills a manual offer to the newly created org for the original request. This creates a seamless flow: find provider on Google → onboard → deliver the appointment.
- **Welcome credits:** Optional checkbox on the review step to issue credits to the new provider's account (e.g., $10 credit) so they can try Swoopt as a customer. This is a low-cost acquisition incentive.

**Blocking:** crcnum4/swoopt_bun_api#120. Step 6 (Send Offer) also requires crcnum4/swoopt_bun_api#118. Welcome credits require crcnum4/swoopt_bun_api#121.

**Acceptance Criteria:**
- Admin completes all 5 steps producing a live, available org with services
- Wizard survives page refresh and resumes from last completed step
- Website scan shows extracted services with checkboxes
- Force-password-reset flag is set on the provider account
- When launched from support queue (2.4), wizard flows into sending the manual offer after activation
- Welcome credits checkbox issues credits to the new provider's account

**Complexity:** L

---

### 3.2 Organization List Page

**Delivers:** Paginated, searchable, filterable table of all organizations.

**API:** `GET /admin/organizations?search=&status=&limit=&cursor=` (existing)

**Columns:** Name, Industry, Status, Verification (3 icon badges), Rating, Service Count, Available (dot indicator)

**Filters:** Status dropdown, text search by name

**Acceptance Criteria:**
- Table loads with cursor-based pagination
- Search and status filter work correctly
- Row click navigates to `/providers/[orgId]`

**Complexity:** M

---

### 3.3 Organization Detail Page

**Delivers:** Comprehensive detail view for a single org — info, verification badges, services, members, ratings.

**API:** Org detail, `PUT /admin/organizations/:orgId/verify`, service endpoints, `GET /ratings/organization/:orgId`

**Sections:**
- **Org Info** — name, industry, contact, location, description
- **Verification Badges** — three toggles (verified, insured, licensed)
- **Services** — table with add/edit/deactivate actions
- **Members** — table (read-only for MVP)
- **Rating Summary** — average + count

**Acceptance Criteria:**
- All sections render with API data
- Verification badge toggles work independently
- Admin can add a service via inline form
- Availability toggle updates `isAvailable`

**Complexity:** L

---

### 3.4 Verification Queue

**Delivers:** Pending verification request review page with approve/reject actions.

**API:** `GET /admin/verification-requests?status=pending` (existing), `PUT /admin/verification-requests/:id/review` (existing)

**Columns:** Org Name, Type (verified/insured/licensed), Submitted By, Date, Actions (Approve/Reject)

**Flow:** Expand request → review credentials → Approve or Reject with required notes

**Acceptance Criteria:**
- Page shows pending requests by default
- Approve sets org's verification badge
- Reject requires notes
- History filter shows approved/rejected requests

**Complexity:** S

---

### Phase 3 Testable Milestone

> Admin receives a call from a provider. Using the onboarding wizard, they create the provider's account (force-verifying email), create the org, enter the address, scan the provider's website for services, import 5 services, and toggle the org to available. The provider now appears in the org list and can receive offers. The provider's first login forces a password change.

---

## Phase 4: User Management & Analytics

**Goal:** User oversight, transaction visibility, platform health metrics, and traction tracking.

**Backend dependencies:** crcnum4/swoopt_bun_api#121 (credits/waivers), crcnum4/swoopt_bun_api#122 (transaction list), crcnum4/swoopt_bun_api#123 (audit log)
**Testable milestone:** Admin can search users, ban/unban, view transaction history, and see analytics charts showing platform traction.

---

### 4.1 User List Page

**Delivers:** Paginated, searchable user table.

**API:** `GET /admin/users?search=&limit=&cursor=` (existing)

**Columns:** Email, Phone, Verified (icon), Platform Admin (badge), Banned (red badge), Rating, Created

**Acceptance Criteria:**
- Search filters by email
- Banned users visually distinguished
- Row click navigates to `/users/[userId]`

**Complexity:** S

---

### 4.2 User Detail Page

**Delivers:** Full user detail with ban controls, credit balance, request history, org memberships.

**API:** `GET /admin/users/:userId` (existing), `PUT /admin/users/:userId/ban` (existing)

**Sections:**
- **User Info** — email, phone, verification, admin flag, ban status
- **Ban/Unban** — toggle with required reason, confirmation dialog
- **Credits** — current balance, "Issue Credits" form (BLOCKED by crcnum4/swoopt_bun_api#121, show "Coming Soon")
- **Request History** — table of user's service requests
- **Org Memberships** — orgs the user belongs to with roles

**Acceptance Criteria:**
- Ban/unban works with reason and confirmation
- Credits section renders in disabled state until crcnum4/swoopt_bun_api#121 ships
- Request and org tables display correctly

**Complexity:** M

---

### 4.3 Transaction List Page

**Delivers:** Filterable transaction table for financial oversight.

**API:** `GET /admin/transactions` (crcnum4/swoopt_bun_api#122)

**Columns:** ID, User, Org, Type (badge), Amount, Platform Fee, Status, Payout Status, Date

**Filters:** Type, status, payout status, date range (all composable AND logic)

**Blocking:** crcnum4/swoopt_bun_api#122. Show "Coming Soon" placeholder until endpoint ships.

**Acceptance Criteria:**
- Once unblocked: table loads with all filters functional
- Row expand shows full transaction breakdown
- Filter combinations work correctly

**Complexity:** M

---

### 4.4 Analytics Dashboard

**Delivers:** Visual dashboard with charts and KPIs for traction tracking and platform health.

**Charts:**

| Metric | Chart Type |
|--------|-----------|
| Request Volume | Line chart (per day/week) |
| Request Status Breakdown | Donut chart |
| Offer Acceptance Rate | Line chart (trend) |
| Average Match Score | KPI card |
| Denial Reason Breakdown | Horizontal bar chart |
| Revenue | Line chart + KPI cards |
| User Growth | Line chart |
| Org Growth | Line chart |

**Details:**
- Date range selector: 7d, 30d, 90d, custom
- Charts library: Recharts
- Responsive: 2 cols desktop, 1 col mobile
- Data from existing endpoints or crcnum4/swoopt_bun_api#115 stats endpoint

**Acceptance Criteria:**
- KPI cards render from available data
- Date range selector updates all charts
- Charts responsive on mobile
- Placeholder for metrics requiring stats endpoint

**Complexity:** L

---

### 4.5 Credits & Fee Waivers

**Delivers:** Admin tools for issuing credits and waiving transaction fees, with audit trail.

**API:** `POST /admin/users/:userId/credits` (crcnum4/swoopt_bun_api#121), `PUT /admin/transactions/:txId/waive-fees` (crcnum4/swoopt_bun_api#121), `GET /admin/audit-log` (crcnum4/swoopt_bun_api#123)

**Features:**
- Issue credits from user detail page (amount, reason, confirmation)
- Waive fees from transaction detail (reason, confirmation)
- Audit log table: admin, action, target, amount, reason, date

**Blocking:** crcnum4/swoopt_bun_api#121, crcnum4/swoopt_bun_api#123.

**Acceptance Criteria:**
- Credits form validates positive amounts, requires reason
- Fee waiver requires reason and confirmation
- Audit log shows chronological record

**Complexity:** M

---

### Phase 4 Testable Milestone

> Admin searches for a user, views their profile and request history, bans them with a reason. On the analytics page, they see request volume trending upward over the last 30 days, a denial reason breakdown showing "too_short_notice" as the top reason, and revenue KPIs. They view the transaction list filtered to medical holds and check payout statuses.

---

## Testing Strategy

### Approach

**Vitest** for unit and integration tests, mirroring the backend's testing philosophy. Manual QA for end-to-end flows. Playwright deferred until post-Phase 4 when UI stabilizes.

### What to Test

| Layer | What | Example |
|-------|------|---------|
| API Client | Request construction, auth injection, error handling | `apiClient` correctly adds Bearer token, handles 401 |
| Auth | Login flow, session management, admin check | Non-admin user is rejected after successful auth |
| Types | Enum coverage, type guards | Status enum covers all 13 service request states |
| Utils | Formatters, helpers | Currency formatter, relative time, status → color mapping |
| Components | Key UI components in isolation | MetricCard renders value, StatusBadge renders correct color |

### What NOT to Test (Yet)

- Full page rendering (too brittle during rapid iteration)
- E2E flows (manual QA is sufficient for MVP)
- API mocking of every endpoint (test the client, not the server)

### Test Infrastructure

```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode during development
npm run test:ci     # CI mode (single run, coverage report)
```

---

## Dependency Graph

```
Phase 1 (no blockers)
├── 1.1 Project Config
├── 1.2 Types
├── 1.3 API Client & Auth ──────────┐
├── 1.4 Layout Shell ←── 1.3       │
├── 1.5 Login Page ←── 1.3, 1.1    │
└── 1.6 Dashboard ←── 1.4, 1.3     │
    └── (enhanced by crcnum4/swoopt_bun_api#115)          │
                                    │
Phase 2 (builds on Phase 1)        │
├── 2.1 Request List ←── 1.3, 1.4  │
├── 2.2 Request Detail ←── 2.1     │
│   └── BLOCKED by crcnum4/swoopt_bun_api#116            │
├── 2.3 Support Queue ←── 2.1      │
├── 2.4 Manual Match ←── 2.2, 2.3  │
│   └── BLOCKED by crcnum4/swoopt_bun_api#117, crcnum4/swoopt_bun_api#118      │
└── 2.5 Re-Route ←── 2.2           │
    └── BLOCKED by crcnum4/swoopt_bun_api#119            │
                                    │
Phase 3 (parallel with Phase 2)    │
├── 3.1 Onboarding Wizard          │
│   └── BLOCKED by crcnum4/swoopt_bun_api#120            │
├── 3.2 Org List ←── 1.3, 1.4     │
├── 3.3 Org Detail ←── 3.2        │
└── 3.4 Verification Queue ←── 1.3 │
                                    │
Phase 4 (builds on Phase 3)        │
├── 4.1 User List ←── 1.3, 1.4    │
├── 4.2 User Detail ←── 4.1       │
│   └── Credits BLOCKED by crcnum4/swoopt_bun_api#121    │
├── 4.3 Transaction List            │
│   └── BLOCKED by crcnum4/swoopt_bun_api#122            │
├── 4.4 Analytics ←── 1.6          │
│   └── Enhanced by crcnum4/swoopt_bun_api#115           │
└── 4.5 Credits & Waivers          │
    └── BLOCKED by crcnum4/swoopt_bun_api#121, crcnum4/swoopt_bun_api#123      │
```

**Parallelization opportunities:**
- Phase 1 issues 1.1, 1.2, and 1.3 can start in parallel
- Phase 2 UI (2.1, 2.2, 2.3) can be built while waiting for crcnum4/swoopt_bun_api#116/3/4
- Phase 3 issues 3.2 and 3.4 need no backend changes and can start immediately
- Phase 4 issues 4.1 and 4.4 (partial) need no backend changes

---

## Appendix: API Contract Reference

### Existing Admin Endpoints (Ready to Use)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | List users (`?search=`, `?limit=`, `?cursor=`) |
| GET | `/admin/users/:userId` | User detail |
| PUT | `/admin/users/:userId/ban` | Ban/unban (`{ banned, reason }`) |
| GET | `/admin/organizations` | List orgs (`?search=`, `?status=`, `?limit=`, `?cursor=`) |
| PUT | `/admin/organizations/:orgId/verify` | Set verification (`{ verified, insured, licensed }`) |
| GET | `/admin/service-requests` | List requests (`?status=`, `?userId=`, `?limit=`, `?cursor=`) |
| GET | `/admin/verification-requests` | List verification requests (`?status=`) |
| PUT | `/admin/verification-requests/:requestId/review` | Approve/reject (`{ status, notes }`) |

### Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signin` | Login (`{ email, password }`) → `{ user, session }` |
| POST | `/auth/signout` | Logout |
| GET | `/auth/me` | Current user |
| POST | `/auth/signup` | Create account |
| POST | `/auth/verify-email` | Verify email token |
| POST | `/auth/refresh` | Refresh session |

### Organization & Service Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/organizations` | Create org |
| PUT | `/organizations/:orgId/location` | Set location |
| PUT | `/organizations/:orgId/availability` | Toggle available |
| POST | `/organizations/:orgId/services` | Add service |
| POST | `/organizations/:orgId/service-scan` | Start website scan |
| GET | `/organizations/:orgId/service-scan/:jobId` | Check scan status |
| POST | `/organizations/:orgId/service-scan/:jobId/confirm` | Import services |

### New Endpoints Needed (GitHub Issues)

| Method | Path | Issue |
|--------|------|-------|
| GET | `/admin/dashboard/stats` | crcnum4/swoopt_bun_api#115 |
| GET | `/admin/service-requests/:requestId` | crcnum4/swoopt_bun_api#116 |
| GET | `/admin/providers/search` | crcnum4/swoopt_bun_api#117 |
| POST | `/admin/service-requests/:requestId/manual-offer` | crcnum4/swoopt_bun_api#118 |
| POST | `/admin/service-requests/:requestId/re-route` | crcnum4/swoopt_bun_api#119 |
| POST | `/admin/users` | crcnum4/swoopt_bun_api#120 |
| PUT | `/admin/users/:userId/force-verify-email` | crcnum4/swoopt_bun_api#120 |
| PUT | `/admin/users/:userId/force-password-reset` | crcnum4/swoopt_bun_api#120 |
| POST | `/admin/organizations` | crcnum4/swoopt_bun_api#120 |
| POST | `/admin/users/:userId/credits` | crcnum4/swoopt_bun_api#121 |
| PUT | `/admin/transactions/:transactionId/waive-fees` | crcnum4/swoopt_bun_api#121 |
| GET | `/admin/transactions` | crcnum4/swoopt_bun_api#122 |
| GET | `/admin/audit-log` | crcnum4/swoopt_bun_api#123 |
