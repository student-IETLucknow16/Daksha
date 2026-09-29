const express = require("express");

const {
    getAdminDashboard,
    getAdminWorkerDetails,
    getAdminWorkers,
    getAdminTraining,
    getAdminAssessments,
    getAdminCertifications,
    getAdminAnalytics
} = require("../controllers/adminController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/dashboard",
    protect,
    authorizeRoles("admin"),
    getAdminDashboard
);

router.get(
    "/workers",
    protect,
    authorizeRoles("admin"),
    getAdminWorkers
);

router.get(
    "/workers/:id",
    protect,
    authorizeRoles("admin"),
    getAdminWorkerDetails
);

router.get(
    "/training",
    protect,
    authorizeRoles("admin"),
    getAdminTraining
);

router.get(
    "/assessments",
    protect,
    authorizeRoles("admin"),
    getAdminAssessments
);

router.get(
    "/certifications",
    protect,
    authorizeRoles("admin"),
    getAdminCertifications
);

router.get(
    "/analytics",
    protect,
    authorizeRoles("admin"),
    getAdminAnalytics
);
module.exports = router;