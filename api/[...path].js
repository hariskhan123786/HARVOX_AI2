// Vercel maps this catch-all function to every /api/* request. Load the app
// lazily so a startup error is returned as JSON instead of an opaque Vercel
// function-crash page.
let appPromise;

export default async function handler(req, res) {
  try {
    appPromise ??= import('../server/server.js').then(({ default: app }) => app);
    const app = await appPromise;
    return app(req, res);
  } catch (error) {
    console.error('[Vercel API startup]', error);
    return res.status(500).json({
      message: 'API startup failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
