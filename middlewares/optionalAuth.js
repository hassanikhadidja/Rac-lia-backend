const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.optionalAuth = async (req, res, next) => {
  try {
    if (!req.headers.authorization) return next();

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.secretKey);
    if (!decoded?._id) return next();

    const user = await User.findById(decoded._id).select("-password");
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};
