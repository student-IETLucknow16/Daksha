const AssessmentQuestion = require("../models/AssessmentQuestion");
const AssessmentAttempt = require("../models/AssessmentAttempt");
const TrainingAttempt = require("../models/TrainingAttempt");

const getAssessmentQuestions = async (req, res) => {
    try {
        const { moduleId } = req.params;

        const questions = await AssessmentQuestion.find({
            moduleId,
            isActive: true
        }).select(
            "questionId moduleId questionKey options safetyWeight"
        );

        res.json({
            success: true,
            count: questions.length,
            questions
        });
    } catch (error) {
        console.error(
            "Get assessment questions error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while fetching assessment"
        });
    }
};

const submitAssessment = async (req, res) => {
    try {
        const {
            moduleId,
            trainingAttemptId,
            answers
        } = req.body;

        // Basic validation
        if (
            !moduleId ||
            !trainingAttemptId ||
            !Array.isArray(answers)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "moduleId, trainingAttemptId and answers are required"
            });
        }

        // Find the training attempt
        const trainingAttempt =
            await TrainingAttempt.findById(trainingAttemptId);

        if (!trainingAttempt) {
            return res.status(404).json({
                success: false,
                message: "Training attempt not found"
            });
        }

        // Make sure this attempt belongs to the logged-in worker
        if (
            trainingAttempt.worker.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You cannot submit an assessment for this training attempt"
            });
        }

        // Make sure the module matches
        if (
            trainingAttempt.moduleId !== moduleId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Training attempt and assessment module do not match"
            });
        }

        // Assessment should only be submitted after scenario completion
        if (!trainingAttempt.completedAt) {
            return res.status(400).json({
                success: false,
                message:
                    "Complete the training scenario before submitting the assessment"
            });
        }

        // Prevent duplicate assessment submissions
        const existingAssessment =
            await AssessmentAttempt.findOne({
                worker: req.user._id,
                trainingAttempt: trainingAttemptId
            });

        if (existingAssessment) {
            return res.status(409).json({
                success: false,
                message:
                    "Assessment has already been submitted for this training attempt",
                assessment: {
                    id: existingAssessment._id,
                    moduleId: existingAssessment.moduleId,
                    quizScore: existingAssessment.quizScore,
                    passed: existingAssessment.passed
                }
            });
        }

        // Get active questions
        const questions =
            await AssessmentQuestion.find({
                moduleId,
                isActive: true
            });

        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No assessment questions found"
            });
        }

        let correctAnswers = 0;
        let totalWeight = 0;
        let earnedWeight = 0;

        const evaluatedAnswers = [];

        for (const question of questions) {
            totalWeight += question.safetyWeight;

            const submittedAnswer = answers.find(
                (answer) =>
                    answer.questionId === question.questionId
            );

            // No answer submitted
            if (!submittedAnswer) {
                evaluatedAnswers.push({
                    questionId: question.questionId,
                    selectedOptionIndex: -1,
                    correct: false
                });

                continue;
            }

            const selectedOptionIndex =
                submittedAnswer.selectedOptionIndex;

            // Validate option index
            if (
                !Number.isInteger(selectedOptionIndex) ||
                selectedOptionIndex < 0 ||
                selectedOptionIndex >= question.options.length
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Invalid option index for question ${question.questionId}`
                });
            }

            const isCorrect =
                selectedOptionIndex ===
                question.correctOptionIndex;

            if (isCorrect) {
                correctAnswers++;
                earnedWeight += question.safetyWeight;
            }

            evaluatedAnswers.push({
                questionId: question.questionId,
                selectedOptionIndex,
                correct: isCorrect
            });
        }

        // Calculate weighted quiz score
        const quizScore =
            totalWeight > 0
                ? Math.round(
                      (earnedWeight / totalWeight) * 100
                  )
                : 0;

        const passed = quizScore >= 70;

        // Save assessment attempt
        const assessmentAttempt =
            await AssessmentAttempt.create({
                worker: req.user._id,
                trainingAttempt: trainingAttemptId,
                moduleId,
                answers: evaluatedAnswers,
                quizScore,
                passed,
                completedAt: new Date()
            });

        return res.status(201).json({
            success: true,
            message: "Assessment submitted successfully",
            assessment: {
                id: assessmentAttempt._id,
                moduleId,
                totalQuestions: questions.length,
                correctAnswers,
                quizScore,
                passed
            }
        });

    } catch (error) {
        console.error(
            "Submit assessment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while submitting assessment"
        });
    }
};

module.exports = {
    getAssessmentQuestions,
    submitAssessment
};