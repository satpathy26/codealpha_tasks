const db = require("../config/db");

// Create Comment
async function createComment(taskId, userId, comment) {

    const [result] = await db.query(
        `
        INSERT INTO comments(task_id, user_id, comment)
        VALUES(?,?,?)
        `,
        [taskId, userId, comment]
    );

    return result;

}

// Get All Comments of a Task
async function getTaskComments(taskId) {

    const [rows] = await db.query(
        `
        SELECT
            c.id,
            c.comment,
            c.created_at,
            c.updated_at,
            u.id AS user_id,
            u.username,
            u.email
        FROM comments c
        JOIN users u
            ON c.user_id = u.id
        WHERE c.task_id = ?
        ORDER BY c.created_at ASC
        `,
        [taskId]
    );

    return rows;

}

// Update Comment
async function updateComment(commentId, userId, comment) {

    const [result] = await db.query(
        `
        UPDATE comments
        SET comment = ?
        WHERE id = ?
        AND user_id = ?
        `,
        [comment, commentId, userId]
    );

    return result;

}

// Delete Comment
async function deleteComment(commentId, userId) {

    const [result] = await db.query(
        `
        DELETE FROM comments
        WHERE id = ?
        AND user_id = ?
        `,
        [commentId, userId]
    );

    return result;

}

module.exports = {
    createComment,
    getTaskComments,
    updateComment,
    deleteComment
};