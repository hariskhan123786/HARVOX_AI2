// Vercel maps this catch-all function to every /api/* request.  Keeping the
// Express app in one place means the same routes work locally and on Vercel.
import app from '../server/server.js';

export default app;
