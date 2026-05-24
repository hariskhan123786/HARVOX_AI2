import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import FileExplorer from '../../components/workspace/FileExplorer';
import TerminalPanel from '../../components/terminal/TerminalPanel';
import { Maximize, Play, Save, X, TerminalSquare, MessageSquareCode } from 'lucide-react';
import PromptBar from '../../components/dashboard/PromptBar';
import Editor from '@monaco-editor/react';

export default function WorkspaceOS() {
  const { focusMode, toggleFocusMode, activeFile, openFiles, setActiveFile, closeFile, updateFileContent } = useWorkspaceStore();
  const [editorContent, setEditorContent] = useState('');
  const [previewContent, setPreviewContent] = useState(null);
  
  // Layout states
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(250);

  // Sync editor content with active file
  useEffect(() => {
    if (activeFile) setEditorContent(activeFile.content || '');
    else setEditorContent('');
  }, [activeFile]);

  return (
    <div className={`flex flex-col w-full h-[calc(100vh-100px)] bg-[#1e1e1e] text-white overflow-hidden transition-all duration-300 ${focusMode ? 'fixed inset-0 z-50 h-screen w-screen rounded-none' : 'rounded-lg border border-white/10'}`}>
      
      {/* Workspace Header - VS Code Style */}
      <div className="flex h-10 items-center justify-between bg-[#2d2d2d] px-4 border-b border-black/40 select-none">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="font-sans text-xs text-gray-300">HARVOX IDE</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setShowRightPanel(!showRightPanel)} className={`text-gray-400 hover:text-white transition-colors p-1.5 rounded ${showRightPanel ? 'bg-white/10' : ''}`} title="Toggle AI Assistant">
            <MessageSquareCode size={14} />
          </button>
          <button onClick={toggleFocusMode} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded" title="Toggle Fullscreen">
            <Maximize size={14} />
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - File Explorer */}
        <div className="w-[250px] flex-shrink-0 bg-[#252526] border-r border-black/40 flex flex-col">
          <div className="px-4 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Explorer
          </div>
          <div className="flex-1 overflow-hidden">
            <FileExplorer />
          </div>
        </div>

        {/* Center Area - Editor & Terminal */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          
          {/* Editor Tabs & Actions */}
          <div className="flex bg-[#2d2d2d] h-9 items-end px-2 select-none overflow-x-auto overflow-y-hidden hide-scrollbar">
            {openFiles.map(file => (
              <div 
                key={file.id} 
                onClick={() => setActiveFile(file)}
                className={`flex items-center gap-2 px-3 py-1.5 min-w-[120px] max-w-[200px] text-xs cursor-pointer border-t border-x border-transparent transition-colors group
                  ${activeFile?.id === file.id 
                    ? 'bg-[#1e1e1e] text-white border-t-blue-500' 
                    : 'text-gray-400 hover:bg-[#1e1e1e]/50 hover:text-gray-200'
                  }`}
              >
                <span className="truncate flex-1">{file.name}</span>
                <button onClick={(e) => { e.stopPropagation(); closeFile(file.id); }} className={`p-0.5 rounded hover:bg-white/10 ${activeFile?.id === file.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <X size={12} />
                </button>
              </div>
            ))}
            {openFiles.length === 0 && (
              <div className="px-3 py-1.5 text-xs text-gray-500 italic">No files open</div>
            )}
            
            <div className="flex-1" /> {/* Spacer */}
            
            {/* Editor Actions */}
            <div className="flex items-center gap-1 pb-1 pr-2">
              <button 
                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10" 
                title="Save (Ctrl+S)"
                onClick={() => {
                  if (activeFile) updateFileContent(activeFile.id, editorContent);
                }}
              >
                <Save size={14} />
              </button>
              <button 
                className="text-gray-400 hover:text-green-400 transition-colors p-1 rounded hover:bg-white/10" 
                title="Run Code / Live Preview"
                onClick={() => {
                  if (activeFile) {
                    updateFileContent(activeFile.id, editorContent);
                    if (activeFile.name.endsWith('.html') || activeFile.name.endsWith('.js')) {
                      setPreviewContent(editorContent);
                    } else {
                      alert('Live preview is only available for HTML/JS files currently.');
                    }
                  }
                }}
              >
                <Play size={14} />
              </button>
            </div>
          </div>

          {/* Code Editor & Preview Split */}
          <div className="flex-1 flex overflow-hidden">
            {/* Monaco Editor */}
            <div className={`flex-1 relative ${previewContent ? 'border-r border-black/40' : ''}`}>
              <Editor
                height="100%"
                language={activeFile?.name?.endsWith('.css') ? 'css' : activeFile?.name?.endsWith('.html') ? 'html' : activeFile?.name?.endsWith('.json') ? 'json' : 'javascript'}
                theme="vs-dark"
                value={editorContent}
                onChange={(val) => {
                  setEditorContent(val);
                  if (activeFile) updateFileContent(activeFile.id, val);
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'Droid Sans Mono', 'monospace', monospace, 'Droid Sans Fallback'",
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorWidth: 2,
                }}
              />
            </div>

            {/* Live Preview Pane (Side-by-Side) */}
            {previewContent !== null && (
              <div className="w-1/2 flex flex-col bg-white">
                <div className="bg-[#2d2d2d] px-3 py-1.5 flex justify-between items-center text-xs text-gray-300 border-b border-black/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live Preview
                  </div>
                  <button onClick={() => setPreviewContent(null)} className="hover:text-white p-1 rounded hover:bg-white/10">
                    <X size={14} />
                  </button>
                </div>
                <iframe 
                  className="flex-1 w-full border-none bg-white text-black" 
                  srcDoc={activeFile?.name?.endsWith('.html') ? previewContent : `<html><body><script>${previewContent}</script><div style="font-family: sans-serif; padding: 20px;">Script executed. Check browser console.</div></body></html>`} 
                  sandbox="allow-scripts"
                />
              </div>
            )}
          </div>

          {/* Bottom Panel (Terminal) */}
          <div className="border-t border-black/40 flex flex-col" style={{ height: bottomPanelHeight }}>
            <div className="flex items-center gap-4 px-4 h-8 bg-[#2d2d2d] text-xs font-sans text-gray-400">
              <button className="text-white border-b border-blue-500 pb-1 pt-1 flex items-center gap-2">
                <TerminalSquare size={14} /> Terminal
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
              <TerminalPanel />
            </div>
          </div>
        </div>

        {/* Right Sidebar - AI Assistant */}
        {showRightPanel && (
          <div className="w-[300px] flex-shrink-0 bg-[#252526] border-l border-black/40 flex flex-col">
            <div className="px-4 py-2 flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-black/20">
              <span>AI Assistant</span>
              <button onClick={() => setShowRightPanel(false)} className="hover:text-white"><X size={14}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-[#1e1e1e] border border-white/5 p-3 rounded text-sm text-gray-300 shadow-inner">
                I am ready to help you write code or debug issues in your Workspace.
              </div>
            </div>
            <div className="p-3 border-t border-black/40 bg-[#2d2d2d]">
              <PromptBar />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
