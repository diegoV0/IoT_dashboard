const jwt = require("jsonwebtoken");

let checkAuth = (req, res, next) => {
  let token = req.get("token");

  jwt.verify(token, "securePassWordHere", (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: "error",
        error: err
      });
    }
    req.userData = decoded.userData;
    next();
  });
};

module.exports = { checkAuth };
