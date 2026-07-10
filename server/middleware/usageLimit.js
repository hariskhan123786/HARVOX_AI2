export const checkUsageLimit = async (req, res, next) => {
  try {
    const user = req.user;
    user.resetDailyUsageIfNeeded();

    const limit = user.subscription === 'pro'
      ? parseInt(process.env.PRO_DAILY_LIMIT || '5000', 10)
      : parseInt(process.env.FREE_DAILY_LIMIT || '1000', 10);


    // ── Check if using a Free OpenRouter Model ──
    const { provider, model } = req.body;
    const isFreeOpenRouter = provider === 'openrouter' && (String(model).endsWith(':free') || model === 'openrouter/free');

    if (isFreeOpenRouter) {
      return next(); // Unlimited free access - do not block and do not increment dailyUsage
    }

    if (user.dailyUsage >= limit) {
      // ── Auto-route to OpenRouter Free when daily limit is exceeded ──
      if (process.env.OPENROUTER_API_KEY && req.body && req.method === 'POST') {
        console.log(`[UsageLimit Middleware] Daily limit reached (${limit}). Auto-routing to OpenRouter Free.`);
        req.body.provider = 'openrouter';
        req.body.model = 'openrouter/free';
        return next();
      }

      return res.status(429).json({
        message: `Daily limit reached (${limit}). Upgrade to Pro for more.`,
        code: 'DAILY_LIMIT',
      });
    }

    user.dailyUsage += 1;
    await user.save();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Usage check failed' });
  }
};
