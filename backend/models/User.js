const db = require("../config/db");

// Create User Table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
  )
`);

// User model methods
class User {
  static create(username, email, hashedPassword, callback) {
    db.run(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      callback
    );
  }

  static findByEmail(email, callback) {
    db.get("SELECT * FROM users WHERE email = ?", [email], callback);
  }
}

module.exports = User;
