# Rentify MVP - Complete Requirements Document

> **Last Updated**: Initial Creation
> **Tech Stack**: React/Next.js (Web only for now)

---

## Project Overview

### Problem Statement

Landlords in Tanzania currently lack a centralized, user-friendly system to manage rental properties. Manual processes for tracking rent payments, lease agreements, and maintenance requests increase costs and create inefficiencies, especially for small landlords managing up to 20 units.

### Solution Statement

Rentify provides a web-based property management MVP that streamlines landlord operations. The platform enables landlords to manage properties, tenants, payment confirmations, and maintenance in one place, while tenants receive reminders, upload leases (PDF or image), and track requests. All data handling complies with the Tanzanian Personal Data Protection Act (PDPA).

### Application Type

- **Web App** (Primary) for Super Admin, Landlords, and Tenants
- Each user type has corresponding level of access and UI

---

## User Types & Authentication

### 1. Super Admin

**Hardcoded Credentials:**
- Email: `ahrorbek@rentify.com`
- Password: `ahrorbek`

**Access:**
- Web portal only
- Full system access
- Can create landlords and assign credentials
- Can track all landlords and their actions
- Can view all system data

**Responsibilities:**
- Create landlord accounts
- Assign email/password to landlords (format: `something@rentify.com`)
- Monitor all landlord activities
- Oversee platform-wide operations

### 2. Landlords

**Account Creation:**
- Created by Super Admin
- Assigned email/password by Super Admin
- Email format: `something@rentify.com`

**Access:**
- Web portal
- Access only to their own properties
- Can manage tenants, leases, and maintenance requests for their units
- Can view reports limited to their portfolio

**Onboarding:**
- Login with Super Admin-assigned credentials
- Profile setup (name, contact information)
- Property portfolio information
- Accept Terms & Conditions and Privacy Policy
- Acknowledge compliance with Tanzanian Personal Data Protection Act

### 3. Tenants

**Account Creation:**
- Sign up via unique invitation link provided by landlord
- Link is per unit (each apartment gets its own unique link)
- After sign up, can log in normally

**Access:**
- Web portal
- Access only to their own leases, payments, and maintenance requests
- Cannot view other tenants' data

**Onboarding:**
- Click invitation link from landlord
- Sign up with email and password (if new) or log in (if existing)
- Profile setup (name, contact information including phone)
- Accept Terms & Conditions and Privacy Policy
- Acknowledge compliance with PDPA

---

## Commercialization Model

### Subscription Plans for Landlords

- **Free Trial**: 14-day Pro Plan, no credit card required

- **Basic Plan** ($9/month): 
  - Manage up to 5 properties
  - Basic tenant tracking
  - Email support

- **Pro Plan** ($29/month): 
  - Unlimited properties
  - Advanced analytics
  - Priority support

**Note**: Tenants access app features for free (covered by landlord subscription)

---

## Super Admin Features

### Authentication
- Hardcoded login: `ahrorbek@rentify.com` / `ahrorbek`
- Web portal only

### Core Features

#### Landlord Management
- Create new landlord accounts
- Assign email/password to landlords (format: `something@rentify.com`)
- View all landlord accounts
- View landlord subscription status:
  - Plan (Free Trial, Basic, Pro)
  - Trial status
  - Renewal/cancel state
- Track landlord activities and actions

#### User Oversight
- View all landlord and tenant accounts
- View relationships (which tenants belong to which landlords)
- Monitor user activity

#### Payments & Transactions
- View all payment activity and statuses:
  - Paid
  - Pending
  - Overdue
- View confirmations from payment gateway
- System-wide transaction overview

#### Maintenance Oversight
- View all tenant-submitted maintenance requests
- View request statuses:
  - Submitted
  - In progress
  - Resolved

#### Analytics & Reports
- System-wide analytics:
  - Total rental income
  - Total overdue payments
  - Maintenance costs
  - Vacancy rates
  - User growth metrics
  - Subscription metrics

