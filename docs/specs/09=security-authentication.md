# Spec 009 — Security and Authentication

## Status

Completed.

## Goal

Introduce Spring Security and add username/password authentication to the existing Spring Boot and React application.

After this spec, a user should be able to register, log in, use the existing project and task features with only their own data, and log out. Anonymous requests must not be able to use the project or task APIs.

This phase should teach Spring Security's standard request-processing model. It must not become an exercise in inventing a custom authentication framework.

## Context

The application currently has:

- a Spring Boot HTTP/JSON API;
- PostgreSQL persistence managed by Spring Data JPA, Hibernate, and Flyway;
- `Project` and `Task` entities, where every task belongs to one project;
- task listing, filtering, searching, sorting, pagination, creation, editing, and deletion;
- a separate React + TypeScript frontend using TanStack Router and TanStack Query; and
- centralized CORS configuration for the Vite development origin.

There is currently no user identity. Every caller can read and change every project and task. The existing CORS policy only controls which browser origins may make requests; it does not authenticate or authorize a person.

This spec adds a security boundary around the existing application while preserving its behavior for an authenticated owner.

## Authentication Approach and Rationale

### Session/cookie and JWT comparison

| Concern | Server-side session with cookie | JWT bearer token |
| --- | --- | --- |
| Basic model | The browser stores an opaque session ID in a cookie; Spring stores the authenticated `SecurityContext` in the server session | The client stores and sends a signed token containing identity/claims |
| Spring Security learning value | Directly demonstrates the filter chain, `SecurityContext`, session persistence, form login, and logout conventions | Adds token creation, signing keys, claims, bearer-token filters, expiry, and token lifecycle concerns |
| Frontend work | Send requests with credentials and maintain current-user UI state | Decide secure token storage, attach bearer headers, handle expiry, and often design refresh behavior |
| Logout | Invalidate the server session and clear the cookie | A self-contained access token normally remains valid until expiry unless revocation is added |
| Revocation | Immediate when the session is invalidated | Usually needs short expiry, a denylist, key rotation, or another stateful mechanism |
| CSRF | Relevant because the browser sends cookies automatically; keep Spring Security CSRF protection enabled | Usually not relevant when a bearer token is sent only in an explicit header, but token storage introduces different browser risks |
| Scaling | Session state may later need shared storage if multiple backend instances are introduced | Can be stateless across instances, but that benefit is not needed by this monolith |
| Complexity here | Lower | Higher without solving a current project requirement |

### Decision

Use **server-side session authentication with an HttpOnly session cookie**.

This is the simpler and more appropriate choice because the application is a single Spring Boot monolith with one browser frontend. It teaches Spring Security's core servlet architecture without first building token issuance, token validation, expiry, refresh, and revocation behavior. JWT is not inherently more secure and does not provide a useful benefit for this project's current architecture.

The browser must not store a password, session ID, or authentication token in `localStorage` or `sessionStorage`. The servlet container owns the session cookie. JavaScript owns only non-secret current-user display state and the current CSRF token needed for unsafe requests.

JWT can be studied later if a real requirement appears, such as independently deployed resource servers or non-browser API clients. Do not add JWT or refresh tokens in this spec.

### Related decisions

- Use a unique username as the login identifier. Email-based login is not required.
- Registration does **not** automatically authenticate the user. After successful registration, the user logs in explicitly. This keeps registration and authentication as two visible learning steps.
- Registration creates one owned **Default Project** in the same transaction. The current frontend has no project-creation screen, so this preserves the existing task-creation flow for a new user.
- A project is directly owned by one user. A task is owned indirectly through its required project. Do not duplicate `user_id` on tasks.
- Do not add a persisted role model yet. All registered users have the same basic `ROLE_USER` authority, supplied by the security user-details layer. The useful authorization rules in this application are “must be authenticated” and “must own the requested data.”
- When an authenticated user requests another user's project or task by ID, respond as if it were not found (`404`) rather than revealing that the resource exists. A genuine authority denial or invalid/missing CSRF token remains `403`.

## Requirements

### Spring Security foundation

