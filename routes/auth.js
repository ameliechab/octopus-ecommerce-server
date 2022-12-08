const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const isAuthenticated = require("../middlewares/jwt.middleware");
const User = require("../models/User.model");
const saltRounds = 10;

/**
 *
 * * All the routes are prefixed with `/api/auth`
 *
 */

// SIGN UP ROUTE

router.post("/signup", async (req, res, next) => {

  // Check the request body of the front
  const { name, email, password, isArtist } = req.body;

  // check if some fields are empty
  if (email === "" || name === "" || password === "" ) {
    return res
      .status(400)
      .json({ message: "I need some informations to work with here!" });
  }

  try {
    // check double user email
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      res
        .status(400)
        .json({ message: "There's another one of you, somewhere." });
      return;
    }
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPass = bcrypt.hashSync(password, salt);

    // if everything is okay, create user
    const createdUser = await User.create({
      name,
      email,
      password: hashedPass,
      isArtist,
    });

    const user = createdUser.toObject();
    delete user.password;
    // ! Sending the user as json to the client
    res.status(201).json({ user });
  } catch (error) {
    console.log(error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Sweet, sweet 500." });
  }
});

// SIGN IN ROUTE

router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;

  // check if the user did not forget field
  try {
  if (email === "" || password === "") {
    res
      .status(400)
      .json({ message: "I need some informations to work with here!" });
  }
// Find the user by mail
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      res.status.apply(401).json({ message: "Wrong email." });
      return;
    }
    const goodPass = bcrypt.compareSync(password, foundUser.password);
    if (goodPass) {
      const user = foundUser.toObject();
      delete user.password;

      /**
       * Sign method allow you to create the token.
       *
       * ---
       * - First argument: user, should be an object. 
       * - Second argument: String
       * - Third argument: Options
       */

      const authToken = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "2d",
      });

      //! Sending the authToken to the client !

      res.status(200).json({ authToken });
    } else {
      res.status(401).json("Can you check your typos ?");
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Oh noes ! Something went terribly wrong !" });
  }
});

router.get("/me", isAuthenticated, async (req, res, next) => {
  const user = await User.findById(req.payload.id).select("-password");
  res.status(200).json(user);
});

module.exports = router;
