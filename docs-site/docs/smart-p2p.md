---
id: smart-p2p
title: Smart P2P – Platform Guide
slug: /smart-p2p
sidebar_position: 1
---

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

Smart Procure-to-Pay (Smart P2P) digitizes every step from request submission to receipt validation.

- **Staff** upload vendor proformas and track requests.
- **Approver Level 1 & 2** ensure each request meets policy.
- **Finance** verifies purchase orders (POs) and receipts before payment.
- **Admins** manage users, roles, and departments.

Goals:

- Standardize approvals across departments.
- Reduce data-entry errors between Proforma → PO → Receipt.
- Improve transparency for every role.
- Centralize monitoring and audit logging (Prometheus + Grafana).
- Leverage AI extraction & validation to automate document parsing.

Main roles: Admin, Staff, Approver Level 1, Approver Level 2, Finance, Super Admin.

Process summary:

```
Staff → submits Request + Proforma
    → Approver Level 1 → Approver Level 2
    → Finance (PO, Receipt, Validation)
    → Request closed / exception handled
```

---

## 2. Environments & URLs

| Environment | URL | Description |
|-------------|-----|-------------|
| Frontend UI | https://p2p.moses.it.com | Smart P2P portal |
| Backend API & Swagger | https://p2p-api.moses.it.com | Django REST API |
| Grafana | https://p2p-grafana.moses.it.com | Dashboards |
| Prometheus | https://p2p-prometheus.moses.it.com | Metrics explorer |

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

Dashboard features:

- KPI cards (Total, Pending, Approved, Rejected).
- Filters & search.
- “Create New Request” CTA plus empty-state guidance.

Workflow:

1. Sign in at https://p2p.moses.it.com.
2. Click **Create New Request**.
3. Enter title, description, amount, currency, needed_by, notes.
4. Upload a Proforma (PDF/PNG/JPG ≤10 MB) in **Documents & extraction**.
5. Submit → system sets status to `PENDING` and runs AI extraction.
6. Track progress (status badge, approval timeline, PO link when generated).
7. After purchase, upload the receipt from request details.

Placeholders:

![Submit Purchase Request form](./images/staff-new-request-form.png)
![Documents & extraction section with selected proforma](./images/documents-extraction-uploaded.png)
![Request detail – staff view](./images/request-detail-staff.png)

### 3.2 Approver Level 1 & Level 2

![Approver dashboard – pending approvals](./images/approver-dashboard-pending.png)

- Pending list shows reference, title, requester, vendor, extracted totals, age.
- History tab lists previous decisions.

Approval detail includes metadata, extracted items, documents, and timeline.

Actions:

- **Approve** – adds an Approval entry at your level.  
  - Level 1 approval increments `current_approval_level`.  
  - Level 2 approval finalizes workflow, sets status to `APPROVED`, and auto-generates a PO (`po_number`, vendor, totals, Firebase URL, structured items).
- **Reject** – records rejection, sets status `REJECTED`, stops workflow.

![Approval detail – with approve/reject actions](./images/approver-review-screen.png)
![Request detail – with approval timeline](./images/request-detail-approvals.png)

### 3.3 Finance workspace

![Finance – approved requests list](./images/finance-approved-requests.png)
![Finance – receipt vs PO validation result](./images/finance-validation-mismatch-detail.png)

- Focuses on APPROVED requests.
- Metrics: total approved, “With receipt”, “Exceptions”.
- Table shows PO totals, receipt status, validation badge.

Receipt upload triggers:

- `DocumentExtractionResult` for receipt.
- `ReceiptValidationResult` comparing PO vs receipt (vendor match, totals, item differences, LLM analysis).

Finance reviews mismatches before payment.

### 3.4 Admin

