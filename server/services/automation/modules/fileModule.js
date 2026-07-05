/**
 * HARVOX Automation Engine — File Module
 * Skills: File operations, folder management, search, zip/unzip
 * Delete always requires confirmation (sensitive: true)
 */

import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logActivity } from '../../memoryService.js';
import { registerModule } from '../automationRegistry.js';
import { pushRollback } from '../../rollbackService.js';
import { runPS } from '../../../utils/powershell.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_DIR = path.resolve(__dirname, '../../../uploads/workspace');

function sanitize(p) {
  return p.replace(/^(\.\.([/\\]|$))+/, '').replace(/[<>:"|?*]/g, '');
}

function resolved(relativePath) {
  const target = path.resolve(WORKSPACE_DIR, sanitize(relativePath));
  if (!target.startsWith(WORKSPACE_DIR)) {
    throw new Error('Access Denied: Path is outside the allowed workspace directory.');
  }
  return target;
}


// ─── File Skills ──────────────────────────────────────────────────────────────

async function createFolder(userId, args) {
  const dirName = args[0] || 'new-folder';
  const targetPath = resolved(dirName);
  
  const exists = await fs.access(targetPath).then(() => true).catch(() => false);
  await fs.mkdir(targetPath, { recursive: true });

  if (!exists) {
    pushRollback(userId, {
      description: `Delete created folder "${dirName}"`,
      undoFn: async () => {
        await fs.rm(targetPath, { recursive: true, force: true });
        return { message: `Folder "${dirName}" deleted.` };
      }
    });
  }

  await logActivity(userId, 'file_mkdir', `Created folder: ${dirName}`, { path: dirName });
  return { success: true, message: `Folder "${dirName}" created in workspace.` };
}

async function createFile(userId, args) {
  const filePath = args[0] || 'new-file.txt';
  const content = args[1] || '';
  const targetPath = resolved(filePath);
  
  let oldContent = null;
  const exists = await fs.access(targetPath).then(() => true).catch(() => false);
  if (exists) {
    oldContent = await fs.readFile(targetPath, 'utf-8');
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true }).catch(() => {});
  await fs.writeFile(targetPath, content, 'utf-8');

  pushRollback(userId, {
    description: `${exists ? 'Restore' : 'Delete'} file "${filePath}"`,
    undoFn: async () => {
      if (exists) {
        await fs.writeFile(targetPath, oldContent, 'utf-8');
        return { message: `Restored content of "${filePath}".` };
      } else {
        await fs.unlink(targetPath);
        return { message: `Deleted file "${filePath}".` };
      }
    }
  });

  await logActivity(userId, 'file_create', `Created file: ${filePath}`, { path: filePath });
  return { success: true, message: `File "${filePath}" created in workspace.` };
}

async function renameFile(userId, args) {
  const oldName = args[0] || '';
  const newName = args[1] || '';
  if (!oldName || !newName) throw new Error('Both old and new name are required.');

  const oldPath = resolved(oldName);
  const newPath = resolved(newName);

  await fs.rename(oldPath, newPath);

  pushRollback(userId, {
    description: `Rename "${newName}" back to "${oldName}"`,
    undoFn: async () => {
      await fs.rename(newPath, oldPath);
      return { message: `Renamed file back to "${oldName}".` };
    }
  });

  await logActivity(userId, 'file_rename', `Renamed "${oldName}" → "${newName}"`, { oldName, newName });
  return { success: true, message: `"${oldName}" renamed to "${newName}".` };
}

async function moveFile(userId, args) {
  const sourcePath = args[0] || '';
  const destPath = args[1] || '';
  if (!sourcePath || !destPath) throw new Error('Source and destination paths are required.');

  const src = resolved(sourcePath);
  const dest = resolved(destPath);

  await fs.mkdir(path.dirname(dest), { recursive: true }).catch(() => {});
  await fs.rename(src, dest);

  pushRollback(userId, {
    description: `Move "${destPath}" back to "${sourcePath}"`,
    undoFn: async () => {
      await fs.mkdir(path.dirname(src), { recursive: true }).catch(() => {});
      await fs.rename(dest, src);
      return { message: `Moved file back to "${sourcePath}".` };
    }
  });

  await logActivity(userId, 'file_move', `Moved "${sourcePath}" → "${destPath}"`, { sourcePath, destPath });
  return { success: true, message: `"${sourcePath}" moved to "${destPath}".` };
}

/**
 * Delete — SENSITIVE ACTION. User must confirm via TaskPlanWidget before this executes.
 */
async function deleteFile(userId, args) {
  const targetPath = args[0] || '';
  if (!targetPath) throw new Error('File or folder path is required.');
  const fullPath = resolved(targetPath);

  const stat = await fs.stat(fullPath);
  if (stat.isDirectory()) {
    const backupDir = path.resolve(__dirname, '../../../uploads/backups');
    await fs.mkdir(backupDir, { recursive: true }).catch(() => {});
    const backupZip = path.join(backupDir, `backup_${path.basename(targetPath)}_${Date.now()}.zip`);
    await runPS(`Compress-Archive -Path "${fullPath}" -DestinationPath "${backupZip}" -Force`);
    
    await fs.rm(fullPath, { recursive: true, force: true });
    
    pushRollback(userId, {
      description: `Restore folder "${targetPath}"`,
      undoFn: async () => {
        await runPS(`Expand-Archive -Path "${backupZip}" -DestinationPath "${fullPath}" -Force`);
        await fs.unlink(backupZip).catch(() => {});
        return { message: `Restored folder "${targetPath}".` };
      }
    });
  } else {
    const deletedContent = await fs.readFile(fullPath);
    await fs.unlink(fullPath);
    
    pushRollback(userId, {
      description: `Restore file "${targetPath}"`,
      undoFn: async () => {
        await fs.mkdir(path.dirname(fullPath), { recursive: true }).catch(() => {});
        await fs.writeFile(fullPath, deletedContent);
        return { message: `Restored file "${targetPath}".` };
      }
    });
  }

  await logActivity(userId, 'file_delete', `Deleted: "${targetPath}"`, { path: targetPath });
  return { success: true, message: `"${targetPath}" permanently deleted from workspace.` };
}

async function compressFolder(userId, args) {
  const folderName = args[0] || '';
  if (!folderName) throw new Error('Folder name is required.');

  const srcPath = resolved(folderName);
  const zipName = `${path.basename(folderName)}-${Date.now()}.zip`;
  const zipPath = resolved(zipName);

  const output = await runPS(`
Compress-Archive -Path "${srcPath}" -DestinationPath "${zipPath}" -Force
Write-Output "Compressed to ${zipName}"
  `);

  await logActivity(userId, 'file_compress', `Compressed folder: "${folderName}" → "${zipName}"`, { folderName, zipName });
  return { success: true, message: `Folder "${folderName}" compressed to "${zipName}".`, output };
}

async function extractZip(userId, args) {
  const zipFile = args[0] || '';
  if (!zipFile) throw new Error('ZIP file path is required.');

  const zipPath = resolved(zipFile);
  const extractDir = resolved(zipFile.replace(/\.zip$/i, '') + '-extracted');

  const output = await runPS(`
Expand-Archive -Path "${zipPath}" -DestinationPath "${extractDir}" -Force
Write-Output "Extracted to ${extractDir}"
  `);

  await logActivity(userId, 'file_extract', `Extracted: "${zipFile}"`, { zipFile });
  return { success: true, message: `"${zipFile}" extracted successfully.`, output };
}

async function findFile(userId, args) {
  const searchName = args[0] || '';
  if (!searchName) throw new Error('Search term is required.');

  const results = [];
  async function searchDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (entry.name.toLowerCase().includes(searchName.toLowerCase())) {
        results.push(path.join(dir, entry.name).replace(WORKSPACE_DIR, '').replace(/\\/g, '/'));
      }
      if (entry.isDirectory()) {
        await searchDir(path.join(dir, entry.name));
      }
    }
  }

  await searchDir(WORKSPACE_DIR);
  await logActivity(userId, 'file_search', `Searched workspace for: "${searchName}"`, { searchName, found: results.length });

  if (results.length === 0) {
    return { success: true, message: `No files matching "${searchName}" found in workspace.` };
  }
  return { success: true, message: `Found ${results.length} file(s) matching "${searchName}":`, output: results.join('\n') };
}

