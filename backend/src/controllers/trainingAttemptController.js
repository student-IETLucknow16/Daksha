const TrainingModule = require("../models/TrainingModule");
const TrainingAttempt = require("../models/TrainingAttempt");

const startTrainingAttempt = async (req, res) => {
    try {
        const { moduleId } = req.body;

        if (!moduleId) {
            return res.status(400).json({
                success: false,
                message: "moduleId is required"
            });
        }

        const module = await TrainingModule.findOne({
            moduleId,
            isActive: true
        });

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Training module not found"
            });
        }

        const attempt = await TrainingAttempt.create({
            worker: req.user._id,
            moduleId: module.moduleId,
            moduleVersion: module.version
        });

        res.status(201).json({
            success: true,
            message: "Training attempt started",
            attempt: {
                id: attempt._id,
                moduleId: attempt.moduleId,
                moduleVersion: attempt.moduleVersion,
                startedAt: attempt.startedAt,
                result: attempt.result
            }
        });
    } catch (error) {
        console.error("Start training attempt error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while starting training attempt"
        });
    }
};

const completeTrainingAttempt = async (req, res) => {
    try {
        const { attemptId } = req.params;

        const {
            scenarioScore,
            result,
            mistakes
        } = req.body;

        if (scenarioScore === undefined || !result) {
            return res.status(400).json({
                success: false,
                message: "scenarioScore and result are required"
            });
        }

        if (scenarioScore < 0 || scenarioScore > 100) {
            return res.status(400).json({
                success: false,
                message: "scenarioScore must be between 0 and 100"
            });
        }

        const validResults = [
            "passed",
            "failed",
            "failed_critical",
            "failed_timeout"
        ];

        if (!validResults.includes(result)) {
            return res.status(400).json({
                success: false,
                message: "Invalid training result"
            });
        }

        const attempt = await TrainingAttempt.findById(
            attemptId
        );

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Training attempt not found"
            });
        }

        // Make sure a worker can only complete their own attempt.
        if (attempt.worker.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You cannot update this training attempt"
            });
        }

        if (attempt.result !== "in_progress") {
            return res.status(400).json({
                success: false,
                message: "This training attempt is already completed"
            });
        }

        attempt.scenarioScore = scenarioScore;
        attempt.result = result;
        attempt.passed = result === "passed";
        attempt.completedAt = new Date();

        if (Array.isArray(mistakes)) {
            attempt.mistakes = mistakes;
        }

        await attempt.save();

        res.json({
            success: true,
            message: "Training attempt completed",
            attempt: {
                id: attempt._id,
                moduleId: attempt.moduleId,
                scenarioScore: attempt.scenarioScore,
                passed: attempt.passed,
                result: attempt.result,
                mistakes: attempt.mistakes,
                startedAt: attempt.startedAt,
                completedAt: attempt.completedAt
            }
        });
    } catch (error) {
        console.error(
            "Complete training attempt error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while completing training attempt"
        });
    }
};

module.exports = {
    startTrainingAttempt,
    completeTrainingAttempt
};