Admins manage users/roles via Django admin (https://p2p-api.moses.it.com/admin/):

- Create/update users with departments and roles.
- Reset passwords, deactivate accounts, elevate to superuser.

![Admin – user list in Django admin](./images/admin-user-list.png)
![Admin – create user form](./images/admin-create-user.png)

---

## 4. System Architecture

- **Backend**: Django 5.x (apps: `accounts`, `documents`, `procurement_app`).
- **Database**: PostgreSQL 16.
- **Document storage & AI**: Firebase Storage + OCR + Gemini/OpenAI extraction.
- **Validation**: Compares receipt `final_data` with PO `structured_data`.
- **Frontend**: React/Vite served at https://p2p.moses.it.com.
- **Monitoring**: `django_prometheus` + Prometheus + Grafana.
- **Reverse proxy**: Nginx + Certbot TLS for all subdomains.

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

| Field | Description |
|-------|-------------|
| `id`, `username`, `email`, `full_name` | Identity fields |
| `department`, `role` | Access control context |
| `date_joined` | Join timestamp |

### 5.2 PurchaseRequest

Metadata (title, description, category, notes), financials, vendor, status, approvals, PO, validation, documents, items, timestamps.

### 5.3 Approval

Level (`1` or `2`), decision (`approved`/`rejected`), comment, timestamps.

### 5.4 PurchaseOrder

`po_number`, vendor, currency, issue_date, total_amount, terms, Firebase URL, structured data.

### 5.5 DocumentExtractionResult

Document type (`proforma`, `po`, `receipt`), Firebase URL, OCR text, structured JSON, engine, confidence.

### 5.6 ReceiptValidationResult

`is_match`, `score`, `details.vendor_match`, `details.total_amount_match`, `details.item_differences`, `details.llm_analysis`.

### 5.7 Core API endpoints

| Endpoint | Method | Role(s) | Description |
|----------|--------|---------|-------------|
| `/api/schema/`, `/api/docs/` | GET | Any | Schema/Swagger |
| `/api/auth/login/` | POST | Any | Token auth |
| `/api/auth/me/` | GET | Authenticated | Profile |
| `/api/auth/logout/` | POST | Authenticated | Revoke token |
| `/api/requests/` | GET | Role-based filtering | List |
| `/api/requests/` | POST | Staff | Create (multipart with `proforma_file`) |
| `/api/requests/{id}/` | GET | Authenticated | Detail |
| `/api/requests/{id}/` | PUT/PATCH | Staff owner (PENDING) | Update |
| `/api/requests/{id}/approve/` | PATCH | Approver L1/L2 | Approve |
| `/api/requests/{id}/reject/` | PATCH | Approver L1/L2 | Reject |
| `/api/requests/{id}/submit-receipt/` | POST | Staff owner | Upload receipt |
| `/api/requests/{id}/validation/` | GET | Finance/staff owner | Latest validation |
| `/api/requests/{id}/extraction/{doc_type}/` | GET | Authenticated | Latest extraction |
| `/metrics`, `/health/` | GET | Prometheus/ops | Observability |

All endpoints require `Authorization: Token <key>` once logged in.

---

## 6. Running the System

### 6.1 Running locally (dev mode)

Prereqs: Python 3.10.9, Postgres 16, Node 20+, virtualenv, git.

Environment variables (see `.env.example`):

- `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`
- DB connection (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`)
- Firebase & AI settings (`FIREBASE_*`, `DOC_AI_*`, `GEMINI_API_KEY`, `OPENAI_API_KEY`)
- Notification keys (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)

Setup:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

Local endpoints:

- API: http://localhost:8000/
- Swagger: http://localhost:8000/api/docs/
- Metrics: http://localhost:8000/metrics
- Logs: `logs/p2p.log`

Frontend (optional):

```bash
cd procure-to-pay-client
npm install
npm run dev
```

### 6.2 Running with Docker & Docker Compose

Services in `docker-compose.yml`:

- `db` (Postgres 16, port `15432:5432`, volume `postgres_data`)
- `web` (Django app, port `8000:8000`, mounts repo, uses `.env`)
- `prometheus` (port `9090:9090`, loads `prometheus.yml`)
- `grafana` (port `3000:3000`, volume `grafana_data`)

Commands:

```bash
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f web
docker compose down
```

Notes:

- `restart: unless-stopped` keeps services running after reboot.
- `web` runs `python manage.py runserver 0.0.0.0:8000`.

---

## 7. Monitoring & Observability

### 7.1 Prometheus

`prometheus.yml`:

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

Grafana (https://p2p-grafana.moses.it.com) uses Prometheus as data source. Dashboards track Django latency, throughput, errors, DB metrics, and procurement KPIs.

<details>
  <summary>Show Grafana admin credentials</summary>

  - URL: `https://p2p-grafana.moses.it.com`
  - Username: `admin`
  - Password: `Manisdad234!!`
</details>

![Grafana – Django latency & error rate](./images/grafana-django-latency.png)

### 7.3 Logging

- JSON logs (python-json-logger) stored in `logs/p2p.log`.
- Colored console logs (colorlog).
- Middleware injects `request_id` and `user_id`.
- Security events logged via `security` logger.

Tail locally:

```bash
tail -f logs/p2p.log
```

Docker:

```bash
docker compose logs -f web
```

---

## 8. Security Considerations

- Secrets isolated in `.env`; never committed.
- DRF throttling: `anon 50/hour`, `user 1000/day`, `login 10/hour`, `heavy_action 20/hour`.
- Upload safety: `MAX_UPLOAD_SIZE = 10 MB`, MIME validators for PDF/PNG/JPG/JPEG.
- CSRF & CORS: Trusted origins configured; CORS unrestricted only in DEBUG.
- Secure cookies/headers: HTTPOnly cookies, `SameSite=Lax`, `SECURE_CONTENT_TYPE_NOSNIFF`, `SECURE_REFERRER_POLICY`, `X_FRAME_OPTIONS=DENY`. SSL redirect + HSTS in production.
- Content Security Policy: strict by default; swagger routes allow jsDelivr + minimal inline scripts.
- Token auth with role-based filtering (Staff only see own requests; Approvers see pending; Finance sees approved).
- Security logging for logins, approvals, receipt validations.

---

## 9. CI/CD & Deployment

GitHub Actions deploys to the VPS on every push to `main`:

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

Reverse proxy:

- Nginx routes `p2p.moses.it.com`, `p2p-api.moses.it.com`, `p2p-grafana.moses.it.com`, `p2p-prometheus.moses.it.com`.
- Certbot (`certbot --nginx`) provisions Let’s Encrypt certs.
- Containers stay private behind Nginx.

---

## 10. Appendix

### 10.1 Glossary

| Term | Meaning |
|------|---------|
| Proforma | Vendor quotation uploaded by Staff. |
| Purchase Order (PO) | Auto-generated document after approvals. |
| Receipt | Vendor bill uploaded after purchase. |
| Validation score | 0–1 measure of PO vs receipt similarity. |
| Vendor match | Comparison of vendor names between PO & receipt. |
| Item differences | List of missing/mismatched items during validation. |

### 10.2 Example API payloads

**Paginated list**

```json
{
  "count": 42,
  "results": [
    {
      "reference": "REQ-20250110-A1234",
      "title": "Engineering Laptops",
      "status": "PENDING",
      "amount_estimated": 12000,
      "vendor_name": "Tech Hub Africa"
    }
  ]
}
```

**Request detail**

```json
{
  "reference": "REQ-20250110-A1234",
  "status": "APPROVED",
  "amount_estimated": 12000,
  "amount_from_proforma": 11850,
  "items": [ { "name": "Dell Latitude 7420", "quantity": 10 } ],
  "approvals": [
    { "level": 1, "decision": "approved", "comment": "Looks good" },
    { "level": 2, "decision": "approved" }
  ],
  "purchase_order": { "po_number": "PO-20250110-B98D12" },
  "latest_validation": {
    "is_match": false,
    "details": {
      "total_amount_match": { "expected": 11850, "found": 11900, "difference": 50 }
    }
  }
}
```

**Receipt upload response**

```json
{
  "request": { "...": "updated purchase request" },
  "extraction": {
    "doc_type": "receipt",
    "final_data": { "vendor_name": "Urban Interiors Ltd", "total_amount": 7950 }
  },
  "validation": {
    "is_match": false,
    "score": 0.6,
    "details": {
      "item_differences": [
        { "item_name": "Guest Sofa Set", "issue": "unit price mismatch" }
      ]
    }
  }
}
```

### 10.3 Troubleshooting

| Issue | Resolution |
|-------|------------|
| No targets in Prometheus | Check `/metrics` responds inside Docker network and `prometheus.yml` references `web:8000`. |
| Grafana shows no data | Validate Prometheus data source + scrape interval. |
| Docker web container exits | `docker compose logs web` to inspect missing env vars or DB errors. |
| Swagger UI blank | Ensure CSP allows jsDelivr and `/api/schema/` responds without auth issues. |
| File upload rejected | Confirm size &lt; 10 MB and allowed MIME types. |
| Emails not sent | Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`; logs mention when skipping. |

---
