import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

export const dependencyFields = [
  'dependencies',
  'peerDependencies',
  'devDependencies',
  'optionalDependencies',
];

const semverPattern =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function getWorkspacePatterns(rootPackage) {
  if (Array.isArray(rootPackage.workspaces)) {
    return rootPackage.workspaces;
  }

  if (Array.isArray(rootPackage.workspaces?.packages)) {
    return rootPackage.workspaces.packages;
  }

  throw new Error(
    'Root package.json must declare workspaces as an array or as { "packages": [] }.',
  );
}

function toPosixPath(filePath) {
  return filePath.split(sep).join('/');
}

function expandWorkspacePattern(pattern) {
  if (!pattern.includes('*')) {
    return [pattern.replace(/\/$/, '')];
  }

  if (!pattern.endsWith('/*') || pattern.indexOf('*') !== pattern.length - 1) {
    throw new Error(
      `Unsupported workspace pattern "${pattern}". Only direct directory entries or "<dir>/*" are supported.`,
    );
  }

  const parentDirectory = pattern.slice(0, -2);
  const absoluteParentDirectory = resolve(repoRoot, parentDirectory);

  return readdirSync(absoluteParentDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${parentDirectory}/${entry.name}`)
    .filter((workspaceDirectory) =>
      existsSync(resolve(repoRoot, workspaceDirectory, 'package.json')),
    );
}

export function getRelativePath(absolutePath) {
  return toPosixPath(relative(repoRoot, absolutePath));
}

export function getWorkspacePackages() {
  const rootPackage = readJson(resolve(repoRoot, 'package.json'));
  const workspaceDirectories = [
    ...new Set(getWorkspacePatterns(rootPackage).flatMap(expandWorkspacePattern)),
  ];

  const packages = workspaceDirectories.map((directory) => {
    const manifestPath = resolve(repoRoot, directory, 'package.json');

    if (!existsSync(manifestPath)) {
      throw new Error(`Workspace "${directory}" is missing package.json.`);
    }

    const manifest = readJson(manifestPath);
    const changelogPath = resolve(repoRoot, directory, 'CHANGELOG.md');
    const ngPackagePath = resolve(repoRoot, directory, 'ng-package.json');

    return {
      directory,
      manifest,
      manifestPath,
      changelogPath,
      ngPackagePath,
      name: manifest.name,
      version: manifest.version,
    };
  });

  const seenPackageNames = new Set();

  for (const workspacePackage of packages) {
    if (seenPackageNames.has(workspacePackage.name)) {
      throw new Error(
        `Duplicate workspace package name "${workspacePackage.name}" detected.`,
      );
    }

    seenPackageNames.add(workspacePackage.name);
  }

  return packages;
}

export function getInternalDependencies(workspacePackage, packagesByName) {
  const dependencies = [];

  for (const field of dependencyFields) {
    const manifestSection = workspacePackage.manifest[field] ?? {};

    for (const [dependencyName, range] of Object.entries(manifestSection)) {
      const dependencyPackage = packagesByName.get(dependencyName);

      if (!dependencyPackage) {
        continue;
      }

      dependencies.push({
        dependencyName,
        field,
        range,
        targetVersion: dependencyPackage.version,
      });
    }
  }

  return dependencies;
}

function normalizeWorkspaceProtocolRange(range, version) {
  const workspaceRange = range.slice('workspace:'.length);

  if (workspaceRange === '' || workspaceRange === '*') {
    return `workspace:${version}`;
  }

  if (workspaceRange === '^' || workspaceRange.startsWith('^')) {
    return `workspace:^${version}`;
  }

  if (workspaceRange === '~' || workspaceRange.startsWith('~')) {
    return `workspace:~${version}`;
  }

  if (semverPattern.test(workspaceRange)) {
    return `workspace:${version}`;
  }

  return null;
}

export function normalizeInternalDependencyRange(range, version) {
  if (range.startsWith('workspace:')) {
    return normalizeWorkspaceProtocolRange(range, version);
  }

  if (range.startsWith('^')) {
    return `^${version}`;
  }

  if (range.startsWith('~')) {
    return `~${version}`;
  }

  if (range === '*' || semverPattern.test(range)) {
    return version;
  }

  return null;
}

export function sortPackagesForPublish(workspacePackages) {
  const packagesByName = new Map(
    workspacePackages.map((workspacePackage) => [
      workspacePackage.name,
      workspacePackage,
    ]),
  );
  const permanentlyVisited = new Set();
  const temporarilyVisited = new Set();
  const sortedPackages = [];

  function visit(workspacePackage) {
    if (permanentlyVisited.has(workspacePackage.name)) {
      return;
    }

    if (temporarilyVisited.has(workspacePackage.name)) {
      throw new Error(
        `Circular workspace dependency detected involving "${workspacePackage.name}".`,
      );
    }

    temporarilyVisited.add(workspacePackage.name);

    for (const dependency of getInternalDependencies(
      workspacePackage,
      packagesByName,
    )) {
      visit(packagesByName.get(dependency.dependencyName));
    }

    temporarilyVisited.delete(workspacePackage.name);
    permanentlyVisited.add(workspacePackage.name);
    sortedPackages.push(workspacePackage);
  }

  for (const workspacePackage of workspacePackages) {
    visit(workspacePackage);
  }

  return sortedPackages;
}

export function getPublishPath(workspacePackage) {
  if (existsSync(workspacePackage.ngPackagePath)) {
    const ngPackage = readJson(workspacePackage.ngPackagePath);

    if (typeof ngPackage.dest === 'string') {
      return getRelativePath(
        resolve(repoRoot, workspacePackage.directory, ngPackage.dest),
      );
    }
  }

  return toPosixPath(`dist/${basename(workspacePackage.directory)}`);
}
