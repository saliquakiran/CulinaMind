const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("../routes/userRoutes");
const recipeRoutes = require("../routes/recipeRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);

module.exports = app;