- Add the Spring Security starter and its test support.
- Define one explicit `SecurityFilterChain` bean using current Spring Security configuration conventions.
- Integrate CORS with the security filter chain so valid preflight requests are handled before authentication decisions.
- Permit the minimum public authentication operations needed for registration, login, and obtaining a CSRF token.
- Require authentication for `/tasks/**`, `/projects/**`, current-user information, and every other application endpoint unless it is deliberately public.
- Return API-appropriate status responses rather than redirecting API requests to an HTML login page:
  - `401 Unauthorized` when authentication is missing or login credentials are invalid;
  - `403 Forbidden` when an authenticated request is not allowed or a required CSRF token is invalid; and
  - `404 Not Found` for another user's resource when ownership-scoped lookup intentionally hides its existence.
- Keep security configuration centralized. Do not scatter path rules through controllers or manually inspect session cookies.

### User persistence and registration

- Add a persisted `User` entity in an authentication/user package and map it to a non-reserved table name such as `app_users`.
- Store at least:
  - generated ID;
  - unique normalized username;
  - BCrypt password hash; and
  - account-enabled state only if it is needed for the legacy-data migration described below.
- Validate registration input on the backend. Use a practical username length/character policy and a password minimum; reject blank or excessively long values.
- Normalize usernames consistently before checking uniqueness, storing, and authenticating. A simple lowercase username policy is sufficient.
- Return `409 Conflict` with the established API error shape when a username already exists.
- Hash the password with a Spring Security `PasswordEncoder` using BCrypt before persistence.
- Never persist, return, log, or include the raw password in an exception.
- Return a safe user response containing only fields such as `id` and `username`; never serialize the user entity or password hash.
- Create the new user and their Default Project in one transaction so registration cannot leave partial data.

### Login, current user, and logout

- Use Spring Security's username/password authentication mechanism and authentication filters rather than comparing passwords in a controller.
- Configure `POST /auth/login` as the login-processing endpoint. A form-encoded username/password request is acceptable and keeps authentication inside Spring Security's standard filter.
- On successful login, establish the HTTP session and return an API-friendly success response such as `204 No Content`.
- On failed login, return `401` with a non-specific message. Do not reveal whether the username or password was wrong.
- Provide `GET /auth/me` for the frontend to load the authenticated user's safe identity. An anonymous call returns `401`.
- Configure `POST /auth/logout` through Spring Security's logout support. It must invalidate the session, clear the security context/session cookie, and return an API-friendly success response such as `204 No Content`.
- Do not implement “remember me” in this spec.

### CSRF protection

- Keep Spring Security's CSRF protection enabled. Session-cookie authentication is not a reason to disable it.
- Provide a public safe endpoint such as `GET /auth/csrf` that exposes the generated token and header name to the React application without exposing authentication secrets.
- The frontend must send the current CSRF token in the expected header for every unsafe request, including registration, login, logout, project creation, task creation, task update, and task deletion.
- Fetch a fresh CSRF token on application startup and again after login and logout because authentication/logout may clear or rotate the token.
- A missing or invalid token on an unsafe request must produce `403` and must not change data.
- Do not disable CSRF merely to make Postman, tests, or the frontend easier to configure.

### Protect projects and tasks by ownership

- Add a mandatory owner relationship from `Project` to `User`.
- Derive task ownership through `task.project.owner`; do not add a second owner column to `tasks`.
- Obtain the current authenticated principal from Spring Security, preferably with `@AuthenticationPrincipal` at the web boundary, and pass a stable user ID into application services.
- Every project read/create operation must use the authenticated owner.
- Every task list, detail, create, update, and delete operation must be scoped to the authenticated owner.
- Make ownership part of repository queries or mandatory JPA specifications where practical. Do not load all rows and filter them in Java.
- The mandatory task-list owner predicate must compose with the existing completion, project, title, sorting, and pagination behavior.
- Creating a task under another user's project must fail without revealing or modifying that project.
- Updating or deleting a task by another user must fail without changing it.
- Client-supplied IDs never establish ownership. The backend must always verify the relationship against the authenticated principal.

### Frontend authentication integration

- Add simple `/register` and `/login` routes with accessible username/password forms.
- Keep raw passwords only in short-lived form state. Do not place them in TanStack Query caches, router search parameters, browser storage, or logs.
- Extend the shared fetch helper to:
  - use `credentials: "include"` so the browser sends and receives the session cookie across the Vite/Spring origins;
  - attach the current CSRF header to unsafe requests; and
  - preserve typed handling for `204`, validation errors, `401`, `403`, `404`, and network failures.
