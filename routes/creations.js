const router = require("express").Router();
const protectRoute = require("../middlewares/protectRoute");
const uploader = require("../config/cloudinary");
const Artist = require("../models/Artist.model");
const Creation = require("../models/Creation.model");
const Order = require("../models/Order.model");
const { set } = require("mongoose");
const isArtist = require("../middlewares/isArtist");

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
  protectRoute, isArtist,
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

router.get("/mycreations", protectRoute, isArtist, async (req, res, next) => {
  const myCreations = await Creation.find({
    user: req.currentUser.id,
  });
  res.status(200).json(myCreations);
});


// Update creation

router.patch("/myCreation/:id/update", uploader.single("img"),
protectRoute, isArtist,
async (req, res, next) => {
  const { title, description, categories, price, user } = req.body;
console.log(req.params.id)
  let img;
  if (req.file) {
    img = req.file.path;
  }

  // const filter = { user: req.currentUser.id,
  //  };
  const update = { 
    title,
      description,
      img,
      categories,
      price,
  };

  let myNewCreation = await Creation.findByIdAndUpdate(
    { _id: req.params.id }, 
    update, 
    {new: true}
    );
    
    res.status(201).json(myNewCreation);
  
});


//Delete creation of your artist
// HTTP 204 No Content success status response code indicates that a request has succeeded, but that the client doesn't need to navigate away from its current page

router.delete("/creationinprofile/:id/delete", protectRoute, isArtist, async (req, res, next) => {
  try {
  const myDeletedCreation = await Creation.findOneAndDelete(
    { _id: req.params.id },
  );
  res.status(204).json(myDeletedCreation);
} catch (error) {
  next(error);
}
});

module.exports = router;
