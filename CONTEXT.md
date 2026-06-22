# Angular Advanced Table

Language for the table library and its companion packages.

## Language

**Table Action**:
A user-triggered operation that acts on a table's rows or presentation state. It can be exposed through any interactive control; toolbar placement is optional, not defining.
_Avoid_: Toolbar action, toolbar item action when the behavior is not toolbar-specific.

**Table Data Export**:
A Table Action that produces a file or hands resolved table data to an application-owned export operation. By default it exports all rows currently held by the client table as CSV, not all records that might exist in an external data source.
_Avoid_: Excel export when the API is format-neutral.

**Export Handler**:
The operation that performs a Table Data Export once the table, rows, columns, and file name have been resolved. Applications can replace it to generate files through their own client code or backend APIs, including Excel exports.
_Avoid_: Writer when the application may own more than workbook serialization.
