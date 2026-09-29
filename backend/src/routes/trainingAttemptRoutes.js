const express = require("express");

const {
    protect
} = require("../middleware/authMiddleware");

const {
    startTrainingAttempt,
    completeTrainingAttempt
} = require("../controllers/trainingAttemptController");

const router = express.Router();

router.post(
    "/start",
    protect,
    startTrainingAttempt
);

router.patch(
    "/:attemptId/complete",
    protect,
    completeTrainingAttempt
);

module.exports = router;