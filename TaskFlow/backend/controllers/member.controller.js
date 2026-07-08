const memberModel = require("../models/member.model");
const notificationModel = require("../models/notification.model");
const projectModel = require("../models/project.model");
const ALLOWED_ROLES = ["owner", "admin", "member"];

async function checkPermission(projectId, userId) {

    const permission = await memberModel.getMemberRole(
        projectId,
        userId
    );

    if (permission.length === 0) {
        return null;
    }

    return permission[0].role;
}



//Invite Member to Project
exports.inviteMember = async (req, res) => {

    try {

        const { projectId } = req.params;

        const { email, role } = req.body;

        const allowedRoles = ["admin", "member"];

        if (!email || !role) {
            return res.status(400).json({
                success: false,
                message: "Email and role are required"
            });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        // Check current user's permission
        const permission = await memberModel.getMemberRole(
            projectId,
            req.user.id
        );

        if (
            permission.length === 0 ||
            (permission[0].role !== "owner" &&
             permission[0].role !== "admin")
        ) {
            return res.status(403).json({
                success: false,
                message: "Only owner or admin can invite members"
            });
        }

        // Find user by email
        const users = await memberModel.getUserByEmail(email);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No user found with this email"
            });
        }

        const user = users[0];

        // Prevent duplicate member
        const exists = await memberModel.memberExists(
            projectId,
            user.id
        );

        if (exists.length > 0) {
            return res.status(400).json({
                success: false,
                message: "User already belongs to this project"
            });
        }

        const result = await memberModel.inviteMember(
            projectId,
            user.id,
            role
        );

        // Get project details
const project = await projectModel.getProjectName(projectId);

// Create notification
await notificationModel.createNotification(
    user.id,
    project.id,
    null,
    `You have been added to the project "${project.name}".`
);

        res.status(201).json({
            success: true,
            message: `${user.username} added successfully`,
            memberId: result.insertId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

//Get Project Members
exports.getProjectMembers = async (req, res) => {

    try {

        const { projectId } = req.params;

        const members = await memberModel.getProjectMembers(projectId);

        res.status(200).json({
            success: true,
            count: members.length,
            members
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

//Change Member Role
exports.changeMemberRole = async (req, res) => {

    try {

        // 1. Get URL parameters
        const { projectId, userId } = req.params;

        // 2. Get request body
        const { role } = req.body;

        // 3. Validate role
        const allowedRoles = ["owner", "admin", "member"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        // 4. Prevent assigning owner role
        if (role === "owner") {
            return res.status(403).json({
                success: false,
                message: "Owner role cannot be assigned"
            });
        }

        // 5. Check current user's permission
        const permission = await memberModel.getMemberRole(
            projectId,
            req.user.id
        );

        if (permission.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const currentUserRole = permission[0].role;

        if (
            currentUserRole !== "owner" &&
            currentUserRole !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Only owner or admin can manage members"
            });
        }

        // 6. Check target member
        const member = await memberModel.getMemberRole(
            projectId,
            userId
        );

        if (member.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // 7. Prevent changing owner's role
        if (member[0].role === "owner") {
            return res.status(400).json({
                success: false,
                message: "Owner role cannot be changed"
            });
        }

        // 8. Update member role
        const result = await memberModel.changeMemberRole(
            projectId,
            userId,
            role
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // 9. Success response
        res.status(200).json({
            success: true,
            message: "Member role updated successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

//Remove Member from Project
exports.removeMember = async (req, res) => {

    try {

        // 1. Get URL parameters
        const { projectId, userId } = req.params;

        // 2. Check current user's permission
        const permission = await memberModel.getMemberRole(
            projectId,
            req.user.id
        );

        if (permission.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const currentUserRole = permission[0].role;

        // 3. Only owner or admin can remove members
        if (
            currentUserRole !== "owner" &&
            currentUserRole !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Only owner or admin can manage members"
            });
        }

        // 4. Check whether the member exists
        const member = await memberModel.getMemberRole(
            projectId,
            userId
        );

        if (member.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // 5. Prevent removing the owner
        if (member[0].role === "owner") {
            return res.status(400).json({
                success: false,
                message: "Project owner cannot be removed"
            });
        }

        // 6. Remove member
        const result = await memberModel.removeMember(
            projectId,
            userId
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // 7. Success response
        res.status(200).json({
            success: true,
            message: "Member removed successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};



