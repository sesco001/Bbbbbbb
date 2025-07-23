const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
}));

app.get("/", (req, res) => {
  res.send("Makamesco Chat API running");
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "User registered", token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ message: "Login successful", token });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
