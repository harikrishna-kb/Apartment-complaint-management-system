# 🏢 Residential Society Complaint Management System
> **Clean Architecture & Multi-Tool Testing Automated Suite (React + Vite + Tailwind + Firebase/REST)**

An enterprise operations and incident tracking ecosystem connecting residents, facility management, and certified technical specialists. Built with **React 18 + Vite**, **Tailwind CSS**, **Framer Motion**, and a modular **Firebase / REST Test Bridge**. Hardened for automated testing across **Selenium WebDriver**, **Postman / Newman**, and **Vitest / Jest**.

---

## 📚 Complete Master Reference Documents
- **Complete Architecture, Modules & Workflow Manual:** [COMPLETE_ARCHITECTURE_AND_MODULE_WORKFLOW.md](COMPLETE_ARCHITECTURE_AND_MODULE_WORKFLOW.md)
- **Comprehensive Guide with Credentials & Test Locators:** [TESTING_AND_CREDENTIALS.md](TESTING_AND_CREDENTIALS.md)
- **Selenium & Newman Step-by-Step Execution Guide:** [TESTING_GUIDE.md](TESTING_GUIDE.md)

---

## 🔑 Quick Login Directory

Universal Password for all test accounts: **`password123`**

### 🛠️ Technical Staff (Technicians)
| Technician Name | Specialty / Domain | Email ID | Password | Portal |
|---|---|---|---|---|
| **Ramesh Sharma** | Lead Electrician | `ramesh@tech.com` | `password123` | `/technician` |
| **Suresh Nair** | Senior Plumber | `suresh@tech.com` | `password123` | `/technician` |
| **Vikram Singh** | HVAC & Elevator Specialist | `vikram@tech.com` | `password123` | `/technician` |
| **Anil Deshmukh** | Structural & Masonry Expert | `anil@tech.com` | `password123` | `/technician` |
| **Pooja Verma** | Facility & Security Supervisor | `pooja@tech.com` | `password123` | `/technician` |
| **Mohammed Rafiq** | Carpentry & Door Hardware | `rafiq@tech.com` | `password123` | `/technician` |
| **Deepak Joshi** | Water Treatment & Pump Operations | `deepak@tech.com` | `password123` | `/technician` |

### 👔 Administrator & Resident
| Role | Name | Email ID | Password | Portal |
|---|---|---|---|---|
| **Admin** | Society Secretary | `admin@society.com` | `password123` | `/admin` |
| **Resident** | Rohit (Flat A-104) | `rohit@society.com` | `password123` | `/resident` |
| **Resident** | Dr. Arvind Sharma (A-101) | `resident1@flat.com` | `password123` | `/resident` |

---

## ⚡ Quick Start & Testing Commands

```powershell
# 1. Install Dependencies
npm install

# 2. Start Application + REST API (http://localhost:5173)
npm run dev

# 3. Run Pure Unit Tests (Vitest)
npm test

# 4. Reset Test Environment to Baseline (4 users, 3 tickets)
npm run test:seed

# 5. Run Postman / Newman Automated REST API Test Suite
npx newman run testing/SocietyCMS.postman_collection.json --env-var "baseUrl=http://localhost:5173"

# 6. Run Selenium WebDriver UI End-to-End Test (Python)
python testing/selenium_test.py

# 7. Production Build Check
npm run build
```

---

## 🚀 Deployment to Vercel

1. **Push to GitHub:**
   ```powershell
   git init
   git add .
   git commit -m "feat: complete society complaint management system"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```
2. **Import into Vercel:**
   - Go to [vercel.com](https://vercel.com) and click **"Add New..."** &rarr; **"Project"**.
   - Select your newly pushed GitHub repository.
   - **Framework Preset**: Vite (detected automatically).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. **Click "Deploy"**:
   - The included [`vercel.json`](vercel.json) automatically handles SPA rewrites so refreshing on `/resident`, `/admin`, or `/technician` works smoothly without 404 errors.

---

## 🏛️ Project Directory Structure

```text
testing project/
├── TESTING_AND_CREDENTIALS.md     # Master documentation with all locators & credentials
├── TESTING_GUIDE.md               # Selenium & Newman execution instructions
├── testing/
│   ├── SocietyCMS.postman_collection.json # 10 API requests with test assertions
│   └── selenium_test.py          # Complete Python Selenium WebDriver test script
├── server/
│   ├── apiHandler.js             # Dedicated REST Test API bridge handler
│   ├── testServer.js             # Standalone Node HTTP server for CI
│   └── seedReset.js              # Database reset & seed CLI script
├── src/
│   ├── utils/
│   │   ├── businessLogic.js      # Pure validation, SLA, token regex & filtering logic
│   │   └── businessLogic.test.js # Vitest test suite (12/12 passing)
│   ├── pages/                    # Dashboards with deterministic data-testid attributes
│   └── components/               # Frosted glassmorphic minimalist components
```
