# Java Code Review

## Scope

Reviewed the current backend implementation from `4dcdc6d9b0b134e98a057b3c7d120c3f8d8b2b84` through the current working tree on 2026-11-01, including Spring Security configuration, authentication, user/project/task ownership, Flyway migration `V3`, CORS/CSRF, and tests.

Validation performed:

- `backend\mvnw.cmd test` — passed (7 tests) with a PostgreSQL 17 Testcontainers database.

## Summary

The backend follows the intended session-based Spring Security design well. Authentication is handled by Spring Security form login, passwords are BCrypt-hashed, protected controllers use the authenticated principal, and project/task access is scoped at the repository/query level by owner. No password hash or raw password is exposed by the API DTOs reviewed.

Findings: **0 Blocker, 0 High, 0 Medium, 0 Low**.

## Findings

No active findings after adding the PostgreSQL Testcontainers integration suite.

## Positive observations

- `SecurityConfig` has one explicit `SecurityFilterChain`, uses Spring Security's form-login and logout filters, returns API-oriented `204`/`401` outcomes, and disables HTTP Basic.
- CSRF remains enabled. `/auth/csrf` resolves and returns the framework token/header name, while CORS permits the known Vite origin, the CSRF header, and credentials without using a wildcard origin.
- `AppUserDetailsService` normalizes the login username before lookup; registration uses the same normalized storage policy.
- `PasswordEncoder` is BCrypt, and registration persists its output rather than the supplied password. `AuthUserResponse` exposes only ID and username.
- The V3 migration preserves existing project rows under a disabled legacy user, creates a non-null project owner foreign key, and does not duplicate `user_id` onto tasks.
- Controllers use `@AuthenticationPrincipal`; projects use owner-scoped repository methods; tasks use an owner predicate composed with the existing list filters and an owner-scoped ID lookup. Cross-user access therefore follows the selected non-disclosing `404` behavior.
- Registration and its Default Project creation are in one transaction.

## Changes made during review

- Added an explicit username character policy and user-facing validation messages in `RegisterRequest`.
- Ensured a database unique-constraint collision during concurrent registration becomes the required `409 Conflict` response.
- Added `backend/src/test/java/com/example/backend/auth/AuthServiceTest.java`, which verifies normalized username storage, BCrypt hashing, and Default Project ownership.
- Added a PostgreSQL Testcontainers integration base and focused MockMvc coverage for anonymous access, CSRF, session login, owner access, cross-user `404`, and logout invalidation.
- Removed the redundant empty context-smoke test; the request-level integration test already starts the complete application context, validates Flyway V1–V3, and exercises real PostgreSQL persistence.

## Validation

- `backend\mvnw.cmd test`: **passed** (7 tests). No `DB_URL`, `DB_USERNAME`, or `DB_PASSWORD` values were supplied; Spring Boot received connection details from the PostgreSQL Testcontainer.