- Represent `GET /auth/me` as server state, preferably with one deliberate TanStack Query key. Do not maintain a second independent `isAuthenticated` boolean that can disagree with the server.
- Protect task routes in the router/UI. While authentication is being checked, show a deliberate loading state; when the check returns `401`, navigate to `/login` and preserve a simple safe return destination if useful.
- A frontend route guard improves user experience but is not security. Backend endpoint rules and ownership checks remain authoritative.
- After login, refresh current-user state and navigate to the task list.
- Show the authenticated username and a logout action in the shared application shell.
- After logout, remove current-user, task, project, and task-detail query data before showing the login screen. Cached data from one user must never appear briefly to the next user.
- Handle an expired/invalid session consistently: a protected API `401` should clear protected cached state and lead the user back to login without creating redirect loops.
- Preserve all existing authenticated task behavior, including filters, search, sorting, pagination, creation, editing, deletion, loading states, and errors.

### CORS with credentials

- Continue to allow only the configured Vite development origin, normally `http://localhost:5173`; do not use `*`.
- Enable credentialed CORS because the browser must send the session cookie.
- Add `/auth/**` to the centralized CORS coverage.
- Allow only the methods and headers required by the API, including the selected CSRF request header and `Content-Type`.
- Ensure preflight `OPTIONS` requests can complete without being rejected as anonymous.
- Configure CORS in one place that is used by Spring Security. Do not maintain conflicting MVC and security CORS policies.
- Understand that CORS, cookie policy, CSRF, authentication, and authorization solve different problems.

### Minimal meaningful tests

Add a small security-focused test set rather than a broad generated suite. It should prove at least:

1. registration stores an encoded password rather than the submitted password;
2. an anonymous project/task request receives `401`;
3. missing or invalid CSRF on an unsafe request receives `403`;
4. a logged-in user can perform one representative existing project/task flow;
5. user B cannot read, update, or delete a representative resource owned by user A; and
6. the same session no longer accesses protected data after logout.

Reuse the project's current testing style. Keep fixtures small and make user ownership explicit. Do not add a large test framework or attempt exhaustive Spring Security testing in this phase.

## Constraints

- No OAuth, OpenID Connect, or social login.
- No Clerk, Auth0, or other external authentication provider.
- No JWT access tokens or refresh-token system.
- No email verification, password reset, MFA, account recovery, or account administration.
- No advanced RBAC, permission matrix, admin dashboard, or role-management UI.
- No microservices or separate authentication service.
- No custom authentication protocol, handwritten password comparison, or manual cookie parsing.
- Use Spring Security conventions, filters, `SecurityFilterChain`, `PasswordEncoder`, `UserDetailsService`/authentication provider support, and logout support.
- Keep CSRF enabled for session-authenticated unsafe requests.
- Never store raw passwords or session identifiers in browser storage.
- Do not expose JPA entities directly from auth endpoints.
- Do not trust frontend route guards or submitted owner IDs as authorization.
- Keep the frontend auth UI simple and consistent with the existing application.
- Preserve the existing endpoint behavior and response DTOs where ownership does not require a change.
- Keep tests minimal and behavior-focused.
- Do not implement application code while writing this specification.

## Learning Objectives

By completing this spec, the learner should understand:

