import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'soap-install-test-'));

try {
  // Exercise the installer with a temporary home and deterministic UI responses.
  let source = await fs.readFile(path.join(packageRoot, 'bin/install.js'), 'utf8');
  source = source.replace("import os from 'node:os';", `const os = { homedir: () => ${JSON.stringify(temp)} };`);
  source = source.replace("import process from 'node:process';", `const process = { env: { CODEX_HOME: ${JSON.stringify(path.join(temp, 'cli'))} }, platform: 'test' };`);
  source = source.replace("import chalk from 'chalk';", 'const chalk = new Proxy({}, { get: () => (text) => text });');
  source = source.replace("import inquirer from 'inquirer';", 'const answers = []; const inquirer = { prompt: async () => { assertAnswers(); return answers.shift(); } }; function assertAnswers() { if (!answers.length) throw new Error("Missing test answer"); }');
  source = source.replace("import ora from 'ora';", 'const ora = () => ({ start: () => ({ succeed() {}, fail() {} }) });');
  source = source.replace("execFile(lookupCommand, [command], (error) => {", "((cmd, args, callback) => callback(new Error('not found')))(lookupCommand, [command], (error) => {");
  source = source.slice(0, source.lastIndexOf('main().catch'));
  source += '\nexport { targets, installTask, promptConflictActions, promptUndetectedTargetConfirmation, promptTargets, answers };\n';
  await fs.mkdir(path.join(temp, 'bin'));
  await fs.writeFile(path.join(temp, 'bin/install.mjs'), source);
  const sourceDir = path.join(temp, 'skills/soap');
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.writeFile(path.join(sourceDir, 'SKILL.md'), 'SOAP fixture');
  const installer = await import(pathToFileURL(path.join(temp, 'bin/install.mjs')).href);
  installer.answers.push({ targetIds: ['codex'] }, { installAnyway: true });
  assert.equal((await installer.promptTargets())[0].id, 'codex');
  const tasks = installer.targets.flatMap((target) => target.tasks);
  for (const task of tasks) {
    assert.ok(task.destination.startsWith(temp + path.sep));
    await installer.installTask(task, 'install');
    if (task.type === 'skill') {
      assert.equal(await fs.readFile(path.join(task.destination, 'SKILL.md'), 'utf8'), 'SOAP fixture');
    } else {
      const wrapper = await fs.readFile(task.destination, 'utf8');
      assert.ok(wrapper.includes('soap skill'));
      assert.ok(wrapper.includes('$ARGUMENTS'));
      assert.ok(!wrapper.includes('kafka'));
    }
  }
  const task = tasks[0];
  const destinationFile = path.join(task.destination, 'SKILL.md');
  await fs.writeFile(destinationFile, 'Original local edits');
  installer.answers.push({ action: 'skip' });
  let actions = await installer.promptConflictActions([task]);
  await installer.installTask(task, actions.get(task.destination));
  assert.equal(await fs.readFile(destinationFile, 'utf8'), 'Original local edits');
  installer.answers.push({ action: 'backup' });
  actions = await installer.promptConflictActions([task]);
  await installer.installTask(task, actions.get(task.destination));
  const parent = path.dirname(task.destination);
  const backups = (await fs.readdir(parent)).filter((name) => name.startsWith('soap.backup-'));
  assert.equal(backups.length, 1);
  assert.equal(await fs.readFile(path.join(parent, backups[0], 'SKILL.md'), 'utf8'), 'Original local edits');
  await fs.writeFile(path.join(task.destination, 'obsolete.txt'), 'old');
  await installer.installTask(task, 'overwrite');
  assert.equal(await fs.readFile(destinationFile, 'utf8'), 'SOAP fixture');
  await assert.rejects(fs.access(path.join(task.destination, 'obsolete.txt')));
  installer.answers.push({ installAnyway: false });
  assert.deepEqual(await installer.promptUndetectedTargetConfirmation([{ ...installer.targets[0], available: false }]), []);
  const command = tasks.find((entry) => entry.type === 'claude-command');
  await fs.rm(command.destination);
  const missingTarget = path.join(temp, 'missing-command');
  await fs.symlink(missingTarget, command.destination);
  installer.answers.push({ action: 'backup' });
  actions = await installer.promptConflictActions([command]);
  assert.equal(actions.get(command.destination), 'backup');
  await installer.installTask(command, actions.get(command.destination));
  const commandParent = path.dirname(command.destination);
  const commandBackup = (await fs.readdir(commandParent)).find((name) => name.startsWith('soap.md.backup-'));
  assert.equal(await fs.readlink(path.join(commandParent, commandBackup)), missingTarget);
  assert.ok((await fs.readFile(command.destination, 'utf8')).includes('soap skill'));
  const realCopy = fs.cp;
  const realRename = fs.rename;
  for (const action of ['backup', 'overwrite']) {
    await fs.writeFile(destinationFile, 'Keep local edits on copy failure');
    try {
      fs.cp = async () => { throw new Error('ENOSPC'); };
      await assert.rejects(installer.installTask(task, action), /ENOSPC/);
    } finally {
      fs.cp = realCopy;
    }
    assert.equal(await fs.readFile(destinationFile, 'utf8'), 'Keep local edits on copy failure');
    try {
      fs.rename = async (from, to) => {
        if (from.endsWith(path.sep + 'replacement')) throw new Error('Activation failed');
        return realRename(from, to);
      };
      await assert.rejects(installer.installTask(task, action), /Activation failed/);
    } finally {
      fs.rename = realRename;
    }
    assert.equal(await fs.readFile(destinationFile, 'utf8'), 'Keep local edits on copy failure');
    assert.ok(!(await fs.readdir(parent)).some((name) => name.startsWith('.soap-install-')));
  }
  console.log('SOAP installer checks passed: destinations, wrapper, skip, backup, overwrite, and declined installation.');
} finally {
  await fs.rm(temp, { recursive: true, force: true });
}
