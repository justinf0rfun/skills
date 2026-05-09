#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');

const [skillName, packageDir] = process.argv.slice(2);

if (!skillName || !packageDir) {
  console.error('Usage: sync-skill-package.js <skill-name> <package-dir>');
  process.exit(1);
}

const sourceDir = path.join(repoRoot, 'skills', skillName);
const destinationDir = path.join(repoRoot, packageDir, 'skills', skillName);
const sourceReadme = path.join(sourceDir, 'README.md');
const packageReadme = path.join(repoRoot, packageDir, 'README.md');

try {
  await fs.access(path.join(sourceDir, 'SKILL.md'));
  await fs.rm(destinationDir, { recursive: true, force: true });
  await fs.mkdir(path.dirname(destinationDir), { recursive: true });
  await fs.cp(sourceDir, destinationDir, { recursive: true });
  if (await exists(sourceReadme)) {
    await fs.copyFile(sourceReadme, packageReadme);
  } else {
    await fs.rm(packageReadme, { force: true });
  }
  console.log(`Synced skills/${skillName} -> ${path.relative(repoRoot, destinationDir)}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
