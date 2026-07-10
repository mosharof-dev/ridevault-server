const { ObjectId } = require("mongodb");
const dbConfig = require("../config/db");

const createCar = async (req, res) => {
  try {
    const db = dbConfig.getDb();
    const carsCollection = db.collection("cars");
    const car = req.body;
    const result = await carsCollection.insertOne(car);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to create car", error: error.message });
  }
};

const getFeaturedCars = async (req, res) => {
  try {
    const db = dbConfig.getDb();
    const carsCollection = db.collection("cars");
    const featuredCars = await carsCollection.find().toArray();
    let featuredCarsWithLimit = [];
    if (featuredCars.length > 6) {
      featuredCarsWithLimit = featuredCars.slice(0, 8);
    } else {
        featuredCarsWithLimit = featuredCars;
    }
    res.send(featuredCarsWithLimit);
  } catch (error) {
    res.status(500).send({ message: "Failed to get featured cars", error: error.message });
  }
};

const getCarById = async (req, res) => {
  try {
    const db = dbConfig.getDb();
    const carsCollection = db.collection("cars");
    const id = req.params.id;
    const car = await carsCollection.findOne({ _id: new ObjectId(id) });
    if (!car) {
        return res.status(404).send({ message: "Car not found" });
    }
    res.send(car);
  } catch (error) {
    res.status(500).send({ message: "Failed to get car", error: error.message });
  }
};

const getAllCars = async (req, res) => {
  try {
    const db = dbConfig.getDb();
    const carsCollection = db.collection("cars");
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
  } catch (error) {
    res.status(500).send({ message: "Failed to get all cars", error: error.message });
  }
};

const getMyCars = async (req, res) => {
  try {
    const db = dbConfig.getDb();
    const carsCollection = db.collection("cars");
    const email = req.user?.email || req.user?.user?.email;

    const query = { addedByEmail: email };
    const myCars = await carsCollection.find(query).toArray();
    res.send(myCars);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

const updateMyCar = async (req, res) => {
  try {
    const db = dbConfig.getDb();
    const carsCollection = db.collection("cars");
    const id = req.params.id;
    const updatedData = req.body;

    const filter = { _id: new ObjectId(id) };
    
    // Clean _id if present in body to avoid MongoDB errors
    if(updatedData._id) {
        delete updatedData._id;
    }

    const updateDoc = { $set: updatedData };

    const result = await carsCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).send({ message: "Failed to update car data" });
  }
};

const deleteMyCar = async (req, res) => {
  try {
    const db = dbConfig.getDb();
    const carsCollection = db.collection("cars");
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid Car ID format" });
    }

    const filter = { _id: new ObjectId(id) };
    const result = await carsCollection.deleteOne(filter);

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Car not found or already deleted" });
    }

    res.status(200).send(result);
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).send({ message: "Failed to delete car data" });
  }
};

module.exports = {
  createCar,
  getFeaturedCars,
  getCarById,
  getAllCars,
  getMyCars,
  updateMyCar,
  deleteMyCar,
};
