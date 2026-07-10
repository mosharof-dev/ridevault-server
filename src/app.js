const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/booking.routes");
const carRoutes = require("./routes/car.routes");
const featuredCarsRoutes = require("./routes/featuredCars.routes");
const myCarsRoutes = require("./routes/myCars.routes");

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/booking", bookingRoutes);
app.use("/car", carRoutes);
app.use("/featuredCars", featuredCarsRoutes);
app.use("/my-cars", myCarsRoutes);

// Base Route
app.get("/", (req, res) => {
  res.send("Ride Vault Server is running....... (Professional Structure)");
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;
