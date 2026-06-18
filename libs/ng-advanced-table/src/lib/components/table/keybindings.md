# Keyboard Shortcuts Configuration (Keybindings)

`ng-advanced-table` provides a fully configurable keyboard shortcuts system to accommodate custom accessibility (a11y) profiles, prevent conflicts with screen reader controls, or match specific grid navigation patterns.

---

## Default WCAG Keybindings

By default, the table operates on standard WCAG-compliant interactions:

| Feature / Action | Default Key Combination | Description |
| :--- | :--- | :--- |
| **Row Activation** | `Enter`, `Space`, `Spacebar` | Triggers the `(rowActivate)` output on the active row. |
| **Column Reordering** | `Alt+Shift+ArrowLeft` / `ArrowRight` | Reorders columns left or right within their pinning zone. |
| **Cell Interaction Entry** | `Enter` | Focuses the first interactive control inside the selected cell. |
| **Cell Interaction Exit** | `Escape` | Returns focus from an inside control back to the parent cell. |
| **Next Control Walk** | `Tab` | Moves focus to the next interactive control inside the cell. |
| **Previous Control Walk** | `Shift+Tab` | Moves focus to the previous interactive control inside the cell. |

---

## Shortcut Configuration Format

Keybindings can be configured using three formats:

### 1. String Shorthand (with Platform-Aware `Mod` Key)
You can specify combinations using string syntax. Modifiers are joined with `+` (e.g., `Alt+Shift+ArrowLeft`).

A virtual modifier **`Mod`** (or **`CmdOrCtrl`** / **`CommandOrControl`**) is supported. It automatically resolves based on the user's OS:
- **macOS / iOS:** Resolves to the `Command` key (`metaKey`).
- **Windows / Linux:** Resolves to the `Control` key (`ctrlKey`).

```typescript
const keybindings = {
  columnReorderLeft: 'Mod+ArrowLeft',
  columnReorderRight: 'Mod+ArrowRight'
};
```

### 2. Structured Object
If you need precise modifier matching, you can pass a `NatTableShortcut` object matching standard browser `KeyboardEvent` property names:

```typescript
const keybindings = {
  rowActivate: { key: 'Space', cmdOrCtrlKey: true }
};
```

### 3. List of Combinations
You can provide an array of shortcuts to allow multiple triggers for the same action:

```typescript
const keybindings = {
  rowActivate: ['Enter', { key: 'a', ctrlKey: true }]
};
```

---

## Configuration Hierarchy

Keybindings resolve through a hierarchical merging process (lowest priority to highest):

1. **Default Settings:** `DEFAULT_NAT_TABLE_KEYBINDINGS`
2. **Injection Token:** Providing the `NAT_TABLE_KEYBINDINGS` token at the module or application level.
3. **Surface Input:** Binding the `[keybindings]` input on `<nat-table-surface>`.
4. **Table Input:** Binding the `[keybindings]` input directly on `<nat-table>`.

### Global/DI Setup Example
To configure custom keybindings application-wide:

```typescript
import { NAT_TABLE_KEYBINDINGS } from 'ng-advanced-table';

@Component({
  providers: [
    {
      provide: NAT_TABLE_KEYBINDINGS,
      useValue: {
        rowActivate: 'Space', // Activate rows using ONLY the Space key
        columnReorderLeft: 'Mod+ArrowLeft',
        columnReorderRight: 'Mod+ArrowRight',
      }
    }
  ]
})
export class AppModule {}
```