async function organizeDownloads(userId) {
  const downloadsPath = path.join(process.env.USERPROFILE || 'C:\\Users\\Default', 'Downloads');

  const output = await runPS(`
$downloadsPath = "$env:USERPROFILE\\Downloads"
$categories = @{
  "Images"    = @("jpg","jpeg","png","gif","webp","bmp","svg","ico")
  "Videos"    = @("mp4","mkv","avi","mov","wmv","flv","webm")
  "Audio"     = @("mp3","wav","flac","aac","ogg","m4a")
  "Documents" = @("pdf","docx","doc","xlsx","xls","pptx","ppt","txt","md")
  "Code"      = @("js","ts","jsx","tsx","py","java","cpp","c","cs","html","css","json","xml","sh","bat","ps1")
  "Archives"  = @("zip","rar","7z","tar","gz","bz2")
  "Installers"= @("exe","msi","dmg","deb","rpm")
}
$moved = 0
Get-ChildItem -Path $downloadsPath -File | ForEach-Object {
  $ext = $_.Extension.TrimStart(".").ToLower()
  $dest = $null
  foreach ($cat in $categories.GetEnumerator()) {
    if ($cat.Value -contains $ext) { $dest = $cat.Key; break }
  }
  if ($dest) {
    $destPath = Join-Path $downloadsPath $dest
    if (!(Test-Path $destPath)) { New-Item -Path $destPath -ItemType Directory | Out-Null }
    Move-Item -Path $_.FullName -Destination (Join-Path $destPath $_.Name) -Force
    $moved++
  }
}
Write-Output "Organized $moved files into categories."
  `);

  await logActivity(userId, 'file_organize_downloads', 'Organized Downloads folder');
  return { success: true, message: 'Downloads folder organized by file type.', output };
}

