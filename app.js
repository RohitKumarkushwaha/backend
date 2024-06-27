const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const materialsRouter = require("./routes/materials");

dotenv.config();

const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/materials", materialsRouter);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
