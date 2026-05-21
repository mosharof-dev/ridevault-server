const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
dotenv.config();

// Express app initialization
const app = express();
const port = process.env.PORT;

//Middlewares
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// JWKS from Auth0
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);
// verify auth0 token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, JWKS);

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const run = async () => {
  try {
    // Send a ping to confirm a successful connection
    await client.connect();

    const database = client.db("ridevault-database");
    const carsCollection = database.collection("cars");
    const bookingsCollection = database.collection("bookings");

    // API endpoint to create a new booking
    app.post("/booking", verifyToken, async (req, res) => {
      try {
        const booking = req.body;

        // 1. Debug: Check what frontend is sending
        console.log("Received carId:", booking.carId);

        if (!booking.carId) {
          return res
            .status(400)
            .send({ message: "carId is missing from frontend" });
        }

        const bookingResult = await bookingsCollection.insertOne(booking);

        const carFilter = { _id: new ObjectId(booking.carId) };
        const updateDoc = {
          $inc: { bookingCount: 1 },
        };

        const updateResult = await carsCollection.updateOne(
          carFilter,
          updateDoc,
        );

        console.log("Update Result:", updateResult);

        res.status(201).send({ bookingResult, updateResult });
      } catch (error) {
        console.error("Booking Error:", error);
        res
          .status(500)
          .send({ message: "Booking process failed", error: error.message });
      }
    });
    // API endpoint to get bookings for a specific user (Private Route)
    app.get("/booking", verifyToken, async (req, res) => {
      try {
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
    });
    // API endpoint to add a new car
    app.post("/car", verifyToken, async (req, res) => {
      const car = req.body;
      const result = await carsCollection.insertOne(car);
      res.send(result);
    });

    // FeaturedCars API endpoint to get featured cars
    app.get("/featuredCars", async (req, res) => {
      const featuredCars = await carsCollection.find().toArray();
      let featuredCarsWithLimit = [];
      if (featuredCars.length > 6) {
        featuredCarsWithLimit = featuredCars.slice(0, 8);
      }
      res.send(featuredCarsWithLimit);
    });
    // API endpoint to get a car by ID
    app.get("/car/:id",  async (req, res) => {
      const id = req.params.id;
      const car = await carsCollection.findOne({ _id: new ObjectId(id) });
      res.send(car);
    });
    // API endpoint to get all cars (with Search & Filter)
    app.get("/car", async (req, res) => {
      const { search, category } = req.query;

      let query = {};

      if (search) {
        query.carModel = { $regex: search, $options: "i" };
      }

      if (category && category !== "All") {
        query.category = category;
      }

      const cars = await carsCollection.find(query).toArray();
      res.send(cars);
    });

    // API endpoint to get cars added by a specific user (Private Route)
    app.get("/my-cars", verifyToken, async (req, res) => {
      try {
        const email = req.user?.email || req.user?.user?.email;

        const query = { addedByEmail: email };

        const myCars = await carsCollection.find(query).toArray();
        res.send(myCars);
      } catch (error) {
        res
          .status(500)
          .send({ message: "Internal Server Error", error: error.message });
      }
    });

    // API endpoint to update a car by ID (Private Route)
    app.patch("/my-cars/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;

        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: updatedData };

        const result = await carsCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error("Update Error:", error);
        res.status(500).send({ message: "Failed to update car data" });
      }
    });

    // API endpoint to delete a car by ID (Private Route)
    app.delete("/my-cars/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;

        // 1. Check if ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid Car ID format" });
        }

        const filter = { _id: new ObjectId(id) };
        const result = await carsCollection.deleteOne(filter);

        // 2. Check if the car was actually found and deleted
        if (result.deletedCount === 0) {
          return res
            .status(404)
            .send({ message: "Car not found or already deleted" });
        }

        res.status(200).send(result);
      } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).send({ message: "Failed to delete car data" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

// API Routes
app.get("/", (req, res) => {
  res.send("Ride Vault Server is running.......");
});

// listener
app.listen(port, () => {
  console.log(`Ride Vault Server is running on port ${port}`);
});
