const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

const protectRoute = (req, res, next) => {
  const header = req.headers["authorization"];
  
  if (typeof header !== "undefined") {
    const bearer = header.split(" ");
    const token = bearer[1];

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, authorizedData) => {
      if (err) {
        //If error send Forbidden (403)
        console.log("ERROR: Could not connect to the protected route");
        res.sendStatus(401);
      } else {
        //If token is successfully verified, we can enter in the next route
    
        const currentUser = await User.findById(authorizedData.id, {
          password: 0,
        });
        if (!currentUser) {
          //If error send Forbidden (403)
          console.log("ERROR: Could not connect to the protected route");
          res.sendStatus(401);
          return;
        }
        req.currentUser = currentUser;
        next();
      }
    });
  } else {
    res.sendStatus(401);
  }
};

module.exports = protectRoute;
