const express = require("express");
const bookingController = require("../controllers/booking.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

// Mounted at /booking
router.post("/", verifyToken, bookingController.createBooking);
router.get("/", verifyToken, bookingController.getBookingsByUser);

module.exports = router;
