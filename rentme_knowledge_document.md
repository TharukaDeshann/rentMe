# RentMe Platform — Complete Knowledge Document

## What is RentMe?

RentMe is a peer-to-peer (P2P) vehicle rental platform developed as a University of Moratuwa IS 3920 Individual Project by student 225023J (Deshan G.H.T). It connects verified vehicle owners with renters who need temporary transportation. The platform is a web application built with Next.js (frontend), Spring Boot (backend), and a Supabase PostgreSQL database.

RentMe is designed to replace informal, fragmented vehicle rental arrangements with a secure, centralized, and verified marketplace.

---

## User Roles

RentMe has three distinct user roles. Every account has exactly one primary role.

### Renter
A renter is an end user who searches for and books vehicles. Every newly registered user starts as a Renter by default.

**What a Renter can do:**
- Browse available vehicles using list view or map view
- Filter vehicles by type (SEDAN, SUV, TRUCK, VAN, MOTORCYCLE, HATCHBACK, COUPE, CONVERTIBLE, MINIVAN, PICKUP), price range, and pickup location
- View full vehicle details including owner information, pickup location, and legal documents
- Send a booking request for a vehicle by selecting start and end dates and adding optional notes
- View their own booking history and filter by status
- Cancel a booking request while it is still in PENDING status (before the owner has approved it)
- Initiate a chat session with a Vehicle Owner from a specific vehicle listing page
- Use the AI Assistant (RAG chatbot) to ask questions about platform FAQ and retrieve their own booking details
- Rate and review a vehicle or owner after a booking is marked COMPLETED

**What a Renter cannot do:**
- List a vehicle (unless they upgrade their account through the vehicle owner onboarding process)
- Initiate a chat session if they are not logged in
- Cancel a booking after the owner has already approved it

### Vehicle Owner
A Vehicle Owner is a registered user who lists one or more vehicles for rent. They must complete the KYC (Know Your Customer) verification process before any of their listings become visible to renters.

**What a Vehicle Owner can do:**
- Upload identity documents (NIC, driving licence, address proof) to submit a verification request
- Create, update, and delete vehicle listings after verification is approved
- Manage their vehicle fleet with full CRUD operations
- Accept or reject booking requests from renters, providing an optional rejection reason
- Manually toggle a vehicle's availability or listing visibility at any time
- View all bookings across their vehicles, filterable by status
- Reply to chat messages initiated by renters (owners cannot start new conversations)
- Rate renters after a booking is completed

**What a Vehicle Owner cannot do:**
- List vehicles until their verification status is APPROVED
- Initiate a new chat conversation with any renter
- Receive messages from renters if their verification status is not APPROVED

### Administrator (Admin)
An Admin is an internal platform staff member who maintains safety and compliance.

**What an Admin can do:**
- Review uploaded identity documents from Vehicle Owners in the verification queue
- Approve or reject verification requests (must provide a rejection reason when rejecting)
- Monitor all users (renters and owners), suspend accounts, and reactivate deactivated accounts
- View platform-wide analytics: total users, total vehicles, total bookings, revenue, average rating
- Read any chat session (for audit purposes)
- Start a chat session with any user (renter or owner)
- View all vehicles and all bookings across the entire platform

---

## Registration and Authentication

Users register with:
- Full name
- Email address (must be unique)
- Password (min 8 characters, must include uppercase, lowercase, digit, and special character)
- Contact number (10–20 digits, optionally starting with +)
- Date of birth (optional)

Authentication supports:
- Local email/password login
- Google OAuth (Google Sign-In)

JWT tokens are stored in HTTP-only cookies for security. Tokens expire after 24 hours.

A newly registered user automatically receives:
1. A User record with role = RENTER
2. A Renter record linked to the User

---

## Vehicle Listing Process

A Vehicle Owner must complete the following steps before their vehicles appear in search results:

