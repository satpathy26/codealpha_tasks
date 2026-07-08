const db = require("../config/db");

async function createTask(
    projectId,
    title,
    description,
    priority,
    createdBy,
    assignedTo = null,
    dueDate = null
) {

    const [result] = await db.query(
        `
        INSERT INTO tasks
        (
            project_id,
            title,
            description,
            assigned_to,
            created_by,
            priority,
            due_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            projectId,
            title,
            description,
            assignedTo,
            createdBy,
            priority || "Medium",
            dueDate
        ]
    );

    return result;
}
//Get All Tasks of a Project.
async function getTasksByProject(projectId) {

    const [rows] = await db.query(
        `
        SELECT
            t.id,
            t.project_id,
            t.title,
            t.description,
            t.priority,
            t.status,
            t.assigned_to,
            t.created_by,
            t.due_date,
            t.created_at,
            u.username AS assigned_user
        FROM tasks t
        LEFT JOIN users u
            ON t.assigned_to = u.id
        WHERE t.project_id = ?
        ORDER BY t.created_at DESC
        `,
        [projectId]
    );

    return rows;
}

//Get task by ID
async function getTaskById(taskId) {

    const [rows] = await db.query(
        `
        SELECT
            t.id,
            t.project_id,
            t.title,
            t.description,
            t.priority,
            t.status,
            t.assigned_to,
            t.created_by,
            t.due_date,
            t.created_at,
            t.updated_at,
            u.username AS assigned_user
        FROM tasks t
        LEFT JOIN users u
            ON t.assigned_to = u.id
        WHERE t.id = ?
        `,
        [taskId]
    );

    return rows;
}

// Update Task
async function updateTask(
    taskId,
    title,
    description,
    priority,
    assignedTo,
    dueDate
) {

    const formattedDueDate = dueDate || null;

    const [result] = await db.query(
        `
        UPDATE tasks
        SET
            title = ?,
            description = ?,
            priority = ?,
            assigned_to = ?,
            due_date = ?
        WHERE id = ?
        `,
        [
            title,
            description,
            priority,
            assignedTo,
            formattedDueDate,
            taskId
        ]
    );

    return result;
}

//Delete Task
async function deleteTask(taskId) {

    const [result] = await db.query(
        `
        DELETE FROM tasks
        WHERE id = ?
        `,
        [taskId]
    );

    return result;
}

//Assign Task
async function assignTask(taskId, assignedTo) {

    const [result] = await db.query(
        `
        UPDATE tasks
        SET assigned_to = ?
        WHERE id = ?
        `,
        [assignedTo, taskId]
    );

    return result;
}
//Update Task Status
async function updateTaskStatus(taskId, status) {

    const [result] = await db.query(
        `
        UPDATE tasks
        SET status = ?
        WHERE id = ?
        `,
        [status, taskId]
    );

    return result;
}

//Update Priority
async function updatePriority(taskId, priority) {

    const [result] = await db.query(
        `
        UPDATE tasks
        SET priority = ?
        WHERE id = ?
        `,
        [priority, taskId]
    );

    return result;
}

module.exports = {
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask,
    assignTask,
    updateTaskStatus,
    updatePriority
};