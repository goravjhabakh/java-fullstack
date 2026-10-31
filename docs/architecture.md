# Architecture

This document records architecture decisions as the project grows.

Do not design future infrastructure before it is required.

## Current architecture

The application is a single Spring Boot backend that exposes an HTTP/JSON Task API and persists tasks in PostgreSQL.

Current request flow:

```mermaid
flowchart LR
    Client --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> JPA[Spring Data JPA / Hibernate]
    JPA --> PostgreSQL
```

## Current decisions

### Monolith first

Start with a single Spring Boot application.

Reason:

The current goal is learning Spring fundamentals, not distributed systems.

### REST API

The backend will expose HTTP/JSON endpoints.

### PostgreSQL persistence

Tasks are stored in PostgreSQL rather than an in-memory Java collection.

Reason:

Tasks must persist independently of the running application and remain available after a restart.

### Spring Data JPA and Hibernate

Spring Data JPA provides the task repository abstraction. Hibernate is the JPA implementation that maps the `Task` entity to the PostgreSQL `tasks` table and performs persistence operations.

### Flyway migrations

Flyway owns database schema creation and schema history through versioned SQL migrations. Hibernate validates the schema rather than creating or changing it.

## Future decisions

Add architecture decisions here only when they are actually introduced.
