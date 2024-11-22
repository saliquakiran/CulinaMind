const db = require("../config/db");

// Add a New Recipe
exports.addRecipe = (req, res) => {
  const { title, ingredients, instructions, time, dietary } = req.body;
  const userId = req.user.id;

  if (!title || !ingredients || !instructions || !time || !dietary)
    return res.status(400).json({ message: "All fields are required." });

  db.run(
    "INSERT INTO recipes (title, ingredients, instructions, time, dietary, userId) VALUES (?, ?, ?, ?, ?, ?)",
    [title, ingredients, instructions, time, dietary, userId],
    function (err) {
      if (err) return res.status(500).json({ message: "Error adding recipe." });
      res.status(201).json({ message: "Recipe added successfully.", id: this.lastID });
    }
  );
};

// Fetch Recipes with Filters
exports.getRecipes = (req, res) => {
  const { searchTerm, dietary, time } = req.query;

  let query = "SELECT * FROM recipes WHERE 1=1";
  const params = [];

  if (searchTerm) {
    query += " AND (title LIKE ? OR ingredients LIKE ?)";
    params.push(`%${searchTerm}%`, `%${searchTerm}%`);
  }

  if (dietary) {
    query += " AND dietary = ?";
    params.push(dietary);
  }

  if (time) {
    query += " AND time <= ?";
    params.push(parseInt(time));
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: "Error fetching recipes." });
    res.json(rows);
  });
};
