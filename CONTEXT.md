# Angular Advanced Table

Language for the table library and its companion packages.

## Language

**Table Action**:
A user-triggered operation that acts on a table's rows or presentation state. It can be exposed through any interactive control; toolbar placement is optional, not defining.
_Avoid_: Toolbar action, toolbar item action when the behavior is not toolbar-specific.

**Table Data Export**:
A Table Action that produces a file or hands resolved table data to an application-owned export operation. By default it exports all rows currently held by the client table as CSV, not all records that might exist in an external data source.
_Avoid_: Excel export when the API is format-neutral.

**Manual Data Handling**:
An app-owned data pipeline where the table receives rows that have already been paginated, sorted, filtered, or otherwise prepared outside the table. Server-side data is one possible Manual Data Handling implementation, not the category name.
_Avoid_: Server-side data when the guidance also applies to local stores, workers, caches, or other external row pipelines.

**Export Handler**:
The operation that performs a Table Data Export once the table, rows, columns, and file name have been resolved. Applications can replace it to generate files through their own client code or backend APIs, including Excel exports.
_Avoid_: Writer when the application may own more than workbook serialization.

**Documentation Topic**:
A subject-oriented guide for one table capability or workflow that can contain explanation, code, API notes, and live examples together.
_Avoid_: Docs page, example page when discussing the canonical organization unit.

**Documentation Group**:
A navigation grouping for related Documentation Topics, named around consumer learning goals such as Start, Core Model, Capabilities, Accessibility and UX, or Advanced.
_Avoid_: Section when it could mean a heading inside a topic.

**Table Capability**:
A user-visible table behavior or workflow, such as column sizing, row selection, data lifecycle states, or keyboard interaction, that may justify documentation when consumers need to configure or compose it.
_Avoid_: Package when grouping user-facing documentation.

**Example Gallery**:
A small set of standalone demos for broad scenarios or interactive tools that are useful outside a single Documentation Topic.
_Avoid_: Feature examples, examples section when it implies one route per table capability.

**Topic Example**:
An embedded live demonstration inside a Documentation Topic, paired with source code and explanatory guidance for the capability being taught.
_Avoid_: Standalone example when the demo exists to teach one topic.

**Docs Block**:
A reusable authoring primitive for Documentation Topics, such as Markdown prose or a Topic Example, that keeps rich pages easy to compose.
_Avoid_: MDX when referring to the project-owned Angular authoring model.

**Topic Layout**:
The shared page structure that renders ordered Docs Blocks consistently across Documentation Topics.
_Avoid_: Custom page template for ordinary topic pages.

**Usage Boundary**:
The short guidance in a Documentation Topic that explains when to use a capability and what responsibility stays with the consuming application or another package.
_Avoid_: API reference when the content is about ownership and fit.
