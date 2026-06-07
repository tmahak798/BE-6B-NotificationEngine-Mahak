# BE-6B: Event-Driven Notification Engine with Multi-Channel Delivery

A production-grade, event-driven notification backend built for financial services. Processes 25+ financial event types and delivers across SMS, Email, Push, WhatsApp, and In-App channels with full TRAI DND compliance, frequency capping, and real-time analytics.

## Architecture Overview

**Tech Stack:** Node.js 20 + TypeScript 5 | PostgreSQL 15 | Redis 7 | Apache Kafka | RabbitMQ | Handlebars | Docker

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop

### Setup

```bash
# Clone the repository
git clone https://github.com/tmahak798/BE-6B-NotificationEngine-Mahak.git
cd BE-6B-NotificationEngine-Mahak

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Start infrastructure
docker compose up -d

# Run database migrations
npx ts-node src/database/migrate.ts

# Seed test data
npx ts-node src/database/seed.ts

# Start the server
npx ts-node src/index.ts
```

Server runs at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | System health check |
| GET | `/metrics` | Prometheus metrics |
| POST | `/api/v1/events` | Ingest financial event |
| GET | `/api/v1/notifications/:id` | Get notification status |
| GET | `/api/v1/users/:id/notifications` | User notification history |
| GET | `/api/v1/users/:id/preferences` | Get user preferences |
| PUT | `/api/v1/users/:id/preferences` | Update user preferences |
| GET | `/api/v1/analytics/delivery-rates` | Delivery analytics |
| GET | `/api/v1/dlq` | Dead letter queue entries |
| GET | `/api/v1/health/providers` | Circuit breaker status |

## Event Ingestion Example

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "RISK-001",
    "event_id": "EVT-001",
    "source_system": "margin_engine",
    "timestamp": "2026-06-08T10:00:00.000Z",
    "priority": 1,
    "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "idempotency_key": "margin-001",
    "payload": {
      "shortfall_amount": 125000,
      "deadline": "2026-06-08T11:30:00.000Z",
      "auto_square_off_time": "2026-06-08T12:00:00.000Z"
    }
  }'
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## Key Features

- **25+ Financial Event Types** across 5 categories (Transaction, Risk, SIP, Market, Regulatory)
- **5 Delivery Channels** — SMS, Email, Push, WhatsApp, In-App
- **5 Language Support** — English, Hindi, Marathi, Tamil, Telugu
- **TRAI DND Compliance** — Transactional vs Promotional classification
- **Frequency Capping** — Redis-based multi-dimensional caps
- **Quiet Hours** — Per-user timezone-aware enforcement
- **Circuit Breaker** — CLOSED/OPEN/HALF_OPEN per provider
- **Retry with Exponential Backoff** — Priority-based retry policies
- **Dead Letter Queue** — Failed notification management
- **Event Deduplication** — Redis idempotency keys
- **Full Audit Trail** — Complete state machine logging
- **Real-time Analytics** — Prometheus-compatible metrics

## Financial Event Types

| Category | Events |
|----------|--------|
| Transaction (TXNX) | Buy/Sell Order, Order Rejected, Dividend, Funds Deposited |
| Risk & Margin (RISK) | Margin Call, Shortfall, Position Squared Off, Portfolio Risk |
| SIP & Investment (SIPX) | SIP Reminder, Executed, Failed, Step-Up, Goal Milestone |
| Market & Price (MKTX) | Price Alert, Circuit Breaker, Market Open/Close, 52-Week High/Low |
| Regulatory (REGX) | KYC Expiry, Nominee Update, Contract Note, Tax Statement |

## Compliance

- **SEBI** — Mandatory channels enforced for regulatory events
- **TRAI DND** — Registry compliance with transactional/promotional classification
- **PMLA** — Audit trail for regulatory reporting
- **DPDP Act 2023** — Data privacy compliance

## Document Error Log

As part of the project assessment, the following deliberate errors were identified in the training document:

1. **Retry config inconsistency** — CRITICAL retry config specifies max delay of 60 seconds, but with 10 retries and exponential backoff starting at 500ms, attempt 10 would be `500ms × 2^9 = 256 seconds`, exceeding the stated max delay.
2. **Frequency cap math** — Global daily cap of 12 but per-channel caps (SMS:5 + Push:8 + Email:3 = 16) exceed the global cap, creating a logical inconsistency.
3. **PRIMARY KEY constraint** — The `user_preferences` schema uses `COALESCE(event_type, '*')` in PRIMARY KEY which is not valid standard SQL syntax.
4. **Push delivery rate** — Channel matrix lists push delivery rate as 60-80% but FCM stores messages for up to 4 weeks, not indefinitely as implied.
5. **DND Category number** — Document states financial notifications fall under "Category 1" but TRAI DND categories are structured differently in the actual TRAI framework.

## Project Information

- **Project Code:** BE-6B
- **Track:** Backend Engineering
- **Timeline:** 15 Days
- **Intern:** Mahak
- **GitHub:** https://github.com/tmahak798/BE-6B-NotificationEngine-Mahak