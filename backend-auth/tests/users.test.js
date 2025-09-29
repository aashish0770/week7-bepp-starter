const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/userModel");

const users = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "R3g5T7#gh",
    phone_number: "09-123-47890",
    date_of_birth: "1999-01-01",
    membership_status: "Active",
  },
  {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "R3g5T7#gh",
    phone_number: "09-123-47890",
    date_of_birth: "1999-01-01",
    membership_status: "Active",
  },
];

let token = null;

beforeAll(async () => {
  await User.deleteMany({});
  await api.post("/api/users/signup").send({
    name: "John Doe",
    email: "john@example.com",
    password: "R3g5T7#gh",
    phone_number: "09-123-47890",
    date_of_birth: "1999-01-01",
    membership_status: "Active",
  }); // create one user
});

describe("User Routes", () => {
  describe("POST /api/users/signup", () => {
    it("should signup a new user with valid credentials", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "R3g5T7#gh",
        phone_number: "09-123-47890",
        date_of_birth: "1999-01-01",
        membership_status: "Active",
      };

      const result = await api.post("/api/users/signup").send(userData);

      expect(result.status).toBe(201);
      expect(result.body).toHaveProperty("token");
      expect(result.body).toHaveProperty("user");
    });

    it("should not allow signup with duplicate email", async () => {
      const result = await api.post("/api/users/signup").send(users[0]);
      expect(result.status).toBe(400);
      expect(result.body).toHaveProperty("error");
    });

    it("should return validation error for missing fields", async () => {
      const invalidUser = {
        email: "invalid@example.com",
        password: "short",
      };
      const result = await api.post("/api/users/signup").send(invalidUser);

      expect(result.status).toBe(400);
      expect(result.body).toHaveProperty("error");
    });
  });

  describe("POST /api/users/login", () => {
    it("should login a user with valid credentials", async () => {
      const userData = {
        email: "test@example.com",
        password: "R3g5T7#gh",
      };

      const result = await api.post("/api/users/login").send(userData);

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty("token");
      token = result.body.token;
    });

    it("should return error with invalid password", async () => {
      const userData = {
        email: "test@example.com",
        password: "wrongpass",
      };

      const result = await api.post("/api/users/login").send(userData);

      expect(result.status).toBe(400);
      expect(result.body).toHaveProperty("error");
    });

    it("should return error if user does not exist", async () => {
      const result = await api.post("/api/users/login").send({
        email: "notfound@example.com",
        password: "password123",
      });

      expect(result.status).toBe(400);
      expect(result.body).toHaveProperty("error");
    });
  });

  describe("GET /api/users/me", () => {
    it("should return user profile when authenticated", async () => {
      const result = await api
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`);

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty("email", "test@example.com");
    });

    it("should return unauthorized without token", async () => {
      const result = await api.get("/api/users/me");
      expect(result.status).toBe(404);
    });
  });

  describe("PATCH /api/users/me", () => {
    it("should update user profile", async () => {
      const result = await api
        .patch("/api/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated User" });

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty("name", "Updated User");
    });
  });

  describe("DELETE /api/users/me", () => {
    it("should delete authenticated user", async () => {
      const result = await api
        .delete("/api/users/me")
        .set("Authorization", `Bearer ${token}`);

      expect(result.status).toBe(204);
    });

    it("should not allow deletion without auth", async () => {
      const result = await api.delete("/api/users/me");
      expect(result.status).toBe(404);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