1. **Authentication versus authorization** — authentication establishes who the caller is; authorization decides what that caller may do.
2. **Spring Security filter chain** — security filters run before the controller and can authenticate, reject, apply CSRF protection, or establish request security context.
3. **`SecurityFilterChain`** — how path rules, form login, logout, CORS, CSRF, and exception responses are configured using Spring beans rather than the older adapter style.
4. **Request authentication flow** — how submitted credentials reach an authentication filter, authentication manager/provider, user-details lookup, and password encoder.
5. **Password storage** — why passwords are one-way hashed with a slow adaptive algorithm and never decrypted or stored as plaintext.
6. **`PasswordEncoder` and BCrypt** — why `encode` is used at registration and `matches` is used by the authentication provider at login, including BCrypt's built-in salt.
7. **`SecurityContext`** — how Spring represents the current authenticated `Authentication` for one request.
8. **Session persistence** — how the security context is restored from the server-side session using the opaque session cookie on later requests.
9. **Authenticated principal** — how application code obtains a safe current-user identity without parsing credentials or cookies.
10. **Endpoint protection** — why authorization in the backend is mandatory even when React hides or redirects protected screens.
11. **Ownership authorization** — how repository/service operations include the current owner and why knowing a database ID grants no permission.
12. **`401` versus `403`** — `401` means valid authentication is absent; `403` means the request is understood but not permitted, including CSRF failures. Ownership lookups may deliberately use `404` to avoid leaking resource existence.
13. **CSRF** — why automatically sent cookies create a cross-site request risk and why unsafe requests require a second value an attacker cannot supply.
14. **CORS with authentication** — why credentialed requests require an exact trusted origin, backend credential permission, and frontend `credentials: "include"`.
15. **Session/cookie versus token authentication** — the trade-offs, lifecycle, logout, storage, and scaling characteristics of both approaches, and why session authentication was selected here.
16. **Frontend authentication state** — why current-user identity is server state, while form values and a temporary CSRF value are client state.
17. **Cache isolation** — why protected TanStack Query data must be removed when a session ends or a different user logs in.
18. **Defense in depth** — route guards improve UX, endpoint rules block anonymous access, and ownership-scoped queries block cross-user data access.

TypeScript/Node comparison: this resembles an Express application using a session middleware, authentication middleware, password hashing library, and `req.user`. Spring Security supplies the filter chain, authentication abstractions, security context, session integration, CSRF protection, and authorization hooks as coordinated framework conventions instead of unrelated middleware assembled manually.

## Expected Authentication Flow

### Registration

```text
React registration form
  -> fetch CSRF token if needed
  -> POST /auth/register + CSRF header
  -> validation
  -> normalize username
  -> BCrypt PasswordEncoder.encode(raw password)
  -> transaction saves User + owned Default Project
  -> 201 safe user response
  -> React navigates to login
```

### Login and authenticated request

```text
React login form
  -> POST /auth/login + credentials + CSRF header
  -> Spring Security authentication filter
  -> AuthenticationManager / provider
  -> persisted user-details lookup
  -> PasswordEncoder.matches(raw password, stored BCrypt hash)
  -> SecurityContext established and saved in HTTP session
  -> browser receives HttpOnly session cookie
  -> React refreshes CSRF token and GET /auth/me

Later project/task request with credentials
  -> browser sends session cookie
  -> Spring Security restores SecurityContext
  -> authorization rule requires authentication
  -> controller receives authenticated principal
  -> service/repository scopes query by owner ID
  -> only that user's data is returned or changed
```

### Logout

```text
React logout action
  -> POST /auth/logout + session cookie + CSRF header
  -> Spring Security logout support
  -> session invalidated and SecurityContext cleared
  -> 204 response and cookie cleared
  -> React clears protected query caches
  -> React obtains a fresh anonymous CSRF token as needed
  -> React shows login screen
```

## Expected Backend and Frontend Architecture Changes

One reasonable target structure is:

```text
backend/src/main/java/com/example/backend/
├── config/
│   ├── SecurityConfig.java          # filter chain, CORS integration, auth responses
│   └── WebConfig.java               # remove or narrow if CORS moves to SecurityConfig
├── auth/
│   ├── AuthController.java          # register, current user, CSRF token response
│   ├── AuthService.java             # transactional registration
│   ├── RegisterRequest.java
│   └── AuthUserResponse.java
├── user/
│   ├── User.java
│   ├── UserRepository.java
│   └── application user-details/principal support
├── project/                         # owner relationship and owner-scoped operations
└── task/                            # mandatory owner-scoped queries/specifications

frontend/src/
├── api/
│   ├── client.ts                    # credentials, CSRF header, typed status handling
│   └── auth.ts                      # register, login, me, logout, CSRF
├── auth/                            # small current-user/auth boundary only if useful
└── routes/
    ├── login.tsx
    ├── register.tsx
    ├── __root.tsx                   # authenticated identity and logout action
    └── tasks...                     # protected existing routes
```

Exact filenames may follow the current package and TanStack Router conventions. Do not split this small feature into interfaces and wrappers that do not yet solve a concrete problem.

Responsibilities:

