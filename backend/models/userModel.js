const pool = require("../config/database");

const UserModel = {
    async findByEmail(email) {
        const [rows] = await pool.execute(
            `SELECT id, name, email, password, role, is_active, created_at
             FROM users
             WHERE email = ?
             LIMIT 1`,
            [email]
        );

        return rows[0] || null;
    },

    async findById(id) {
        const [rows] = await pool.execute(
            `SELECT id, name, email, role, is_active, created_at
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [id]
        );

        return rows[0] || null;
    },

    async create({ name, email, passwordHash, role }) {
        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password, role)
             VALUES (?, ?, ?, ?)`,
            [name, email, passwordHash, role]
        );

        return result.insertId;
    }
};

module.exports = UserModel;