const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secretKey", resave: false, saveUninitialized: true }));
app.use(express.static("public"));

// Config: simulate primary DB down
let PRIMARY_DOWN = false;

const primaryDB = path.join(__dirname, "db_primary.json");
const secondaryDB = path.join(__dirname, "db_secondary.json");
const auditLog = path.join(__dirname, "audit.log");

// Dummy users
const users = {
  admin: { password: "admin123", role: "admin" },
  alice: { password: "user123", role: "user" },
};

// DB helpers
function readDB() {
  try {
    if (!PRIMARY_DOWN) return JSON.parse(fs.readFileSync(primaryDB));
    else return JSON.parse(fs.readFileSync(secondaryDB));
  } catch (e) {
    return [];
  }
}
function writeDB(data) {
  const target = PRIMARY_DOWN ? secondaryDB : primaryDB;
  fs.writeFileSync(target, JSON.stringify(data, null, 2));
}
function logAction(user, action) {
  const entry = `${new Date().toISOString()} | ${user} | ${action}\n`;
  fs.appendFileSync(auditLog, entry);
}

// Middleware
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login.html");
  next();
}

// Routes
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username].password === password) {
    req.session.user = { name: username, role: users[username].role };
    logAction(username, "login");
    return res.redirect("/notes.html");
  }
  res.redirect("/login.html?error=1");
});

app.get("/api/notes", requireLogin, (req, res) => {
  let notes = readDB();
  if (req.session.user.role !== "admin") {
    notes = notes.filter(n => n.owner === req.session.user.name);
  }
  res.json({ user: req.session.user, notes });
});

app.post("/api/notes", requireLogin, (req, res) => {
  const notes = readDB();
  const newNote = {
    id: Date.now(),
    owner: req.session.user.name,
    text: req.body.text,
  };
  notes.push(newNote);
  writeDB(notes);
  logAction(req.session.user.name, `created note ${newNote.id}`);
  res.redirect("/notes.html");
});

app.get("/api/audit", requireLogin, (req, res) => {
  if (req.session.user.role !== "admin") return res.status(403).send("Access denied");
  const logs = fs.readFileSync(auditLog, "utf-8").split("\n").filter(Boolean);
  res.json(logs);
});

app.get("/toggleDB", (req, res) => {
  PRIMARY_DOWN = !PRIMARY_DOWN;
  res.send(`Primary DB is now ${PRIMARY_DOWN ? "DOWN" : "UP"}`);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