| Component | Responsibility |
| --- | --- |
| `SecurityFilterChain` | Order and configure CORS, CSRF, authentication, logout, path authorization, and API status handling |
| User-details/authentication provider | Load the persisted user and verify the submitted password through `PasswordEncoder` |
| `SecurityContext` and HTTP session | Carry and persist the authenticated principal between requests |
| Auth controller/service | Registration, safe current-user response, CSRF token exposure, and registration transaction |
| Project/task services and repositories | Enforce ownership for every protected data operation |
| React auth routes | Collect registration/login input and display useful pending/error states |
| TanStack Query current-user query | Represent server-confirmed authentication state |
| Shared API client | Include credentials and CSRF headers and translate HTTP failures |
| TanStack Router guards/layout | Prevent confusing protected-screen rendering and redirect anonymous users |
| PostgreSQL | Persist users, password hashes, project ownership, projects, and tasks |

## Database Changes

Create a new Flyway migration after `V2__add_projects_and_task_relationship.sql` that:

1. creates `app_users` with a generated primary key, unique normalized username, password-hash column large enough for BCrypt, and any minimal enabled flag required by the migration strategy;
2. adds `user_id` to `projects`;
3. creates the foreign key from `projects.user_id` to `app_users.id`;
4. creates an index supporting owner-scoped project queries; and
5. finishes with `projects.user_id` non-null.

The migration must work against an existing V2 database. Preserve existing rows by assigning existing projects to a clearly named disabled legacy owner with no usable application password, then make the foreign key non-null. Legacy rows remain preserved but are not exposed to newly registered users. Do not leave ownerless/shared projects accessible as a shortcut. Development data can instead be recreated through normal registration after the migration.

Do not add `user_id` to `tasks`: the existing non-null `tasks.project_id` relationship already provides an unambiguous ownership path.

Expected relationship:

```text
app_users 1 ---- * projects 1 ---- * tasks
```

Passwords in `app_users` are BCrypt hashes, not encrypted plaintext. A hash is never included in an API response.

## Functional Acceptance Criteria

The spec is functionally complete when all of the following are verified:

1. Spring Security is active and the application defines an explicit `SecurityFilterChain`.
2. A valid new user can register and receives a safe response without a password or hash.
3. Invalid registration data is rejected with useful validation errors.
4. Registering a duplicate normalized username returns `409` without exposing internals.
5. The database stores a BCrypt hash that differs from the submitted password.
6. Successful registration atomically creates an owned Default Project.
7. Valid credentials at `POST /auth/login` create a session and return an API-friendly success response.
8. Invalid credentials return `401` with no username-enumeration detail.
9. `GET /auth/me` returns the safe authenticated identity and returns `401` without a valid session.
10. Anonymous requests cannot list, read, create, update, or delete projects or tasks and receive `401`.
11. Authenticated users retain all existing task filtering, searching, sorting, pagination, create, edit, and delete behavior for their own data.
12. Project lists contain only the authenticated user's projects.
13. Task lists contain only tasks whose project belongs to the authenticated user, including when filters are combined.
14. A user cannot create a task under another user's project.
15. A user cannot read, update, or delete another user's task or project by guessing an ID.
16. Cross-owner resource requests use the selected non-disclosing `404` behavior and never change data.
17. Unsafe requests without a valid CSRF token return `403` and never change data.
18. The frontend sends cookies with API requests and can authenticate across the local Vite and Spring origins.
19. Credentialed CORS uses the exact configured frontend origin, covers auth routes, and permits required preflights without using `*`.
20. `/register` and `/login` provide simple accessible forms with validation, pending, and error states.
21. Protected frontend routes wait for the current-user check and redirect an anonymous user to login.
22. The shared shell displays the authenticated username and a logout action.
23. Logout invalidates the session; reusing the previous session cannot access a protected endpoint.
24. Logout and session-expiry handling clear protected TanStack Query caches so one user's data is not shown to another.
25. Passwords and session identifiers are absent from API responses, logs, URLs, TanStack Query caches, and browser storage.
26. The backend checks pass, the frontend production build succeeds, and the focused security tests pass.

## Learning Acceptance Criteria

The spec is complete only when the learner can explain, in their own words:

