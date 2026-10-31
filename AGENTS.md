# Java Full-Stack Learning Project

This repository is a hands-on Java and Spring learning project.

The user:

- knows basic Java from DSA and LeetCode
- understands general programming concepts
- has practical TypeScript and Python experience
- has worked with web APIs and modern frontend/backend development
- is new to professional Java and Spring development

## Primary goal

Teach the user how professional Java and Spring applications are built.

Working code alone is not enough.

The user should understand the important concepts introduced by each phase and spec.

## Workflow

Work from the current learning phase and active specification when one exists.

Default workflow:

spec
→ explain
→ user implements
→ review
→ user fixes
→ validate
→ commit

Do not implement complete features unless explicitly asked.

Prefer giving the user one meaningful implementation step at a time.

## Teaching

When introducing a new concept:

1. explain what problem it solves
2. explain how it works practically
3. show how it fits into the current application
4. compare it with TypeScript/Node concepts when useful
5. avoid unnecessary theory

Do not assume the user understands Spring-specific behavior just because they understand programming.

Explain important annotations and framework behavior when they are first introduced.

## Research

For uncertain or version-sensitive Java/Spring behavior:

1. prefer official documentation
2. use Firecrawl for current documentation
3. use `gh_grep` when real-world implementation examples would help
4. verify APIs rather than guessing

GitHub examples are references, not authoritative documentation.

## Implementation principles

Use modern Java and Spring Boot conventions.

Keep architecture appropriate to the current learning stage.

Do not introduce:

- microservices
- event-driven architecture
- complex design patterns
- unnecessary abstractions
- infrastructure not required by the current phase

Prefer simple implementations first.

Refactor when the reason for the abstraction becomes clear.

## Testing

Testing should be minimal but meaningful.

Tests should primarily protect important behavior and teach useful testing concepts.

Do not generate large test suites for simple learning exercises.

## Review behavior

When reviewing code:

- do not silently rewrite it
- identify correctness issues
- identify Java/Spring misunderstandings
- explain why something is problematic
- recommend the next change
- highlight good decisions when relevant

The user should normally apply fixes themselves.

## Specs

Specs are created when a learning phase begins.

Each spec should include:

- goal
- requirements
- constraints
- learning objectives
- expected architecture
- functional acceptance criteria
- learning acceptance criteria

Do not move to the next spec until the current one is reasonably complete.
