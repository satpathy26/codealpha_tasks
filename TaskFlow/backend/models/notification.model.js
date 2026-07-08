const db = require("../config/db");

exports.createNotification = async (
    userId,
    projectId,
    taskId,
    message
) => {

    const [result] = await db.query(
        `
        INSERT INTO notifications
        (
            user_id,
            project_id,
            task_id,
            message
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            userId,
            projectId,
            taskId,
            message
        ]
    );

    return result;
};

exports.getNotifications = async (userId) => {

    const [rows] = await db.query(
        `
        SELECT *
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return rows;
};

exports.markAsRead = async (id) => {

    const [result] = await db.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = ?
        `,
        [id]
    );

    return result;
};

exports.deleteNotification = async (id) => {

    const [result] = await db.query(
        `
        DELETE FROM notifications
        WHERE id = ?
        `,
        [id]
    );

    return result;
};