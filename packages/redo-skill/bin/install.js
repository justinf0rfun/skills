#!/usr/bin/env node

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const sourceSkillDir = path.join(packageRoot, 'skills', 'redo');
const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');

const targets = [
  {
    id: 'codex',
    name: 'Codex',
    description: 'Install redo as a Codex skill.',
    tasks: [
      {
        type: 'skill',
        label: 'Codex skill',
        destination: path.join(os.homedir(), '.agents', 'skills', 'redo')
      }
    ],
    trigger: '$redo kafka, redo kafka, or select redo from the skill picker'
  },
  {
    id: 'codex-cli',
    name: 'Codex CLI',
    description: 'Install redo as a Codex CLI skill.',
    tasks: [
      {
        type: 'skill',
        label: 'Codex CLI skill',
        destination: path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'skills', 'redo')
      }
    ],
    trigger: '$redo kafka, redo kafka, or /skills then choose redo'
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description: 'Install redo as a Claude Code skill and /redo command.',
    tasks: [
      {
        type: 'skill',
        label: 'Claude Code skill',
        destination: path.join(os.homedir(), '.claude', 'skills', 'redo')
      },
      {
        type: 'claude-command',
        label: 'Claude Code /redo command',
        destination: path.join(os.homedir(), '.claude', 'commands', 'redo.md')
      }
    ],
    trigger: '/redo kafka'
  }
];

async function main() {
  printHeader();
  await ensureSourceSkillExists();

  const selectedTargets = await promptTargets();
  if (selectedTargets.length === 0) {
    console.log(chalk.yellow('No tools selected. Nothing installed.'));
    return;
  }

  const plan = selectedTargets.flatMap((target) =>
    target.tasks.map((task) => ({
      ...task,
      targetName: target.name,
      trigger: target.trigger
    }))
  );

  const conflictActions = await promptConflictActions(plan);
  const spinner = ora('Installing redo skill...').start();
  const results = [];

  try {
    for (const task of plan) {
      const action = conflictActions.get(task.destination) || 'install';
      const result = await installTask(task, action);
      results.push(result);
    }
    spinner.succeed('redo skill installed.');
  } catch (error) {
    spinner.fail('Installation failed.');
    throw error;
  }

  printSummary(results, selectedTargets);
}

function printHeader() {
  console.log('');
  console.log(chalk.bold('redo skill installer'));
  console.log(chalk.dim('Reverse-learn technologies through engineering constraints, trade-offs, and technical debt.'));
  console.log('');
}

async function ensureSourceSkillExists() {
  try {
    await fs.access(path.join(sourceSkillDir, 'SKILL.md'));
  } catch {
    throw new Error(`Cannot find source skill at ${sourceSkillDir}`);
  }
}

async function promptTargets() {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'targetIds',
      message: 'Select AI tools to install redo for:',
      choices: targets.map((target) => ({
        name: `${target.name} ${chalk.dim('- ' + target.description)}`,
        value: target.id,
        checked: true
      })),
      validate: (values) => (values.length > 0 ? true : 'Select at least one tool.')
    }
  ]);

  return targets.filter((target) => answers.targetIds.includes(target.id));
}

async function promptConflictActions(plan) {
  const actions = new Map();

  for (const task of plan) {
    if (!(await exists(task.destination))) {
      actions.set(task.destination, 'install');
      continue;
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `${task.label} already exists at ${task.destination}`,
        default: 'backup',
        choices: [
          {
            name: 'Backup then overwrite',
            value: 'backup'
          },
          {
            name: 'Overwrite',
            value: 'overwrite'
          },
          {
            name: 'Skip',
            value: 'skip'
          }
        ]
      }
    ]);

    actions.set(task.destination, answers.action);
  }

  return actions;
}

async function installTask(task, action) {
  if (action === 'skip') {
    return {
      status: 'skipped',
      task
    };
  }

  if (await exists(task.destination)) {
    if (action === 'backup') {
      const backupPath = await uniqueBackupPath(task.destination);
      await fs.rename(task.destination, backupPath);
    } else if (action === 'overwrite') {
      await fs.rm(task.destination, { recursive: true, force: true });
    }
  }

  await fs.mkdir(path.dirname(task.destination), { recursive: true });

  if (task.type === 'skill') {
    await fs.cp(sourceSkillDir, task.destination, { recursive: true });
  } else if (task.type === 'claude-command') {
    await fs.writeFile(task.destination, claudeCommandTemplate(), 'utf8');
  } else {
    throw new Error(`Unknown task type: ${task.type}`);
  }

  return {
    status: 'installed',
    task
  };
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function uniqueBackupPath(filePath) {
  let candidate = `${filePath}.backup-${timestamp}`;
  let index = 1;

  while (await exists(candidate)) {
    candidate = `${filePath}.backup-${timestamp}-${index}`;
    index += 1;
  }

  return candidate;
}

function claudeCommandTemplate() {
  return `---
description: Reverse-learn a technology by reconstructing its engineering constraints, trade-offs, debt, fixes, and unresolved pain points.
argument-hint: <technology/tool> [--lang zh|en]
---

Use the redo skill to analyze:

$ARGUMENTS

If the user did not provide a topic, ask for one. Otherwise, follow the redo skill output contract. Use the user's current language unless --lang zh or --lang en is provided.
`;
}

function printSummary(results, selectedTargets) {
  console.log('');
  console.log(chalk.bold('Installed targets'));

  for (const result of results) {
    const icon = result.status === 'installed' ? chalk.green('✓') : chalk.yellow('-');
    console.log(`${icon} ${result.task.label}: ${result.task.destination}`);
  }

  console.log('');
  console.log(chalk.bold('How to trigger'));

  for (const target of selectedTargets) {
    console.log(`${chalk.cyan(target.name)}: ${target.trigger}`);
  }

  console.log('');
}

main().catch((error) => {
  console.error(chalk.red(error.message));
  process.exitCode = 1;
});
