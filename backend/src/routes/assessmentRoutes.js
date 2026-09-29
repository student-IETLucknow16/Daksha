const express = require("express");

const {
    protect
} = require("../middleware/authMiddleware");

const {
    getAssessmentQuestions,
    submitAssessment
} = require("../controllers/assessmentController");

const router = express.Router();

router.get(
    "/:moduleId/questions",
    protect,
    getAssessmentQuestions
);

router.post(
    "/submit",
    protect,
    submitAssessment
);

module.exports = router;