#### Notifications (System-Wide)
- Trigger platform-wide push notifications for critical updates
- Service notices

#### Data Protection & Requests
- Process data subject requests per PDPA:
  - Access personal data
  - Correction/rectification
  - Erasure/deletion

---

## Landlord Features

### Onboarding

- **Sign-up & Authentication**:
  - Login with Super Admin-assigned credentials
  - Email format: `something@rentify.com`
  - Password assigned by Super Admin

- **Profile Setup**:
  - Name
  - Contact information
  - Property portfolio (number and type of properties owned)

- **Verification & Compliance**:
  - Accept Terms & Conditions and Privacy Policy
  - Acknowledge compliance with Tanzanian Personal Data Protection Act

- **Guided Setup**:
  - Add first property including:
    - Address
    - Property type (single unit or multi-unit)
    - Rent amount
    - Lease start/end dates
    - Tenant details (if already occupied)
  - Enable push notifications for:
    - Payment reminders
    - Tenant updates
    - Maintenance alerts

### Core Features

#### Property Management Dashboard
- Central view of all rental properties
- Key property fields:
  - Address
  - Tenant details
  - Rent amount
  - Lease dates
  - Maintenance history

#### Apartment/Unit Management (Special Subsection)
- **Multi-unit property support**:
  - Add entire buildings as properties
  - Define multiple units within each building (e.g., apartment 1A, 1B, 2A, 2B for a 2-story building)
  - Each unit can have its own:
    - Rent amount
    - Lease dates
    - Payment tracking
    - Tenant assignment
  - **Generate unique invitation link per unit**:
    - After creating units (e.g., 2-3-4 story building apartments)
    - Each unit gets a unique invitation link
    - Landlord can send this link to tenant
    - Tenant uses link to sign up/log in and access their unit

#### Tenant Management
- Control tenant profiles (add, edit, remove)
- Store tenant contact info
- View tenants who signed up via invitation links
- Upload lease agreements (PDF)
- Track lease terms and renewal dates
- Assign tenants to specific units

#### Rent Collection & Tracking
- Record tenant payments
- Payment status tracking:
  - Paid
  - Pending
  - Overdue
- Automated rent due reminders to tenants
- Late fee notifications

#### Payment Confirmation Integration
- Connect to Selcom API to record payment confirmation
- Processing handled externally
- View payment confirmations

#### Maintenance Requests
- View and track tenant-submitted requests
- Click-to-call via WhatsApp
- Upload photos/notes when marking resolved
- Push notifications for new requests
- Filter by unit/property

#### Reporting & Analytics
- Monthly rental income summary
- Overdue payment tracking
- Maintenance cost overview
- Simple charts/graphs
- Vacancy report (occupied vs. vacant units)
- Unit-level analytics

#### Account & Subscription Management
- Access subscription plan details
- Upgrade/downgrade plan
- Cancel or renew subscription
- View billing history

---

## Tenant Features

### Onboarding

- **Sign-up & Authentication**:
  - Access via unique invitation link from landlord (per unit)
  - If new: Sign up with email and password
  - If existing: Log in with existing credentials
  - After initial setup, can log in normally

- **Profile Setup**:
  - Name
  - Contact information:
    - Phone number (required)
    - Email (required)

- **Verification & Compliance**:
  - Accept Terms & Conditions and Privacy Policy
  - Acknowledge compliance with PDPA

### Core Features

#### Lease Management
- Upload signed lease agreements (PDF or image)
- View lease details shared by landlord
- View lease terms (dates, rent amount)

#### Payment Confirmation
- Record payment via Selcom API confirmation (processing happens outside the app)
- Receive payment status notifications
- View payment history for their unit

#### Reminders & Notifications
- Automated reminders for:
  - Rent due
  - Overdue
  - Late payments
- Push notifications for payment status

#### Maintenance Requests
- Submit request with:
  - Text description
  - Photo uploads (Required - at least one)
  - Additional photo uploads (Optional)
- Track request status:
  - Submitted
  - In Progress
  - Resolved
