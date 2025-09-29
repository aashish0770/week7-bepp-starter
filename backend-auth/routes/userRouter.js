const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");

const {
  loginUser,
  signupUser,
  getMe,
  updateMe,
  deleteMe,
} = require("../controllers/userControllers");

// login route
router.post("/login", loginUser);

// signup route
router.post("/signup", signupUser);

// get me route
router.get("/me", requireAuth, getMe);

// update me route
router.patch("/me", requireAuth, updateMe);

// delete me route
router.delete("/me", requireAuth, deleteMe);

module.exports = router;
