const router = require("express").Router();
const protectRoute = require("../middlewares/protectRoute");
const uploader = require("../config/cloudinary");
const Artist = require("../models/Artist.model");
const Creation = require("../models/Creation.model");
const isArtist = require("../middlewares/isArtist");

// Get all artists
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/artists", async (req, res, next) => {
  try {
  const allArtists = await Artist.find();
  res.status(200).json(allArtists);
} catch (error) {
  next(error);
}
});

// Get one artist
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/artists/:id", async (req, res, next) => {
  try {
  const oneArtist = await Artist.findById(req.params.id);
  res.status(200).json(oneArtist);
} catch (error) {
  next(error);
}
});

// Get my artist
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/myartist", protectRoute, isArtist, async (req, res, next) => {
  try {
  const myArtist = await Artist.findOne({
    user: req.currentUser.id,
  });
  res.status(200).json(myArtist);
} catch (error) {
  next(error);
}
});

// Create an artist

router.post(
  "/artists/form",
  uploader.single("picture"),
  protectRoute, isArtist,
  async (req, res, next) => {
    const { name, description, user } = req.body;
    
    let picture;
    if (req.file) {
      picture = req.file.path;
    }
// check if the current user has an artist page already
    const artistExists = await Artist.findOne({
      user: req.currentUser.id,
    });
//  if the current user has an artist page already it can't create a new one : (HTTP) 401 Unauthorized
    if (artistExists) {
      console.log("One artist already exists");
      return res.status(401).json({message: 'One artist already exist'});
    }
  try {
// check if the user as put somathing in all the field
    for (const key in req.body) {
      if (!req.body[key] || req.body[key] === 'undefined') {
        return res.status(400).json({message:"All field required"})
      }
    }
// create a new artist
    const artist = await Artist.create({
      name,
      description,
      picture,
      user: req.currentUser.id,
    });
// If there's no artist page yet  : HTTP 201 Created success status response code indicates that the request has succeeded and has led to the creation of a resource
    res.status(201).json(artist);
  }
  catch(error) {
    next(error)
  }
  }
);

// Update an artist
// (HTTP) 401 Unauthorized
// HTTP 201 Created success status response code indicates that the request has succeeded and has led to the creation of a resource

router.patch(
  "/myArtist/update",
  uploader.single("picture"),
  protectRoute, isArtist,
  async (req, res, next) => {
    const { name, description, user } = req.body;
    let picture;
    if (req.file) {
      picture = req.file.path;
    }
// check if an artist page exists for the current user
    const artistExists = await Artist.findOne({
      user: req.currentUser.id,
    });
// if there is no artist page the user can't update 
    if (!artistExists) {
      console.log("No artist created yet");
      return res.status(401).json({});
    }
// Find the artist page with the user id and update it
    try {
    const filter = { user: req.currentUser.id };
    const update = { name, description, picture };

    let myNewArtist = await Artist.findOneAndUpdate(filter, update, {
      new: true,
    });

    res.status(201).json(myNewArtist);
    }
    catch(error) {
      next(error)
    }
  }
);

// Find the artists page with the current user id and Delete an artist

router.delete("/myArtist/delete", protectRoute, isArtist, async (req, res, next) => {
  try {
    let artistDeleted = await Artist.findOneAndDelete({
      user: req.currentUser.id,
    });

    // delete all the creations related to the artist page just deleted
    let artistsCreationsDeleted = await Creation.deleteMany({ 
      user: req.currentUser.id,
    });
    // HTTP 204 No Content
    res.status(204).json(artistDeleted);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
