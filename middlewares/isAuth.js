const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.Auth = async (req, res, next) => {
  try {

    if (!req.headers.authorization) {
  
      return res.status(401).json({ msg: "Unauthorized" });
    }
      let token = req.headers.authorization?.split(" ")[1]; 
    if (!token) {
   
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const decoded = jwt.verify(token,process.env.secretKey);
    if (!decoded) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
 const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
   req.user = user; 
    next();
  } catch (error) {
    const message = error.name === "JsonWebTokenError" || error.name === "TokenExpiredError"
      ? "Session expired. Please sign in again."
      : error.message;
    return res.status(401).json({ msg: message });
  }
};