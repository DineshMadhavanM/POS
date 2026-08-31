# NexStack POS - Multi-Tenant Cloud POS & Business Management SaaS

NexStack POS is a production-ready, scalable Point of Sale (POS) and business management SaaS platform designed for Restaurants, Cafes, Bakeries, and Retail Outlets.

---

## 🌟 Key Architectural Features

- **Strict Multi-Tenant Isolation**: Single database architecture enforcing context-level query filtering (`organizationId` & `outletId`) verified via JWT token context.
- **RBAC Security Engine**: Fine-grained role capabilities (`OWNER`, `ADMIN`, `CASHIER`, `KITCHEN_STAFF`, `INVENTORY_STAFF`).
- **High-Speed POS Billing**: Instant product search, barcode scanner integration, cart management, split payment checkout, and printable receipts with unique org numbering (`ORG-2026-0001`).
- **Full Inventory Audit Engine**: Logs every stock change in a `StockMovement` audit record (`PURCHASE`, `SALE`, `RETURN`, `ADJUSTMENT`, `WASTE`).
- **Industry-Specific Modules**:
  - **Restaurant / Cafe**: Interactive Table Floor Map & Kitchen Display System (KDS) for KOT tickets with live state transitions (`PENDING` -> `PREPARING` -> `READY` -> `SERVED`).
  - **Bakery**: Custom cake order scheduling, advance deposit tracking, balance remaining calculations, and delivery date manager.
  - **Retail**: Fast barcode scanner mode and batch expiry management.
- **SaaS Analytics Dashboard**: Real-time KPI cards and interactive Recharts sales velocity trends.
- **AI Business Assistant**: Embedded natural language query interface for revenue trends, best-selling items, and stock depletion alerts.

---

## 🏗 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons + Custom Glassmorphism
- **State Management**: Zustand
- **API Client**: Axios (with JWT auto-injection & refresh token interceptors) + TanStack Query
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js + Express.js + TypeScript
- **Database**: MongoDB with Mongoose (with `mongodb-memory-server` fallback for zero-config execution)
- **Auth**: JWT Access & Refresh Tokens + bcrypt password hashing
- **Validation**: Zod schema validation

---

## 🚀 Quick Start Guide

### 1. Backend Server Setup
```bash
cd backend
npm install
npm run dev
```
- Server runs on: `http://localhost:5000`
- API Health Check: `http://localhost:5000/health`
- Test Suite: `npm test`

### 2. Frontend Web Application Setup
```bash
cd frontend
npm install
npm run dev
```
- Application runs on: `http://localhost:3000`

---

## 🔐 Multi-Tenant Security Verification

Automated integration tests verify data isolation across organizations:
```bash
cd backend
npm test
```
*Output verifies that User from Organization A cannot view, query, or mutate products or invoices belonging to Organization B.*
