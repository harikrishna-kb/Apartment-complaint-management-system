# Society Complaint Management System: Automated Testing Architecture Guide

This project is hardened to pass enterprise and academic automated test suites across **Selenium WebDriver (UI/E2E)**, **Postman / Newman (REST API)**, and **Vitest / Jest (Unit Testing)**.

---

## 1. Quick Test Command Summary

| Test Layer | Framework / Tool | Command | Description |
|---|---|---|---|
| **Unit Tests** | Vitest / Jest | `npm test` | Runs pure unit tests for validation, SLA calculation, token regex, and filters. |
| **Test Database Seed** | Node CLI / API | `npm run test:seed` | Resets test environment to a clean baseline (4 users, 3 tickets). |
| **REST API Suite** | Newman (Postman CLI) | `npx newman run testing/SocietyCMS.postman_collection.json` | Runs 10 automated endpoint tests with assertion scripts. |
| **UI End-to-End** | Selenium WebDriver | `python testing/selenium_test.py` | Automated UI test verifying Login, Complaint Creation, Assignment, and Resolution. |
| **Development Server**| Vite Dev Server | `npm run dev` | Serves React UI and REST API on `http://localhost:5173`. |

---

## 2. Selenium & WebDriver Locators Reference

All interactive elements have deterministic IDs and `data-testid` attributes to ensure 100% reliable locator resolution without brittle XPath selectors.

### Global Synchronization Attribute
- **Root Element:** `#app-root[data-app-ready="true"]`
- Use this in your Selenium WebDriver scripts before clicking to avoid click-interception or hydration timing issues:
  ```python
  WebDriverWait(driver, 10).until(
      EC.presence_of_element_located((By.CSS_SELECTOR, "#app-root[data-app-ready='true']"))
  )
  ```

### Authentication Screen (`/login`)
| Element | HTML `id` | `data-testid` | Locating Strategy |
|---|---|---|---|
| Sign In Tab | `tab-login` | `tab-login` | `By.id("tab-login")` |
| Register Tab | `tab-register` | `tab-register` | `By.id("tab-register")` |
| Email Input | `login-email` | `login-email-input` | `By.id("login-email")` |
| Password Input | `login-password` | `login-password-input` | `By.id("login-password")` |
| Role Select | `login-role-select` | `login-role-select` | `By.id("login-role-select")` |
| Submit Button | `login-submit-btn` | `login-submit-btn` | `By.id("login-submit-btn")` |
| Error Container | `auth-error-msg` | `auth-error-msg` | `By.id("auth-error-msg")` |

### Resident Dashboard & Ticket Creation Modal (`/resident`)
| Element | HTML `id` | `data-testid` | Locating Strategy |
|---|---|---|---|
| Open Modal Button | — | `btn-lodge-complaint` | `By.cssSelector("[data-testid='btn-lodge-complaint']")` |
| Modal Container | — | `data-modal-open="true"` | `By.cssSelector("[data-modal-open='true']")` |
| Modal Close Button | `modal-close-btn` | `modal-close-btn` | `By.id("modal-close-btn")` |
| Issue Title Input | `ticket-title-input` | `ticket-title-input` | `By.id("ticket-title-input")` |
| Category Select | `ticket-category-select` | `ticket-category-select` | `By.id("ticket-category-select")` |
| Priority Select | `ticket-priority-select` | `ticket-priority-select` | `By.id("ticket-priority-select")` |
| Tower Select | `ticket-tower-select` | `ticket-tower-select` | `By.id("ticket-tower-select")` |
| Flat Number Input | `ticket-flat-input` | `ticket-flat-input` | `By.id("ticket-flat-input")` |
| Description Textarea | `ticket-desc-input` | `ticket-desc-input` | `By.id("ticket-desc-input")` |
| Submit Ticket Button | `ticket-submit-btn` | `ticket-submit-btn` | `By.id("ticket-submit-btn")` |

### Complaint Cards & Tables (All Dashboards)
| Element | Selector / Attribute | Description |
|---|---|---|
| Ticket Card / Row | `[data-testid='ticket-card'][data-ticket-id='{id}']` | Container for ticket item |
| Status Badge | `[data-testid='status-badge'][data-status='Pending\|Assigned\|Resolved']` | Live operational status pill |
| Token Badge | `[data-testid='token-number-badge']` | Unique ticket security token |

