# Private Lesson Management System — Lovable Prompt

## Overview

Build a multi-tenant Private Lesson Management System that allows gym locations to manage private and group instruction programs. The platform is sport-agnostic and supports multiple user roles, scheduling, payments, messaging, and analytics. The application must be fully responsive for both desktop and mobile.

Use Supabase for authentication, database, real-time subscriptions, and row-level security. Use Stripe for gym subscription billing and platform transaction fees. Use Tailwind CSS and shadcn/ui for the design system.

---

## User Roles & Authentication

There are four user roles with distinct dashboards and permissions:

### 1. System Administrator (Gym Admin)
- Manages one or more gym locations under a single tenant
- Controls all configuration: pricing, lesson durations, cancellation fees, buffer times, transaction fees
- Can manage coaches, view all bookings, and manually book sessions on behalf of parents/athletes
- Has access to reporting and analytics dashboards
- Manages platform subscription (Stripe)

### 2. Coach
- Provides paid lessons to athletes at one or more gym locations
- Manages personal availability and time slots per location
- Views their own schedule, bookings, and earnings
- Can log session notes and progress tracking for athletes
- Goes through an onboarding flow when joining a gym
- Is billed a flat hourly rate by the gym for facility usage

### 3. Parent
- Books and pays for lessons for their family members (athletes)
- Manages athlete profiles under their account (family members only)
- Views schedules, upcoming sessions, and payment history
- Can cancel or reschedule sessions (subject to admin-configured policies)
- Receives Venmo payment requests from the system and approves payment to coaches via Venmo
- Can join waitlists for full sessions

### 4. Athlete/Student
- Participates in lessons booked by their parent
- An athlete profile is created and managed under a parent account
- One athlete can work with multiple coaches
- Can view their own schedule and progress notes (read-only)

---

## Multi-Tenancy

- Each gym (or gym chain) is a tenant
- Tenant data is fully isolated using Supabase row-level security
- A tenant can have multiple gym locations
- Coaches can be affiliated with multiple locations (even across tenants)
- All admin-configurable settings are scoped per tenant/location

---

## Platform Subscription (Stripe)

- Gyms subscribe to the platform via Stripe
- Subscription tiers are based on the number of managed coaches
- Implement a Stripe checkout and billing portal for gym admins
- When a gym reaches their coach limit, they must upgrade to add more coaches
- Support monthly billing cycle
- Build a subscription management page in the admin dashboard showing current tier, coach count, and upgrade options

---

## Core Features

### Scheduling & Calendar

Build a comprehensive calendar interface (use a library like FullCalendar or build a custom calendar with shadcn/ui components):

**Coach Availability Management:**
- Coaches set their available time slots per gym location
- Availability is displayed on a weekly calendar view
- Admin-configured buffer time is automatically enforced between lessons
- Coaches can block off dates/times for vacations or personal time

**Booking Flow (Parent):**
- Parent selects a coach, location, and available time slot
- System shows available slots based on coach availability, existing bookings, buffer time, and lesson duration
- Parent selects which athlete from their family is attending
- Booking confirmation sent via email and SMS
- Support for both individual (1-on-1) and group lesson bookings

**Group Lessons:**
- Coaches or admins create group session slots with a max capacity
- Parents book individual seats in the group session
- Athletes from different families can be in the same group
- Show remaining availability (e.g., "3 of 6 spots remaining")

**Recurring Bookings:**
- Parents can book recurring weekly sessions
- Recurring series can run until cancelled or until a specific end date
- Individual occurrences can be cancelled without affecting the series
- If a coach blocks off a conflicting date, that single occurrence is auto-cancelled with notification to the parent

**Admin Manual Booking:**
- Admin can book a session on behalf of any athlete/parent (for phone-in bookings)
- Admin sees a master calendar with all coaches, locations, and bookings
- Filter calendar by coach, location, or date range

**Waitlist:**
- When a session is fully booked, parents can join a waitlist
- When a spot opens (cancellation), the first person on the waitlist is notified via email/SMS
- Parent is given a configurable time window to confirm before the spot goes to the next person

### Admin Configuration Panel

Build an admin settings area with the following configurable options:

