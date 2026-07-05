/**
 * HARVOX AI — Shared PowerShell Utility
 * Centralizes PowerShell execution used across all automation modules.
 * Eliminates duplication of runPS() in mediaModule, browserModule, productivityModule.
 */

import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.resolve(__dirname, '../uploads/workspace');

/**
 * Run a PowerShell script block.
 * Writes script to a temp .ps1 file, executes it, and cleans up.
 * @param {string} script - PowerShell script content
 * @param {string} [tag='ps'] - Tag for temp filename (for debugging)
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
export async function runPS(script, tag = 'ps') {
  await fs.mkdir(TEMP_DIR, { recursive: true }).catch(() => {});
  const tmpFile = path.join(TEMP_DIR, `${tag}_${Date.now()}.ps1`);
  await fs.writeFile(tmpFile, script, 'utf-8');
  return new Promise((resolve, reject) => {
    exec(
      `powershell -ExecutionPolicy Bypass -NonInteractive -File "${tmpFile}"`,
      { timeout: 30000 },
      async (err, stdout, stderr) => {
        await fs.unlink(tmpFile).catch(() => {});
        if (err) {
          // Prefer stderr details, fall back to err message
          return reject(new Error(stderr?.trim() || stdout?.trim() || err.message));
        }
        // Return stdout string so callers can inspect output
        resolve(stdout?.trim() || '');
      }
    );
  });
}

/**
 * Run a PowerShell command string directly (no temp file).
 * Good for single-line commands.
 * @param {string} command - PS command string
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
export async function runPSCommand(command) {
  return new Promise((resolve) => {
    exec(
      `powershell -ExecutionPolicy Bypass -NonInteractive -Command "${command.replace(/"/g, '\\"')}"`,
      { timeout: 15000 },
      (err, stdout, stderr) => {
        resolve({ stdout: stdout || '', stderr: stderr || '', error: err });
      }
    );
  });
}

/**
 * Execute a Windows shell command (cmd).
 * @param {string} cmd - Command string
 * @param {object} [opts] - exec options
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
export function execCmd(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout, stderr) => {
      if (err) return reject(Object.assign(err, { stderr }));
      resolve({ stdout: stdout || '', stderr: stderr || '' });
    });
  });
}

/**
 * Launch a Windows application or URL silently (fire-and-forget style).
 * @param {string} cmd - e.g. 'start chrome'
 * @returns {Promise<void>}
 */
export function openWin(cmd) {
  return new Promise((resolve) => exec(cmd, () => resolve()));
}
