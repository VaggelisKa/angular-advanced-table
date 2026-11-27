#!/usr/bin/env node
// Codemod for consumers moving to the TanStack Table v9 release of
// ng-advanced-table. Rewrites what can be rewritten safely, using the
// project's own TypeScript compiler to find code by syntax rather than text,
// and lists what needs a human decision.
//
//   npx -p ng-advanced-table ng-advanced-table-migrate-v9 [--dry-run] [path ...]
//
// Paths default to `src`. Run your formatter afterwards; edits keep the
// surrounding code as it was but do not reflow lines.

import { readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * v8 type names that `ng-advanced-table` re-exports with its feature set
 * applied, with the most type arguments each took in v8. A reference with more
 * arguments is already v9 code (`Row<typeof features, Order>`), so its import
 * stays on `@tanstack/angular-table`.
 */
const ALIASED_TYPE_ARITY = new Map([
  ['AccessorColumnDef', 2],
  ['AccessorFnColumnDef', 2],
  ['AccessorKeyColumnDef', 2],
  ['Cell', 2],
  ['CellContext', 2],
  ['Column', 2],
  ['ColumnDef', 2],
  ['ColumnDefBase', 2],
  ['DisplayColumnDef', 2],
  ['FilterFn', 1],
  ['GroupColumnDef', 2],
  ['Header', 2],
  ['HeaderContext', 2],
  ['HeaderGroup', 1],
  ['IdentifiedColumnDef', 2],
  ['Row', 1],
  ['RowModel', 1],
  ['SortingFn', 1],
  ['Table', 1],
  ['TableOptions', 1],
  ['TableState', 0],
  ['VisibilityState', 0]
]);

/** Properties that mark an object literal as a column definition. */
// Only keys that other objects rarely carry: sort-entry objects share
// `sortUndefined`/`invertSorting`, so those do not count.
const COLUMN_DEF_KEYS = new Set(['accessorKey', 'accessorFn', 'header', 'cell', 'footer', 'columns', 'meta']);

/** Memoized by TanStack per cell or header, so a stable `props` object. */
const STABLE_PROPS_CALL = /(\?\.|\.)getContext\(\)$/;

// Maps, not object literals: a lookup such as `RENAMED_METHODS.get(name)` on an
// object would match inherited names like `toString` or `toLocaleString`.
const PINNING_KEYS = new Map([
  ['left', 'start'],
  ['right', 'end']
]);

const RENAMED_METHODS = new Map([
  ['getSortingFn', 'getSortFn'],
  ['getAutoSortingFn', 'getAutoSortFn'],
  ['getLeftVisibleCells', 'getStartVisibleCells'],
  ['getRightVisibleCells', 'getEndVisibleCells'],
  ['getLeftHeaderGroups', 'getStartHeaderGroups'],
  ['getRightHeaderGroups', 'getEndHeaderGroups'],
  ['getLeftFooterGroups', 'getStartFooterGroups'],
  ['getRightFooterGroups', 'getEndFooterGroups'],
  ['getLeftFlatHeaders', 'getStartFlatHeaders'],
  ['getRightFlatHeaders', 'getEndFlatHeaders'],
  ['getLeftLeafHeaders', 'getStartLeafHeaders'],
  ['getRightLeafHeaders', 'getEndLeafHeaders'],
  ['getLeftLeafColumns', 'getStartLeafColumns'],
  ['getRightLeafColumns', 'getEndLeafColumns'],
  ['getLeftVisibleLeafColumns', 'getStartVisibleLeafColumns'],
  ['getRightVisibleLeafColumns', 'getEndVisibleLeafColumns'],
  ['getLeftTotalSize', 'getStartTotalSize'],
  ['getRightTotalSize', 'getEndTotalSize']
]);

/** v8 state slices whose v9 atom has another name. */
const RENAMED_STATE_SLICES = new Map([['columnSizingInfo', 'columnResizing']]);

/** Table state slices in v8 and v9; `getState().<other>` is not a table read. */
const TABLE_STATE_SLICES = new Set([
  'columnFilters',
  'columnOrder',
  'columnPinning',
  'columnResizing',
  'columnSizing',
  'columnSizingInfo',
  'columnVisibility',
  'expanded',
  'globalFilter',
  'grouping',
  'pagination',
  'rowPinning',
  'rowSelection',
  'sorting'
]);

/**
 * A `getState()` receiver named like a table (`table`, `this.table()`,
 * `ordersTable`). Other stores have `getState()` too, so a read is rewritten
 * only on such a receiver in a file that imports the table; other likely table
 * reads are reported, and everything else is left alone.
 */
const TABLE_RECEIVER_NAME = /table$/i;

/**
 * A `pin()` receiver named like a TanStack column (`column`, `col`,
 * `header.column`, `this.column()`, `table.getColumn('id')`). Other objects
 * have a `pin('left')` too, so only these are rewritten; the rest are reported
 * in files that use the table.
 */
const COLUMN_RECEIVER_NAME = /(^col|column)$/i;

const USAGE = `Usage: ng-advanced-table-migrate-v9 [--dry-run] [path ...]

Migrates TypeScript and HTML under each path (default: src) to the TanStack
Table v9 release of ng-advanced-table.

  --dry-run   List the changes without writing any file.
  -h, --help  Show this help.`;

const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist', '.angular', '.git', '.nx', 'coverage']);

const loadTypeScript = (cwd) => {
  try {
    return createRequire(join(cwd, 'package.json'))('typescript');
  } catch {
    throw new Error('ng-advanced-table-migrate-v9 needs the project\'s "typescript" package; run it from the project root.');
  }
};

const isMigratedFile = (path) => (extname(path) === '.ts' && !path.endsWith('.d.ts')) || extname(path) === '.html';

/**
 * Files under a path given on the command line. Symlinks inside it are never
 * followed: a dangling or cyclic link would abort or recurse forever, and a
 * link out of the project would get its target rewritten in place.
 */
const collectFiles = (root) => {
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);

      if (entry.isDirectory() && !SKIPPED_DIRECTORIES.has(entry.name)) {
        walk(path);
      } else if (entry.isFile() && isMigratedFile(path)) {
        files.push(path);
      }
    }
  };

  if (statSync(root).isDirectory()) {
    walk(root);
  } else if (isMigratedFile(root)) {
    files.push(root);
  }

  return files;
};