- Receive push notifications on updates
- View request history

#### Communication
- Click-to-call landlord via WhatsApp

---

## Payment Integration (Selcom API)

### Integration Scope
- Integrate Selcom API as the payment gateway for Tanzania
- Support in-app tenant rent payments through:
  - Mobile money wallets (Mpesa, AirtelMoney, TigoPesa, HaloPesa, TTCL Pesa, Zantel)
  - Debit/credit cards where available
- Enable recurring monthly rent collection and one-time payments

### Core Functionalities
- Provide landlords with confirmation of payments received
- Provide tenants with confirmation notifications after successful transactions

### Transaction Creation
- Generate unique transaction IDs for each payment

### Payment Status Tracking
- Record system updates on transaction state:
  - SUCCESS
  - INPROGRESS
  - AMBIGUOUS
  - FAIL

### Query Mechanism
- Implement API query to check transaction status in case of timeouts or ambiguous responses

### Notifications
- Display system-level confirmation messages to both landlord and tenant after payment processing

### Reconciliation
- Store receipts, references, and Selcom result codes for financial recordkeeping and compliance

### Security & Compliance
- All API requests to include Selcom-required headers:
  - Authorization
  - Timestamp (ISO 8601)
  - Digest-Method (HS256 or RS256)
  - Digest
  - Signed-Fields
- Adhere to Tanzanian financial regulations and PDPA in storing and processing payment data

---

## Compliance Requirements

### Tanzanian Personal Data Protection Act (PDPA)

All user data handling must comply with PDPA requirements:

- Obtain user consent for data collection and processing
- Provide transparency about data usage
- Enable data subject rights:
  - Right to access personal data
  - Right to correction/rectification
  - Right to erasure/deletion
- Implement appropriate security measures for data protection
- Maintain audit trails for compliance verification

---

## Technical Requirements

### Web Application
- **Framework**: React/Next.js
- **Users**: Super Admin, Landlord, Tenant (each with corresponding access level and UI)
- **Features**: 
  - Full admin dashboard (Super Admin)
  - Property management dashboard (Landlord)
  - Tenant portal (Tenant)
  - Push notifications
  - Photo uploads (camera and gallery)
  - PDF document handling
  - WhatsApp integration (click-to-call)

### Data Storage
- Secure storage for:
  - User profiles and authentication data
  - Property and tenant information
  - Unit/apartment information with unique invitation links
  - Lease agreements (PDF/images)
  - Payment records and transaction history
  - Maintenance request photos and notes
  - Subscription and billing data

### Integrations
- **Selcom API**: Payment gateway integration
- **WhatsApp**: Click-to-call functionality
- **Push Notifications**: For reminders and alerts

### Authentication & Access Control
- **Super Admin**: Hardcoded credentials, full system access
- **Landlord**: Assigned by Super Admin, can access only properties they own
- **Tenant**: Sign up via invitation link, can access only their own data
- **Data Protection**: Enforce row-level security in database (RLS by landlord_id)
- All user data actions logged (for PDPA compliance)

---

## Development Sequencing Plan

### Phase 1: Foundation & Authentication
1. Project setup (Next.js, TypeScript, database)
2. Authentication system
   - Super Admin hardcoded login
   - Role-based access control (Super Admin, Landlord, Tenant)
   - Session management
3. Database schema setup
   - Users (Super Admin, Landlords, Tenants)
   - Properties
   - Units/Apartments
   - Invitation links (per unit)
   - Subscriptions
   - Audit logs

### Phase 2: Super Admin Portal
1. Super Admin dashboard
2. Landlord management (create, assign credentials, view)
3. Activity tracking for landlords
4. System-wide analytics

### Phase 3: Landlord Onboarding & Property Management
1. Landlord login with assigned credentials
2. Landlord profile setup
3. Property management dashboard
4. Apartment/Unit creation subsection
   - Create buildings
   - Add units to buildings
   - Generate unique invitation links per unit
5. Tenant management (view tenants, assign to units)