// ─── Module Registration ──────────────────────────────────────────────────────

registerModule(
  'file',
  {
    name: 'File Automation',
    icon: 'FolderOpen',
    description: 'Create, rename, move, compress, extract, and organize files and folders.',
    color: '#f59e0b',
  },
  [
    { action: 'file_create_folder',      label: 'Create Folder',            handler: (u, a) => createFolder(u, a),        estimatedMs: 1000 },
    { action: 'file_create_file',        label: 'Create File',              handler: (u, a) => createFile(u, a),          estimatedMs: 1000 },
    { action: 'file_rename',             label: 'Rename File/Folder',       handler: (u, a) => renameFile(u, a),          estimatedMs: 1000 },
    { action: 'file_move',               label: 'Move File/Folder',         handler: (u, a) => moveFile(u, a),            estimatedMs: 1000 },
    { action: 'file_delete',             label: 'Delete File/Folder',       handler: (u, a) => deleteFile(u, a),          estimatedMs: 2000, sensitive: true },
    { action: 'file_compress',           label: 'Compress Folder to ZIP',   handler: (u, a) => compressFolder(u, a),      estimatedMs: 5000 },
    { action: 'file_extract_zip',        label: 'Extract ZIP Archive',      handler: (u, a) => extractZip(u, a),          estimatedMs: 3000 },
    { action: 'file_search',             label: 'Search for File',          handler: (u, a) => findFile(u, a),            estimatedMs: 3000 },
    { action: 'file_organize_downloads', label: 'Organize Downloads Folder',handler: (u) => organizeDownloads(u),         estimatedMs: 5000 },
  ]
);
