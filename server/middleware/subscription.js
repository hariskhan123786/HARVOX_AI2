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

    if (used >= quota[feature]) {
      return res.status(429).json({
        message: `You've reached your ${plan} plan limit for ${feature}. Upgrade to Pro for more.`,
        code: 'QUOTA_EXCEEDED',
      });
    }

    next();
  };
};
