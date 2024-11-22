const express = require("express");
const { addRecipe, getUserRecipes } = require("../controllers/recipeController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, addRecipe);
router.get("/", authMiddleware, getUserRecipes);

module.exports = router;
