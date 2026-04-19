import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

import {
  getPublishPath,
  getRelativePath,
  getWorkspacePackages,
  repoRoot,
  sortPackagesForPublish,
} from './workspace-packages.mjs';

function hasManifestChange(workspacePackage) {
  try {
    execFileSync(
      'git',
      ['diff', '--quiet', '--', getRelativePath(workspacePackage.manifestPath)],
      {
        cwd: repoRoot,
        stdio: 'ignore',
      },
    );
    return false;
  } catch (error) {
    if (error?.status === 1) {
      return true;
    }

    throw error;
  }
}

const workspacePackages = sortPackagesForPublish(getWorkspacePackages());
const changedPackages = workspacePackages.filter(hasManifestChange);

const releasePlan = {
  packages: changedPackages.map((workspacePackage) => ({
    name: workspacePackage.name,
    version: workspacePackage.version,
    workspace: workspacePackage.directory,
    manifestPath: getRelativePath(workspacePackage.manifestPath),
    changelogPath: existsSync(workspacePackage.changelogPath)
      ? getRelativePath(workspacePackage.changelogPath)
      : null,
    publishPath: getPublishPath(workspacePackage),
    tag: `${workspacePackage.name}@${workspacePackage.version}`,
  })),
};

releasePlan.stagePaths = [
  '.changeset',
  'package-lock.json',
  ...releasePlan.packages.flatMap((workspacePackage) =>
    workspacePackage.changelogPath === null
      ? [workspacePackage.manifestPath]
      : [workspacePackage.manifestPath, workspacePackage.changelogPath],
  ),
];

console.log(JSON.stringify(releasePlan, null, 2));
