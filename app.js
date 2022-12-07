require("dotenv").config();
require("./config/dbConfig");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const app = express();

// add proxy to server
app.set("trust proxy", 1);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
  })
);

app.use("/api", require("./routes/index"));
app.use("/api", require("./routes/artists"));
app.use("/api", require("./routes/creations"));
app.use("/api", require("./routes/orders"));

app.use("/api/auth", require("./routes/auth"));

require("./error-handling/index")(app);



module.exports = app;
