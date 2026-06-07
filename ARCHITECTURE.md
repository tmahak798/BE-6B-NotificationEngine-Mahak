# Architecture Documentation

## System Overview

The BE-6B Notification Engine is built using Event-Driven Architecture (EDA) with a modular monolith approach. The system processes financial events from multiple sources and delivers personalised notifications across 5 channels.

## C4 Architecture Diagrams

### Level 1: System Context

```mermaid
graph TB
    TE[Trading Engine] -->|Financial Events| NE[Notification Engine]
    MD[Market Data Feed] -->|Price Events| NE
    CS[Compliance System] -->|Regulatory Events| NE
    NE -->|SMS| USER[End User]
    NE -->|Email| USER
    NE -->|Push| USER
    NE -->|WhatsApp| USER
    NE -->|In-App| USER
    NE -->|Audit Trail| SEBI[SEBI/TRAI Compliance]
```

### Level 2: Container Diagram

```mermaid
graph TB
    subgraph Docker Environment
        KAFKA[Apache Kafka\nEvent Streaming]
        PG[PostgreSQL 15\nPrimary Database]
        REDIS[Redis 7\nCaching & Rate Limiting]
        RMQ[RabbitMQ\nMessage Routing]
        APP[Node.js App\nFastify Server]
    end

    EVENTS[Financial Events] -->|POST /api/v1/events| APP
    APP -->|Publish| KAFKA
    KAFKA -->|Consume| APP
    APP -->|Read/Write| PG
    APP -->|Cache/Cap| REDIS
    APP -->|Route| RMQ
    APP -->|Deliver| SMS[SMS Provider]
    APP -->|Deliver| EMAIL[Email Provider]
    APP -->|Deliver| PUSH[FCM Push]
    APP -->|Deliver| WA[WhatsApp API]
```

### Level 3: Component Diagram

```mermaid
graph TB
    subgraph Event Processing
        EP[Event Producer] --> KAFKA[Kafka Topics]
        KAFKA --> CC[Critical Consumer]
        KAFKA --> SC[Standard Consumer]
    end

    subgraph Processing Pipeline
        CC --> EN[Enrichment Service]
        SC --> EN
        EN --> DND[DND Compliance]
        DND --> FC[Frequency Cap]
        FC --> QH[Quiet Hours]
        QH --> CR[Channel Router]
        CR --> TE[Template Engine]
        TE --> DS[Delivery Service]
    end

    subgraph Delivery
        DS --> CB[Circuit Breaker]
        CB --> SMS[SMS Provider]
        CB --> EMAIL[Email Provider]
        CB --> PUSH[Push Provider]
        CB --> WA[WhatsApp Provider]
        CB --> IA[In-App Provider]
        DS --> RT[Retry Service]
        RT --> DLQ[Dead Letter Queue]
    end

    subgraph Persistence
        DS --> SM[State Machine]
        SM --> PG[(PostgreSQL)]
        SM --> SL[State Log]
    end
```

## Notification Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> CREATED
    CREATED --> ENRICHED
    CREATED --> FAILED
    ENRICHED --> ROUTED
    ENRICHED --> FAILED
    ROUTED --> SENT
    ROUTED --> CAPPED
    ROUTED --> DND
    ROUTED --> QUIET
    ROUTED --> FAILED
    SENT --> DELIVERED
    SENT --> FAILED
    SENT --> RETRYING
    DELIVERED --> READ
    FAILED --> RETRYING
    FAILED --> DLQ
    RETRYING --> SENT
    RETRYING --> FAILED
    CAPPED --> QUEUED
    QUIET --> QUEUED
    QUEUED --> SENT
```

## Margin Call Flow (Critical Path)

```mermaid
sequenceDiagram
    participant ME as Margin Engine
    participant API as REST API
    participant K as Kafka
    participant CC as Critical Consumer
    participant EN as Enrichment
    participant DND as DND Service
    participant TE as Template Engine
    participant SMS as SMS Provider
    participant DB as PostgreSQL

    ME->>API: POST /api/v1/events (RISK-001)
    API->>K: Publish to notification-critical
    API-->>ME: 202 Accepted
    K->>CC: Consume event (<100ms)
    CC->>EN: Enrich with user data
    EN->>DB: SELECT user by ID
    DB-->>EN: User profile
    EN-->>CC: Enriched event
    CC->>DND: Check DND status
    DND-->>CC: ALLOWED (transactional bypasses DND)
    CC->>TE: Render template in user language
    TE-->>CC: Rendered Hindi message
    CC->>DB: Create notification record
    CC->>SMS: Send SMS
    SMS-->>CC: Delivered (messageId)
    CC->>DB: Update status DELIVERED
    Note over ME,DB: Total latency < 10 seconds
```

## Circuit Breaker Pattern

```mermaid
stateDiagram-v2
    [*] --> CLOSED
    CLOSED --> OPEN: failures >= threshold
    OPEN --> HALF_OPEN: timeout elapsed
    HALF_OPEN --> CLOSED: probe success
    HALF_OPEN --> OPEN: probe failure
```

## Database Schema

```mermaid
erDiagram
    users {
        uuid id PK
        string name
        string phone
        string email
        string language
        string timezone
        string dnd_status
        string account_type
    }

    notifications {
        uuid id PK
        string event_type
        uuid user_id FK
        string channel
        int priority
        string status
        jsonb personalisation_data
        timestamptz delivered_at
    }

    notification_state_log {
        bigint id PK
        uuid notification_id FK
        string from_status
        string to_status
        string actor
        timestamptz created_at
    }

    dead_letter_queue {
        uuid id PK
        uuid notification_id FK
        string failure_reason
        int retry_count
        boolean resolved
    }

    user_preferences {
        uuid id PK
        uuid user_id FK
        string event_category
        string channel
        boolean enabled
    }

    users ||--o{ notifications : "receives"
    notifications ||--o{ notification_state_log : "has"
    notifications ||--o| dead_letter_queue : "may end in"
    users ||--o{ user_preferences : "configures"
```

## Key Architecture Decisions

### ADR-001: Modular Monolith over Microservices
**Decision:** Single Node.js application with clear module boundaries.
**Reason:** 15-day timeline. Microservices would add operational complexity without benefit at this scale. Modules are designed to be extractable into services later.

### ADR-002: Kafka for Event Ingestion
**Decision:** Apache Kafka as the primary event bus.
**Reason:** Handles 1M+ messages/second, provides replay capability, and partition-based parallelism. Critical for handling market crash scenarios with 450K simultaneous events.

### ADR-003: Redis for Frequency Capping
**Decision:** Redis atomic INCR operations for frequency capping.
**Reason:** Sub-millisecond latency, atomic operations prevent race conditions where two workers both think a user has 11 notifications and both send, pushing to 13.

### ADR-004: Circuit Breaker per Provider
**Decision:** Separate circuit breaker instance per delivery provider.
**Reason:** Each provider has different reliability characteristics. A single global circuit breaker would be too coarse-grained.

### ADR-005: Hexagonal Architecture for Templates
**Decision:** Templates defined as configuration, not code.
**Reason:** Adding a new language or event type requires only a new template entry, not a code deployment.