const isUnknownOrAny = (ts, typeNode) => typeNode.kind === ts.SyntaxKind.UnknownKeyword || typeNode.kind === ts.SyntaxKind.AnyKeyword;

const propertyNameText = (ts, name) =>
  ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name) ? name.text : null;

/**
 * `*flexRender` bindings, in double or single quotes, whose `props` come from a
 * call such as `build()`, `this.helper?.build()`, or `build?.()`; group 1 is the call.
 */
const FLEX_RENDER_CALL_PROPS = /\*flexRender[A-Za-z]*=(?:"[^"]*?|'[^']*?)\bprops:\s*((?:[\w$]+(?:\?\.|\.))*[\w$]+(?:\?\.)?\([^)]*\))/g;

const FLEX_RENDER_PROPS_MESSAGE =
  'FlexRender `props` come from a call: make sure it returns the same object until its inputs change (a signal or computed does; a method building a new object makes v9 re-render forever, NG0103).';

const reportFlexRenderProps = (text, report) => {
  for (const match of text.matchAll(FLEX_RENDER_CALL_PROPS)) {
    if (!STABLE_PROPS_CALL.test(match[1])) {
      report(match.index, FLEX_RENDER_PROPS_MESSAGE);
    }
  }
};

/**
 * For each character of a string or template literal's value, its offset in
 * the literal's source text (between the quotes). Escapes such as `\"` or
 * `\u0041` are one value character but several source characters, a line
 * continuation is none, and a CRLF in a template is one `\n`.
 */
