const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const JWT_SECRET = "supersecretkey";

// Register User
exports.registerUser = (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required." });

  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword],
    function (err) {
      if (err) return res.status(400).json({ message: "User already exists." });
      res.status(201).json({ message: "User registered successfully." });
    }
  );
};

// Login User
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) return res.status(401).json({ message: "Invalid credentials." });

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, username: user.username });
  });
};
