# CivicFix — AI-Powered Civic Issue Management

## What it does

CivicFix lets citizens report civic issues (potholes, garbage, broken streetlights, water leaks) with photo evidence and GPS location. The system uses AI to automatically classify complaints, detect duplicates (via both text and image similarity), route issues to the correct department, and track resolution against SLA deadlines with automatic escalation.

## Problem it solves

Civic complaint systems are often opaque and inefficient — citizens report the same issue multiple times, complaints get misclassified or lost, and there's no visibility into resolution timelines. CivicFix addresses this with AI-assisted triage, duplicate detection, and a public transparency dashboard so citizens can track real progress.

## Features

- **Citizen auth**: email/password registration and Google OAuth login
- **Issue reporting**: image upload, GPS location, category, severity, free-text "other" category
- **AI classification**: Gemini vision model suggests severity from uploaded images
- **Duplicate detection**: combines text embeddings and perceptual image hashing to flag likely duplicate reports
- **Automatic department routing**: complaints assigned to the correct municipal department by category
- **SLA tracking & escalation**: deadlines calculated by severity; a background job automatically escalates overdue complaints
- **Map dashboard**: clustered map view of all reported issues (Leaflet)
- **Admin controls**: status updates, delete, resolution-time analytics, complaint trends, high-priority area detection
- **Notifications**: email (Resend) and browser push notifications on status change
- **Public transparency page**: live complaint status visible without login, with no personal data exposed
- **RAG-powered municipal assistant**: chat interface answering citizen questions from seeded policy/FAQ documents using retrieval-augmented generation
- **Background job processing**: complaint creation responds instantly; AI classification, duplicate checks, and routing run asynchronously via BullMQ

## Tech stack

**Frontend**: React, TypeScript, Tailwind CSS, React Router, Axios, Leaflet + React-Leaflet (with clustering)

**Backend**: Node.js, Express, TypeScript

**Database**: PostgreSQL, Prisma ORM

**AI**: Google Gemini (vision classification, text embeddings, RAG generation)

**Background jobs**: Redis, BullMQ

**Auth**: JWT, Google OAuth (Passport.js), bcrypt

**Storage**: Cloudinary (image uploads)

**Notifications**: Resend (email), Web Push API (browser push)

**Testing**: Jest + Supertest (backend), Vitest + React Testing Library (frontend)

## Known limitations

- Email notifications are restricted to the Resend account's verified address on the free tier (would work for all users once a custom domain is verified)
- Admin role assignment is currently manual (via database), not self-service
