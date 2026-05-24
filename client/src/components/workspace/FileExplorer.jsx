import React, { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Plus, UploadCloud, FolderPlus } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';

export default function FileExplorer() {
  const [expanded, setExpanded] = useState({});
  const { setActiveFile, activeFile, files, addFile, fetchFiles } = useWorkspaceStore();

  useEffect(() => {
    fetchFiles();
  }, []);

  const toggleFolder = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNewFile = () => {
    const name = prompt('Enter new file name (e.g. script.js):');
    if (name) {
      addFile(null, { name, content: `// ${name}\n` }, 'file');
    }
  };

  const handleNewFolder = () => {
    const name = prompt('Enter new folder name:');
    if (name) {
      addFile(null, { name }, 'folder');
    }
  };

  const handleFileClick = (node) => {
    if (node.type === 'file') {
      setActiveFile({
        id: node.id,
        name: node.name,
        type: node.name.split('.').pop(),
        content: node.content || `// Content for ${node.name}`
      });
    } else {
      toggleFolder(node.id);
    }
  };

  const renderTree = (nodes, padding = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div 
          className={`flex items-center py-1 px-2 hover:bg-white/5 cursor-pointer rounded text-sm transition-colors ${activeFile?.id === node.id ? 'bg-neon-blue/10 text-neon-blue' : 'text-muted hover:text-white'}`}
          style={{ paddingLeft: `${padding + 0.5}rem` }}
          onClick={() => handleFileClick(node)}
        >
          {node.type === 'folder' ? (
            <span className="mr-1">
              {expanded[node.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          ) : (
            <span className="mr-1 w-[14px]" /> // Spacer
          )}
          
          {node.type === 'folder' ? (
            <Folder size={14} className="mr-2 text-neon-blue" />
          ) : (
            <File size={14} className="mr-2 text-neon-purple" />
          )}
          
          <span className="truncate">{node.name}</span>
        </div>
        
        {node.type === 'folder' && expanded[node.id] && node.children && (
          <div>
            {renderTree(node.children, padding + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col p-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-black/40 bg-[#2d2d2d]">
        <h3 className="font-sans text-xs text-gray-300 font-semibold tracking-wider">PROJECT</h3>
        <div className="flex gap-1 text-gray-400">
          <button onClick={handleNewFile} className="p-1 hover:text-white transition-colors hover:bg-white/10 rounded" title="New File"><Plus size={14} /></button>
          <button onClick={handleNewFolder} className="p-1 hover:text-white transition-colors hover:bg-white/10 rounded" title="New Folder"><FolderPlus size={14} /></button>
          <button onClick={fetchFiles} className="p-1 hover:text-white transition-colors hover:bg-white/10 rounded" title="Refresh"><UploadCloud size={14} /></button>
        </div>
      </div>
      <div className="p-2 overflow-y-auto flex-1 text-gray-300 bg-[#252526]">
        {files.length === 0 ? (
          <div className="text-center text-xs text-muted mt-4 opacity-50">Empty Workspace</div>
        ) : (
          renderTree(files)
        )}
      </div>
    </div>
  );
}
