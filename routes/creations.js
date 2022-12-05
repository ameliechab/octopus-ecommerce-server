const router = require("express").Router();
const protectRoute = require("../middlewares/protectRoute");
const uploader = require("../config/cloudinary");
const Artist = require("../models/Artist.model");
const Creation = require("../models/Creation.model");
const Order = require("../models/Order.model");
const { set } = require("mongoose");

// Get all creations
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/creations", async (req, res, next) => {
  const allCreations = await Creation.find();
  res.status(200).json(allCreations);
});

// Get one creation
router.get("/creations/:id", async (req, res, next) => {
  const oneCreation = await Creation.findById(req.params.id);
  res.status(200).json(oneCreation);
});

//Get creations of one artist
router.get("/artists/:id/creations", protectRoute, async (req, res, next) => {
  const someCreations = await Creation.find({
    artistId: req.params.id,
  });
  console.log("ARTISTID", req.params.id);
  console.log("SOME CREATIONS", someCreations);
  res.status(200).json(someCreations);
});

// Create a creation
// If there's no artist page yet : (HTTP) 401 Unauthorized
// If there is : HTTP 201 Created success status response code indicates that the request has succeeded and has led to the creation of a resource

router.post(
  "/creations/form",
  uploader.single("img"),
  protectRoute,
  async (req, res, next) => {
    const { title, description, categories, price, user } = req.body;

    let img;
    if (req.file) {
      img = req.file.path;
    }

    const artistLinked = await Artist.findOne({
      user: req.currentUser.id,
    });

    console.log(artistLinked);

    if (!artistLinked) {
      console.log("Create artist page first");
      return res.status(401).json({});
    }

    if (artistLinked) {
      const creation = await Creation.create({
        title,
        description,
        img,
        categories,
        price,
        user: req.currentUser.id,
        artistId: artistLinked._id,
      });
      res.status(201).json(creation);
    }
  }
);

// Get creations created with the current user id

router.get("/mycreations", protectRoute, async (req, res, next) => {
  const myCreations = await Creation.find({
    user: req.currentUser.id,
  });
  res.status(200).json(myCreations);
});

module.exports = router;
