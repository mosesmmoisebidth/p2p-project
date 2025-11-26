# Smart Procure-to-Pay (Smart P2P) – Documentation

## Table of Contents

- [1. Smart P2P Overview](#1-smart-p2p-overview)
- [2. Environments & URLs](#2-environments--urls)
  - [2.1 Demo credentials (click to reveal)](#21-demo-credentials-click-to-reveal)
- [3. Using Smart P2P – User Journeys](#3-using-smart-p2p--user-journeys)
  - [3.1 Staff experience](#31-staff-experience)
  - [3.2 Approver Level 1 & Level 2](#32-approver-level-1--level-2)
  - [3.3 Finance workspace](#33-finance-workspace)
  - [3.4 Admin](#34-admin)
- [4. System Architecture](#4-system-architecture)
- [5. Data Model & Core APIs](#5-data-model--core-apis)
  - [5.1 User](#51-user)
  - [5.2 PurchaseRequest](#52-purchaserequest)
  - [5.3 Approval](#53-approval)
  - [5.4 PurchaseOrder](#54-purchaseorder)
  - [5.5 DocumentExtractionResult](#55-documentextractionresult)
  - [5.6 ReceiptValidationResult](#56-receiptvalidationresult)
  - [5.7 Core API endpoints](#57-core-api-endpoints)
- [6. Running the System](#6-running-the-system)
  - [6.1 Running locally (dev mode)](#61-running-locally-dev-mode)
  - [6.2 Running with Docker & Docker Compose](#62-running-with-docker--docker-compose)
- [7. Monitoring & Observability](#7-monitoring--observability)
  - [7.1 Prometheus](#71-prometheus)
  - [7.2 Grafana](#72-grafana)
  - [7.3 Logging](#73-logging)
- [8. Security Considerations](#8-security-considerations)
- [9. CI/CD & Deployment](#9-cicd--deployment)
- [10. Appendix](#10-appendix)
  - [10.1 Glossary](#101-glossary)
  - [10.2 Example API payloads](#102-example-api-payloads)
  - [10.3 Troubleshooting](#103-troubleshooting)

---

## 1. Smart P2P Overview

Smart Procure-to-Pay (Smart P2P) is our internal workflow platform that digitizes every step from requesting a purchase to validating the final receipt. It enables:

- **Staff** to submit purchase requests and upload vendor proformas.
- **Multi-level approvers** (Level 1 and Level 2) to review and either approve or reject those requests.
- **Finance** to compare approved requests and purchase orders against submitted receipts before payment.

Primary goals:

- Streamline and standardize approvals across departments.
- Reduce manual errors when moving from Proforma → Purchase Order → Receipt.
- Provide transparency and auditability for Staff, Approvers, Finance, and Admins.
- Centralize monitoring (Prometheus + Grafana) and security logging.
- Use AI-assisted document extraction & validation to remove repetitive data entry.

**Main roles**

- **Admin** – Manages users, departments, and roles through Django admin.
- **Staff** – Creates purchase requests, uploads proformas, tracks status, and uploads receipts.
- **Approver Level 1** – First approval checkpoint; ensures business justification.
- **Approver Level 2** – Final approval; triggers automated PO generation.
- **Finance** – Oversees approved requests, validates receipts, and handles exceptions.

**Core flow**

```
Staff → submits Request + Proforma
    → Approver Level 1 → Approver Level 2
    → Finance (PO, Receipt, Validation)
    → Request closed / exception handled
```

The platform combines a Django REST API, a React/Vite front-end, Firebase Storage for documents, Tensor/LLM-based extraction, and Prometheus/Grafana observability.

---

## 2. Environments & URLs

| Environment | URL | Description |
|-------------|-----|-------------|
| Frontend (Smart P2P UI) | https://p2p.moses.it.com | React-based portal for Staff, Approvers, Finance |
| Backend API & Swagger docs | https://p2p-api.moses.it.com | Django REST API, swagger UI, admin |
| Grafana dashboards | https://p2p-grafana.moses.it.com | Visualizations for performance & business metrics |
| Prometheus metrics | https://p2p-prometheus.moses.it.com | Raw metrics scraped from Django |

<h2>Note: This is a High Level Detailed Project Combined if you want to set it up locally i advise you to clone the Backend: https://github.com/mosesmmoisebidth/procure-to-pay.git; Frontend: https://github.com/mosesmmoisebidth/ist-procure-to-pay-client.git; Documentation: https://github.com/mosesmmoisebidth/p2p-docs.git; </h2>
<h3>For a detailed documentation on the Project visit this Documentation: https://mosesmmoisebidth.github.io/p2p-docs/</h3>


### 2.1 Demo credentials (click to reveal)

_Internal demo credentials shared only within the Smart P2P dev team._

#### Admin

<details>
  <summary>Show admin demo credentials</summary>

  - Username: `Moses`  
  - Password: `Manisdad234!!`
</details>

#### Staff

<details>
  <summary>Show staff demo credentials</summary>

  - Username: `Bill`  
  - Password: `Manisdad234!!`
</details>

#### Approver Level 1

<details>
  <summary>Show approver L1 demo credentials</summary>

  - Username: `Joric`  
  - Password: `Manisdad234!!`
</details>

#### Approver Level 2

<details>
  <summary>Show approver L2 demo credentials</summary>

  - Username: `Thierry`  
  - Password: `Manisdad234!!`
</details>

#### Finance

<details>
  <summary>Show finance demo credentials</summary>

  - Username: `David`  
  - Password: `Manisdad234!!`
</details>

---

## 3. Using Smart P2P – User Journeys

### 3.1 Staff experience

![Login screen – Smart P2P](./images/login.png)
![Staff dashboard – empty state](./images/staff-dashboard-empty.png)

The Staff dashboard highlights:

- KPI cards (Total Requests, Pending, Approved, Rejected).
- Filters by status and search (title, reference, vendor).
- Empty-state guidance when no requests exist.
- Quick actions to create new requests or open existing ones.

**How Staff submit and track a request**

1. Visit https://p2p.moses.it.com and sign in as a Staff user.
2. Land on the **My Purchase Requests** dashboard.
3. Click **Create New Request** to open the request wizard.
4. Fill in the form:
   - Title, description of the business need.
   - `amount_estimated` + currency.
   - `needed_by` date and optional notes.
5. Upload the vendor proforma in the **Documents & extraction** card:
   - Supports PDF/PNG/JPG up to 10 MB.
   - Drag-and-drop or file picker.
   - Shows file name/size plus “Processing...” hint while AI extraction runs.
6. Submit the form:
   - System creates a `PurchaseRequest` with status `PENDING`.
   - Extraction pipeline populates vendor, amount_from_proforma, and line items automatically.
7. Track progress:
   - Status badges (PENDING, APPROVED, REJECTED).
   - Approval timeline shows who acted at each level.
   - Once fully approved, a Purchase Order link appears.
   - After purchase, upload the receipt from request details (enabled when PO exists and status is APPROVED).

Image references:

![Submit Purchase Request form](./images/staff-new-request-form.png)
![Documents & extraction section with selected proforma](./images/documents-extraction-uploaded.png)
![Request detail – staff view](./images/request-detail-staff.png)

### 3.2 Approver Level 1 & Level 2

Approvers see a workspace focused on actionable requests.

![Approver dashboard – pending approvals](./images/approver-dashboard-pending.png)

Dashboard highlights:

- Tabs for **Pending** and **History**.
- Each row shows reference, title, requester, vendor, extracted amount, age.
- “Review” action opens the full approval context.

**Approval workflow**

1. Log in as Approver L1 (level 1) or Approver L2 (level 2).
2. Open **Pending approvals** to see requests at your level.
3. Select a request to view:
   - Request metadata (title, description, notes, needed_by).
   - Staff contact info.
   - AI extracted amounts (estimated vs proforma).
   - Line items table.
   - Links to proforma/Purchase Order documents.
   - Approval timeline showing what happened earlier.
4. Take action:
   - **Approve** – adds an `Approval` record for your level.  
     - Level 1 approval moves the request to level 2 (if required_approval_levels > 0).  
     - Level 2 approval finalizes the workflow, sets status to APPROVED, and auto-generates a Purchase Order with `po_number`, vendor, currency, totals, terms, Firebase link, and structured data.
   - **Reject** – records a rejection, sets status to REJECTED, and stops the workflow permanently.

Key mechanics:

- `current_approval_level` tracks who should act next.
- `required_approval_levels` counts remaining approvals; final approval sets it to 0.
- Any rejection locks the request; only Staff can re-submit via a new request.

Supporting images:

![Approval detail – with approve/reject actions](./images/approver-review-screen.png)
![Request detail – with approval timeline](./images/request-detail-approvals.png)

### 3.3 Finance workspace

Finance only sees approved requests so they can monitor receipts and validation.

![Finance – approved requests list](./images/finance-approved-requests.png)
![Finance – receipt vs PO validation result](./images/finance-validation-mismatch-detail.png)

Dashboard elements:

- Metrics: total approved, “With receipt”, “Exceptions” (mismatched validations).
- Filters for validation status (Matched, Mismatched, Pending) and search.
- Table columns: reference, vendor, PO total, receipt status, validation badge, action.

Steps:

1. Log in as Finance and open the **Approved Requests** dashboard.
2. Inspect each approved request:
   - View Purchase Order (auto-generated PDF stored in Firebase).
   - See whether a receipt has been uploaded.
3. When a receipt is submitted:
   - Extraction builds a `DocumentExtractionResult` (raw_text, structured fields).
   - Validation compares PO structured data vs receipt final data:
     - `is_match` boolean.
     - `score` (0–1).
     - `details.vendor_match`, `details.total_amount_match`, `details.item_differences`.
     - Optional `details.llm_analysis` with summary and bullet issues.
4. Finance reviews mismatches and documents exceptions before payment.

### 3.4 Admin

Admins manage users, roles, and departments through Django admin at https://p2p-api.moses.it.com/admin/.

- Add or update users with roles: Staff, Approver L1, Approver L2, Finance, Super Admin.
- Assign departments so dashboards show relevant context.
- Reset passwords, deactivate users, or promote to superuser for emergency troubleshooting.

Placeholders:

![Admin – user list in Django admin](./images/admin-user-list.png)
![Admin – create user form](./images/admin-create-user.png)

---

## 4. System Architecture

Smart P2P consists of several components working together:

- **Backend** – Django 5.x + Django REST Framework, split into `accounts`, `documents`, and `procurement_app`.
- **Database** – PostgreSQL 16 (`procurement_app` database) storing requests, approvals, purchase orders, and validation results.
- **Document storage & AI** – Files uploaded to Firebase Storage; OCR + LLM extraction (Gemini/OpenAI) produce structured JSON that is stored in `DocumentExtractionResult`.
- **Validation service** – Compares receipt vs purchase order, calculates match score, logs LLM analysis, and stores results in `ReceiptValidationResult`.
- **Frontend** – React 19 + Vite + TypeScript served at https://p2p.moses.it.com.
- **Monitoring** – `django_prometheus` exposes `/metrics`, Prometheus scrapes the Django container, Grafana queries Prometheus to visualize KPIs.
- **Reverse proxy & TLS** – Nginx terminates TLS for all subdomains and routes traffic to Docker services. Certbot provides Let’s Encrypt certificates.

Architecture diagram:

```
                 ┌─────────────────┐
                 │   Smart P2P UI  │
                 │ (React/Frontend)│
                 └───────┬─────────┘
                         │ HTTPS (p2p.moses.it.com)
                 ┌───────▼─────────┐
                 │    Nginx        │
                 │ TLS termination │
                 └─┬─────┬──────┬──┘
     p2p-api.moses.it.com │    │ p2p-grafana... / p2p-prometheus...
                          │    │
                ┌─────────▼┐ ┌─▼──────────┐   ┌──────────────┐
                │ Django   │ │  Grafana   │   │ Prometheus   │
                │  web     │ │ (3000)     │   │ (9090)       │
                │ (8000)   │ └────────────┘   └─────┬────────┘
                └────┬─────┘                        │
                     │           scrape /metrics    │
                     │──────────────────────────────┘

            ┌──────────────┐
            │ PostgreSQL   │
            │ (procurement │
            │    _app)     │
            └──────────────┘

            ┌─────────────────────┐
            │ Firebase Storage    │
            │ Proforma / PO /    │
            │ Receipt PDFs       │
            └─────────────────────┘
```

---

## 5. Data Model & Core APIs

### 5.1 User

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `username` | string | Login name |
| `email` | string | Contact email |
| `full_name` | string | Display name |
| `department` | string | Optional department/business unit |
| `role` | enum | `staff`, `approver_lvl1`, `approver_lvl2`, `finance`, `super_admin` |
| `date_joined` | datetime | Onboarding timestamp |

### 5.2 PurchaseRequest

| Field | Description |
|-------|-------------|
| `id`, `reference` | UUID, human-readable reference `REQ-YYYYMMDD-xxxxx` |
| `title`, `description`, `category`, `notes` | Request metadata |
| `amount_estimated`, `amount_from_proforma`, `currency` | Financial data |
| `vendor_name` | Auto-filled from extraction when available |
| `status` | `PENDING`, `APPROVED`, `REJECTED` |
| `current_approval_level` | Which level must act now |
| `required_approval_levels` | Remaining levels before completion |
| `created_by` | Nested `User` summary |
| `needed_by` | Required fulfillment date |
| `proforma_url`, `purchase_order_url`, `receipt_url` | Firebase URLs |
| `items[]` | Extracted line items (name, quantity, unit_price, total_price) |
| `approvals[]` | History of decisions with approver, level, comment |
| `purchase_order` | Generated PO details (po_number, vendor, issue_date, etc.) |
| `latest_validation` | `ReceiptValidationResult` summary |
| `created_at`, `updated_at` | Audit timestamps |

### 5.3 Approval

| Field | Description |
|-------|-------------|
| `id` | UUID |
| `purchase_request` | Related request |
| `approver` | User reference |
| `level` | Approval level (1 or 2) |
| `decision` | `approved` or `rejected` |
| `comment` | Optional free text |
| `created_at` | Timestamp |

### 5.4 PurchaseOrder

| Field | Description |
|-------|-------------|
| `po_number` | Generated `PO-YYYYMMDD-XXXXXX` |
| `vendor_name`, `currency`, `issue_date`, `terms` | PO metadata |
| `total_amount` | Numeric total |
| `firebase_url` | Link to generated PDF |
| `structured_data` | JSON version of the PO (vendor, items, totals) |

### 5.5 DocumentExtractionResult

| Field | Description |
|-------|-------------|
| `doc_type` | `proforma`, `po`, `receipt` |
| `firebase_url` | Uploaded file |
| `raw_text` | OCR output |
| `baseline_data` / `final_data` | Structured JSON extracted by LLM |
| `engine_used` | e.g., `gemini` |
| `confidence_score` | 0–1 |
| `created_at` | Timestamp |

### 5.6 ReceiptValidationResult

| Field | Description |
|-------|-------------|
| `is_match` | Boolean result |
| `score` | Normalized score (0–1) |
| `details.vendor_match` | Expected vs found vendor + similarity |
| `details.total_amount_match` | Expected vs found totals + difference |
| `details.item_differences` | Array of missing/mismatched items |
| `details.llm_analysis` | Optional summary, issues[], confidence |
| `created_at` | Timestamp |

### 5.7 Core API endpoints

| Endpoint | Method | Role(s) | Description |
|----------|--------|---------|-------------|
| `/api/schema/` | GET | Any | OpenAPI schema JSON |
| `/api/docs/` | GET | Any | Swagger UI |
| `/api/auth/login/` | POST | Any | Obtain DRF token (email/username + password) |
| `/api/auth/me/` | GET | Authenticated | Current profile |
| `/api/auth/logout/` | POST | Authenticated | Revoke current token |
| `/api/requests/` | GET | Staff sees own; Approvers/Finance filtered by role | List requests with pagination/filtering |
| `/api/requests/` | POST (multipart) | Staff | Create request with `proforma_file` |
| `/api/requests/{id}/` | GET | Authenticated | Request detail |
| `/api/requests/{id}/` | PUT/PATCH | Staff owner (while PENDING) | Update request |
| `/api/requests/{id}/approve/` | PATCH | Approver at current level | Record approval (payload: `{ "comment": "..." }`) |
| `/api/requests/{id}/reject/` | PATCH | Approver at current level | Record rejection |
| `/api/requests/{id}/submit-receipt/` | POST (multipart) | Staff owner | Upload receipt, returns `{ request, extraction, validation }` |
| `/api/requests/{id}/validation/` | GET | Finance/staff owner | Latest validation summary |
| `/api/requests/{id}/extraction/{doc_type}/` | GET | Authenticated | Most recent extraction for `proforma` or `receipt` |
| `/health/` | GET | Any | DB-aware health check |
| `/metrics` | GET | Prometheus | Metrics endpoint |

Authentication uses DRF Token Authentication (header `Authorization: Token <key>`). All endpoints enforce role-based permissions inside viewsets.

---

## 6. Running the System

### 6.1 Running locally (dev mode)

**Prerequisites**

- Python 3.10.9
- PostgreSQL 16
- Node.js 20+ (for the React frontend if running from the same repo)
- `virtualenv`, `make`, `git`

**Environment variables**

Create `.env` from `.env.example` and fill:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG` (set to `True` locally)
- `DJANGO_ALLOWED_HOSTS`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `FIREBASE_SERVICE_ACCOUNT_JSON_PATH`, `FIREBASE_STORAGE_BUCKET`
- `DOC_AI_ENABLED`, `DOC_AI_PROVIDER`
- `GEMINI_API_KEY` or `OPENAI_API_KEY` (depending on provider)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

**Setup commands**

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser
```

**Run Django**

```bash
python manage.py runserver 0.0.0.0:8000
```

Local endpoints:

- API base: http://localhost:8000/
- Swagger docs: http://localhost:8000/api/docs/
- Health: http://localhost:8000/health/
- Metrics: http://localhost:8000/metrics
- Logs: JSON records in `./logs/p2p.log` (colorized copy in console).

**Run the frontend (optional)**

```bash
cd procure-to-pay-client
npm install
npm run dev
```

Local UI: http://localhost:5173 (ensure `VITE_API_BASE_URL=http://localhost:8000/api`).

### 6.2 Running with Docker & Docker Compose

`docker-compose.yml` defines:

- `db` – Postgres 16 (port 15432→5432, volume `postgres_data`)
- `web` – Django app (port 8000→8000, mounts project, uses `.env`)
- `prometheus` – Scrapes Django metrics (port 9090→9090)
- `grafana` – Dashboards (port 3000→3000, volume `grafana_data`)

**Commands**

```bash
# Build images
docker compose build

# Start services in background
docker compose up -d

# Check status
docker compose ps

# Tail Django logs
docker compose logs -f web

# Stop and remove containers
docker compose down
```

Notes:

- Services use `restart: unless-stopped` so they persist reboots.
- `web` runs `python manage.py runserver 0.0.0.0:8000`.
- Update `.env` before `docker compose up` to ensure DB credentials and API keys are available inside the container.

---

## 7. Monitoring & Observability

### 7.1 Prometheus

Prometheus scrapes Django’s `/metrics` endpoint via `django_prometheus`. Configuration (`prometheus.yml`):

```yaml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: "django"
    metrics_path: "/metrics"
    static_configs:
      - targets: ["web:8000"]
```

UI: https://p2p-prometheus.moses.it.com

![Prometheus target view – django up](./images/prometheus-targets.png)

### 7.2 Grafana

Grafana points to Prometheus as a data source and ships with dashboards for:

- Request throughput & approval latency.
- Django view latency (p95/p99) and error rates.
- Database connections & queue depth.
- Business KPIs (approved vs rejected, validation mismatches).

Access:

<details>
  <summary>Show Grafana admin credentials</summary>

  - URL: `https://p2p-grafana.moses.it.com`
  - Username: `admin`
  - Password: `Manisdad234!!`
</details>

![Grafana – Django latency & error rate](./images/grafana-django-latency.png)

### 7.3 Logging

- Structured JSON logs via `python-json-logger` written to `logs/p2p.log`.
- Console logs colored via `colorlog`.
- `RequestIdMiddleware` and `RequestContextMiddleware` inject `request_id` and `user_id`.

Tail logs locally:

```bash
tail -f logs/p2p.log
```

Tail logs in Docker:

```bash
docker compose logs -f web
```

Security events (login success/failure, approvals, receipt validations) are also logged via `core.security_logging`.

---

## 8. Security Considerations

- **Secrets management** – All secrets (DJANGO_SECRET_KEY, DB credentials, Firebase keys, Gemini/OpenAI keys, Resend API) live in `.env` and never in Git.
- **Rate limiting** – DRF throttles: `anon: 50/hour`, `user: 1000/day`, `login: 10/hour`, `heavy_action: 20/hour`.
- **Upload safety** – `MAX_UPLOAD_SIZE = 10 MB` with `FILE_UPLOAD_MAX_MEMORY_SIZE` and `DATA_UPLOAD_MAX_MEMORY_SIZE` enforcing the limit. Validators restrict uploads to PDFs and common image formats.
- **CSRF & CORS** – `CSRF_TRUSTED_ORIGINS` covers local & production hosts; CORS fully open only in DEBUG mode.
- **Secure cookies & headers** – HTTP-only cookies, `SameSite=Lax`, `SECURE_CONTENT_TYPE_NOSNIFF`, `SECURE_REFERRER_POLICY`, `X_FRAME_OPTIONS=DENY`. When `DEBUG=False`, SSL redirect, secure cookies, and HSTS are enabled.
- **Content Security Policy** – `ContentSecurityPolicyMiddleware` enforces `default-src 'self'` globally. Swagger routes (`/docs`, `/swagger`, `/api/docs`) allow jsDelivr + minimal inline scripts.
- **Authentication & authorization** – Token auth; role-based filtering ensures Staff only see their requests, Approvers only see actionable requests, and Finance gets approved-only.
- **Observability of security events** – Structured security logs make login attempts, approvals, and receipt validations auditable.

---

## 9. CI/CD & Deployment

Deployment uses GitHub Actions with SSH into the VPS. On push to `main`, the workflow:

1. Checks out the repo.
2. Connects to the VPS via SSH (secrets-managed host/user/key/port).
3. Updates `/root/Desktop/ist-backend` to the latest `origin/main`.
4. Runs `docker compose build web`.
5. Runs `docker compose up -d web`.
6. Prunes unused Docker images.

Simplified workflow snippet:

```yaml
name: Deploy backend to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT }}
          script: |
            cd /root/Desktop/ist-backend
            git fetch origin main
            git reset --hard origin/main
            docker compose build web
            docker compose up -d web
            docker image prune -f
```

**Reverse proxy & TLS**

- Nginx routes:
  - `p2p.moses.it.com` → frontend build.
  - `p2p-api.moses.it.com` → Django container.
  - `p2p-grafana.moses.it.com` → Grafana container.
  - `p2p-prometheus.moses.it.com` → Prometheus container.
- Certbot (`certbot --nginx`) provisions Let’s Encrypt certificates for all subdomains.
- Backend services aren’t exposed directly—only via Nginx.

---

## 10. Appendix

### 10.1 Glossary

| Term | Meaning |
|------|---------|
| **Proforma** | Vendor quotation uploaded by Staff to justify procurement. |
| **Purchase Order (PO)** | Official document generated after approvals, stored as PDF + structured JSON. |
| **Receipt** | Vendor receipt/bill uploaded after purchase. |
| **Validation score** | Numeric score (0–1) expressing how closely receipt matches PO. |
| **Vendor match** | Comparison of vendor names between PO and receipt. |
| **Item differences** | List of mismatches in quantity/price/items found during validation. |

### 10.2 Example API payloads

**Paginated PurchaseRequest list (GET `/api/requests/`)**

```json
{
  "count": 42,
  "next": "https://p2p-api.moses.it.com/api/requests/?page=2",
  "previous": null,
  "results": [
    {
      "id": "2f95...",
      "reference": "REQ-20250110-A1234",
      "title": "Engineering Laptops",
      "status": "PENDING",
      "amount_estimated": 12000,
      "vendor_name": "Tech Hub Africa",
      "current_approval_level": 2,
      "required_approval_levels": 1,
      "created_by": {
        "id": "user-staff-1",
        "full_name": "Alice Mutesi",
        "role": "staff"
      }
    }
  ]
}
```

**PurchaseRequest detail (GET `/api/requests/{id}/`)**

```json
{
  "id": "2f95...",
  "reference": "REQ-20250110-A1234",
  "title": "Engineering Laptops",
  "description": "10x Dell Latitude",
  "status": "APPROVED",
  "amount_estimated": 12000,
  "amount_from_proforma": 11850,
  "currency": "USD",
  "vendor_name": "Tech Hub Africa",
  "items": [
    { "name": "Dell Latitude 7420", "quantity": 10, "unit_price": 1185, "total_price": 11850 }
  ],
  "approvals": [
    { "level": 1, "decision": "approved", "comment": "Looks good", "approver": { "full_name": "Brian Kamau" } },
    { "level": 2, "decision": "approved", "comment": "", "approver": { "full_name": "Cynthia Arinaitwe" } }
  ],
  "purchase_order": {
    "po_number": "PO-20250110-B98D12",
    "vendor_name": "Tech Hub Africa",
    "total_amount": 11850,
    "firebase_url": "https://storage.googleapis.com/.../PO-20250110-B98D12.pdf"
  },
  "latest_validation": {
    "is_match": false,
    "score": 0.6,
    "details": {
      "vendor_match": { "expected": "Tech Hub Africa", "found": "Tech Hub Africa Ltd", "similarity": 0.94 },
      "total_amount_match": { "expected": 11850, "found": 11900, "difference": 50 },
      "item_differences": [
        { "item_name": "Dell Latitude 7420", "issue": "unit price mismatch", "expected_unit_price": 1185, "found_unit_price": 1190 }
      ],
      "llm_analysis": { "summary": "Small price change on receipts.", "issues": ["Unit price higher"], "confidence": 0.72 }
    }
  }
}
```

**Receipt upload response (POST `/api/requests/{id}/submit-receipt/`)**

```json
{
  "request": { "...": "updated purchase request" },
  "extraction": {
    "doc_type": "receipt",
    "firebase_url": "https://storage.googleapis.com/.../receipt.pdf",
    "final_data": {
      "vendor_name": "Urban Interiors Ltd",
      "total_amount": 7950,
      "items": [ { "name": "Reception Desk", "quantity": 1, "total_price": 2500 } ]
    }
  },
  "validation": {
    "is_match": false,
    "score": 0.6,
    "details": {
      "total_amount_match": { "expected": 7900, "found": 7950, "difference": 50 },
      "item_differences": [ { "item_name": "Guest Sofa Set", "issue": "unit price mismatch" } ]
    }
  }
}
```

### 10.3 Troubleshooting

| Issue | Possible fix |
|-------|--------------|
| Prometheus shows no targets | Ensure Django `/metrics` is reachable inside the compose network and `prometheus.yml` points to `web:8000`. |
| Grafana dashboards empty | Verify Prometheus data source is healthy and scrape interval is sufficient; check Prometheus UI for data during the same window. |
| `docker compose up` stops immediately | Run `docker compose logs web` to inspect Django errors (often missing env vars or bad DB connection). |
| Swagger UI blank or only shows “Authorize” | Confirm CSP middleware allows jsDelivr, and `/api/schema/` returns JSON without auth errors. |
| File uploads rejected | Check `MAX_UPLOAD_SIZE` and ensure files are <10 MB and of type pdf/png/jpg/jpeg. |
| Emails not delivered | Ensure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set; logs will show “Skipping email” when missing. |

---

_End of document._
