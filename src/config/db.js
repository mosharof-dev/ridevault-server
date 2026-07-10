const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let dbConnection;

module.exports = {
  connectToServer: async function () {
    try {
      // Connect to the client is optional in v4.7+ for single queries but good for pinging
      dbConnection = client.db("ridevault-database");
      console.log("Successfully connected to MongoDB!");
    } catch (err) {
      console.error("MongoDB connection failed:", err);
      process.exit(1);
    }
  },

  getDb: function () {
    return dbConnection;
  },
};
