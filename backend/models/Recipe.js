const db = require("../config/db");

// Create Recipe Table
db.run(`
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    ingredients TEXT,
    instructions TEXT,
    time INTEGER,
    dietary TEXT,
    userId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`);

// Recipe model methods
class Recipe {
  static create({ title, ingredients, instructions, time, dietary, userId }, callback) {
    db.run(
      "INSERT INTO recipes (title, ingredients, instructions, time, dietary, userId) VALUES (?, ?, ?, ?, ?, ?)",
      [title, ingredients, instructions, time, dietary, userId],
      callback
    );
  }

  static findAllWithFilters(filters, callback) {
    let query = "SELECT * FROM recipes WHERE 1=1";
    const params = [];

    if (filters.searchTerm) {
      query += " AND (title LIKE ? OR ingredients LIKE ?)";
      params.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
    }
    if (filters.dietary) {
      query += " AND dietary = ?";
      params.push(filters.dietary);
    }
    if (filters.time) {
      query += " AND time <= ?";
      params.push(parseInt(filters.time));
    }

    db.all(query, params, callback);
  }
}

module.exports = Recipe;