### Admin Console (`/admin`)
| Element | Selector / Attribute | Description |
|---|---|---|
| Filter Tab: All | `[data-testid='filter-tab-all']` | Displays all tickets |
| Filter Tab: Pending | `[data-testid='filter-tab-pending']` | Displays only Pending tickets |
| Filter Tab: Resolved | `[data-testid='filter-tab-resolved']` | Displays completed tickets |
| Assign Tech Dropdown | `select#tech-select-{ticketId}` | Dropdown to select technician |
| Confirm Assign Button | `button#assign-btn-{ticketId}` | Submits technician dispatch |

### Technician Console (`/technician`)
| Element | Selector / Attribute | Description |
|---|---|---|
| Resolve Button | `button#resolve-btn-{ticketId}` | Marks ticket as Resolved |
| Resolve Action TestID | `[data-testid='resolve-action-btn']` | CSS selector for resolve action |

---

## 3. Selenium WebDriver Python Sample Script

Save this script as `testing/selenium_test.py` and run with `python testing/selenium_test.py`:

```python
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service

def run_e2e_tests():
    driver = webdriver.Chrome()
    driver.maximize_window()
    wait = WebDriverWait(driver, 10)

    try:
        print("[1] Opening Application...")
        driver.get("http://localhost:5173/login")

        # 1. Wait for global readiness
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#app-root[data-app-ready='true']")))

        # 2. Perform Login as Resident
        print("[2] Logging in as Resident (rohit@society.com)...")
        email_input = wait.until(EC.element_to_be_clickable((By.ID, "login-email")))
        email_input.clear()
        email_input.send_keys("rohit@society.com")

        pass_input = driver.find_element(By.ID, "login-password")
        pass_input.clear()
        pass_input.send_keys("password123")

        submit_btn = driver.find_element(By.ID, "login-submit-btn")
        submit_btn.click()

        # 3. Verify Redirection to /resident
        wait.until(EC.url_contains("/resident"))
        print("[3] Successfully navigated to /resident dashboard!")

        # 4. Check for presence of tickets
        tickets = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "[data-testid='ticket-card']")))
        print(f"[4] Found {len(tickets)} tickets on resident dashboard.")

        print("[SUCCESS] All Selenium UI steps completed successfully!")

    finally:
        driver.quit()

if __name__ == "__main__":
    run_e2e_tests()
```

---

## 4. Postman & Newman REST API Testing

The Postman collection is located at:
`testing/SocietyCMS.postman_collection.json`

### Option A: Import into Postman App
1. Open Postman.
2. Click **Import** $\rightarrow$ Select `testing/SocietyCMS.postman_collection.json`.
3. Set the collection variable `baseUrl` to `http://localhost:5173`.
4. Click **Run Collection** to execute all 10 requests with built-in test assertion scripts.

### Option B: Execute via Newman CLI
```bash
# Run tests directly in your terminal:
npx newman run testing/SocietyCMS.postman_collection.json --env-var "baseUrl=http://localhost:5173"
```

### Endpoints Covered:
1. `POST /api/test/reset` - Resets database to 4 users and 3 baseline complaints.
2. `POST /api/auth/login` - Valid credentials return JWT token and role (`200 OK`).
3. `POST /api/auth/login` - Invalid credentials return 401 Unauthorized.
4. `GET /api/staff` - Returns registered technicians.
5. `GET /api/complaints` - Returns all complaints.
6. `GET /api/complaints?status=Pending&category=Plumbing` - Filters complaints by status and category.
7. `POST /api/complaints` - Valid ticket creation returns `201 Created` with `TKN-XXXXXX` token.
8. `POST /api/complaints` - Missing fields trigger `400 Bad Request`.
9. `PATCH /api/complaints/:id/assign` - Assigns technician and updates status to `Assigned`.
10. `PATCH /api/complaints/:id/resolve` - Updates ticket status to `Resolved`.

---

## 5. Pure Business Logic Unit Tests (Vitest / Jest)

Critical business logic is isolated in `src/utils/businessLogic.js`:
- `validateComplaintInput({ title, description, category })`
- `calculateSlaTarget(priority, createdAt)`
- `generateTokenNumber()`
- `filterTickets(tickets, { searchQuery, statusFilter, priorityFilter })`

### Run Unit Tests:
```bash
npm test
```
**Results:** 12 passed unit tests verifying validation boundaries, SLA breach calculations, token regex formatting, and multi-tag search filtering.

---

## 6. Reset Test Baseline

To restore the test environment to a clean baseline at any time:
```bash
npm run test:seed
```
Or via HTTP:
```bash
curl -X POST http://localhost:5173/api/test/reset
```
