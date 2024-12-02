const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "../culinamind.db"), (err) => {
  if (err) console.error("Error connecting to database:", err.message);
  else console.log("Connected to SQLite database.");
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

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

  // Seed example recipes
  db.run(
    `INSERT OR IGNORE INTO recipes (title, ingredients, instructions, time, dietary, userId)
     VALUES ('Vegan Salad', 'Lettuce, Tomato, Cucumber', 'Mix everything together.', 10, 'vegan', 1)`
  );
});

module.exports = db;
