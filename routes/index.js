const router = require("express").Router();
const protectRoute = require("../middlewares/protectRoute");
const uploader = require("../config/cloudinary");
const Artist = require("../models/Artist.model");
const Creation = require("../models/Creation.model");
const Order = require("../models/Order.model");
const { set } = require("mongoose");

router.get("/", (req, res, next) => {
  res.send("Server is running... 🏃‍♂️");
});

router.get("/private", protectRoute, (req, res, next) => {
  res.send("Protection passed !");
});

//////////////////////////////ARTISTS/////////////////////////////

router.get("/artists", async (req, res, next) => {
  const allArtists = await Artist.find();
  res.status(200).json(allArtists);
});

//////////////////////////////CREATIONS/////////////////////////////

router.get("/creations", async (req, res, next) => {
  const allOrders = await Creation.find();
  res.status(200).json(allOrders);
});

//////////////////////////////ORDER/////////////////////////////

router.get("/orders", protectRoute, async (req, res, next) => {
  const allCreations = await Order.find({
    userId: req.currentUser.id,
    date: { $exists: true },
  });
  res.status(200).json(allCreations);
});

// Create an order if !order

router.post("/order", async (req, res) => {
  const { userId, creations, amount, date } = req.body;

  const newOrder = await Order.create({
    userId,
    creations,
    amount,
    date,
  });
  res.status(201).json(newOrder);
});

// Get an orderCart if order without date exists

router.get("/orderCart", protectRoute, async (req, res, next) => {
  const orderCart = await Order.findOne({
    userId: req.currentUser.id,
    date: { $exists: false },
  });
  console.log(orderCart);
  res.status(200).json(orderCart);
});

// Add creation to order

// router.post("/order/:id/productId/add", async (req, res, next) => {
//   try {
//     console.log(req.body);
//     let newProductId = req.body;
//     await Order.findByIdAndUpdate(req.params.id, {
//       $push: { creations: req.body },
//     });
//     res.json(newProductId);
//   } catch (error) {
//     next(error);
//   }
// });

//TEST/////////////////////

router.post(
  "/creations/:id/addtocart",
  protectRoute,
  async (req, res, next) => {
    try {
      console.log(req.params.id);
      const order = await Order.findOne({
        userId: req.currentUser.id,
        date: { $exists: false },
      });
      if (order) {
        let updated = false;
        order.creations.forEach((creation) => {
          if (creation.productId.toString() === req.params.id) {
            creation.quantity++;
            updated = true;
          }
        });
        if (!updated) {
          order.creations.push({
            productId: req.params.id,
            quantity: 1,
          });
        }
        await order.save();
      } else {
        const newOrder = await Order.create({
          userId: req.currentUser.id,
          creations: [
            {
              productId: req.params.id,
              quantity: 1,
            },
          ],
        });
        return res.status(201).json(newOrder);
      }

      res.status(201).json(order);
    } catch (error) {
      console.log(error);
    }
  }
);

// Delete one creation in order

router.patch("/orderCart/:id", protectRoute, async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      {
        userId: req.currentUser.id,
        date: { $exists: false },
      },
      {
        $pull: { creations: { productId: id } },
      },
      {
        new: true,
      }
    );

    // const creations = [...updatedOrder.creations];
    // for (let i = 0; i < creations.length; i++) {
    //   if (creations[i].productId.toString() === id) {
    //     // let indexOfCreation = updatedOrder.creations.indexOf(creationAdded);
    //     creations.splice(i, 1);
    //   }
    // }

    // // updatedOrder.creations = creations;
    // const x = await Order.findByIdAndUpdate(updatedOrder.id, { creations });

    res.status(202).json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

// DELETE THE CART ORDER

router.delete("/orderCart/delete", protectRoute, async (req, res, next) => {
  try {
    let orderDeleted = await Order.findOneAndDelete({
      userId: req.currentUser.id,
      date: { $exists: false },
    });
    res.status(204).json(orderDeleted);
  } catch (error) {
    next(error);
  }
});

// Update quantity

// router.patch("/order/:orderId/:quantityId", async (req, res, next) => {
//   const { orderId, quantityId } = req.params;
//   console.log(req.body);
//   try {
//     const updatedOrder = await Order.findById(orderId);
//     for (const quantity of updatedOrder.creations) {
//       if (quantity.id === quantityId) {
//         quantity.quantity = req.body.quantity;
//       }
//     }
//     await updatedOrder.save();
//     res.json(updatedOrder);
//   } catch (error) {
//     next(error);
//   }
// });

// Add an amount of creation in cart

router.patch(
  "/orderCart/increment/:creationId",
  protectRoute,
  async (req, res, next) => {
    try {
      console.log(req.params.creationId);
      const order = await Order.findOne({
        userId: req.currentUser.id,
        date: { $exists: false },
      });
      if (order) {
        let updated = false;
        order.creations.forEach((creation) => {
          if (creation.productId.toString() === req.params.creationId) {
            creation.quantity++;
            updated = true;
          }
        });
        await order.save();
      }
      res.status(201).json(order);
    } catch (error) {
      console.log(error);
    }
  }
);

// Remove an amount of creation in cart

router.patch(
  "/orderCart/decrement/:creationId",
  protectRoute,
  async (req, res, next) => {
    try {
      console.log(req.params.creationId);
      const order = await Order.findOne({
        userId: req.currentUser.id,
        date: { $exists: false },
      });
      if (order) {
        let updated = false;
        order.creations.forEach((creation) => {
          if (creation.productId.toString() === req.params.creationId) {
            if (creation.quantity > 0) {
              creation.quantity--;
              updated = true;
            }
            if (creation.quantity === 0) {
              order.creations.splice(order.creations.indexOf(creation), 1);
            }
          }
        });
        await order.save();
      }
      res.status(201).json(order);
    } catch (error) {
      console.log(error);
    }
  }
);

// Buy a cart

router.put("/orderCart/buy", protectRoute, async (req, res, next) => {
  console.log("hello");
  try {
    const findOrder = await Order.findOne({
      userId: req.currentUser.id,
      date: { $exists: false },
    });
    findOrder.date = new Date();
    await findOrder.save();
    res.status(202).json(findOrder);
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////PROFILE/////////////////////////////

// ROUTES PROFILE :
// display orders

//////////////////////////////ARTISTES/////////////////////////////

// ROUTE ARTISTE FORM

router.post(
  "/artists/form",
  uploader.single("picture"), protectRoute, 
  async (req, res, next) => {
    const { name, description, user } = req.body;
    let picture;
    if (req.file) {
      picture = req.file.path;
    }


    const artistExists = await Artist.findOne({
      user: req.currentUser.id,
    })

    if (artistExists) {
      console.log("One artist already exists")
      return res.status(401).json({})
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

// ROUTE CREATION FORM

router.post(
  "/creations/form",
  uploader.single("img"), protectRoute,
  async (req, res, next) => {
    const { title, description, categories, price, user } = req.body;

    let img;
    if (req.file) {
      img = req.file.path;
    }

    const artistLinked = await Artist.findOne({
      user: req.currentUser.id,
    })

    console.log(artistLinked)

    if (!artistLinked) {
      console.log("Create artist page first")
      return res.status(401).json({})
    }

    if (artistLinked) {
    const creation = await Creation.create({
      title,
      description,
      img,
      categories,
      price,
      user: req.currentUser.id,
      artistId: artistLinked._id
    })
    res.status(201).json(creation);
  }


  }
);

module.exports = router;