const valueToSourceOffsets = (source) => {
  const offsets = [];
  let index = 0;

  while (index < source.length) {
    const character = source[index];

    if (character === '\\') {
      const next = source[index + 1];

      if (next === '\r' || next === '\n') {
        index += next === '\r' && source[index + 2] === '\n' ? 3 : 2;
        continue;
      }

      offsets.push(index);

      if (next === 'u') {
        index = source[index + 2] === '{' ? source.indexOf('}', index) + 1 : index + 6;
      } else if (next === 'x') {
        index += 4;
      } else {
        index += 2;
      }
    } else {
      offsets.push(index);
      index += character === '\r' && source[index + 1] === '\n' ? 2 : 1;
    }
  }

  offsets.push(index);

  return offsets;
};

/**
 * Collects the edits for one TypeScript file. Each edit replaces
 * `[start, end)` of the original text; reports point at a position.
 */
export const migrateTypeScript = (ts, fileName, text) => {
  const sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const edits = [];
  const reports = [];
  const replace = (node, replacement) => edits.push({ start: node.getStart(sourceFile), end: node.getEnd(), replacement });
  const report = (position, message) => {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(position);

    reports.push({ line: line + 1, column: character + 1, message });
  };

  const usedWithMoreTypeArguments = (localName, arity) => {
    let found = false;
    const visitTypes = (node) => {
      if (
        !found &&
        ts.isTypeReferenceNode(node) &&
        ts.isIdentifier(node.typeName) &&
        node.typeName.text === localName &&
        (node.typeArguments?.length ?? 0) > arity
      ) {
        found = true;
      }

      if (!found) ts.forEachChild(node, visitTypes);
    };

    visitTypes(sourceFile);

    return found;
  };

  /** `getIsSome...Selected() && !getIsAll...Selected()`: already the v9 indeterminate check. */
  const isGuardedByAllSelected = (node) => {
    let expression = node;

    while (expression.parent && !ts.isBinaryExpression(expression.parent) && !ts.isStatement(expression.parent)) {
      expression = expression.parent;
    }

    // The whole `a && b && c` chain: `&&` groups left first, so the
    // all-selected check may sit in an outer node of the chain.
    let chain = null;

    while (
      expression.parent &&
      (ts.isParenthesizedExpression(expression.parent) ||
        (ts.isBinaryExpression(expression.parent) && expression.parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken))
    ) {
      expression = expression.parent;

      if (ts.isBinaryExpression(expression)) chain = expression;
    }

    return !!chain && /getIsAll(Page)?RowsSelected/.test(chain.getText(sourceFile));
  };

  const usesTable = sourceFile.statements.some(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      /^(@tanstack\/angular-table|ng-advanced-table)(\/|$)/.test(statement.moduleSpecifier.text)
  );

  /** `table`, `this.table`, `this.table()`, `table!` -> `table`. */
  const receiverName = (expression) => {
    let current = expression;

    while (ts.isCallExpression(current) || ts.isNonNullExpression(current) || ts.isParenthesizedExpression(current)) {
      current = current.expression;
    }

    if (ts.isIdentifier(current)) return current.text;
    if (ts.isPropertyAccessExpression(current)) return current.name.text;

    return '';
  };

  /** `'left'` in `pin('left')` and in either branch of `pin(c ? false : 'left')`. */
  const pinSideLiterals = (expression) => {
    if (ts.isStringLiteral(expression)) return PINNING_KEYS.has(expression.text) ? [expression] : [];
    if (ts.isParenthesizedExpression(expression)) return pinSideLiterals(expression.expression);
    if (ts.isConditionalExpression(expression))
      return [...pinSideLiterals(expression.whenTrue), ...pinSideLiterals(expression.whenFalse)];

    return [];
  };

  const looksLikeColumnDef = (literal) =>
    literal.properties.some((property) => property.name && COLUMN_DEF_KEYS.has(propertyNameText(ts, property.name) ?? ''));

  const rewriteTanStackImport = (node) => {
    const bindings = node.importClause?.namedBindings;

    if (!bindings || !ts.isNamedImports(bindings)) {
      return;
    }

    const moved = bindings.elements.filter((element) => {
      const arity = ALIASED_TYPE_ARITY.get((element.propertyName ?? element.name).text);

      return arity !== undefined && !usedWithMoreTypeArguments(element.name.text, arity);
    });

    if (moved.length === 0) {
      return;
    }

    const kept = bindings.elements.filter((element) => !moved.includes(element));
    const specifierText = (element) => element.getText(sourceFile).replace(/^type\s+/, '');
    const movedImport = `import type { ${moved.map(specifierText).join(', ')} } from 'ng-advanced-table';`;

    if (kept.length === 0) {
      replace(node, movedImport);

      return;
    }

    const keptBindings = `{ ${kept.map((element) => element.getText(sourceFile)).join(', ')} }`;

    edits.push({ start: bindings.getStart(sourceFile), end: bindings.getEnd(), replacement: keptBindings });
    edits.push({ start: node.getEnd(), end: node.getEnd(), replacement: `\n${movedImport}` });
  };

  const rewriteColumnPinningLiteral = (literal) => {
    const present = new Set();
    let hasSpread = false;

    for (const property of literal.properties) {
      if (ts.isSpreadAssignment(property)) {
        hasSpread = true;
        continue;
      }

      const name = property.name && propertyNameText(ts, property.name);
      const renamed = name && PINNING_KEYS.get(name);

      if (!renamed) {
        if (name === 'start' || name === 'end') present.add(name);
        continue;
      }

      present.add(renamed);

      if (ts.isShorthandPropertyAssignment(property)) {
        replace(property, `${renamed}: ${name}`);
      } else {
        replace(property.name, renamed);
      }
    }

    const missing = ['start', 'end'].filter((key) => !present.has(key));

    if (!hasSpread && missing.length > 0 && present.size > 0) {
      // Right after the last property, so a trailing comma stays trailing.
      const lastProperty = literal.properties[literal.properties.length - 1].getEnd();

      edits.push({ start: lastProperty, end: lastProperty, replacement: `, ${missing.map((key) => `${key}: []`).join(', ')}` });
    }
  };

  const bindsName = (binding, name) =>
    ts.isIdentifier(binding)
      ? binding.text === name
      : (ts.isObjectBindingPattern(binding) || ts.isArrayBindingPattern(binding)) &&
        binding.elements.some((element) => !ts.isOmittedExpression(element) && bindsName(element.name, name));

  const declarationListBinds = (list, name) =>
    !!list && ts.isVariableDeclarationList(list) && list.declarations.some((declaration) => bindsName(declaration.name, name));

  /** True when `node` opens a scope that declares `name` again (parameter, local, loop or catch variable). */
  const declaresName = (node, name) => {
    if (ts.isFunctionLike(node)) {
      return node.parameters.some((parameter) => bindsName(parameter.name, name));
    }

    if (ts.isBlock(node) || ts.isCaseClause(node) || ts.isDefaultClause(node)) {
      return node.statements.some(
        (statement) =>
          (ts.isVariableStatement(statement) && declarationListBinds(statement.declarationList, name)) ||
          ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name?.text === name)
      );
    }

    if (ts.isForStatement(node) || ts.isForInStatement(node) || ts.isForOfStatement(node)) {
      return declarationListBinds(node.initializer, name);
    }

    if (ts.isCatchClause(node)) {
      return !!node.variableDeclaration && bindsName(node.variableDeclaration.name, name);
    }

    return false;
  };

  const rewriteCellContextParameter = (parameter, functionNode) => {
    const type = parameter.type;

    if (!type || !ts.isTypeReferenceNode(type) || type.typeName.getText(sourceFile) !== 'CellContext') {
      return;
    }

    // v8 took <TData, TValue>; three arguments is already v9 (<TFeatures, TData, TValue>).
    if ((type.typeArguments?.length ?? 0) > 2) {
      return;
    }

    const valueType = type.typeArguments?.[1];

    if (!valueType || isUnknownOrAny(ts, valueType)) {
      return;
    }

    if (!ts.isIdentifier(parameter.name)) {
      report(
        parameter.getStart(sourceFile),
        `Destructured \`CellContext<…, ${valueType.getText(sourceFile)}>\`: type it \`CellContext<…, unknown>\` and read the value with \`getValue<${valueType.getText(sourceFile)}>()\`.`
      );

      return;
    }

    const valueTypeText = valueType.getText(sourceFile);
    const parameterName = parameter.name.text;

    replace(valueType, 'unknown');

    const visitBody = (node) => {
      // A nested function or block that declares the same name reads another value.
      if (declaresName(node, parameterName)) {
        return;
      }

      if (
        ts.isCallExpression(node) &&
        !node.typeArguments &&
        node.arguments.length === 0 &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === parameterName &&
        ['getValue', 'renderValue'].includes(node.expression.name.text)
      ) {
        // `c.getValue?.()` takes its type argument after the `?.`: `c.getValue?.<number>()`.
        const at = node.questionDotToken ? node.questionDotToken.getEnd() : node.expression.getEnd();

        edits.push({ start: at, end: at, replacement: `<${valueTypeText}>` });
      }

      ts.forEachChild(node, visitBody);
    };

    if (functionNode.body) {
      visitBody(functionNode.body);
    }
  };

  const visit = (node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text === '@tanstack/angular-table'
    ) {
      rewriteTanStackImport(node);

      const bindings = node.importClause?.namedBindings;

      if (bindings && ts.isNamespaceImport(bindings)) {
        report(
          node.getStart(sourceFile),
          "Namespace import of `@tanstack/angular-table`: its types need v9's feature generic; import `ColumnDef`, `Row`, ... from `ng-advanced-table` instead."
        );
      }

      if (
        bindings &&
        ts.isNamedImports(bindings) &&
        bindings.elements.some((element) => (element.propertyName ?? element.name).text === 'sortingFns')
      ) {
        report(
          node.getStart(sourceFile),
          '`sortingFns` is `sortFns` in v9; built-ins are also exported one by one (`sortFn_alphanumeric`, ...).'
        );
      }
    }

    // { ...columnPinning: { left, right } } in state literals.
    if (
      ts.isPropertyAssignment(node) &&
      propertyNameText(ts, node.name) === 'columnPinning' &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      rewriteColumnPinningLiteral(node.initializer);
    }

    // state.columnPinning ?? { left: [], right: [] }
    if (
      ts.isBinaryExpression(node) &&
      [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(node.operatorToken.kind) &&
      ts.isObjectLiteralExpression(node.right) &&
      ts.isPropertyAccessExpression(node.left) &&
      node.left.name.text === 'columnPinning'
    ) {
      rewriteColumnPinningLiteral(node.right);
    }

    // state.columnPinning.left, state.columnPinning?.right, this.columnPinning().left,
    // state.columnPinning!.left, this.pinning.left
    if (ts.isPropertyAccessExpression(node) && PINNING_KEYS.get(node.name.text) && /pinning$/i.test(receiverName(node.expression))) {
      replace(node.name, PINNING_KEYS.get(node.name.text));
    }

    // column.pin('left'), column.pin(pinned ? false : 'left')
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'pin' &&
      node.arguments.length === 1
    ) {
      const sides = pinSideLiterals(node.arguments[0]);
      const receiver = node.expression.expression;

      if (sides.length > 0 && COLUMN_RECEIVER_NAME.test(receiverName(receiver))) {
        for (const literal of sides) {
          replace(literal, `'${PINNING_KEYS.get(literal.text)}'`);
        }
      } else if (sides.length > 0 && usesTable) {
        report(
          node.getStart(sourceFile),
          `\`${receiver.getText(sourceFile)}.pin(...)\`: if \`${receiver.getText(sourceFile)}\` is a table column, pin to 'start'/'end' instead of 'left'/'right' (v9 pins to logical edges); otherwise leave it.`
        );
      }
    }

    // column.getIsPinned() === 'left'
    if (
      ts.isBinaryExpression(node) &&
      [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(node.operatorToken.kind)
    ) {
      const sides = [node.left, node.right];
      const pinnedCall = sides.find(
        (side) =>
          ts.isCallExpression(side) && ts.isPropertyAccessExpression(side.expression) && side.expression.name.text === 'getIsPinned'
      );
      const literal = sides.find((side) => ts.isStringLiteral(side) && PINNING_KEYS.get(side.text));

      if (pinnedCall && literal) {
        replace(literal, `'${PINNING_KEYS.get(literal.text)}'`);
      }
    }

    // { sortingFn: ... } in column definitions. `sortingFn: value` is
    // column-specific enough to rename anywhere (partial column overrides have
    // no other column keys); a shorthand `{ sortingFn }` may just be a local
    // variable, so it is renamed only in an object that looks like a column.
    if (ts.isPropertyAssignment(node) && propertyNameText(ts, node.name) === 'sortingFn') {
      replace(node.name, 'sortFn');
    }

    if (ts.isShorthandPropertyAssignment(node) && node.name.text === 'sortingFn' && looksLikeColumnDef(node.parent)) {
      replace(node, 'sortFn: sortingFn');
    }

    // Renamed table, column, and row methods, called or passed by reference;
    // the names are TanStack-specific enough to rename wherever they appear.
    if (ts.isPropertyAccessExpression(node) && RENAMED_METHODS.has(node.name.text)) {
      replace(node.name, RENAMED_METHODS.get(node.name.text));
    }

    // table.getState().pagination -> table.atoms.pagination.get()
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isCallExpression(node.expression) &&
      node.expression.arguments.length === 0 &&
      ts.isPropertyAccessExpression(node.expression.expression) &&
      node.expression.expression.name.text === 'getState'
    ) {
      const getState = node.expression.expression;
      const receiver = getState.expression.getText(sourceFile);
      const optional = getState.questionDotToken ? '?.' : '.';
      const slice = RENAMED_STATE_SLICES.get(node.name.text) ?? node.name.text;
      const namedLikeTable = TABLE_RECEIVER_NAME.test(receiverName(getState.expression));

      if (usesTable && namedLikeTable && TABLE_STATE_SLICES.has(node.name.text)) {
        // Only the `.getState().<slice>` tail, so edits inside the receiver still apply.
        edits.push({ start: getState.expression.getEnd(), end: node.getEnd(), replacement: `${optional}atoms.${slice}.get()` });
      } else if (namedLikeTable || (usesTable && TABLE_STATE_SLICES.has(node.name.text))) {
        report(
          node.getStart(sourceFile),
          `\`${receiver}.getState().${node.name.text}\`: if \`${receiver}\` is a table, read \`${receiver}.atoms.${slice}.get()\` (v9 has no \`getState()\`); otherwise leave it.`
        );
      }

      visit(getState.expression);

      return;
    }

    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'getState' &&
      node.arguments.length === 0 &&
      !(ts.isPropertyAccessExpression(node.parent) && node.parent.expression === node) &&
      (usesTable || TABLE_RECEIVER_NAME.test(receiverName(node.expression.expression)))
    ) {
      report(
        node.getStart(sourceFile),
        '`getState()` is gone in v9: read one slice with `table.atoms.<slice>.get()`, or the whole state with `table.store.get()`.'
      );
    }

    if (
      ts.isPropertyAccessExpression(node) &&
      ['getIsSomeRowsSelected', 'getIsSomePageRowsSelected'].includes(node.name.text) &&
      !isGuardedByAllSelected(node)
    ) {
      report(
        node.getStart(sourceFile),
        `\`${node.name.text}()\` now also returns true when every row is selected; for an indeterminate checkbox add \`&& !getIsAll...Selected()\`.`
      );
    }

    if (
      (ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) &&
      node.parameters
    ) {
      for (const parameter of node.parameters) {
        rewriteCellContextParameter(parameter, node);
      }
    }

    // Inline component templates.
    if (
      ts.isPropertyAssignment(node) &&
      propertyNameText(ts, node.name) === 'template' &&
      (ts.isNoSubstitutionTemplateLiteral(node.initializer) || ts.isStringLiteral(node.initializer))
    ) {
      // Positions are found in the template's value, then mapped back to the
      // source text, where escapes and CRLF line ends take other widths.
      const literalStart = node.initializer.getStart(sourceFile) + 1;
      const offsets = valueToSourceOffsets(text.slice(literalStart, node.initializer.getEnd() - 1));

      reportFlexRenderProps(node.initializer.text, (position, message) => report(literalStart + offsets[position], message));
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return { edits, reports };
};

