const projectModel = require("../models/project.model");

exports.createProject = async (req, res) => {

    try {

        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Project name is required"
            });
        }

        const ownerId = req.user.id;

        const result = await projectModel.createProject(
            name,
            description,
            ownerId
        );

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            projectId: result.insertId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

exports.getMyProjects = async (req, res) => {

    try {

        const projects = await projectModel.getMyProjects(req.user.id);

        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

exports.getProject = async (req, res) => {

    try {

        const project = await projectModel.getProjectById(
            req.params.id,
            req.user.id
        );

        if (project.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.json({
            success: true,
            project: project[0]
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

exports.updateProject = async (req, res) => {

    try {

        const { name, description } = req.body;

        const result = await projectModel.updateProject(
            req.params.id,
            name,
            description,
            req.user.id
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this project"
            });
        }

        res.json({
            success: true,
            message: "Project updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};
exports.deleteProject = async (req, res) => {

    try {

        const result = await projectModel.deleteProject(
            req.params.id,
            req.user.id
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({
                success: false,
                message: "You cannot delete this project"
            });
        }

        res.json({
            success: true,
            message: "Project deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};