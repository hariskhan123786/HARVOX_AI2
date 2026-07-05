export const requirePro = (req, res, next) => {
  if (req.user.subscription === 'pro' || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    message: 'This feature requires a Pro subscription',
    code: 'PRO_REQUIRED',
  });
};

const QUOTAS = {
  free: {
    chats: 20,
    codeGen: 10,
    uploads: 5,
    projects: 2,
  },
  pro: {
    chats: 500,
    codeGen: 200,
    uploads: 100,
    projects: 50,
  },
};

export const checkSubscriptionQuota = (feature) => {
  return (req, res, next) => {
    const plan = req.user.subscription || 'free';
    const quota = QUOTAS[plan] || QUOTAS.free;
    const used = req.user.usage?.[feature] || 0;

    if (req.user.role === 'admin') return next();

    // ── Check if using a Free OpenRouter Model ──
    const { provider, model } = req.body;
    const isFreeOpenRouter = provider === 'openrouter' && (String(model).endsWith(':free') || model === 'openrouter/free');
    if (isFreeOpenRouter) {
      return next(); // Unlimited free access
    }

    if (used >= quota[feature]) {
      // ── Auto-route to OpenRouter Free when quota is exceeded ──
      if ((feature === 'chats' || feature === 'codeGen') && process.env.OPENROUTER_API_KEY) {
        console.log(`[Subscription Middleware] Daily quota exceeded for ${feature}. Auto-routing to OpenRouter Free.`);
        req.body.provider = 'openrouter';
        req.body.model = 'openrouter/free';
        return next();
      }

      return res.status(429).json({
        message: `You've reached your ${plan} plan limit for ${feature}. Upgrade to Pro for more.`,
        code: 'QUOTA_EXCEEDED',
      });
    }

    next();
  };
};
