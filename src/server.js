const app = require("./app");
const dbConfig = require("./config/db");

const port = process.env.PORT || 5000;

// Connect to MongoDB and then start the Express server
dbConfig.connectToServer()
  .then(() => {
    app.listen(port, () => {
      console.log(`Ride Vault Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server due to database connection error.", err);
    process.exit(1);
  });
