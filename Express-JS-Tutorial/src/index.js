import express from "express";
import { check, validationResult, checkSchema } from "express-validator";
import { createUserValidationSchema } from "../utils/validationSchemas.js";

const app = express();
const PORT = process.env.PORT || 3000;

// --- MOCK DATA ---
let mockUsers = [
  { id: 1, username: "anson", displayName: "Anson" },
  { id: 2, username: "jack", displayName: "Jack" },
  { id: 3, username: "adam", displayName: "Adam" },
  { id: 4, username: "tina", displayName: "Tina" },
  { id: 5, username: "jason", displayName: "Jason" },
  { id: 6, username: "henry", displayName: "Henry" },
  { id: 7, username: "marilyn", displayName: "Marilyn" },
];

const mockProducts = [{ id: 123, name: "Chicken Breast", price: 12.99 }];

// --- MIDDLEWARE ---
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  console.log("Finished Logging...");
  next();
});

// Resolve user index by ID middleware
const resolveIndexByUserId = (req, res, next) => {
  const id = parseInt(req.params.id);
  const index = mockUsers.findIndex((user) => user.id === id);
  if (index === -1) {
    return res.status(404).send({ error: "User not found" });
  }
  req.userIndex = index;
  next();
};

// --- BASE ROUTE ---
app.get("/api", (req, res) => {
  res.status(200).send({ msg: "Hello" });
});

// --- USERS ---

// GET all users or filtered by query
app.get(
  "/api/users",
  [
    check("filter")
      .optional()
      .isString()
      .isLength({ min: 3, max: 10 })
      .withMessage("Filter must be 3-10 characters long."),
    check("value").optional().isString().withMessage("Value must be a string."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ error: errors.array() });
    }

    const { filter, value } = req.query;

    if (filter && value) {
      const filtered = mockUsers.filter(
        (user) => user[filter]?.toLowerCase() === value.toLowerCase()
      );
      return res.status(200).send(filtered);
    }

    res.status(200).send(mockUsers);
  }
);

// GET user by ID
app.get("/api/users/:id", resolveIndexByUserId, (req, res) => {
  const user = mockUsers[req.userIndex];
  res.status(200).send(user);
});

// POST create new user
app.post("/api/users", checkSchema(createUserValidationSchema), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ error: errors.array() });
  }

  const { username, displayName } = req.body;

  const newUser = {
    id: mockUsers[mockUsers.length - 1]?.id + 1 || 1,
    username,
    displayName,
  };

  mockUsers.push(newUser);
  res.status(201).send(newUser);
});

// PUT update user
app.put("/api/users/:id", resolveIndexByUserId, (req, res) => {
  const id = parseInt(req.params.id);
  mockUsers[req.userIndex] = { id, ...req.body };
  res.status(200).send(mockUsers[req.userIndex]);
});

// PATCH partial update
app.patch("/api/users/:id", resolveIndexByUserId, (req, res) => {
  mockUsers[req.userIndex] = {
    ...mockUsers[req.userIndex],
    ...req.body,
  };
  res.status(200).send(mockUsers[req.userIndex]);
});

// DELETE user
app.delete("/api/users/:id", resolveIndexByUserId, (req, res) => {
  mockUsers.splice(req.userIndex, 1);
  res.status(200).send({ message: "User deleted" });
});

// --- PRODUCTS ---

// GET all products
app.get("/api/products", (req, res) => {
  res.status(200).send(mockProducts);
});

// --- FALLBACK & ERROR HANDLING ---

// Fallback 404 route
app.use((req, res) => {
  res.status(404).send({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).send({ error: "Internal Server Error" });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
