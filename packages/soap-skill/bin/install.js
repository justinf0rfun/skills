#!/usr/bin/env node

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const sourceSkillDir = path.join(packageRoot, 'skills', 'soap');
const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');

const targets = [
  {
    id: 'codex',
    name: 'Codex',
    description: 'Install soap as a Codex skill.',
    tasks: [
      {
        type: 'skill',
        label: 'Codex skill',
        destination: path.join(os.homedir(), '.agents', 'skills', 'soap')
      }
    ],
    trigger: '$soap, soap, or select soap from the skill picker',
    detectors: [
      {
        type: 'path',
        value: path.join(os.homedir(), '.agents'),
        label: '~/.agents'
      }
    ],
    missingReason: 'Codex local skill directory was not detected.'
  },
  {
    id: 'codex-cli',
    name: 'Codex CLI',
    description: 'Install soap as a Codex CLI skill.',
    tasks: [
      {
        type: 'skill',
        label: 'Codex CLI skill',
        destination: path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'skills', 'soap')
      }
    ],
    trigger: '$soap or select SOAP if your CLI discovers this directory; otherwise rerun this installer and select Codex for ~/.agents/skills',
    detectors: [
      {
        type: 'command',
        value: 'codex',
        label: 'codex command'
      },
      {
        type: 'path',
        value: process.env.CODEX_HOME || path.join(os.homedir(), '.codex'),
        label: process.env.CODEX_HOME ? 'CODEX_HOME' : '~/.codex'
      }
    ],
    missingReason: 'codex command and Codex CLI home directory were not detected.'
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description: 'Install soap as a Claude Code skill and /soap command.',
    tasks: [
      {
        type: 'skill',
        label: 'Claude Code skill',
        destination: path.join(os.homedir(), '.claude', 'skills', 'soap')
      },
      {
        type: 'claude-command',
        label: 'Claude Code /soap command',
        destination: path.join(os.homedir(), '.claude', 'commands', 'soap.md')
      }
    ],
    trigger: '/soap',
    detectors: [
      {
        type: 'command',
        value: 'claude',
        label: 'claude command'
      },
      {
        type: 'path',
        value: path.join(os.homedir(), '.claude'),
        label: '~/.claude'
      }
    ],
    missingReason: 'claude command and Claude Code home directory were not detected.'
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
  const spinner = ora('Installing soap skill...').start();
  const results = [];

  try {
    for (const task of plan) {
      const action = conflictActions.get(task.destination) || 'install';
      const result = await installTask(task, action);
      results.push(result);
    }
    spinner.succeed('soap skill installed.');
  } catch (error) {
    spinner.fail('Installation failed.');
    throw error;
  }

  printSummary(results, selectedTargets);
}

function printHeader() {
  console.log('');
  console.log(chalk.bold('soap skill installer'));
  console.log(chalk.dim('Friction happens.Soap it.'));
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
  const detectedTargets = await detectTargets();
  const availableTargets = detectedTargets.filter((target) => target.available);

  if (availableTargets.length === 0) {
    console.log(chalk.yellow('No supported AI tools were detected. You can select tools and confirm their default destinations.'));
  }

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'targetIds',
      message: 'Select AI tools to install soap for:',
      choices: detectedTargets.map((target) => ({
        name: formatTargetChoice(target),
        value: target.id,
        checked: target.available,
        disabled: false
      })),
      validate: (values) => (values.length > 0 ? true : 'Select at least one tool.')
    }
  ]);

  const selectedTargets = detectedTargets.filter((target) => answers.targetIds.includes(target.id));
  return promptUndetectedTargetConfirmation(selectedTargets);
}

async function detectTargets() {
  return Promise.all(
    targets.map(async (target) => {
      const detection = await detectTarget(target);
      return {
        ...target,
        ...detection
      };
    })
  );
}

async function detectTarget(target) {
  for (const detector of target.detectors) {
    if (detector.type === 'path' && (await exists(detector.value))) {
      return {
        available: true,
        detectionLabel: detector.label
      };
    }

    if (detector.type === 'command' && (await commandExists(detector.value))) {
      return {
        available: true,
        detectionLabel: detector.label
      };
    }
  }

  return {
    available: false,
    detectionLabel: null
  };
}

function formatTargetChoice(target) {
  const description = chalk.dim('- ' + target.description);

  if (target.available) {
    return `${target.name} ${description} ${chalk.green('(detected: ' + target.detectionLabel + ')')}`;
  }

  return `${target.name} ${description} ${chalk.yellow('(not detected)')}`;
}

async function commandExists(command) {
  const lookupCommand = process.platform === 'win32' ? 'where' : 'which';

  return new Promise((resolve) => {
    execFile(lookupCommand, [command], (error) => {
      resolve(!error);
    });
  });
}

async function promptUndetectedTargetConfirmation(selectedTargets) {
  const confirmedTargets = [];

  for (const target of selectedTargets) {
    if (target.available) {
      confirmedTargets.push(target);
      continue;
    }

    const destinationSummary = target.tasks.map((task) => task.destination).join(', ');
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'installAnyway',
        message: `${target.name} was not detected. Install to ${destinationSummary} anyway?`,
        default: false
      }
    ]);

    if (answers.installAnyway) {
      confirmedTargets.push(target);
    }
  }

  return confirmedTargets;
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

  const parent = path.dirname(task.destination);
  await fs.mkdir(parent, { recursive: true });
  const staging = await fs.mkdtemp(path.join(parent, '.soap-install-'));
  const replacement = path.join(staging, 'replacement');
  let backupPath;

  try {
    if (task.type === 'skill') {
      await fs.cp(sourceSkillDir, replacement, { recursive: true });
    } else if (task.type === 'claude-command') {
      await fs.writeFile(replacement, claudeCommandTemplate(), 'utf8');
    } else {
      throw new Error(`Unknown task type: ${task.type}`);
    }

    if (await exists(task.destination)) {
      if (action !== 'backup' && action !== 'overwrite') {
        throw new Error(`Destination changed since confirmation: ${task.destination}`);
      }
      backupPath = await uniqueBackupPath(task.destination);
      await fs.rename(task.destination, backupPath);
    }

    try {
      await fs.rename(replacement, task.destination);
    } catch (error) {
      if (backupPath) {
        try {
          await fs.rename(backupPath, task.destination);
        } catch {
          throw new Error(`Installation failed. Restore your preserved installation from ${backupPath}`);
        }
      }
      throw error;
    }
    if (backupPath && action === 'overwrite') {
      await fs.rm(backupPath, { recursive: true, force: true });
    }
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
  }

  return {
    status: 'installed',
    task
  };
}

async function exists(filePath) {
  try {
    await fs.lstat(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
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
description: Review development collaboration friction with evidence and scoped improvements.
argument-hint: [scope | export | resync <report.json>]
---

Use the soap skill to review the current development task:

$ARGUMENTS

Follow the installed soap SKILL.md. Do not ask for ratings or a task type. Use the user's conversation language unless another language is requested. Reporting is disabled unless explicitly enabled by the user.
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
