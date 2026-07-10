const express = require("express");
const carController = require("../controllers/car.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

// Mounted at /car
router.post("/", verifyToken, carController.createCar);
router.get("/", carController.getAllCars);
router.get("/:id", carController.getCarById);

module.exports = router;
