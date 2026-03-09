import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import Database from "better-sqlite3";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database setup
  const db = new Database("gruha_alankara.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      name TEXT
    );
    CREATE TABLE IF NOT EXISTS furniture (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      category TEXT,
      price REAL,
      image_url TEXT,
      description TEXT
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      furniture_id INTEGER,
      booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(furniture_id) REFERENCES furniture(id)
    );
    CREATE TABLE IF NOT EXISTS design_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      image_path TEXT,
      recommendations TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed furniture if empty
  const rowCount = db.prepare("SELECT COUNT(*) as count FROM furniture").get();
  if (rowCount.count === 0) {
    const insert = db.prepare("INSERT INTO furniture (name, category, price, image_url, description) VALUES (?, ?, ?, ?, ?)");
    insert.run("Modern Velvet Sofa", "Living Room", 899, "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80", "A luxurious velvet sofa for modern homes.");
    insert.run("Minimalist Oak Table", "Dining", 450, "https://images.unsplash.com/photo-1577146333355-bd318b5db303?auto=format&fit=crop&w=800&q=80", "Solid oak dining table with a clean finish.");
    insert.run("Industrial Floor Lamp", "Lighting", 120, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80", "Vintage industrial style floor lamp.");
    insert.run("Scandinavian Armchair", "Living Room", 350, "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80", "Comfortable armchair with Nordic design.");
  }

  app.use(express.json());

  // Image Upload Setup
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      }
      cb(new Error("Only images are allowed"));
    }
  });

  // API Routes
  app.post("/api/upload", upload.single("roomImage"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ 
      imagePath: `/uploads/${req.file.filename}`,
      status: "success"
    });
  });

  app.get("/api/furniture", (req, res) => {
    const furniture = db.prepare("SELECT * FROM furniture").all();
    res.json(furniture);
  });

  app.post("/api/bookings", (req, res) => {
    const { userId, furnitureId } = req.body;
    const insert = db.prepare("INSERT INTO bookings (user_id, furniture_id) VALUES (?, ?)");
    const result = insert.run(userId || 1, furnitureId);
    res.json({ id: result.lastInsertRowid, status: "confirmed" });
  });

  app.get("/api/dashboard/:userId", (req, res) => {
    const userId = req.params.userId;
    const bookings = db.prepare(`
      SELECT b.*, f.name as furniture_name, f.price 
      FROM bookings b 
      JOIN furniture f ON b.furniture_id = f.id 
      WHERE b.user_id = ?
    `).all(userId);
    const history = db.prepare("SELECT * FROM design_history WHERE user_id = ?").all(userId);
    res.json({ bookings, history });
  });

  // Serve uploads statically
  app.use("/uploads", express.static(uploadDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
