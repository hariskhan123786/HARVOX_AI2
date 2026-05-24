import ptyManager from '../terminal/ptyManager.js';

export function initializeTerminalSocket(io) {
  const terminalNamespace = io.of('/terminal');

  terminalNamespace.on('connection', (socket) => {
    console.log(`Terminal connected: ${socket.id}`);
    
    // Create a new PTY session for this connection
    const ptyProcess = ptyManager.createSession(socket.id);

    // Stream PTY output to the client
    ptyProcess.onData((data) => {
      socket.emit('terminal:data', data);
    });

    // Receive input from the client and send to PTY
    socket.on('terminal:write', (data) => {
      ptyManager.write(socket.id, data);
    });

    // Handle terminal resize
    socket.on('terminal:resize', ({ cols, rows }) => {
      ptyManager.resize(socket.id, cols, rows);
    });

    socket.on('disconnect', () => {
      console.log(`Terminal disconnected: ${socket.id}`);
      ptyManager.removeSession(socket.id);
    });
  });
}
