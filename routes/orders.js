const router = require("express").Router();
const protectRoute = require("../middlewares/protectRoute");
const Order = require("../models/Order.model");

// Get all orders of current user
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/orders", protectRoute, async (req, res, next) => {
  try {
  const allCreations = await Order.find({
    userId: req.currentUser.id,
    date: { $exists: true },
  });
  res.status(200).json(allCreations);
} catch(error) {
  next(error)
}
});

// Get an orderCart if order without date exists
// The HTTP 200 OK success status response code indicates that the request has succeeded

router.get("/orderCart", protectRoute, async (req, res, next) => {
  try {
  const orderCart = await Order.findOne({
    userId: req.currentUser.id,
    date: { $exists: false },
  });
  console.log(orderCart);
  res.status(200).json(orderCart);
} catch(error) {
  next(error)
}
});

// Create an order if !order
// HTTP 201 Created success status response code indicates that the request has succeeded and has led to the creation of a resource
// router.post("/order", async (req, res) => {
//     const { userId, creations, amount, date } = req.body;

//     const newOrder = await Order.create({
//       userId,
//       creations,
//       amount,
//       date,
//     });
//     res.status(201).json(newOrder);
// });

// Add one creation to OrderCart
// HTTP 201 Created success status response code indicates that the request has succeeded and has led to the creation of a resource

router.post(
  "/creations/:id/addtocart",
  protectRoute,
  async (req, res, next) => {
    try {
      // const isAnArtistCreation = await Creation.findOne({
      //   _id: req.params.id
      // });
      // if (isAnArtistCreation.user === req.currentUser.id) {
      //   res.status(403).json("it is your creation !");
      // }
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
// HTTP 202 Accepted

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

    res.status(202).json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

// Delete the entire cart order
// HTTP 204 No Content success status response code indicates that a request has succeeded, but that the client doesn't need to navigate away from its current page

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

// Add an amount of creation in cart
// HTTP 201 Created success status response code indicates that the request has succeeded and has led to the creation of a resource
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
// HTTP 201 Created success status response code indicates that the request has succeeded and has led to the creation of a resource

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

// Buy an Ordercart // add date
// The HyperText Transfer Protocol (HTTP) 202 Accepted response status code indicates that the request has been accepted for processing

router.put("/orderCart/buy", protectRoute, async (req, res, next) => {
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

module.exports = router;