1. The difference between proving identity and deciding permission.
2. Why CORS did not secure the existing endpoints.
3. Where the Spring Security filter chain runs relative to controllers.
4. What the `SecurityFilterChain` bean configures.
5. The steps from a submitted username/password to an authenticated `SecurityContext`.
6. Why the application calls `PasswordEncoder.encode` at registration but the provider uses password matching at login.
7. Why BCrypt hashes for the same password need not be identical and why plaintext passwords cannot be recovered from them.
8. What the session cookie contains conceptually and where the authenticated state is actually stored.
9. How Spring restores authentication on a later request.
10. What an authenticated principal is and how project/task code obtains it.
11. Why React route protection is useful but cannot authorize API operations.
12. How owner-scoped repository/service operations prevent insecure direct object reference behavior.
13. Why task ownership is derived through the project instead of duplicated on the task row.
14. When `401`, `403`, and the selected ownership-hiding `404` are used.
15. Why CSRF matters for cookie authentication and why `credentials: "include"` alone is not protection.
16. Why CORS must use a trusted exact origin when credentials are enabled.
17. Why login/logout require a fresh CSRF token in the SPA flow.
18. Why current-user information belongs to server state and why protected caches must be cleared on logout.
19. How session authentication and JWT authentication differ in storage, request handling, logout, revocation, and complexity.
20. Why session authentication is the better choice for this application now and what future requirement might justify revisiting it.

The learner should also be able to trace one authenticated task request from `fetch` through CORS, the security filters, session restoration, principal injection, owner-scoped query, PostgreSQL, and back to the React query cache.

## Suggested Implementation Order

Implement one meaningful step at a time:

1. Before changing code, call the current APIs anonymously and record the behavior that must become protected while preserving authenticated functionality.
2. Add the Spring Security dependencies and observe the default security behavior; explain why adding the starter changes every request.
3. Add an explicit minimal `SecurityFilterChain` with API-style `401`/`403` behavior and make the intended public/protected paths visible.
4. Add the user/ownership Flyway migration, run it against an existing V2 database, and inspect the resulting constraints and legacy ownership.
5. Implement the `User` entity/repository and safe response/request DTOs without adding login yet.
6. Add the BCrypt `PasswordEncoder`; implement transactional registration and verify the stored value is a hash and a Default Project is created.
7. Implement persisted user-details/principal loading and connect it to Spring Security authentication.
8. Configure filter-based `POST /auth/login` with API success/failure responses; verify session creation using an HTTP client before touching React.
9. Add `GET /auth/me` and verify that the same session restores the expected principal on a later request.
10. Configure Spring Security logout at `POST /auth/logout` and verify that the old session no longer authenticates.
11. Add the CSRF endpoint and test a safe request, an unsafe request without a token, and an unsafe request with a valid token. Keep protection enabled.
12. Update centralized CORS for exact-origin credentialed auth requests and verify preflight, cookies, and CSRF headers from the browser network panel.
13. Add project ownership and scope all project operations to the principal. Verify isolation with two users before changing tasks.
14. Add the mandatory owner predicate to task listing and task-by-ID operations; preserve all existing filters, sorting, and pagination.
15. Apply ownership to task creation, update, and deletion and verify guessed cross-user project/task IDs cannot change data.
16. Add typed frontend auth/CSRF API functions and update the shared client with credentials and unsafe-request CSRF headers.
17. Add the current-user query and application startup authentication check without duplicating authentication into a separate boolean store.
18. Add the login and registration screens, then verify backend validation, bad credentials, successful login, and post-registration login.
19. Protect the existing task routes and update the shared shell with current username and logout.
20. On logout and session expiry, clear protected caches and verify sequential logins by two users never display each other's cached data.
21. Add the focused security tests for password hashing, anonymous access, CSRF, owner access, cross-owner denial, and logout.
22. Regress every existing task flow as an authenticated user, run backend checks and the frontend production build, and inspect cookies, statuses, CORS headers, and CSRF headers in browser developer tools.
23. Explain the complete registration, login, authenticated request, ownership, CSRF, session-expiry, and logout flows before considering the spec complete.

## Design References

- [Spring Security — Servlet authentication architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html)
- [Spring Security — Form login](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/form.html)
- [Spring Security — Persisting authentication](https://docs.spring.io/spring-security/reference/servlet/authentication/persistence.html)
- [Spring Security — CSRF protection for servlet applications](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html)
- [Spring Framework — Spring MVC CORS](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)