- **Lesson Pricing:** Set rates per coach, per lesson type (individual vs group), and per duration. Prices are visible to parents during booking.
- **Lesson Durations:** Define available duration options (e.g., 30 min, 45 min, 60 min). Can vary by lesson type.
- **Buffer Time:** Set required buffer time between lessons (applied globally per location)
- **Cancellation Policy:** Configure cancellation window (e.g., 24 hours before), late cancellation fee (flat or percentage), and no-show fee
- **Transaction Fee:** Configure the platform's per-transaction fee (percentage, flat, or combination) — deducted from coach earnings or added to parent total (admin choice)
- **Coach Hourly Rate:** Flat rate charged to coaches for gym facility usage per lesson hour

### Payments

**Parent-to-Coach Payments (Venmo Payment Request):**
- After a session is completed, the system automatically sends a Venmo payment request to the parent via Venmo's request API
- The request is pre-filled with the correct amount (lesson price + any applicable fees)
- The parent receives the request in their Venmo app and approves the payment
- The system tracks payment status: "Requested" → "Completed" (confirmed via Venmo webhook/callback) or "Declined"
- If a parent does not respond within a configurable time window, a reminder notification is sent
- Payment history is visible to parents, coaches, and admins
- Coach's Venmo handle is stored during onboarding and used to route payments

**Gym-to-Platform Subscription (Stripe):**
- Standard Stripe subscription checkout and management
- Webhook handling for subscription events (created, updated, cancelled, payment failed)
- Grace period handling for failed payments

**Coach Facility Billing:**
- System tracks total lesson hours per coach per billing period
- Calculates amount owed based on flat hourly rate x completed lesson hours
- Admin can view and export billing summary per coach
- Billing is handled outside the platform (invoice/report generation only)

**Transaction Fees:**
- Configurable per-tenant transaction fee on each lesson booking
- Clearly shown in admin reports
- Tracked per transaction for accounting purposes

**Refunds:**
- Refunds are handled outside the system by the coach directly
- No in-app refund processing needed
- Admin can mark a payment as "Refunded" for record-keeping

### Coach Onboarding

- Admin sends an invite link to a new coach (email invitation)
- Coach clicks the link, creates an account, and completes a profile setup:
  - Personal information and bio
  - Profile photo
  - Sports/skills offered
  - Venmo handle for payments
  - Availability setup for their first location
- Admin reviews and approves the coach profile before it goes live
- Coach is then visible to parents for booking

### Progress Tracking & Session Notes

- After each completed session, the coach can log freeform text notes
- Notes are simple text entries — no structured skill assessments or rating scales for MVP
- Notes are visible to the parent and athlete under the athlete's profile (read-only for parents/athletes)
- Session history shows a chronological timeline of all lessons with associated notes per athlete
- Parent can view progress over time for each of their athletes

### In-App Messaging

- Real-time messaging between coaches and parents only (coach-to-parent, parent-to-coach)
- Message inbox with conversation threads per coach-parent pair
- Unread message indicators and notifications
- Admin can view message threads for oversight but does not participate in messaging
- Support text messages only (no file/media sharing needed for MVP)
- Use Supabase real-time subscriptions for live message delivery

### Notifications (Email & SMS)

Trigger notifications for the following events:
- Booking confirmation
- Booking cancellation
- Upcoming session reminder (configurable: 24 hours and/or 1 hour before)
- Waitlist spot available
- Payment request / payment confirmation
- New message received
- Coach onboarding invite
- Recurring booking conflict (auto-cancelled occurrence)

Use Supabase Edge Functions to send notifications. Use a service like Twilio for SMS and Resend (or similar) for email.

Users should be able to configure their notification preferences (email, SMS, or both) in their profile settings.

### Reporting & Analytics (Admin-Only Dashboard)

Build an analytics dashboard accessible only to gym administrators with:

- **Revenue Overview:** Total lesson revenue, revenue per coach, revenue over time (chart)
- **Booking Metrics:** Total bookings, bookings per coach, bookings per location, individual vs group split
- **Utilization:** Coach utilization rates (booked hours vs available hours)
- **Cancellation Rates:** Cancellations and no-shows per coach, per time period
- **Peak Hours:** Heatmap or chart showing busiest booking times
- **Coach Billing Summary:** Hours used and amount owed per coach
- **Athlete Metrics:** Active athletes, lesson frequency, retention

Use chart components (e.g., Recharts) for data visualization. Support date range filtering on all reports.

---

## Database Schema (Supabase / PostgreSQL)

Design the following core tables (with appropriate foreign keys, indexes, and RLS policies):

