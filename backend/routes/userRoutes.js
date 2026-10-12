const express = require("express");

const {
    login,
    getProfile,
    createUser
} = require("../controllers/userController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);

router.get("/me", authenticate, getProfile);

router.post(
    "/",
    authenticate,
    authorize("admin"),
    createUser
);

module.exports = router;