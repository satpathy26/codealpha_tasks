const express = require("express");

const router = express.Router();

const { verifyToken } =
require("../middleware/auth.middleware");

const memberController =
require("../controllers/member.controller");

router.post(
    "/:projectId/members",
    verifyToken,
    memberController.inviteMember
);

router.get(
    "/:projectId/members",
    verifyToken,
    memberController.getProjectMembers
);

router.patch(
    "/:projectId/members/:userId",
    verifyToken,
    memberController.changeMemberRole
);

router.delete(
    "/:projectId/members/:userId",
    verifyToken,
    memberController.removeMember
);

module.exports = router;