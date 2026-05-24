export const checkUsageLimit = async (req, res, next) => {
  try {
    const user = req.user;
    user.resetDailyUsageIfNeeded();

    const limit = user.subscription === 'pro'
      ? parseInt(process.env.PRO_DAILY_LIMIT || '500', 10)
      : parseInt(process.env.FREE_DAILY_LIMIT || '20', 10);

    if (user.dailyUsage >= limit) {
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