### Step 1 — KYC Verification
1. The owner uploads identity documents (NIC is mandatory; driving licence and address proof are optional)
2. A VerificationRequest is created with status = PENDING
3. The admin reviews the documents and either APPROVES or REJECTS the request
4. If rejected, the admin must provide a rejection reason, and the owner can re-upload documents to create a new request (history is preserved)
5. Once APPROVED, the owner can list vehicles

### Step 2 — Vehicle Creation
A vehicle listing requires:
- Make (e.g., Toyota)
- Model (e.g., Camry)
- Type (SEDAN, SUV, TRUCK, VAN, MOTORCYCLE, HATCHBACK, COUPE, CONVERTIBLE, MINIVAN, PICKUP)
- Capacity (number of seats, 1–50)
- Daily price (in USD)
- Pickup location (address string)
- Latitude and longitude (for map search)
- Optional: description, pictures (Cloudinary URLs), legal documents

Vehicles have two visibility flags:
- `isListed` — whether the listing appears in search results (owner-controlled)
- `isAvailable` — whether the vehicle can accept new bookings (automatically managed by the booking system, but owner can also toggle manually)

---

## Booking Lifecycle

The booking system manages the full rental transaction from request to completion.

### Booking Status Flow

```
Renter submits request → PENDING
Owner approves          → APPROVED
Start date arrives      → ONGOING   (automatic, daily scheduler)
End date passes         → COMPLETED (automatic, daily scheduler)

OR

Owner rejects           → CANCELLED (from PENDING)
Renter cancels          → CANCELLED (from PENDING only)
```

### Booking Rules
- A renter cannot book their own vehicle
- The vehicle must be listed (isListed = true) and available (isAvailable = true)
- The vehicle owner must have APPROVED verification status
- Date range must be at least 1 day (end date must be strictly after start date)
- No overlapping bookings are allowed for the same vehicle (checked against PENDING, APPROVED, and ONGOING bookings)
- When a booking is APPROVED, the vehicle's isAvailable flag is automatically set to false
- When a booking reaches COMPLETED, the vehicle's isAvailable flag is automatically restored to true

### Booking Cost Calculation
`total_amount = daily_price × number_of_days`
where `number_of_days = DAYS between startDate and endDate`

