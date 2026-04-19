import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  dependencyFields,
  getInternalDependencies,
  getRelativePath,
  getWorkspacePackages,
  normalizeInternalDependencyRange,
  readJson,
  repoRoot,
} from './workspace-packages.mjs';

const workspacePackages = getWorkspacePackages();
const packagesByName = new Map(
  workspacePackages.map((workspacePackage) => [
    workspacePackage.name,
    workspacePackage,
  ]),
);
const validationErrors = [];

for (const workspacePackage of workspacePackages) {
  for (const dependency of getInternalDependencies(
    workspacePackage,
    packagesByName,
  )) {
    const expectedRange = normalizeInternalDependencyRange(
      dependency.range,
      dependency.targetVersion,
    );

    if (expectedRange === null) {
      validationErrors.push(
        [
          `${workspacePackage.name} uses unsupported internal range "${dependency.range}"`,
          `for ${dependency.field}.${dependency.dependencyName}.`,
          'Use an exact version, `^`, `~`, or the matching `workspace:` variant.',
        ].join(' '),
      );
      continue;
    }

    if (dependency.range !== expectedRange) {
      validationErrors.push(
        [
          `${workspacePackage.name} declares ${dependency.field}.${dependency.dependencyName}`,
          `as "${dependency.range}", but ${dependency.dependencyName}@${dependency.targetVersion}`,
          `requires "${expectedRange}".`,
        ].join(' '),
      );
    }
  }
}

const packageLockPath = resolve(repoRoot, 'package-lock.json');

if (!existsSync(packageLockPath)) {
  validationErrors.push(
    'package-lock.json is missing. Commit a lockfile so releases use reproducible workspace versions.',
  );
} else {
  const packageLock = readJson(packageLockPath);
  const lockPackages = packageLock.packages ?? {};

  for (const workspacePackage of workspacePackages) {
    const lockEntry = lockPackages[workspacePackage.directory];

    if (!lockEntry) {
      validationErrors.push(
        `package-lock.json is missing the ${workspacePackage.directory} workspace entry.`,
      );
      continue;
    }

    if (lockEntry.version !== workspacePackage.version) {
      validationErrors.push(
        [
          `package-lock.json records ${workspacePackage.name} as`,
          `"${lockEntry.version}", but ${getRelativePath(workspacePackage.manifestPath)}`,
          `declares "${workspacePackage.version}".`,
        ].join(' '),
      );
    }

    for (const field of dependencyFields) {
      const manifestDependencies = workspacePackage.manifest[field] ?? {};
      const lockDependencies = lockEntry[field] ?? {};

      for (const dependency of getInternalDependencies(
        workspacePackage,
        packagesByName,
      )) {
        if (dependency.field !== field) {
          continue;
        }

        if (lockDependencies[dependency.dependencyName] !== manifestDependencies[dependency.dependencyName]) {
          validationErrors.push(
            [
              `package-lock.json records ${workspacePackage.name} ${field}.${dependency.dependencyName}`,
              `as "${lockDependencies[dependency.dependencyName] ?? 'missing'}", but`,
              `${getRelativePath(workspacePackage.manifestPath)} declares`,
              `"${manifestDependencies[dependency.dependencyName]}".`,
            ].join(' '),
          );
        }
      }
    }
  }
}

if (validationErrors.length > 0) {
  console.error('Workspace release metadata is inconsistent:');

  for (const validationError of validationErrors) {
    console.error(`- ${validationError}`);
  }

  process.exit(1);
}

console.log(
  `Validated ${workspacePackages.length} workspace packages and package-lock.json.`,
);
