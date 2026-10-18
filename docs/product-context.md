# Product context and deferred application requirements

This document preserves founder decisions needed across tools and conversations. It is context for the library, not authorization to build unrelated products in this repository.

## Direction

- The intended company purpose is: **«Ayudar a las personas a vivir mejor mediante entrenamiento, alimentación y hábitos.»**
- The first product is a strength-training application, provisionally Gravis. A nutrition/recipe product and company organization come later.
- The founder is currently working alone and expects quality gates, branches and reviewable changes from the start.
- Fitness development has three stages: functional core; extra/differentiating functionality; AI coach. Prepare appropriate data boundaries early, but do not implement the coach ahead of the core.
- Start with a mobile-friendly web experience; native apps later. Apple and Google sign-in are requirements for the future application, not this public library.
- The exercise library is valuable independently: other projects should be able to import and reuse it. The website is one consumer. The founder wants modern demonstrations and broad coverage including strength, calisthenics and functional/CrossFit-style movements, not a permanent eight-exercise pilot.
- Competitor coverage can inform research. It does not authorize copying their code, descriptions or media. The implementation and content here are original.

## FDB-001 — Previous performance must preserve routine context

Captured 2026-10-18 from a user report supplied by the founder. The reported Hevy behavior is that the “Previous” column for pull-ups shows the latest performance across all workouts, even when the user wants the previous performance in the same strength or hypertrophy routine. The behavior and the claim that it has existed since launch have not been independently reproduced. The original post URL and author were not confirmed; mentions of Hevy/Guillem Ros are not sufficient to establish authorship.

Requirement candidate for the fitness core:

- In a routine-based workout, prefer **“Previous in this routine”**, with date and results from the last comparable execution in that routine.
- Offer **“Last performed, any routine”** separately with explicit scope.
- If that routine has no prior execution, say so rather than silently substituting a global reference.
- Use stable routine, version, planned exercise and session identities; renaming a routine must not discard its historical association.

Acceptance examples: perform pull-ups in Strength, then Hypertrophy, then reopen Strength; the contextual reference comes from Strength. A new routine must not imply that a global performance occurred in that routine. A separate global view can still show the latest execution across routines.

Pending design decisions: comparability across variants, substitutions, duplicated exercises in one routine, routine versions/copies, free workouts and incomplete sessions/sets. This belongs in private application history, not in public exercise records or the package API. Do not introduce user history, routine IDs or account data into this repository's catalogue to implement it.
