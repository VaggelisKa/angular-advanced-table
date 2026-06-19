# Angular Advanced Table

Language for the table library and its companion packages.

## Language

**Table Action**:
A user-triggered operation that acts on a table's rows or presentation state. It can be exposed through any interactive control; toolbar placement is optional, not defining.
_Avoid_: Toolbar action, toolbar item action when the behavior is not toolbar-specific.

**Excel Export**:
A Table Action that produces table data as an Excel workbook file. By default it exports all rows currently held by the client table, not all records that might exist in an external data source.
_Avoid_: CSV export when a workbook file is required.

**Export Handler**:
The operation that performs an Excel Export once the table, rows, columns, and file name have been resolved. Applications can replace it to generate files through their own client code or backend APIs.
_Avoid_: Writer when the application may own more than workbook serialization.