- **tenants** — id, name, subscription_tier, stripe_customer_id, stripe_subscription_id, settings (JSONB for configurable options)
- **locations** — id, tenant_id, name, address, timezone
- **users** — id, email, role (admin, coach, parent, athlete), tenant_id, first_name, last_name, phone, avatar_url, notification_preferences (JSONB)
- **coach_profiles** — id, user_id, bio, venmo_handle, hourly_rate, onboarding_status (invited, pending_approval, active), sports (text array)
- **coach_locations** — coach_id, location_id (many-to-many)
- **family_members** — id, parent_user_id, first_name, last_name, date_of_birth, notes
- **availability** — id, coach_id, location_id, day_of_week, start_time, end_time, is_recurring
- **availability_overrides** — id, coach_id, date, is_blocked (for vacations/blocked dates)
- **lessons** — id, tenant_id, location_id, coach_id, lesson_type (individual, group), max_capacity, duration_minutes, price, status (scheduled, completed, cancelled, no_show), scheduled_at, recurrence_id
- **lesson_bookings** — id, lesson_id, family_member_id, parent_user_id, status (confirmed, cancelled, waitlisted), cancelled_at, cancellation_fee
- **recurrences** — id, parent_user_id, coach_id, location_id, day_of_week, start_time, end_until, family_member_id
- **payments** — id, lesson_booking_id, amount, transaction_fee, status (requested, completed, declined, refunded), venmo_request_id, requested_at, completed_at, confirmed_by
- **session_notes** — id, lesson_id, coach_id, family_member_id, content (text), created_at
- **messages** — id, sender_id, receiver_id, tenant_id, content, read_at, created_at
- **waitlist** — id, lesson_id, parent_user_id, family_member_id, position, created_at
- **notifications** — id, user_id, type, title, body, read, channel (email, sms), sent_at

Apply Supabase Row-Level Security (RLS) policies to enforce:
- Tenant isolation on all tables
- Parents can only see/manage their own family members and bookings
- Coaches can only see their own schedule, bookings, notes, and earnings
- Admins have full read/write access within their tenant
- Athletes have read-only access to their own schedule and notes

---

## Pages & Navigation

### Public Pages
- Landing page with platform overview and gym sign-up CTA
- Gym sign-up flow (Stripe checkout for subscription)

### Admin Dashboard
- Overview / analytics dashboard
- Calendar (master view with filters)
- Coaches management (list, invite, onboard, approve)
- Locations management
- Athletes / families directory
- Booking management
- Configuration / settings (pricing, durations, buffer, cancellation, fees)
- Billing (coach facility billing reports, subscription management)
- Messages inbox

### Coach Dashboard
- My schedule / calendar
- My availability management
- My bookings (upcoming and past)
- Session notes (per athlete)
- Earnings / payment history
- Messages inbox
- Profile / settings

### Parent Dashboard
- Book a lesson (browse coaches, select slots)
- My bookings (upcoming, past, recurring)
- My athletes / family members
- Athlete progress (session notes timeline)
- Payment history
- Messages inbox
- Profile / notification settings

---

## Technical Requirements

- **Framework:** React + TypeScript (Lovable default)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, Database, Real-time, Edge Functions, Storage)
- **Payments:** Stripe (subscriptions), Venmo Payment Request API (lesson payments)
- **Charts:** Recharts for analytics
- **Calendar:** FullCalendar or custom implementation
- **SMS:** Twilio (via Supabase Edge Functions)
- **Email:** Resend (via Supabase Edge Functions)
- **Responsive:** Fully responsive design, mobile-first approach
- **Auth:** Supabase Auth with email/password, role-based access control
- **Real-time:** Supabase real-time for messaging and booking updates

---

## MVP Priority Order

Build in this order:

1. **Auth & multi-tenancy** — Sign up, login, role-based routing, tenant isolation
2. **Admin configuration** — Settings panel for all configurable options
3. **Coach onboarding** — Invite flow, profile setup, approval
4. **Availability & scheduling** — Coach availability, calendar views
5. **Booking flow** — Parent booking for individual and group lessons, recurring bookings
6. **Payments** — Venmo payment request integration, payment tracking, Stripe subscription
7. **Notifications** — Email and SMS for key events
8. **Messaging** — In-app coach-parent messaging
9. **Progress tracking** — Session notes and athlete progress timeline
10. **Analytics** — Admin reporting dashboard
11. **Waitlist** — Waitlist management and auto-notification
