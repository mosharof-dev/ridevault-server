const express = require("express");
const carController = require("../controllers/car.controller");

const router = express.Router();

// Mounted at /featuredCars
router.get("/", carController.getFeaturedCars);

module.exports = router;
