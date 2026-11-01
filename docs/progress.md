# Progress

## Current stage

Phase 6 — Authentication and Security complete.

## Active phase

Spec 009 complete. The application now has a secured full-stack baseline; choose the next learning phase before starting new implementation.

## Completed

- Learning workflow and repository documentation initialized
- Spec 001 — Spring REST Basics
- Spec 002 — API Validation and Errors
- Spec 003 — PostgreSQL and Spring Data JPA
- Spec 004 — Task CRUD and Querying
- Spec 005 — Project–Task Relationships
- Spec 006 — Pagination and Querying
- Spec 007 — React Frontend Integration
- Spec 008 — Frontend UI Polish
- Spec 009 — Security and Authentication
- Task CRUD, 404 handling, completed-status filtering, title search, sorting, pagination, and composable Spring Data JPA Specifications
- PostgreSQL/JPA project-task relationships and Flyway-managed schema migrations
- React + TypeScript frontend with Vite, TanStack Router, TanStack Query, accessible responsive Tailwind UI, and browser verification
- Session-based Spring Security authentication with BCrypt password hashing and server-side HTTP sessions
- Registration, login, current-user lookup, and logout; registration creates an owned Default Project
- CSRF protection for unsafe requests and credentialed, exact-origin CORS for the local Vite frontend
- Owner-scoped projects and tasks; cross-owner resources use non-disclosing `404 Not Found` responses
- Testcontainers-backed PostgreSQL integration tests for authentication, CSRF, session logout, and ownership isolation
- Frontend registration and login flows, protected task routes, session persistence after refresh, logout, and protected-cache clearing on logout or API `401`
- OpenCode global MCP setup available: Firecrawl, gh_grep, and Playwright

## Current focus

Review the completed authentication flow and select the next learning objective.

## Next

Plan Phase 7 — Production Engineering. Testcontainers integration testing is already in use; introduce the remaining production concerns only when they become useful.

## Notes

This repository is intentionally being built manually. AI should primarily teach, review, and explain rather than implement features.
