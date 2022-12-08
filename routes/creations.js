const router = require("express").Router();
const protectRoute = require("../middlewares/protectRoute");
const uploader = require("../config/cloudinary");
const Artist = require("../models/Artist.model");
const Creation = require("../models/Creation.model");
const isArtist = require("../middlewares/isArtist");

// Get all creations
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/creations", async (req, res, next) => {
  try {
  const allCreations = await Creation.find();
  res.status(200).json(allCreations);
} catch(error) {
  next(error)
}
});

// Get one creation
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/creations/:id", async (req, res, next) => {
  try {
  const oneCreation = await Creation.findById(req.params.id);
  res.status(200).json(oneCreation);
} catch(error) {
  next(error)
}
});

//Get creations of one artist
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/artists/:id/creations", async (req, res, next) => {
  try {
  const someCreations = await Creation.find({
    artistId: req.params.id,
  });
  res.status(200).json(someCreations);
} catch(error) {
  next(error)
}
});

// Create a creation
// If there's no artist page yet : (HTTP) 401 Unauthorized
// If there is : HTTP 201 Created success status response code indicates that the request has succeeded and has led to the creation of a resource

router.post(
  "/creations/form",
  uploader.single("img"),
  protectRoute, isArtist,
  async (req, res, next) => {
    // Check the request body of the front
    const { title, description, categories, price, user } = req.body;
    let img;
    if (req.file) {
      img = req.file.path;
    }
    // Find the artist connected thanks to the user id
    const artistLinked = await Artist.findOne({
      user: req.currentUser.id,
    });
    // if there is no artist page for the current user it can't create a creation
    if (!artistLinked) {
      console.log("Create artist page first");
      return res.status(401).json({});
    }

    try {
  // if there is an artist linked to the current user and all field are field, the creation is created
    if (artistLinked) {

      for (const key in req.body) {
        if (!req.body[key] || req.body[key] === 'undefined') {
          return res.status(400).json({message:"All field required"})
        }
      }

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
  } catch(error) {
    next(error)
  }
  }
);

// Get creations created with the current user id
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/mycreations", protectRoute, isArtist, async (req, res, next) => {
  try {

  const myCreations = await Creation.find({
    user: req.currentUser.id,
  });
  res.status(200).json(myCreations);
} catch(error) {
  next(error)
}
});


// Update creation
// If there is : HTTP 201 Created success status response code indicates that the request has succeeded and has led to the creation of a resource

router.patch("/myCreation/:id/update", uploader.single("img"),
protectRoute, isArtist,
async (req, res, next) => {
  try {

  const { title, description, categories, price } = req.body;
  let img;
  if (req.file) {
    img = req.file.path;
  }

  // all fields of the updated part
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
  } catch(error) {
    next(error)
  }
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
