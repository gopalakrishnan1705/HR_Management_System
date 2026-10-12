require("dotenv").config();

const app = require("./app");
const pool = require("./config/database");

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
    try {
        const connection = await pool.getConnection();

        await connection.ping();
        connection.release();

        console.log("MySQL connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        await pool.end();
        process.exit(1);
    }
}

startServer();