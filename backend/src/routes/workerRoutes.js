const express = require("express");

const {
    getWorkerDashboard,
    getWorkerProfile,
    getWorkerProgress,
    getWorkerCertificates,
    getWorkerTrainingHistory,
    getWorkerAssessmentHistory
} = require("../controllers/workerController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/dashboard",
    protect,
    authorizeRoles("worker"),
    getWorkerDashboard
);

router.get(
    "/profile",
    protect,
    authorizeRoles("worker"),
    getWorkerProfile
);

router.get(
    "/progress",
    protect,
    authorizeRoles("worker"),
    getWorkerProgress
);

router.get(
    "/certificates",
    protect,
    authorizeRoles("worker"),
    getWorkerCertificates
);

router.get(
    "/training-history",
    protect,
    authorizeRoles("worker"),
    getWorkerTrainingHistory
);

router.get(
    "/assessment-history",
    protect,
    authorizeRoles("worker"),
    getWorkerAssessmentHistory
);

module.exports = router;