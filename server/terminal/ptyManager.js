import os from 'os';

// Lazy-load node-pty so a compilation failure doesn't crash the server on import.
let pty = null;
try {
  pty = (await import('node-pty')).default;
} catch (err) {
  console.warn('[PTY] node-pty failed to load — terminal feature disabled:', err.message);
}

class PtyManager {
  constructor() {
    this.sessions = new Map();
  }

  createSession(id) {
    if (!pty) {
      console.warn('[PTY] node-pty not available; returning mock terminal session.');
      const mockProcess = {
        onData: (cb) => {
          setTimeout(
            () => cb('\r\n\x1b[31m[Error]\x1b[0m Terminal is not available on this server.\r\n'),
            500
          );
        },
        write: () => {},
        resize: () => {},
        kill: () => {},
      };
      this.sessions.set(id, mockProcess);
      return mockProcess;
    }

    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

    try {
      const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME || process.cwd(),
        env: process.env,
        useConpty: false,
      });

      this.sessions.set(id, ptyProcess);
      return ptyProcess;
    } catch (err) {
      console.error('[PTY] Failed to spawn PTY:', err);
      const mockProcess = {
        onData: (cb) => {
          setTimeout(
            () => cb('\r\n\x1b[31m[Error]\x1b[0m Terminal is unavailable on this OS setup.\r\n'),
            500
          );
        },
        write: () => {},
        resize: () => {},
        kill: () => {},
      };
      this.sessions.set(id, mockProcess);
      return mockProcess;
    }
  }

  getSession(id) {
    return this.sessions.get(id);
  }

  removeSession(id) {
    const ptyProcess = this.sessions.get(id);
    if (ptyProcess) {
      try {
        ptyProcess.kill();
      } catch (err) {
        console.error('[PTY] Error killing PTY session:', err.message);
      }
      this.sessions.delete(id);
    }
  }

  write(id, data) {
    const ptyProcess = this.sessions.get(id);
    if (ptyProcess) {
      ptyProcess.write(data);
    }
  }

  resize(id, cols, rows) {
    const ptyProcess = this.sessions.get(id);
    if (ptyProcess && cols > 0 && rows > 0) {
      try {
        ptyProcess.resize(cols, rows);
      } catch (err) {
        console.error('[PTY] Error resizing pty:', err);
      }
    }
  }
}

export default new PtyManager();
