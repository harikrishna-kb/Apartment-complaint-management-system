# 🏢 Society Complaint Management System: Comprehensive Master Reference Guide

An enterprise-grade, minimalist glassmorphic **Incident & Complaint Operations Platform** built with **React 18 + Vite**, **Tailwind CSS**, **Framer Motion**, and a modular **Firebase / REST Test Bridge**. Hardened for multi-tool automated testing across **Selenium WebDriver**, **Postman / Newman**, and **Vitest / Jest**.

---

## 📋 Table of Contents
1. [User Accounts & Staff Directory (Emails & Passwords)](#1-user-accounts--staff-directory-emails--passwords)
2. [Automated Testing Architecture & Commands](#2-automated-testing-architecture--commands)
3. [Selenium WebDriver Testing & DOM Locators](#3-selenium-webdriver-testing--dom-locators)
4. [Postman & Newman REST Test API](#4-postman--newman-rest-test-api)
5. [Pure Business Logic Unit Testing (Vitest)](#5-pure-business-logic-unit-testing-vitest)
6. [Database Reset & Seed Hooks](#6-database-reset--seed-hooks)
7. [UI Design Standard & Architecture](#7-ui-design-standard--architecture)

---

## 1. User Accounts & Staff Directory (Emails & Passwords)

All accounts are pre-seeded with the universal testing password: **`password123`**.

### 🛠️ Technical Staff / Field Specialists (Technicians)
Logging into any of these accounts automatically redirects directly to **`/technician`**.

| # | Technician Name | Specialty / Domain | Email Address | Password | UID |
|---|---|---|---|---|---|
| 1 | **Ramesh Sharma** | Lead Electrician (High Voltage & Wiring) | `ramesh@tech.com` | `password123` | `tech_user_001` |
| 2 | **Suresh Nair** | Senior Plumber (Pumps, Pipes & Sanitation) | `suresh@tech.com` | `password123` | `tech_user_002` |
| 3 | **Vikram Singh** | HVAC & Elevator Specialist (Lift Operations) | `vikram@tech.com` | `password123` | `tech_user_003` |
| 4 | **Anil Deshmukh** | Structural & Masonry Expert (Civil Maintenance) | `anil@tech.com` | `password123` | `tech_user_004` |
| 5 | **Pooja Verma** | Facility & Security Supervisor (Gate & Cameras) | `pooja@tech.com` | `password123` | `tech_user_005` |
| 6 | **Mohammed Rafiq** | Carpentry & Door Hardware Specialist (Locks) | `rafiq@tech.com` | `password123` | `tech_user_006` |
| 7 | **Deepak Joshi** | Water Treatment & Pump Operations Engineer | `deepak@tech.com` | `password123` | `tech_user_007` |

### 👔 Administrator & Secretary
Logging into this account automatically redirects to **`/admin`**.

| Name | Role | Email Address | Password | Permissions |
|---|---|---|---|---|
| **Society Secretary (Admin)** | `admin` | `admin@society.com` | `password123` | Full dispatch console, assign technicians, inspect telemetry, print reports. |

### 🏠 Resident Accounts
Logging into these accounts automatically redirects to **`/resident`**.

| Resident Name | Flat / Unit | Tower | Email Address | Password |
|---|---|---|---|---|
| **Rohit** | Flat A-104 | Tower A | `rohit@society.com` | `password123` |
| **Dr. Arvind Sharma** | Flat A-101 | Tower A | `resident1@flat.com` | `password123` |
| **Priya Nair** | Flat B-204 | Tower B | `resident2@flat.com` | `password123` |

---

## 2. Automated Testing Architecture & Commands

Run all tests directly from PowerShell in `C:\Users\kbhar\Desktop\testing project`:

```powershell
# 1. Run pure unit test suite (Vitest)
npm test

# 2. Reset database and state to known baseline
npm run test:seed

# 3. Start development server + REST API bridge
npm run dev

# 4. Run Newman REST API collection test
npx newman run testing/SocietyCMS.postman_collection.json --env-var "baseUrl=http://localhost:5173"

# 5. Run Selenium WebDriver end-to-end UI test
python testing/selenium_test.py

# 6. Check production build
npm run build
```

---

## 3. Selenium WebDriver Testing & DOM Locators

Every interactive element features deterministic HTML `id` and `data-testid` attributes.

### A. Global Synchronization Attribute
- **Root Element:** `#app-root[data-app-ready="true"]`
- **Purpose:** Eliminates race conditions and click-interception by ensuring Firebase auth hydration and session resolution have fully completed before script execution begins.
- **Python WebDriver Example:**
  ```python
  WebDriverWait(driver, 10).until(
      EC.presence_of_element_located((By.CSS_SELECTOR, "#app-root[data-app-ready='true']"))
  )
  ```

### B. Locators Table

| Page / Component | Element Description | HTML `id` | `data-testid` | Suggested Locator |
|---|---|---|---|---|
| **Auth Screen** | Sign In Tab | `tab-login` | `tab-login` | `By.id("tab-login")` |
| **Auth Screen** | Register Tab | `tab-register` | `tab-register` | `By.id("tab-register")` |
| **Auth Screen** | Email Input | `login-email` | `login-email-input` | `By.id("login-email")` |
| **Auth Screen** | Password Input | `login-password` | `login-password-input` | `By.id("login-password")` |
| **Auth Screen** | Role Select | `login-role-select` | `login-role-select` | `By.id("login-role-select")` |
| **Auth Screen** | Submit Button | `login-submit-btn` | `login-submit-btn` | `By.id("login-submit-btn")` |
| **Auth Screen** | Error Banner | `auth-error-msg` | `auth-error-msg` | `By.id("auth-error-msg")` |
| **Resident Modal** | Modal Backdrop / Dialog | — | `data-modal-open="true"` | `By.cssSelector("[data-modal-open='true']")` |
| **Resident Modal** | Close Button | `modal-close-btn` | `modal-close-btn` | `By.id("modal-close-btn")` |
| **Resident Modal** | Issue Title Input | `ticket-title-input` | `ticket-title-input` | `By.id("ticket-title-input")` |
| **Resident Modal** | Category Select | `ticket-category-select` | `ticket-category-select` | `By.id("ticket-category-select")` |
| **Resident Modal** | Priority Select | `ticket-priority-select` | `ticket-priority-select` | `By.id("ticket-priority-select")` |
| **Resident Modal** | Tower Select | `ticket-tower-select` | `ticket-tower-select` | `By.id("ticket-tower-select")` |
| **Resident Modal** | Flat Number Input | `ticket-flat-input` | `ticket-flat-input` | `By.id("ticket-flat-input")` |
| **Resident Modal** | Description Textarea | `ticket-desc-input` | `ticket-desc-input` | `By.id("ticket-desc-input")` |
| **Resident Modal** | Submit Ticket Button | `ticket-submit-btn` | `ticket-submit-btn` | `By.id("ticket-submit-btn")` |
| **All Dashboards** | Ticket Container / Row | — | `ticket-card` | `By.cssSelector("[data-testid='ticket-card']")` |
| **All Dashboards** | Status Badge | — | `status-badge` | `By.cssSelector("[data-testid='status-badge']")` |
| **All Dashboards** | Token Badge | — | `token-number-badge` | `By.cssSelector("[data-testid='token-number-badge']")` |
| **Admin Console** | Filter Tab: All | — | `filter-tab-all` | `By.cssSelector("[data-testid='filter-tab-all']")` |
| **Admin Console** | Filter Tab: Pending | — | `filter-tab-pending` | `By.cssSelector("[data-testid='filter-tab-pending']")` |
| **Admin Console** | Filter Tab: Resolved| — | `filter-tab-resolved` | `By.cssSelector("[data-testid='filter-tab-resolved']")` |
| **Admin Console** | Staff Select Dropdown | `tech-select-{ticketId}` | `tech-select` | `By.id("tech-select-{id}")` |
| **Admin Console** | Confirm Assign Button| `assign-btn-{ticketId}` | `assign-submit-btn` | `By.id("assign-btn-{id}")` |
| **Tech Console** | Resolve Ticket Button | `resolve-btn-{ticketId}` | `resolve-action-btn` | `By.id("resolve-btn-{id}")` |

### C. Complete Python Selenium Script
Located at: **`testing/selenium_test.py`**
Run with:
```powershell
python testing/selenium_test.py
```

---

## 4. Postman & Newman REST Test API

A dedicated REST API runs natively inside the Vite development server on `http://localhost:5173/api/*` and as a standalone server in `server/testServer.js`.

### Postman Collection File
Path: **`testing/SocietyCMS.postman_collection.json`**

### Collection Requests & Test Assertions:
1. **`POST /api/test/reset`**
   - Resets state to 4 users and 3 baseline complaints.
   - Assertions: `200 OK`, `baseline.complaints == 3`, `baseline.users == 4`.
2. **`POST /api/auth/login` (Valid Credentials)**
   - Body: `{"email": "rohit@society.com", "password": "password123"}`
   - Assertions: `200 OK`, returns JWT token, `role == 'resident'`.
3. **`POST /api/auth/login` (Bad Credentials)**
   - Body: `{"email": "rohit@society.com", "password": "wrong"}`
   - Assertions: `401 Unauthorized`, `success == false`.
4. **`GET /api/staff`**
   - Assertions: `200 OK`, returns array with at least 2 technicians.
5. **`GET /api/complaints`**
   - Assertions: `200 OK`, returns array of active complaints.
6. **`GET /api/complaints?status=Pending&category=Plumbing`**
   - Assertions: `200 OK`, all returned objects match query parameters.
7. **`POST /api/complaints` (Valid Creation)**
   - Body: `{ "title": "Leak in valve", "description": "Continuous water drip in kitchen cabinet", "category": "Plumbing", "priority": "P1 - Critical", "flatNo": "A-104" }`
   - Assertions: `201 Created`, token matches regex `^TKN-[0-9]{6}$`, status is `'Pending'`.
8. **`POST /api/complaints` (Validation Failure)**
   - Body: `{ "title": "", "description": "" }`
   - Assertions: `400 Bad Request`, error message contains `'Validation failed'`.
9. **`PATCH /api/complaints/:id/assign`**
   - Body: `{ "technicianId": "tech_user_001", "technicianName": "Ramesh Sharma" }`
   - Assertions: `200 OK`, status updated to `'Assigned'`.
10. **`PATCH /api/complaints/:id/resolve`**
    - Assertions: `200 OK`, status updated to `'Resolved'`, resolved timestamp present.

### Run with Newman CLI:
```powershell
npx newman run testing/SocietyCMS.postman_collection.json --env-var "baseUrl=http://localhost:5173"
```

---

## 5. Pure Business Logic Unit Testing (Vitest)

Domain validation rules and algorithms are isolated in **`src/utils/businessLogic.js`**:
- `validateComplaintInput({ title, description, category })`: Returns validation flag and descriptive error array.
- `calculateSlaTarget(priority, createdAt, currentTime)`: Computes SLA deadline, remaining hours, and breach state.
- `generateTokenNumber()`: Generates and asserts regex compliance with `^TKN-[0-9]{6}$`.
- `filterTickets(tickets, { searchQuery, statusFilter, priorityFilter })`: Performs deterministic multi-attribute filtering.

### Run Unit Tests:
```powershell
npm test
```
**Results:** **12 / 12 unit tests passing** (`src/utils/businessLogic.test.js`).

---

## 6. Database Reset & Seed Hooks

To ensure repeatable and deterministic automated testing runs, execute the baseline reset at any time:

### Via Node CLI:
```powershell
npm run test:seed
```

### Via HTTP REST:
```powershell
curl -X POST http://localhost:5173/api/test/reset
```

### Baseline State Created:
- **Users (4):**
  - Admin: `admin@society.com`
  - Technicians: `ramesh@tech.com`, `suresh@tech.com`
  - Resident: `rohit@society.com`
- **Complaints (3):**
  - `CMS-1001` (Status: `Pending`, Plumbing, P1 Critical)
  - `CMS-1002` (Status: `Assigned` to Ramesh Sharma, Electrical, P2 High)
  - `CMS-1003` (Status: `Resolved`, Plumbing, P3 Moderate)

---

## 7. UI Design Standard & Architecture

- **Minimalist Aesthetic + Frosted Glassmorphism**:
  - `backdrop-blur-xl`, subtle translucent borders (`border-black/10 dark:border-white/10`), shadow elevation.
  - Dot matrix canvas pattern (`.bg-twinsoft-grid`).
- **Strict Black & White Foundation**:
  - Pure monochrome buttons, headers, inputs, and cards.
  - High contrast typography for readability.
- **Functional Semantic Colors Only**:
  - Emerald strictly for resolved tickets and uptime indicators.
  - Amber strictly for pending tickets and unassigned flags.
  - Rose / Red strictly for critical P1 priority and mic recording states.
- **Zero Mock / Demo Pollution**:
  - The login view contains no demo chips, pre-filled forms, or mock switchers.
  - Routing handles instant redirection to the authorized dashboard on mount and post-login.
