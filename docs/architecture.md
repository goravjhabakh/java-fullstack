# Architecture

This document records architecture decisions as the project grows.

Do not design future infrastructure before it is required.

## Current architecture

The application is a single Spring Boot backend that exposes an HTTP/JSON Task API and persists tasks in PostgreSQL.

The API supports task creation, retrieval, partial updates, deletion, optional filtering by completion status, and sorting by `id`, `title`, or `completed`.

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

The backend exposes HTTP/JSON task endpoints. Missing tasks are identified in the service layer and translated to `404 Not Found` responses by centralized exception handling.

`GET /tasks` supports optional `completed`, `sortBy`, and `direction` query parameters. `GET`, `PATCH`, and `DELETE /tasks/{id}` use path variables for task IDs.

### PostgreSQL persistence

Tasks are stored in PostgreSQL rather than an in-memory Java collection.

Reason:

Tasks must persist independently of the running application and remain available after a restart.

### Spring Data JPA and Hibernate

Spring Data JPA provides the task repository abstraction. Hibernate is the JPA implementation that maps the `Task` entity to the PostgreSQL `tasks` table and performs persistence operations.

The repository uses inherited CRUD and sorting operations plus a derived completed-status query. Task updates and deletes are coordinated by the service layer in transactions.

### Flyway migrations

Flyway owns database schema creation and schema history through versioned SQL migrations. Hibernate validates the schema rather than creating or changing it.

## Future decisions

Add architecture decisions here only when they are actually introduced.
