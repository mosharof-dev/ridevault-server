const express = require("express");
const carController = require("../controllers/car.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

// Mounted at /my-cars
router.get("/", verifyToken, carController.getMyCars);
router.patch("/:id", verifyToken, carController.updateMyCar);
router.delete("/:id", verifyToken, carController.deleteMyCar);

module.exports = router;
