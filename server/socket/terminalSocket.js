import ptyManager from '../terminal/ptyManager.js';
import { supabase } from '../config/supabase.js';

export function initializeTerminalSocket(io) {
  const terminalNamespace = io.of('/terminal');

  // Secure connection with Supabase JWT Authentication middleware
  terminalNamespace.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.warn(`[Socket Auth] Connection rejected for ${socket.id}: Token missing`);
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        console.warn(`[Socket Auth] Connection rejected for ${socket.id}: Invalid or expired token`);
        return next(new Error('Authentication error: Invalid token'));
      }
      socket.userId = user.id;
      next();
    } catch (err) {
      console.warn(`[Socket Auth] Connection rejected for ${socket.id}: ${err.message}`);
      return next(new Error('Authentication error: Token verification failed'));
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
