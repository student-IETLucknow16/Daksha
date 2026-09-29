const express = require("express");

const {
    getSiteOfficerDashboard,
    getSiteOfficerWorkers,
    getSiteOfficerWorkerDetails,
    getSiteOfficerTraining,
    getSiteOfficerAssessments,
    getSiteOfficerCertifications,
    getSiteOfficerAnalytics
} = require("../controllers/siteOfficerController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/dashboard",
    protect,
    authorizeRoles("site_officer"),
    getSiteOfficerDashboard
);
router.get(
    "/workers",
    protect,
    authorizeRoles("site_officer"),
    getSiteOfficerWorkers
);

router.get(
    "/workers/:id",
    protect,
    authorizeRoles("site_officer"),
    getSiteOfficerWorkerDetails
);

router.get(
    "/training",
    protect,
    authorizeRoles("site_officer"),
    getSiteOfficerTraining
);

router.get(
    "/assessments",
    protect,
    authorizeRoles("site_officer"),
    getSiteOfficerAssessments
);

router.get(
    "/certifications",
    protect,
    authorizeRoles("site_officer"),
    getSiteOfficerCertifications
);

router.get(
    "/analytics",
    protect,
    authorizeRoles("site_officer"),
    getSiteOfficerAnalytics
);

module.exports = router;