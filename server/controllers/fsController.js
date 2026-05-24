import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the root workspace directory
const WORKSPACE_DIR = path.resolve(__dirname, '../uploads/workspace');

// Helper to ensure the workspace directory exists
const ensureWorkspace = async () => {
  try {
    await fs.mkdir(WORKSPACE_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating workspace directory:', err);
  }
};
ensureWorkspace();

// Helper to safely resolve paths and prevent directory traversal
const getSafePath = (relativePath) => {
  if (!relativePath) return WORKSPACE_DIR;
  const safePath = path.resolve(WORKSPACE_DIR, relativePath.replace(/^(\.\.(\/|\\|$))+/, ''));
  if (!safePath.startsWith(WORKSPACE_DIR)) {
    throw new Error('Access denied: Invalid path');
  }
  return safePath;
};

const buildTree = async (dirPath, relativeRoot = '') => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const tree = [];
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.join(relativeRoot, entry.name).replace(/\\/g, '/');
    const id = relPath; // Use relative path as ID
    
    if (entry.isDirectory()) {
      const children = await buildTree(fullPath, relPath);
      tree.push({ id, name: entry.name, type: 'folder', children });
    } else {
      tree.push({ id, name: entry.name, type: 'file' });
    }
  }
  return tree;
};

// GET /api/fs/tree
export const getFileTree = async (req, res) => {
  try {
    await ensureWorkspace();
    const tree = await buildTree(WORKSPACE_DIR);
    res.json({ tree });
  } catch (err) {
    res.status(500).json({ message: 'Error reading workspace', error: err.message });
  }
};

// GET /api/fs/file?path=...
export const getFileContent = async (req, res) => {
  try {
    const filePath = getSafePath(req.query.path);
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: 'Error reading file', error: err.message });
  }
};

// POST /api/fs/file
export const saveFileContent = async (req, res) => {
  try {
    const { path: relPath, content } = req.body;
    const filePath = getSafePath(relPath);
    await fs.writeFile(filePath, content || '', 'utf-8');
    res.json({ message: 'File saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving file', error: err.message });
  }
};

// POST /api/fs/create
export const createFileOrFolder = async (req, res) => {
  try {
    const { path: relPath, type, content = '' } = req.body;
    const targetPath = getSafePath(relPath);
    
    if (type === 'folder') {
      await fs.mkdir(targetPath, { recursive: true });
    } else {
      await fs.writeFile(targetPath, content, 'utf-8');
    }
    res.status(201).json({ message: `${type} created successfully` });
  } catch (err) {
    res.status(500).json({ message: `Error creating ${req.body.type}`, error: err.message });
  }
};
