const db = require("../config/db");

async function findUserByEmail(email) {
    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );
    return rows;
}

async function createUser(username, email, password) {
    const [result] = await db.query(
        `INSERT INTO users (username, email, password)
         VALUES (?, ?, ?)`,
        [username, email, password]
    );

    return result;
}

module.exports = {
    findUserByEmail,
    createUser
};