/** Applies non-overlapping edits from the end of the text backwards. */
export const applyEdits = (text, edits) => {
  const isInsertion = (edit) => edit.start === edit.end;
  // Choose left to right, an insertion before a replacement at the same
  // position and the wider of two replacements first, dropping anything that
  // starts inside an edit already chosen: the outer edit wins.
  const chosen = [];
  let coveredUntil = -1;

  for (const edit of [...edits].sort(
    (a, b) => a.start - b.start || Number(isInsertion(b)) - Number(isInsertion(a)) || b.end - a.end
  )) {
    if (edit.start < coveredUntil) {
      continue;
    }

    chosen.push(edit);
    coveredUntil = Math.max(coveredUntil, edit.end);
  }

  // Apply right to left so earlier offsets stay valid; at a shared position the
  // replacement goes first, so the insertion lands in front of it.
  return chosen
    .sort((a, b) => b.start - a.start || b.end - a.end)
    .reduce((result, edit) => result.slice(0, edit.start) + edit.replacement + result.slice(edit.end), text);
};

export const migrateHtml = (text) => {
  const reports = [];

  reportFlexRenderProps(text, (position, message) => {
    const before = text.slice(0, position);

    reports.push({ line: before.split('\n').length, column: position - before.lastIndexOf('\n'), message });
  });

  return reports;
};

