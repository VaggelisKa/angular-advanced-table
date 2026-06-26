## When To Use Sorting

Use sorting when the table can order the rows it currently receives, or when your app wants to expose sort state to Manual Data Handling. Keep domain ranking rules in the consuming app when sorting depends on permissions, remote scoring, or data that is not present in the current row set.

## Controlled Sorting

Sorting lives in the `sorting` state slice. Let the table manage it for simple client-side tables, or own the slice when you need URL persistence, custom buttons, analytics, or a manual row pipeline.

```ts
readonly tableState = signal<Partial<NatTableState>>({
  sorting: [{ id: 'name', desc: false }]
});
```

Header sort controls are added by wrapping columns with `withNatTableHeaderActions(...)`. Programmatic controls should update the same state slice instead of keeping a second sort model.

## Multi-Column Sorting

Enable multi-sort on the surface when users need priority order across multiple columns. The first sorting entry has the highest priority. Keep the priority visible when the workflow depends on it.

## Pinned Columns Variant

Sorting and pinning can coexist. Pinning affects where columns render; sorting still uses column ids and row data. Keep pinned columns stable when they carry row identity or row actions.
