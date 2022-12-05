const router = require("express").Router();
const protectRoute = require("../middlewares/protectRoute");
const uploader = require("../config/cloudinary");
const Artist = require("../models/Artist.model");
const Creation = require("../models/Creation.model");
const Order = require("../models/Order.model");
const { set } = require("mongoose");

// Get all artists
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/artists", async (req, res, next) => {
  const allArtists = await Artist.find();
  res.status(200).json(allArtists);
});

// Get one artist
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/artists/:id", async (req, res, next) => {
  const oneArtist = await Artist.findById(req.params.id);
  res.status(200).json(oneArtist);
});

// Get my artist
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/myartist", protectRoute, async (req, res, next) => {
  const myArtist = await Artist.findOne({
    user: req.currentUser.id,
  });
  res.status(200).json(myArtist);
});

// Create an artist
// If there's already an artist page : (HTTP) 401 Unauthorized
// If there's no artist page yet  : HTTP 201 Created success status response code indicates that the request has succeeded and has led to the creation of a resource

router.post(
  "/artists/form",
  uploader.single("picture"),
  protectRoute,
  async (req, res, next) => {
    const { name, description, user } = req.body;
    let picture;
    if (req.file) {
      picture = req.file.path;
    }

    const artistExists = await Artist.findOne({
      user: req.currentUser.id,
    });

    if (artistExists) {
      console.log("One artist already exists");
      return res.status(401).json({});
    }

    const artist = await Artist.create({
      name,
      description,
      picture,
      user: req.currentUser.id,
    });

    res.status(201).json(artist);
  }
);

// Update an artist

router.patch(
  "/myArtist/update",
  uploader.single("picture"),
  protectRoute,
  async (req, res, next) => {
    const { name, description, user } = req.body;
    let picture;
    if (req.file) {
      picture = req.file.path;
    }

    const artistExists = await Artist.findOne({
      user: req.currentUser.id,
    });

    if (!artistExists) {
      console.log("No artist created yet");
      return res.status(401).json({});
    }

    const filter = { user: req.currentUser.id };
    const update = { name, description, picture };

    let myNewArtist = await Artist.findOneAndUpdate(filter, update, {
      new: true,
    });

    res.status(201).json(myNewArtist);
  }
);

// Delete an artist

router.delete("/myArtist/delete", protectRoute, async (req, res, next) => {
  try {
    let artistDeleted = await Artist.findOneAndDelete({
      user: req.currentUser.id,
    });
    res.status(204).json(artistDeleted);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
