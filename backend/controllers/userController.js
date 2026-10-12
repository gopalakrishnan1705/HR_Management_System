const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
        throw new Error("JWT_SECRET must contain at least 32 characters");
    }

    return secret;
};

// POST /api/users/login
exports.login = async (req, res) => {
    try {
        const email = typeof req.body.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";

        const password = typeof req.body.password === "string"
            ? req.body.password
            : "";

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await UserModel.findByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive. Contact HR."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            getJwtSecret(),
            { expiresIn: "8h" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to log in"
        });
    }
};

// GET /api/users/me
exports.getProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);

        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: "User account is unavailable"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch profile"
        });
    }
};

// POST /api/users — admin only
exports.createUser = async (req, res) => {
    try {
        const name = typeof req.body.name === "string"
            ? req.body.name.trim()
            : "";

        const email = typeof req.body.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";

        const password = typeof req.body.password === "string"
            ? req.body.password
            : "";

        const role = req.body.role;

        if (
            !name ||
            name.length > 100 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            email.length > 150 ||
            password.length < 8 ||
            password.length > 72 ||
            !["admin", "hr", "employee"].includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide valid user details and password"
            });
        }

        const existingUser = await UserModel.findByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const userId = await UserModel.create({
            name,
            email,
            passwordHash,
            role
        });

        const user = await UserModel.findById(userId);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });
    } catch (error) {
        console.error("Create user error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create user"
        });
    }
};