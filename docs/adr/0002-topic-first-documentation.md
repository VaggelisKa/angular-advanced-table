# Topic-First Documentation Uses Angular Docs Blocks

User-facing documentation will be organized around Documentation Topics under `/docs/*` instead of separate docs and feature-example trees. Feature demos become Topic Examples embedded in those topics, while the Example Gallery is limited to broad standalone scenarios or tools, currently the multiple-features demo and table builder. Topic pages use a consistent Angular Topic Layout composed from Docs Blocks so prose can remain easy to author, live examples can render real Angular components with `Preview` and `Code` tabs, and the project avoids depending on an Angular-MDX layer that is weaker than the native Angular component model.

Generated API reference is intentionally deferred. Each topic should carry lightweight contextual API notes and Usage Boundaries until a dedicated reference system is valuable enough to justify its own tooling.

Quick start sits directly under the Docs section. The target Documentation Groups are Core Principles, Capabilities, Accessibility and UX, and Advanced. Composition belongs in Core Principles because it explains how the package pieces fit together. The Example Gallery keeps only the multiple-features demo and table builder. Removed one-feature example routes are not kept as compatibility redirects; those demos move into their relevant Documentation Topics.

Existing showcase implementations should be reused by extracting focused demo components for Topic Examples, not by embedding old standalone example pages with their route-level headings and layout.

Related-topic links are optional and should stay selective so they help users continue a workflow without pulling them into an unnecessary navigation detour.

Topic tables of contents are optional and manually curated per topic rather than inferred from every heading.
