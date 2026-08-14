---
ng-advanced-table: patch
---

Bound public table-state comparisons and global-filter traversal so cyclic, deeply nested, or excessively broad consumer values terminate safely instead of exhausting the call stack or CPU.

Harden the showcase MCP endpoint with wire-byte validation, a 32-message JSON-RPC batch ceiling, and a 512 KiB aggregate response budget. Normal single requests and small batches remain unchanged, including parsed requests whose underlying Node stream has already been consumed by the hosting runtime.
