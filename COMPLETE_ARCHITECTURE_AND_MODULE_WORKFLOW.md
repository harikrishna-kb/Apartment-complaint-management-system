# 🏢 Residential Society Complaint Management System (ApexHeights OS)
## Comprehensive Technical Architecture, Module Specifications & End-to-End Operational Workflow Manual

---

## 📑 Table of Contents
1. [Executive System Overview & Design Philosophy](#1-executive-system-overview--design-philosophy)
2. [High-Level Clean Architecture & Separation of Concerns](#2-high-level-clean-architecture--separation-of-concerns)
3. [Component & Layer Dependency Hierarchy](#3-component--layer-dependency-hierarchy)
4. [Exhaustive Module-by-Module Technical Breakdown](#4-exhaustive-module-by-module-technical-breakdown)
   - 4.1. [Configuration & Infrastructure Layer (`src/config/`)](#41-configuration--infrastructure-layer-srcconfig)
   - 4.2. [Domain Constants & Enums (`src/constants/`)](#42-domain-constants--enums-srcconstants)
   - 4.3. [Data Access & Services Layer (`src/services/`)](#43-data-access--services-layer-srcservices)
   - 4.4. [State Management & Context (`src/context/`)](#44-state-management--context-srccontext)
   - 4.5. [Application Logic & Custom Hooks (`src/hooks/`)](#45-application-logic--custom-hooks-srchooks)
   - 4.6. [Business Logic & Pure Utility Layer (`src/utils/`)](#46-business-logic--pure-utility-layer-srcutils)
   - 4.7. [Common Presentation Components (`src/components/common/`)](#47-common-presentation-components-srccomponentscommon)
   - 4.8. [Modal Dialogs & Controlled Forms (`src/components/forms/` & `src/components/modals/`)](#48-modal-dialogs--controlled-forms-srccomponentsforms--srccomponentsmodals)
   - 4.9. [Dashboard View Layer (`src/pages/`)](#49-dashboard-view-layer-srcpages)
   - 4.10. [Application Entrypoint & Routing (`src/App.jsx`, `src/main.jsx`, `src/index.css`)](#410-application-entrypoint--routing-srcappjsx-srcmainjsx-srcindexcss)
   - 4.11. [REST API Testing Bridge & Mock Server (`server/`)](#411-rest-api-testing-bridge--mock-server-server)
   - 4.12. [Automated Test Suites (`testing/` & Vitest)](#412-automated-test-suites-testing--vitest)
5. [End-to-End Operational Workflows & Lifecycles](#5-end-to-end-operational-workflows--lifecycles)
   - 5.1. [Authentication & Dynamic Role-Based Redirection Flow](#51-authentication--dynamic-role-based-redirection-flow)
   - 5.2. [Resident Complaint Intake & Speech-to-Text Workflow](#52-resident-complaint-intake--speech-to-text-workflow)
   - 5.3. [Admin Intake, Queue Triage & Field Technician Allocation Flow](#53-admin-intake-queue-triage--field-technician-allocation-flow)
   - 5.4. [Technician Repair Execution & Lifecycle Resolution Flow](#54-technician-repair-execution--lifecycle-resolution-flow)
   - 5.5. [Audit Timeline Telemetry & Print/PDF Reporting Flow](#55-audit-timeline-telemetry--printpdf-reporting-flow)
6. [Complete Data Models, Schemas & State Transitions](#6-complete-data-models-schemas--state-transitions)
7. [Automated Testing Specification & Locator Dictionary](#7-automated-testing-specification--locator-dictionary)
8. [Production Deployment, Security & Build Hardening](#8-production-deployment-security--build-hardening)

---

## 1. Executive System Overview & Design Philosophy

The **ApexHeights Smart Residency Complaint Management System (Facility Operations OS)** is an enterprise incident management and dispatch platform designed for residential gated communities. It unifies three distinct roles:

1. **Residents (Tenants & Unit Owners):** File categorized maintenance tickets, use hands-free Web Speech API dictation, track live SLA countdowns, and verify ticket lifecycle telemetry.
2. **Facility Administrators (Society Secretary):** Real-time command console providing live telemetry KPI ribbons, SLA breach tracking, category filtering, instant technician allocation, node library exploration, and formal print-ready audit generation.
3. **Field Technicians (Certified Specialists):** Dedicated work order terminal showing high-priority assigned tasks, location details (Tower & Flat), cost estimates, and one-tap work completion sign-off.

### Core Design Standards:
- **Strict Black & White Foundation**: Monochrome UI (`#fafafa` / `#000000`, neutral slate grays) inspired by high-density developer platforms like Linear and TwinSoft AI.
- **Frosted Glassmorphism**: Translucent panels (`backdrop-blur-xl`, `bg-white/80` and `bg-black/70`), subtle borders (`border-black/10` and `border-white/10`), and deep shadow depth.
- **Functional Semantic Accents Only**: High-contrast colors are strictly restricted to operational state badges (Emerald for resolved/online, Amber for pending/in-progress, Rose/Red for P1 critical issues and microphone recording).
- **Zero Mock / Demo Pollution**: No pre-filled passwords, demo chips, or mock account switchers on the first page.
- **Multi-Tool Automated Testing Readiness**: Every interactive element features deterministic `id` and `data-testid` attributes compatible with **Selenium WebDriver**, a dedicated **REST API bridge (`/api/*`)** for **Postman / Newman**, and pure unit test coverage with **Vitest**.

---

## 2. High-Level Clean Architecture & Separation of Concerns

The project adheres to strict **Clean Architecture / Layered Separation of Concerns (SoC)** principles. UI views never execute direct database queries or raw Firebase calls:

- **Presentation Layer (`src/pages/`, `src/components/`)**: Pure UI rendering and event handlers.
- **Application Logic Layer (`src/hooks/`, `src/context/`)**: State hydration, lifecycle subscriptions, and context distribution.
- **Service & Infrastructure Layer (`src/services/`, `src/config/`)**: Abstracted asynchronous API calls, Firestore queries, and fallback adapters.
- **Domain & Utilities Layer (`src/utils/`, `src/constants/`)**: Pure business logic rules, SLA calculators, validation routines, and immutable constants.

---

## 3. Component & Layer Dependency Hierarchy

```text
App.jsx (Root Routing & data-app-ready synchronization flag)
 ├── Navbar.jsx (ApexLogo monochrome brand, Search box, User Pill, Logout)
 ├── PublicLoginRoute
 │    └── LoginPage.jsx (B&W Glass dialog, Auth form, tab toggles, role selector)
 ├── ProtectedRoute [allowedRoles: RESIDENT]
 │    └── ResidentDashboard.jsx
 │         ├── TwinSoftTicketCard.jsx
 │         ├── CreateComplaintModal.jsx
 │         └── AuditHistoryModal.jsx
 ├── ProtectedRoute [allowedRoles: ADMIN]
 │    └── AdminDashboard.jsx
 │         ├── KPI Metric Counters
 │         ├── Filter Tabs (All, Pending, Assigned, Resolved, P1)
 │         ├── Table View / TwinSoftTicketCard Grid View
 │         ├── AssignStaffModal.jsx
 │         ├── AuditHistoryModal.jsx
 │         └── NodeLibraryModal.jsx
 └── ProtectedRoute [allowedRoles: TECHNICIAN]
      └── TechnicianDashboard.jsx
           ├── Telemetry Strip & Status Badges
           ├── Work Order Cards
           ├── Mark as Resolved Button
           └── AuditHistoryModal.jsx
```

---

## 4. Exhaustive Module-by-Module Technical Breakdown

### 4.1. Configuration & Infrastructure Layer (`src/config/`)

#### `src/config/firebase.js`
- **Purpose**: Initializes the modular Firebase v10 SDK (`initializeApp`, `getAuth`, `getFirestore`) and provides a zero-config local mock adapter fallback when live Firebase keys are not provisioned.
- **Key Exports**:
  - `auth`: Firebase Auth instance (or `null` if unconfigured).
  - `db`: Cloud Firestore database instance (or `null`).
  - `isLiveFirebaseConfigured`: Boolean flag checking if `import.meta.env.VITE_FIREBASE_API_KEY` is set.

---

### 4.2. Domain Constants & Enums (`src/constants/`)

#### `src/constants/roles.js`
- **Purpose**: Eliminates magic strings for user authorization across the system.
- **Constants**:
  - `USER_ROLES`: `{ RESIDENT: 'resident', ADMIN: 'admin', TECHNICIAN: 'technician' }`.

#### `src/constants/status.js`
- **Purpose**: Defines ticket lifecycles, priority levels, SLA target windows, and standard repair budget estimations.
- **Constants**:
  - `TICKET_STATUS`: `{ PENDING: 'Pending', ASSIGNED: 'Assigned', RESOLVED: 'Resolved' }`.
  - `TICKET_PRIORITY`: `P1_CRITICAL` ('P1 - Critical', 4h), `P2_HIGH` ('P2 - High', 12h), `P3_MODERATE` / `P3_MEDIUM` ('P3 - Moderate', 24h), `P4_LOW` ('P4 - Low', 48h).
  - `PRIORITY_SLA`: Maps priority to integer SLA hours (`{ 'P1 - Critical': 4, 'P2 - High': 12, 'P3 - Moderate': 24, 'P4 - Low': 48 }`).
  - `DEFAULT_COST_ESTIMATES`: Standard society maintenance cost estimates mapped by category.

#### `src/constants/categories.js`
- **Purpose**: Supported facility domain disciplines: `Plumbing`, `Electrical`, `HVAC & Lift`, `Structural`, `Security`.

---

### 4.3. Data Access & Services Layer (`src/services/`)

#### `src/services/authService.js`
- **Purpose**: Handles authentication operations, user registration, token hydration, and local session management.
- **Key Functions**:
  - `loginWithEmail(email, password)`: Attempts Firebase `signInWithEmailAndPassword`. If user does not exist in Firebase, checks `INITIAL_SEED_USERS` or localStorage fallback and provisions profile.
  - `registerResident({ name, email, password, flat_no, role })`: Registers a new user, hashes profile attributes into Firestore `/users/{uid}`, and sets role.
  - `logoutUser()`: Invokes Firebase `signOut`, purges cached local session, and alerts auth subscribers.
  - `subscribeAuthState(callback)`: Registers listener for `onAuthStateChanged` and local storage synchronization events.
  - `getCurrentUser()`: Returns synchronously hydrated user from active session storage.

#### `src/services/userService.js`
- **Purpose**: Read/write operations for user profiles and technician directory.
- **Key Functions**:
  - `fetchUserProfile(uid)`: Retrieves user profile (role, flat number, specialty) from Firestore collection `/users` or local persistence.
  - `getTechniciansList()`: Queries Firestore for all users with `role == 'technician'`. Automatically merges all 7 seed technicians (`ramesh@tech.com`, `suresh@tech.com`, etc.) to guarantee multi-discipline coverage.

#### `src/services/complaintService.js`
- **Purpose**: Full lifecycle management of maintenance complaints.
- **Key Functions**:
  - `createComplaint(complaintData)`: Generates a unique security token (`TKN-XXXXXX`) and ticket ID (`CMS-XXXX`), initializes step 1 in audit trail, and writes to Firestore `/complaints`.
  - `subscribeComplaintsByRole(user, onData, onError)`: Real-time listener:
    - If `admin`: Listens to entire complaint collection.
    - If `resident`: Listens with filter `where('resident.uid', '==', user.uid)`.
    - If `technician`: Listens with filter `where('technician.uid', '==', user.uid)`.
  - `assignTechnicianToComplaint(id, { techId, techName, costEstimate })`: Moves status to `Assigned`, stamps assignment timestamp, appends step 2 to timeline.
  - `markComplaintResolved(id)`: Moves status to `Resolved`, stamps resolution timestamp, records SLA performance status.
  - `submitComplaintFeedback(id, { rating, feedbackText })`: Stores resident rating (1-5 stars) and feedback comments.

---

### 4.4. State Management & Context (`src/context/`)

#### `src/context/AuthContext.jsx`
- **Purpose**: Top-level React context providing current session, user profile, role, and authentication dispatch functions.
- **Exposed Context**:
  - `user`: Authenticated user object `{ uid, email, name, role, flat_no }`.
  - `loading`: Boolean state indicating auth verification progress.
  - `login(email, password)`: Wraps `loginWithEmail`.
  - `register(data)`: Wraps `registerResident`.
  - `logout()`: Wraps `logoutUser`.

---

### 4.5. Application Logic & Custom Hooks (`src/hooks/`)

#### `src/hooks/useAuth.js`
- Simplifies access to `AuthContext`. Throws a descriptive error if accessed outside `AuthProvider`.

#### `src/hooks/useComplaints.js`
- Manages real-time complaint data fetching, listener unsubscription, loading states, and error handling for the active logged-in user.

#### `src/hooks/useTechnicians.js`
- Fetches registered field technicians for admin dispatch dropdowns and modal allocation lists.

---

### 4.6. Business Logic & Pure Utility Layer (`src/utils/`)

#### `src/utils/businessLogic.js`
- **Purpose**: Pure, deterministic functions decoupled from React and Firebase for automated unit testing with Vitest/Jest.
- **Key Functions**:
  1. `validateComplaintInput({ title, description, category })`:
     - Asserts title presence (min 5 chars).
     - Asserts description presence (min 10 chars).
     - Asserts category selection.
     - Returns `{ isValid: boolean, errors: string[] }`.
  2. `calculateSlaTarget(priority, createdAt, currentTime)`:
     - Calculates target deadline timestamp, remaining hours, and `isBreached: boolean`.
  3. `generateTokenNumber()`:
     - Generates security token `TKN-XXXXXX` and validates regex `^TKN-[0-9]{6}$`.
  4. `filterTickets(tickets, { searchQuery, statusFilter, priorityFilter })`:
     - Deterministic multi-attribute search across title, description, flat number, token number, ticket ID, and technician name.

#### `src/utils/businessLogic.test.js`
- **Purpose**: Vitest test suite executing 12 unit tests validating validation bounds, SLA targets, token regex, and ticket filtering. Run with `npm test`.

#### `src/utils/dateUtils.js`
- **Purpose**: Formats ISO and Firestore timestamps into clean human-readable and relative telemetry timestamps (`formatTimestamp`).

#### `src/utils/seedData.js`
- **Purpose**: Contains the system's baseline test accounts (1 Admin, 7 Technicians, 3 Residents) and pre-configured complaint tickets.

---

### 4.7. Common Presentation Components (`src/components/common/`)

#### `src/components/common/Navbar.jsx`
- **Features**:
  - Minimalist geometric monochrome `ApexLogo`.
  - Translucent frosted glass container (`backdrop-blur-xl bg-white/75 dark:bg-black/75`).
  - Search input box with keyboard shortcut hint (`⌘K`).
  - Active user identity pill showing user name, avatar initial, and capitalized role.
  - Sign Out action button.

#### `src/components/common/ProtectedRoute.jsx`
- **Features**:
  - Guards child routes against unauthorized access.
  - Renders minimalist monochrome spinner while verifying auth state.
  - Redirects unauthenticated visitors to `/login`.
  - Redirects authenticated users with mismatching roles to their appropriate dashboard (`/admin`, `/technician`, `/resident`).

#### `src/components/common/StatusBadge.jsx`
- **Features**:
  - Renders status indicators (`Pending`, `Assigned`, `Resolved`) with pulsing status pings.
  - Equipped with `data-testid="status-badge"` and `data-status="Pending|Assigned|Resolved"` for automated test selectors.
  - Also exports `PriorityBadge` with priority SLA colors.

#### `src/components/common/TelemetryStrip.jsx`
- **Features**:
  - Monospace telemetry display featuring token number, ticket ID, SLA window, and unit location.
  - One-click copy button for token number (`data-testid="token-number-badge"`).

#### `src/components/common/TwinSoftTicketCard.jsx`
- **Features**:
  - High-precision card view styled with frosted glassmorphism and crisp borders.
  - Category icon, title, 2-line truncated description, telemetry strip, and primary/secondary action buttons.
  - Equipped with `data-testid="ticket-card"` and `data-ticket-id="{id}"`.

#### `src/components/common/StarRatingWidget.jsx`
- **Features**:
  - Interactive 5-star rating widget with feedback comment input for resolved tickets.

---

### 4.8. Modal Dialogs & Controlled Forms (`src/components/forms/` & `src/components/modals/`)

#### `src/components/forms/CreateComplaintModal.jsx`
- **Features**:
  - Modal container stamped with `data-modal-open="true"` and `id="modal-close-btn"`.
  - Service Domain selector pills and native `<select id="ticket-category-select">`.
  - Priority selector pills with target SLA calculations (`id="ticket-priority-select"`).
  - Web Speech API integration: Microphone button enabling hands-free speech-to-text dictation directly into the description box.
  - Form validation with descriptive error container (`#auth-error-msg`).
  - Inputs tagged with `id="ticket-title-input"`, `id="ticket-desc-input"`, `id="ticket-submit-btn"`.

#### `src/components/forms/AssignStaffModal.jsx`
- **Features**:
  - Displays selected complaint summary and context.
  - Lists all available field technicians with their domain specialty tags.
  - Provides native `<select id="tech-select-{ticketId}">` and selection cards.
  - Cost/budget allocation input.
  - Confirm dispatch button: `id="assign-btn-{ticketId}"` and `data-testid="assign-submit-btn"`.

#### `src/components/modals/AuditHistoryModal.jsx`
- **Features**:
  - Complete 4-step chronological timeline:
    1. Ticket Lodged (Timestamp, resident identity, unit number).
    2. Dispatch & Staff Allocated (Assigned technician, specialty, cost estimate).
    3. Maintenance Work Execution (In-progress telemetry, SLA compliance).
    4. Sign-Off & Resolution (Resolved timestamp, completion notes).
  - Print button (`window.print()`) for generating official maintenance work orders.

#### `src/components/modals/NodeLibraryModal.jsx`
- **Features**:
  - High-density node browser exploring active facility nodes, telemetry channels, and available field specialists.

---

### 4.9. Dashboard View Layer (`src/pages/`)

#### `src/pages/LoginPage.jsx`
- **Features**:
  - Clean minimalist frosted glass dialog.
  - Left column: Facility metrics ribbon (7 Staff, 24/7 uptime, 4h SLA).
  - Right column: Segmented tab toggle (`Sign In` vs `Register Resident`).
  - Account Role selector (`id="login-role-select"`).
  - Controlled inputs (`login-email`, `login-password`) and submit button (`login-submit-btn`).
  - Zero demo chips or pre-filled credentials.
  - Immediate programmatic redirection upon successful authentication.

#### `src/pages/ResidentDashboard.jsx`
- **Features**:
  - Welcome banner showing unit flat number and active status.
  - Live metric cards: Total Lodged, In-Progress, Resolved repairs.
  - High-contrast black button: `+ Lodge New Maintenance Ticket` (`data-testid="btn-lodge-complaint"`).
  - Search bar and status filter tabs.
  - Grid of interactive `TwinSoftTicketCard` components.

#### `src/pages/AdminDashboard.jsx`
- **Features**:
  - Executive header with action buttons: `Node Library` and `Print Report`.
  - 4 KPI telemetry ribbons: Total Volume, Pending Triage, Active Repairs, Resolved.
  - Search bar and category selector dropdown.
  - Quick filter buttons: `data-testid="filter-tab-all"`, `filter-tab-pending"`, `filter-tab-resolved"`.
  - Toggle between Table View (with zebra striping and action columns) and Node Grid View.
  - Table rows stamped with `data-testid="ticket-card"` and `data-ticket-id="{id}"`.

#### `src/pages/TechnicianDashboard.jsx`
- **Features**:
  - High-contrast work order overview.
  - Quick counters for Active In-Progress vs Completed Repairs.
  - Ticket cards with resident details, flat number, and cost budget.
  - Action button: `Mark as Resolved` (`id="resolve-btn-{ticketId}"` and `data-testid="resolve-action-btn"`).

---

### 4.10. Application Entrypoint & Routing (`src/App.jsx`, `src/main.jsx`, `src/index.css`)

#### `src/App.jsx`
- **Features**:
  - Root container stamped with `data-app-ready="true"` once authentication hydration finishes.
  - Declares all routes:
    - `/login` $\rightarrow$ `PublicLoginRoute`
    - `/resident` $\rightarrow$ `ProtectedRoute [RESIDENT]`
    - `/admin` $\rightarrow$ `ProtectedRoute [ADMIN]`
    - `/technician` $\rightarrow$ `ProtectedRoute [TECHNICIAN]`
    - `/` $\rightarrow$ `RootRedirect` (intelligently routes to user's assigned dashboard)

#### `src/index.css`
- **Features**:
  - Dot matrix canvas pattern: `.bg-twinsoft-grid`.
  - Utility class: `.glass-card` (`backdrop-blur-xl`, subtle border, shadow).

---

### 4.11. REST API Testing Bridge & Mock Server (`server/`)

#### `server/apiHandler.js`
- **Purpose**: Pure Node HTTP request handler supporting REST API testing for Postman/Newman.
- **Endpoints Supported**:
  - `POST /api/auth/login`: Validates credentials; returns token and user role.
  - `GET /api/staff`: Returns list of technicians.
  - `GET /api/complaints`: Returns complaint list; supports query filters `?status=...&category=...`.
  - `POST /api/complaints`: Validates title/desc; creates ticket with `TKN-XXXXXX` and `CMS-XXXX`.
  - `PATCH /api/complaints/:id/assign`: Assigns technician and moves status to `Assigned`.
  - `PATCH /api/complaints/:id/resolve`: Moves status to `Resolved` with resolution timestamp.
  - `POST /api/test/reset`: Restores database to 4 users and 3 baseline complaints.

#### `server/testServer.js`
- **Purpose**: Standalone Node HTTP server running `apiHandler.js` independently for headless CI environments.

#### `server/seedReset.js`
- **Purpose**: CLI executable invoked via `npm run test:seed` to reset state to baseline.

---

### 4.12. Automated Test Suites (`testing/` & Vitest)

#### `testing/SocietyCMS.postman_collection.json`
- **Features**: Ready-to-import Postman v2.1.0 collection with 10 requests, environment variables (`{{baseUrl}}`, `{{authToken}}`), and embedded `pm.test` assertions.

#### `testing/selenium_test.py`
- **Features**: Automated Python Selenium WebDriver script testing synchronization, resident login, dashboard navigation, and badge verification.

---

## 5. End-to-End Operational Workflows & Lifecycles

### 5.1. Authentication & Dynamic Role-Based Redirection Flow

1. **Submission**: User inputs email and password on `/login`.
2. **Authentication**: `authService.loginWithEmail` authenticates against Firebase Auth (or fallback).
3. **Hydration**: Profile record fetched from `/users/{uid}` yields role (`admin`, `technician`, or `resident`).
4. **Immediate Programmatic Navigation**:
   - `admin` $\rightarrow$ Redirects instantly to `/admin`.
   - `technician` $\rightarrow$ Redirects instantly to `/technician`.
   - `resident` $\rightarrow$ Redirects instantly to `/resident`.
5. **Session Guarding**: If a logged-in user navigates directly to `/` or `/login`, `PublicLoginRoute` / `RootRedirect` detects the active session and routes them straight to their authorized portal without flash or stall.

---

### 5.2. Resident Complaint Intake & Speech-to-Text Workflow

1. Resident clicks `+ Lodge New Maintenance Ticket` (`btn-lodge-complaint`).
2. `CreateComplaintModal` opens (`data-modal-open="true"`).
3. Resident selects Domain Category (e.g., Plumbing) and Priority (e.g., P1 Critical).
4. Resident clicks `Voice Dictate`: Browser activates Web Speech API (`webkitSpeechRecognition`), converts spoken audio to text, and streams it into the description textarea.
5. Resident clicks `Dispatch Ticket` (`ticket-submit-btn`).
6. `complaintService.createComplaint` generates a unique security token (`TKN-749201`) and assigns status `Pending`.
7. Real-time Firestore listener pushes the new ticket instantly to both Resident and Admin dashboards.

---

### 5.3. Admin Intake, Queue Triage & Field Technician Allocation Flow

1. Admin views the Central Maintenance Console at `/admin`.
2. New complaint appears in real-time under the `Pending` filter tab (`filter-tab-pending`).
3. Admin clicks `Assign`: `AssignStaffModal` opens displaying the full specialist directory (7 staff across all trades).
4. Admin selects a qualified technician (e.g., `Ramesh Sharma - Lead Electrician`) and specifies cost budget.
5. Admin clicks `Confirm Allocation` (`assign-btn-{ticketId}`):
   - Complaint status transitions to `Assigned`.
   - Assignment timestamp and staff details are attached.
   - Complaint immediately appears on Ramesh Sharma's `/technician` console.

---

### 5.4. Technician Repair Execution & Lifecycle Resolution Flow

1. Technician logs into `/technician` (e.g., `ramesh@tech.com` / `password123`).
2. Views assigned job card showing unit location (`Tower A • Flat A-104`), issue description, and SLA target.
3. Upon completing physical repair, technician clicks `Mark as Resolved` (`resolve-btn-{ticketId}`).
4. `complaintService.markComplaintResolved` updates status to `Resolved` and records resolution timestamp.
5. Resident dashboard updates with green `Resolved` badge, and prompts resident for 1-5 star quality rating.

---

### 5.5. Audit Timeline Telemetry & Print/PDF Reporting Flow

1. Any user clicks `Step Audit` / `Inspect Lifecycle` on a ticket card.
2. `AuditHistoryModal` displays a complete chronological step trail:
   - Step 1: Ticket Lodged (Timestamp, resident identity, unit number).
   - Step 2: Dispatch & Staff Allocated (Assigned technician, specialty, cost estimate).
   - Step 3: Maintenance Work Execution (In-progress telemetry, SLA compliance).
   - Step 4: Sign-Off & Resolution (Resolved timestamp, completion notes).
3. Clicking `Print PDF` executes `window.print()` using print-optimized CSS to generate official hardcopy job sheets.

---

## 6. Complete Data Models, Schemas & State Transitions

### A. User Entity (`users` collection)
```typescript
interface User {
  uid: string;                 // Unique identifier (e.g., "tech_user_001")
  email: string;               // User email (e.g., "ramesh@tech.com")
  name: string;                // Full name (e.g., "Ramesh Sharma")
  role: 'admin' | 'technician' | 'resident';
  flat_no?: string | null;     // Flat number if resident (e.g., "A-104")
  tower?: string | null;       // Tower name (e.g., "Tower A")
  specialty?: string | null;   // Field specialty if technician
  createdAt: string;           // ISO timestamp
}
```

### B. Complaint Entity (`complaints` collection)
```typescript
interface Complaint {
  id: string;                  // Firestore document ID
  ticketId: string;            // Human-readable code (e.g., "CMS-1041")
  tokenNumber: string;         // Security verification token (e.g., "TKN-749201")
  title: string;               // Issue summary
  description: string;         // Detailed description
  category: 'Plumbing' | 'Electrical' | 'HVAC & Lift' | 'Structural' | 'Security';
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Moderate' | 'P4 - Low';
  status: 'Pending' | 'Assigned' | 'Resolved';
  slaHours: number;            // 4, 12, 24, or 48 hours
  costEstimate: string;        // E.g., "₹350 (Parts/Labor)" or "Society Covered"
  location: {
    tower: string;             // E.g., "Tower A"
    flatNo: string;            // E.g., "A-104"
  };
  resident: {
    uid: string;
    name: string;
    flatNo: string;
  };
  technician: {
    uid: string | null;
    name: string | null;
    assignedAt: string | null;
  };
  rating?: number | null;      // 1 to 5 stars
  feedbackText?: string | null;
  createdAt: string;           // ISO timestamp
  resolvedAt?: string | null;  // ISO timestamp
}
```

### C. Ticket State Transition Finite Machine
```text
[User Lodges Request]
         │
         ▼
    ┌─────────┐
    │ PENDING │ ◄── Admin Triage Queue (Unallocated)
    └────┬────┘
         │
         │ Admin assigns technician
         ▼
   ┌──────────┐
   │ ASSIGNED │ ◄── Field Specialist Console (Active Work Order)
   └─────┬────┘
         │
         │ Technician marks resolved
         ▼
   ┌──────────┐
   │ RESOLVED │ ◄── Completed (Resident Star Rating & Feedback Enabled)
   └──────────┘
```

---

## 7. Automated Testing Specification & Locator Dictionary

### Complete Element Locators Table

| Target UI Element | HTML `id` | `data-testid` | Suggested Tool |
|---|---|---|---|
| **Root Sync Flag** | `app-root` | `data-app-ready="true"` | Selenium WebDriver |
| **Sign In Tab** | `tab-login` | `tab-login` | Selenium / Cypress |
| **Register Tab** | `tab-register` | `tab-register` | Selenium / Cypress |
| **Login Email** | `login-email` | `login-email-input` | Selenium / Cypress |
| **Login Password** | `login-password` | `login-password-input` | Selenium / Cypress |
| **Login Role Select**| `login-role-select` | `login-role-select` | Selenium / Cypress |
| **Login Submit** | `login-submit-btn` | `login-submit-btn` | Selenium / Cypress |
| **Auth Error Box** | `auth-error-msg` | `auth-error-msg` | Selenium / Cypress |
| **Modal Open Flag** | — | `data-modal-open="true"`| Selenium WebDriver |
| **Modal Close Button**| `modal-close-btn`| `modal-close-btn` | Selenium / Cypress |
| **Ticket Title** | `ticket-title-input`| `ticket-title-input` | Selenium / Cypress |
| **Ticket Category** | `ticket-category-select`| `ticket-category-select`| Selenium / Cypress |
| **Ticket Priority** | `ticket-priority-select`| `ticket-priority-select`| Selenium / Cypress |
| **Ticket Description**| `ticket-desc-input` | `ticket-desc-input` | Selenium / Cypress |
| **Ticket Submit** | `ticket-submit-btn`| `ticket-submit-btn` | Selenium / Cypress |
| **Ticket Card** | — | `ticket-card` | Selenium / Cypress |
| **Status Badge** | — | `status-badge` | Selenium / Cypress |
| **Token Badge** | — | `token-number-badge`| Selenium / Cypress |
| **Filter Tab: All** | — | `filter-tab-all` | Selenium / Cypress |
| **Filter Tab: Pending**| — | `filter-tab-pending` | Selenium / Cypress |
| **Filter Tab: Resolved**| — | `filter-tab-resolved`| Selenium / Cypress |
| **Staff Select** | `tech-select-{ticketId}`| `tech-select` | Selenium / Cypress |
| **Confirm Assign** | `assign-btn-{ticketId}`| `assign-submit-btn` | Selenium / Cypress |
| **Resolve Button** | `resolve-btn-{ticketId}`| `resolve-action-btn`| Selenium / Cypress |

### Test Commands
```bash
# 1. Run Unit Tests (12 tests)
npm test

# 2. Reset Test Environment (4 users, 3 tickets)
npm run test:seed

# 3. Newman CLI REST API Suite
npx newman run testing/SocietyCMS.postman_collection.json --env-var "baseUrl=http://localhost:5173"

# 4. Selenium E2E Automation
python testing/selenium_test.py
```

---

## 8. Production Deployment, Security & Build Hardening

### Production Build Verification
- **Disabled Source Maps**: Prevents raw JSX files, business logic, and comments from appearing in browser DevTools Sources (`sourcemap: false` in `vite.config.js`).
- **Rollup Chunk Splitting**: Bundles React, Firebase, and Framer Motion into separate cacheable vendor chunks.
- **Run Build Check**:
  ```bash
  npm run build
  ```
  Result: Clean compilation with 0 errors (`dist/` directory generated).

### Hosting on Vercel / Netlify
Add a standard SPA rewrite in `vercel.json` to route all URL paths to `/index.html`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

*Authored for ApexHeights Smart Residency Incident Operations System • Production Ready*
