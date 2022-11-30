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
  const allCreations = await Creation.find();
  res.status(200).json(allCreations);
});

//////////////////////////////ORDER/////////////////////////////

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

// Get an order if order exists

router.get("/order", async (req, res, next) => {
  res.status(200).json(await Order.find());
});

// Add creation to order

router.post("/order/:id/productId/add", async (req, res, next) => {
  try {
    console.log(req.body);
    let newProductId = req.body;
    await Order.findByIdAndUpdate(req.params.id, {
      $push: { creations: req.body },
    });
    res.json(newProductId);
  } catch (error) {
    next(error);
  }
});

//TEST/////////////////////

router.post(
  "/creations/:id/addtocart",
  protectRoute,
  async (req, res, next) => {
    try {
      console.log(req.params.id);
      // const foundCreation = await Creation.findById(req.params.id)

      const order = await Order.findOne(
        {
          userId: req.currentUser.id,
          date: { $exists: false },
          // creations: {
          //   $elemMatch: { productId: req.params.id },
          // },
        },
        {}
      );
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
    // if (orderWithoutDateOfCurrentUser) {
    //   let newProductId = req.body;
    //     await Order.findByIdAndUpdate(req.params.id, {
    //       $push: { creations: req.body },
    //     });
    //     res.json(newProductId);
    // }
    // else ( !orderWithoutDateOfCurrentUser) {
    //   try {
    //     //Create order//
    //     const { userId, creations, amount, date } = req.body;
    //     const newOrder = await Order.create({
    //       userId,
    //       creations,
    //       amount,
    //       date,
    //     });

    //     res.status(201).json(newOrder);

    //     //Push creation in order created//
    //     let newProductId = req.body;
    //     await Order.findByIdAndUpdate(req.params.id, {
    //       $push: { creations: req.body },
    //     });
    //     res.json(newProductId);
    //   } catch (error) {
    //     next(error);
    //   }

    // }
  }
);

// Delete  order

router.delete("/order/:id", async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: "Deleted!" + req.params.id });
  } catch (error) {
    next(error);
  }
});

// Update quantity

router.patch("/order/:orderId/:quantityId", async (req, res, next) => {
  const { orderId, quantityId } = req.params;
  console.log(req.body);
  try {
    const updatedOrder = await Order.findById(orderId);
    for (const quantity of updatedOrder.creations) {
      if (quantity.id === quantityId) {
        quantity.quantity = req.body.quantity;
      }
    }
    await updatedOrder.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

//////////////////////////////PROFILE/////////////////////////////

// ROUTES PROFILE :
// display orders

//////////////////////////////ARTISTES/////////////////////////////

// ROUTES ARTISTES
// a faire plus tard

module.exports = router;
