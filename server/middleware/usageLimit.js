export const checkUsageLimit = async (req, res, next) => {
  // Unlimited access for all users during development/testing
  return next();
};
