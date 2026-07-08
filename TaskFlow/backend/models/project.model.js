const db = require("../config/db");

// Create Project
async function createProject(name, description, ownerId) {

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        const [project] = await connection.query(
            `
            INSERT INTO projects
            (
                name,
                description,
                owner_id
            )
            VALUES (?, ?, ?)
            `,
            [name, description, ownerId]
        );

        await connection.query(
            `
            INSERT INTO project_members
            (
                project_id,
                user_id,
                role
            )
            VALUES (?, ?, ?)
            `,
            [project.insertId, ownerId, "owner"]
        );

        await connection.commit();

        return project;

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }

}


// Get All Projects of Logged-in User
async function getMyProjects(userId) {

    const [rows] = await db.query(
        `
        SELECT
            p.id,
            p.name,
            p.description,
            p.created_at,
            pm.role
        FROM projects p
        JOIN project_members pm
            ON p.id = pm.project_id
        WHERE pm.user_id = ?
        ORDER BY p.created_at DESC
        `,
        [userId]
    );

    return rows;

}


// Get Single Project (Permission Check)
async function getProjectById(projectId, userId) {

    const [rows] = await db.query(
        `
        SELECT
            p.*
        FROM projects p
        JOIN project_members pm
            ON p.id = pm.project_id
        WHERE
            p.id = ?
            AND pm.user_id = ?
        `,
        [projectId, userId]
    );

    return rows;

}


// Get Project Name Only (For Notifications)
async function getProjectName(projectId) {

    const [rows] = await db.query(
        `
        SELECT
            id,
            name
        FROM projects
        WHERE id = ?
        `,
        [projectId]
    );

    return rows[0];

}


// Update Project
async function updateProject(id, name, description, userId) {

    const [result] = await db.query(
        `
        UPDATE projects
        SET
            name = ?,
            description = ?
        WHERE
            id = ?
            AND owner_id = ?
        `,
        [name, description, id, userId]
    );

    return result;

}


// Delete Project
async function deleteProject(id, userId) {

    const [result] = await db.query(
        `
        DELETE FROM projects
        WHERE
            id = ?
            AND owner_id = ?
        `,
        [id, userId]
    );

    return result;

}


module.exports = {
    createProject,
    getMyProjects,
    getProjectById,
    getProjectName,
    updateProject,
    deleteProject
};