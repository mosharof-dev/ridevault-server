const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    // const bookingCollection = admin.collection("booking");

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
