---
ng-advanced-table: patch
---

Client-side sorting is faster and lighter on large datasets. The table no longer copies every row object on each sort (TanStack's default sorted row model does, which doubled row memory while a sort was active), and the built-in sorting functions (`alphanumeric`, `text`, `basic`, `datetime`, and their case-sensitive variants) now read and tokenize each row's value once per sort instead of on every comparison. Row order is unchanged, including `sortUndefined`, `invertSorting`, multi-sort, and stable ties; custom `sortingFn`s run as before. On 100,000 rows a text sort drops from about 1.4 s to 0.34 s, and on 10,000 rows from about 290 ms to 110 ms.
