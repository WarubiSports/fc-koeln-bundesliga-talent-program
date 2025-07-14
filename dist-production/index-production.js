// server/index-production.ts
import express from "express";
import { createServer } from "http";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      console.log(logLine);
    }
  });
  next();
});
var loggedInUsers = /* @__PURE__ */ new Map();
var TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1e3;
var users = [
  { id: "1", email: "max.bisinger@warubi-sports.com", role: "admin", status: "approved", firstName: "Max", lastName: "Bisinger" }
];
var players = [];
var chores = [];
var events = [];
var notifications = [];
var messages = [];
var groceryOrders = [];
function createUserToken(userData) {
  const token = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tokenData = {
    ...userData,
    createdAt: Date.now(),
    expiresAt: Date.now() + TOKEN_EXPIRATION
  };
  loggedInUsers.set(token, tokenData);
  return token;
}
function getUserFromToken(token) {
  const tokenData = loggedInUsers.get(token);
  if (!tokenData) return null;
  if (Date.now() > tokenData.expiresAt) {
    if (Date.now() - tokenData.expiresAt < 24 * 60 * 60 * 1e3) {
      tokenData.expiresAt = Date.now() + TOKEN_EXPIRATION;
      loggedInUsers.set(token, tokenData);
      return tokenData;
    }
    loggedInUsers.delete(token);
    return null;
  }
  return tokenData;
}
var simpleAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const userData = getUserFromToken(token);
    if (userData) {
      req.user = userData;
      return next();
    }
  }
  res.status(401).json({ message: "Unauthorized" });
};
var simpleAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const userData = getUserFromToken(token);
    if (userData && (userData.role === "admin" || userData.role === "coach")) {
      req.user = userData;
      return next();
    }
  }
  res.status(401).json({ message: "Admin or Coach access required" });
};
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/auth/simple-login", (req, res) => {
  const { username, email, password } = req.body;
  const loginIdentifier = username || email;
  console.log("Production login attempt:", loginIdentifier);
  if (loginIdentifier === "max.bisinger@warubi-sports.com" && password === "ITP2024") {
    const user = users.find((u) => u.email === loginIdentifier);
    if (user) {
      const token = createUserToken(user);
      res.json({ token, user, message: "Login successful" });
      return;
    }
  }
  res.status(401).json({ message: "Invalid credentials" });
});
app.post("/api/auth/dev-login", (req, res) => {
  const userData = {
    id: "dev-admin",
    firstName: "Admin",
    lastName: "User",
    email: "admin@fckoeln.dev",
    role: "admin",
    status: "approved"
  };
  res.json({ message: "Development login successful", user: userData });
});
app.post("/api/auth/simple-logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});
app.post("/api/auth/dev-logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});
app.get("/api/users", simpleAdminAuth, (req, res) => res.json(users));
app.get("/api/players", simpleAuth, (req, res) => res.json(players));
app.get("/api/chores", simpleAuth, (req, res) => res.json(chores));
app.get("/api/events", simpleAuth, (req, res) => res.json(events));
app.get("/api/notifications", simpleAuth, (req, res) => res.json(notifications));
app.get("/api/messages", simpleAuth, (req, res) => res.json(messages));
app.get("/api/grocery-orders", simpleAuth, (req, res) => res.json(groceryOrders));
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, "public")));
  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "public", "index.html"));
  });
}
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});
var httpServer = createServer(app);
var port = process.env.PORT || 5e3;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`FC K\xF6ln Management System Production Server`);
  console.log(`Listening on port ${port}`);
  console.log(`Admin access: max.bisinger@warubi-sports.com / ITP2024`);
  console.log(`No database dependencies - ready for deployment`);
});
