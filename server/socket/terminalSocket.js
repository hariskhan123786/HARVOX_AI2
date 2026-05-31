import ptyManager from '../terminal/ptyManager.js';
import jwt from 'jsonwebtoken';

export function initializeTerminalSocket(io) {
  const terminalNamespace = io.of('/terminal');

  // Secure connection with JWT Authentication middleware
  terminalNamespace.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.warn(`[Socket Auth] Connection rejected for ${socket.id}: Token missing`);
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.warn(`[Socket Auth] Connection rejected for ${socket.id}: Invalid token`);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  terminalNamespace.on('connection', (socket) => {
    console.log(`Terminal connected: ${socket.id} (User: ${socket.userId})`);
    
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
