import { create } from 'zustand';
import { fsAPI } from '../services/api';

export const useWorkspaceStore = create((set) => ({
  panels: [
    { i: 'file-explorer', x: 0, y: 0, w: 3, h: 12, static: false },
    { i: 'editor', x: 3, y: 0, w: 6, h: 8, static: false },
    { i: 'terminal', x: 3, y: 8, w: 6, h: 4, static: false },
    { i: 'ai-chat', x: 9, y: 0, w: 3, h: 12, static: false },
  ],
  setPanels: (panels) => set({ panels }),
  
  files: [],
  setFiles: (files) => set({ files }),

  fetchFiles: async () => {
    try {
      const { data } = await fsAPI.getTree();
      set({ files: data.tree });
    } catch (err) {
      console.error('Failed to fetch file tree:', err);
    }
  },
  
  addFile: async (folderId, newFile, type = 'file') => {
    try {
      // Create on backend
      const path = folderId ? `${folderId}/${newFile.name}` : newFile.name;
      await fsAPI.create(path, type, newFile.content || '');
      
      // Refresh tree
      const { data } = await fsAPI.getTree();
      set({ files: data.tree });
    } catch (err) {
      console.error('Failed to create file:', err);
    }
  },

  updateFileContent: async (fileId, content) => {
    try {
      await fsAPI.saveFile(fileId, content);
      
      set((state) => {
        // Also update the content in openFiles so tabs stay in sync
        const newOpenFiles = state.openFiles.map(f => 
          f.id === fileId ? { ...f, content } : f
        );
        const newActiveFile = state.activeFile?.id === fileId ? { ...state.activeFile, content } : state.activeFile;
        
        return { openFiles: newOpenFiles, activeFile: newActiveFile };
      });
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  },

  openFiles: [],
  activeFile: null,
  
  setActiveFile: async (fileNode) => {
    try {
      // If it's a file from the tree (not already opened with content)
      if (fileNode.type === 'file' && !fileNode.content) {
        const { data } = await fsAPI.getFile(fileNode.id);
        fileNode.content = data.content;
      }
      
      set((state) => {
        // Check if file is already open
        const isOpened = state.openFiles.some(f => f.id === fileNode.id);
        const newOpenFiles = isOpened ? state.openFiles : [...state.openFiles, fileNode];
        return { openFiles: newOpenFiles, activeFile: fileNode };
      });
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  },

  closeFile: (fileId) => set((state) => {
    const newOpenFiles = state.openFiles.filter(f => f.id !== fileId);
    let newActiveFile = state.activeFile;
    if (state.activeFile?.id === fileId) {
      newActiveFile = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null;
    }
    return { openFiles: newOpenFiles, activeFile: newActiveFile };
  }),
  
  focusMode: false,
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
}));
