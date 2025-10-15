function userContext(req, res, next) {
  const userId = req.header('x-user-id') || 'anonymous';
  const userEmail = req.header('x-user-email') || null;

  req.user = {
    id: userId,
    email: userEmail
  };

  next();
}

module.exports = userContext;