### Booking Fields
- booking_id
- vehicle_id
- renter_id
- start_date
- end_date
- status (PENDING, APPROVED, ONGOING, COMPLETED, CANCELLED)
- total_amount
- notes (renter's optional notes to the owner)
- cancellation_reason (provided when owner rejects or renter cancels)
- created_at
- updated_at

---

## Document Upload System

RentMe has a normalised document storage system. All documents are stored as file references (URLs or paths) — raw file bytes are never stored in the database.

### Document Types
- OWNER_NIC — National Identity Card
- OWNER_DRIVING_LICENSE — Driver's licence
- OWNER_ADDRESS_PROOF — Utility bill or bank statement
- OWNER_OTHER — Any additional owner document
- VEHICLE_REGISTRATION — Vehicle registration book
- VEHICLE_INSURANCE — Insurance certificate
- VEHICLE_PICTURE — Photo of the vehicle

### Storage Backends
The system supports multiple storage backends (configurable via `app.storage.provider`):
- `local` — Files stored on the server filesystem (default, used in development)
- `s3` — Amazon S3 or any S3-compatible service (stub ready for credentials)
- `cloudinary` — Cloudinary CDN (future)

### File Validation Rules
- Maximum file size: 10 MB
- Allowed types: PDF, JPEG, PNG, WEBP

---

## In-App Messaging (P2P Chat)

### Chat Session Rules
- **Renter ↔ Owner sessions:** Only a Renter can create (initiate) a chat session with a Vehicle Owner. The owner can only reply to existing sessions — they cannot start new ones. This protects renters from unsolicited contact and marketing spam.
- **Admin sessions:** An Admin can open a chat with any user (Renter or Owner).
- **Verified owner gate:** A Vehicle Owner must have verification status = APPROVED to send or receive messages.
- **Session uniqueness:** There is at most ONE chat session per Renter–Owner pair, regardless of which vehicle is being discussed. If the renter opens a chat from a different vehicle owned by the same owner, the existing session is reused and the vehicle context is updated.
- **Vehicle context:** Each session shows the "current subject vehicle" — the vehicle the renter most recently opened the chat from. The vehicle card appears at the top of the chat and links to the vehicle's profile page.

### Message Types
- TEXT — plain text message
- IMAGE — a file URL pointing to an already-uploaded image
- LOCATION — a latitude and longitude pair (shown as a map pin in the UI)

### Chat Privacy
Chat history is visible only to the two participants and Admins (for audit). Any other authenticated user receives a 403 Forbidden error.

### Message Soft Delete
Messages are never permanently deleted from the database. Setting `isDeleted = true` hides a message from the API response but preserves it for auditing.

---

## Review and Rating System

After a booking reaches COMPLETED status, both parties can submit a review:
- Renter can rate the vehicle (1–5 stars) and write a text review
- Owner can rate the renter
- The system calculates and displays the average rating on public vehicle profiles and owner profiles
- A user can only submit one review per completed booking (duplicate prevention)
- Reviews submitted before booking completion are rejected

---

## AI Assistant (RAG Chatbot)

The platform includes an AI-powered assistant available to all authenticated users. It uses Retrieval-Augmented Generation (RAG) with a vector database and an LLM (Google AI Studio / Gemini).

**Capabilities:**
- Answers general FAQ questions about platform features, booking rules, verification, and messaging
- For authenticated users, can securely retrieve personal data such as booking history and account status by querying the database
- Example queries: "How do I cancel my booking?", "Show my active bookings", "What documents do I need to verify my account?"

---

## Push Notifications

The platform sends automated web push notifications for:
- Booking confirmation (when a renter's request is approved by the owner)
- New message alerts (when a participant sends a message in a chat session)
- Rental due date reminders (before the start or end date of a booking)

---

## Non-Functional Requirements

### Performance
- Map view must render up to 100 vehicle markers within 2 seconds
- RAG chatbot must respond within 3 seconds (95th percentile); typing indicator appears within 500ms
- Database queries for vehicle filtering must return results in under 1 second
- System must support at least 500 concurrent users without degradation

### Security
- All data transmitted over TLS 1.3 (HTTPS)
- Passwords hashed using BCrypt with unique salt
- API endpoints secured with JWT (1-hour lifespan, refresh token for extended sessions)
- Chat history accessible only to participants and Admins

### Availability
- 99.9% uptime during business hours (6 AM – 12 AM)
- Full database backup every 24 hours; maximum data loss of 24 hours in the event of failure

### Key Business Rules
- **No ID, No Trade:** An unverified Vehicle Owner cannot receive booking requests or messages
- **Booking Overlap Rule:** A vehicle cannot be double-booked; overlapping date ranges are rejected at the API level
- **Role Strictness:** A RENTER account cannot list vehicles without undergoing the Vehicle Owner upgrade and verification process
- **Rating Eligibility:** Reviews can only be submitted after a booking is marked COMPLETED
- **Chat Anti-Spam:** Vehicle Owners cannot initiate chat sessions with renters

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (React) |
| Backend | Spring Boot 3 (Java 21) |
| Database | PostgreSQL (hosted on Supabase) |
| Auth | JWT (HTTP-only cookies) + Google OAuth |
| File Storage | Local filesystem (dev) → S3 or Cloudinary (production) |
| Maps | Google Maps API |
| Media | Cloudinary |
| AI/LLM | Google AI Studio (Gemini) |
| Real-time | Spring WebSocket (STOMP over SockJS) |

---

## Out of Scope (Current Version)

The following features are excluded from the current release:
- Online payment gateway (payments are settled offline between renter and owner)
- Vehicle insurance management (owner's responsibility)
- Native iOS/Android mobile apps (responsive web app only)
- Vehicle telemetry / GPS hardware integration
- Email verification on registration (emailVerified flag is not enforced at login)