### Phase 4: Tenant Onboarding & Core Features
1. Invitation link system (per unit)
2. Tenant sign up via invitation link
3. Tenant login
4. Tenant profile setup
5. Lease management (upload, view)
6. Payment confirmation (Selcom integration)
7. Maintenance request system
   - Tenant submission
   - Landlord resolution
   - Photo uploads
8. WhatsApp click-to-call

### Phase 5: Payment & Subscription
1. Payment tracking (manual entry first)
2. Selcom API integration
3. Payment status tracking
4. Subscription management
5. Free trial enforcement
6. Plan upgrade/downgrade

### Phase 6: Reporting & Analytics
1. Landlord reporting dashboard
2. Super Admin analytics
3. Charts and graphs
4. Vacancy reports

### Phase 7: Notifications & Polish
1. Push notifications setup
2. Email notifications
3. Payment reminders
4. Maintenance request notifications
5. System-wide notifications (Super Admin)

---

## Development Guidelines

- Always generate modular, reusable components
- Use TypeScript for all code
- Use RESTful conventions (`/api/v1/...`) for all endpoints
- Validate all forms with Zod schemas before submission
- Do not hardcode credentials or API keys; use environment variables (except Super Admin)
- Prefer functional components and hooks
- For each feature:
  1. UI component(s)
  2. API endpoint(s)
  3. Database schema (if new entities)
  4. Data validation and error handling
  5. Testing and edge-case review

---

## Non-Functional Requirements

- **Performance**: Response time under 500 ms for standard queries
- **Availability**: 99% uptime target for backend services
- **Security**: All API routes behind auth middleware; encrypted storage for PII
- **Scalability**: Capable of supporting 1,000+ properties and 10,000+ tenants
- **Localization**: All currency values in TZS; date format DD/MM/YYYY

---

## Testing Approach

- **Unit Tests**: Jest for backend, React Testing Library for frontend
- **Integration Tests**: Cypress or Playwright for critical flows
- **Test Data**: Use mock data for landlords, tenants, and properties
- **Acceptance Criteria Example**:
  - Tenant can submit maintenance request → Landlord sees it → Marks resolved → Tenant gets notification

---

## Success Metrics

### User Engagement
- Landlord sign-ups and active users
- Tenant adoption rate
- Daily/weekly active users

### Feature Usage
- Properties added per landlord
- Units created per property
- Payment confirmations recorded
- Maintenance requests submitted and resolved
- Lease agreements uploaded

### Revenue Metrics
- Free trial to paid conversion rate
- Basic to Pro plan upgrade rate
- Monthly recurring revenue (MRR)
- Customer lifetime value (CLV)
- Churn rate

### Operational Efficiency
- Average time to resolve maintenance requests
- Payment confirmation accuracy
- System uptime and performance

---

## Target Market

### Primary Market
Small to medium-sized landlords in Tanzania managing up to 20 rental units

### Geographic Focus
Tanzania (initial launch), with potential for East African expansion

### User Characteristics
- Limited technical expertise
- Need for simplified property management
- Require local payment method support (mobile money)
- Value compliance with local regulations

---

## Key Implementation Notes

1. **Super Admin**: Hardcoded credentials, cannot be changed through UI
2. **Landlord Creation**: Only Super Admin can create landlords with assigned credentials
3. **Unit Invitation Links**: Each unit gets a unique, shareable link for tenant onboarding
4. **Multi-Unit Buildings**: Landlords can create buildings and add multiple units (apartments) to each
5. **Tenant Access**: Tenants must use invitation link first time, then can log in normally
6. **Data Isolation**: Strict row-level security - landlords see only their data, tenants see only their data
7. **Audit Logging**: All critical actions logged for PDPA compliance

---

## Post-MVP Considerations

- Advanced analytics and insights
- Bulk property import
- Automated lease renewals
- Document templates
- Tenant screening
- Multi-language support
- SMS notifications (in addition to push)
- Mobile app (iOS + Android)

