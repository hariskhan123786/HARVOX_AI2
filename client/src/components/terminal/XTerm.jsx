import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import io from 'socket.io-client';

const XTerm = () => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize xterm.js
    xtermRef.current = new Terminal({
      cursorBlink: true,
      fontFamily: '"Fira Code", monospace',
      fontSize: 14,
      theme: {
        background: '#070B14', // Match our app background
        foreground: '#F8F8F8',
        cursor: '#00F0FF',     // Neon blue
        selection: 'rgba(0, 240, 255, 0.3)',
        black: '#000000',
        red: '#ff003c',
        green: '#00ffaa',
        yellow: '#fff000',
        blue: '#00d2ff',
        magenta: '#ff00c8',
        cyan: '#00ffff',
        white: '#ffffff',
      },
    });

    fitAddonRef.current = new FitAddon();
    xtermRef.current.loadAddon(fitAddonRef.current);

    if (terminalRef.current) {
      xtermRef.current.open(terminalRef.current);
      fitAddonRef.current.fit();
    }

    // Connect to Socket.io terminal namespace with JWT authentication
    const token = localStorage.getItem('harvox_token');
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    socketRef.current = io(`${socketUrl}/terminal`, {
      withCredentials: true,
      auth: { token },
    });

    // Handle incoming data
    socketRef.current.on('terminal:data', (data) => {
      xtermRef.current.write(data);
    });

    // Send data to server
    xtermRef.current.onData((data) => {
      socketRef.current.emit('terminal:write', data);
    });

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current && socketRef.current) {
        fitAddonRef.current.fit();
        const dims = fitAddonRef.current.proposeDimensions();
        if (dims) {
          socketRef.current.emit('terminal:resize', { cols: dims.cols, rows: dims.rows });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial resize signal
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      socketRef.current?.disconnect();
      xtermRef.current?.dispose();
    };
  }, []);

  return <div ref={terminalRef} className="h-full w-full overflow-hidden p-2 rounded-xl border border-white/10 bg-[#070B14] shadow-inner" />;
};

export default XTerm;
