const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const customerRoutes = require("./routes/customerRoutes");
const loanRoutes = require("./routes/loanRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/customers", customerRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
mongoose
  .connect(
    "mongodb://Shenbagavalli:Shenba12345@ac-n0gegbv-shard-00-00.jepsmwm.mongodb.net:27017,ac-n0gegbv-shard-00-01.jepsmwm.mongodb.net:27017,ac-n0gegbv-shard-00-02.jepsmwm.mongodb.net:27017/?ssl=true&replicaSet=atlas-4876sv-shard-0&authSource=admin&appName=finance-management"
  )
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.log(
      "MongoDB connection error:",
      error.message
    );
  });