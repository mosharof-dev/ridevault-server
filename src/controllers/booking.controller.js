const { ObjectId } = require("mongodb");
const dbConfig = require("../config/db");

const createBooking = async (req, res) => {
  try {
    const db = dbConfig.getDb();
    const bookingsCollection = db.collection("bookings");
    const carsCollection = db.collection("cars");

    const booking = req.body;
    console.log("Received carId:", booking.carId);

    if (!booking.carId) {
      return res.status(400).send({ message: "carId is missing from frontend" });
    }

    const bookingResult = await bookingsCollection.insertOne(booking);

    const carFilter = { _id: new ObjectId(booking.carId) };
    const updateDoc = {
      $inc: { bookingCount: 1 },
    };

    const updateResult = await carsCollection.updateOne(carFilter, updateDoc);
    console.log("Update Result:", updateResult);

    res.status(201).send({ bookingResult, updateResult });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).send({ message: "Booking process failed", error: error.message });
  }
};

const getBookingsByUser = async (req, res) => {
  try {
    const db = dbConfig.getDb();
    const bookingsCollection = db.collection("bookings");
    const email = req.query.email;

    // Security check
    if (req.user.email !== email) {
      return res.status(403).send({ message: "Forbidden access" });
    }

    const query = { userEmail: email };
    const result = await bookingsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed", error: error.message });
  }
};

module.exports = {
  createBooking,
  getBookingsByUser,
};