/** Splits the command line; throws on an option it does not know, before any file is read. */
const parseArguments = (argv) => {
  const options = { dryRun: false, help: false, roots: [] };

  for (const argument of argv) {
    if (argument === '--dry-run') {
      options.dryRun = true;
    } else if (argument === '--help' || argument === '-h') {
      options.help = true;
    } else if (argument.startsWith('-')) {
      throw new Error(`Unknown option: ${argument}\n\n${USAGE}`);
    } else {
      options.roots.push(argument);
    }
  }

  return options;
};

export const run = (argv, cwd = process.cwd(), log = console.log) => {
  const { dryRun, help, roots } = parseArguments(argv);

  if (help) {
    log(USAGE);

    return { changedFiles: 0, editCount: 0, manual: [] };
  }

  const ts = loadTypeScript(cwd);
  const files = (roots.length ? roots : ['src']).flatMap((root) => collectFiles(resolve(cwd, root)));
  const manual = [];
  let changedFiles = 0;
  let editCount = 0;

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const display = relative(cwd, file);

    if (file.endsWith('.html')) {
      manual.push(...migrateHtml(text).map((entry) => ({ file: display, ...entry })));
      continue;
    }

    const { edits, reports } = migrateTypeScript(ts, file, text);

    manual.push(...reports.map((entry) => ({ file: display, ...entry })));

    if (edits.length > 0) {
      const next = applyEdits(text, edits);

      if (next !== text) {
        changedFiles++;
        editCount += edits.length;

        if (!dryRun) {
          writeFileSync(file, next);
        }

        log(`${dryRun ? 'would update' : 'updated'} ${display} (${edits.length} edit${edits.length === 1 ? '' : 's'})`);
      }
    }
  }

  log(`\n${dryRun ? 'Dry run: ' : ''}${editCount} edits in ${changedFiles} of ${files.length} files.`);

  if (manual.length > 0) {
    log(`\nNeeds a manual look (${manual.length}):`);

    for (const entry of manual) {
      log(`  ${entry.file}:${entry.line}:${entry.column}  ${entry.message}`);
    }
  }

  return { changedFiles, editCount, manual };
};

/**
 * True when this file is the program being run. npm starts a `bin` through a
 * `node_modules/.bin` symlink, so both paths are resolved to the real file.
 */
const isEntryPoint = () => {
  try {
    return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
};

if (isEntryPoint()) {
  try {
    run(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
