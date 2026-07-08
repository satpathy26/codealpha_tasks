const db = require("../config/db");


//Invite a member to a project
async function inviteMember(projectId, userId, role = "member") {

    const [result] = await db.query(
        `
        INSERT INTO project_members
        (
            project_id,
            user_id,
            role
        )
        VALUES (?, ?, ?)
        `,
        [
            projectId,
            userId,
            role
        ]
    );

    return result;
}


//Get Project Members
async function getProjectMembers(projectId) {

    const [rows] = await db.query(
        `
        SELECT
            pm.project_id,
            pm.user_id,
            pm.role,
            u.username,
            u.email
        FROM project_members pm
        JOIN users u
            ON pm.user_id = u.id
        WHERE pm.project_id = ?
        ORDER BY pm.role DESC, u.username ASC
        `,
        [projectId]
    );

    return rows;
}
//Change Member Role
async function changeMemberRole(
    projectId,
    userId,
    role
) {

    

    const [result] = await db.query(
        `
        UPDATE project_members
        SET role = ?
        WHERE project_id = ?
        AND user_id = ?
        `,
        [
            role,
            projectId,
            userId
        ]
    );
    

    return result;
}

//Remove Member from Project
async function removeMember(
    projectId,
    userId
) {

    const [result] = await db.query(
        `
        DELETE FROM project_members
        WHERE project_id = ?
        AND user_id = ?
        `,
        [
            projectId,
            userId
        ]
    );

    return result;
}

async function getMemberRole(projectId, userId) {

    const [rows] = await db.query(
        `
        SELECT role
        FROM project_members
        WHERE project_id = ?
        AND user_id = ?
        `,
        [projectId, userId]
    );

    return rows;
}

//Check if a user is a member of a project
async function memberExists(projectId, userId) {

    const [rows] = await db.query(
        `
        SELECT id
        FROM project_members
        WHERE project_id = ?
        AND user_id = ?
        `,
        [projectId, userId]
    );

    return rows;
}
//Check if a user exists
async function userExists(userId) {

    const [rows] = await db.query(
        `
        SELECT id
        FROM users
        WHERE id = ?
        `,
        [userId]
    );

    return rows;
}

//Get user by email
async function getUserByEmail(email) {

    const [rows] = await db.query(
        `
        SELECT id, username, email
        FROM users
        WHERE email = ?
        `,
        [email]
    );

    return rows;
}


module.exports = {
    inviteMember,
    getProjectMembers,
    changeMemberRole,
    removeMember,
    getMemberRole,
    memberExists,
    userExists,
    getUserByEmail
    
};