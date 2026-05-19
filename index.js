const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
dotenv.config();

// Express app initialization
const app = express()
const port = process.env.PORT ;



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


const run = async () => {
  try {
    // Send a ping to confirm a successful connection
    await client.connect();

    const database = client.db("ride-vault-database");
    // const adminCollection = admin.collection("admin");
    // const bookingCollection = admin.collection("booking");

 
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
app.get('/', (req, res) => {
  res.send('Ride Vault Server is running.......')
})

// listener
app.listen(port, () => {
  console.log(`Ride Vault Server is running on port ${port}`)
})