# Spec 008 — Frontend UI Polish

## Status

Draft. Do not implement until this specification is approved.

## Goal

Improve the existing React frontend so it is simple, professional, accessible, and reasonably responsive without changing application behavior, routes, API contracts, or state-management architecture.

## Scope

- Add Tailwind CSS using its Vite integration and one global stylesheet entry point.
- Establish a restrained visual foundation for page width, spacing, typography, colors, borders, focus states, and responsive breakpoints.
- Polish the shared application header and main content layout.
- Improve the task list, create form, edit form, filters, pagination, and all existing request states.
- Make the existing screens usable on narrow mobile widths as well as common desktop widths.
- Add small shared presentational components only where they clearly remove repeated markup or keep interaction styles consistent.
- Update page metadata such as the document title and theme color where appropriate.

This is a visual and usability pass. Existing TanStack Router search state, TanStack Query behavior, typed API functions, mutations, cache invalidation, routes, and backend behavior must remain intact.

## Constraints

- Keep the design restrained and professional; use a neutral palette with one modest accent color.
- Use the current Tailwind CSS Vite plugin approach (`tailwindcss` and `@tailwindcss/vite`). Do not add a UI kit, icon library, CSS-in-JS library, form library, or other unnecessary dependency.
- Do not change backend code, endpoint behavior, DTOs, validation rules, or CORS behavior.
- Do not rewrite working data-fetching, query-key, mutation, router, or URL-search logic.
- Preserve `/`, `/tasks`, `/tasks/new`, and `/tasks/$taskId/edit` and all existing user flows.
- Do not add authentication, optimistic updates, new product features, or project-management screens.
- Do not introduce a design system or large React architecture refactor.
- Reuse components only when doing so clearly reduces duplication. Composition-pattern refactoring is out of scope unless implementation reveals an obvious component-structure problem.
- Prefer semantic HTML and native controls. Do not replace working controls with custom widgets solely for appearance.
- Avoid animations. If a very small transition is useful, limit it to a specific visual property and respect reduced-motion preferences.
- Preserve confirmation before deletion and prevent repeated pending mutations.
- Do not hide useful cached data during background refetching.

## UI Areas to Improve

### Application shell

- Add a centered, readable content width with responsive horizontal padding and consistent vertical rhythm.
- Turn the header into a clear application bar with an identifiable title and visible current-route navigation state.
- Add a keyboard-visible skip link to the main content and maintain a logical heading hierarchy.
- Ensure navigation remains usable without wrapping or overflowing on small screens.

### Task list

- Give the screen a clear heading, supporting summary, and prominent **New Task** action.
- Present each task in a scannable row or card with title, project, and completion status separated by visual hierarchy rather than punctuation.
- Use an understandable, text-backed status treatment; do not rely on color alone.
- Keep long task and project names from breaking the layout.
- Keep edit and delete actions discoverable, keyboard accessible, and large enough for touch use.
- Make the pending delete state specific to the affected task and show delete failures near the list actions.

### Filters and pagination

- Group filter controls in a clearly labeled section with consistent labels, control heights, spacing, and responsive layout.
- Retain the existing explicit **Apply Filters** behavior and URL-backed filter state.
- Keep all controls visible and usable on mobile without horizontal page scrolling.
- Present result count, current page, total pages, and background-refresh status without duplicate or contradictory metadata.
- Style previous and next controls with clear disabled, hover, active, and focus-visible states.
- Preserve the explicit empty-result behavior rather than displaying “Page 1 of 0.”

### Create and edit forms

- Use a focused form layout with a clear heading, short supporting text where useful, and sensible maximum width.
- Give every control a persistent label and consistent input, select, and checkbox styling.
- Add meaningful `name` and `autocomplete` attributes where applicable without changing submitted API data.
- Keep validation feedback next to the affected field and associate it with the field programmatically.
- Make form-level errors distinct, understandable, and announced to assistive technology.
- Clearly distinguish primary submit actions from navigation actions.
- Preserve current project-selection, title-length, completion, disabled, and pending behavior.

### Loading, empty, and error states

- Use consistent state containers with a heading or concise message, supporting guidance, and an action when one is useful.
- Distinguish initial loading from background refreshing; keep existing content visible during a refetch.
- Distinguish an empty task database from no tasks matching active filters.
- Keep retry actions for failed queries and make network errors explain the likely next step.
- Preserve deliberate invalid-ID and task-not-found screens with a clear route back to the task list.
- Announce asynchronous validation, mutation, retry, and refresh feedback with appropriate live regions without causing noisy repeated announcements.

### Responsive behavior

- Support a practical narrow viewport around 320 CSS pixels without clipped controls or horizontal page scrolling.
- Stack filters, form actions, task metadata, and pagination where needed on small screens; use denser horizontal layouts only when space allows.
- Keep controls and actions comfortably targetable on touch devices.
- Verify layouts with short, normal, and maximum-length task and project names.

## Acceptance Criteria

1. Tailwind CSS is installed through the official Vite plugin, imported from the frontend stylesheet, and used for the UI; no component library is added.
2. The production frontend build succeeds and the existing application starts through the current package scripts.
3. All existing routes, redirects, URL search parameters, filters, sorting, pagination, create, edit, delete, retry, and cache-refresh behavior remain unchanged.
4. No backend files or API contracts are changed.
5. The application has a cohesive shell, consistent typography and spacing, a restrained color palette, and clear visual hierarchy.
6. The task list clearly communicates title, project, completion status, available actions, result count, page position, and background refreshing.
7. Filter controls and pagination remain fully functional and are usable at narrow and desktop widths.
8. Create and edit forms have persistent labels, visible required/error states, clear primary actions, and pending states that prevent repeat submission.
9. Initial loading, refreshing, unfiltered empty, filtered empty, validation error, not-found, network error, mutation error, and retry states are visually deliberate and understandable.
10. Every interactive element has visible hover and focus-visible treatment; disabled controls are visually distinct without becoming unreadable.
11. Navigation uses links, actions use buttons, controls have accessible names, and the page uses semantic landmarks and a logical heading order.
12. Field errors are associated with their inputs, relevant asynchronous feedback uses a suitable live region, and status is not conveyed by color alone.
13. Keyboard users can skip to main content and operate navigation, filters, forms, task actions, retry actions, and pagination without a pointer.
14. The UI remains usable at approximately 320px width with no unintended horizontal page scrolling and no overlapping or clipped content.
15. Long task titles, project names, error messages, and empty content do not break the layout.
16. No unnecessary animation, large component abstraction, duplicated server state, or broad React architecture refactor is introduced.
17. Manual verification covers the existing happy paths and error/empty/loading states at mobile and desktop viewport sizes.

## Suggested Implementation Order

1. Record the current routes and core flows for regression checks, then add Tailwind CSS through the Vite plugin and import a global stylesheet.
2. Add minimal global foundations: page background, text defaults, focus-visible treatment, selection color, and safe responsive sizing.
3. Polish the root application shell, skip link, header, navigation, main content width, and page metadata.
4. Polish the task-list heading, summary, filter section, task rows/cards, actions, and long-content handling without changing route or query logic.
5. Polish result metadata and pagination, including disabled and background-refresh states.
6. Polish create and edit forms, field descriptions, validation associations, pending controls, and form-level errors.
7. Unify loading, empty, not-found, network-error, mutation-error, and retry presentations; extract a small shared state component only if duplication justifies it.
8. Check keyboard navigation, focus order, accessible names, live feedback, contrast, touch target sizing, and reduced-motion behavior.
9. Verify the UI at narrow mobile and desktop widths with short and long content, then run the production build and regress every existing route and mutation flow.
